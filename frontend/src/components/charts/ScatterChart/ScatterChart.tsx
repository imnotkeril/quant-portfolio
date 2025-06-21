/**
 * ScatterChart Component
 * Scatter plot visualization for portfolio data
 */
import React from 'react';

export interface ScatterChartDataPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface ScatterChartProps {
  data: ScatterChartDataPoint[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  title?: string;
  className?: string;
  'data-testid'?: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  width = 400,
  height = 300,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  title,
  className,
  'data-testid': testId,
}) => {
  return (
    <div className={className} data-testid={testId}>
      {title && <h3 style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{title}</h3>}
      <div style={{
        width,
        height,
        background: 'var(--color-divider-20)',
        border: '1px solid var(--color-divider)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-neutral-gray)'
      }}>
        Scatter Chart ({data.length} points)
        <br />
        {xLabel} vs {yLabel}
      </div>
    </div>
  );
};

export default ScatterChart;