/**
 * Scenarios store sagas
 */
import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest, takeEvery, select, delay, all, race, take } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { scenarioService } from '../../services/scenarios/scenarioService';
import {
  loadScenarios,
  runSimulation,
  analyzeImpact,
  createChain,
  modifyChain,
  loadChain,
  deleteChain,
} from './actions';
import {
  setChainVisualizationData,
  clearCache,
  updateSettings,
} from './reducer';
import {
  selectAutoRunSimulations,
  selectMaxConcurrentAnalyses,
  selectCacheTimeout,
  selectShouldRefreshScenarios,
  selectCurrentPortfolioId,
  selectSelectedScenarios,
} from './selectors';
import { RootState } from '../rootReducer';

/**
 * Active analyses tracker
 */
let activeAnalyses = 0;

/**
 * Auto refresh scenarios saga
 */
function* autoRefreshScenariosSaga(): SagaIterator {
  while (true) {
    try {
      const shouldRefresh: boolean = yield select(selectShouldRefreshScenarios);

      if (shouldRefresh) {
        yield put(loadScenarios());
      }

      // Wait for cache timeout period before checking again
      const cacheTimeout: number = yield select(selectCacheTimeout);
      yield delay(cacheTimeout);
    } catch (error) {
      console.error('Auto refresh scenarios error:', error);
      yield delay(60000); // Wait 1 minute on error
    }
  }
}

/**
 * Batch scenario analysis saga
 */
function* batchScenarioAnalysisSaga(action: PayloadAction<{
  portfolioId: string;
  scenarios: string[];
  portfolio: any;
  dataFetcher: any;
}>): SagaIterator {
  try {
    const { portfolioId, scenarios, portfolio, dataFetcher } = action.payload;

    // Check auto run setting
    const autoRun: boolean = yield select(selectAutoRunSimulations);
    if (!autoRun) {
      return;
    }

    // Run impact analysis
    yield put(analyzeImpact({
      request: {
        portfolio,
        scenarios,
        dataFetcher,
      },
      portfolioId,
    }));

    // Run simulations for each scenario
    for (const scenario of scenarios) {
      const simulationId = `${portfolioId}_${scenario}_${Date.now()}`;

      yield put(runSimulation({
        request: {
          startingScenario: scenario,
          numSimulations: 100, // Smaller number for batch operations
        },
        simulationId,
      }));

      // Small delay between simulations to prevent overwhelming the server
      yield delay(1000);
    }
  } catch (error) {
    console.error('Batch scenario analysis failed:', error);
  }
}

/**
 * Concurrent analysis manager saga
 */
function* concurrentAnalysisManagerSaga(): SagaIterator {
  while (true) {
    try {
      // Wait for any analysis request
      const action = yield take([
        runSimulation.pending.type,
        analyzeImpact.pending.type,
      ]);

      const maxConcurrent: number = yield select(selectMaxConcurrentAnalyses);

      if (activeAnalyses >= maxConcurrent) {
        // Queue the request by putting it back with a delay
        yield delay(5000);
        yield put(action);
      }
    } catch (error) {
      console.error('Concurrent analysis manager error:', error);
      yield delay(5000);
    }
  }
}

/**
 * Handle chain creation success saga
 */
function* handleChainCreationSuccessSaga(action: PayloadAction<{ name: string; data: any }>): SagaIterator {
  try {
    const { data } = action.payload;

    // Generate visualization data
    if (data.scenarioChain) {
      const visualizationData = scenarioService.generateVisualizationData(data.scenarioChain);
      yield put(setChainVisualizationData(visualizationData));
    }
  } catch (error) {
    console.error('Error handling chain creation success:', error);
  }
}

/**
 * Handle chain modification success saga
 */
function* handleChainModificationSuccessSaga(action: PayloadAction<{ name: string; data: any }>): SagaIterator {
  try {
    const { data } = action.payload;

    // Update visualization data
    if (data.scenarioChain) {
      const visualizationData = scenarioService.generateVisualizationData(data.scenarioChain);
      yield put(setChainVisualizationData(visualizationData));
    }
  } catch (error) {
    console.error('Error handling chain modification success:', error);
  }
}

/**
 * Handle chain load success saga
 */
function* handleChainLoadSuccessSaga(action: PayloadAction<{ name: string; data: any }>): SagaIterator {
  try {
    const { data } = action.payload;

    // Generate visualization data
    if (data.scenarioChain) {
      const visualizationData = scenarioService.generateVisualizationData(data.scenarioChain);
      yield put(setChainVisualizationData(visualizationData));
    }
  } catch (error) {
    console.error('Error handling chain load success:', error);
  }
}

/**
 * Handle simulation success saga
 */
function* handleSimulationSuccessSaga(action: PayloadAction<{ simulationId: string; data: any }>): SagaIterator {
  try {
    const { data } = action.payload;

    // Generate visualization data if available
    if (data.chainVisualizationData) {
      yield put(setChainVisualizationData(data.chainVisualizationData));
    }
  } catch (error) {
    console.error('Error handling simulation success:', error);
  }
}

/**
 * Cache cleanup saga
 */
function* cacheCleanupSaga(): SagaIterator {
  while (true) {
    try {
      // Clean up expired cache entries every 10 minutes
      yield delay(600000);

      const cacheTimeout: number = yield select(selectCacheTimeout);
      const now = Date.now();

      // Get current state to check cache timestamps
      const state: RootState = yield select();
      const { simulationCache, impactCache } = state.scenarios.cache;

      // Check for expired simulation cache entries
      const expiredSimulations = Object.keys(simulationCache).filter(key => {
        const cached = simulationCache[key];
        return cached && (now - cached.timestamp > cacheTimeout);
      });

      // Check for expired impact cache entries
      const expiredImpacts = Object.keys(impactCache).filter(key => {
        const cached = impactCache[key];
        return cached && (now - cached.timestamp > cacheTimeout);
      });

      if (expiredSimulations.length > 0 || expiredImpacts.length > 0) {
        console.log(`Cleaning up ${expiredSimulations.length} simulation and ${expiredImpacts.length} impact cache entries`);

        // For now, we clear all cache if there are expired entries
        // In a more sophisticated implementation, we could selectively remove entries
        yield put(clearCache());
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

/**
 * Performance monitoring saga
 */
function* performanceMonitoringSaga(): SagaIterator {
  while (true) {
    try {
      yield delay(60000); // Check every minute

      // Log performance metrics
      console.log(`Active scenario analyses: ${activeAnalyses}`);

      // Get cache statistics
      const state: RootState = yield select();
      const { simulationCache, impactCache } = state.scenarios.cache;
      const totalCacheSize = Object.keys(simulationCache).length + Object.keys(impactCache).length;

      console.log(`Scenarios cache size: ${totalCacheSize} entries`);

      // Could implement more sophisticated monitoring here
      // such as tracking average response times, error rates, etc.
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }
}

/**
 * Error handling saga
 */
function* errorHandlingSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const error = action.payload;

    console.error('Scenarios error:', error);

    // Implement retry logic for network errors
    if (typeof error === 'string' && error.includes('network')) {
      yield delay(5000);
      // Could dispatch retry action here
    }

    // Handle specific error types
    if (typeof error === 'string' && error.includes('rate limit')) {
      // Rate limiting - wait longer
      yield delay(30000);
    }
  } catch (err) {
    console.error('Error in error handling saga:', err);
  }
}

/**
 * Auto-analyze scenarios when portfolio changes
 */
function* autoAnalyzeOnPortfolioChangeSaga(action: PayloadAction<string | null>): SagaIterator {
  try {
    const portfolioId = action.payload;
    if (!portfolioId) return;

    const autoRun: boolean = yield select(selectAutoRunSimulations);
    if (!autoRun) return;

    const selectedScenarios: string[] = yield select(selectSelectedScenarios);
    if (selectedScenarios.length === 0) return;

    // Wait a bit to allow other changes to settle
    yield delay(2000);

    // Trigger batch analysis
    yield put({
      type: 'scenarios/batchAnalysis',
      payload: {
        portfolioId,
        scenarios: selectedScenarios,
        portfolio: {}, // This would need to be populated with actual portfolio data
        dataFetcher: null, // This would need to be populated with actual data fetcher
      },
    });
  } catch (error) {
    console.error('Auto-analyze on portfolio change error:', error);
  }
}

/**
 * Track active analyses
 */
function* trackActiveAnalysesSaga(): SagaIterator {
  yield takeEvery([runSimulation.pending.type, analyzeImpact.pending.type], function* () {
    activeAnalyses++;
  });

  yield takeEvery([
    runSimulation.fulfilled.type,
    runSimulation.rejected.type,
    analyzeImpact.fulfilled.type,
    analyzeImpact.rejected.type,
  ], function* () {
    activeAnalyses = Math.max(0, activeAnalyses - 1);
  });
}

/**
 * Settings change handler
 */
function* handleSettingsChangeSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const settings = action.payload;

    // If auto-run was enabled and we have a current portfolio, trigger analysis
    if (settings.autoRunSimulations) {
      const currentPortfolio: string | null = yield select(selectCurrentPortfolioId);
      const selectedScenarios: string[] = yield select(selectSelectedScenarios);

      if (currentPortfolio && selectedScenarios.length > 0) {
        yield delay(1000); // Brief delay

        yield put({
          type: 'scenarios/batchAnalysis',
          payload: {
            portfolioId: currentPortfolio,
            scenarios: selectedScenarios,
            portfolio: {},
            dataFetcher: null,
          },
        });
      }
    }
  } catch (error) {
    console.error('Handle settings change error:', error);
  }
}

/**
 * Root scenarios saga
 */
export function* scenariosSaga(): SagaIterator {
  // Handle success actions for visualization updates
  yield takeEvery(createChain.fulfilled.type, handleChainCreationSuccessSaga);
  yield takeEvery(modifyChain.fulfilled.type, handleChainModificationSuccessSaga);
  yield takeEvery(loadChain.fulfilled.type, handleChainLoadSuccessSaga);
  yield takeEvery(runSimulation.fulfilled.type, handleSimulationSuccessSaga);

  // Handle batch operations
  yield takeLatest('scenarios/batchAnalysis', batchScenarioAnalysisSaga);

  // Handle settings changes
  yield takeEvery('scenarios/updateSettings', handleSettingsChangeSaga);

  // Handle portfolio changes for auto-analysis
  yield takeEvery('scenarios/setCurrentPortfolio', autoAnalyzeOnPortfolioChangeSaga);

  // Handle error cases
  yield takeEvery([
    loadScenarios.rejected.type,
    runSimulation.rejected.type,
    analyzeImpact.rejected.type,
    createChain.rejected.type,
    modifyChain.rejected.type,
    loadChain.rejected.type,
    deleteChain.rejected.type,
  ], errorHandlingSaga);

  // Start background processes
  yield all([
    call(autoRefreshScenariosSaga),
    call(concurrentAnalysisManagerSaga),
    call(cacheCleanupSaga),
    call(performanceMonitoringSaga),
    call(trackActiveAnalysesSaga),
  ]);
}

export default scenariosSaga;