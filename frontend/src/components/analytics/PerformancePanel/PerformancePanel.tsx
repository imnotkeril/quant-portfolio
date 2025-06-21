/**
 * PerformancePanel Component
 * Comprehensive panel displaying portfolio performance metrics and charts
 */
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { MetricsCard, MetricsCardData } from '../MetricsCard/MetricsCard';
import { MetricsTable, MetricItem } from '../MetricsTable/MetricsTable';
import { ReturnsChart } from '../ReturnsChart/ReturnsChart';
import { useAnalytics } from '../../../hooks/useAnalytics';
import {
  selectPerformanceMetrics,
  selectPerformanceLoading,
  selectCumulativeReturns,
  selectReturns,
  selectSelectedTimeframe,
  selectSelectedBenchmark,
} from '../../../store/analytics/selectors';
import { setSelectedTimeframe, setSelectedBenchmark } from '../../../store/analytics/reducer';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import styles from './PerformancePanel.module.css';

interface PerformancePanelProps {
  portfolioId: string;
  showAdvancedMetrics?: boolean;
  showChart?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({
  portfolioId,
  showAdvancedMetrics = true,
  showChart = true,
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const analytics = useAnalytics();

  const performanceMetrics = useSelector(selectPerformanceMetrics);
  const performanceLoading = useSelector(selectPerformanceLoading);
  const cumulativeReturns = useSelector(selectCumulativeReturns);
  const returns = useSelector(selectReturns);
  const selectedTimeframe = useSelector(selectSelectedTimeframe);
  const selectedBenchmark = useSelector(selectSelectedBenchmark);

  // Load performance metrics on mount and when dependencies change
  useEffect(() => {
    if (portfolioId) {
      const { startDate, endDate } = analytics.getDefaultDateRange();
      analytics.calculatePerformanceMetrics({
        portfolioId,
        startDate,
        endDate,
        benchmark: selectedBenchmark || undefined,
      });
    }
  }, [portfolioId, selectedBenchmark, analytics]);

  // Main performance metrics cards data
  const mainMetricsData = useMemo((): MetricsCardData[] => {
    if (!performanceMetrics) return [];

    return [
      {
        title: 'Total Return',
        value: performanceMetrics.totalReturn,
        type: 'percentage' as const,
        precision: 2,
        benchmark: performanceMetrics.benchmarkComparison?.totalReturn,
        trend: performanceMetrics.totalReturn > 0 ? 'up' : 'down',
        description: 'Overall portfolio return for the selected period',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </svg>
        ),
      },
      {
        title: 'Annualized Return',
        value: performanceMetrics.annualizedReturn,
        type: 'percentage' as const,
        precision: 2,
        benchmark: performanceMetrics.benchmarkComparison?.annualizedReturn,
        trend: performanceMetrics.annualizedReturn > 0 ? 'up' : 'down',
        description: 'Annualized return based on the selected period',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
          </svg>
        ),
      },
      {
        title: 'Sharpe Ratio',
        value: performanceMetrics.ratioMetrics?.sharpeRatio || 0,
        type: 'ratio' as const,
        precision: 2,
        benchmark: performanceMetrics.benchmarkComparison?.sharpeRatio,
        trend: (performanceMetrics.ratioMetrics?.sharpeRatio || 0) > 1 ? 'up' : 'neutral',
        description: 'Risk-adjusted return measure',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="m21 12-6-3-6 3-6-3"/>
          </svg>
        ),
      },
      {
        title: 'Alpha',
        value: performanceMetrics.ratioMetrics?.alpha || 0,
        type: 'percentage' as const,
        precision: 2,
        benchmark: 0,
        trend: (performanceMetrics.ratioMetrics?.alpha || 0) > 0 ? 'up' : 'down',
        description: 'Excess return over benchmark',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
          </svg>
        ),
      },
    ];
  }, [performanceMetrics]);

  // Advanced metrics table data
  const advancedMetricsData = useMemo((): MetricItem[] => {
    if (!performanceMetrics) return [];

    const metrics: MetricItem[] = [];

    // Period returns
    if (performanceMetrics.periodReturns) {
      Object.entries(performanceMetrics.periodReturns).forEach(([period, value]) => {
        metrics.push({
          name: `${period} Return`,
          value,
          type: 'percentage',
          precision: 2,
          category: 'Period Returns',
        });
      });
    }

    // Ratio metrics
    if (performanceMetrics.ratioMetrics) {
      Object.entries(performanceMetrics.ratioMetrics).forEach(([name, value]) => {
        metrics.push({
          name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value,
          type: name.includes('Ratio') || name.includes('Beta') ? 'ratio' : 'percentage',
          precision: 2,
          category: 'Risk-Adjusted Metrics',
        });
      });
    }

    return metrics;
  }, [performanceMetrics]);

  const handleTimeframeChange = (value: string | number | (string | number)[]) => {
  const timeframe = Array.isArray(value) ? value[0] : value;
  const stringTimeframe = String(timeframe);

  dispatch(setSelectedTimeframe(stringTimeframe));

  const ranges = analytics.getPredefinedTimeRanges();
  const selectedRange = ranges[stringTimeframe];

  if (selectedRange) {
    analytics.calculatePerformanceMetrics({
      portfolioId,
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
      benchmark: selectedBenchmark || undefined,
    });
  }
};

  const handleBenchmarkChange = (value: string | number | (string | number)[]) => {
  const benchmark = Array.isArray(value) ? value[0] : value;
  const stringBenchmark = String(benchmark);

  const newBenchmark = stringBenchmark === 'none' ? null : stringBenchmark;
  dispatch(setSelectedBenchmark(newBenchmark));
};

  const timeframeOptions = [
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: '2Y', label: '2Y' },
    { value: '5Y', label: '5Y' },
    { value: 'YTD', label: 'YTD' },
  ];

  const benchmarkOptions = [
    { value: 'none', label: 'No Benchmark' },
    { value: 'SPY', label: 'S&P 500 (SPY)' },
    { value: 'VTI', label: 'Total Stock Market (VTI)' },
    { value: 'BND', label: 'Total Bond Market (BND)' },
    { value: 'VXUS', label: 'International Stocks (VXUS)' },
  ];

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      {/* Controls */}
      <Card className={styles.controlsCard}>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Time Period:</label>
            <Select
              value={selectedTimeframe}
              onChange={handleTimeframeChange}
              options={timeframeOptions}
              size="small"
              className={styles.timeframeSelect}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Benchmark:</label>
            <Select
              value={selectedBenchmark || 'none'}
              onChange={handleBenchmarkChange}
              options={benchmarkOptions}
              size="small"
              className={styles.benchmarkSelect}
            />
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={() => analytics.clearAnalytics()}
            className={styles.refreshButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
            </svg>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Main Metrics Cards */}
      <div className={styles.metricsGrid}>
        {mainMetricsData.map((metric, index) => (
          <MetricsCard
            key={index}
            data={metric}
            size="medium"
            showTrend={true}
            showBenchmark={!!selectedBenchmark}
            loading={performanceLoading}
          />
        ))}
      </div>

      {/* Returns Chart */}
      {showChart && (
        <ReturnsChart
          returns={returns}
          cumulativeReturns={cumulativeReturns}
          title="Portfolio Returns"
          height={350}
          loading={performanceLoading}
          showBenchmark={!!selectedBenchmark}
          className={styles.chartContainer}
        />
      )}

      {/* Advanced Metrics Table */}
      {showAdvancedMetrics && advancedMetricsData.length > 0 && (
        <MetricsTable
          metrics={advancedMetricsData}
          title="Detailed Performance Metrics"
          grouped={true}
          showBenchmark={!!selectedBenchmark}
          loading={performanceLoading}
          className={styles.advancedMetrics}
        />
      )}
    </div>
  );
};

export default PerformancePanel;