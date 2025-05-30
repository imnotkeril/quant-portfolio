/**
 * Optimization actions
 */
import {
  OptimizationActionTypes,
  OptimizePortfolioRequestAction,
  OptimizePortfolioSuccessAction,
  OptimizePortfolioFailureAction,
  CalculateEfficientFrontierRequestAction,
  CalculateEfficientFrontierSuccessAction,
  CalculateEfficientFrontierFailureAction,
  LoadOptimizationHistoryRequestAction,
  LoadOptimizationHistorySuccessAction,
  LoadOptimizationHistoryFailureAction,
  CompareOptimizationsRequestAction,
  CompareOptimizationsSuccessAction,
  CompareOptimizationsFailureAction,
  SetOptimizationMethodAction,
  UpdateConstraintsAction,
  UpdateAdvancedOptionsAction,
  CacheOptimizationAction,
  CacheFrontierAction,
  ClearOptimizationCacheAction,
  ClearOptimizationErrorAction,
  ClearFrontierErrorAction,
  ClearComparisonErrorAction,
  ClearCurrentOptimizationAction,
  ClearCurrentFrontierAction,
  ResetOptimizationStateAction,
  OptimizationState,
} from './types';
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  OptimizationMethod,
} from '../../types/optimization';
import { ApiError } from '../../types/common';

/**
 * Portfolio optimization actions
 */
export const optimizePortfolioRequest = (
  request: OptimizationRequest,
  method: OptimizationMethod
): OptimizePortfolioRequestAction => ({
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_REQUEST,
  payload: { request, method },
});

export const optimizePortfolioSuccess = (
  optimization: OptimizationResponse
): OptimizePortfolioSuccessAction => ({
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_SUCCESS,
  payload: optimization,
});

export const optimizePortfolioFailure = (
  error: ApiError
): OptimizePortfolioFailureAction => ({
  type: OptimizationActionTypes.OPTIMIZE_PORTFOLIO_FAILURE,
  payload: error,
});

/**
 * Efficient frontier actions
 */
export const calculateEfficientFrontierRequest = (
  request: EfficientFrontierRequest
): CalculateEfficientFrontierRequestAction => ({
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_REQUEST,
  payload: request,
});

export const calculateEfficientFrontierSuccess = (
  frontier: EfficientFrontierResponse
): CalculateEfficientFrontierSuccessAction => ({
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_SUCCESS,
  payload: frontier,
});

export const calculateEfficientFrontierFailure = (
  error: ApiError
): CalculateEfficientFrontierFailureAction => ({
  type: OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_FAILURE,
  payload: error,
});

/**
 * Optimization history actions
 */
export const loadOptimizationHistoryRequest = (): LoadOptimizationHistoryRequestAction => ({
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_REQUEST,
});

export const loadOptimizationHistorySuccess = (
  history: OptimizationResponse[]
): LoadOptimizationHistorySuccessAction => ({
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_SUCCESS,
  payload: history,
});

export const loadOptimizationHistoryFailure = (
  error: ApiError
): LoadOptimizationHistoryFailureAction => ({
  type: OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_FAILURE,
  payload: error,
});

/**
 * Comparison actions
 */
export const compareOptimizationsRequest = (
  optimizations: OptimizationResponse[]
): CompareOptimizationsRequestAction => ({
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_REQUEST,
  payload: optimizations,
});

export const compareOptimizationsSuccess = (
  results: OptimizationResponse[]
): CompareOptimizationsSuccessAction => ({
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_SUCCESS,
  payload: results,
});

export const compareOptimizationsFailure = (
  error: ApiError
): CompareOptimizationsFailureAction => ({
  type: OptimizationActionTypes.COMPARE_OPTIMIZATIONS_FAILURE,
  payload: error,
});

/**
 * UI state actions
 */
export const setOptimizationMethod = (
  method: OptimizationMethod
): SetOptimizationMethodAction => ({
  type: OptimizationActionTypes.SET_OPTIMIZATION_METHOD,
  payload: method,
});

export const updateConstraints = (
  constraints: Partial<OptimizationState['constraints']>
): UpdateConstraintsAction => ({
  type: OptimizationActionTypes.UPDATE_CONSTRAINTS,
  payload: constraints,
});

export const updateAdvancedOptions = (
  options: Partial<OptimizationState['advancedOptions']>
): UpdateAdvancedOptionsAction => ({
  type: OptimizationActionTypes.UPDATE_ADVANCED_OPTIONS,
  payload: options,
});

/**
 * Cache actions
 */
export const cacheOptimization = (
  key: string,
  optimization: OptimizationResponse
): CacheOptimizationAction => ({
  type: OptimizationActionTypes.CACHE_OPTIMIZATION,
  payload: { key, optimization },
});

export const cacheFrontier = (
  key: string,
  frontier: EfficientFrontierResponse
): CacheFrontierAction => ({
  type: OptimizationActionTypes.CACHE_FRONTIER,
  payload: { key, frontier },
});

export const clearOptimizationCache = (): ClearOptimizationCacheAction => ({
  type: OptimizationActionTypes.CLEAR_OPTIMIZATION_CACHE,
});

/**
 * Clear error actions
 */
export const clearOptimizationError = (): ClearOptimizationErrorAction => ({
  type: OptimizationActionTypes.CLEAR_OPTIMIZATION_ERROR,
});

export const clearFrontierError = (): ClearFrontierErrorAction => ({
  type: OptimizationActionTypes.CLEAR_FRONTIER_ERROR,
});

export const clearComparisonError = (): ClearComparisonErrorAction => ({
  type: OptimizationActionTypes.CLEAR_COMPARISON_ERROR,
});

/**
 * Clear data actions
 */
export const clearCurrentOptimization = (): ClearCurrentOptimizationAction => ({
  type: OptimizationActionTypes.CLEAR_CURRENT_OPTIMIZATION,
});

export const clearCurrentFrontier = (): ClearCurrentFrontierAction => ({
  type: OptimizationActionTypes.CLEAR_CURRENT_FRONTIER,
});

export const resetOptimizationState = (): ResetOptimizationStateAction => ({
  type: OptimizationActionTypes.RESET_OPTIMIZATION_STATE,
});

/**
 * Thunk action creators
 */
export const optimizePortfolio = (
  request: OptimizationRequest,
  method: OptimizationMethod = 'markowitz'
) => {
  return async (dispatch: any, getState: any) => {
    dispatch(optimizePortfolioRequest(request, method));

    try {
      const { optimizationService } = await import('../../services/optimization/optimizationService');
      const optimization = await optimizationService.optimizePortfolio(request, method);

      dispatch(optimizePortfolioSuccess(optimization));

      // Cache the optimization result
      const cacheKey = `${JSON.stringify(request)}_${method}`;
      dispatch(cacheOptimization(cacheKey, optimization));

      return optimization;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Failed to optimize portfolio',
        code: error.code,
        status: error.status,
        details: error.details,
      };

      dispatch(optimizePortfolioFailure(apiError));
      throw error;
    }
  };
};

export const calculateEfficientFrontier = (request: EfficientFrontierRequest) => {
  return async (dispatch: any, getState: any) => {
    dispatch(calculateEfficientFrontierRequest(request));

    try {
      const { optimizationService } = await import('../../services/optimization/optimizationService');
      const frontier = await optimizationService.calculateEfficientFrontier(request);

      dispatch(calculateEfficientFrontierSuccess(frontier));

      // Cache the frontier result
      const cacheKey = JSON.stringify(request);
      dispatch(cacheFrontier(cacheKey, frontier));

      return frontier;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Failed to calculate efficient frontier',
        code: error.code,
        status: error.status,
        details: error.details,
      };

      dispatch(calculateEfficientFrontierFailure(apiError));
      throw error;
    }
  };
};

export const loadOptimizationHistory = () => {
  return async (dispatch: any, getState: any) => {
    dispatch(loadOptimizationHistoryRequest());

    try {
      // This would typically fetch from a backend service
      // For now, we'll use cached optimizations as history
      const state = getState();
      const cachedOptimizations = Object.values(state.optimization.cachedOptimizations) as OptimizationResponse[];

      dispatch(loadOptimizationHistorySuccess(cachedOptimizations));

      return cachedOptimizations;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Failed to load optimization history',
        code: error.code,
        status: error.status,
        details: error.details,
      };

      dispatch(loadOptimizationHistoryFailure(apiError));
      throw error;
    }
  };
};

export const compareOptimizations = (optimizations: OptimizationResponse[]) => {
  return async (dispatch: any, getState: any) => {
    dispatch(compareOptimizationsRequest(optimizations));

    try {
      // Perform comparison analysis
      const { optimizationService } = await import('../../services/optimization/optimizationService');

      // Compare each optimization with the first one
      const baseOptimization = optimizations[0];
      const comparisonResults = optimizations.map(opt => {
        if (opt === baseOptimization) return opt;

        const comparison = optimizationService.compareOptimizationResults(baseOptimization, opt);
        return {
          ...opt,
          comparisonMetrics: comparison,
        };
      });

      dispatch(compareOptimizationsSuccess(comparisonResults));

      return comparisonResults;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Failed to compare optimizations',
        code: error.code,
        status: error.status,
        details: error.details,
      };

      dispatch(compareOptimizationsFailure(apiError));
      throw error;
    }
  };
};