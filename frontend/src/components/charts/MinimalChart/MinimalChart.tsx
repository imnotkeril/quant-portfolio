import React from 'react';
import { LineChart, AreaChart, BarChart, PieChart } from 'recharts';
import { COLORS } from '../../../constants/colors';

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'candlestick' | 'scatter' | 'treemap' | 'radar' | 'heatmap';

export interface MinimalChartProps {
  data: any[];
  dataKey: string;
  type: ChartType;
  height?: number;
  width?: number | string;
  color?: string;
  className?: string;
}

/**
 * MinimalChart is a simplified chart component for use in small spaces
 * like cards, tables, etc. It doesn't show axes, grid, tooltips or legends.
 */
export const MinimalChart: React.FC<MinimalChartProps> = ({
  data,
  dataKey,
  type = 'line',
  height = 40,
  width = 120,
  color = COLORS.ACCENT,
  className,
}) => {
  // Determine if data values are positive or negative to choose appropriate colors
  const hasNegative = data.some(item => item[dataKey] < 0);
  const hasPositive = data.some(item => item[dataKey] > 0);

  // Choose color based on data trends
  let chartColor = color;
  if (hasPositive && !hasNegative) {
    chartColor = COLORS.POSITIVE;
  } else if (hasNegative && !hasPositive) {
    chartColor = COLORS.NEGATIVE;
  }

  // Common props for all charts
  const commonProps = {
    data,
    width,
    height,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  // Render the appropriate chart type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.3}
              isAnimationActive={false}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} barCategoryGap={1}>
            <Bar
              dataKey={dataKey}
              fill={chartColor}
              isAnimationActive={false}
            />
          </BarChart>
        );

      case 'pie':
        // For pie chart, transform data to appropriate format
        const pieData = [
          { name: 'Value', value: data.reduce((sum, item) => sum + item[dataKey], 0) }
        ];

        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={height / 2}
              fill={chartColor}
              isAnimationActive={false}
            />
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={className} style={{ height, width }}>
      {renderChart()}
    </div>
  );
};

export default MinimalChart;