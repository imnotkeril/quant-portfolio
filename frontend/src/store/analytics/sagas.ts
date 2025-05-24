/**
 * Analytics sagas
 * Side effects and complex async logic for analytics operations
 */
import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery, takeLatest, select, delay, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loadPerformanceMetrics,
  loadRiskMetrics,
  loadReturns,
  loadCumulativeReturns,
  loadDrawdowns,
  loadRollingMetrics,
  loadComparison,
} from './actions';
import {
  selectSelectedPortfolioId,
  selectSelectedBenchmark,
  selectAnalysisParams
} from './selectors';
import { RootState } from '../rootReducer';

/**
 * Load all analytics data for a portfolio
 */
function* loadAllAnalyticsSaga(action: PayloadAction<{ portfolioId: string }>): SagaIterator {
  try {
    const { portfolioId } = action.payload;
    const selectedBenchmark: string | null = yield select(selectSelectedBenchmark);
    const analysisParams = yield select(selectAnalysisParams);

    const commonParams = {
      portfolioId,
      benchmark: selectedBenchmark || undefined,
      startDate: analysisParams.startDate || undefined,
      endDate: analysisParams.endDate || undefined,
      riskFreeRate: analysisParams.riskFreeRate,
      periodsPerYear: analysisParams.periodsPerYear,
    };

    // Load all analytics data in parallel
    yield all([
      put(loadPerformanceMetrics(commonParams)),
      put(loadRiskMetrics(commonParams)),
      put(loadReturns(commonParams)),
      put(loadCumulativeReturns(commonParams)),
      put(loadDrawdowns(commonParams)),
      put(loadRollingMetrics({
        ...commonParams,
        window: analysisParams.rollingWindow,
        metrics: ['return', 'volatility', 'sharpe'],
      })),
    ]);
  } catch (error) {
    console.error('Error loading all analytics:', error);
  }
}

/**
 * Refresh analytics data
 */
function* refreshAnalyticsSaga(): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      yield put({ type: 'analytics/loadAllAnalytics', payload: { portfolioId: selectedPortfolioId } });
    }
  } catch (error) {
    console.error('Error refreshing analytics:', error);
  }
}

/**
 * Auto-refresh analytics data
 */
function* autoRefreshAnalyticsSaga(): SagaIterator {
  while (true) {
    try {
      // Wait 10 minutes
      yield delay(10 * 60 * 1000);

      // Refresh analytics if portfolio is selected
      yield call(refreshAnalyticsSaga);
    } catch (error) {
      console.error('Auto-refresh analytics error:', error);
    }
  }
}

/**
 * Handle timeframe change
 */
function* handleTimeframeChangeSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const timeframe = action.payload;
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (!selectedPortfolioId) return;

    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '2Y':
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
      case '5Y':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Update analysis params
    yield put({
      type: 'analytics/setAnalysisParams',
      payload: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    });

    // Reload analytics with new date range
    yield put({ type: 'analytics/loadAllAnalytics', payload: { portfolioId: selectedPortfolioId } });
  } catch (error) {
    console.error('Error handling timeframe change:', error);
  }
}

/**
 * Handle benchmark change
 */
function* handleBenchmarkChangeSaga(action: PayloadAction<string | null>): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      // Reload analytics with new benchmark
      yield put({ type: 'analytics/loadAllAnalytics', payload: { portfolioId: selectedPortfolioId } });
    }
  } catch (error) {
    console.error('Error handling benchmark change:', error);
  }
}

/**
 * Handle analysis params change
 */
function* handleAnalysisParamsChangeSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      // Small delay to prevent too frequent updates
      yield delay(500);

      // Reload analytics with new params
      yield put({ type: 'analytics/loadAllAnalytics', payload: { portfolioId: selectedPortfolioId } });
    }
  } catch (error) {
    console.error('Error handling analysis params change:', error);
  }
}

/**
 * Calculate additional metrics saga
 */
function* calculateAdditionalMetricsSaga(action: PayloadAction<{ metrics: string[] }>): SagaIterator {
  try {
    const { metrics } = action.payload;
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (!selectedPortfolioId) return;

    const analysisParams = yield select(selectAnalysisParams);
    const commonParams = {
      portfolioId: selectedPortfolioId,
      startDate: analysisParams.startDate || undefined,
      endDate: analysisParams.endDate || undefined,
      riskFreeRate: analysisParams.riskFreeRate,
      periodsPerYear: analysisParams.periodsPerYear,
    };

    // Load rolling metrics for additional metrics
    if (metrics.some(m => ['rolling_return', 'rolling_volatility', 'rolling_sharpe'].includes(m))) {
      yield put(loadRollingMetrics({
        ...commonParams,
        window: analysisParams.rollingWindow,
        metrics: metrics.filter(m => m.startsWith('rolling_')).map(m => m.replace('rolling_', '')),
      }));
    }
  } catch (error) {
    console.error('Error calculating additional metrics:', error);
  }
}

/**
 * Export analytics data saga
 */
function* exportAnalyticsDataSaga(action: PayloadAction<{ format: string }>): SagaIterator {
  try {
    const { format } = action.payload;
    const analyticsData = yield select((state: RootState) => state.analytics);

    // Prepare data for export
    const exportData = {
      performanceMetrics: analyticsData.performanceMetrics,
      riskMetrics: analyticsData.riskMetrics,
      returns: analyticsData.returns,
      cumulativeReturns: analyticsData.cumulativeReturns,
      drawdowns: analyticsData.drawdowns,
      rollingMetrics: analyticsData.rollingMetrics,
      comparison: analyticsData.comparison,
      exportedAt: new Date().toISOString(),
    };

    // Export based on format
    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `analytics_${Date.now()}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        break;

      case 'csv':
        // Convert to CSV format (simplified)
        let csvContent = 'Metric,Value\n';
        if (analyticsData.performanceMetrics) {
          csvContent += `Total Return,${analyticsData.performanceMetrics.totalReturn}\n`;
          csvContent += `Annualized Return,${analyticsData.performanceMetrics.annualizedReturn}\n`;
        }
        if (analyticsData.riskMetrics) {
          csvContent += `Volatility,${analyticsData.riskMetrics.volatility}\n`;
          csvContent += `Max Drawdown,${analyticsData.riskMetrics.maxDrawdown}\n`;
        }

        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `analytics_${Date.now()}.csv`;
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
        break;

      default:
        console.warn('Unsupported export format:', format);
    }
  } catch (error) {
    console.error('Error exporting analytics data:', error);
  }
}

/**
 * Root analytics saga
 */
export function* analyticsSaga(): SagaIterator {
  // Load all analytics data
  yield takeEvery('analytics/loadAllAnalytics', loadAllAnalyticsSaga);

  // Auto-refresh analytics
  yield takeLatest('analytics/startAutoRefresh', autoRefreshAnalyticsSaga);

  // Handle UI changes
  yield takeEvery('analytics/setSelectedTimeframe', handleTimeframeChangeSaga);
  yield takeEvery('analytics/setSelectedBenchmark', handleBenchmarkChangeSaga);
  yield takeLatest('analytics/setAnalysisParams', handleAnalysisParamsChangeSaga);

  // Calculate additional metrics
  yield takeEvery('analytics/calculateAdditionalMetrics', calculateAdditionalMetricsSaga);

  // Export analytics data
  yield takeEvery('analytics/exportAnalyticsData', exportAnalyticsDataSaga);

  // Refresh analytics
  yield takeEvery('analytics/refreshAnalytics', refreshAnalyticsSaga);
}

export default analyticsSaga;