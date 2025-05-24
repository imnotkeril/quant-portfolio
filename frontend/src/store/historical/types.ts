/**
 * Historical store types
 */
import {
  HistoricalScenariosResponse,
  HistoricalContextResponse,
  HistoricalAnalogiesResponse,
  HistoricalSimilarityResponse,
  HistoricalContextRequest,
  HistoricalAnalogiesRequest,
  HistoricalSimilarityRequest,
  HistoricalScenarioRequest,
  HistoricalEvent,
  MarketRegime,
  HistoricalAnalogyData,
} from '../../types/historical';
import { ApiError } from '../../types/common';

/**
 * Historical analysis state
 */
export interface HistoricalState {
  // Loading states
  scenariosLoading: boolean;
  contextLoading: boolean;
  analogiesLoading: boolean;
  similarityLoading: boolean;
  managementLoading: boolean;

  // Data
  availableScenarios: string[];
  contextData: Record<string, HistoricalContextResponse>;
  analogiesData: Record<string, HistoricalAnalogiesResponse>;
  similarityData: Record<string, HistoricalSimilarityResponse>;
  historicalEvents: Record<string, HistoricalEvent>;
  marketRegimes: Record<string, MarketRegime>;

  // Current analysis
  currentScenarioKey: string | null;
  selectedAnalogies: string[];
  currentMarketData: any | null;

  // UI state
  viewMode: HistoricalViewMode;
  selectedTimeRange: TimeRange;
  comparisonMode: boolean;

  // Analysis parameters
  analysisParameters: {
    similarityThreshold: number;
    maxAnalogies: number;
    includedMetrics: string[];
    weightings: Record<string, number>;
  };

  // Cache
  cache: {
    scenariosCache: { data: string[]; timestamp: number } | null;
    contextCache: Record<string, { data: HistoricalContextResponse; timestamp: number }>;
    analogiesCache: Record<string, { data: HistoricalAnalogiesResponse; timestamp: number }>;
    similarityCache: Record<string, { data: HistoricalSimilarityResponse; timestamp: number }>;
  };

  // Search and filtering
  search: {
    query: string;
    filters: {
      timeRange: [number, number] | null;
      eventTypes: string[];
      regions: string[];
      assetClasses: string[];
      severityLevels: string[];
    };
    results: {
      events: HistoricalEvent[];
      regimes: MarketRegime[];
      analogies: HistoricalAnalogyData[];
    };
  };

  // Errors
  errors: {
    scenarios: ApiError | null;
    context: ApiError | null;
    analogies: ApiError | null;
    similarity: ApiError | null;
    management: ApiError | null;
  };

  // Settings
  settings: {
    autoLoadContext: boolean;
    cacheTimeout: number;
    maxResults: number;
    defaultMetrics: string[];
    enableRealTimeUpdates: boolean;
  };
}

/**
 * Historical view modes
 */
export type HistoricalViewMode =
  | 'timeline'
  | 'analogies'
  | 'context'
  | 'comparison'
  | 'search';

/**
 * Time range for historical analysis
 */
export interface TimeRange {
  start: number;
  end: number;
  label: string;
}

/**
 * Historical action types
 */
export enum HistoricalActionTypes {
  // Scenarios actions
  LOAD_SCENARIOS_REQUEST = 'historical/LOAD_SCENARIOS_REQUEST',
  LOAD_SCENARIOS_SUCCESS = 'historical/LOAD_SCENARIOS_SUCCESS',
  LOAD_SCENARIOS_FAILURE = 'historical/LOAD_SCENARIOS_FAILURE',

  // Context actions
  LOAD_CONTEXT_REQUEST = 'historical/LOAD_CONTEXT_REQUEST',
  LOAD_CONTEXT_SUCCESS = 'historical/LOAD_CONTEXT_SUCCESS',
  LOAD_CONTEXT_FAILURE = 'historical/LOAD_CONTEXT_FAILURE',

  // Analogies actions
  FIND_ANALOGIES_REQUEST = 'historical/FIND_ANALOGIES_REQUEST',
  FIND_ANALOGIES_SUCCESS = 'historical/FIND_ANALOGIES_SUCCESS',
  FIND_ANALOGIES_FAILURE = 'historical/FIND_ANALOGIES_FAILURE',

  // Similarity actions
  CALCULATE_SIMILARITY_REQUEST = 'historical/CALCULATE_SIMILARITY_REQUEST',
  CALCULATE_SIMILARITY_SUCCESS = 'historical/CALCULATE_SIMILARITY_SUCCESS',
  CALCULATE_SIMILARITY_FAILURE = 'historical/CALCULATE_SIMILARITY_FAILURE',

  // Management actions
  ADD_SCENARIO_REQUEST = 'historical/ADD_SCENARIO_REQUEST',
  ADD_SCENARIO_SUCCESS = 'historical/ADD_SCENARIO_SUCCESS',
  ADD_SCENARIO_FAILURE = 'historical/ADD_SCENARIO_FAILURE',

  DELETE_SCENARIO_REQUEST = 'historical/DELETE_SCENARIO_REQUEST',
  DELETE_SCENARIO_SUCCESS = 'historical/DELETE_SCENARIO_SUCCESS',
  DELETE_SCENARIO_FAILURE = 'historical/DELETE_SCENARIO_FAILURE',

  // Event management actions
  ADD_EVENT_REQUEST = 'historical/ADD_EVENT_REQUEST',
  ADD_EVENT_SUCCESS = 'historical/ADD_EVENT_SUCCESS',
  ADD_EVENT_FAILURE = 'historical/ADD_EVENT_FAILURE',

  UPDATE_EVENT_REQUEST = 'historical/UPDATE_EVENT_REQUEST',
  UPDATE_EVENT_SUCCESS = 'historical/UPDATE_EVENT_SUCCESS',
  UPDATE_EVENT_FAILURE = 'historical/UPDATE_EVENT_FAILURE',

  DELETE_EVENT_REQUEST = 'historical/DELETE_EVENT_REQUEST',
  DELETE_EVENT_SUCCESS = 'historical/DELETE_EVENT_SUCCESS',
  DELETE_EVENT_FAILURE = 'historical/DELETE_EVENT_FAILURE',

  // Market regime actions
  ADD_REGIME_REQUEST = 'historical/ADD_REGIME_REQUEST',
  ADD_REGIME_SUCCESS = 'historical/ADD_REGIME_SUCCESS',
  ADD_REGIME_FAILURE = 'historical/ADD_REGIME_FAILURE',

  UPDATE_REGIME_REQUEST = 'historical/UPDATE_REGIME_REQUEST',
  UPDATE_REGIME_SUCCESS = 'historical/UPDATE_REGIME_SUCCESS',
  UPDATE_REGIME_FAILURE = 'historical/UPDATE_REGIME_FAILURE',

  DELETE_REGIME_REQUEST = 'historical/DELETE_REGIME_REQUEST',
  DELETE_REGIME_SUCCESS = 'historical/DELETE_REGIME_SUCCESS',
  DELETE_REGIME_FAILURE = 'historical/DELETE_REGIME_FAILURE',

  // UI state actions
  SET_CURRENT_SCENARIO = 'historical/SET_CURRENT_SCENARIO',
  SET_SELECTED_ANALOGIES = 'historical/SET_SELECTED_ANALOGIES',
  SET_CURRENT_MARKET_DATA = 'historical/SET_CURRENT_MARKET_DATA',
  SET_VIEW_MODE = 'historical/SET_VIEW_MODE',
  SET_SELECTED_TIME_RANGE = 'historical/SET_SELECTED_TIME_RANGE',
  SET_COMPARISON_MODE = 'historical/SET_COMPARISON_MODE',

  // Parameters actions
  UPDATE_ANALYSIS_PARAMETERS = 'historical/UPDATE_ANALYSIS_PARAMETERS',
  RESET_ANALYSIS_PARAMETERS = 'historical/RESET_ANALYSIS_PARAMETERS',

  // Search actions
  SET_SEARCH_QUERY = 'historical/SET_SEARCH_QUERY',
  SET_SEARCH_FILTERS = 'historical/SET_SEARCH_FILTERS',
  PERFORM_SEARCH_REQUEST = 'historical/PERFORM_SEARCH_REQUEST',
  PERFORM_SEARCH_SUCCESS = 'historical/PERFORM_SEARCH_SUCCESS',
  PERFORM_SEARCH_FAILURE = 'historical/PERFORM_SEARCH_FAILURE',
  CLEAR_SEARCH_RESULTS = 'historical/CLEAR_SEARCH_RESULTS',

  // Cache actions
  CLEAR_CACHE = 'historical/CLEAR_CACHE',
  CLEAR_CONTEXT_CACHE = 'historical/CLEAR_CONTEXT_CACHE',
  CLEAR_ANALOGIES_CACHE = 'historical/CLEAR_ANALOGIES_CACHE',
  CLEAR_SIMILARITY_CACHE = 'historical/CLEAR_SIMILARITY_CACHE',

  // Settings actions
  UPDATE_SETTINGS = 'historical/UPDATE_SETTINGS',
  RESET_SETTINGS = 'historical/RESET_SETTINGS',

  // General actions
  CLEAR_ERRORS = 'historical/CLEAR_ERRORS',
  RESET_STATE = 'historical/RESET_STATE',
}

/**
 * Request payload types
 */
export interface LoadContextPayload {
  request: HistoricalContextRequest;
}

export interface FindAnalogiesPayload {
  request: HistoricalAnalogiesRequest;
  cacheKey: string;
}

export interface CalculateSimilarityPayload {
  request: HistoricalSimilarityRequest;
  cacheKey: string;
}

export interface AddScenarioPayload {
  request: HistoricalScenarioRequest;
}

export interface DeleteScenarioPayload {
  key: string;
}

export interface AddEventPayload {
  event: HistoricalEvent;
}

export interface UpdateEventPayload {
  id: string;
  updates: Partial<HistoricalEvent>;
}

export interface DeleteEventPayload {
  id: string;
}

export interface AddRegimePayload {
  regime: MarketRegime;
}

export interface UpdateRegimePayload {
  id: string;
  updates: Partial<MarketRegime>;
}

export interface DeleteRegimePayload {
  id: string;
}

export interface PerformSearchPayload {
  query: string;
  filters: HistoricalState['search']['filters'];
}

/**
 * Historical action interfaces
 */
export interface LoadScenariosRequestAction {
  type: HistoricalActionTypes.LOAD_SCENARIOS_REQUEST;
}

export interface LoadScenariosSuccessAction {
  type: HistoricalActionTypes.LOAD_SCENARIOS_SUCCESS;
  payload: HistoricalScenariosResponse;
}

export interface LoadScenariosFailureAction {
  type: HistoricalActionTypes.LOAD_SCENARIOS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface LoadContextRequestAction {
  type: HistoricalActionTypes.LOAD_CONTEXT_REQUEST;
  payload: LoadContextPayload;
}

export interface LoadContextSuccessAction {
  type: HistoricalActionTypes.LOAD_CONTEXT_SUCCESS;
  payload: {
    scenarioKey: string;
    data: HistoricalContextResponse;
  };
}

export interface LoadContextFailureAction {
  type: HistoricalActionTypes.LOAD_CONTEXT_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface FindAnalogiesRequestAction {
  type: HistoricalActionTypes.FIND_ANALOGIES_REQUEST;
  payload: FindAnalogiesPayload;
}

export interface FindAnalogiesSuccessAction {
  type: HistoricalActionTypes.FIND_ANALOGIES_SUCCESS;
  payload: {
    cacheKey: string;
    data: HistoricalAnalogiesResponse;
  };
}

export interface FindAnalogiesFailureAction {
  type: HistoricalActionTypes.FIND_ANALOGIES_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CalculateSimilarityRequestAction {
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_REQUEST;
  payload: CalculateSimilarityPayload;
}

export interface CalculateSimilaritySuccessAction {
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_SUCCESS;
  payload: {
    cacheKey: string;
    data: HistoricalSimilarityResponse;
  };
}

export interface CalculateSimilarityFailureAction {
  type: HistoricalActionTypes.CALCULATE_SIMILARITY_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface AddScenarioRequestAction {
  type: HistoricalActionTypes.ADD_SCENARIO_REQUEST;
  payload: AddScenarioPayload;
}

export interface AddScenarioSuccessAction {
  type: HistoricalActionTypes.ADD_SCENARIO_SUCCESS;
  payload: {
    key: string;
  };
}

export interface AddScenarioFailureAction {
  type: HistoricalActionTypes.ADD_SCENARIO_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface DeleteScenarioRequestAction {
  type: HistoricalActionTypes.DELETE_SCENARIO_REQUEST;
  payload: DeleteScenarioPayload;
}

export interface DeleteScenarioSuccessAction {
  type: HistoricalActionTypes.DELETE_SCENARIO_SUCCESS;
  payload: {
    key: string;
  };
}

export interface DeleteScenarioFailureAction {
  type: HistoricalActionTypes.DELETE_SCENARIO_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface AddEventRequestAction {
  type: HistoricalActionTypes.ADD_EVENT_REQUEST;
  payload: AddEventPayload;
}

export interface AddEventSuccessAction {
  type: HistoricalActionTypes.ADD_EVENT_SUCCESS;
  payload: {
    event: HistoricalEvent;
  };
}

export interface AddEventFailureAction {
  type: HistoricalActionTypes.ADD_EVENT_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface UpdateEventRequestAction {
  type: HistoricalActionTypes.UPDATE_EVENT_REQUEST;
  payload: UpdateEventPayload;
}

export interface UpdateEventSuccessAction {
  type: HistoricalActionTypes.UPDATE_EVENT_SUCCESS;
  payload: {
    id: string;
    event: HistoricalEvent;
  };
}

export interface UpdateEventFailureAction {
  type: HistoricalActionTypes.UPDATE_EVENT_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface DeleteEventRequestAction {
  type: HistoricalActionTypes.DELETE_EVENT_REQUEST;
  payload: DeleteEventPayload;
}

export interface DeleteEventSuccessAction {
  type: HistoricalActionTypes.DELETE_EVENT_SUCCESS;
  payload: {
    id: string;
  };
}

export interface DeleteEventFailureAction {
  type: HistoricalActionTypes.DELETE_EVENT_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface AddRegimeRequestAction {
  type: HistoricalActionTypes.ADD_REGIME_REQUEST;
  payload: AddRegimePayload;
}

export interface AddRegimeSuccessAction {
  type: HistoricalActionTypes.ADD_REGIME_SUCCESS;
  payload: {
    regime: MarketRegime;
  };
}

export interface AddRegimeFailureAction {
  type: HistoricalActionTypes.ADD_REGIME_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface UpdateRegimeRequestAction {
  type: HistoricalActionTypes.UPDATE_REGIME_REQUEST;
  payload: UpdateRegimePayload;
}

export interface UpdateRegimeSuccessAction {
  type: HistoricalActionTypes.UPDATE_REGIME_SUCCESS;
  payload: {
    id: string;
    regime: MarketRegime;
  };
}

export interface UpdateRegimeFailureAction {
  type: HistoricalActionTypes.UPDATE_REGIME_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface DeleteRegimeRequestAction {
  type: HistoricalActionTypes.DELETE_REGIME_REQUEST;
  payload: DeleteRegimePayload;
}

export interface DeleteRegimeSuccessAction {
  type: HistoricalActionTypes.DELETE_REGIME_SUCCESS;
  payload: {
    id: string;
  };
}

export interface DeleteRegimeFailureAction {
  type: HistoricalActionTypes.DELETE_REGIME_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface SetCurrentScenarioAction {
  type: HistoricalActionTypes.SET_CURRENT_SCENARIO;
  payload: string | null;
}

export interface SetSelectedAnalogiesAction {
  type: HistoricalActionTypes.SET_SELECTED_ANALOGIES;
  payload: string[];
}

export interface SetCurrentMarketDataAction {
  type: HistoricalActionTypes.SET_CURRENT_MARKET_DATA;
  payload: any;
}

export interface SetViewModeAction {
  type: HistoricalActionTypes.SET_VIEW_MODE;
  payload: HistoricalViewMode;
}

export interface SetSelectedTimeRangeAction {
  type: HistoricalActionTypes.SET_SELECTED_TIME_RANGE;
  payload: TimeRange;
}

export interface SetComparisonModeAction {
  type: HistoricalActionTypes.SET_COMPARISON_MODE;
  payload: boolean;
}

export interface UpdateAnalysisParametersAction {
  type: HistoricalActionTypes.UPDATE_ANALYSIS_PARAMETERS;
  payload: Partial<HistoricalState['analysisParameters']>;
}

export interface ResetAnalysisParametersAction {
  type: HistoricalActionTypes.RESET_ANALYSIS_PARAMETERS;
}

export interface SetSearchQueryAction {
  type: HistoricalActionTypes.SET_SEARCH_QUERY;
  payload: string;
}

export interface SetSearchFiltersAction {
  type: HistoricalActionTypes.SET_SEARCH_FILTERS;
  payload: Partial<HistoricalState['search']['filters']>;
}

export interface PerformSearchRequestAction {
  type: HistoricalActionTypes.PERFORM_SEARCH_REQUEST;
  payload: PerformSearchPayload;
}

export interface PerformSearchSuccessAction {
  type: HistoricalActionTypes.PERFORM_SEARCH_SUCCESS;
  payload: {
    results: HistoricalState['search']['results'];
  };
}

export interface PerformSearchFailureAction {
  type: HistoricalActionTypes.PERFORM_SEARCH_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface ClearSearchResultsAction {
  type: HistoricalActionTypes.CLEAR_SEARCH_RESULTS;
}

export interface ClearCacheAction {
  type: HistoricalActionTypes.CLEAR_CACHE;
}

export interface ClearContextCacheAction {
  type: HistoricalActionTypes.CLEAR_CONTEXT_CACHE;
}

export interface ClearAnalogiesCacheAction {
  type: HistoricalActionTypes.CLEAR_ANALOGIES_CACHE;
}

export interface ClearSimilarityCacheAction {
  type: HistoricalActionTypes.CLEAR_SIMILARITY_CACHE;
}

export interface UpdateSettingsAction {
  type: HistoricalActionTypes.UPDATE_SETTINGS;
  payload: Partial<HistoricalState['settings']>;
}

export interface ResetSettingsAction {
  type: HistoricalActionTypes.RESET_SETTINGS;
}

export interface ClearErrorsAction {
  type: HistoricalActionTypes.CLEAR_ERRORS;
}

export interface ResetStateAction {
  type: HistoricalActionTypes.RESET_STATE;
}

/**
 * Historical action union type
 */
export type HistoricalAction =
  | LoadScenariosRequestAction
  | LoadScenariosSuccessAction
  | LoadScenariosFailureAction
  | LoadContextRequestAction
  | LoadContextSuccessAction
  | LoadContextFailureAction
  | FindAnalogiesRequestAction
  | FindAnalogiesSuccessAction
  | FindAnalogiesFailureAction
  | CalculateSimilarityRequestAction
  | CalculateSimilaritySuccessAction
  | CalculateSimilarityFailureAction
  | AddScenarioRequestAction
  | AddScenarioSuccessAction
  | AddScenarioFailureAction
  | DeleteScenarioRequestAction
  | DeleteScenarioSuccessAction
  | DeleteScenarioFailureAction
  | AddEventRequestAction
  | AddEventSuccessAction
  | AddEventFailureAction
  | UpdateEventRequestAction
  | UpdateEventSuccessAction
  | UpdateEventFailureAction
  | DeleteEventRequestAction
  | DeleteEventSuccessAction
  | DeleteEventFailureAction
  | AddRegimeRequestAction
  | AddRegimeSuccessAction
  | AddRegimeFailureAction
  | UpdateRegimeRequestAction
  | UpdateRegimeSuccessAction
  | UpdateRegimeFailureAction
  | DeleteRegimeRequestAction
  | DeleteRegimeSuccessAction
  | DeleteRegimeFailureAction
  | SetCurrentScenarioAction
  | SetSelectedAnalogiesAction
  | SetCurrentMarketDataAction
  | SetViewModeAction
  | SetSelectedTimeRangeAction
  | SetComparisonModeAction
  | UpdateAnalysisParametersAction
  | ResetAnalysisParametersAction
  | SetSearchQueryAction
  | SetSearchFiltersAction
  | PerformSearchRequestAction
  | PerformSearchSuccessAction
  | PerformSearchFailureAction
  | ClearSearchResultsAction
  | ClearCacheAction
  | ClearContextCacheAction
  | ClearAnalogiesCacheAction
  | ClearSimilarityCacheAction
  | UpdateSettingsAction
  | ResetSettingsAction
  | ClearErrorsAction
  | ResetStateAction;