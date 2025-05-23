/**
 * PieChart Component
 * Customizable pie chart for proportional data visualization
 */
import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './PieChart.module.css';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  labelFormatter?: (entry: PieChartDataPoint) => string;
  height?: number;
  className?: string;
  colors?: string[];
  centerLabel?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  'data-testid'?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 2,
  showLabels = true,
  showLegend = true,
  showTooltip = true,
  tooltipFormatter,
  labelFormatter,
  height = 300,
  className,
  colors,
  centerLabel,
  loading = false,
  empty = false,
  emptyText = 'No data available',
  'data-testid': testId,
}) => {
  const formatTooltip = tooltipFormatter || ((value, name) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const percentage = (value / total) * 100;
    return [
      `${formatCurrency(value)} (${formatPercentage(percentage / 100)})`,
      name
    ];
  });

  const formatLabel = labelFormatter || ((entry) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const percentage = (entry.value / total) * 100;
    return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
  });

  const getColor = (index: number) => {
    if (colors && colors[index]) return colors[index];
    if (data[index].color) return data[index].color;
    return getChartColor(index);
  };

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

  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, index } = entry;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const percentage = (value / total) * 100;

    if (percentage < 5) return null;

    return (
      <text
        x={x}
        y={y}
        fill={COLORS.TEXT_LIGHT}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        {formatLabel(data[index])}
      </text>
    );
  };

  return (
    <div className={containerClasses} style={{ height }} data-testid={testId}>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderCustomLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              paddingAngle={paddingAngle}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(index)}
                  stroke={COLORS.BACKGROUND}
                  strokeWidth={1}
                />
              ))}
            </Pie>

            {showTooltip && (
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
            )}

            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: 20,
                  color: COLORS.TEXT_LIGHT,
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
                iconType="circle"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>

        {centerLabel && innerRadius > 0 && (
          <div className={styles.centerLabel}>
            {centerLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;