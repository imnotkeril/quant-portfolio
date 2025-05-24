/**
 * Risk sagas
 * Side effects and complex async logic for risk operations
 */
import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery, takeLatest, select, delay, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  calculateVaR,
  performStressTest,
  performMonteCarlo,
  analyzeDrawdowns,
  calculateRiskContribution,
} from './actions';
import {
  selectSelectedPortfolioId,
  selectRiskParams,
  selectSelectedScenarios,
  selectSelectedConfidenceLevels,
} from './selectors';
import { RootState } from '../rootReducer';

/**
 * Load all risk analysis for a portfolio
 */
function* loadAllRiskAnalysisSaga(action: PayloadAction<{ portfolioId: string; returns: Record<string, any>; weights?: Record<string, number> }>): SagaIterator {
  try {
    const { portfolioId, returns, weights } = action.payload;
    const riskParams = yield select(selectRiskParams);
    const selectedScenarios: string[] = yield select(selectSelectedScenarios);
    const selectedConfidenceLevels: number[] = yield select(selectSelectedConfidenceLevels);

    const commonParams = {
      portfolioId,
      returns,
      confidenceLevel: riskParams.confidenceLevel,
      timeHorizon: riskParams.timeHorizon,
      simulations: riskParams.simulations,
    };

    // Load all risk analyses in parallel
    const riskActions = [
      // VaR calculation
      put(calculateVaR(commonParams)),
      // Monte Carlo simulation
      put(performMonteCarlo({
        ...commonParams,
        initialValue: 10000,
        years: 10,
        annualContribution: 0,
      })),
      // Drawdown analysis
      put(analyzeDrawdowns({
        portfolioId,
        returns,
      })),
    ];

    // Add stress tests for selected scenarios
    if (selectedScenarios.length > 0) {
      selectedScenarios.forEach(scenario => {
        riskActions.push(
          put(performStressTest({
            portfolioId,
            scenario,
            returns,
            testType: 'historical',
          }))
        );
      });
    }

    // Add risk contribution if weights are provided
    if (weights) {
      riskActions.push(
        put(calculateRiskContribution({
          portfolioId,
          returns,
          weights,
        }))
      );
    }

    yield all(riskActions);
  } catch (error) {
    console.error('Error loading all risk analysis:', error);
  }
}

/**
 * Refresh risk analysis data
 */
function* refreshRiskAnalysisSaga(): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      // This would typically get returns data from portfolio or analytics store
      // For now, we'll just dispatch a refresh action
      yield put({ type: 'risk/loadAllRiskAnalysis', payload: { portfolioId: selectedPortfolioId, returns: {} } });
    }
  } catch (error) {
    console.error('Error refreshing risk analysis:', error);
  }
}

/**
 * Auto-refresh risk analysis data
 */
function* autoRefreshRiskAnalysisSaga(): SagaIterator {
  while (true) {
    try {
      // Wait 15 minutes (risk analysis is more intensive)
      yield delay(15 * 60 * 1000);

      // Refresh risk analysis if portfolio is selected
      yield call(refreshRiskAnalysisSaga);
    } catch (error) {
      console.error('Auto-refresh risk analysis error:', error);
    }
  }
}

/**
 * Handle confidence level change
 */
function* handleConfidenceLevelChangeSaga(action: PayloadAction<number[]>): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      // Small delay to prevent too frequent updates
      yield delay(500);

      // Recalculate VaR with new confidence levels
      const riskParams = yield select(selectRiskParams);

      for (const confidenceLevel of action.payload) {
        yield put(calculateVaR({
          portfolioId: selectedPortfolioId,
          returns: {}, // This should come from portfolio data
          confidenceLevel,
          timeHorizon: riskParams.timeHorizon,
          simulations: riskParams.simulations,
        }));
      }
    }
  } catch (error) {
    console.error('Error handling confidence level change:', error);
  }
}

/**
 * Handle scenario selection change
 */
function* handleScenarioSelectionChangeSaga(action: PayloadAction<string[]>): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);
    const scenarios = action.payload;

    if (selectedPortfolioId && scenarios.length > 0) {
      // Small delay to prevent too frequent updates
      yield delay(500);

      // Perform stress tests for selected scenarios
      for (const scenario of scenarios) {
        yield put(performStressTest({
          portfolioId: selectedPortfolioId,
          scenario,
          returns: {}, // This should come from portfolio data
          testType: 'historical',
        }));
      }
    }
  } catch (error) {
    console.error('Error handling scenario selection change:', error);
  }
}

/**
 * Handle risk params change
 */
function* handleRiskParamsChangeSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const selectedPortfolioId: string | null = yield select(selectSelectedPortfolioId);

    if (selectedPortfolioId) {
      // Small delay to prevent too frequent updates
      yield delay(1000);

      // Reload risk analysis with new params
      yield put({ type: 'risk/loadAllRiskAnalysis', payload: { portfolioId: selectedPortfolioId, returns: {} } });
    }
  } catch (error) {
    console.error('Error handling risk params change:', error);
  }
}

/**
 * Batch stress test saga
 */
function* batchStressTestSaga(action: PayloadAction<{ portfolioId: string; scenarios: string[]; returns: Record<string, any> }>): SagaIterator {
  try {
    const { portfolioId, scenarios, returns } = action.payload;

    // Perform all stress tests in parallel
    const stressTestActions = scenarios.map(scenario =>
      put(performStressTest({
        portfolioId,
        scenario,
        returns,
        testType: 'historical',
      }))
    );

    yield all(stressTestActions);
  } catch (error) {
    console.error('Error performing batch stress tests:', error);
  }
}

/**
 * Export risk analysis data saga
 */
function* exportRiskDataSaga(action: PayloadAction<{ format: string }>): SagaIterator {
  try {
    const { format } = action.payload;
    const riskData = yield select((state: RootState) => state.risk);

    // Prepare data for export
    const exportData = {
      varResults: riskData.varResults,
      stressTestResults: riskData.stressTestResults,
      monteCarloResults: riskData.monteCarloResults,
      drawdownResults: riskData.drawdownResults,
      riskContributionResults: riskData.riskContributionResults,
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
        jsonLink.download = `risk_analysis_${Date.now()}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        break;

      case 'csv':
        // Convert to CSV format (simplified)
        let csvContent = 'Portfolio ID,Analysis Type,Result\n';

        // VaR results
        Object.entries(riskData.varResults).forEach(([portfolioId, result]: [string, any]) => {
          csvContent += `${portfolioId},VaR,${result.var}\n`;
        });

        // Stress test results
        Object.entries(riskData.stressTestResults).forEach(([portfolioId, result]: [string, any]) => {
          csvContent += `${portfolioId},Stress Test,${result.portfolioLoss}\n`;
        });

        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `risk_analysis_${Date.now()}.csv`;
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
        break;

      default:
        console.warn('Unsupported export format:', format);
    }
  } catch (error) {
    console.error('Error exporting risk data:', error);
  }
}

/**
 * Risk analysis validation saga
 */
function* validateRiskAnalysisSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const { payload } = action;

    // Basic validation
    if (!payload.portfolioId) {
      throw new Error('Portfolio ID is required for risk analysis');
    }

    if (!payload.returns || Object.keys(payload.returns).length === 0) {
      throw new Error('Returns data is required for risk analysis');
    }

    // Additional validation based on analysis type
    if (payload.confidenceLevel && (payload.confidenceLevel <= 0 || payload.confidenceLevel >= 1)) {
      throw new Error('Confidence level must be between 0 and 1');
    }

    if (payload.simulations && payload.simulations <= 0) {
      throw new Error('Number of simulations must be positive');
    }
  } catch (error) {
    console.error('Risk analysis validation failed:', error);
    // Could dispatch a validation error action here
  }
}

/**
 * Root risk saga
 */
export function* riskSaga(): SagaIterator {
  // Load all risk analysis
  yield takeEvery('risk/loadAllRiskAnalysis', loadAllRiskAnalysisSaga);

  // Auto-refresh risk analysis
  yield takeLatest('risk/startAutoRefresh', autoRefreshRiskAnalysisSaga);

  // Handle UI changes
  yield takeEvery('risk/setSelectedConfidenceLevels', handleConfidenceLevelChangeSaga);
  yield takeEvery('risk/setSelectedScenarios', handleScenarioSelectionChangeSaga);
  yield takeLatest('risk/setRiskParams', handleRiskParamsChangeSaga);

  // Batch operations
  yield takeEvery('risk/batchStressTest', batchStressTestSaga);

  // Export risk data
  yield takeEvery('risk/exportRiskData', exportRiskDataSaga);

  // Validation
  yield takeEvery([
    'risk/calculateVaR',
    'risk/performStressTest',
    'risk/performMonteCarlo',
  ], validateRiskAnalysisSaga);

  // Refresh risk analysis
  yield takeEvery('risk/refreshRiskAnalysis', refreshRiskAnalysisSaga);
}

export default riskSaga;