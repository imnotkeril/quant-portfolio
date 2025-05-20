import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { COLORS } from '../../../constants/colors';

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
  showLegend?: boolean;
  className?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  showVolume = true,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  height = 400,
  showGrid = true,
  showLegend = false,
  className,
}) => {
  // Transform data for Recharts (since it doesn't have a native Candlestick component)
  const transformedData = data.map((item) => {
    const isUp = item.close >= item.open;

    return {
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      // For rendering candles
      highLowLine: [item.low, item.high],
      openCloseLine: [item.open, item.close],
      color: isUp ? COLORS.CHART_UP : COLORS.CHART_DOWN,
      // For volume
      volume: item.volume || 0,
      volumeColor: isUp ? COLORS.CHART_UP : COLORS.CHART_DOWN,
    };
  });

  const formatX = xAxisFormatter || ((value) => String(value));
  const formatY = yAxisFormatter || ((value) => String(value));

  // Find min and max prices for Y-axis domain
  const priceMin = Math.min(...data.map(d => d.low));
  const priceMax = Math.max(...data.map(d => d.high));
  const pricePadding = (priceMax - priceMin) * 0.05;

  // Find max volume for volume Y-axis domain
  const volumeMax = showVolume ? Math.max(...data.map(d => d.volume || 0)) : 0;

  return (
    <div style={{ height, width: '100%' }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={transformedData}
          margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
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
            tick={{ fill: COLORS.TEXT_LIGHT }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatX}
          />

          <YAxis
            domain={[priceMin - pricePadding, priceMax + pricePadding]}
            tick={{ fill: COLORS.TEXT_LIGHT }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatY}
          />

          {showVolume && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={[0, volumeMax * 1.1]}
              tick={{ fill: COLORS.TEXT_LIGHT }}
              axisLine={{ stroke: COLORS.DIVIDER }}
              tickLine={{ stroke: COLORS.DIVIDER }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
          )}

          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: COLORS.BACKGROUND,
              borderColor: COLORS.DIVIDER,
              color: COLORS.TEXT_LIGHT,
            }}
          />

          {showLegend && <Legend />}

          {/* High-Low line (wick) */}
          <Bar
            dataKey="highLowLine"
            fill="transparent"
            stroke={(data) => data.color}
            barSize={1}
          />

          {/* Open-Close bar (body) */}
          <Bar
            dataKey="openCloseLine"
            fill={(data) => data.color}
            stroke={(data) => data.color}
            barSize={8}
          />

          {showVolume && (
            <Bar
              dataKey="volume"
              yAxisId="volume"
              fill={(data) => data.volumeColor}
              opacity={0.5}
              barSize={3}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;