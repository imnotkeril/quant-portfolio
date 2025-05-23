/**
 * CandlestickChart Component
 * Financial candlestick chart with volume display
 */
import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { COLORS } from '../../../constants/colors';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import styles from './CandlestickChart.module.css';

export interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  showVolume?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  height?: number;
  showGrid?: boolean;
  className?: string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  'data-testid'?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  showVolume = true,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  height = 400,
  showGrid = true,
  className,
  margin = { top: 10, right: 30, bottom: 30, left: 30 },
  loading = false,
  empty = false,
  emptyText = 'No data available',
  'data-testid': testId,
}) => {
  // Transform data for Recharts (since it doesn't have a native Candlestick component)
  const transformedData = data.map((item) => {
    const isUp = item.close >= item.open;
    const bodyHeight = Math.abs(item.close - item.open);
    const bodyLow = Math.min(item.open, item.close);
    const bodyHigh = Math.max(item.open, item.close);

    return {
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      // For rendering wicks (high-low line)
      wickLow: item.low,
      wickHigh: item.high,
      // For rendering body (open-close rectangle)
      bodyLow,
      bodyHeight,
      bodyHigh,
      // Color based on direction
      color: isUp ? COLORS.CHART_UP : COLORS.CHART_DOWN,
      isUp,
      // For volume
      volume: item.volume || 0,
      volumeColor: isUp ? COLORS.CHART_UP : COLORS.CHART_DOWN,
    };
  });

  const formatX = xAxisFormatter || ((value) => formatDate(value, 'short'));
  const formatY = yAxisFormatter || ((value) => formatCurrency(value));

  const formatTooltip = tooltipFormatter || ((value, name) => {
    if (name === 'volume') {
      return [`${(value / 1000000).toFixed(2)}M`, 'Volume'];
    }
    return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)];
  });

  // Find min and max prices for Y-axis domain
  const priceMin = Math.min(...data.map(d => d.low));
  const priceMax = Math.max(...data.map(d => d.high));
  const pricePadding = (priceMax - priceMin) * 0.05;

  // Find max volume for volume Y-axis domain
  const volumeMax = showVolume ? Math.max(...data.map(d => d.volume || 0)) : 0;

  const containerClasses = `${styles.container} ${className || ''}`;

  if (loading) {
    return (
      <div className={containerClasses} style={{ height }} data-testid={testId}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading chart...</span>
        </div>
      </div>
    );
  }

  if (empty || !data.length) {
    return (
      <div className={containerClasses} style={{ height }} data-testid={testId}>
        <div className={styles.empty}>
          <span>{emptyText}</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{formatX(label)}</p>
          <div className={styles.tooltipContent}>
            <p><span className={styles.tooltipKey}>Open:</span> {formatCurrency(data.open)}</p>
            <p><span className={styles.tooltipKey}>High:</span> {formatCurrency(data.high)}</p>
            <p><span className={styles.tooltipKey}>Low:</span> {formatCurrency(data.low)}</p>
            <p><span className={styles.tooltipKey}>Close:</span> {formatCurrency(data.close)}</p>
            {showVolume && data.volume && (
              <p><span className={styles.tooltipKey}>Volume:</span> {(data.volume / 1000000).toFixed(2)}M</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={containerClasses} style={{ height }} data-testid={testId}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={transformedData}
          margin={margin}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.DIVIDER}
              vertical={false}
            />
          )}

          <XAxis
            dataKey="date"
            tick={{
              fill: COLORS.TEXT_LIGHT,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif'
            }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatX}
          />

          <YAxis
            domain={[priceMin - pricePadding, priceMax + pricePadding]}
            tick={{
              fill: COLORS.TEXT_LIGHT,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif'
            }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatY}
          />

          {showVolume && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={[0, volumeMax * 1.1]}
              tick={{
                fill: COLORS.TEXT_LIGHT,
                fontSize: 12,
                fontFamily: 'Inter, sans-serif'
              }}
              axisLine={{ stroke: COLORS.DIVIDER }}
              tickLine={{ stroke: COLORS.DIVIDER }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
          )}

          <Tooltip content={<CustomTooltip />} />

          {/* High-Low wicks */}
          <Bar dataKey="wickHigh" fill="transparent" strokeWidth={1}>
            {transformedData.map((entry, index) => (
              <Cell key={`wick-${index}`} stroke={entry.color} />
            ))}
          </Bar>

          {/* Candle bodies */}
          <Bar dataKey="bodyHeight" stackId="candle">
            {transformedData.map((entry, index) => (
              <Cell key={`body-${index}`} fill={entry.color} stroke={entry.color} />
            ))}
          </Bar>

          {/* Volume bars */}
          {showVolume && (
            <Bar
              dataKey="volume"
              yAxisId="volume"
              opacity={0.3}
            >
              {transformedData.map((entry, index) => (
                <Cell key={`volume-${index}`} fill={entry.volumeColor} />
              ))}
            </Bar>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;