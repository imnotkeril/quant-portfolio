/**
 * Analytics selectors
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selector
export const selectAnalyticsState = (state: RootState) => state.analytics;

// Performance metrics selectors
export const selectPerformanceMetrics = createSelector(
  selectAnalyticsState,
  (state) => state.performanceMetrics
);

export const selectPerformanceLoading = createSelector(
  selectAnalyticsState,
  (state) => state.performanceLoading
);

export const selectPerformanceError = createSelector(
  selectAnalyticsState,
  (state) => state.performanceError
);

// Risk metrics selectors
export const selectRiskMetrics = createSelector(
  selectAnalyticsState,
  (state) => state.riskMetrics
);

export const selectRiskLoading = createSelector(
  selectAnalyticsState,
  (state) => state.riskLoading
);

export const selectRiskError = createSelector(
  selectAnalyticsState,
  (state) => state.riskError
);

// Returns selectors
export const selectReturns = createSelector(
  selectAnalyticsState,
  (state) => state.returns
);

export const selectReturnsLoading = createSelector(
  selectAnalyticsState,
  (state) => state.returnsLoading
);

export const selectReturnsError = createSelector(
  selectAnalyticsState,
  (state) => state.returnsError
);

// Cumulative returns selectors
export const selectCumulativeReturns = createSelector(
  selectAnalyticsState,
  (state) => state.cumulativeReturns
);

export const selectCumulativeReturnsLoading = createSelector(
  selectAnalyticsState,
  (state) => state.cumulativeReturnsLoading
);

export const selectCumulativeReturnsError = createSelector(
  selectAnalyticsState,
  (state) => state.cumulativeReturnsError
);

// Drawdowns selectors
export const selectDrawdowns = createSelector(
  selectAnalyticsState,
  (state) => state.drawdowns
);

export const selectDrawdownsLoading = createSelector(
  selectAnalyticsState,
  (state) => state.drawdownsLoading
);

export const selectDrawdownsError = createSelector(
  selectAnalyticsState,
  (state) => state.drawdownsError
);

// Rolling metrics selectors
export const selectRollingMetrics = createSelector(
  selectAnalyticsState,
  (state) => state.rollingMetrics
);

export const selectRollingMetricsLoading = createSelector(
  selectAnalyticsState,
  (state) => state.rollingMetricsLoading
);

export const selectRollingMetricsError = createSelector(
  selectAnalyticsState,
  (state) => state.rollingMetricsError
);

// Comparison selectors
export const selectComparison = createSelector(
  selectAnalyticsState,
  (state) => state.comparison
);

export const selectComparisonLoading = createSelector(
  selectAnalyticsState,
  (state) => state.comparisonLoading
);

export const selectComparisonError = createSelector(
  selectAnalyticsState,
  (state) => state.comparisonError
);

// UI state selectors
export const selectSelectedPortfolioId = createSelector(
  selectAnalyticsState,
  (state) => state.selectedPortfolioId
);

export const selectSelectedBenchmark = createSelector(
  selectAnalyticsState,
  (state) => state.selectedBenchmark
);

export const selectSelectedTimeframe = createSelector(
  selectAnalyticsState,
  (state) => state.selectedTimeframe
);

export const selectSelectedMetrics = createSelector(
  selectAnalyticsState,
  (state) => state.selectedMetrics
);

export const selectAnalysisParams = createSelector(
  selectAnalyticsState,
  (state) => state.analysisParams
);

// Loading state selectors
export const selectAnalyticsLoading = createSelector(
  selectAnalyticsState,
  (state) => ({
    performance: state.performanceLoading,
    risk: state.riskLoading,
    returns: state.returnsLoading,
    cumulativeReturns: state.cumulativeReturnsLoading,
    drawdowns: state.drawdownsLoading,
    rollingMetrics: state.rollingMetricsLoading,
    comparison: state.comparisonLoading,
  })
);

export const selectAnyAnalyticsLoading = createSelector(
  selectAnalyticsLoading,
  (loading) => Object.values(loading).some(Boolean)
);

// Error state selectors
export const selectAnalyticsErrors = createSelector(
  selectAnalyticsState,
  (state) => ({
    performance: state.performanceError,
    risk: state.riskError,
    returns: state.returnsError,
    cumulativeReturns: state.cumulativeReturnsError,
    drawdowns: state.drawdownsError,
    rollingMetrics: state.rollingMetricsError,
    comparison: state.comparisonError,
  })
);

export const selectAnyAnalyticsError = createSelector(
  selectAnalyticsErrors,
  (errors) => Object.values(errors).some(Boolean)
);

// Combined data selectors
export const selectAnalyticsData = createSelector(
  selectAnalyticsState,
  (state) => ({
    performanceMetrics: state.performanceMetrics,
    riskMetrics: state.riskMetrics,
    returns: state.returns,
    cumulativeReturns: state.cumulativeReturns,
    drawdowns: state.drawdowns,
    rollingMetrics: state.rollingMetrics,
    comparison: state.comparison,
  })
);

export const selectHasAnalyticsData = createSelector(
  selectAnalyticsData,
  (data) => Object.values(data).some(value => value !== null)
);

// Computed selectors
export const selectPortfolioSummary = createSelector(
  [selectPerformanceMetrics, selectRiskMetrics],
  (performance, risk) => {
    if (!performance || !risk) return null;

    return {
      totalReturn: performance.totalReturn,
      annualizedReturn: performance.annualizedReturn,
      volatility: risk.volatility,
      maxDrawdown: risk.maxDrawdown,
      sharpeRatio: performance.performanceMetrics?.sharpeRatio || 0,
      var95: risk.var95,
    };
  }
);

export const selectBenchmarkComparison = createSelector(
  selectPerformanceMetrics,
  (performance) => {
    if (!performance?.benchmarkComparison) return null;

    return performance.benchmarkComparison;
  }
);