/**
 * Comparison store sagas
 */
import { call, put, takeLatest, takeEvery, select, delay } from 'redux-saga/effects';
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
import {
  selectAutoRefresh,
  selectRefreshInterval,
  selectMaxComparisons,
} from './selectors';

/**
 * Compare portfolios saga
 */
function* comparePortfoliosSaga(action: PayloadAction<ComparePortfoliosPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Validate request
    const validation = comparisonService.validatePortfolioComparisonRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response: PortfolioComparisonResponse = yield call(
      comparisonService.comparePortfolios,
      request
    );

    yield put(comparePortfoliosSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare portfolios',
      status: 500,
    };
    yield put(comparePortfoliosFailure(apiError));
  }
}

/**
 * Compare composition saga
 */
function* compareCompositionSaga(action: PayloadAction<CompareCompositionPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    const response: CompositionComparisonResponse = yield call(
      comparisonService.compareCompositions,
      request
    );

    yield put(compareCompositionSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare compositions',
      status: 500,
    };
    yield put(compareCompositionFailure(apiError));
  }
}

/**
 * Compare performance saga
 */
function* comparePerformanceSaga(action: PayloadAction<ComparePerformancePayload>) {
  try {
    const { request, comparisonId } = action.payload;

    // Validate request
    const validation = comparisonService.validatePerformanceComparisonRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response: PerformanceComparisonResponse = yield call(
      comparisonService.comparePerformance,
      request
    );

    yield put(comparePerformanceSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare performance',
      status: 500,
    };
    yield put(comparePerformanceFailure(apiError));
  }
}

/**
 * Compare risk saga
 */
function* compareRiskSaga(action: PayloadAction<CompareRiskPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    const response: RiskComparisonResponse = yield call(
      comparisonService.compareRiskMetrics,
      request
    );

    yield put(compareRiskSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare risk metrics',
      status: 500,
    };
    yield put(compareRiskFailure(apiError));
  }
}

/**
 * Compare sectors saga
 */
function* compareSectorsSaga(action: PayloadAction<CompareSectorsPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    const response: SectorComparisonResponse = yield call(
      comparisonService.compareSectorAllocations,
      request
    );

    yield put(compareSectorsSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare sectors',
      status: 500,
    };
    yield put(compareSectorsFailure(apiError));
  }
}

/**
 * Compare scenarios saga
 */
function* compareScenariosSaga(action: PayloadAction<CompareScenariosPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    const response: ScenarioComparisonResponse = yield call(
      comparisonService.compareHistoricalScenarios,
      request
    );

    yield put(compareScenariosSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to compare scenarios',
      status: 500,
    };
    yield put(compareScenariosFailure(apiError));
  }
}

/**
 * Calculate differential returns saga
 */
function* calculateDifferentialSaga(action: PayloadAction<CalculateDifferentialPayload>) {
  try {
    const { request, comparisonId } = action.payload;

    const response: DifferentialReturnsResponse = yield call(
      comparisonService.calculateDifferentialReturns,
      request
    );

    yield put(calculateDifferentialSuccess(comparisonId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to calculate differential returns',
      status: 500,
    };
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
    const maxComparisons: number = yield select(selectMaxComparisons);

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
    }
  } catch (error) {
    console.error('Batch comparison failed:', error);
  }
}

/**
 * Auto refresh comparisons saga
 */
function* autoRefreshComparisonsSaga() {
  while (true) {
    try {
      const autoRefresh: boolean = yield select(selectAutoRefresh);
      const refreshInterval: number = yield select(selectRefreshInterval);

      if (autoRefresh) {
        // Trigger refresh of active comparisons
        // This would typically check which comparisons need refreshing
        // and dispatch appropriate refresh actions
        console.log('Auto refreshing comparisons');
      }

      yield delay(refreshInterval);
    } catch (error) {
      console.error('Auto refresh comparisons error:', error);
      yield delay(60000); // Wait 1 minute on error
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

      // This would typically check cache timestamps and remove expired entries
      console.log('Cleaning up expired comparison cache entries');
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

      // Monitor comparison performance and optimization opportunities
      console.log('Monitoring comparison performance');
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }
}

/**
 * Error handling saga
 */
function* errorHandlingSaga(action: PayloadAction<{ error: ApiError }>) {
  const { error } = action.payload;

  console.error('Comparison error:', error);

  // Implement retry logic for network errors
  if (error.status === 0) {
    yield delay(5000);
    // Could dispatch retry action here
  }

  // Handle specific error types
  if (error.status === 429) {
    // Rate limiting - wait longer
    yield delay(30000);
  }
}

/**
 * Data validation saga
 */
function* dataValidationSaga(action: PayloadAction<any>) {
  try {
    const { type, payload } = action;

    // Validate different types of requests
    switch (type) {
      case ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST:
        const portfolioValidation = comparisonService.validatePortfolioComparisonRequest(payload.request);
        if (!portfolioValidation.isValid) {
          throw new Error(portfolioValidation.errors.join(', '));
        }
        break;

      case ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST:
        const performanceValidation = comparisonService.validatePerformanceComparisonRequest(payload.request);
        if (!performanceValidation.isValid) {
          throw new Error(performanceValidation.errors.join(', '));
        }
        break;
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
    const insights = comparisonService.generateComparisonInsights(data);

    // Store insights or dispatch action to update UI
    console.log(`Generated insights for comparison ${comparisonId}:`, insights);
  } catch (error) {
    console.error('Insights generation failed:', error);
  }
}

/**
 * Notification saga
 */
function* notificationSaga(action: PayloadAction<any>) {
  try {
    const { type, payload } = action;

    // Send notifications for completed comparisons
    if (type.endsWith('_SUCCESS')) {
      // Could integrate with notification system here
      console.log('Comparison completed successfully');
    }

    if (type.endsWith('_FAILURE')) {
      console.log('Comparison failed');
    }
  } catch (error) {
    console.error('Notification error:', error);
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
  ], dataValidationSaga);

  // Watch for notifications
  yield takeEvery([
    ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS,
    ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE,
    ComparisonActionTypes.COMPARE_PERFORMANCE_SUCCESS,
    ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE,
    ComparisonActionTypes.COMPARE_RISK_SUCCESS,
    ComparisonActionTypes.COMPARE_RISK_FAILURE,
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
  yield call(autoRefreshComparisonsSaga);
  yield call(cacheManagementSaga);
  yield call(performanceMonitoringSaga);
}

export default comparisonSaga;