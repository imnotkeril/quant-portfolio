/**
 * Optimization sagas
 */
import { call, put, takeLatest, takeEvery, select, delay, fork, cancel, cancelled } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  OptimizationActionTypes,
  OptimizePortfolioRequestAction,
  CalculateEfficientFrontierRequestAction,
  CompareOptimizationsRequestAction,
} from './types';
import {
  optimizePortfolioSuccess,
  optimizePortfolioFailure,
  calculateEfficientFrontierSuccess,
  calculateEfficientFrontierFailure,
  loadOptimizationHistorySuccess,
  loadOptimizationHistoryFailure,
  compareOptimizationsSuccess,
  compareOptimizationsFailure,
  cacheOptimization,
  cacheFrontier,
} from './actions';
import { optimizationService } from '../../services/optimization/optimizationService';
import { RootState } from '../rootReducer';
import { ApiError } from '../../types/common';
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  OptimizationMethod,
} from '../../types/optimization';

/**
 * Portfolio optimization saga
 */
function* optimizePortfolioSaga(action: OptimizePortfolioRequestAction) {
  try {
    const { request, method } = action.payload;

    // Check cache first
    const cacheKey = `${JSON.stringify(request)}_${method}`;
    const cachedOptimizations: Record<string, OptimizationResponse> = yield select(
      (state: RootState) => state.optimization.cachedOptimizations
    );

    if (cachedOptimizations[cacheKey]) {
      yield put(optimizePortfolioSuccess(cachedOptimizations[cacheKey]));
      return;
    }

    // Validate request
    const validation = optimizationService.validateOptimizationRequest(request, method);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Call optimization service
    const optimization: OptimizationResponse = yield call(
      optimizationService.optimizePortfolio.bind(optimizationService),
      request,
      method
    );

    yield put(optimizePortfolioSuccess(optimization));

    // Cache the result
    yield put(cacheOptimization(cacheKey, optimization));

  } catch (error: any) {
    const apiError: ApiError = {
      message: error.message || 'Failed to optimize portfolio',
      code: error.code,
      status: error.status,
      details: error.details,
    };

    yield put(optimizePortfolioFailure(apiError));
  }
}

/**
 * Efficient frontier calculation saga
 */
function* calculateEfficientFrontierSaga(action: CalculateEfficientFrontierRequestAction) {
  try {
    const request = action.payload;

    // Check cache first
    const cacheKey = JSON.stringify(request);
    const cachedFrontiers: Record<string, EfficientFrontierResponse> = yield select(
      (state: RootState) => state.optimization.cachedFrontiers
    );

    if (cachedFrontiers[cacheKey]) {
      yield put(calculateEfficientFrontierSuccess(cachedFrontiers[cacheKey]));
      return;
    }

    // Call optimization service
    const frontier: EfficientFrontierResponse = yield call(
      optimizationService.calculateEfficientFrontier.bind(optimizationService),
      request
    );

    yield put(calculateEfficientFrontierSuccess(frontier));

    // Cache the result
    yield put(cacheFrontier(cacheKey, frontier));

  } catch (error: any) {
    const apiError: ApiError = {
      message: error.message || 'Failed to calculate efficient frontier',
      code: error.code,
      status: error.status,
      details: error.details,
    };

    yield put(calculateEfficientFrontierFailure(apiError));
  }
}

/**
 * Load optimization history saga
 */
function* loadOptimizationHistorySaga() {
  try {
    // Get cached optimizations as history
    const cachedOptimizations: Record<string, OptimizationResponse> = yield select(
      (state: RootState) => state.optimization.cachedOptimizations
    );

    const history = Object.values(cachedOptimizations);

    // Sort by timestamp (if available) or by Sharpe ratio
    const sortedHistory = history.sort((a, b) => {
      const aSharpe = a.performanceMetrics.sharpe_ratio || 0;
      const bSharpe = b.performanceMetrics.sharpe_ratio || 0;
      return bSharpe - aSharpe;
    });

    yield put(loadOptimizationHistorySuccess(sortedHistory));

  } catch (error: any) {
    const apiError: ApiError = {
      message: error.message || 'Failed to load optimization history',
      code: error.code,
      status: error.status,
      details: error.details,
    };

    yield put(loadOptimizationHistoryFailure(apiError));
  }
}

/**
 * Compare optimizations saga
 */
function* compareOptimizationsSaga(action: CompareOptimizationsRequestAction) {
  try {
    const optimizations = action.payload;

    if (optimizations.length < 2) {
      throw new Error('At least 2 optimizations are required for comparison');
    }

    // Perform comparison analysis
    const baseOptimization = optimizations[0];
    const comparisonResults = optimizations.map((opt, index) => {
      if (index === 0) return opt;

      const comparison = optimizationService.compareOptimizationResults(baseOptimization, opt);
      return {
        ...opt,
        comparisonMetrics: comparison,
      };
    });

    yield put(compareOptimizationsSuccess(comparisonResults));

  } catch (error: any) {
    const apiError: ApiError = {
      message: error.message || 'Failed to compare optimizations',
      code: error.code,
      status: error.status,
      details: error.details,
    };

    yield put(compareOptimizationsFailure(apiError));
  }
}

/**
 * Auto-save optimization results saga
 */
function* autoSaveOptimizationSaga() {
  try {
    // Get current optimization
    const currentOptimization: OptimizationResponse | null = yield select(
      (state: RootState) => state.optimization.currentOptimization
    );

    if (currentOptimization) {
      // Save to localStorage for persistence
      const savedOptimizations = JSON.parse(
        localStorage.getItem('optimizationHistory') || '[]'
      );

      // Check if this optimization already exists
      const exists = savedOptimizations.find((opt: OptimizationResponse) =>
        JSON.stringify(opt.optimalWeights) === JSON.stringify(currentOptimization.optimalWeights)
      );

      if (!exists) {
        savedOptimizations.unshift({
          ...currentOptimization,
          savedAt: new Date().toISOString(),
        });

        // Keep only last 50 optimizations
        const trimmedHistory = savedOptimizations.slice(0, 50);

        localStorage.setItem('optimizationHistory', JSON.stringify(trimmedHistory));
      }
    }
  } catch (error) {
    console.warn('Failed to auto-save optimization:', error);
  }
}

/**
 * Background frontier calculation saga
 */
function* backgroundFrontierCalculationSaga() {
  let runningTask: Task | null = null;

  try {
    while (true) {
      // Wait for optimization to complete
      yield delay(2000);

      const currentOptimization: OptimizationResponse | null = yield select(
        (state: RootState) => state.optimization.currentOptimization
      );

      const currentFrontier: EfficientFrontierResponse | null = yield select(
        (state: RootState) => state.optimization.currentEfficientFrontier
      );

      // If we have an optimization but no frontier, calculate it in background
      if (currentOptimization && !currentFrontier) {
        // Cancel any running task
        if (runningTask) {
          yield cancel(runningTask);
        }

        // Start new background calculation
        runningTask = yield fork(function* () {
          try {
            const request: EfficientFrontierRequest = {
              tickers: currentOptimization.tickers,
              startDate: currentOptimization.startDate,
              endDate: currentOptimization.endDate,
              riskFreeRate: currentOptimization.riskFreeRate,
              points: 50,
            };

            const frontier: EfficientFrontierResponse = yield call(
              optimizationService.calculateEfficientFrontier.bind(optimizationService),
              request
            );

            yield put(calculateEfficientFrontierSuccess(frontier));

            // Cache the result
            const cacheKey = JSON.stringify(request);
            yield put(cacheFrontier(cacheKey, frontier));

          } catch (error) {
            // Silently fail background calculation
            console.warn('Background frontier calculation failed:', error);
          }
        });
      }

      yield delay(10000); // Check every 10 seconds
    }
  } finally {
    if (yield cancelled()) {
      if (runningTask) {
        yield cancel(runningTask);
      }
    }
  }
}

/**
 * Load saved optimizations on app start
 */
function* loadSavedOptimizationsSaga() {
  try {
    const savedOptimizations = JSON.parse(
      localStorage.getItem('optimizationHistory') || '[]'
    );

    if (savedOptimizations.length > 0) {
      // Add to cache
      for (const optimization of savedOptimizations) {
        const cacheKey = `saved_${optimization.savedAt}`;
        yield put(cacheOptimization(cacheKey, optimization));
      }

      yield put(loadOptimizationHistorySuccess(savedOptimizations));
    }
  } catch (error) {
    console.warn('Failed to load saved optimizations:', error);
  }
}

/**
 * Cleanup old cache entries
 */
function* cleanupCacheSaga() {
  try {
    while (true) {
      yield delay(300000); // Run every 5 minutes

      const cachedOptimizations: Record<string, OptimizationResponse> = yield select(
        (state: RootState) => state.optimization.cachedOptimizations
      );

      const cachedFrontiers: Record<string, EfficientFrontierResponse> = yield select(
        (state: RootState) => state.optimization.cachedFrontiers
      );

      // If cache is getting too large, clear old entries
      const maxCacheSize = 100;

      if (Object.keys(cachedOptimizations).length > maxCacheSize) {
        // Clear all cache (simple approach)
        // In a real app, you might implement LRU cache
        yield put({ type: OptimizationActionTypes.CLEAR_OPTIMIZATION_CACHE });
      }
    }
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
  }
}

/**
 * Root optimization saga
 */
export function* optimizationSaga() {
  yield takeLatest(OptimizationActionTypes.OPTIMIZE_PORTFOLIO_REQUEST, optimizePortfolioSaga);
  yield takeLatest(OptimizationActionTypes.CALCULATE_EFFICIENT_FRONTIER_REQUEST, calculateEfficientFrontierSaga);
  yield takeLatest(OptimizationActionTypes.LOAD_OPTIMIZATION_HISTORY_REQUEST, loadOptimizationHistorySaga);
  yield takeLatest(OptimizationActionTypes.COMPARE_OPTIMIZATIONS_REQUEST, compareOptimizationsSaga);

  // Auto-save after successful optimization
  yield takeEvery(OptimizationActionTypes.OPTIMIZE_PORTFOLIO_SUCCESS, autoSaveOptimizationSaga);

  // Background tasks
  yield fork(backgroundFrontierCalculationSaga);
  yield fork(cleanupCacheSaga);

  // Load saved optimizations on start
  yield fork(loadSavedOptimizationsSaga);
}