/**
 * Optimization selectors
 */
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { OptimizationState } from './types';
import { OptimizationResponse, EfficientFrontierPoint } from '../../types/optimization';

/**
 * Base selector
 */
const selectOptimizationState = (state: RootState): OptimizationState => state.optimization;

/**
 * Current optimization selectors
 */
export const selectCurrentOptimization = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.currentOptimization
);

export const selectCurrentEfficientFrontier = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.currentEfficientFrontier
);

/**
 * Loading state selectors
 */
export const selectIsOptimizing = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.isOptimizing
);

export const selectIsCalculatingFrontier = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.isCalculatingFrontier
);

export const selectIsLoadingHistory = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.isLoadingHistory
);

export const selectIsComparing = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.isComparing
);

export const selectIsAnyOptimizationLoading = createSelector(
  [selectIsOptimizing, selectIsCalculatingFrontier, selectIsLoadingHistory, selectIsComparing],
  (isOptimizing, isCalculatingFrontier, isLoadingHistory, isComparing) =>
    isOptimizing || isCalculatingFrontier || isLoadingHistory || isComparing
);

/**
 * Error state selectors
 */
export const selectOptimizationError = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.optimizationError
);

export const selectFrontierError = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.frontierError
);

export const selectHistoryError = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.historyError
);

export const selectComparisonError = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.comparisonError
);

export const selectHasAnyOptimizationError = createSelector(
  [selectOptimizationError, selectFrontierError, selectHistoryError, selectComparisonError],
  (optimizationError, frontierError, historyError, comparisonError) =>
    !!optimizationError || !!frontierError || !!historyError || !!comparisonError
);

/**
 * Data selectors
 */
export const selectOptimizationHistory = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.optimizationHistory
);

export const selectComparisonResults = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.comparisonResults
);

/**
 * UI state selectors
 */
export const selectSelectedMethod = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.selectedMethod
);

export const selectConstraints = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.constraints
);

export const selectAdvancedOptions = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.advancedOptions
);

/**
 * Cache selectors
 */
export const selectCachedOptimizations = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.cachedOptimizations
);

export const selectCachedFrontiers = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.cachedFrontiers
);

export const selectLastUpdated = createSelector(
  [selectOptimizationState],
  (optimization) => optimization.lastUpdated
);

/**
 * Computed selectors
 */
export const selectOptimalWeights = createSelector(
  [selectCurrentOptimization],
  (optimization) => optimization?.optimalWeights || {}
);

export const selectOptimizationMetrics = createSelector(
  [selectCurrentOptimization],
  (optimization) => {
    if (!optimization) return null;

    return {
      expectedReturn: optimization.expectedReturn,
      expectedRisk: optimization.expectedRisk,
      ...optimization.performanceMetrics,
    };
  }
);

export const selectEfficientFrontierData = createSelector(
  [selectCurrentEfficientFrontier],
  (frontier) => {
    if (!frontier) return [];

    return frontier.efficientFrontier.map((point: EfficientFrontierPoint) => ({
      risk: point.risk * 100, // Convert to percentage
      return: point.return * 100, // Convert to percentage
      sharpe: point.sharpe || 0,
      weights: point.weights,
    }));
  }
);

export const selectOptimizationComparison = createSelector(
  [selectComparisonResults],
  (results) => {
    if (results.length < 2) return null;

    return results.map((result, index) => ({
      name: `Optimization ${index + 1}`,
      method: result.optimizationMethod,
      expectedReturn: result.expectedReturn * 100,
      expectedRisk: result.expectedRisk * 100,
      sharpeRatio: result.performanceMetrics.sharpe_ratio || 0,
      weights: result.optimalWeights,
    }));
  }
);

export const selectBestOptimization = createSelector(
  [selectOptimizationHistory],
  (history) => {
    if (history.length === 0) return null;

    // Find optimization with highest Sharpe ratio
    return history.reduce((best, current) => {
      const bestSharpe = best.performanceMetrics.sharpe_ratio || 0;
      const currentSharpe = current.performanceMetrics.sharpe_ratio || 0;

      return currentSharpe > bestSharpe ? current : best;
    });
  }
);

export const selectOptimizationSummary = createSelector(
  [selectCurrentOptimization, selectCurrentEfficientFrontier, selectOptimizationHistory],
  (current, frontier, history) => ({
    hasCurrentOptimization: !!current,
    hasEfficientFrontier: !!frontier,
    historyCount: history.length,
    currentMethod: current?.optimizationMethod || null,
    currentSharpeRatio: current?.performanceMetrics.sharpe_ratio || null,
    frontierPointsCount: frontier?.efficientFrontier.length || 0,
  })
);

/**
 * Performance selectors
 */
export const selectOptimizationPerformanceMetrics = createSelector(
  [selectCurrentOptimization],
  (optimization) => {
    if (!optimization) return {};

    const metrics = optimization.performanceMetrics;

    return {
      'Expected Return': (optimization.expectedReturn * 100).toFixed(2) + '%',
      'Expected Risk': (optimization.expectedRisk * 100).toFixed(2) + '%',
      'Sharpe Ratio': (metrics.sharpe_ratio || 0).toFixed(3),
      'Information Ratio': (metrics.information_ratio || 0).toFixed(3),
      'Treynor Ratio': (metrics.treynor_ratio || 0).toFixed(3),
      'Jensen Alpha': (metrics.jensen_alpha || 0).toFixed(3),
    };
  }
);

export const selectWeightAllocation = createSelector(
  [selectOptimalWeights],
  (weights) => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

    return Object.entries(weights)
      .map(([ticker, weight]) => ({
        ticker,
        weight,
        percentage: ((weight / totalWeight) * 100).toFixed(2) + '%',
      }))
      .sort((a, b) => b.weight - a.weight);
  }
);

export const selectOptimizationInsights = createSelector(
  [selectCurrentOptimization, selectBestOptimization],
  (current, best) => {
    if (!current) return [];

    const insights: string[] = [];

    // Risk-return insights
    const returnPercent = (current.expectedReturn * 100).toFixed(2);
    const riskPercent = (current.expectedRisk * 100).toFixed(2);
    insights.push(`Expected annual return: ${returnPercent}%`);
    insights.push(`Expected annual risk: ${riskPercent}%`);

    // Sharpe ratio insight
    const sharpeRatio = current.performanceMetrics.sharpe_ratio || 0;
    if (sharpeRatio > 1) {
      insights.push('Excellent risk-adjusted performance (Sharpe > 1.0)');
    } else if (sharpeRatio > 0.5) {
      insights.push('Good risk-adjusted performance (Sharpe > 0.5)');
    } else {
      insights.push('Below average risk-adjusted performance');
    }

    // Diversification insight
    const weights = Object.values(current.optimalWeights);
    const maxWeight = Math.max(...weights);
    if (maxWeight > 0.5) {
      insights.push('Portfolio is concentrated in few assets');
    } else if (maxWeight < 0.2) {
      insights.push('Portfolio is well diversified');
    }

    // Comparison with best
    if (best && current !== best) {
      const currentSharpe = current.performanceMetrics.sharpe_ratio || 0;
      const bestSharpe = best.performanceMetrics.sharpe_ratio || 0;
      const improvement = ((bestSharpe - currentSharpe) / currentSharpe * 100).toFixed(1);

      if (bestSharpe > currentSharpe) {
        insights.push(`Historical best optimization had ${improvement}% better Sharpe ratio`);
      }
    }

    return insights;
  }
);