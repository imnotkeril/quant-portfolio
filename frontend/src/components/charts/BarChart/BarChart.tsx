/**
 * BarChart Component
 * Customizable bar chart for categorical data visualization
 */
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { COLORS } from '../../../constants/colors';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './BarChart.module.css';

export interface BarChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export interface BarChartSeries {
  key: string;
  name: string;
  color?: string;
  stackId?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  series: BarChartSeries[];
  layout?: 'horizontal' | 'vertical';
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  layout = 'vertical',
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
  const formatX = xAxisFormatter || ((value) => String(value));
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
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={margin}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.DIVIDER}
              vertical={layout === 'horizontal'}
              horizontal={layout === 'vertical'}
            />
          )}

          <XAxis
            type={layout === 'horizontal' ? 'number' : 'category'}
            dataKey={layout === 'horizontal' ? undefined : 'name'}
            domain={layout === 'horizontal' ? yAxisDomain : undefined}
            tick={{
              fill: COLORS.TEXT_LIGHT,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif'
            }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={layout === 'horizontal' ? formatY : formatX}
          />

          <YAxis
            type={layout === 'horizontal' ? 'category' : 'number'}
            dataKey={layout === 'horizontal' ? 'name' : undefined}
            domain={layout === 'horizontal' ? undefined : yAxisDomain}
            tick={{
              fill: COLORS.TEXT_LIGHT,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif'
            }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={layout === 'horizontal' ? formatX : formatY}
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
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color || getChartColor(index)}
              stackId={s.stackId}
              radius={[2, 2, 2, 2]}
            >
              {!s.stackId && data.map((entry, dataIndex) => {
                const value = entry[s.key] as number;
                const color = value >= 0 ? (s.color || COLORS.POSITIVE) : COLORS.NEGATIVE;
                return <Cell key={`cell-${dataIndex}`} fill={color} />;
              })}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;