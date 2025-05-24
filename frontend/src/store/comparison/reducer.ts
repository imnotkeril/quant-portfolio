/**
 * Comparison store reducer
 */
import { ComparisonState, ComparisonAction, ComparisonActionTypes, initialComparisonState } from './types';

/**
 * Comparison reducer
 */
export const comparisonReducer = (
  state: ComparisonState = initialComparisonState,
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
      // Validate portfolios array
      const validatedPortfolios = Array.isArray(action.payload)
        ? action.payload.filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
        : [];

      return {
        ...state,
        selectedPortfolios: validatedPortfolios,
        // Clear active comparison if portfolios changed
        activeComparison: validatedPortfolios.length < 2 ? null : state.activeComparison,
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
      // Validate metrics array
      const validatedMetrics = Array.isArray(action.payload)
        ? action.payload.filter(Boolean) // Remove empty values
        : state.selectedMetrics;

      return {
        ...state,
        selectedMetrics: validatedMetrics,
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
      // Validate date range
      const { startDate, endDate } = action.payload;
      let validatedDateRange = { startDate, endDate };

      if (startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Invalid date format in date range');
            validatedDateRange = { startDate: null, endDate: null };
          } else if (start >= end) {
            console.warn('Invalid date range: start date must be before end date');
            validatedDateRange = { startDate: null, endDate: null };
          }
        } catch (error) {
          console.warn('Error parsing date range:', error);
          validatedDateRange = { startDate: null, endDate: null };
        }
      }

      return {
        ...state,
        filters: {
          ...state.filters,
          dateRange: validatedDateRange,
        },
      };

    // Parameters actions
    case ComparisonActionTypes.UPDATE_PARAMETERS:
      // Validate parameters
      const updatedParams = { ...action.payload };

      // Ensure confidence level is between 0 and 1
      if (updatedParams.confidenceLevel !== undefined) {
        updatedParams.confidenceLevel = Math.max(0, Math.min(1, updatedParams.confidenceLevel));
      }

      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...updatedParams,
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
      // Validate settings
      const updatedSettings = { ...action.payload };

      // Ensure intervals are positive numbers
      if (updatedSettings.refreshInterval !== undefined) {
        updatedSettings.refreshInterval = Math.max(1000, updatedSettings.refreshInterval); // Min 1 second
      }

      if (updatedSettings.cacheTimeout !== undefined) {
        updatedSettings.cacheTimeout = Math.max(10000, updatedSettings.cacheTimeout); // Min 10 seconds
      }

      if (updatedSettings.maxComparisons !== undefined) {
        updatedSettings.maxComparisons = Math.max(1, Math.min(50, updatedSettings.maxComparisons)); // 1-50 range
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          ...updatedSettings,
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
      return initialComparisonState;

    default:
      return state;
  }
};

export default comparisonReducer;