/**
 * Historical store actions
 */
import {
  HistoricalActionTypes,
  HistoricalAction,
  LoadContextPayload,
  FindAnalogiesPayload,
  CalculateSimilarityPayload,
  AddScenarioPayload,
  DeleteScenarioPayload,
  AddEventPayload,
  UpdateEventPayload,
  DeleteEventPayload,
  AddRegimePayload,
  UpdateRegimePayload,
  DeleteRegimePayload,
  PerformSearchPayload,
  HistoricalViewMode,
  TimeRange,
  HistoricalState,
} from './types';
import { ApiError } from '../../types/common';
import {
  HistoricalScenariosResponse,
  HistoricalContextResponse,
  HistoricalAnalogiesResponse,
  HistoricalSimilarityResponse,
  HistoricalEvent,
  MarketRegime,
} from '../../types/historical';

/**
 * Scenarios actions
 */
export const loadScenariosRequest = (): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_SCENARIOS_REQUEST,
});

export const loadScenariosSuccess = (data: HistoricalScenariosResponse): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_SCENARIOS_SUCCESS,
  payload: data,
});

export const loadScenariosFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_SCENARIOS_FAILURE,
  payload: { error },
});

/**
 * Context actions
 */
export const loadContextRequest = (payload: LoadContextPayload): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_CONTEXT_REQUEST,
  payload,
});

export const loadContextSuccess = (
  scenarioKey: string,
  data: HistoricalContextResponse
): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_CONTEXT_SUCCESS,
  payload: { scenarioKey, data },
});

export const loadContextFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.LOAD_CONTEXT_FAILURE,
  payload: { error },
});

/**
 * Analogies actions
 */
export const findAnalogiesRequest = (payload: FindAnalogiesPayload): HistoricalAction => ({
  type: HistoricalActionTypes.FIND_ANALOGIES_REQUEST,
  payload,
});

export const findAnalogiesSuccess = (
  cacheKey: string,
  data: HistoricalAnalogiesResponse
): HistoricalAction => ({
  type: HistoricalActionTypes.FIND_ANALOGIES_SUCCESS,
  payload: { cacheKey, data },
});

export const findAnalogiesFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.FIND_ANALOGIES_FAILURE,
  payload: { error },
});

/**
 * Similarity actions
 */
export const calculateSimilarityRequest = (payload: CalculateSimilarityPayload): HistoricalAction => ({
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_REQUEST,
  payload,
});

export const calculateSimilaritySuccess = (
  cacheKey: string,
  data: HistoricalSimilarityResponse
): HistoricalAction => ({
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_SUCCESS,
  payload: { cacheKey, data },
});

export const calculateSimilarityFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_FAILURE,
  payload: { error },
});

/**
 * Scenario management actions
 */
export const addScenarioRequest = (payload: AddScenarioPayload): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_SCENARIO_REQUEST,
  payload,
});

export const addScenarioSuccess = (key: string): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_SCENARIO_SUCCESS,
  payload: { key },
});

export const addScenarioFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_SCENARIO_FAILURE,
  payload: { error },
});

export const deleteScenarioRequest = (payload: DeleteScenarioPayload): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_SCENARIO_REQUEST,
  payload,
});

export const deleteScenarioSuccess = (key: string): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_SCENARIO_SUCCESS,
  payload: { key },
});

export const deleteScenarioFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_SCENARIO_FAILURE,
  payload: { error },
});

/**
 * Event management actions
 */
export const addEventRequest = (payload: AddEventPayload): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_EVENT_REQUEST,
  payload,
});

export const addEventSuccess = (event: HistoricalEvent): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_EVENT_SUCCESS,
  payload: { event },
});

export const addEventFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_EVENT_FAILURE,
  payload: { error },
});

export const updateEventRequest = (payload: UpdateEventPayload): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_EVENT_REQUEST,
  payload,
});

export const updateEventSuccess = (id: string, event: HistoricalEvent): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_EVENT_SUCCESS,
  payload: { id, event },
});

export const updateEventFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_EVENT_FAILURE,
  payload: { error },
});

export const deleteEventRequest = (payload: DeleteEventPayload): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_EVENT_REQUEST,
  payload,
});

export const deleteEventSuccess = (id: string): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_EVENT_SUCCESS,
  payload: { id },
});

export const deleteEventFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_EVENT_FAILURE,
  payload: { error },
});

/**
 * Market regime actions
 */
export const addRegimeRequest = (payload: AddRegimePayload): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_REGIME_REQUEST,
  payload,
});

export const addRegimeSuccess = (regime: MarketRegime): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_REGIME_SUCCESS,
  payload: { regime },
});

export const addRegimeFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.ADD_REGIME_FAILURE,
  payload: { error },
});

export const updateRegimeRequest = (payload: UpdateRegimePayload): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_REGIME_REQUEST,
  payload,
});

export const updateRegimeSuccess = (id: string, regime: MarketRegime): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_REGIME_SUCCESS,
  payload: { id, regime },
});

export const updateRegimeFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_REGIME_FAILURE,
  payload: { error },
});

export const deleteRegimeRequest = (payload: DeleteRegimePayload): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_REGIME_REQUEST,
  payload,
});

export const deleteRegimeSuccess = (id: string): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_REGIME_SUCCESS,
  payload: { id },
});

export const deleteRegimeFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.DELETE_REGIME_FAILURE,
  payload: { error },
});

/**
 * UI state actions
 */
export const setCurrentScenario = (scenarioKey: string | null): HistoricalAction => ({
  type: HistoricalActionTypes.SET_CURRENT_SCENARIO,
  payload: scenarioKey,
});

export const setSelectedAnalogies = (analogies: string[]): HistoricalAction => ({
  type: HistoricalActionTypes.SET_SELECTED_ANALOGIES,
  payload: analogies,
});

export const setCurrentMarketData = (data: any): HistoricalAction => ({
  type: HistoricalActionTypes.SET_CURRENT_MARKET_DATA,
  payload: data,
});

export const setViewMode = (viewMode: HistoricalViewMode): HistoricalAction => ({
  type: HistoricalActionTypes.SET_VIEW_MODE,
  payload: viewMode,
});

export const setSelectedTimeRange = (timeRange: TimeRange): HistoricalAction => ({
  type: HistoricalActionTypes.SET_SELECTED_TIME_RANGE,
  payload: timeRange,
});

export const setComparisonMode = (enabled: boolean): HistoricalAction => ({
  type: HistoricalActionTypes.SET_COMPARISON_MODE,
  payload: enabled,
});

/**
 * Parameters actions
 */
export const updateAnalysisParameters = (
  parameters: Partial<HistoricalState['analysisParameters']>
): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_ANALYSIS_PARAMETERS,
  payload: parameters,
});

export const resetAnalysisParameters = (): HistoricalAction => ({
  type: HistoricalActionTypes.RESET_ANALYSIS_PARAMETERS,
});

/**
 * Search actions
 */
export const setSearchQuery = (query: string): HistoricalAction => ({
  type: HistoricalActionTypes.SET_SEARCH_QUERY,
  payload: query,
});

export const setSearchFilters = (
  filters: Partial<HistoricalState['search']['filters']>
): HistoricalAction => ({
  type: HistoricalActionTypes.SET_SEARCH_FILTERS,
  payload: filters,
});

export const performSearchRequest = (payload: PerformSearchPayload): HistoricalAction => ({
  type: HistoricalActionTypes.PERFORM_SEARCH_REQUEST,
  payload,
});

export const performSearchSuccess = (
  results: HistoricalState['search']['results']
): HistoricalAction => ({
  type: HistoricalActionTypes.PERFORM_SEARCH_SUCCESS,
  payload: { results },
});

export const performSearchFailure = (error: ApiError): HistoricalAction => ({
  type: HistoricalActionTypes.PERFORM_SEARCH_FAILURE,
  payload: { error },
});

export const clearSearchResults = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_SEARCH_RESULTS,
});

/**
 * Cache management actions
 */
export const clearCache = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_CACHE,
});

export const clearContextCache = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_CONTEXT_CACHE,
});

export const clearAnalogiesCache = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_ANALOGIES_CACHE,
});

export const clearSimilarityCache = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_SIMILARITY_CACHE,
});

/**
 * Settings actions
 */
export const updateSettings = (
  settings: Partial<HistoricalState['settings']>
): HistoricalAction => ({
  type: HistoricalActionTypes.UPDATE_SETTINGS,
  payload: settings,
});

export const resetSettings = (): HistoricalAction => ({
  type: HistoricalActionTypes.RESET_SETTINGS,
});

/**
 * General actions
 */
export const clearErrors = (): HistoricalAction => ({
  type: HistoricalActionTypes.CLEAR_ERRORS,
});

export const resetState = (): HistoricalAction => ({
  type: HistoricalActionTypes.RESET_STATE,
});

/**
 * Thunk action creators (for async operations)
 */
export const loadScenarios = () => {
  return {
    type: 'ASYNC_ACTION',
    action: 'LOAD_HISTORICAL_SCENARIOS',
  };
};

export const loadContext = (payload: LoadContextPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'LOAD_HISTORICAL_CONTEXT',
    payload,
  };
};

export const findAnalogies = (payload: FindAnalogiesPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'FIND_HISTORICAL_ANALOGIES',
    payload,
  };
};

export const calculateSimilarity = (payload: CalculateSimilarityPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'CALCULATE_HISTORICAL_SIMILARITY',
    payload,
  };
};

export const addScenario = (payload: AddScenarioPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'ADD_HISTORICAL_SCENARIO',
    payload,
  };
};

export const deleteScenario = (payload: DeleteScenarioPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'DELETE_HISTORICAL_SCENARIO',
    payload,
  };
};

export const performSearch = (payload: PerformSearchPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'PERFORM_HISTORICAL_SEARCH',
    payload,
  };
};