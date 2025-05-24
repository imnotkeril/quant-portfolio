/**
 * Comparison store reducer
 */
import { ComparisonState, ComparisonAction, ComparisonActionTypes } from './types';

/**
 * Initial comparison state
 */
const initialState: ComparisonState = {
  // Loading states
  comparisonLoading: false,
  compositionLoading: false,
  performanceLoading: false,
  riskLoading: false,
  sectorLoading: false,
  scenarioLoading: false,
  differentialLoading: false,

  // Data
  comparisons: {},
  compositionComparisons: {},
  performanceComparisons: {},
  riskComparisons: {},
  sectorComparisons: {},
  scenarioComparisons: {},
  differentialReturns: {},

  // Current comparison
  activeComparison: null,
  selectedPortfolios: [],
  benchmarkPortfolio: null,

  // UI state
  viewMode: 'overview',
  displayMode: 'absolute',
  selectedMetrics: ['totalReturn', 'sharpeRatio', 'volatility', 'maxDrawdown'],
  selectedTimeframe: '1Y',

  // Filters and grouping
  filters: {
    dateRange: {
      startDate: null,
      endDate: null,
    },
    includeOnly: [],
    excludeMetrics: [],
    minDifference: 0.01,
  },

  // Comparison parameters
  parameters: {
    confidenceLevel: 0.95,
    includeStatisticalTests: true,
    adjustForRisk: true,
    normalizeReturns: false,
    includeBenchmark: true,
  },

  // Cache
  cache: {
    comparisonCache: {},
    compositionCache: {},
    performanceCache: {},
    riskCache: {},
    sectorCache: {},
    scenarioCache: {},
    differentialCache: {},
  },

  // Errors
  errors: {
    comparison: null,
    composition: null,
    performance: null,
    risk: null,
    sector: null,
    scenario: null,
    differential: null,
  },

  // Settings
  settings: {
    autoRefresh: false,
    refreshInterval: 300000, // 5 minutes
    cacheTimeout: 600000, // 10 minutes
    maxComparisons: 10,
    defaultMetrics: ['totalReturn', 'sharpeRatio', 'volatility', 'maxDrawdown'],
    enableNotifications: true,
  },
};

/**
 * Comparison reducer
 */
export const comparisonReducer = (
  state: ComparisonState = initialState,
  action: ComparisonAction
): ComparisonState => {
  switch (action.type) {
    // Portfolio comparison
    case ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST:
      return {
        ...state,
        comparisonLoading: true,
        errors: {
          ...state.errors,
          comparison: null,
        },
      };

    case ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS:
      return {
        ...state,
        comparisonLoading: false,
        comparisons: {
          ...state.comparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          comparisonCache: {
            ...state.cache.comparisonCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          comparison: null,
        },
      };

    case ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE:
      return {
        ...state,
        comparisonLoading: false,
        errors: {
          ...state.errors,
          comparison: action.payload.error,
        },
      };

    // Composition comparison
    case ComparisonActionTypes.COMPARE_COMPOSITION_REQUEST:
      return {
        ...state,
        compositionLoading: true,
        errors: {
          ...state.errors,
          composition: null,
        },
      };

    case ComparisonActionTypes.COMPARE_COMPOSITION_SUCCESS:
      return {
        ...state,
        compositionLoading: false,
        compositionComparisons: {
          ...state.compositionComparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          compositionCache: {
            ...state.cache.compositionCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          composition: null,
        },
      };

    case ComparisonActionTypes.COMPARE_COMPOSITION_FAILURE:
      return {
        ...state,
        compositionLoading: false,
        errors: {
          ...state.errors,
          composition: action.payload.error,
        },
      };

    // Performance comparison
    case ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST:
      return {
        ...state,
        performanceLoading: true,
        errors: {
          ...state.errors,
          performance: null,
        },
      };

    case ComparisonActionTypes.COMPARE_PERFORMANCE_SUCCESS:
      return {
        ...state,
        performanceLoading: false,
        performanceComparisons: {
          ...state.performanceComparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          performanceCache: {
            ...state.cache.performanceCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          performance: null,
        },
      };

    case ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE:
      return {
        ...state,
        performanceLoading: false,
        errors: {
          ...state.errors,
          performance: action.payload.error,
        },
      };

    // Risk comparison
    case ComparisonActionTypes.COMPARE_RISK_REQUEST:
      return {
        ...state,
        riskLoading: true,
        errors: {
          ...state.errors,
          risk: null,
        },
      };

    case ComparisonActionTypes.COMPARE_RISK_SUCCESS:
      return {
        ...state,
        riskLoading: false,
        riskComparisons: {
          ...state.riskComparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          riskCache: {
            ...state.cache.riskCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          risk: null,
        },
      };

    case ComparisonActionTypes.COMPARE_RISK_FAILURE:
      return {
        ...state,
        riskLoading: false,
        errors: {
          ...state.errors,
          risk: action.payload.error,
        },
      };

    // Sector comparison
    case ComparisonActionTypes.COMPARE_SECTORS_REQUEST:
      return {
        ...state,
        sectorLoading: true,
        errors: {
          ...state.errors,
          sector: null,
        },
      };

    case ComparisonActionTypes.COMPARE_SECTORS_SUCCESS:
      return {
        ...state,
        sectorLoading: false,
        sectorComparisons: {
          ...state.sectorComparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          sectorCache: {
            ...state.cache.sectorCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          sector: null,
        },
      };

    case ComparisonActionTypes.COMPARE_SECTORS_FAILURE:
      return {
        ...state,
        sectorLoading: false,
        errors: {
          ...state.errors,
          sector: action.payload.error,
        },
      };

    // Scenario comparison
    case ComparisonActionTypes.COMPARE_SCENARIOS_REQUEST:
      return {
        ...state,
        scenarioLoading: true,
        errors: {
          ...state.errors,
          scenario: null,
        },
      };

    case ComparisonActionTypes.COMPARE_SCENARIOS_SUCCESS:
      return {
        ...state,
        scenarioLoading: false,
        scenarioComparisons: {
          ...state.scenarioComparisons,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          scenarioCache: {
            ...state.cache.scenarioCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          scenario: null,
        },
      };

    case ComparisonActionTypes.COMPARE_SCENARIOS_FAILURE:
      return {
        ...state,
        scenarioLoading: false,
        errors: {
          ...state.errors,
          scenario: action.payload.error,
        },
      };

    // Differential returns
    case ComparisonActionTypes.CALCULATE_DIFFERENTIAL_REQUEST:
      return {
        ...state,
        differentialLoading: true,
        errors: {
          ...state.errors,
          differential: null,
        },
      };

    case ComparisonActionTypes.CALCULATE_DIFFERENTIAL_SUCCESS:
      return {
        ...state,
        differentialLoading: false,
        differentialReturns: {
          ...state.differentialReturns,
          [action.payload.comparisonId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          differentialCache: {
            ...state.cache.differentialCache,
            [action.payload.comparisonId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          differential: null,
        },
      };

    case ComparisonActionTypes.CALCULATE_DIFFERENTIAL_FAILURE:
      return {
        ...state,
        differentialLoading: false,
        errors: {
          ...state.errors,
          differential: action.payload.error,
        },
      };

    // UI state actions
    case ComparisonActionTypes.SET_ACTIVE_COMPARISON:
      return {
        ...state,
        activeComparison: action.payload,
      };

    case ComparisonActionTypes.SET_SELECTED_PORTFOLIOS:
      return {
        ...state,
        selectedPortfolios: action.payload,
      };

    case ComparisonActionTypes.SET_BENCHMARK_PORTFOLIO:
      return {
        ...state,
        benchmarkPortfolio: action.payload,
      };

    case ComparisonActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case ComparisonActionTypes.SET_DISPLAY_MODE:
      return {
        ...state,
        displayMode: action.payload,
      };

    case ComparisonActionTypes.SET_SELECTED_METRICS:
      return {
        ...state,
        selectedMetrics: action.payload,
      };

    case ComparisonActionTypes.SET_SELECTED_TIMEFRAME:
      return {
        ...state,
        selectedTimeframe: action.payload,
      };

    // Filter actions
    case ComparisonActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ComparisonActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: {
          dateRange: {
            startDate: null,
            endDate: null,
          },
          includeOnly: [],
          excludeMetrics: [],
          minDifference: 0.01,
        },
      };

    case ComparisonActionTypes.SET_DATE_RANGE:
      return {
        ...state,
        filters: {
          ...state.filters,
          dateRange: {
            startDate: action.payload.startDate,
            endDate: action.payload.endDate,
          },
        },
      };

    // Parameters actions
    case ComparisonActionTypes.UPDATE_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...action.payload,
        },
      };

    case ComparisonActionTypes.RESET_PARAMETERS:
      return {
        ...state,
        parameters: {
          confidenceLevel: 0.95,
          includeStatisticalTests: true,
          adjustForRisk: true,
          normalizeReturns: false,
          includeBenchmark: true,
        },
      };

    // Cache management
    case ComparisonActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: {
          comparisonCache: {},
          compositionCache: {},
          performanceCache: {},
          riskCache: {},
          sectorCache: {},
          scenarioCache: {},
          differentialCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_COMPARISON_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          comparisonCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_COMPOSITION_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          compositionCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_PERFORMANCE_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          performanceCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_RISK_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          riskCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_SECTOR_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          sectorCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_SCENARIO_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          scenarioCache: {},
        },
      };

    case ComparisonActionTypes.CLEAR_DIFFERENTIAL_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          differentialCache: {},
        },
      };

    // Settings
    case ComparisonActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ComparisonActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: {
          autoRefresh: false,
          refreshInterval: 300000, // 5 minutes
          cacheTimeout: 600000, // 10 minutes
          maxComparisons: 10,
          defaultMetrics: ['totalReturn', 'sharpeRatio', 'volatility', 'maxDrawdown'],
          enableNotifications: true,
        },
      };

    // General actions
    case ComparisonActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {
          comparison: null,
          composition: null,
          performance: null,
          risk: null,
          sector: null,
          scenario: null,
          differential: null,
        },
      };

    case ComparisonActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default comparisonReducer;