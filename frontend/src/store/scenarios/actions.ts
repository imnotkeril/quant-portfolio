/**
 * Scenarios store actions
 */
import {
  ScenariosActionTypes,
  ScenariosAction,
  RunSimulationPayload,
  AnalyzeImpactPayload,
  CreateChainPayload,
  ModifyChainPayload,
  LoadChainPayload,
  DeleteChainPayload,
  ScenarioViewMode,
  CustomScenario,
  ScenariosState,
} from './types';
import { ApiError } from '../../types/common';
import {
  ScenarioListResponse,
  ScenarioSimulationResponse,
  ScenarioImpactResponse,
  ScenarioChainResponse,
} from '../../types/scenarios';

/**
 * Scenario list actions
 */
export const loadScenariosRequest = (): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_SCENARIOS_REQUEST,
});

export const loadScenariosSuccess = (data: ScenarioListResponse): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_SCENARIOS_SUCCESS,
  payload: data,
});

export const loadScenariosFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_SCENARIOS_FAILURE,
  payload: { error },
});

/**
 * Simulation actions
 */
export const runSimulationRequest = (payload: RunSimulationPayload): ScenariosAction => ({
  type: ScenariosActionTypes.RUN_SIMULATION_REQUEST,
  payload,
});

export const runSimulationSuccess = (
  simulationId: string,
  data: ScenarioSimulationResponse
): ScenariosAction => ({
  type: ScenariosActionTypes.RUN_SIMULATION_SUCCESS,
  payload: { simulationId, data },
});

export const runSimulationFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.RUN_SIMULATION_FAILURE,
  payload: { error },
});

/**
 * Impact analysis actions
 */
export const analyzeImpactRequest = (payload: AnalyzeImpactPayload): ScenariosAction => ({
  type: ScenariosActionTypes.ANALYZE_IMPACT_REQUEST,
  payload,
});

export const analyzeImpactSuccess = (
  portfolioId: string,
  data: ScenarioImpactResponse
): ScenariosAction => ({
  type: ScenariosActionTypes.ANALYZE_IMPACT_SUCCESS,
  payload: { portfolioId, data },
});

export const analyzeImpactFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.ANALYZE_IMPACT_FAILURE,
  payload: { error },
});

/**
 * Chain management actions
 */
export const createChainRequest = (payload: CreateChainPayload): ScenariosAction => ({
  type: ScenariosActionTypes.CREATE_CHAIN_REQUEST,
  payload,
});

export const createChainSuccess = (
  name: string,
  data: ScenarioChainResponse
): ScenariosAction => ({
  type: ScenariosActionTypes.CREATE_CHAIN_SUCCESS,
  payload: { name, data },
});

export const createChainFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.CREATE_CHAIN_FAILURE,
  payload: { error },
});

export const modifyChainRequest = (payload: ModifyChainPayload): ScenariosAction => ({
  type: ScenariosActionTypes.MODIFY_CHAIN_REQUEST,
  payload,
});

export const modifyChainSuccess = (
  name: string,
  data: ScenarioChainResponse
): ScenariosAction => ({
  type: ScenariosActionTypes.MODIFY_CHAIN_SUCCESS,
  payload: { name, data },
});

export const modifyChainFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.MODIFY_CHAIN_FAILURE,
  payload: { error },
});

export const deleteChainRequest = (payload: DeleteChainPayload): ScenariosAction => ({
  type: ScenariosActionTypes.DELETE_CHAIN_REQUEST,
  payload,
});

export const deleteChainSuccess = (name: string): ScenariosAction => ({
  type: ScenariosActionTypes.DELETE_CHAIN_SUCCESS,
  payload: { name },
});

export const deleteChainFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.DELETE_CHAIN_FAILURE,
  payload: { error },
});

export const loadChainRequest = (payload: LoadChainPayload): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_CHAIN_REQUEST,
  payload,
});

export const loadChainSuccess = (
  name: string,
  data: ScenarioChainResponse
): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_CHAIN_SUCCESS,
  payload: { name, data },
});

export const loadChainFailure = (error: ApiError): ScenariosAction => ({
  type: ScenariosActionTypes.LOAD_CHAIN_FAILURE,
  payload: { error },
});

/**
 * UI state actions
 */
export const setCurrentPortfolio = (portfolioId: string | null): ScenariosAction => ({
  type: ScenariosActionTypes.SET_CURRENT_PORTFOLIO,
  payload: portfolioId,
});

export const setSelectedScenarios = (scenarios: string[]): ScenariosAction => ({
  type: ScenariosActionTypes.SET_SELECTED_SCENARIOS,
  payload: scenarios,
});

export const setActiveSimulation = (simulationId: string | null): ScenariosAction => ({
  type: ScenariosActionTypes.SET_ACTIVE_SIMULATION,
  payload: simulationId,
});

export const setViewMode = (viewMode: ScenarioViewMode): ScenariosAction => ({
  type: ScenariosActionTypes.SET_VIEW_MODE,
  payload: viewMode,
});

export const setSelectedChain = (chainName: string | null): ScenariosAction => ({
  type: ScenariosActionTypes.SET_SELECTED_CHAIN,
  payload: chainName,
});

export const setChainVisualizationData = (data: any): ScenariosAction => ({
  type: ScenariosActionTypes.SET_CHAIN_VISUALIZATION_DATA,
  payload: data,
});

/**
 * Parameters actions
 */
export const updateSimulationParameters = (
  parameters: Partial<ScenariosState['simulationParameters']>
): ScenariosAction => ({
  type: ScenariosActionTypes.UPDATE_SIMULATION_PARAMETERS,
  payload: parameters,
});

export const resetSimulationParameters = (): ScenariosAction => ({
  type: ScenariosActionTypes.RESET_SIMULATION_PARAMETERS,
});

/**
 * Custom scenarios actions
 */
export const addCustomScenario = (scenario: CustomScenario): ScenariosAction => ({
  type: ScenariosActionTypes.ADD_CUSTOM_SCENARIO,
  payload: scenario,
});

export const updateCustomScenario = (
  id: string,
  updates: Partial<CustomScenario>
): ScenariosAction => ({
  type: ScenariosActionTypes.UPDATE_CUSTOM_SCENARIO,
  payload: { id, updates },
});

export const deleteCustomScenario = (id: string): ScenariosAction => ({
  type: ScenariosActionTypes.DELETE_CUSTOM_SCENARIO,
  payload: id,
});

/**
 * Cache management actions
 */
export const clearCache = (): ScenariosAction => ({
  type: ScenariosActionTypes.CLEAR_CACHE,
});

export const clearSimulationCache = (): ScenariosAction => ({
  type: ScenariosActionTypes.CLEAR_SIMULATION_CACHE,
});

export const clearImpactCache = (): ScenariosAction => ({
  type: ScenariosActionTypes.CLEAR_IMPACT_CACHE,
});

/**
 * Settings actions
 */
export const updateSettings = (settings: Partial<ScenariosState['settings']>): ScenariosAction => ({
  type: ScenariosActionTypes.UPDATE_SETTINGS,
  payload: settings,
});

export const resetSettings = (): ScenariosAction => ({
  type: ScenariosActionTypes.RESET_SETTINGS,
});

/**
 * General actions
 */
export const clearErrors = (): ScenariosAction => ({
  type: ScenariosActionTypes.CLEAR_ERRORS,
});

export const resetState = (): ScenariosAction => ({
  type: ScenariosActionTypes.RESET_STATE,
});

/**
 * Thunk action creators (for async operations)
 */
export const loadScenarios = () => {
  return {
    type: 'ASYNC_ACTION',
    action: 'LOAD_SCENARIOS',
  };
};

export const runSimulation = (payload: RunSimulationPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'RUN_SIMULATION',
    payload,
  };
};

export const analyzeImpact = (payload: AnalyzeImpactPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'ANALYZE_IMPACT',
    payload,
  };
};

export const createChain = (payload: CreateChainPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'CREATE_CHAIN',
    payload,
  };
};

export const modifyChain = (payload: ModifyChainPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'MODIFY_CHAIN',
    payload,
  };
};

export const loadChain = (payload: LoadChainPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'LOAD_CHAIN',
    payload,
  };
};

export const deleteChain = (payload: DeleteChainPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'DELETE_CHAIN',
    payload,
  };
};