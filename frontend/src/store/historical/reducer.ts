/**
 * Historical store reducer
 */
import { HistoricalState, HistoricalAction, HistoricalActionTypes } from './types';

/**
 * Initial historical state
 */
const initialState: HistoricalState = {
  // Loading states
  scenariosLoading: false,
  contextLoading: false,
  analogiesLoading: false,
  similarityLoading: false,
  managementLoading: false,

  // Data
  availableScenarios: [],
  contextData: {},
  analogiesData: {},
  similarityData: {},
  historicalEvents: {},
  marketRegimes: {},

  // Current analysis
  currentScenarioKey: null,
  selectedAnalogies: [],
  currentMarketData: null,

  // UI state
  viewMode: 'timeline',
  selectedTimeRange: {
    start: new Date().getFullYear() - 10,
    end: new Date().getFullYear(),
    label: 'Last 10 years',
  },
  comparisonMode: false,

  // Analysis parameters
  analysisParameters: {
    similarityThreshold: 0.7,
    maxAnalogies: 10,
    includedMetrics: ['volatility', 'returns', 'correlation'],
    weightings: {
      volatility: 0.3,
      returns: 0.4,
      correlation: 0.3,
    },
  },

  // Cache
  cache: {
    scenariosCache: null,
    contextCache: {},
    analogiesCache: {},
    similarityCache: {},
  },

  // Search and filtering
  search: {
    query: '',
    filters: {
      timeRange: null,
      eventTypes: [],
      regions: [],
      assetClasses: [],
      severityLevels: [],
    },
    results: {
      events: [],
      regimes: [],
      analogies: [],
    },
  },

  // Errors
  errors: {
    scenarios: null,
    context: null,
    analogies: null,
    similarity: null,
    management: null,
  },

  // Settings
  settings: {
    autoLoadContext: true,
    cacheTimeout: 600000, // 10 minutes
    maxResults: 50,
    defaultMetrics: ['volatility', 'returns', 'correlation'],
    enableRealTimeUpdates: false,
  },
};

/**
 * Historical reducer
 */
export const historicalReducer = (
  state: HistoricalState = initialState,
  action: HistoricalAction
): HistoricalState => {
  switch (action.type) {
    // Scenarios
    case HistoricalActionTypes.LOAD_SCENARIOS_REQUEST:
      return {
        ...state,
        scenariosLoading: true,
        errors: {
          ...state.errors,
          scenarios: null,
        },
      };

    case HistoricalActionTypes.LOAD_SCENARIOS_SUCCESS:
      return {
        ...state,
        scenariosLoading: false,
        availableScenarios: action.payload.scenarios,
        cache: {
          ...state.cache,
          scenariosCache: {
            data: action.payload.scenarios,
            timestamp: Date.now(),
          },
        },
        errors: {
          ...state.errors,
          scenarios: null,
        },
      };

    case HistoricalActionTypes.LOAD_SCENARIOS_FAILURE:
      return {
        ...state,
        scenariosLoading: false,
        errors: {
          ...state.errors,
          scenarios: action.payload.error,
        },
      };

    // Context
    case HistoricalActionTypes.LOAD_CONTEXT_REQUEST:
      return {
        ...state,
        contextLoading: true,
        errors: {
          ...state.errors,
          context: null,
        },
      };

    case HistoricalActionTypes.LOAD_CONTEXT_SUCCESS:
      return {
        ...state,
        contextLoading: false,
        contextData: {
          ...state.contextData,
          [action.payload.scenarioKey]: action.payload.data,
        },
        cache: {
          ...state.cache,
          contextCache: {
            ...state.cache.contextCache,
            [action.payload.scenarioKey]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          context: null,
        },
      };

    case HistoricalActionTypes.LOAD_CONTEXT_FAILURE:
      return {
        ...state,
        contextLoading: false,
        errors: {
          ...state.errors,
          context: action.payload.error,
        },
      };

    // Analogies
    case HistoricalActionTypes.FIND_ANALOGIES_REQUEST:
      return {
        ...state,
        analogiesLoading: true,
        errors: {
          ...state.errors,
          analogies: null,
        },
      };

    case HistoricalActionTypes.FIND_ANALOGIES_SUCCESS:
      return {
        ...state,
        analogiesLoading: false,
        analogiesData: {
          ...state.analogiesData,
          [action.payload.cacheKey]: action.payload.data,
        },
        cache: {
          ...state.cache,
          analogiesCache: {
            ...state.cache.analogiesCache,
            [action.payload.cacheKey]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          analogies: null,
        },
      };

    case HistoricalActionTypes.FIND_ANALOGIES_FAILURE:
      return {
        ...state,
        analogiesLoading: false,
        errors: {
          ...state.errors,
          analogies: action.payload.error,
        },
      };

    // Similarity
    case HistoricalActionTypes.CALCULATE_SIMILARITY_REQUEST:
      return {
        ...state,
        similarityLoading: true,
        errors: {
          ...state.errors,
          similarity: null,
        },
      };

    case HistoricalActionTypes.CALCULATE_SIMILARITY_SUCCESS:
      return {
        ...state,
        similarityLoading: false,
        similarityData: {
          ...state.similarityData,
          [action.payload.cacheKey]: action.payload.data,
        },
        cache: {
          ...state.cache,
          similarityCache: {
            ...state.cache.similarityCache,
            [action.payload.cacheKey]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          similarity: null,
        },
      };

    case HistoricalActionTypes.CALCULATE_SIMILARITY_FAILURE:
      return {
        ...state,
        similarityLoading: false,
        errors: {
          ...state.errors,
          similarity: action.payload.error,
        },
      };

    // Scenario management
    case HistoricalActionTypes.ADD_SCENARIO_REQUEST:
    case HistoricalActionTypes.DELETE_SCENARIO_REQUEST:
      return {
        ...state,
        managementLoading: true,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_SCENARIO_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        availableScenarios: [...state.availableScenarios, action.payload.key],
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.DELETE_SCENARIO_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        availableScenarios: state.availableScenarios.filter(key => key !== action.payload.key),
        currentScenarioKey: state.currentScenarioKey === action.payload.key ? null : state.currentScenarioKey,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_SCENARIO_FAILURE:
    case HistoricalActionTypes.DELETE_SCENARIO_FAILURE:
      return {
        ...state,
        managementLoading: false,
        errors: {
          ...state.errors,
          management: action.payload.error,
        },
      };

    // Event management
    case HistoricalActionTypes.ADD_EVENT_REQUEST:
    case HistoricalActionTypes.UPDATE_EVENT_REQUEST:
    case HistoricalActionTypes.DELETE_EVENT_REQUEST:
      return {
        ...state,
        managementLoading: true,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_EVENT_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        historicalEvents: {
          ...state.historicalEvents,
          [action.payload.event.id]: action.payload.event,
        },
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.UPDATE_EVENT_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        historicalEvents: {
          ...state.historicalEvents,
          [action.payload.id]: action.payload.event,
        },
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.DELETE_EVENT_SUCCESS:
      const { [action.payload.id]: deletedEvent, ...remainingEvents } = state.historicalEvents;
      return {
        ...state,
        managementLoading: false,
        historicalEvents: remainingEvents,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_EVENT_FAILURE:
    case HistoricalActionTypes.UPDATE_EVENT_FAILURE:
    case HistoricalActionTypes.DELETE_EVENT_FAILURE:
      return {
        ...state,
        managementLoading: false,
        errors: {
          ...state.errors,
          management: action.payload.error,
        },
      };

    // Market regime management
    case HistoricalActionTypes.ADD_REGIME_REQUEST:
    case HistoricalActionTypes.UPDATE_REGIME_REQUEST:
    case HistoricalActionTypes.DELETE_REGIME_REQUEST:
      return {
        ...state,
        managementLoading: true,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_REGIME_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        marketRegimes: {
          ...state.marketRegimes,
          [action.payload.regime.id]: action.payload.regime,
        },
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.UPDATE_REGIME_SUCCESS:
      return {
        ...state,
        managementLoading: false,
        marketRegimes: {
          ...state.marketRegimes,
          [action.payload.id]: action.payload.regime,
        },
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.DELETE_REGIME_SUCCESS:
      const { [action.payload.id]: deletedRegime, ...remainingRegimes } = state.marketRegimes;
      return {
        ...state,
        managementLoading: false,
        marketRegimes: remainingRegimes,
        errors: {
          ...state.errors,
          management: null,
        },
      };

    case HistoricalActionTypes.ADD_REGIME_FAILURE:
    case HistoricalActionTypes.UPDATE_REGIME_FAILURE:
    case HistoricalActionTypes.DELETE_REGIME_FAILURE:
      return {
        ...state,
        managementLoading: false,
        errors: {
          ...state.errors,
          management: action.payload.error,
        },
      };

    // UI state actions
    case HistoricalActionTypes.SET_CURRENT_SCENARIO:
      return {
        ...state,
        currentScenarioKey: action.payload,
      };

    case HistoricalActionTypes.SET_SELECTED_ANALOGIES:
      return {
        ...state,
        selectedAnalogies: action.payload,
      };

    case HistoricalActionTypes.SET_CURRENT_MARKET_DATA:
      return {
        ...state,
        currentMarketData: action.payload,
      };

    case HistoricalActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case HistoricalActionTypes.SET_SELECTED_TIME_RANGE:
      return {
        ...state,
        selectedTimeRange: action.payload,
      };

    case HistoricalActionTypes.SET_COMPARISON_MODE:
      return {
        ...state,
        comparisonMode: action.payload,
      };

    // Parameters
    case HistoricalActionTypes.UPDATE_ANALYSIS_PARAMETERS:
      return {
        ...state,
        analysisParameters: {
          ...state.analysisParameters,
          ...action.payload,
        },
      };

    case HistoricalActionTypes.RESET_ANALYSIS_PARAMETERS:
      return {
        ...state,
        analysisParameters: initialState.analysisParameters,
      };

    // Search
    case HistoricalActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        search: {
          ...state.search,
          query: action.payload,
        },
      };

    case HistoricalActionTypes.SET_SEARCH_FILTERS:
      return {
        ...state,
        search: {
          ...state.search,
          filters: {
            ...state.search.filters,
            ...action.payload,
          },
        },
      };

    case HistoricalActionTypes.PERFORM_SEARCH_REQUEST:
      return {
        ...state,
        analogiesLoading: true,
        errors: {
          ...state.errors,
          analogies: null,
        },
      };

    case HistoricalActionTypes.PERFORM_SEARCH_SUCCESS:
      return {
        ...state,
        analogiesLoading: false,
        search: {
          ...state.search,
          results: action.payload.results,
        },
        errors: {
          ...state.errors,
          analogies: null,
        },
      };

    case HistoricalActionTypes.PERFORM_SEARCH_FAILURE:
      return {
        ...state,
        analogiesLoading: false,
        errors: {
          ...state.errors,
          analogies: action.payload.error,
        },
      };

    case HistoricalActionTypes.CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        search: {
          ...state.search,
          results: {
            events: [],
            regimes: [],
            analogies: [],
          },
        },
      };

    // Cache management
    case HistoricalActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: {
          scenariosCache: null,
          contextCache: {},
          analogiesCache: {},
          similarityCache: {},
        },
      };

    case HistoricalActionTypes.CLEAR_CONTEXT_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          contextCache: {},
        },
      };

    case HistoricalActionTypes.CLEAR_ANALOGIES_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          analogiesCache: {},
        },
      };

    case HistoricalActionTypes.CLEAR_SIMILARITY_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          similarityCache: {},
        },
      };

    // Settings
    case HistoricalActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case HistoricalActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings,
      };

    // General actions
    case HistoricalActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {
          scenarios: null,
          context: null,
          analogies: null,
          similarity: null,
          management: null,
        },
      };

    case HistoricalActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default historicalReducer;