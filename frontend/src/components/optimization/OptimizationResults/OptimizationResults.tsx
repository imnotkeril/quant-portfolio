/**
 * OptimizationResults Component
 * Display comprehensive optimization results with metrics, weights, and insights
 */
import React, { useState, useMemo } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Tabs } from '../../common/Tabs/Tabs';
import { Badge } from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import { PieChart, PieChartDataPoint } from '../../charts/PieChart/PieChart';
import { WeightsTable, WeightItem } from './WeightsTable/WeightsTable';
import { OptimizationResponse } from '../../../types/optimization';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './OptimizationResults.module.css';

interface OptimizationResultsProps {
  result: OptimizationResponse | null;
  onCreatePortfolio?: (weights: Record<string, number>) => void;
  onSaveOptimization?: (result: OptimizationResponse) => void;
  onCompareOptimization?: (result: OptimizationResponse) => void;
  className?: string;
}

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  result,
  onCreatePortfolio,
  onSaveOptimization,
  onCompareOptimization,
  className,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Transform weights for pie chart
  const pieChartData: PieChartDataPoint[] = useMemo(() => {
    if (!result) return [];

    return Object.entries(result.optimalWeights)
      .map(([ticker, weight], index) => ({
        name: ticker,
        value: weight,
        color: getChartColor(index),
      }))
      .sort((a, b) => b.value - a.value);
  }, [result]);

  // Transform weights for table
  const weightsData: WeightItem[] = useMemo(() => {
    if (!result) return [];

    return Object.entries(result.optimalWeights)
      .map(([ticker, weight]) => ({
        ticker,
        currentWeight: 0, // Would come from current portfolio
        targetWeight: weight,
        minWeight: 0,
        maxWeight: 1,
      }))
      .sort((a, b) => b.targetWeight - a.targetWeight);
  }, [result]);

  // Performance metrics for display
  const performanceMetrics = useMemo(() => {
    if (!result) return [];

    const baseMetrics = [
      {
        label: 'Expected Return',
        value: formatPercentage(result.expectedReturn, 2),
        description: 'Annualized expected return',
        status: result.expectedReturn > 0.08 ? 'positive' : result.expectedReturn > 0.05 ? 'neutral' : 'negative',
      },
      {
        label: 'Expected Risk',
        value: formatPercentage(result.expectedRisk, 2),
        description: 'Annualized volatility (standard deviation)',
        status: result.expectedRisk < 0.15 ? 'positive' : result.expectedRisk < 0.25 ? 'neutral' : 'negative',
      },
    ];

    // Add performance metrics from result
    const additionalMetrics = Object.entries(result.performanceMetrics || {})
      .map(([key, value]) => ({
        label: formatMetricName(key),
        value: typeof value === 'number' ? formatNumber(value, 3) : String(value),
        description: getMetricDescription(key),
        status: getMetricStatus(key, value),
      }));

    return [...baseMetrics, ...additionalMetrics];
  }, [result]);

  // Generate insights
  const insights = useMemo(() => {
    if (!result) return [];

    const insights: string[] = [];

    // Risk-return insights
    const returnPercent = result.expectedReturn * 100;
    const riskPercent = result.expectedRisk * 100;

    insights.push(`Portfolio targets ${returnPercent.toFixed(1)}% annual return with ${riskPercent.toFixed(1)}% volatility`);

    // Sharpe ratio insight
    const sharpeRatio = result.performanceMetrics.sharpe_ratio || (result.expectedReturn / result.expectedRisk);
    if (sharpeRatio > 1) {
      insights.push('Excellent risk-adjusted performance (Sharpe ratio > 1.0)');
    } else if (sharpeRatio > 0.5) {
      insights.push('Good risk-adjusted performance (Sharpe ratio > 0.5)');
    } else {
      insights.push('Below average risk-adjusted performance');
    }

    // Diversification insights
    const weights = Object.values(result.optimalWeights);
    const maxWeight = Math.max(...weights);
    const effectiveAssets = 1 / weights.reduce((sum, w) => sum + w * w, 0);

    if (maxWeight > 0.5) {
      insights.push('Portfolio is concentrated in few assets (consider diversification)');
    } else if (effectiveAssets > result.tickers.length * 0.8) {
      insights.push('Portfolio is well diversified across all assets');
    }

    // Method-specific insights
    if (result.optimizationMethod === 'risk_parity') {
      insights.push('Risk parity approach ensures equal risk contribution from each asset');
    } else if (result.optimizationMethod === 'maximum_sharpe') {
      insights.push('Maximizes risk-adjusted returns (Sharpe ratio optimization)');
    } else if (result.optimizationMethod === 'minimum_variance') {
      insights.push('Minimizes portfolio volatility with potential lower returns');
    }

    return insights;
  }, [result]);

  if (!result) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <Card.Body>
          <div className={styles.emptyState}>
            <p>No optimization results available.</p>
            <p>Run portfolio optimization to see results here.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'weights', label: 'Asset Weights' },
    { key: 'metrics', label: 'Performance Metrics' },
    { key: 'insights', label: 'Insights' },
  ];

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <Card.Header>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3>Optimization Results</h3>
            <Badge variant="primary">
              {formatMethodName(result.optimizationMethod)}
            </Badge>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowInsights(true)}
            >
              View Insights
            </Button>

            <Button
              variant="outline"
              size="small"
              onClick={() => onCompareOptimization?.(result)}
            >
              Compare
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={() => onSaveOptimization?.(result)}
            >
              Save
            </Button>

            <Button
              variant="primary"
              size="small"
              onClick={() => setShowCreateModal(true)}
            >
              Create Portfolio
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
          className={styles.tabs}
        />

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Expected Return</span>
                  <span className={`${styles.statValue} ${styles.positive}`}>
                    {formatPercentage(result.expectedReturn, 2)}
                  </span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Expected Risk</span>
                  <span className={styles.statValue}>
                    {formatPercentage(result.expectedRisk, 2)}
                  </span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Sharpe Ratio</span>
                  <span className={`${styles.statValue} ${
                    (result.performanceMetrics.sharpe_ratio || 0) > 1 ? styles.positive : styles.neutral
                  }`}>
                    {formatNumber(result.performanceMetrics.sharpe_ratio || 0, 3)}
                  </span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Assets</span>
                  <span className={styles.statValue}>
                    {result.tickers.length}
                  </span>
                </div>
              </div>

              {/* Allocation Chart */}
              <div className={styles.chartSection}>
                <h4>Asset Allocation</h4>
                <div className={styles.chartContainer}>
                  <PieChart
                    data={pieChartData}
                    height={300}
                    showLabels={true}
                    showLegend={true}
                    centerLabel={
                      <div className={styles.centerLabel}>
                        <div className={styles.centerValue}>
                          {formatPercentage(result.expectedReturn, 1)}
                        </div>
                        <div className={styles.centerDescription}>
                          Expected Return
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Top Holdings */}
              <div className={styles.topHoldings}>
                <h4>Top Holdings</h4>
                <div className={styles.holdingsList}>
                  {pieChartData.slice(0, 5).map((holding, index) => (
                    <div key={holding.name} className={styles.holdingItem}>
                      <span className={styles.holdingRank}>#{index + 1}</span>
                      <span className={styles.holdingName}>{holding.name}</span>
                      <span className={styles.holdingWeight}>
                        {formatPercentage(holding.value, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weights' && (
            <div className={styles.weightsTab}>
              <WeightsTable
                weights={weightsData}
                editable={false}
                showConstraints={false}
                showRebalancing={false}
              />
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className={styles.metricsTab}>
              <div className={styles.metricsGrid}>
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricLabel}>{metric.label}</span>
                      <Badge
                        variant={
                          metric.status === 'positive' ? 'success' :
                          metric.status === 'negative' ? 'danger' : 'outline'
                        }
                        size="small"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className={styles.metricValue}>{metric.value}</div>
                    <div className={styles.metricDescription}>{metric.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className={styles.insightsTab}>
              <div className={styles.insightsList}>
                {insights.map((insight, index) => (
                  <div key={index} className={styles.insightItem}>
                    <div className={styles.insightIcon}>💡</div>
                    <div className={styles.insightText}>{insight}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Create Portfolio Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Portfolio from Optimization"
        size="medium"
      >
        <div className={styles.createPortfolioModal}>
          <p>Create a new portfolio using the optimized asset weights?</p>

          <div className={styles.modalStats}>
            <div><strong>Expected Return:</strong> {formatPercentage(result.expectedReturn, 2)}</div>
            <div><strong>Expected Risk:</strong> {formatPercentage(result.expectedRisk, 2)}</div>
            <div><strong>Assets:</strong> {result.tickers.length}</div>
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onCreatePortfolio?.(result.optimalWeights);
                setShowCreateModal(false);
              }}
              fullWidth
            >
              Create Portfolio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Insights Modal */}
      <Modal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        title="Optimization Insights"
        size="large"
      >
        <div className={styles.insightsModal}>
          {insights.map((insight, index) => (
            <div key={index} className={styles.insightCard}>
              <div className={styles.insightIcon}>📊</div>
              <div className={styles.insightContent}>
                <p>{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
};

// Helper functions
function formatMetricName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function getMetricDescription(key: string): string {
  const descriptions: Record<string, string> = {
    sharpe_ratio: 'Risk-adjusted return measure',
    sortino_ratio: 'Downside risk-adjusted return',
    calmar_ratio: 'Return to maximum drawdown ratio',
    information_ratio: 'Active return per unit of tracking error',
    treynor_ratio: 'Return per unit of systematic risk',
    jensen_alpha: 'Risk-adjusted excess return',
  };

  return descriptions[key] || 'Performance metric';
}

function getMetricStatus(key: string, value: any): 'positive' | 'negative' | 'neutral' {
  if (typeof value !== 'number') return 'neutral';

  const thresholds: Record<string, { good: number; poor: number }> = {
    sharpe_ratio: { good: 1.0, poor: 0.5 },
    sortino_ratio: { good: 1.0, poor: 0.5 },
    calmar_ratio: { good: 0.5, poor: 0.2 },
    information_ratio: { good: 0.5, poor: 0.2 },
  };

  const threshold = thresholds[key];
  if (!threshold) return 'neutral';

  if (value >= threshold.good) return 'positive';
  if (value <= threshold.poor) return 'negative';
  return 'neutral';
}

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