/**
 * Optimization state types
 */
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  OptimizationMethod,
  EfficientFrontierPoint,
} from '../../types/optimization';
import { ApiError } from '../../types/common';

/**
 * Optimization State
 */
export interface OptimizationState {
  // Current optimization
  currentOptimization: OptimizationResponse | null;
  currentEfficientFrontier: EfficientFrontierResponse | null;

  // Optimization history
  optimizationHistory: OptimizationResponse[];

  // Loading states
  isOptimizing: boolean;
  isCalculatingFrontier: boolean;
  isLoadingHistory: boolean;

  // Error states
  optimizationError: ApiError | null;
  frontierError: ApiError | null;
  historyError: ApiError | null;

  // UI states
  selectedMethod: OptimizationMethod;
  constraints: {
    minWeight: number;
    maxWeight: number;
    riskFreeRate: number;
    targetReturn?: number;
    targetRisk?: number;
  };

  // Advanced optimization states
  advancedOptions: {
    uncertaintyLevel: number;
    scenarioProbabilities: Record<string, number>;
    esgScores: Record<string, number>;
    transactionCosts: Record<string, number>;
    currentWeights: Record<string, number>;
  };

  // Comparison states
  comparisonResults: OptimizationResponse[];
  isComparing: boolean;
  comparisonError: ApiError | null;

  // Cache
  cachedOptimizations: Record<string, OptimizationResponse>;
  cachedFrontiers: Record<string, EfficientFrontierResponse>;
  lastUpdated: string | null;
}

/**
 * Optimization Action Types
 */
export enum OptimizationActionTypes {
  // Optimization actions
  OPTIMIZE_PORTFOLIO_REQUEST = 'OPTIMIZE_PORTFOLIO_REQUEST',
  OPTIMIZE_PORTFOLIO_SUCCESS = 'OPTIMIZE_PORTFOLIO_SUCCESS',
  OPTIMIZE_PORTFOLIO_FAILURE = 'OPTIMIZE_PORTFOLIO_FAILURE',

  // Efficient frontier actions
  CALCULATE_EFFICIENT_FRONTIER_REQUEST = 'CALCULATE_EFFICIENT_FRONTIER_REQUEST',
  CALCULATE_EFFICIENT_FRONTIER_SUCCESS = 'CALCULATE_EFFICIENT_FRONTIER_SUCCESS',
  CALCULATE_EFFICIENT_FRONTIER_FAILURE = 'CALCULATE_EFFICIENT_FRONTIER_FAILURE',

  // History actions
  LOAD_OPTIMIZATION_HISTORY_REQUEST = 'LOAD_OPTIMIZATION_HISTORY_REQUEST',
  LOAD_OPTIMIZATION_HISTORY_SUCCESS = 'LOAD_OPTIMIZATION_HISTORY_SUCCESS',
  LOAD_OPTIMIZATION_HISTORY_FAILURE = 'LOAD_OPTIMIZATION_HISTORY_FAILURE',

  // Comparison actions
  COMPARE_OPTIMIZATIONS_REQUEST = 'COMPARE_OPTIMIZATIONS_REQUEST',
  COMPARE_OPTIMIZATIONS_SUCCESS = 'COMPARE_OPTIMIZATIONS_SUCCESS',
  COMPARE_OPTIMIZATIONS_FAILURE = 'COMPARE_OPTIMIZATIONS_FAILURE',

  // UI actions
  SET_OPTIMIZATION_METHOD = 'SET_OPTIMIZATION_METHOD',
  UPDATE_CONSTRAINTS = 'UPDATE_CONSTRAINTS',
  UPDATE_ADVANCED_OPTIONS = 'UPDATE_ADVANCED_OPTIONS',

  // Cache actions
  CACHE_OPTIMIZATION = 'CACHE_OPTIMIZATION',
  CACHE_FRONTIER = 'CACHE_FRONTIER',
  CLEAR_OPTIMIZATION_CACHE = 'CLEAR_OPTIMIZATION_CACHE',

  // Clear actions
  CLEAR_OPTIMIZATION_ERROR = 'CLEAR_OPTIMIZATION_ERROR',
  CLEAR_FRONTIER_ERROR = 'CLEAR_FRONTIER_ERROR',
  CLEAR_COMPARISON_ERROR = 'CLEAR_COMPARISON_ERROR',
  CLEAR_CURRENT_OPTIMIZATION = 'CLEAR_CURRENT_OPTIMIZATION',
  CLEAR_CURRENT_FRONTIER = 'CLEAR_CURRENT_FRONTIER',
  RESET_OPTIMIZATION_STATE = 'RESET_OPTIMIZATION_STATE',
}

/**
 * Optimization Actions
 */
export interface OptimizePortfolioRequestAction {
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_REQUEST;
  payload: {
    request: OptimizationRequest;
    method: OptimizationMethod;
  };
}

export interface OptimizePortfolioSuccessAction {
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_SUCCESS;
  payload: OptimizationResponse;
}

export interface OptimizePortfolioFailureAction {
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_FAILURE;
  payload: ApiError;
}

export interface CalculateEfficientFrontierRequestAction {
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_REQUEST;
  payload: EfficientFrontierRequest;
}

export interface CalculateEfficientFrontierSuccessAction {
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_SUCCESS;
  payload: EfficientFrontierResponse;
}

export interface CalculateEfficientFrontierFailureAction {
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_FAILURE;
  payload: ApiError;
}

export interface LoadOptimizationHistoryRequestAction {
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_REQUEST;
}

export interface LoadOptimizationHistorySuccessAction {
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_SUCCESS;
  payload: OptimizationResponse[];
}

export interface LoadOptimizationHistoryFailureAction {
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_FAILURE;
  payload: ApiError;
}

export interface CompareOptimizationsRequestAction {
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_REQUEST;
  payload: OptimizationResponse[];
}

export interface CompareOptimizationsSuccessAction {
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_SUCCESS;
  payload: OptimizationResponse[];
}

export interface CompareOptimizationsFailureAction {
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_FAILURE;
  payload: ApiError;
}

export interface SetOptimizationMethodAction {
  type: OptimizationActionTypes.SET_OPTIMIZATION_METHOD;
  payload: OptimizationMethod;
}

export interface UpdateConstraintsAction {
  type: OptimizationActionTypes.UPDATE_CONSTRAINTS;
  payload: Partial<OptimizationState['constraints']>;
}

export interface UpdateAdvancedOptionsAction {
  type: OptimizationActionTypes.UPDATE_ADVANCED_OPTIONS;
  payload: Partial<OptimizationState['advancedOptions']>;
}

export interface CacheOptimizationAction {
  type: OptimizationActionTypes.CACHE_OPTIMIZATION;
  payload: {
    key: string;
    optimization: OptimizationResponse;
  };
}

export interface CacheFrontierAction {
  type: OptimizationActionTypes.CACHE_FRONTIER;
  payload: {
    key: string;
    frontier: EfficientFrontierResponse;
  };
}

export interface ClearOptimizationCacheAction {
  type: OptimizationActionTypes.CLEAR_OPTIMIZATION_CACHE;
}

export interface ClearOptimizationErrorAction {
  type: OptimizationActionTypes.CLEAR_OPTIMIZATION_ERROR;
}

export interface ClearFrontierErrorAction {
  type: OptimizationActionTypes.CLEAR_FRONTIER_ERROR;
}

export interface ClearComparisonErrorAction {
  type: OptimizationActionTypes.CLEAR_COMPARISON_ERROR;
}

export interface ClearCurrentOptimizationAction {
  type: OptimizationActionTypes.CLEAR_CURRENT_OPTIMIZATION;
}

export interface ClearCurrentFrontierAction {
  type: OptimizationActionTypes.CLEAR_CURRENT_FRONTIER;
}

export interface ResetOptimizationStateAction {
  type: OptimizationActionTypes.RESET_OPTIMIZATION_STATE;
}

/**
 * Union type for all optimization actions
 */
export type OptimizationAction =
  | OptimizePortfolioRequestAction
  | OptimizePortfolioSuccessAction
  | OptimizePortfolioFailureAction
  | CalculateEfficientFrontierRequestAction
  | CalculateEfficientFrontierSuccessAction
  | CalculateEfficientFrontierFailureAction
  | LoadOptimizationHistoryRequestAction
  | LoadOptimizationHistorySuccessAction
  | LoadOptimizationHistoryFailureAction
  | CompareOptimizationsRequestAction
  | CompareOptimizationsSuccessAction
  | CompareOptimizationsFailureAction
  | SetOptimizationMethodAction
  | UpdateConstraintsAction
  | UpdateAdvancedOptionsAction
  | CacheOptimizationAction
  | CacheFrontierAction
  | ClearOptimizationCacheAction
  | ClearOptimizationErrorAction
  | ClearFrontierErrorAction
  | ClearComparisonErrorAction
  | ClearCurrentOptimizationAction
  | ClearCurrentFrontierAction
  | ResetOptimizationStateAction;