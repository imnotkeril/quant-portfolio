/**
 * Comparison store selectors
 */
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { ComparisonState } from './types';

/**
 * Base comparison selector
 */
export const selectComparison = (state: RootState): ComparisonState => state.comparison;

/**
 * Loading state selectors
 */
export const selectComparisonLoading = createSelector(
  selectComparison,
  (comparison) => comparison.comparisonLoading
);

export const selectCompositionLoading = createSelector(
  selectComparison,
  (comparison) => comparison.compositionLoading
);

export const selectPerformanceLoading = createSelector(
  selectComparison,
  (comparison) => comparison.performanceLoading
);

export const selectRiskLoading = createSelector(
  selectComparison,
  (comparison) => comparison.riskLoading
);

export const selectSectorLoading = createSelector(
  selectComparison,
  (comparison) => comparison.sectorLoading
);

export const selectScenarioLoading = createSelector(
  selectComparison,
  (comparison) => comparison.scenarioLoading
);

export const selectDifferentialLoading = createSelector(
  selectComparison,
  (comparison) => comparison.differentialLoading
);

export const selectAnyComparisonLoading = createSelector(
  selectComparisonLoading,
  selectCompositionLoading,
  selectPerformanceLoading,
  selectRiskLoading,
  selectSectorLoading,
  selectScenarioLoading,
  selectDifferentialLoading,
  (comparisonLoading, compositionLoading, performanceLoading, riskLoading, sectorLoading, scenarioLoading, differentialLoading) =>
    comparisonLoading || compositionLoading || performanceLoading || riskLoading || sectorLoading || scenarioLoading || differentialLoading
);

/**
 * Data selectors
 */
export const selectComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.comparisons
);

export const selectCompositionComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.compositionComparisons
);

export const selectPerformanceComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.performanceComparisons
);

export const selectRiskComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.riskComparisons
);

export const selectSectorComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.sectorComparisons
);

export const selectScenarioComparisons = createSelector(
  selectComparison,
  (comparison) => comparison.scenarioComparisons
);

export const selectDifferentialReturns = createSelector(
  selectComparison,
  (comparison) => comparison.differentialReturns
);

/**
 * Specific comparison selectors
 */
export const selectComparisonById = (comparisonId: string) =>
  createSelector(
    selectComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectCompositionComparisonById = (comparisonId: string) =>
  createSelector(
    selectCompositionComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectPerformanceComparisonById = (comparisonId: string) =>
  createSelector(
    selectPerformanceComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectRiskComparisonById = (comparisonId: string) =>
  createSelector(
    selectRiskComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectSectorComparisonById = (comparisonId: string) =>
  createSelector(
    selectSectorComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectScenarioComparisonById = (comparisonId: string) =>
  createSelector(
    selectScenarioComparisons,
    (comparisons) => comparisons[comparisonId]
  );

export const selectDifferentialReturnsById = (comparisonId: string) =>
  createSelector(
    selectDifferentialReturns,
    (differentials) => differentials[comparisonId]
  );

/**
 * Current comparison selectors
 */
export const selectActiveComparison = createSelector(
  selectComparison,
  (comparison) => comparison.activeComparison
);

export const selectSelectedPortfolios = createSelector(
  selectComparison,
  (comparison) => comparison.selectedPortfolios
);

export const selectBenchmarkPortfolio = createSelector(
  selectComparison,
  (comparison) => comparison.benchmarkPortfolio
);

export const selectActiveComparisonData = createSelector(
  selectComparison,
  selectActiveComparison,
  (comparison, activeId) => {
    if (!activeId) return null;
    return {
      comparison: comparison.comparisons[activeId],
      composition: comparison.compositionComparisons[activeId],
      performance: comparison.performanceComparisons[activeId],
      risk: comparison.riskComparisons[activeId],
      sector: comparison.sectorComparisons[activeId],
      scenario: comparison.scenarioComparisons[activeId],
      differential: comparison.differentialReturns[activeId],
    };
  }
);

/**
 * UI state selectors
 */
export const selectViewMode = createSelector(
  selectComparison,
  (comparison) => comparison.viewMode
);

export const selectDisplayMode = createSelector(
  selectComparison,
  (comparison) => comparison.displayMode
);

export const selectSelectedMetrics = createSelector(
  selectComparison,
  (comparison) => comparison.selectedMetrics
);

export const selectSelectedTimeframe = createSelector(
  selectComparison,
  (comparison) => comparison.selectedTimeframe
);

/**
 * Filter selectors
 */
export const selectFilters = createSelector(
  selectComparison,
  (comparison) => comparison.filters
);

export const selectDateRange = createSelector(
  selectFilters,
  (filters) => filters.dateRange
);

export const selectIncludeOnly = createSelector(
  selectFilters,
  (filters) => filters.includeOnly
);

export const selectExcludeMetrics = createSelector(
  selectFilters,
  (filters) => filters.excludeMetrics
);

export const selectMinDifference = createSelector(
  selectFilters,
  (filters) => filters.minDifference
);

/**
 * Parameters selectors
 */
export const selectParameters = createSelector(
  selectComparison,
  (comparison) => comparison.parameters
);

export const selectConfidenceLevel = createSelector(
  selectParameters,
  (parameters) => parameters.confidenceLevel
);

export const selectIncludeStatisticalTests = createSelector(
  selectParameters,
  (parameters) => parameters.includeStatisticalTests
);

export const selectAdjustForRisk = createSelector(
  selectParameters,
  (parameters) => parameters.adjustForRisk
);

export const selectNormalizeReturns = createSelector(
  selectParameters,
  (parameters) => parameters.normalizeReturns
);

export const selectIncludeBenchmark = createSelector(
  selectParameters,
  (parameters) => parameters.includeBenchmark
);

/**
 * Cache selectors
 */
export const selectComparisonCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.comparisonCache
);

export const selectCompositionCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.compositionCache
);

export const selectPerformanceCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.performanceCache
);

export const selectRiskCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.riskCache
);

export const selectSectorCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.sectorCache
);

export const selectScenarioCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.scenarioCache
);

export const selectDifferentialCache = createSelector(
  selectComparison,
  (comparison) => comparison.cache.differentialCache
);

export const selectCachedComparison = (comparisonId: string) =>
  createSelector(
    selectComparisonCache,
    (cache) => cache[comparisonId]
  );

/**
 * Error selectors
 */
export const selectComparisonErrors = createSelector(
  selectComparison,
  (comparison) => comparison.errors
);

export const selectComparisonError = createSelector(
  selectComparisonErrors,
  (errors) => errors.comparison
);

export const selectCompositionError = createSelector(
  selectComparisonErrors,
  (errors) => errors.composition
);

export const selectPerformanceError = createSelector(
  selectComparisonErrors,
  (errors) => errors.performance
);

export const selectRiskError = createSelector(
  selectComparisonErrors,
  (errors) => errors.risk
);

export const selectSectorError = createSelector(
  selectComparisonErrors,
  (errors) => errors.sector
);

export const selectScenarioError = createSelector(
  selectComparisonErrors,
  (errors) => errors.scenario
);

export const selectDifferentialError = createSelector(
  selectComparisonErrors,
  (errors) => errors.differential
);

export const selectHasAnyComparisonError = createSelector(
  selectComparisonErrors,
  (errors) => Object.values(errors).some(error => error !== null)
);

/**
 * Settings selectors
 */
export const selectComparisonSettings = createSelector(
  selectComparison,
  (comparison) => comparison.settings
);

export const selectAutoRefresh = createSelector(
  selectComparisonSettings,
  (settings) => settings.autoRefresh
);

export const selectRefreshInterval = createSelector(
  selectComparisonSettings,
  (settings) => settings.refreshInterval
);

export const selectCacheTimeout = createSelector(
  selectComparisonSettings,
  (settings) => settings.cacheTimeout
);

export const selectMaxComparisons = createSelector(
  selectComparisonSettings,
  (settings) => settings.maxComparisons
);

export const selectDefaultMetrics = createSelector(
  selectComparisonSettings,
  (settings) => settings.defaultMetrics
);

export const selectEnableNotifications = createSelector(
  selectComparisonSettings,
  (settings) => settings.enableNotifications
);

/**
 * Computed selectors
 */
export const selectCanCompare = createSelector(
  selectSelectedPortfolios,
  (selectedPortfolios) => selectedPortfolios.length >= 2
);

export const selectComparisonSummary = createSelector(
  selectComparisons,
  selectCompositionComparisons,
  selectPerformanceComparisons,
  selectRiskComparisons,
  (comparisons, compositionComparisons, performanceComparisons, riskComparisons) => ({
    totalComparisons: Object.keys(comparisons).length,
    compositionComparisons: Object.keys(compositionComparisons).length,
    performanceComparisons: Object.keys(performanceComparisons).length,
    riskComparisons: Object.keys(riskComparisons).length,
  })
);

export const selectComparisonHistory = createSelector(
  selectComparisons,
  (comparisons) => {
    return Object.entries(comparisons)
      .map(([id, comparison]) => ({
        id,
        portfolio1: comparison.portfolio1Id,
        portfolio2: comparison.portfolio2Id,
        createdAt: new Date().toISOString(), // This would come from the data
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

export const selectFilteredMetrics = createSelector(
  selectSelectedMetrics,
  selectExcludeMetrics,
  (selectedMetrics, excludeMetrics) => {
    return selectedMetrics.filter(metric => !excludeMetrics.includes(metric));
  }
);

export const selectComparisonInsights = createSelector(
  selectActiveComparisonData,
  (data) => {
    if (!data?.comparison) return null;

    const comparison = data.comparison;
    const insights = {
      winner: null as string | null,
      keyDifferences: [] as string[],
      recommendations: [] as string[],
    };

    // Determine winner based on multiple metrics
    // This is simplified - in reality, you'd have more sophisticated logic
    if (comparison.performanceComparison) {
      const p1Return = comparison.performanceComparison.returnMetrics[comparison.portfolio1Id]?.total_return || 0;
      const p2Return = comparison.performanceComparison.returnMetrics[comparison.portfolio2Id]?.total_return || 0;

      insights.winner = p1Return > p2Return ? comparison.portfolio1Id : comparison.portfolio2Id;
    }

    insights.keyDifferences = comparison.summary || [];
    insights.recommendations = comparison.recommendations || [];

    return insights;
  }
);

export const selectPortfolioComparisonMatrix = createSelector(
  selectSelectedPortfolios,
  selectComparisons,
  (portfolios, comparisons) => {
    const matrix: Record<string, Record<string, any>> = {};

    portfolios.forEach(p1 => {
      matrix[p1] = {};
      portfolios.forEach(p2 => {
        if (p1 !== p2) {
          // Find comparison between p1 and p2
          const comparison = Object.values(comparisons).find(c =>
            (c.portfolio1Id === p1 && c.portfolio2Id === p2) ||
            (c.portfolio1Id === p2 && c.portfolio2Id === p1)
          );

          matrix[p1][p2] = comparison || null;
        }
      });
    });

    return matrix;
  }
);

/**
 * Cache utility selectors
 */
export const selectIsCacheValid = (timestamp: number, timeout: number) =>
  createSelector(
    () => Date.now(),
    (now) => now - timestamp < timeout
  );

export const selectShouldRefreshComparison = (comparisonId: string) =>
  createSelector(
    selectCachedComparison(comparisonId),
    selectCacheTimeout,
    (cache, timeout) => {
      if (!cache) return true;
      return Date.now() - cache.timestamp > timeout;
    }
  );

/**
 * Validation selectors
 */
export const selectCanRunComparison = createSelector(
  selectSelectedPortfolios,
  selectAnyComparisonLoading,
  (portfolios, loading) => portfolios.length >= 2 && !loading
);

export const selectComparisonValidation = createSelector(
  selectSelectedPortfolios,
  selectSelectedMetrics,
  selectDateRange,
  (portfolios, metrics, dateRange) => {
    const errors: string[] = [];

    if (portfolios.length < 2) {
      errors.push('At least 2 portfolios must be selected');
    }

    if (metrics.length === 0) {
      errors.push('At least one metric must be selected');
    }

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      if (start >= end) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
);