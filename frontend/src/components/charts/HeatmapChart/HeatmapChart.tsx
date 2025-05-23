/**
 * HeatmapChart Component
 * Heatmap visualization for correlation matrices and data grids
 */
import React from 'react';
import { COLORS } from '../../../constants/colors';
import { formatPercentage } from '../../../utils/formatters';
import { getHeatMapColor } from '../../../utils/color';
import styles from './HeatmapChart.module.css';

export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  label?: string;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  width?: number;
  height?: number;
  cellSize?: number;
  showLabels?: boolean;
  showTooltip?: boolean;
  colorScale?: 'correlation' | 'performance' | 'custom';
  minValue?: number;
  maxValue?: number;
  formatter?: (value: number) => string;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  'data-testid'?: string;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  width = 600,
  height = 400,
  cellSize = 40,
  showLabels = true,
  showTooltip = true,
  colorScale = 'correlation',
  minValue,
  maxValue,
  formatter = (value) => formatPercentage(value),
  className,
  loading = false,
  empty = false,
  emptyText = 'No data available',
  'data-testid': testId,
}) => {
  // Get unique x and y values
  const xLabels = Array.from(new Set(data.map(d => d.x))).sort();
  const yLabels = Array.from(new Set(data.map(d => d.y))).sort();

  // Calculate min and max values if not provided
  const values = data.map(d => d.value);
  const minVal = minValue !== undefined ? minValue : Math.min(...values);
  const maxVal = maxValue !== undefined ? maxValue : Math.max(...values);

  // Create data matrix
  const matrix: Record<string, Record<string, HeatmapDataPoint | undefined>> = {};
  yLabels.forEach(y => {
    matrix[y] = {};
    xLabels.forEach(x => {
      matrix[y][x] = data.find(d => d.x === x && d.y === y);
    });
  });

  const containerClasses = `${styles.container} ${className || ''}`;

  if (loading) {
    return (
      <div className={containerClasses} style={{ width, height }} data-testid={testId}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading heatmap...</span>
        </div>
      </div>
    );
  }

  if (empty || !data.length) {
    return (
      <div className={containerClasses} style={{ width, height }} data-testid={testId}>
        <div className={styles.empty}>
          <span>{emptyText}</span>
        </div>
      </div>
    );
  }

  const getCellColor = (value: number) => {
    switch (colorScale) {
      case 'correlation':
        // For correlation: -1 (red) to 0 (neutral) to 1 (green)
        if (value < 0) {
          const intensity = Math.abs(value);
          return `rgba(250, 161, 164, ${intensity})`;
        } else {
          return `rgba(116, 241, 116, ${value})`;
        }
      case 'performance':
        // For performance: use standard heatmap colors
        return getHeatMapColor(value, minVal, maxVal);
      case 'custom':
      default:
        return getHeatMapColor(value, minVal, maxVal);
    }
  };

  const handleCellHover = (event: React.MouseEvent, dataPoint: HeatmapDataPoint | undefined) => {
    if (!showTooltip || !dataPoint) return;

    // You could implement a custom tooltip here
    console.log('Heatmap cell hover:', dataPoint);
  };

  return (
    <div className={containerClasses} style={{ width, height }} data-testid={testId}>
      <div className={styles.heatmapContainer}>
        <svg width={width} height={height} className={styles.svg}>
          {/* Y-axis labels */}
          <g className={styles.yLabels}>
            {yLabels.map((label, index) => (
              <text
                key={label}
                x={80}
                y={100 + index * cellSize + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className={styles.axisLabel}
              >
                {label}
              </text>
            ))}
          </g>

          {/* X-axis labels */}
          <g className={styles.xLabels}>
            {xLabels.map((label, index) => (
              <text
                key={label}
                x={100 + index * cellSize + cellSize / 2}
                y={90}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.axisLabel}
                transform={`rotate(-45, ${100 + index * cellSize + cellSize / 2}, 90)`}
              >
                {label}
              </text>
            ))}
          </g>

          {/* Heatmap cells */}
          <g className={styles.cells}>
            {yLabels.map((yLabel, yIndex) =>
              xLabels.map((xLabel, xIndex) => {
                const dataPoint = matrix[yLabel][xLabel];
                if (!dataPoint) return null;

                const x = 100 + xIndex * cellSize;
                const y = 100 + yIndex * cellSize;
                const cellColor = getCellColor(dataPoint.value);

                return (
                  <g key={`${xLabel}-${yLabel}`}>
                    <rect
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      fill={cellColor}
                      stroke={COLORS.DIVIDER}
                      strokeWidth={1}
                      className={styles.cell}
                      onMouseEnter={(e) => handleCellHover(e, dataPoint)}
                      style={{ cursor: showTooltip ? 'pointer' : 'default' }}
                    />
                    {showLabels && (
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={styles.cellLabel}
                        fill={Math.abs(dataPoint.value) > 0.5 ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
                      >
                        {dataPoint.label || formatter(dataPoint.value)}
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </g>
        </svg>

        {/* Color scale legend */}
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Scale</div>
          <div className={styles.legendScale}>
            <div className={styles.legendGradient}>
              <div
                className={styles.legendBar}
                style={{
                  background: colorScale === 'correlation'
                    ? `linear-gradient(to right, 
                        rgba(250, 161, 164, 1) 0%, 
                        rgba(250, 161, 164, 0) 50%, 
                        rgba(116, 241, 116, 1) 100%)`
                    : `linear-gradient(to right, ${COLORS.NEGATIVE}, ${COLORS.NEUTRAL_GRAY}, ${COLORS.POSITIVE})`
                }}
              />
            </div>
            <div className={styles.legendLabels}>
              <span>{formatter(minVal)}</span>
              <span>{formatter((minVal + maxVal) / 2)}</span>
              <span>{formatter(maxVal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;