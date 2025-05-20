import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from '../../../constants/colors';

export interface ChartSeries {
  key: string;
  name: string;
  type: 'line' | 'bar' | 'area' | 'scatter';
  color?: string;
  yAxisId?: 'left' | 'right';
  barSize?: number;
  stackId?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  symbolSize?: number;
  hidden?: boolean;
}

export interface ReferenceLineConfig {
  value: number;
  label?: string;
  color?: string;
  yAxisId?: 'left' | 'right';
  position?: 'start' | 'middle' | 'end';
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

interface MultitypeChartProps {
  data: any[];
  series: ChartSeries[];
  height?: number;
  className?: string;
  xAxisDataKey?: string;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  rightYAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => React.ReactNode;
  yAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  rightYAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  showGrid?: boolean;
  showLegend?: boolean;
  stackOffset?: 'sign' | 'expand' | 'wiggle' | 'silhouette' | 'none';
  referenceLines?: ReferenceLineConfig[];
  showRightYAxis?: boolean;
  rightYAxisLabel?: string;
  leftYAxisLabel?: string;
  xAxisLabel?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export const MultitypeChart: React.FC<MultitypeChartProps> = ({
  data,
  series,
  height = 400,
  className,
  xAxisDataKey = 'name',
  xAxisFormatter,
  yAxisFormatter,
  rightYAxisFormatter,
  tooltipFormatter,
  yAxisDomain = ['auto', 'auto'],
  rightYAxisDomain = ['auto', 'auto'],
  showGrid = true,
  showLegend = true,
  stackOffset = 'none',
  referenceLines = [],
  showRightYAxis = false,
  rightYAxisLabel,
  leftYAxisLabel,
  xAxisLabel,
  marginTop = 10,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 30,
}) => {
  const formatX = xAxisFormatter || ((value) => String(value));
  const formatLeftY = yAxisFormatter || ((value) => String(value));
  const formatRightY = rightYAxisFormatter || ((value) => String(value));

  // Filter out hidden series
  const visibleSeries = series.filter(s => !s.hidden);

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: marginTop,
            right: marginRight,
            left: marginLeft,
            bottom: marginBottom,
          }}
          stackOffset={stackOffset}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.DIVIDER}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tick={{ fill: COLORS.TEXT_LIGHT }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatX}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: COLORS.TEXT_LIGHT } : undefined}
          />
          <YAxis
            yAxisId="left"
            domain={yAxisDomain}
            tick={{ fill: COLORS.TEXT_LIGHT }}
            axisLine={{ stroke: COLORS.DIVIDER }}
            tickLine={{ stroke: COLORS.DIVIDER }}
            tickFormatter={formatLeftY}
            label={leftYAxisLabel ? { value: leftYAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: COLORS.TEXT_LIGHT } : undefined}
          />

          {showRightYAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={rightYAxisDomain}
              tick={{ fill: COLORS.TEXT_LIGHT }}
              axisLine={{ stroke: COLORS.DIVIDER }}
              tickLine={{ stroke: COLORS.DIVIDER }}
              tickFormatter={formatRightY}
              label={rightYAxisLabel ? { value: rightYAxisLabel, angle: 90, position: 'insideRight', style: { textAnchor: 'middle' }, fill: COLORS.TEXT_LIGHT } : undefined}
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

          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: 10,
                color: COLORS.TEXT_LIGHT,
              }}
            />
          )}

          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={`reference-line-${index}`}
              y={line.value}
              yAxisId={line.yAxisId || 'left'}
              stroke={line.color || COLORS.ACCENT}
              strokeDasharray={line.strokeDasharray || '3 3'}
              strokeWidth={line.strokeWidth || 1}
              label={{
                value: line.label || '',
                position: line.position || 'right',
                fill: line.color || COLORS.ACCENT,
              }}
            />
          ))}

          {visibleSeries.map((s) => {
            const commonProps = {
              key: s.key,
              dataKey: s.key,
              name: s.name,
              yAxisId: s.yAxisId || 'left',
              stroke: s.color || COLORS.ACCENT,
              fill: s.color || COLORS.ACCENT,
            };

            switch (s.type) {
              case 'line':
                return (
                  <Line
                    {...commonProps}
                    type="monotone"
                    strokeWidth={s.strokeWidth || 2}
                    dot={{ stroke: s.color || COLORS.ACCENT, fill: s.color || COLORS.ACCENT, r: s.symbolSize || 4 }}
                  />
                );
              case 'bar':
                return (
                  <Bar
                    {...commonProps}
                    fillOpacity={s.fillOpacity || 0.8}
                    barSize={s.barSize || 20}
                    stackId={s.stackId}
                  />
                );
              case 'area':
                return (
                  <Area
                    {...commonProps}
                    type="monotone"
                    strokeWidth={s.strokeWidth || 2}
                    fillOpacity={s.fillOpacity || 0.3}
                    stackId={s.stackId}
                  />
                );
              case 'scatter':
                return (
                  <Scatter
                    {...commonProps}
                    fill={s.color || COLORS.ACCENT}
                  />
                );
              default:
                return null;
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultitypeChart;