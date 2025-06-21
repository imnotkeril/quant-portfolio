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

export const selectSelectedTimeRange = createSelector(
  selectHistoricalState,
  (state) => state.selectedTimeRange
);

export const selectViewMode = createSelector(
  selectHistoricalState,
  (state) => state.viewMode
);

export const selectComparisonMode = createSelector(
  selectHistoricalState,
  (state) => state.comparisonMode
);

export const selectAnalysisParams = createSelector(
  selectHistoricalState,
  (state) => state.analysisParams
);

export const selectCurrentMarketData = createSelector(
  selectHistoricalState,
  (state) => state.currentMarketData
);

// Historical Analogies selector
export const selectHistoricalAnalogies = createSelector(
  selectAnalogiesData,
  selectCurrentScenarioKey,
  (analogiesData, currentKey) => {
    return currentKey ? analogiesData[currentKey] : null;
  }
);

// Historical Context selector
export const selectHistoricalContext = createSelector(
  selectContextData,
  selectCurrentScenarioKey,
  (contextData, currentKey) => {
    return currentKey ? contextData[currentKey] : null;
  }
);

// Pattern Matches selector
export const selectPatternMatches = createSelector(
  selectSimilarityData,
  selectCurrentScenarioKey,
  (similarityData, currentKey) => {
    return currentKey ? similarityData[currentKey] : null;
  }
);

// Events array selector
export const selectEventsArray = createSelector(
  selectHistoricalEvents,
  (events) => Object.values(events)
);

// Regimes array selector
export const selectRegimesArray = createSelector(
  selectMarketRegimes,
  (regimes) => Object.values(regimes)
);

// Context by scenario selector
export const selectContextByScenario = (scenarioKey: string) => createSelector(
  selectContextData,
  (contextData) => contextData[scenarioKey]
);

// Analogies by key selector
export const selectAnalogiesByKey = (key: string) => createSelector(
  selectAnalogiesData,
  (analogiesData) => analogiesData[key]
);

// Similarity by key selector
export const selectSimilarityByKey = (key: string) => createSelector(
  selectSimilarityData,
  (similarityData) => similarityData[key]
);

// Top analogies selector
export const selectTopAnalogies = createSelector(
  selectHistoricalAnalogies,
  selectAnalysisParams,
  (analogies, params) => {
    if (!analogies || !analogies.analogies) return [];

    return analogies.analogies
      .filter(analogy => analogy.similarity >= params.similarityThreshold)
      .slice(0, params.maxAnalogies);
  }
);

// Current scenario context selector - ТОЛЬКО ОДИН!
export const selectCurrentScenarioContext = createSelector(
  selectContextData,
  selectCurrentScenarioKey,
  (contextData, scenarioKey) => {
    if (!scenarioKey) return null;
    return contextData[scenarioKey];
  }
);

// Historical summary selector
export const selectHistoricalSummary = createSelector(
  selectScenarios,
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

// Loading states
export const selectAnyHistoricalLoading = createSelector(
  selectScenariosLoading,
  selectContextLoading,
  selectAnalogiesLoading,
  selectSimilarityLoading,
  (scenarios, context, analogies, similarity) =>
    scenarios || context || analogies || similarity
);

// Error states
export const selectAnyHistoricalError = createSelector(
  selectScenariosError,
  selectContextError,
  selectAnalogiesError,
  selectSimilarityError,
  (scenarios, context, analogies, similarity) =>
    scenarios || context || analogies || similarity
);

export const selectHistoricalErrors = createSelector(
  selectScenariosError,
  selectContextError,
  selectAnalogiesError,
  selectSimilarityError,
  (scenarios, context, analogies, similarity) => ({
    scenarios,
    context,
    analogies,
    similarity,
  })
);

