/**
 * Historical selectors
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';

// Base selector
export const selectHistoricalState = (state: RootState) => state.historical;

// Scenarios selectors
export const selectScenarios = createSelector(
  selectHistoricalState,
  (state) => state.scenarios
);

export const selectScenariosLoading = createSelector(
  selectHistoricalState,
  (state) => state.scenariosLoading
);

export const selectScenariosError = createSelector(
  selectHistoricalState,
  (state) => state.scenariosError
);

// Context selectors
export const selectContextData = createSelector(
  selectHistoricalState,
  (state) => state.contextData
);

export const selectContextLoading = createSelector(
  selectHistoricalState,
  (state) => state.contextLoading
);

export const selectContextError = createSelector(
  selectHistoricalState,
  (state) => state.contextError
);

// Analogies selectors
export const selectAnalogiesData = createSelector(
  selectHistoricalState,
  (state) => state.analogiesData
);

export const selectAnalogiesLoading = createSelector(
  selectHistoricalState,
  (state) => state.analogiesLoading
);

export const selectAnalogiesError = createSelector(
  selectHistoricalState,
  (state) => state.analogiesError
);

// Similarity selectors
export const selectSimilarityData = createSelector(
  selectHistoricalState,
  (state) => state.similarityData
);

export const selectSimilarityLoading = createSelector(
  selectHistoricalState,
  (state) => state.similarityLoading
);

export const selectSimilarityError = createSelector(
  selectHistoricalState,
  (state) => state.similarityError
);

// Events and regimes selectors
export const selectHistoricalEvents = createSelector(
  selectHistoricalState,
  (state) => state.historicalEvents
);

export const selectMarketRegimes = createSelector(
  selectHistoricalState,
  (state) => state.marketRegimes
);

// UI state selectors
export const selectCurrentScenarioKey = createSelector(
  selectHistoricalState,
  (state) => state.currentScenarioKey
);

export const selectSelectedAnalogies = createSelector(
  selectHistoricalState,
  (state) => state.selectedAnalogies
);

export const selectCurrentMarketData = createSelector(
  selectHistoricalState,
  (state) => state.currentMarketData
);

export const selectViewMode = createSelector(
  selectHistoricalState,
  (state) => state.viewMode
);

export const selectSelectedTimeRange = createSelector(
  selectHistoricalState,
  (state) => state.selectedTimeRange
);

export const selectComparisonMode = createSelector(
  selectHistoricalState,
  (state) => state.comparisonMode
);

export const selectAnalysisParams = createSelector(
  selectHistoricalState,
  (state) => state.analysisParams
);

// Loading state selectors
export const selectHistoricalLoading = createSelector(
  selectHistoricalState,
  (state) => ({
    scenarios: state.scenariosLoading,
    context: state.contextLoading,
    analogies: state.analogiesLoading,
    similarity: state.similarityLoading,
  })
);

export const selectAnyHistoricalLoading = createSelector(
  selectHistoricalLoading,
  (loading) => Object.values(loading).some(Boolean)
);

// Error state selectors
export const selectHistoricalErrors = createSelector(
  selectHistoricalState,
  (state) => ({
    scenarios: state.scenariosError,
    context: state.contextError,
    analogies: state.analogiesError,
    similarity: state.similarityError,
  })
);

export const selectAnyHistoricalError = createSelector(
  selectHistoricalErrors,
  (errors) => Object.values(errors).some(Boolean)
);

// Specific data selectors
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

// Computed selectors
export const selectCurrentScenarioContext = createSelector(
  [selectContextData, selectCurrentScenarioKey],
  (contextData, scenarioKey) => {
    if (!scenarioKey) return null;
    return contextData[scenarioKey];
  }
);

export const selectEventsArray = createSelector(
  selectHistoricalEvents,
  (events) => Object.values(events)
);

export const selectRegimesArray = createSelector(
  selectMarketRegimes,
  (regimes) => Object.values(regimes)
);

export const selectTopAnalogies = createSelector(
  [selectAnalogiesData, selectAnalysisParams],
  (analogiesData, params) => {
    const allAnalogies = Object.values(analogiesData).flatMap(response =>
      response.analogies || []
    );

    return allAnalogies
      .filter(analogy => analogy.similarity >= params.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, params.maxAnalogies);
  }
);

export const selectHistoricalSummary = createSelector(
  [selectScenarios, selectContextData, selectAnalogiesData],
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