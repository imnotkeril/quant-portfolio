/**
 * Risk store reducer
 */
import { RiskState, RiskAction, RiskActionTypes } from './types';

/**
 * Initial risk state
 */
const initialState: RiskState = {
  // Loading states
  varLoading: false,
  stressTestLoading: false,
  monteCarloLoading: false,
  drawdownsLoading: false,
  riskContributionLoading: false,

  // Data
  varResults: {},
  stressTestResults: {},
  monteCarloResults: {},
  drawdownResults: {},
  riskContributionResults: {},

  // Current analysis
  currentPortfolioId: null,
  currentAnalysisType: null,

  // UI state
  selectedScenarios: [],
  selectedConfidenceLevels: [0.95],
  selectedTimeHorizons: [1],

  // Cache
  cache: {
    varCache: {},
    stressTestCache: {},
    monteCarloCache: {},
  },

  // Errors
  errors: {
    var: null,
    stressTest: null,
    monteCarlo: null,
    drawdowns: null,
    riskContribution: null,
  },

  // Settings
  settings: {
    defaultConfidenceLevel: 0.95,
    defaultTimeHorizon: 1,
    defaultSimulations: 1000,
    autoRefresh: false,
    refreshInterval: 300000, // 5 minutes
  },
};

/**
 * Risk reducer
 */
export const riskReducer = (
  state: RiskState = initialState,
  action: RiskAction
): RiskState => {
  switch (action.type) {
    // VaR calculation
    case RiskActionTypes.CALCULATE_VAR_REQUEST:
      return {
        ...state,
        varLoading: true,
        errors: {
          ...state.errors,
          var: null,
        },
      };

    case RiskActionTypes.CALCULATE_VAR_SUCCESS:
      return {
        ...state,
        varLoading: false,
        varResults: {
          ...state.varResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          varCache: {
            ...state.cache.varCache,
            [action.payload.portfolioId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          var: null,
        },
      };

    case RiskActionTypes.CALCULATE_VAR_FAILURE:
      return {
        ...state,
        varLoading: false,
        errors: {
          ...state.errors,
          var: action.payload.error,
        },
      };

    // Stress test
    case RiskActionTypes.PERFORM_STRESS_TEST_REQUEST:
      return {
        ...state,
        stressTestLoading: true,
        errors: {
          ...state.errors,
          stressTest: null,
        },
      };

    case RiskActionTypes.PERFORM_STRESS_TEST_SUCCESS:
      return {
        ...state,
        stressTestLoading: false,
        stressTestResults: {
          ...state.stressTestResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          stressTestCache: {
            ...state.cache.stressTestCache,
            [action.payload.portfolioId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          stressTest: null,
        },
      };

    case RiskActionTypes.PERFORM_STRESS_TEST_FAILURE:
      return {
        ...state,
        stressTestLoading: false,
        errors: {
          ...state.errors,
          stressTest: action.payload.error,
        },
      };

    // Monte Carlo simulation
    case RiskActionTypes.PERFORM_MONTE_CARLO_REQUEST:
      return {
        ...state,
        monteCarloLoading: true,
        errors: {
          ...state.errors,
          monteCarlo: null,
        },
      };

    case RiskActionTypes.PERFORM_MONTE_CARLO_SUCCESS:
      return {
        ...state,
        monteCarloLoading: false,
        monteCarloResults: {
          ...state.monteCarloResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          monteCarloCache: {
            ...state.cache.monteCarloCache,
            [action.payload.portfolioId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          monteCarlo: null,
        },
      };

    case RiskActionTypes.PERFORM_MONTE_CARLO_FAILURE:
      return {
        ...state,
        monteCarloLoading: false,
        errors: {
          ...state.errors,
          monteCarlo: action.payload.error,
        },
      };

    // Drawdown analysis
    case RiskActionTypes.ANALYZE_DRAWDOWNS_REQUEST:
      return {
        ...state,
        drawdownsLoading: true,
        errors: {
          ...state.errors,
          drawdowns: null,
        },
      };

    case RiskActionTypes.ANALYZE_DRAWDOWNS_SUCCESS:
      return {
        ...state,
        drawdownsLoading: false,
        drawdownResults: {
          ...state.drawdownResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        errors: {
          ...state.errors,
          drawdowns: null,
        },
      };

    case RiskActionTypes.ANALYZE_DRAWDOWNS_FAILURE:
      return {
        ...state,
        drawdownsLoading: false,
        errors: {
          ...state.errors,
          drawdowns: action.payload.error,
        },
      };

    // Risk contribution
    case RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_REQUEST:
      return {
        ...state,
        riskContributionLoading: true,
        errors: {
          ...state.errors,
          riskContribution: null,
        },
      };

    case RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_SUCCESS:
      return {
        ...state,
        riskContributionLoading: false,
        riskContributionResults: {
          ...state.riskContributionResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        errors: {
          ...state.errors,
          riskContribution: null,
        },
      };

    case RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_FAILURE:
      return {
        ...state,
        riskContributionLoading: false,
        errors: {
          ...state.errors,
          riskContribution: action.payload.error,
        },
      };

    // UI state actions
    case RiskActionTypes.SET_CURRENT_PORTFOLIO:
      return {
        ...state,
        currentPortfolioId: action.payload,
      };

    case RiskActionTypes.SET_CURRENT_ANALYSIS_TYPE:
      return {
        ...state,
        currentAnalysisType: action.payload,
      };

    case RiskActionTypes.SET_SELECTED_SCENARIOS:
      return {
        ...state,
        selectedScenarios: action.payload,
      };

    case RiskActionTypes.SET_SELECTED_CONFIDENCE_LEVELS:
      return {
        ...state,
        selectedConfidenceLevels: action.payload,
      };

    case RiskActionTypes.SET_SELECTED_TIME_HORIZONS:
      return {
        ...state,
        selectedTimeHorizons: action.payload,
      };

    // Cache management
    case RiskActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: {
          varCache: {},
          stressTestCache: {},
          monteCarloCache: {},
        },
      };

    case RiskActionTypes.CLEAR_VAR_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          varCache: {},
        },
      };

    case RiskActionTypes.CLEAR_STRESS_TEST_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          stressTestCache: {},
        },
      };

    case RiskActionTypes.CLEAR_MONTE_CARLO_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          monteCarloCache: {},
        },
      };

    // Settings
    case RiskActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case RiskActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings,
      };

    // General actions
    case RiskActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {
          var: null,
          stressTest: null,
          monteCarlo: null,
          drawdowns: null,
          riskContribution: null,
        },
      };

    case RiskActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default riskReducer;