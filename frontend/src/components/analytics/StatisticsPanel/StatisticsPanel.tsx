/**
 * StatisticsPanel Component
 * Comprehensive statistical analysis panel with distribution metrics
 */
import React, { useMemo } from 'react';
import { Card } from '../../common/Card/Card';
import { MetricsTable, MetricItem } from '../MetricsTable/MetricsTable';
import { MetricsCard, MetricsCardData } from '../MetricsCard/MetricsCard';
import { LineChart, LineChartSeries } from '../../charts/LineChart/LineChart';
import { PieChart, PieChartDataPoint } from '../../charts/PieChart/PieChart';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import {
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse
} from '../../../types/analytics';
import styles from './StatisticsPanel.module.css';

interface StatisticsPanelProps {
  performanceMetrics?: PerformanceMetricsResponse | null;
  riskMetrics?: RiskMetricsResponse | null;
  returns?: ReturnsResponse | null;
  loading?: boolean;
  title?: string;
  showDistribution?: boolean;
  showAdvanced?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  performanceMetrics,
  riskMetrics,
  returns,
  loading = false,
  title = 'Statistical Analysis',
  showDistribution = true,
  showAdvanced = true,
  className,
  'data-testid': testId,
}) => {
  // Calculate additional statistics from returns data
  const calculatedStats = useMemo(() => {
    if (!returns || !returns.returns) return null;

    const portfolioKey = Object.keys(returns.returns)[0];
    const returnsData = returns.returns[portfolioKey];

    if (!returnsData || returnsData.length === 0) return null;

    // Filter out null/undefined values and convert to numbers
    const validReturns = returnsData.filter(r => r !== null && r !== undefined).map(Number);

    if (validReturns.length === 0) return null;

    // Basic statistics
    const mean = validReturns.reduce((sum, r) => sum + r, 0) / validReturns.length;
    const sortedReturns = [...validReturns].sort((a, b) => a - b);

    // Percentiles
    const getPercentile = (arr: number[], percentile: number) => {
      const index = (percentile / 100) * (arr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      if (upper >= arr.length) return arr[arr.length - 1];
      if (lower < 0) return arr[0];

      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    // Variance and standard deviation
    const variance = validReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / validReturns.length;
    const standardDeviation = Math.sqrt(variance);

    // Skewness
    const skewness = validReturns.reduce((sum, r) => sum + Math.pow((r - mean) / standardDeviation, 3), 0) / validReturns.length;

    // Kurtosis
    const kurtosis = validReturns.reduce((sum, r) => sum + Math.pow((r - mean) / standardDeviation, 4), 0) / validReturns.length - 3;

    // Win/Loss statistics
    const positiveReturns = validReturns.filter(r => r > 0);
    const negativeReturns = validReturns.filter(r => r < 0);
    const winRate = positiveReturns.length / validReturns.length;
    const avgWin = positiveReturns.length > 0 ? positiveReturns.reduce((sum, r) => sum + r, 0) / positiveReturns.length : 0;
    const avgLoss = negativeReturns.length > 0 ? negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length : 0;
    const winLossRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    return {
      mean,
      median: getPercentile(sortedReturns, 50),
      mode: null, // Would need more complex calculation
      standardDeviation,
      variance,
      skewness,
      kurtosis,
      minimum: Math.min(...validReturns),
      maximum: Math.max(...validReturns),
      range: Math.max(...validReturns) - Math.min(...validReturns),
      q1: getPercentile(sortedReturns, 25),
      q3: getPercentile(sortedReturns, 75),
      iqr: getPercentile(sortedReturns, 75) - getPercentile(sortedReturns, 25),
      percentile5: getPercentile(sortedReturns, 5),
      percentile95: getPercentile(sortedReturns, 95),
      winRate,
      avgWin,
      avgLoss,
      winLossRatio,
      count: validReturns.length,
    };
  }, [returns]);

  // Key statistics cards
  const keyStatsData = useMemo((): MetricsCardData[] => {
    const cards: MetricsCardData[] = [];

    if (calculatedStats) {
      cards.push({
        title: 'Mean Return',
        value: calculatedStats.mean,
        type: 'percentage',
        precision: 3,
        trend: calculatedStats.mean > 0 ? 'up' : 'down',
        description: 'Average daily return',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </svg>
        ),
      });

      cards.push({
        title: 'Win Rate',
        value: calculatedStats.winRate,
        type: 'percentage',
        precision: 1,
        trend: calculatedStats.winRate > 0.5 ? 'up' : 'down',
        description: 'Percentage of positive return periods',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        ),
      });
    }

    if (riskMetrics) {
      cards.push({
        title: 'Volatility',
        value: riskMetrics.volatility,
        type: 'percentage',
        precision: 2,
        trend: riskMetrics.volatility < 0.15 ? 'up' : 'down',
        description: 'Annualized volatility',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        ),
      });

      cards.push({
        title: 'Max Drawdown',
        value: riskMetrics.maxDrawdown,
        type: 'percentage',
        precision: 2,
        trend: Math.abs(riskMetrics.maxDrawdown) < 0.1 ? 'up' : 'down',
        description: 'Maximum peak-to-trough decline',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
        ),
      });
    }

    return cards;
  }, [calculatedStats, riskMetrics]);

  // Detailed statistics table
  const detailedStatsData = useMemo((): MetricItem[] => {
    const metrics: MetricItem[] = [];

    if (calculatedStats) {
      // Central Tendency
      metrics.push(
        {
          name: 'Mean',
          value: calculatedStats.mean,
          type: 'percentage',
          precision: 4,
          category: 'Central Tendency',
          description: 'Arithmetic average of returns'
        },
        {
          name: 'Median',
          value: calculatedStats.median,
          type: 'percentage',
          precision: 4,
          category: 'Central Tendency',
          description: 'Middle value when returns are sorted'
        }
      );

      // Dispersion
      metrics.push(
        {
          name: 'Standard Deviation',
          value: calculatedStats.standardDeviation,
          type: 'percentage',
          precision: 4,
          category: 'Dispersion',
          description: 'Measure of volatility'
        },
        {
          name: 'Variance',
          value: calculatedStats.variance,
          type: 'number',
          precision: 6,
          category: 'Dispersion',
          description: 'Square of standard deviation'
        },
        {
          name: 'Range',
          value: calculatedStats.range,
          type: 'percentage',
          precision: 4,
          category: 'Dispersion',
          description: 'Difference between max and min'
        },
        {
          name: 'Interquartile Range',
          value: calculatedStats.iqr,
          type: 'percentage',
          precision: 4,
          category: 'Dispersion',
          description: 'Q3 minus Q1'
        }
      );

      // Shape
      metrics.push(
        {
          name: 'Skewness',
          value: calculatedStats.skewness,
          type: 'ratio',
          precision: 3,
          category: 'Distribution Shape',
          description: 'Measure of asymmetry'
        },
        {
          name: 'Kurtosis',
          value: calculatedStats.kurtosis,
          type: 'ratio',
          precision: 3,
          category: 'Distribution Shape',
          description: 'Measure of tail thickness'
        }
      );

      // Extremes
      metrics.push(
        {
          name: 'Minimum',
          value: calculatedStats.minimum,
          type: 'percentage',
          precision: 4,
          category: 'Extremes',
          description: 'Worst single period return'
        },
        {
          name: 'Maximum',
          value: calculatedStats.maximum,
          type: 'percentage',
          precision: 4,
          category: 'Extremes',
          description: 'Best single period return'
        },
        {
          name: '5th Percentile',
          value: calculatedStats.percentile5,
          type: 'percentage',
          precision: 4,
          category: 'Extremes',
          description: '95% of returns are above this value'
        },
        {
          name: '95th Percentile',
          value: calculatedStats.percentile95,
          type: 'percentage',
          precision: 4,
          category: 'Extremes',
          description: '95% of returns are below this value'
        }
      );

      // Win/Loss Analysis
      metrics.push(
        {
          name: 'Win Rate',
          value: calculatedStats.winRate,
          type: 'percentage',
          precision: 1,
          category: 'Win/Loss Analysis',
          description: 'Percentage of positive periods'
        },
        {
          name: 'Average Win',
          value: calculatedStats.avgWin,
          type: 'percentage',
          precision: 4,
          category: 'Win/Loss Analysis',
          description: 'Average positive return'
        },
        {
          name: 'Average Loss',
          value: calculatedStats.avgLoss,
          type: 'percentage',
          precision: 4,
          category: 'Win/Loss Analysis',
          description: 'Average negative return'
        },
        {
          name: 'Win/Loss Ratio',
          value: calculatedStats.winLossRatio,
          type: 'ratio',
          precision: 2,
          category: 'Win/Loss Analysis',
          description: 'Ratio of average win to average loss'
        }
      );
    }

    if (riskMetrics) {
      metrics.push(
        {
          name: 'Value at Risk (95%)',
          value: riskMetrics.var95,
          type: 'percentage',
          precision: 3,
          category: 'Risk Metrics',
          description: 'Expected loss at 95% confidence level'
        },
        {
          name: 'Conditional VaR (95%)',
          value: riskMetrics.cvar95,
          type: 'percentage',
          precision: 3,
          category: 'Risk Metrics',
          description: 'Expected loss beyond VaR threshold'
        }
      );

      if (riskMetrics.downsideDeviation) {
        metrics.push({
          name: 'Downside Deviation',
          value: riskMetrics.downsideDeviation,
          type: 'percentage',
          precision: 3,
          category: 'Risk Metrics',
          description: 'Volatility of negative returns only'
        });
      }
    }

    return metrics;
  }, [calculatedStats, riskMetrics]);

  // Distribution chart data
  const distributionData = useMemo(() => {
    if (!calculatedStats) return [];

    return [
      { name: 'Positive Returns', value: calculatedStats.winRate * 100, color: COLORS.POSITIVE },
      { name: 'Negative Returns', value: (1 - calculatedStats.winRate) * 100, color: COLORS.NEGATIVE },
    ];
  }, [calculatedStats]);

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      {/* Key Statistics Cards */}
      <div className={styles.keyStats}>
        <h3 className={styles.sectionTitle}>Key Statistics</h3>
        <div className={styles.statsGrid}>
          {keyStatsData.map((stat, index) => (
            <MetricsCard
              key={index}
              data={stat}
              size="medium"
              showTrend={true}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Distribution Chart */}
      {showDistribution && distributionData.length > 0 && (
        <Card title="Return Distribution" className={styles.distributionCard}>
          <div className={styles.distributionContent}>
            <PieChart
              data={distributionData}
              height={300}
              innerRadius={50}
              showLabels={true}
              showLegend={true}
              loading={loading}
            />
          </div>
        </Card>
      )}

      {/* Detailed Statistics Table */}
      {showAdvanced && detailedStatsData.length > 0 && (
        <MetricsTable
          metrics={detailedStatsData}
          title={title}
          grouped={true}
          loading={loading}
          className={styles.detailedStats}
        />
      )}
    </div>
  );
};

export default StatisticsPanel;