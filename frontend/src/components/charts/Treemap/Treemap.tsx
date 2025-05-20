import React from 'react';
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { COLORS } from '../../../constants/colors';

export interface TreemapNode {
  name: string;
  size?: number;
  value?: number;
  children?: TreemapNode[];
  color?: string;
  [key: string]: any;
}

interface CustomContentProps {
  root: any;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: any;
  colors: string[];
  rank: any;
  name: string;
  value?: number;
  showValue?: boolean;
  valueFormatter?: (value: any) => string;
}

interface TreemapProps {
  data: TreemapNode | TreemapNode[];
  height?: number;
  className?: string;
  dataKey?: string;
  colorRange?: string[];
  aspectRatio?: number;
  tooltipFormatter?: (value: any, name: string, props: any) => React.ReactNode;
  showValue?: boolean;
  valueFormatter?: (value: any) => string;
}

export const Treemap: React.FC<TreemapProps> = ({
  data,
  height = 400,
  className,
  dataKey = 'value',
  colorRange = [COLORS.ACCENT, COLORS.NEUTRAL_1, COLORS.NEUTRAL_2],
  aspectRatio = 4 / 3,
  tooltipFormatter,
  showValue = true,
  valueFormatter = (value) => value?.toLocaleString() || ''
}) => {
  // Custom content component for the treemap cells
  const CustomContent: React.FC<CustomContentProps> = ({
    root,
    depth,
    x,
    y,
    width,
    height,
    index,
    colors,
    name,
    value,
    showValue,
    valueFormatter
  }) => {
    // Handle very small cells
    if (width < 30 || height < 30) {
      return null;
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: typeof colors === 'string' ? colors : colors[Math.min(Math.floor(index / 2), colors.length - 1)],
            stroke: COLORS.BACKGROUND,
            strokeWidth: 2,
            fillOpacity: 0.8,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 7 : 0)}
          textAnchor="middle"
          fill={COLORS.TEXT_LIGHT}
          fontSize={width < 50 ? 10 : 12}
          style={{
            fontWeight: 'bold',
            textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)'
          }}
        >
          {name}
        </text>
        {showValue && value && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill={COLORS.TEXT_LIGHT}
            fontSize={width < 50 ? 8 : 10}
          >
            {valueFormatter(value)}
          </text>
        )}
      </g>
    );
  };

  // Custom tooltip for treemap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-background border border-divider p-2 rounded-md text-sm">
          <p className="font-bold">{data.name}</p>
          <p>{dataKey}: {valueFormatter(data[dataKey])}</p>
          {data.percentage !== undefined && (
            <p>Percentage: {(data.percentage * 100).toFixed(2)}%</p>
          )}
          {data.category && (
            <p>Category: {data.category}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsTreemap
          data={Array.isArray(data) ? data : [data]}
          dataKey={dataKey}
          aspectRatio={aspectRatio}
          stroke={COLORS.BACKGROUND}
          fill={COLORS.ACCENT}
          content={
            <CustomContent
              colors={colorRange}
              showValue={showValue}
              valueFormatter={valueFormatter}
            />
          }
        >
          <Tooltip content={tooltipFormatter ? tooltipFormatter : <CustomTooltip />} />
        </RechartsTreemap>
      </ResponsiveContainer>
    </div>
  );
};

export default Treemap;