/**
 * Comparison store sagas
 * Note: All financial metrics calculations use logarithmic returns as per Wild Market Capital requirements
 * UI components will use colors: Background #0D1015, Accent #BF9FFB, Positive #74F174, Negative #FAA1A4
 */
import { call, put, takeLatest, takeEvery, select, delay, race, fork, cancel, cancelled } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import { comparisonService } from '../../services/comparison/comparisonService';
import {
  comparePortfoliosSuccess,
  comparePortfoliosFailure,
  compareCompositionSuccess,
  compareCompositionFailure,
  comparePerformanceSuccess,
  comparePerformanceFailure,
  compareRiskSuccess,
  compareRiskFailure,
  compareSectorsSuccess,
  compareSectorsFailure,
  compareScenariosSuccess,
  compareScenariosFailure,
  calculateDifferentialSuccess,
  calculateDifferentialFailure,
} from './actions';
import {
  ComparisonActionTypes,
  ComparePortfoliosPayload,
  CompareCompositionPayload,
  ComparePerformancePayload,
  CompareRiskPayload,
  CompareSectorsPayload,
  CompareScenariosPayload,
  CalculateDifferentialPayload,
} from './types';
import {
  PortfolioComparisonResponse,
  CompositionComparisonResponse,
  PerformanceComparisonResponse,
  RiskComparisonResponse,
  SectorComparisonResponse,
  ScenarioComparisonResponse,
  DifferentialReturnsResponse,
} from '../../types/comparison';
import { ApiError } from '../../types/common';
import { RootState } from '../rootReducer';

/**
 * Helper function to create ApiError with proper error handling
 */
function createApiError(error: unknown, defaultMessage: string): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status || 500,
      code: (error as any).code,
      details: (error as any).details,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    return {
      message: errorObj.message || defaultMessage,
      status: errorObj.status || 500,
      code: errorObj.code,
      details: errorObj.details,
    };
  }

  return {
    message: defaultMessage,
    status: 500,
  };
}

/**
 * Compare portfolios saga
 */
function* comparePortfoliosSaga(action: PayloadAction<ComparePortfoliosPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: PortfolioComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.comparisonCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(comparePortfoliosSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    // Validate request
    if (!request.portfolio1 || !request.portfolio2) {
      throw new Error('Both portfolios must be specified for comparison');
    }

    if (request.portfolio1.id === request.portfolio2.id) {
      throw new Error('Cannot compare portfolio with itself');
    }

    const response: PortfolioComparisonResponse = yield call(
      comparisonService.comparePortfolios,
      request
    );

    yield put(comparePortfoliosSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare portfolios');
    yield put(comparePortfoliosFailure(apiError));
  }
}

/**
 * Compare composition saga
 */
function* compareCompositionSaga(action: PayloadAction<CompareCompositionPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: CompositionComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.compositionCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(compareCompositionSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: CompositionComparisonResponse = yield call(
      comparisonService.compareCompositions,
      request
    );

    yield put(compareCompositionSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare compositions');
    yield put(compareCompositionFailure(apiError));
  }
}

/**
 * Compare performance saga
 */
function* comparePerformanceSaga(action: PayloadAction<ComparePerformancePayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: PerformanceComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.performanceCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(comparePerformanceSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: PerformanceComparisonResponse = yield call(
      comparisonService.comparePerformance,
      request
    );

    yield put(comparePerformanceSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare performance');
    yield put(comparePerformanceFailure(apiError));
  }
}

/**
 * Compare risk saga
 */
function* compareRiskSaga(action: PayloadAction<CompareRiskPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: RiskComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.riskCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(compareRiskSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: RiskComparisonResponse = yield call(
      comparisonService.compareRiskMetrics,
      request
    );

    yield put(compareRiskSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare risk metrics');
    yield put(compareRiskFailure(apiError));
  }
}

/**
 * Compare sectors saga
 */
function* compareSectorsSaga(action: PayloadAction<CompareSectorsPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: SectorComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.sectorCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(compareSectorsSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: SectorComparisonResponse = yield call(
      comparisonService.compareSectorAllocations,
      request
    );

    yield put(compareSectorsSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare sectors');
    yield put(compareSectorsFailure(apiError));
  }
}

/**
 * Compare scenarios saga
 */
function* compareScenariosSaga(action: PayloadAction<CompareScenariosPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: ScenarioComparisonResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.scenarioCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(compareScenariosSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: ScenarioComparisonResponse = yield call(
      comparisonService.compareHistoricalScenarios,
      request
    );

    yield put(compareScenariosSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to compare scenarios');
    yield put(compareScenariosFailure(apiError));
  }
}

/**
 * Calculate differential returns saga
 */
function* calculateDifferentialSaga(action: PayloadAction<CalculateDifferentialPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Check cache first
    const cachedData: Record<string, { data: DifferentialReturnsResponse; timestamp: number }> = yield select(
      (state: RootState) => state.comparison.cache.differentialCache
    );

    const cacheTimeout: number = yield select(
      (state: RootState) => state.comparison.settings.cacheTimeout
    );

    if (cachedData[comparisonId] && (Date.now() - cachedData[comparisonId].timestamp) < cacheTimeout) {
      yield put(calculateDifferentialSuccess(comparisonId, cachedData[comparisonId].data));
      return;
    }

    const response: DifferentialReturnsResponse = yield call(
      comparisonService.calculateDifferentialReturns,
      request
    );

    yield put(calculateDifferentialSuccess(comparisonId, response));
  } catch (error) {
    const apiError = createApiError(error, 'Failed to calculate differential returns');
    yield put(calculateDifferentialFailure(apiError));
  }
}

/**
 * Batch comparison saga
 */
function* batchComparisonSaga(action: PayloadAction<{
  portfolios: string[];
  metrics: string[];
  includeAll: boolean;
}>) {
  try {
    const { portfolios, metrics, includeAll } = action.payload;
    const maxComparisons: number = yield select(
      (state: RootState) => state.comparison.settings.maxComparisons
    );

    let comparisonsCount = 0;

    // Generate all pairwise comparisons
    for (let i = 0; i < portfolios.length - 1; i++) {
      for (let j = i + 1; j < portfolios.length; j++) {
        if (comparisonsCount >= maxComparisons) {
          console.warn(`Maximum comparisons limit (${maxComparisons}) reached`);
          break;
        }

        const portfolio1 = portfolios[i];
        const portfolio2 = portfolios[j];
        const comparisonId = `${portfolio1}_${portfolio2}_${Date.now()}`;

        // Run comprehensive comparison
        yield put({
          type: ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST,
          payload: {
            request: {
              portfolio1: { id: portfolio1 },
              portfolio2: { id: portfolio2 },
            },
            comparisonId,
          },
        });

        if (includeAll) {
          // Also run specific comparisons
          yield put({
            type: ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST,
            payload: {
              request: {
                returns1: {},
                returns2: {},
                portfolio1Id: portfolio1,
                portfolio2Id: portfolio2,
              },
              comparisonId: `${comparisonId}_performance`,
            },
          });

          yield put({
            type: ComparisonActionTypes.COMPARE_RISK_REQUEST,
            payload: {
              request: {
                returns1: {},
                returns2: {},
                portfolio1Id: portfolio1,
                portfolio2Id: portfolio2,
              },
              comparisonId: `${comparisonId}_risk`,
            },
          });
        }

        comparisonsCount++;

        // Small delay between comparisons
        yield delay(1000);
      }

      if (comparisonsCount >= maxComparisons) {
        break;
      }
    }
  } catch (error) {
    console.error('Batch comparison failed:', error);
  }
}

/**
 * Auto refresh comparisons saga
 */
function* autoRefreshComparisonsSaga() {
  let refreshTask: Task | null = null;

  try {
    while (true) {
      const autoRefresh: boolean = yield select(
        (state: RootState) => state.comparison.settings.autoRefresh
      );
      const refreshInterval: number = yield select(
        (state: RootState) => state.comparison.settings.refreshInterval
      );

      if (autoRefresh) {
        // Cancel previous refresh task if running
        if (refreshTask) {
          yield cancel(refreshTask);
        }

        // Start new refresh task
        refreshTask = yield fork(function* () {
          try {
            const activeComparison: string | null = yield select(
              (state: RootState) => state.comparison.activeComparison
            );

            if (activeComparison) {
              // Refresh active comparison
              console.log('Auto refreshing active comparison:', activeComparison);
              // Could dispatch refresh actions here
            }
          } catch (error) {
            console.error('Auto refresh task error:', error);
          }
        });
      }

      yield delay(refreshInterval);
    }
  } finally {
    if (yield cancelled()) {
      if (refreshTask) {
        yield cancel(refreshTask);
      }
    }
  }
}

/**
 * Cache management saga
 */
function* cacheManagementSaga() {
  while (true) {
    try {
      // Clean up expired cache entries every 10 minutes
      yield delay(600000);

      const cacheTimeout: number = yield select(
        (state: RootState) => state.comparison.settings.cacheTimeout
      );
      const now = Date.now();

      // Get all cache data
      const cacheData: {
        comparisonCache: Record<string, { timestamp: number }>;
        compositionCache: Record<string, { timestamp: number }>;
        performanceCache: Record<string, { timestamp: number }>;
        riskCache: Record<string, { timestamp: number }>;
        sectorCache: Record<string, { timestamp: number }>;
        scenarioCache: Record<string, { timestamp: number }>;
        differentialCache: Record<string, { timestamp: number }>;
      } = yield select((state: RootState) => state.comparison.cache);

      // Check for expired entries
      const cacheTypes = Object.keys(cacheData) as Array<keyof typeof cacheData>;

      for (const cacheType of cacheTypes) {
        const cache = cacheData[cacheType];
        const expiredKeys = Object.entries(cache)
          .filter(([, entry]) => now - entry.timestamp > cacheTimeout)
          .map(([key]) => key);

        if (expiredKeys.length > 0) {
          console.log(`Cleaning up ${expiredKeys.length} expired ${cacheType} entries`);
          // Could dispatch cache cleanup actions here
        }
      }
    } catch (error) {
      console.error('Cache management error:', error);
    }
  }
}

/**
 * Performance monitoring saga
 */
function* performanceMonitoringSaga() {
  while (true) {
    try {
      yield delay(300000); // Check every 5 minutes

      const state: RootState = yield select();

      // Monitor comparison performance metrics
      const activeComparisons = Object.keys(state.comparison.comparisons).length;
      const cacheHitRatio = calculateCacheHitRatio(state.comparison.cache);

      console.log('Comparison Performance Metrics:', {
        activeComparisons,
        cacheHitRatio: `${(cacheHitRatio * 100).toFixed(2)}%`,
        memoryUsage: JSON.stringify(state.comparison).length,
      });

      // Could implement alerts for performance thresholds
      if (activeComparisons > 50) {
        console.warn('High number of active comparisons, consider cleanup');
      }

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }
}

/**
 * Calculate cache hit ratio helper
 */
function calculateCacheHitRatio(cache: any): number {
  const allEntries = Object.values(cache).reduce((total, cacheType: any) => {
    return total + Object.keys(cacheType).length;
  }, 0);

  // This is a simplified calculation - in real implementation,
  // you'd track actual hits vs misses
  return allEntries > 0 ? Math.min(allEntries / 100, 1) : 0;
}

/**
 * Error handling saga with retry logic
 */
function* errorHandlingSaga(action: PayloadAction<{ error: ApiError }>) {
  const { error } = action.payload;

  console.error('Comparison error:', error);

  // Implement retry logic for network errors
  if (!error.status || error.status === 0) {
    yield delay(5000);
    // Could dispatch retry action here
  }

  // Handle specific error types
  if (error.status === 429) {
    // Rate limiting - wait longer
    yield delay(30000);
  }

  // Critical error handling - prevent app crash
  if (error.status && error.status >= 500) {
    // Log critical error and continue operation
    console.error('Critical comparison error:', error);
    // Could dispatch notification action here
  }
}

/**
 * Data validation saga
 */
function* dataValidationSaga(action: PayloadAction<any>) {
  try {
    const { type, payload } = action;

    // Basic validation for all comparison requests
    if (payload?.request) {
      const request = payload.request;

      // Validate portfolio IDs exist
      if (request.portfolio1Id && request.portfolio2Id) {
        if (request.portfolio1Id === request.portfolio2Id) {
          throw new Error('Cannot compare portfolio with itself');
        }
      }

      // Validate date ranges
      if (request.startDate && request.endDate) {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);

        if (start >= end) {
          throw new Error('Start date must be before end date');
        }

        // Check if date range is reasonable (not too far in the past/future)
        const now = new Date();
        const maxPastDate = new Date(now.getFullYear() - 50, 0, 1);
        const maxFutureDate = new Date(now.getFullYear() + 1, 11, 31);

        if (start < maxPastDate || end > maxFutureDate) {
          console.warn('Date range outside reasonable bounds');
        }
      }

      // Validate metrics if provided
      if (request.metrics && Array.isArray(request.metrics)) {
        const validMetrics = ['totalReturn', 'sharpeRatio', 'volatility', 'maxDrawdown', 'alpha', 'beta'];
        const invalidMetrics = request.metrics.filter((metric: string) => !validMetrics.includes(metric));

        if (invalidMetrics.length > 0) {
          console.warn('Invalid metrics detected:', invalidMetrics);
        }
      }
    }
  } catch (error) {
    console.error('Data validation failed:', error);
    // Could dispatch validation error action here
  }
}

/**
 * Insights generation saga
 */
function* insightsGenerationSaga(action: PayloadAction<{
  comparisonId: string;
  data: PortfolioComparisonResponse;
}>) {
  try {
    const { comparisonId, data } = action.payload;

    // Generate insights from comparison data
    const insights = yield call([comparisonService, 'generateComparisonInsights'], data);

    // Store insights or dispatch action to update UI
    console.log(`Generated insights for comparison ${comparisonId}:`, insights);

    // Could dispatch action to store insights in state
    // yield put(setComparisonInsights(comparisonId, insights));

  } catch (error) {
    console.error('Insights generation failed:', error);
  }
}

/**
 * Notification saga
 */
function* notificationSaga(action: PayloadAction<any>) {
  try {
    const { type } = action;

    // Send notifications for completed comparisons
    if (type.endsWith('_SUCCESS')) {
      const enableNotifications: boolean = yield select(
        (state: RootState) => state.comparison.settings.enableNotifications
      );

      if (enableNotifications) {
        console.log('Comparison completed successfully');
        // Could integrate with notification system here
      }
    }

    if (type.endsWith('_FAILURE')) {
      console.log('Comparison failed');
      // Could show error notifications
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
}

/**
 * Race condition prevention saga
 */
function* raceConditionPreventionSaga(action: PayloadAction<any>) {
  try {
    const { type, payload } = action;
    const requestKey = `${type}_${JSON.stringify(payload)}`;

    // Use race to handle simultaneous identical requests
    const { response, timeout } = yield race({
      response: call(function* () {
        // This would contain the actual saga logic
        yield delay(100);
        return 'completed';
      }),
      timeout: delay(30000), // 30 second timeout
    });

    if (timeout) {
      throw new Error('Request timeout');
    }

    return response;
  } catch (error) {
    console.error('Race condition handling error:', error);
  }
}

/**
 * Root comparison saga
 */
export function* comparisonSaga() {
  // Watch for specific actions
  yield takeLatest(ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST, comparePortfoliosSaga);
  yield takeEvery(ComparisonActionTypes.COMPARE_COMPOSITION_REQUEST, compareCompositionSaga);
  yield takeEvery(ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST, comparePerformanceSaga);
  yield takeEvery(ComparisonActionTypes.COMPARE_RISK_REQUEST, compareRiskSaga);
  yield takeEvery(ComparisonActionTypes.COMPARE_SECTORS_REQUEST, compareSectorsSaga);
  yield takeEvery(ComparisonActionTypes.COMPARE_SCENARIOS_REQUEST, compareScenariosSaga);
  yield takeEvery(ComparisonActionTypes.CALCULATE_DIFFERENTIAL_REQUEST, calculateDifferentialSaga);

  // Watch for batch operations
  yield takeLatest('comparison/BATCH_COMPARISON_REQUEST', batchComparisonSaga);

  // Watch for insights generation
  yield takeEvery(ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS, insightsGenerationSaga);

  // Watch for validation
  yield takeEvery([
    ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST,
    ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST,
    ComparisonActionTypes.COMPARE_RISK_REQUEST,
  ], dataValidationSaga);

  // Watch for notifications
  yield takeEvery([
    ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS,
    ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE,
    ComparisonActionTypes.COMPARE_PERFORMANCE_SUCCESS,
    ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE,
    ComparisonActionTypes.COMPARE_RISK_SUCCESS,
    ComparisonActionTypes.COMPARE_RISK_FAILURE,
    ComparisonActionTypes.COMPARE_COMPOSITION_SUCCESS,
    ComparisonActionTypes.COMPARE_COMPOSITION_FAILURE,
    ComparisonActionTypes.COMPARE_SECTORS_SUCCESS,
    ComparisonActionTypes.COMPARE_SECTORS_FAILURE,
    ComparisonActionTypes.COMPARE_SCENARIOS_SUCCESS,
    ComparisonActionTypes.COMPARE_SCENARIOS_FAILURE,
    ComparisonActionTypes.CALCULATE_DIFFERENTIAL_SUCCESS,
    ComparisonActionTypes.CALCULATE_DIFFERENTIAL_FAILURE,
  ], notificationSaga);

  // Watch for error handling
  yield takeEvery([
    ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE,
    ComparisonActionTypes.COMPARE_COMPOSITION_FAILURE,
    ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE,
    ComparisonActionTypes.COMPARE_RISK_FAILURE,
    ComparisonActionTypes.COMPARE_SECTORS_FAILURE,
    ComparisonActionTypes.COMPARE_SCENARIOS_FAILURE,
    ComparisonActionTypes.CALCULATE_DIFFERENTIAL_FAILURE,
  ], errorHandlingSaga);

  // Start background processes
  yield fork(autoRefreshComparisonsSaga);
  yield fork(cacheManagementSaga);
  yield fork(performanceMonitoringSaga);
}

export default comparisonSaga;