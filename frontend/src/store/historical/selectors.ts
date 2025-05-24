/**
 * Historical store selectors
 */
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { HistoricalState } from './types';

/**
 * Base historical selector
 */
export const selectHistorical = (state: RootState): HistoricalState => state.historical;

/**
 * Loading state selectors
 */
export const selectScenariosLoading = createSelector(
  selectHistorical,
  (historical) => historical.scenariosLoading
);

export const selectContextLoading = createSelector(
  selectHistorical,
  (historical) => historical.contextLoading
);

export const selectAnalogiesLoading = createSelector(
  selectHistorical,
  (historical) => historical.analogiesLoading
);

export const selectSimilarityLoading = createSelector(
  selectHistorical,
  (historical) => historical.similarityLoading
);

export const selectManagementLoading = createSelector(
  selectHistorical,
  (historical) => historical.managementLoading
);

export const selectAnyHistoricalLoading = createSelector(
  selectScenariosLoading,
  selectContextLoading,
  selectAnalogiesLoading,
  selectSimilarityLoading,
  selectManagementLoading,
  (scenariosLoading, contextLoading, analogiesLoading, similarityLoading, managementLoading) =>
    scenariosLoading || contextLoading || analogiesLoading || similarityLoading || managementLoading
);

/**
 * Data selectors
 */
export const selectAvailableScenarios = createSelector(
  selectHistorical,
  (historical) => historical.availableScenarios
);

export const selectContextData = createSelector(
  selectHistorical,
  (historical) => historical.contextData
);

export const selectAnalogiesData = createSelector(
  selectHistorical,
  (historical) => historical.analogiesData
);

export const selectSimilarityData = createSelector(
  selectHistorical,
  (historical) => historical.similarityData
);

export const selectHistoricalEvents = createSelector(
  selectHistorical,
  (historical) => historical.historicalEvents
);

export const selectMarketRegimes = createSelector(
  selectHistorical,
  (historical) => historical.marketRegimes
);

/**
 * Specific data selectors
 */
export const selectContextByScenario = (scenarioKey: string) =>
  createSelector(
    selectContextData,
    (contextData) => contextData[scenarioKey]
  );

export const selectAnalogiesByKey = (cacheKey: string) =>
  createSelector(
    selectAnalogiesData,
    (analogiesData) => analogiesData[cacheKey]
  );

export const selectSimilarityByKey = (cacheKey: string) =>
  createSelector(
    selectSimilarityData,
    (similarityData) => similarityData[cacheKey]
  );

export const selectEventById = (eventId: string) =>
  createSelector(
    selectHistoricalEvents,
    (events) => events[eventId]
  );

export const selectRegimeById = (regimeId: string) =>
  createSelector(
    selectMarketRegimes,
    (regimes) => regimes[regimeId]
  );

/**
 * Current analysis selectors
 */
export const selectCurrentScenarioKey = createSelector(
  selectHistorical,
  (historical) => historical.currentScenarioKey
);

export const selectSelectedAnalogies = createSelector(
  selectHistorical,
  (historical) => historical.selectedAnalogies
);

export const selectCurrentMarketData = createSelector(
  selectHistorical,
  (historical) => historical.currentMarketData
);

export const selectCurrentScenarioContext = createSelector(
  selectHistorical,
  selectCurrentScenarioKey,
  (historical, scenarioKey) => {
    if (!scenarioKey) return null;
    return historical.contextData[scenarioKey];
  }
);

/**
 * UI state selectors
 */
export const selectViewMode = createSelector(
  selectHistorical,
  (historical) => historical.viewMode
);

export const selectSelectedTimeRange = createSelector(
  selectHistorical,
  (historical) => historical.selectedTimeRange
);

export const selectComparisonMode = createSelector(
  selectHistorical,
  (historical) => historical.comparisonMode
);

/**
 * Analysis parameters selectors
 */
export const selectAnalysisParameters = createSelector(
  selectHistorical,
  (historical) => historical.analysisParameters
);

export const selectSimilarityThreshold = createSelector(
  selectAnalysisParameters,
  (parameters) => parameters.similarityThreshold
);

export const selectMaxAnalogies = createSelector(
  selectAnalysisParameters,
  (parameters) => parameters.maxAnalogies
);

export const selectIncludedMetrics = createSelector(
  selectAnalysisParameters,
  (parameters) => parameters.includedMetrics
);

export const selectMetricWeightings = createSelector(
  selectAnalysisParameters,
  (parameters) => parameters.weightings
);

/**
 * Cache selectors
 */
export const selectScenariosCache = createSelector(
  selectHistorical,
  (historical) => historical.cache.scenariosCache
);

export const selectContextCache = createSelector(
  selectHistorical,
  (historical) => historical.cache.contextCache
);

export const selectAnalogiesCache = createSelector(
  selectHistorical,
  (historical) => historical.cache.analogiesCache
);

export const selectSimilarityCache = createSelector(
  selectHistorical,
  (historical) => historical.cache.similarityCache
);

export const selectCachedContext = (scenarioKey: string) =>
  createSelector(
    selectContextCache,
    (cache) => cache[scenarioKey]
  );

export const selectCachedAnalogies = (cacheKey: string) =>
  createSelector(
    selectAnalogiesCache,
    (cache) => cache[cacheKey]
  );

export const selectCachedSimilarity = (cacheKey: string) =>
  createSelector(
    selectSimilarityCache,
    (cache) => cache[cacheKey]
  );

/**
 * Search selectors
 */
export const selectSearchQuery = createSelector(
  selectHistorical,
  (historical) => historical.search.query
);

export const selectSearchFilters = createSelector(
  selectHistorical,
  (historical) => historical.search.filters
);

export const selectSearchResults = createSelector(
  selectHistorical,
  (historical) => historical.search.results
);

export const selectSearchResultsEvents = createSelector(
  selectSearchResults,
  (results) => results.events
);

export const selectSearchResultsRegimes = createSelector(
  selectSearchResults,
  (results) => results.regimes
);

export const selectSearchResultsAnalogies = createSelector(
  selectSearchResults,
  (results) => results.analogies
);

export const selectHasSearchResults = createSelector(
  selectSearchResults,
  (results) => results.events.length > 0 || results.regimes.length > 0 || results.analogies.length > 0
);

/**
 * Error selectors
 */
export const selectHistoricalErrors = createSelector(
  selectHistorical,
  (historical) => historical.errors
);

export const selectScenariosError = createSelector(
  selectHistoricalErrors,
  (errors) => errors.scenarios
);

export const selectContextError = createSelector(
  selectHistoricalErrors,
  (errors) => errors.context
);

export const selectAnalogiesError = createSelector(
  selectHistoricalErrors,
  (errors) => errors.analogies
);

export const selectSimilarityError = createSelector(
  selectHistoricalErrors,
  (errors) => errors.similarity
);

export const selectManagementError = createSelector(
  selectHistoricalErrors,
  (errors) => errors.management
);

export const selectHasAnyHistoricalError = createSelector(
  selectHistoricalErrors,
  (errors) => Object.values(errors).some(error => error !== null)
);

/**
 * Settings selectors
 */
export const selectHistoricalSettings = createSelector(
  selectHistorical,
  (historical) => historical.settings
);

export const selectAutoLoadContext = createSelector(
  selectHistoricalSettings,
  (settings) => settings.autoLoadContext
);

export const selectCacheTimeout = createSelector(
  selectHistoricalSettings,
  (settings) => settings.cacheTimeout
);

export const selectMaxResults = createSelector(
  selectHistoricalSettings,
  (settings) => settings.maxResults
);

export const selectDefaultMetrics = createSelector(
  selectHistoricalSettings,
  (settings) => settings.defaultMetrics
);

export const selectEnableRealTimeUpdates = createSelector(
  selectHistoricalSettings,
  (settings) => settings.enableRealTimeUpdates
);

/**
 * Computed selectors
 */
export const selectEventsArray = createSelector(
  selectHistoricalEvents,
  (events) => Object.values(events)
);

export const selectRegimesArray = createSelector(
  selectMarketRegimes,
  (regimes) => Object.values(regimes)
);

export const selectEventsByTimeRange = createSelector(
  selectEventsArray,
  selectSelectedTimeRange,
  (events, timeRange) => {
    return events.filter(event => {
      const eventYear = new Date(event.startDate).getFullYear();
      return eventYear >= timeRange.start && eventYear <= timeRange.end;
    });
  }
);

export const selectRegimesByTimeRange = createSelector(
  selectRegimesArray,
  selectSelectedTimeRange,
  (regimes, timeRange) => {
    return regimes.filter(regime => {
      // Assuming regimes have some time-based filtering logic
      return true; // Placeholder - implement based on regime structure
    });
  }
);

export const selectTopAnalogies = createSelector(
  selectAnalogiesData,
  selectCurrentMarketData,
  (analogiesData, currentData) => {
    if (!currentData) return [];

    // Get all analogies and sort by similarity
    const allAnalogies = Object.values(analogiesData).flatMap(response =>
      response.analogies || []
    );

    return allAnalogies
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }
);

export const selectScenarioSummary = createSelector(
  selectAvailableScenarios,
  selectContextData,
  selectAnalogiesData,
  (scenarios, contextData, analogiesData) => ({
    totalScenarios: scenarios.length,
    scenariosWithContext: Object.keys(contextData).length,
    totalAnalogies: Object.values(analogiesData).reduce(
      (sum, response) => sum + (response.analogies?.length || 0),
      0
    ),
    averageSimilarity: (() => {
      const allAnalogies = Object.values(analogiesData).flatMap(response =>
        response.analogies || []
      );
      if (allAnalogies.length === 0) return 0;
      return allAnalogies.reduce((sum, analogy) => sum + analogy.similarity, 0) / allAnalogies.length;
    })(),
  })
);

export const selectTimelineSummary = createSelector(
  selectEventsArray,
  selectRegimesArray,
  selectSelectedTimeRange,
  (events, regimes, timeRange) => {
    const filteredEvents = events.filter(event => {
      const eventYear = new Date(event.startDate).getFullYear();
      return eventYear >= timeRange.start && eventYear <= timeRange.end;
    });

    return {
      totalEvents: filteredEvents.length,
      eventsByDecade: filteredEvents.reduce((acc, event) => {
        const decade = Math.floor(new Date(event.startDate).getFullYear() / 10) * 10;
        acc[decade] = (acc[decade] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      eventsByType: filteredEvents.reduce((acc, event) => {
        event.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalRegimes: regimes.length,
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

export const selectShouldRefreshScenarios = createSelector(
  selectScenariosCache,
  selectCacheTimeout,
  (cache, timeout) => {
    if (!cache) return true;
    return Date.now() - cache.timestamp > timeout;
  }
);

export const selectShouldRefreshContext = (scenarioKey: string) =>
  createSelector(
    selectCachedContext(scenarioKey),
    selectCacheTimeout,
    (cache, timeout) => {
      if (!cache) return true;
      return Date.now() - cache.timestamp > timeout;
    }
  );

/**
 * Analysis utility selectors
 */
export const selectCanFindAnalogies = createSelector(
  selectCurrentMarketData,
  selectAnalogiesLoading,
  (marketData, loading) => !!marketData && !loading
);

export const selectCanCalculateSimilarity = createSelector(
  selectCurrentMarketData,
  selectSimilarityLoading,
  (marketData, loading) => !!marketData && !loading
);

export const selectSelectedAnalogiesData = createSelector(
  selectSelectedAnalogies,
  selectAnalogiesData,
  (selectedIds, analogiesData) => {
    const allAnalogies = Object.values(analogiesData).flatMap(response =>
      response.analogies || []
    );

    return selectedIds.map(id =>
      allAnalogies.find(analogy => analogy.period === id)
    ).filter(Boolean);
  }
);

export const selectFilteredEvents = createSelector(
  selectEventsArray,
  selectSearchFilters,
  (events, filters) => {
    let filtered = events;

    if (filters.timeRange) {
      const [start, end] = filters.timeRange;
      filtered = filtered.filter(event => {
        const eventTime = new Date(event.startDate).getTime();
        return eventTime >= start && eventTime <= end;
      });
    }

    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event =>
        event.tags.some(tag => filters.eventTypes.includes(tag))
      );
    }

    if (filters.regions.length > 0) {
      // Implement region filtering based on event structure
      // filtered = filtered.filter(event => ...);
    }

    if (filters.assetClasses.length > 0) {
      // Implement asset class filtering based on event structure
      // filtered = filtered.filter(event => ...);
    }

    if (filters.severityLevels.length > 0) {
      // Implement severity filtering based on event structure
      // filtered = filtered.filter(event => ...);
    }

    return filtered;
  }
);