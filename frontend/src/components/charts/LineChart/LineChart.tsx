/**
 * LineChart Component
 * Customizable line chart for financial data visualization
 */
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from '../../../constants/colors';
import { formatCurrency, formatPercentage, formatDate } from '../../../utils/formatters';
import styles from './LineChart.module.css';

export interface LineChartDataPoint {
  name: string;
  date?: string;
  [key: string]: number | string | undefined;
}

export interface LineChartSeries {
  key: string;
  name: string;
  color?: string;
  type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  strokeWidth?: number;
  dot?: boolean | object;
  strokeDasharray?: string;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  series: LineChartSeries[];
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  yAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
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

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  yAxisDomain = ['auto', 'auto'],
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
  margin = { top: 10, right: 30, bottom: 30, left: 30 },
  loading = false,
  empty = false,
  emptyText = 'No data available',
  'data-testid': testId,
}) => {
  const formatX = xAxisFormatter || ((value) => {
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return formatDate(value, 'short');
    }
    return String(value);
  });

  const formatY = yAxisFormatter || ((value) => {
    if (typeof value === 'number') {
      if (value < 1 && value > -1) {
        return formatPercentage(value);
      }
      return formatCurrency(value);
    }
    return String(value);
  });

  const formatTooltip = tooltipFormatter || ((value, name) => {
    if (typeof value === 'number') {
      if (value < 1 && value > -1) {
        return [formatPercentage(value), name];
      }
      return [formatCurrency(value), name];
    }
    return [String(value), name];
  });

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

  return (
    <div className={containerClasses} style={{ height }} data-testid={testId}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
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
            dataKey="name"
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
            domain={yAxisDomain}
            tick={{
              fill: COLORS.TEXT_LIGHT,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif'
            }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatY}
          />

          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: COLORS.BACKGROUND,
              borderColor: COLORS.DIVIDER,
              borderRadius: '8px',
              color: COLORS.TEXT_LIGHT,
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }}
            labelStyle={{
              color: COLORS.TEXT_LIGHT,
            }}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: 10,
                color: COLORS.TEXT_LIGHT,
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          )}

          {series.map((s, index) => (
            <Line
              key={s.key}
              type={s.type || 'monotone'}
              dataKey={s.key}
              name={s.name}
              stroke={s.color || COLORS.ACCENT}
              strokeWidth={s.strokeWidth || 2}
              dot={s.dot === undefined ? false : s.dot}
              strokeDasharray={s.strokeDasharray}
              activeDot={{
                r: 6,
                fill: s.color || COLORS.ACCENT,
                stroke: COLORS.BACKGROUND,
                strokeWidth: 2
              }}
              connectNulls={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;