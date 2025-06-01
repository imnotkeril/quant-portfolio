/**
 * CorrelationMatrix Component
 * Interactive correlation matrix visualization
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import { Table } from '../../common/Table/Table';
import { formatNumber } from '../../../utils/formatters';
import styles from './CorrelationMatrix.module.css';

interface CorrelationData {
  [asset1: string]: {
    [asset2: string]: number;
  };
}

interface CorrelationMatrixProps {
  correlationData: CorrelationData;
  assets?: string[];
  loading?: boolean;
  error?: string;
  onRecalculate?: (period: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  correlationData,
  assets = [],
  loading = false,
  error,
  onRecalculate,
  className,
  'data-testid': testId,
}) => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'table'>('heatmap');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [highlightThreshold, setHighlightThreshold] = useState(0.7);

  const periodOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
  ];

  const thresholdOptions = [
    { value: '0.5', label: '0.5' },
    { value: '0.6', label: '0.6' },
    { value: '0.7', label: '0.7' },
    { value: '0.8', label: '0.8' },
    { value: '0.9', label: '0.9' },
  ];

  const handlePeriodChange = (value: string | number | (string | number)[]) => {
    const period = Array.isArray(value) ? value[0]?.toString() : value.toString();
    setSelectedPeriod(period);
    onRecalculate?.(period);
  };

  // Transform correlation data for heatmap
  const heatmapData = React.useMemo(() => {
    const data = [];
    const assetList = assets.length > 0 ? assets : Object.keys(correlationData);

    for (const asset1 of assetList) {
      for (const asset2 of assetList) {
        const correlation = correlationData[asset1]?.[asset2] ?? 0;
        data.push({
          x: asset1,
          y: asset2,
          value: correlation,
          label: formatNumber(correlation, 2),
        });
      }
    }

    return data;
  }, [correlationData, assets]);

  // Transform correlation data for table
  const tableData = React.useMemo(() => {
    const assetList = assets.length > 0 ? assets : Object.keys(correlationData);

    return assetList.map(asset1 => {
      const row: any = { asset: asset1 };
      assetList.forEach(asset2 => {
        row[asset2] = correlationData[asset1]?.[asset2] ?? 0;
      });
      return row;
    });
  }, [correlationData, assets]);

  // Table columns
  const tableColumns = React.useMemo(() => {
    const assetList = assets.length > 0 ? assets : Object.keys(correlationData);

    const columns: any[] = [
      {
        key: 'asset',
        title: 'Asset',
        dataIndex: 'asset',
        render: (value: string) => (
          <span className={styles.assetName}>{value}</span>
        ),
      },
    ];

    assetList.forEach(asset => {
      columns.push({
        key: asset,
        title: asset,
        dataIndex: asset,
        render: (value: any) => {
          const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
          return (
            <span className={classNames(
              styles.correlationValue,
              {
                [styles.highCorrelation]: Math.abs(numValue) >= highlightThreshold,
                [styles.perfectCorrelation]: Math.abs(numValue) >= 0.99,
                [styles.negativeCorrelation]: numValue < 0,
              }
            )}>
              {formatNumber(numValue, 2)}
            </span>
          );
        },
        align: 'center',
      });
    });

    return columns;
  }, [assets, correlationData, highlightThreshold]);

  // Calculate correlation statistics
  const correlationStats = React.useMemo(() => {
    const values = [];
    const assetList = assets.length > 0 ? assets : Object.keys(correlationData);

    for (const asset1 of assetList) {
      for (const asset2 of assetList) {
        if (asset1 !== asset2) { // Exclude diagonal (self-correlation)
          const correlation = correlationData[asset1]?.[asset2];
          if (correlation !== undefined) {
            values.push(correlation);
          }
        }
      }
    }

    if (values.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        highCorrelations: 0,
        negativeCorrelations: 0,
      };
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const highCorrelations = values.filter(val => Math.abs(val) >= highlightThreshold).length;
    const negativeCorrelations = values.filter(val => val < 0).length;

    return {
      average,
      highest,
      lowest,
      highCorrelations,
      negativeCorrelations,
    };
  }, [correlationData, assets, highlightThreshold]);

  return (
    <Card
      title="Correlation Matrix"
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Time Period</label>
            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              options={periodOptions}
              placeholder="Select period"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>View Mode</label>
            <Select
              value={viewMode}
              onChange={(value) => {
                const mode = Array.isArray(value) ? value[0]?.toString() : value.toString();
                setViewMode(mode as typeof viewMode);
              }}
              options={[
                { value: 'heatmap', label: 'Heatmap' },
                { value: 'table', label: 'Table' },
              ]}
              placeholder="Select view"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Highlight Threshold</label>
            <Select
              value={highlightThreshold.toString()}
              onChange={(value) => {
                const threshold = Array.isArray(value) ? parseFloat(value[0]?.toString() || '0.7') : parseFloat(value.toString());
                setHighlightThreshold(threshold);
              }}
              options={thresholdOptions}
              placeholder="Select threshold"
            />
          </div>

          <div className={styles.controlGroup}>
            <Button
              onClick={() => onRecalculate?.(selectedPeriod)}
              disabled={loading}
              loading={loading}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span>Error loading correlation data: {error}</span>
          </div>
        )}

        {!loading && !error && Object.keys(correlationData).length > 0 && (
          <>
            {/* Statistics Summary */}
            <div className={styles.statsSection}>
              <h4 className={styles.sectionTitle}>Correlation Statistics</h4>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Average Correlation</span>
                  <span className={styles.statValue}>
                    {formatNumber(correlationStats.average, 3)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Highest Correlation</span>
                  <span className={styles.statValue}>
                    {formatNumber(correlationStats.highest, 3)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Lowest Correlation</span>
                  <span className={styles.statValue}>
                    {formatNumber(correlationStats.lowest, 3)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>High Correlations</span>
                  <span className={styles.statValue}>
                    {correlationStats.highCorrelations}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Negative Correlations</span>
                  <span className={styles.statValue}>
                    {correlationStats.negativeCorrelations}
                  </span>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className={styles.visualizationSection}>
              {viewMode === 'heatmap' ? (
                <div className={styles.heatmapContainer}>
                  <HeatmapChart
                    data={heatmapData}
                    width={600}
                    height={500}
                    cellSize={45}
                    showLabels={true}
                    showTooltip={true}
                    colorScale="correlation"
                    minValue={-1}
                    maxValue={1}
                    formatter={(value) => formatNumber(value, 2)}
                  />
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <Table
                    data={tableData}
                    columns={tableColumns}
                    rowKey="asset"
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )}
            </div>

            {/* Legend and Interpretation */}
            <div className={styles.interpretationSection}>
              <h4 className={styles.sectionTitle}>Interpretation Guide</h4>
              <div className={styles.interpretationGrid}>
                <div className={styles.interpretationItem}>
                  <div className={classNames(styles.colorSample, styles.strongPositive)}></div>
                  <div className={styles.interpretationText}>
                    <strong>Strong Positive (0.7 to 1.0)</strong>
                    <span>Assets move together strongly</span>
                  </div>
                </div>
                <div className={styles.interpretationItem}>
                  <div className={classNames(styles.colorSample, styles.moderatePositive)}></div>
                  <div className={styles.interpretationText}>
                    <strong>Moderate Positive (0.3 to 0.7)</strong>
                    <span>Assets tend to move in the same direction</span>
                  </div>
                </div>
                <div className={styles.interpretationItem}>
                  <div className={classNames(styles.colorSample, styles.weakCorrelation)}></div>
                  <div className={styles.interpretationText}>
                    <strong>Weak Correlation (-0.3 to 0.3)</strong>
                    <span>Little to no linear relationship</span>
                  </div>
                </div>
                <div className={styles.interpretationItem}>
                  <div className={classNames(styles.colorSample, styles.moderateNegative)}></div>
                  <div className={styles.interpretationText}>
                    <strong>Moderate Negative (-0.7 to -0.3)</strong>
                    <span>Assets tend to move in opposite directions</span>
                  </div>
                </div>
                <div className={styles.interpretationItem}>
                  <div className={classNames(styles.colorSample, styles.strongNegative)}></div>
                  <div className={styles.interpretationText}>
                    <strong>Strong Negative (-1.0 to -0.7)</strong>
                    <span>Assets move in opposite directions strongly</span>
                  </div>
                </div>
              </div>

              <div className={styles.insightBox}>
                <h5 className={styles.insightTitle}>Portfolio Diversification Insights</h5>
                <ul className={styles.insightList}>
                  <li>
                    <strong>High correlations ({'>'}={highlightThreshold}):</strong> {correlationStats.highCorrelations} pairs
                    {correlationStats.highCorrelations > 5 && (
                      <span className={styles.warningText}> - Consider reducing concentration</span>
                    )}
                  </li>
                  <li>
                    <strong>Negative correlations:</strong> {correlationStats.negativeCorrelations} pairs
                    {correlationStats.negativeCorrelations > 0 && (
                      <span className={styles.positiveText}> - Good for diversification</span>
                    )}
                  </li>
                  <li>
                    <strong>Average correlation:</strong> {formatNumber(correlationStats.average, 3)}
                    {correlationStats.average > 0.5 ? (
                      <span className={styles.warningText}> - Portfolio may be over-concentrated</span>
                    ) : correlationStats.average < 0.2 ? (
                      <span className={styles.positiveText}> - Well diversified portfolio</span>
                    ) : (
                      <span className={styles.neutralText}> - Moderate diversification</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {!loading && !error && Object.keys(correlationData).length === 0 && (
          <div className={styles.empty}>
            No correlation data available. Please select assets and time period.
          </div>
        )}
      </div>
    </Card>
  );
};

export default CorrelationMatrix;