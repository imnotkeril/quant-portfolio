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
  TooltipProps
} from 'recharts';
import { Card } from '../../common/Card/Card';

export interface LineChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export interface LineChartSeries {
  key: string;
  name: string;
  color?: string;
  type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter' | 'basis' | 'basisOpen' | 'basisClosed' | 'natural' | 'cardinal' | 'cardinalOpen' | 'cardinalClosed' | 'monotoneX' | 'monotoneY';
  strokeWidth?: number;
  dot?: boolean | object;
  activeDot?: object;
  strokeDasharray?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => `${label}`
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-background/90 backdrop-blur-sm border border-divider p-3 rounded shadow-md text-sm">
      <p className="font-medium text-white mb-1">{labelFormatter(label || '')}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-neutral-gray mr-2">{entry.name}:</span>
            <span className="font-medium text-white">{valueFormatter(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LineChartProps {
  data: LineChartDataPoint[];
  series: LineChartSeries[];
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipValueFormatter?: (value: number) => string;
  tooltipLabelFormatter?: (label: string) => string;
  yAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  emptyText?: string;
}

/**
 * LineChart component for visualization
 * following Wild Market Capital design system
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxisFormatter,
  yAxisFormatter,
  tooltipValueFormatter,
  tooltipLabelFormatter,
  yAxisDomain = ['auto', 'auto'],
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
  marginTop = 10,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 30,
  title,
  subtitle,
  loading = false,
  emptyText = 'No data available'
}) => {
  const formatX = xAxisFormatter || ((value) => String(value));
  const formatY = yAxisFormatter || ((value) => String(value));

  // Standard colors from Wild Market Capital design system
  const colors = [
    '#BF9FFB', // accent
    '#90BFF9', // neutral-1
    '#FFF59D', // neutral-2
    '#74F174', // positive
    '#FAA1A4', // negative
    '#D1D4DC', // neutral-gray
  ];

  // Check if data is empty
  const isEmpty = !data || data.length === 0;

  return (
    <Card
      className={className}
      title={title}
      subtitle={subtitle}
    >
      <div style={{ height, width: '100%' }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center text-neutral-gray">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-neutral-gray">
              {emptyText}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: marginTop,
                right: marginRight,
                left: marginLeft,
                bottom: marginBottom,
              }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2A2E39"
                  vertical={false}
                  opacity={0.6}
                />
              )}

              <XAxis
                dataKey="name"
                tick={{ fill: '#FFFFFF' }}
                axisLine={{ stroke: '#2A2E39' }}
                tickLine={{ stroke: '#2A2E39' }}
                tickFormatter={formatX}
                minTickGap={5}
              />

              <YAxis
                domain={yAxisDomain}
                tick={{ fill: '#FFFFFF' }}
                axisLine={{ stroke: '#2A2E39' }}
                tickLine={{ stroke: '#2A2E39' }}
                tickFormatter={formatY}
                allowDataOverflow={true}
              />

              <Tooltip
                content={
                  <CustomTooltip
                    valueFormatter={tooltipValueFormatter}
                    labelFormatter={tooltipLabelFormatter}
                  />
                }
              />

              {showLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: 15 }}
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-white">{value}</span>
                  )}
                />
              )}

              {series.map((s, index) => (
                <Line
                  key={s.key}
                  type={s.type || 'monotone'}
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color || colors[index % colors.length]}
                  strokeWidth={s.strokeWidth || 2}
                  dot={s.dot === undefined ? false : s.dot}
                  activeDot={s.activeDot || { r: 6, fill: s.color || colors[index % colors.length] }}
                  strokeDasharray={s.strokeDasharray}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};