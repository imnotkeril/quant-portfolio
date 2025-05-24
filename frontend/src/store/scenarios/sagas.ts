/**
 * Scenarios store sagas
 */
import { call, put, takeLatest, takeEvery, select, delay, race, take } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { scenarioService } from '../../services/scenarios/scenarioService';
import {
  loadScenariosSuccess,
  loadScenariosFailure,
  runSimulationSuccess,
  runSimulationFailure,
  analyzeImpactSuccess,
  analyzeImpactFailure,
  createChainSuccess,
  createChainFailure,
  modifyChainSuccess,
  modifyChainFailure,
  deleteChainSuccess,
  deleteChainFailure,
  loadChainSuccess,
  loadChainFailure,
  setChainVisualizationData,
} from './actions';
import {
  ScenariosActionTypes,
  RunSimulationPayload,
  AnalyzeImpactPayload,
  CreateChainPayload,
  ModifyChainPayload,
  LoadChainPayload,
  DeleteChainPayload,
} from './types';
import {
  ScenarioListResponse,
  ScenarioSimulationResponse,
  ScenarioImpactResponse,
  ScenarioChainResponse,
} from '../../types/scenarios';
import { ApiError } from '../../types/common';
import {
  selectAutoRunSimulations,
  selectMaxConcurrentAnalyses,
  selectCacheTimeout,
  selectShouldRefreshScenarios,
} from './selectors';

/**
 * Active analyses tracker
 */
let activeAnalyses = 0;

/**
 * Load scenarios saga
 */
function* loadScenariosSaga() {
  try {
    const response: ScenarioListResponse = yield call(
      scenarioService.getAvailableScenarios
    );

    yield put(loadScenariosSuccess(response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to load scenarios',
      status: 500,
    };
    yield put(loadScenariosFailure(apiError));
  }
}

/**
 * Run simulation saga
 */
function* runSimulationSaga(action: PayloadAction<RunSimulationPayload>) {
  try {
    const { request, simulationId } = action.payload;

    // Check if we can run more analyses
    const maxConcurrent: number = yield select(selectMaxConcurrentAnalyses);
    if (activeAnalyses >= maxConcurrent) {
      throw new Error(`Maximum concurrent analyses (${maxConcurrent}) reached`);
    }

    activeAnalyses++;

    // Validate request
    const validation = scenarioService.validateScenarioSimulationRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response: ScenarioSimulationResponse = yield call(
      scenarioService.simulateScenarioChain,
      request
    );

    yield put(runSimulationSuccess(simulationId, response));

    // Generate visualization data if needed
    if (response.chainVisualizationData) {
      yield put(setChainVisualizationData(response.chainVisualizationData));
    }
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to run simulation',
      status: 500,
    };
    yield put(runSimulationFailure(apiError));
  } finally {
    activeAnalyses--;
  }
}

/**
 * Analyze impact saga
 */
function* analyzeImpactSaga(action: PayloadAction<AnalyzeImpactPayload>) {
  try {
    const { request, portfolioId } = action.payload;

    // Check if we can run more analyses
    const maxConcurrent: number = yield select(selectMaxConcurrentAnalyses);
    if (activeAnalyses >= maxConcurrent) {
      throw new Error(`Maximum concurrent analyses (${maxConcurrent}) reached`);
    }

    activeAnalyses++;

    // Validate request
    const validation = scenarioService.validateScenarioImpactRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response: ScenarioImpactResponse = yield call(
      scenarioService.analyzeScenarioImpact,
      request
    );

    yield put(analyzeImpactSuccess(portfolioId, response));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to analyze scenario impact',
      status: 500,
    };
    yield put(analyzeImpactFailure(apiError));
  } finally {
    activeAnalyses--;
  }
}

/**
 * Create chain saga
 */
function* createChainSaga(action: PayloadAction<CreateChainPayload>) {
  try {
    const { request } = action.payload;

    // Validate request
    const validation = scenarioService.validateScenarioChainRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response: ScenarioChainResponse = yield call(
      scenarioService.createScenarioChain,
      request
    );

    yield put(createChainSuccess(request.name, response));

    // Generate visualization data
    const visualizationData = scenarioService.generateVisualizationData(response.scenarioChain);
    yield put(setChainVisualizationData(visualizationData));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to create scenario chain',
      status: 500,
    };
    yield put(createChainFailure(apiError));
  }
}

/**
 * Modify chain saga
 */
function* modifyChainSaga(action: PayloadAction<ModifyChainPayload>) {
  try {
    const { request } = action.payload;

    const response: ScenarioChainResponse = yield call(
      scenarioService.modifyScenarioChain,
      request
    );

    yield put(modifyChainSuccess(request.name, response));

    // Update visualization data
    const visualizationData = scenarioService.generateVisualizationData(response.scenarioChain);
    yield put(setChainVisualizationData(visualizationData));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to modify scenario chain',
      status: 500,
    };
    yield put(modifyChainFailure(apiError));
  }
}

/**
 * Load chain saga
 */
function* loadChainSaga(action: PayloadAction<LoadChainPayload>) {
  try {
    const { name } = action.payload;

    const response: ScenarioChainResponse = yield call(
      scenarioService.getScenarioChain,
      name
    );

    yield put(loadChainSuccess(name, response));

    // Generate visualization data
    const visualizationData = scenarioService.generateVisualizationData(response.scenarioChain);
    yield put(setChainVisualizationData(visualizationData));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to load scenario chain',
      status: 500,
    };
    yield put(loadChainFailure(apiError));
  }
}

/**
 * Delete chain saga
 */
function* deleteChainSaga(action: PayloadAction<DeleteChainPayload>) {
  try {
    const { name } = action.payload;

    yield call(scenarioService.deleteScenarioChain, name);

    yield put(deleteChainSuccess(name));
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to delete scenario chain',
      status: 500,
    };
    yield put(deleteChainFailure(apiError));
  }
}

/**
 * Auto refresh scenarios saga
 */
function* autoRefreshScenariosSaga() {
  while (true) {
    try {
      const shouldRefresh: boolean = yield select(selectShouldRefreshScenarios);

      if (shouldRefresh) {
        yield put({ type: ScenariosActionTypes.LOAD_SCENARIOS_REQUEST });
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
}>) {
  try {
    const { portfolioId, scenarios, portfolio, dataFetcher } = action.payload;

    // Check auto run setting
    const autoRun: boolean = yield select(selectAutoRunSimulations);
    if (!autoRun) {
      return;
    }

    // Run impact analysis
    yield put({
      type: ScenariosActionTypes.ANALYZE_IMPACT_REQUEST,
      payload: {
        request: {
          portfolio,
          scenarios,
          dataFetcher,
        },
        portfolioId,
      },
    });

    // Run simulations for each scenario
    for (const scenario of scenarios) {
      const simulationId = `${portfolioId}_${scenario}_${Date.now()}`;

      yield put({
        type: ScenariosActionTypes.RUN_SIMULATION_REQUEST,
        payload: {
          request: {
            startingScenario: scenario,
            numSimulations: 100, // Smaller number for batch operations
          },
          simulationId,
        },
      });

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
function* concurrentAnalysisManagerSaga() {
  while (true) {
    try {
      // Wait for any analysis request
      const action = yield take([
        ScenariosActionTypes.RUN_SIMULATION_REQUEST,
        ScenariosActionTypes.ANALYZE_IMPACT_REQUEST,
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
 * Error handling saga
 */
function* errorHandlingSaga(action: PayloadAction<{ error: ApiError }>) {
  const { error } = action.payload;

  console.error('Scenarios error:', error);

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
 * Cache cleanup saga
 */
function* cacheCleanupSaga() {
  while (true) {
    try {
      // Clean up expired cache entries every 10 minutes
      yield delay(600000);

      const cacheTimeout: number = yield select(selectCacheTimeout);
      const now = Date.now();

      // This would typically dispatch actions to clean up expired cache entries
      // The actual implementation would check timestamps and remove expired entries
      console.log('Cleaning up expired scenarios cache entries');
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

/**
 * Performance monitoring saga
 */
function* performanceMonitoringSaga() {
  while (true) {
    try {
      yield delay(60000); // Check every minute

      // Log performance metrics
      console.log(`Active scenario analyses: ${activeAnalyses}`);

      // Could implement more sophisticated monitoring here
      // such as tracking average response times, error rates, etc.
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }
}

/**
 * Race condition handler for simultaneous requests
 */
function* raceConditionHandlerSaga(action: PayloadAction<any>) {
  try {
    const { type, payload } = action;

    // Create a unique key for the request
    const requestKey = `${type}_${JSON.stringify(payload)}`;

    // Use race to handle simultaneous identical requests
    const { response, timeout } = yield race({
      response: call(function* () {
        // The actual saga call would go here
        yield delay(100); // Placeholder
      }),
      timeout: delay(30000), // 30 second timeout
    });

    if (timeout) {
      throw new Error('Request timeout');
    }
  } catch (error) {
    console.error('Race condition handler error:', error);
  }
}

/**
 * Root scenarios saga
 */
export function* scenariosSaga() {
  // Watch for specific actions
  yield takeLatest(ScenariosActionTypes.LOAD_SCENARIOS_REQUEST, loadScenariosSaga);
  yield takeEvery(ScenariosActionTypes.RUN_SIMULATION_REQUEST, runSimulationSaga);
  yield takeEvery(ScenariosActionTypes.ANALYZE_IMPACT_REQUEST, analyzeImpactSaga);
  yield takeLatest(ScenariosActionTypes.CREATE_CHAIN_REQUEST, createChainSaga);
  yield takeLatest(ScenariosActionTypes.MODIFY_CHAIN_REQUEST, modifyChainSaga);
  yield takeLatest(ScenariosActionTypes.LOAD_CHAIN_REQUEST, loadChainSaga);
  yield takeLatest(ScenariosActionTypes.DELETE_CHAIN_REQUEST, deleteChainSaga);

  // Watch for batch operations
  yield takeLatest('scenarios/BATCH_ANALYSIS_REQUEST', batchScenarioAnalysisSaga);

  // Watch for error handling
  yield takeEvery([
    ScenariosActionTypes.LOAD_SCENARIOS_FAILURE,
    ScenariosActionTypes.RUN_SIMULATION_FAILURE,
    ScenariosActionTypes.ANALYZE_IMPACT_FAILURE,
    ScenariosActionTypes.CREATE_CHAIN_FAILURE,
    ScenariosActionTypes.MODIFY_CHAIN_FAILURE,
    ScenariosActionTypes.DELETE_CHAIN_FAILURE,
    ScenariosActionTypes.LOAD_CHAIN_FAILURE,
  ], errorHandlingSaga);

  // Start background processes
  yield call(autoRefreshScenariosSaga);
  yield call(concurrentAnalysisManagerSaga);
  yield call(cacheCleanupSaga);
  yield call(performanceMonitoringSaga);
}

export default scenariosSaga;