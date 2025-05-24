/**
 * Optimization reducer
 */
import { OptimizationState, OptimizationAction, OptimizationActionTypes } from './types';

/**
 * Initial state
 */
const initialState: OptimizationState = {
  // Current optimization
  currentOptimization: null,
  currentEfficientFrontier: null,

  // Optimization history
  optimizationHistory: [],

  // Loading states
  isOptimizing: false,
  isCalculatingFrontier: false,
  isLoadingHistory: false,

  // Error states
  optimizationError: null,
  frontierError: null,
  historyError: null,

  // UI states
  selectedMethod: 'markowitz',
  constraints: {
    minWeight: 0.0,
    maxWeight: 1.0,
    riskFreeRate: 0.02,
  },

  // Advanced optimization states
  advancedOptions: {
    uncertaintyLevel: 0.05,
    scenarioProbabilities: {},
    esgScores: {},
    transactionCosts: {},
    currentWeights: {},
  },

  // Comparison states
  comparisonResults: [],
  isComparing: false,
  comparisonError: null,

  // Cache
  cachedOptimizations: {},
  cachedFrontiers: {},
  lastUpdated: null,
};

/**
 * Optimization reducer
 */
export const optimizationReducer = (
  state: OptimizationState = initialState,
  action: OptimizationAction
): OptimizationState => {
  switch (action.type) {
    // Portfolio optimization
    case OptimizationActionTypes.OPTIMIZE_PORTFOLIO_REQUEST:
      return {
        ...state,
        isOptimizing: true,
        optimizationError: null,
      };

    case OptimizationActionTypes.OPTIMIZE_PORTFOLIO_SUCCESS:
      return {
        ...state,
        isOptimizing: false,
        currentOptimization: action.payload,
        optimizationError: null,
        lastUpdated: new Date().toISOString(),
      };

    case OptimizationActionTypes.OPTIMIZE_PORTFOLIO_FAILURE:
      return {
        ...state,
        isOptimizing: false,
        optimizationError: action.payload,
      };

    // Efficient frontier
    case OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_REQUEST:
      return {
        ...state,
        isCalculatingFrontier: true,
        frontierError: null,
      };

    case OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_SUCCESS:
      return {
        ...state,
        isCalculatingFrontier: false,
        currentEfficientFrontier: action.payload,
        frontierError: null,
        lastUpdated: new Date().toISOString(),
      };

    case OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_FAILURE:
      return {
        ...state,
        isCalculatingFrontier: false,
        frontierError: action.payload,
      };

    // Optimization history
    case OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_REQUEST:
      return {
        ...state,
        isLoadingHistory: true,
        historyError: null,
      };

    case OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_SUCCESS:
      return {
        ...state,
        isLoadingHistory: false,
        optimizationHistory: action.payload,
        historyError: null,
      };

    case OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_FAILURE:
      return {
        ...state,
        isLoadingHistory: false,
        historyError: action.payload,
      };

    // Comparison
    case OptimizationActionTypes.COMPARE_OPTIMIZATIONS_REQUEST:
      return {
        ...state,
        isComparing: true,
        comparisonError: null,
      };

    case OptimizationActionTypes.COMPARE_OPTIMIZATIONS_SUCCESS:
      return {
        ...state,
        isComparing: false,
        comparisonResults: action.payload,
        comparisonError: null,
      };

    case OptimizationActionTypes.COMPARE_OPTIMIZATIONS_FAILURE:
      return {
        ...state,
        isComparing: false,
        comparisonError: action.payload,
      };

    // UI states
    case OptimizationActionTypes.SET_OPTIMIZATION_METHOD:
      return {
        ...state,
        selectedMethod: action.payload,
      };

    case OptimizationActionTypes.UPDATE_CONSTRAINTS:
      return {
        ...state,
        constraints: {
          ...state.constraints,
          ...action.payload,
        },
      };

    case OptimizationActionTypes.UPDATE_ADVANCED_OPTIONS:
      return {
        ...state,
        advancedOptions: {
          ...state.advancedOptions,
          ...action.payload,
        },
      };

    // Cache
    case OptimizationActionTypes.CACHE_OPTIMIZATION:
      return {
        ...state,
        cachedOptimizations: {
          ...state.cachedOptimizations,
          [action.payload.key]: action.payload.optimization,
        },
      };

    case OptimizationActionTypes.CACHE_FRONTIER:
      return {
        ...state,
        cachedFrontiers: {
          ...state.cachedFrontiers,
          [action.payload.key]: action.payload.frontier,
        },
      };

    case OptimizationActionTypes.CLEAR_OPTIMIZATION_CACHE:
      return {
        ...state,
        cachedOptimizations: {},
        cachedFrontiers: {},
      };

    // Clear errors
    case OptimizationActionTypes.CLEAR_OPTIMIZATION_ERROR:
      return {
        ...state,
        optimizationError: null,
      };

    case OptimizationActionTypes.CLEAR_FRONTIER_ERROR:
      return {
        ...state,
        frontierError: null,
      };

    case OptimizationActionTypes.CLEAR_COMPARISON_ERROR:
      return {
        ...state,
        comparisonError: null,
      };

    // Clear data
    case OptimizationActionTypes.CLEAR_CURRENT_OPTIMIZATION:
      return {
        ...state,
        currentOptimization: null,
      };

    case OptimizationActionTypes.CLEAR_CURRENT_FRONTIER:
      return {
        ...state,
        currentEfficientFrontier: null,
      };

    // Reset state
    case OptimizationActionTypes.RESET_OPTIMIZATION_STATE:
      return {
        ...initialState,
        // Preserve cache and constraints
        cachedOptimizations: state.cachedOptimizations,
        cachedFrontiers: state.cachedFrontiers,
        constraints: state.constraints,
        selectedMethod: state.selectedMethod,
      };

    default:
      return state;
  }
};

export default optimizationReducer;