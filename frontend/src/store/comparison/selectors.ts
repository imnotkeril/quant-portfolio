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

export const selectCachedComposition = (comparisonId: string) =>
  createSelector(
    selectCompositionCache,
    (cache) => cache[comparisonId]
  );

export const selectCachedPerformance = (comparisonId: string) =>
  createSelector(
    selectPerformanceCache,
    (cache) => cache[comparisonId]
  );

export const selectCachedRisk = (comparisonId: string) =>
  createSelector(
    selectRiskCache,
    (cache) => cache[comparisonId]
  );

export const selectCachedSector = (comparisonId: string) =>
  createSelector(
    selectSectorCache,
    (cache) => cache[comparisonId]
  );

export const selectCachedScenario = (comparisonId: string) =>
  createSelector(
    selectScenarioCache,
    (cache) => cache[comparisonId]
  );

export const selectCachedDifferential = (comparisonId: string) =>
  createSelector(
    selectDifferentialCache,
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
        createdAt: comparison.metadata?.createdAt || new Date().toISOString(),
        status: comparison.metadata?.status || 'completed',
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
      confidence: 0,
    };

    // Determine winner based on multiple metrics
    if (comparison.performanceComparison) {
      const p1Metrics = comparison.performanceComparison.returnMetrics?.[comparison.portfolio1Id];
      const p2Metrics = comparison.performanceComparison.returnMetrics?.[comparison.portfolio2Id];

      if (p1Metrics && p2Metrics) {
        const p1Return = p1Metrics.total_return || 0;
        const p2Return = p2Metrics.total_return || 0;
        const p1Sharpe = p1Metrics.sharpe_ratio || 0;
        const p2Sharpe = p2Metrics.sharpe_ratio || 0;

        // Weighted scoring (50% return, 50% risk-adjusted return)
        const p1Score = (p1Return * 0.5) + (p1Sharpe * 0.5);
        const p2Score = (p2Return * 0.5) + (p2Sharpe * 0.5);

        insights.winner = p1Score > p2Score ? comparison.portfolio1Id : comparison.portfolio2Id;
        insights.confidence = Math.abs(p1Score - p2Score);
      }
    }

    // Extract key differences
    if (comparison.summary && Array.isArray(comparison.summary)) {
      insights.keyDifferences = comparison.summary;
    }

    // Extract recommendations
    if (comparison.recommendations && Array.isArray(comparison.recommendations)) {
      insights.recommendations = comparison.recommendations;
    }

    return insights;
  }
);

export const selectPortfolioComparisonMatrix = createSelector(
  selectSelectedPortfolios,
  selectComparisons,
  (portfolios, comparisons) => {
    // Limit portfolios for performance - Wild Market Capital design system colors will be applied in UI
    if (portfolios.length > 10) {
      console.warn('Too many portfolios for comparison matrix, limiting to first 10');
      portfolios = portfolios.slice(0, 10);
    }

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
 * Performance selectors
 */
export const selectComparisonPerformanceMetrics = createSelector(
  selectActiveComparisonData,
  (data) => {
    if (!data?.performance) return null;

    const performance = data.performance;
    return {
      portfolio1: performance.returnMetrics?.[performance.portfolio1Id || ''],
      portfolio2: performance.returnMetrics?.[performance.portfolio2Id || ''],
      comparison: performance.comparison,
      statisticalTests: performance.statisticalTests,
    };
  }
);

export const selectComparisonRiskMetrics = createSelector(
  selectActiveComparisonData,
  (data) => {
    if (!data?.risk) return null;

    const risk = data.risk;
    return {
      portfolio1: risk.riskMetrics?.[risk.portfolio1Id || ''],
      portfolio2: risk.riskMetrics?.[risk.portfolio2Id || ''],
      comparison: risk.comparison,
      riskContribution: risk.riskContribution,
    };
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

export const selectCacheStatistics = createSelector(
  selectComparison,
  (comparison) => {
    const cache = comparison.cache;
    const totalEntries = Object.values(cache).reduce((sum, cacheType) => {
      return sum + Object.keys(cacheType).length;
    }, 0);

    const totalSize = JSON.stringify(cache).length;
    const oldestEntry = Math.min(
      ...Object.values(cache).flatMap(cacheType =>
        Object.values(cacheType).map(entry => entry.timestamp)
      )
    );

    return {
      totalEntries,
      totalSize,
      oldestEntry: oldestEntry === Infinity ? null : new Date(oldestEntry),
      cacheTypes: {
        comparison: Object.keys(cache.comparisonCache).length,
        composition: Object.keys(cache.compositionCache).length,
        performance: Object.keys(cache.performanceCache).length,
        risk: Object.keys(cache.riskCache).length,
        sector: Object.keys(cache.sectorCache).length,
        scenario: Object.keys(cache.scenarioCache).length,
        differential: Object.keys(cache.differentialCache).length,
      },
    };
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
    const warnings: string[] = [];

    // Required validations
    if (portfolios.length < 2) {
      errors.push('At least 2 portfolios must be selected');
    }

    if (portfolios.length > 10) {
      warnings.push('Comparing more than 10 portfolios may affect performance');
    }

    if (metrics.length === 0) {
      errors.push('At least one metric must be selected');
    }

    // Date range validation
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      if (start >= end) {
        errors.push('Start date must be before end date');
      }

      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) {
        warnings.push('Date range is less than 30 days, results may not be meaningful');
      }

      if (daysDiff > 365 * 10) {
        warnings.push('Date range is more than 10 years, performance may be affected');
      }
    }

    // Portfolio duplication check
    const uniquePortfolios = new Set(portfolios);
    if (uniquePortfolios.size !== portfolios.length) {
      errors.push('Duplicate portfolios detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
);

/**
 * Advanced analysis selectors
 */
export const selectComparisonTrends = createSelector(
  selectActiveComparisonData,
  (data) => {
    if (!data?.performance) return null;

    const performance = data.performance;
    const trends = {
      returnsCorrelation: 0,
      performanceDivergence: 0,
      riskAdjustedTrend: '',
      outlook: '',
    };

    // Calculate correlation if time series data is available
    if (performance.timeSeries) {
      // This would calculate actual correlation
      trends.returnsCorrelation = 0.75; // Placeholder
    }

    // Determine trend direction
    const p1Return = performance.returnMetrics?.[performance.portfolio1Id || '']?.total_return || 0;
    const p2Return = performance.returnMetrics?.[performance.portfolio2Id || '']?.total_return || 0;

    trends.performanceDivergence = Math.abs(p1Return - p2Return);

    if (p1Return > p2Return * 1.1) {
      trends.riskAdjustedTrend = 'Portfolio 1 outperforming';
    } else if (p2Return > p1Return * 1.1) {
      trends.riskAdjustedTrend = 'Portfolio 2 outperforming';
    } else {
      trends.riskAdjustedTrend = 'Similar performance';
    }

    return trends;
  }
);

export const selectComparisonRecommendations = createSelector(
  selectComparisonInsights,
  selectComparisonTrends,
  selectComparisonPerformanceMetrics,
  (insights, trends, performance) => {
    const recommendations: Array<{
      type: 'optimize' | 'rebalance' | 'diversify' | 'risk' | 'general';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
    }> = [];

    if (insights?.winner && performance) {
      const winnerMetrics = insights.winner === performance.portfolio1?.id
        ? performance.portfolio1
        : performance.portfolio2;

      if (winnerMetrics) {
        recommendations.push({
          type: 'optimize',
          priority: 'high',
          title: 'Consider optimization',
          description: `The winning portfolio shows superior risk-adjusted returns. Consider analyzing its allocation strategy.`,
        });
      }
    }

    if (trends?.performanceDivergence > 0.1) {
      recommendations.push({
        type: 'rebalance',
        priority: 'medium',
        title: 'Performance divergence detected',
        description: `Significant performance difference observed. Review allocation strategies and consider rebalancing.`,
      });
    }

    if (trends?.returnsCorrelation > 0.9) {
      recommendations.push({
        type: 'diversify',
        priority: 'medium',
        title: 'High correlation detected',
        description: `Portfolios are highly correlated. Consider diversification to reduce systematic risk.`,
      });
    }

    return recommendations;
  }
);

/**
 * Export utility selectors
 */
export const selectComparisonExportData = createSelector(
  selectActiveComparisonData,
  selectComparisonInsights,
  selectComparisonTrends,
  (data, insights, trends) => {
    if (!data) return null;

    return {
      comparison: data.comparison,
      performance: data.performance,
      risk: data.risk,
      composition: data.composition,
      sector: data.sector,
      scenario: data.scenario,
      differential: data.differential,
      insights,
      trends,
      exportedAt: new Date().toISOString(),
      metadata: {
        exportFormat: 'json',
        version: '1.0',
        source: 'Wild Market Capital Portfolio Management System',
      },
    };
  }
);

/**
 * UI helper selectors
 */
export const selectComparisonDisplayData = createSelector(
  selectActiveComparisonData,
  selectDisplayMode,
  selectFilteredMetrics,
  (data, displayMode, metrics) => {
    if (!data?.comparison) return null;

    const formatValue = (value: number, metric: string) => {
      switch (displayMode) {
        case 'percentage':
          return `${(value * 100).toFixed(2)}%`;
        case 'relative':
          return value.toFixed(4);
        case 'normalized':
          return ((value - 0.5) * 2).toFixed(4); // Example normalization
        default:
          return value.toFixed(4);
      }
    };

    // Transform data based on display mode and selected metrics
    return metrics.reduce((acc, metric) => {
      if (data.performance?.returnMetrics) {
        const p1Value = data.performance.returnMetrics[data.comparison!.portfolio1Id]?.[metric];
        const p2Value = data.performance.returnMetrics[data.comparison!.portfolio2Id]?.[metric];

        if (p1Value !== undefined && p2Value !== undefined) {
          acc[metric] = {
            portfolio1: formatValue(p1Value, metric),
            portfolio2: formatValue(p2Value, metric),
            difference: formatValue(p1Value - p2Value, metric),
          };
        }
      }
      return acc;
    }, {} as Record<string, any>);
  }
);