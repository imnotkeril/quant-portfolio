/**
 * OptimizationComparison Component
 * Compare multiple optimization results side by side
 */
import React, { useState, useMemo } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Table, TableColumn } from '../../common/Table/Table';
import { Badge } from '../../common/Badge/Badge';
import { LineChart, LineChartSeries } from '../../charts/LineChart/LineChart';
import { OptimizationResponse } from '../../../types/optimization';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import { COLORS } from '../../../constants/colors';
import styles from './OptimizationComparison.module.css';

interface ComparisonItem {
  id: string;
  name: string;
  result: OptimizationResponse;
  color: string;
}

interface OptimizationComparisonProps {
  optimizations: OptimizationResponse[];
  onRemoveOptimization?: (index: number) => void;
  onSelectOptimization?: (result: OptimizationResponse) => void;
  className?: string;
}

export const OptimizationComparison: React.FC<OptimizationComparisonProps> = ({
  optimizations,
  onRemoveOptimization,
  onSelectOptimization,
  className,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'expectedReturn',
    'expectedRisk',
    'sharpeRatio'
  ]);
  const [chartView, setChartView] = useState<'metrics' | 'weights'>('metrics');

  // Transform optimizations for comparison
  const comparisonItems: ComparisonItem[] = useMemo(() => {
    return optimizations.map((result, index) => ({
      id: `opt-${index}`,
      name: `${formatMethodName(result.optimizationMethod)} ${index + 1}`,
      result,
      color: getComparisonColor(index),
    }));
  }, [optimizations]);

  // Available metrics for comparison
  const availableMetrics = [
    { value: 'expectedReturn', label: 'Expected Return' },
    { value: 'expectedRisk', label: 'Expected Risk' },
    { value: 'sharpeRatio', label: 'Sharpe Ratio' },
    { value: 'sortinoRatio', label: 'Sortino Ratio' },
    { value: 'calmarRatio', label: 'Calmar Ratio' },
    { value: 'informationRatio', label: 'Information Ratio' },
  ];

  // Metrics comparison table data
  const metricsTableData = useMemo(() => {
    const allMetrics = new Set<string>();

    // Collect all available metrics
    comparisonItems.forEach(item => {
      allMetrics.add('expectedReturn');
      allMetrics.add('expectedRisk');
      Object.keys(item.result.performanceMetrics || {}).forEach(key => {
        allMetrics.add(key);
      });
    });

    return Array.from(allMetrics).map(metricKey => {
      const row: any = {
        metric: formatMetricName(metricKey),
        key: metricKey,
      };

      comparisonItems.forEach((item, index) => {
        let value: number | undefined;

        if (metricKey === 'expectedReturn') {
          value = item.result.expectedReturn;
        } else if (metricKey === 'expectedRisk') {
          value = item.result.expectedRisk;
        } else {
          value = item.result.performanceMetrics?.[metricKey];
        }

        row[`opt${index}`] = value;
        row[`opt${index}_formatted`] = formatMetricValue(metricKey, value);
        row[`opt${index}_rank`] = 0; // Will be calculated after
      });

      return row;
    });
  }, [comparisonItems]);

  // Chart data for metrics comparison
  const metricsChartData = useMemo(() => {
    if (chartView !== 'metrics') return [];

    return selectedMetrics.map(metricKey => {
      const dataPoint: any = { name: formatMetricName(metricKey) };

      comparisonItems.forEach((item, index) => {
        let value: number | undefined;

        if (metricKey === 'expectedReturn') {
          value = item.result.expectedReturn * 100; // Convert to percentage
        } else if (metricKey === 'expectedRisk') {
          value = item.result.expectedRisk * 100; // Convert to percentage
        } else if (metricKey === 'sharpeRatio') {
          value = item.result.performanceMetrics?.sharpe_ratio;
        } else {
          value = item.result.performanceMetrics?.[metricKey];
        }

        dataPoint[item.name] = value || 0;
      });

      return dataPoint;
    });
  }, [comparisonItems, selectedMetrics, chartView]);

  // Chart series for metrics
  const metricsChartSeries: LineChartSeries[] = useMemo(() => {
    return comparisonItems.map(item => ({
      key: item.name,
      name: item.name,
      color: item.color,
      strokeWidth: 3,
    }));
  }, [comparisonItems]);

  // Weights comparison data
  const weightsComparisonData = useMemo(() => {
    if (chartView !== 'weights') return [];

    // Get all unique tickers
    const allTickers = new Set<string>();
    comparisonItems.forEach(item => {
      Object.keys(item.result.optimalWeights).forEach(ticker => {
        allTickers.add(ticker);
      });
    });

    return Array.from(allTickers).map(ticker => {
      const dataPoint: any = { name: ticker };

      comparisonItems.forEach(item => {
        const weight = item.result.optimalWeights[ticker] || 0;
        dataPoint[item.name] = weight * 100; // Convert to percentage
      });

      return dataPoint;
    });
  }, [comparisonItems, chartView]);

  // Table columns for metrics comparison
  const metricsTableColumns: TableColumn[] = useMemo(() => {
    const columns: TableColumn[] = [
      {
        key: 'metric',
        title: 'Metric',
        width: '200px',
        render: (value) => (
          <span className={styles.metricName}>{value}</span>
        ),
      },
    ];

    comparisonItems.forEach((item, index) => {
      columns.push({
        key: `opt${index}_formatted`,
        title: item.name,
        width: '120px',
        align: 'center',
        render: (value, record) => {
          const rawValue = record[`opt${index}`];
          const isUndefined = rawValue === undefined;

          return (
            <div className={styles.metricValue}>
              <span className={isUndefined ? styles.undefined : ''}>
                {isUndefined ? 'N/A' : value}
              </span>
              {!isUndefined && (
                <Badge size="small">
                  {getRankText(record.key, rawValue, comparisonItems.map((_, i) => record[`opt${i}`]))}
                </Badge>
              )}
            </div>
          );
        },
      });
    });

    return columns;
  }, [comparisonItems]);

  if (optimizations.length === 0) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.emptyState}>
          <p>No optimizations to compare.</p>
          <p>Run multiple optimizations to see comparisons here.</p>
        </div>
      </Card>
    );
  }

  if (optimizations.length === 1) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.singleOptimization}>
          <p>Add more optimizations to enable comparison.</p>
          <p>Currently showing: {formatMethodName(optimizations[0].optimizationMethod)}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3>Optimization Comparison</h3>
        <div className={styles.headerActions}>
          <select
            value={chartView}
            onChange={(e) => setChartView(e.target.value as 'metrics' | 'weights')}
            className={styles.viewSelect}
          >
            <option value="metrics">Metrics View</option>
            <option value="weights">Weights View</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {/* Quick Comparison Cards */}
        <div className={styles.quickComparison}>
          {comparisonItems.map((item, index) => (
            <div key={item.id} className={styles.comparisonCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div
                    className={styles.colorIndicator}
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className={styles.cardActions}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => onSelectOptimization?.(item.result)}
                  >
                    View
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => onRemoveOptimization?.(index)}
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className={styles.cardMetrics}>
                <div className={styles.cardMetric}>
                  <span className={styles.cardMetricLabel}>Return</span>
                  <span className={styles.cardMetricValue}>
                    {formatPercentage(item.result.expectedReturn, 2)}
                  </span>
                </div>
                <div className={styles.cardMetric}>
                  <span className={styles.cardMetricLabel}>Risk</span>
                  <span className={styles.cardMetricValue}>
                    {formatPercentage(item.result.expectedRisk, 2)}
                  </span>
                </div>
                <div className={styles.cardMetric}>
                  <span className={styles.cardMetricLabel}>Sharpe</span>
                  <span className={styles.cardMetricValue}>
                    {formatNumber(item.result.performanceMetrics?.sharpe_ratio || 0, 3)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h4>
              {chartView === 'metrics' ? 'Metrics Comparison' : 'Weights Comparison'}
            </h4>

            {chartView === 'metrics' && (
              <div className={styles.metricsSelectContainer}>
                {availableMetrics.map(metric => (
                  <label key={metric.value} className={styles.metricCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric.value]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric.value));
                        }
                      }}
                    />
                    <span>{metric.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={styles.chartContainer}>
            <LineChart
              data={chartView === 'metrics' ? metricsChartData : weightsComparisonData}
              series={metricsChartSeries}
              height={350}
              showGrid={true}
              showLegend={true}
              yAxisFormatter={(value) =>
                chartView === 'metrics' && (selectedMetrics.includes('expectedReturn') || selectedMetrics.includes('expectedRisk'))
                  ? `${value}%`
                  : value.toString()
              }
            />
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className={styles.tableSection}>
          <h4>Detailed Metrics Comparison</h4>
          <div className={styles.tableContainer}>
            <Table
              columns={metricsTableColumns}
              data={metricsTableData}
              rowKey="key"
              size="small"
              bordered
              pagination={false}
            />
          </div>
        </div>

        {/* Summary Insights */}
        <div className={styles.insights}>
          <h4>Comparison Insights</h4>
          <div className={styles.insightsList}>
            {generateComparisonInsights(comparisonItems).map((insight, index) => (
              <div key={index} className={styles.insightItem}>
                <div className={styles.insightIcon}>📊</div>
                <div className={styles.insightText}>{insight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper functions
function formatMethodName(method: string): string {
  const names: Record<string, string> = {
    markowitz: 'Markowitz',
    risk_parity: 'Risk Parity',
    minimum_variance: 'Min Variance',
    maximum_sharpe: 'Max Sharpe',
    equal_weight: 'Equal Weight',
  };

  return names[method] || method;
}

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    expectedReturn: 'Expected Return',
    expectedRisk: 'Expected Risk',
    sharpe_ratio: 'Sharpe Ratio',
    sortino_ratio: 'Sortino Ratio',
    calmar_ratio: 'Calmar Ratio',
    information_ratio: 'Information Ratio',
    treynor_ratio: 'Treynor Ratio',
    jensen_alpha: 'Jensen Alpha',
  };

  return names[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatMetricValue(key: string, value: number | undefined): string {
  if (value === undefined) return 'N/A';

  if (key === 'expectedReturn' || key === 'expectedRisk') {
    return formatPercentage(value, 2);
  }

  return formatNumber(value, 3);
}

function getComparisonColor(index: number): string {
  const colors = [
    COLORS.ACCENT,
    COLORS.POSITIVE,
    COLORS.NEUTRAL_1,
    COLORS.NEUTRAL_2,
    COLORS.NEUTRAL_GRAY,
  ];

  return colors[index % colors.length];
}

function getBestMetricVariant(metricKey: string, value: number, allValues: (number | undefined)[]): 'success' | 'danger' | 'secondary' {
  const validValues = allValues.filter(v => v !== undefined) as number[];
  if (validValues.length < 2) return 'secondary';

  const max = Math.max(...validValues);
  const min = Math.min(...validValues);

  // For risk metrics, lower is better
  const lowerIsBetter = metricKey === 'expectedRisk';

  if (lowerIsBetter) {
    if (value === min) return 'success';
    if (value === max) return 'danger';
  } else {
    if (value === max) return 'success';
    if (value === min) return 'danger';
  }

  return 'secondary';
}

function getRankText(metricKey: string, value: number, allValues: (number | undefined)[]): string {
  const validValues = allValues.filter(v => v !== undefined) as number[];
  if (validValues.length < 2) return '';

  const sorted = [...validValues].sort((a, b) =>
    metricKey === 'expectedRisk' ? a - b : b - a
  );

  const rank = sorted.indexOf(value) + 1;

  if (rank === 1) return 'Best';
  if (rank === validValues.length) return 'Worst';
  return `#${rank}`;
}

function generateComparisonInsights(items: ComparisonItem[]): string[] {
  const insights: string[] = [];

  if (items.length < 2) return insights;

  // Find best Sharpe ratio
  const sharpeRatios = items.map(item => ({
    name: item.name,
    sharpe: item.result.performanceMetrics?.sharpe_ratio || 0,
  }));

  const bestSharpe = sharpeRatios.reduce((best, current) =>
    current.sharpe > best.sharpe ? current : best
  );

  insights.push(`${bestSharpe.name} has the highest risk-adjusted returns (Sharpe: ${bestSharpe.sharpe.toFixed(3)})`);

  // Find lowest risk
  const risks = items.map(item => ({
    name: item.name,
    risk: item.result.expectedRisk,
  }));

  const lowestRisk = risks.reduce((lowest, current) =>
    current.risk < lowest.risk ? current : lowest
  );

  insights.push(`${lowestRisk.name} has the lowest volatility (${formatPercentage(lowestRisk.risk, 2)})`);

  // Find highest return
  const returns = items.map(item => ({
    name: item.name,
    return: item.result.expectedReturn,
  }));

  const highestReturn = returns.reduce((highest, current) =>
    current.return > highest.return ? current : highest
  );

  insights.push(`${highestReturn.name} targets the highest returns (${formatPercentage(highestReturn.return, 2)})`);

  // Diversification insight
  const diversificationScores = items.map(item => {
    const weights = Object.values(item.result.optimalWeights);
    const effectiveAssets = 1 / weights.reduce((sum, w) => sum + w * w, 0);
    return {
      name: item.name,
      score: effectiveAssets,
    };
  });

  const mostDiversified = diversificationScores.reduce((most, current) =>
    current.score > most.score ? current : most
  );

  insights.push(`${mostDiversified.name} provides the best diversification (${mostDiversified.score.toFixed(1)} effective assets)`);

  return insights;
}