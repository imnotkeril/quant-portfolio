/**
 * Scenarios store types
 */
import {
  ScenarioListResponse,
  ScenarioSimulationResponse,
  ScenarioImpactResponse,
  ScenarioChainResponse,
  ScenarioSimulationRequest,
  ScenarioImpactRequest,
  ScenarioChainRequest,
  ScenarioModificationRequest,
} from '../../types/scenarios';
import { ApiError } from '../../types/common';

/**
 * Scenario analysis state
 */
export interface ScenariosState {
  // Loading states
  scenariosLoading: boolean;
  simulationLoading: boolean;
  impactAnalysisLoading: boolean;
  chainManagementLoading: boolean;

  // Data
  availableScenarios: string[];
  simulationResults: Record<string, ScenarioSimulationResponse>;
  impactResults: Record<string, ScenarioImpactResponse>;
  scenarioChains: Record<string, ScenarioChainResponse>;

  // Current analysis
  currentPortfolioId: string | null;
  selectedScenarios: string[];
  activeSimulation: string | null;

  // UI state
  viewMode: ScenarioViewMode;
  selectedChain: string | null;
  chainVisualizationData: any | null;

  // Simulation parameters
  simulationParameters: {
    numSimulations: number;
    confidenceLevel: number;
    timeHorizon: number;
  };

  // Custom scenarios
  customScenarios: Record<string, CustomScenario>;

  // Cache
  cache: {
    scenarioListCache: { data: string[]; timestamp: number } | null;
    simulationCache: Record<string, { data: ScenarioSimulationResponse; timestamp: number }>;
    impactCache: Record<string, { data: ScenarioImpactResponse; timestamp: number }>;
  };

  // Errors
  errors: {
    scenarios: ApiError | null;
    simulation: ApiError | null;
    impact: ApiError | null;
    chainManagement: ApiError | null;
  };

  // Settings
  settings: {
    autoRunSimulations: boolean;
    defaultSimulations: number;
    cacheTimeout: number;
    maxConcurrentAnalyses: number;
  };
}

/**
 * Scenario view modes
 */
export type ScenarioViewMode =
  | 'list'
  | 'simulation'
  | 'impact'
  | 'chains'
  | 'comparison';

/**
 * Custom scenario definition
 */
export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  initialImpact: Record<string, number>;
  leadsTo: Array<{
    scenario: string;
    probability: number;
    delay: number;
    magnitudeModifier: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Scenario action types
 */
export enum ScenariosActionTypes {
  // Scenario list actions
  LOAD_SCENARIOS_REQUEST = 'scenarios/LOAD_SCENARIOS_REQUEST',
  LOAD_SCENARIOS_SUCCESS = 'scenarios/LOAD_SCENARIOS_SUCCESS',
  LOAD_SCENARIOS_FAILURE = 'scenarios/LOAD_SCENARIOS_FAILURE',

  // Simulation actions
  RUN_SIMULATION_REQUEST = 'scenarios/RUN_SIMULATION_REQUEST',
  RUN_SIMULATION_SUCCESS = 'scenarios/RUN_SIMULATION_SUCCESS',
  RUN_SIMULATION_FAILURE = 'scenarios/RUN_SIMULATION_FAILURE',

  // Impact analysis actions
  ANALYZE_IMPACT_REQUEST = 'scenarios/ANALYZE_IMPACT_REQUEST',
  ANALYZE_IMPACT_SUCCESS = 'scenarios/ANALYZE_IMPACT_SUCCESS',
  ANALYZE_IMPACT_FAILURE = 'scenarios/ANALYZE_IMPACT_FAILURE',

  // Chain management actions
  CREATE_CHAIN_REQUEST = 'scenarios/CREATE_CHAIN_REQUEST',
  CREATE_CHAIN_SUCCESS = 'scenarios/CREATE_CHAIN_SUCCESS',
  CREATE_CHAIN_FAILURE = 'scenarios/CREATE_CHAIN_FAILURE',

  MODIFY_CHAIN_REQUEST = 'scenarios/MODIFY_CHAIN_REQUEST',
  MODIFY_CHAIN_SUCCESS = 'scenarios/MODIFY_CHAIN_SUCCESS',
  MODIFY_CHAIN_FAILURE = 'scenarios/MODIFY_CHAIN_FAILURE',

  DELETE_CHAIN_REQUEST = 'scenarios/DELETE_CHAIN_REQUEST',
  DELETE_CHAIN_SUCCESS = 'scenarios/DELETE_CHAIN_SUCCESS',
  DELETE_CHAIN_FAILURE = 'scenarios/DELETE_CHAIN_FAILURE',

  LOAD_CHAIN_REQUEST = 'scenarios/LOAD_CHAIN_REQUEST',
  LOAD_CHAIN_SUCCESS = 'scenarios/LOAD_CHAIN_SUCCESS',
  LOAD_CHAIN_FAILURE = 'scenarios/LOAD_CHAIN_FAILURE',

  // UI state actions
  SET_CURRENT_PORTFOLIO = 'scenarios/SET_CURRENT_PORTFOLIO',
  SET_SELECTED_SCENARIOS = 'scenarios/SET_SELECTED_SCENARIOS',
  SET_ACTIVE_SIMULATION = 'scenarios/SET_ACTIVE_SIMULATION',
  SET_VIEW_MODE = 'scenarios/SET_VIEW_MODE',
  SET_SELECTED_CHAIN = 'scenarios/SET_SELECTED_CHAIN',
  SET_CHAIN_VISUALIZATION_DATA = 'scenarios/SET_CHAIN_VISUALIZATION_DATA',

  // Parameters actions
  UPDATE_SIMULATION_PARAMETERS = 'scenarios/UPDATE_SIMULATION_PARAMETERS',
  RESET_SIMULATION_PARAMETERS = 'scenarios/RESET_SIMULATION_PARAMETERS',

  // Custom scenarios actions
  ADD_CUSTOM_SCENARIO = 'scenarios/ADD_CUSTOM_SCENARIO',
  UPDATE_CUSTOM_SCENARIO = 'scenarios/UPDATE_CUSTOM_SCENARIO',
  DELETE_CUSTOM_SCENARIO = 'scenarios/DELETE_CUSTOM_SCENARIO',

  // Cache actions
  CLEAR_CACHE = 'scenarios/CLEAR_CACHE',
  CLEAR_SIMULATION_CACHE = 'scenarios/CLEAR_SIMULATION_CACHE',
  CLEAR_IMPACT_CACHE = 'scenarios/CLEAR_IMPACT_CACHE',

  // Settings actions
  UPDATE_SETTINGS = 'scenarios/UPDATE_SETTINGS',
  RESET_SETTINGS = 'scenarios/RESET_SETTINGS',

  // General actions
  CLEAR_ERRORS = 'scenarios/CLEAR_ERRORS',
  RESET_STATE = 'scenarios/RESET_STATE',
}

/**
 * Simulation payload
 */
export interface RunSimulationPayload {
  request: ScenarioSimulationRequest;
  simulationId: string;
}

/**
 * Impact analysis payload
 */
export interface AnalyzeImpactPayload {
  request: ScenarioImpactRequest;
  portfolioId: string;
}

/**
 * Chain management payloads
 */
export interface CreateChainPayload {
  request: ScenarioChainRequest;
}

export interface ModifyChainPayload {
  request: ScenarioModificationRequest;
}

export interface LoadChainPayload {
  name: string;
}

export interface DeleteChainPayload {
  name: string;
}

/**
 * Scenario action interfaces
 */
export interface LoadScenariosRequestAction {
  type: ScenariosActionTypes.LOAD_SCENARIOS_REQUEST;
}

export interface LoadScenariosSuccessAction {
  type: ScenariosActionTypes.LOAD_SCENARIOS_SUCCESS;
  payload: ScenarioListResponse;
}

export interface LoadScenariosFailureAction {
  type: ScenariosActionTypes.LOAD_SCENARIOS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface RunSimulationRequestAction {
  type: ScenariosActionTypes.RUN_SIMULATION_REQUEST;
  payload: RunSimulationPayload;
}

export interface RunSimulationSuccessAction {
  type: ScenariosActionTypes.RUN_SIMULATION_SUCCESS;
  payload: {
    simulationId: string;
    data: ScenarioSimulationResponse;
  };
}

export interface RunSimulationFailureAction {
  type: ScenariosActionTypes.RUN_SIMULATION_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface AnalyzeImpactRequestAction {
  type: ScenariosActionTypes.ANALYZE_IMPACT_REQUEST;
  payload: AnalyzeImpactPayload;
}

export interface AnalyzeImpactSuccessAction {
  type: ScenariosActionTypes.ANALYZE_IMPACT_SUCCESS;
  payload: {
    portfolioId: string;
    data: ScenarioImpactResponse;
  };
}

export interface AnalyzeImpactFailureAction {
  type: ScenariosActionTypes.ANALYZE_IMPACT_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CreateChainRequestAction {
  type: ScenariosActionTypes.CREATE_CHAIN_REQUEST;
  payload: CreateChainPayload;
}

export interface CreateChainSuccessAction {
  type: ScenariosActionTypes.CREATE_CHAIN_SUCCESS;
  payload: {
    name: string;
    data: ScenarioChainResponse;
  };
}

export interface CreateChainFailureAction {
  type: ScenariosActionTypes.CREATE_CHAIN_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface ModifyChainRequestAction {
  type: ScenariosActionTypes.MODIFY_CHAIN_REQUEST;
  payload: ModifyChainPayload;
}

export interface ModifyChainSuccessAction {
  type: ScenariosActionTypes.MODIFY_CHAIN_SUCCESS;
  payload: {
    name: string;
    data: ScenarioChainResponse;
  };
}

export interface ModifyChainFailureAction {
  type: ScenariosActionTypes.MODIFY_CHAIN_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface DeleteChainRequestAction {
  type: ScenariosActionTypes.DELETE_CHAIN_REQUEST;
  payload: DeleteChainPayload;
}

export interface DeleteChainSuccessAction {
  type: ScenariosActionTypes.DELETE_CHAIN_SUCCESS;
  payload: {
    name: string;
  };
}

export interface DeleteChainFailureAction {
  type: ScenariosActionTypes.DELETE_CHAIN_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface LoadChainRequestAction {
  type: ScenariosActionTypes.LOAD_CHAIN_REQUEST;
  payload: LoadChainPayload;
}

export interface LoadChainSuccessAction {
  type: ScenariosActionTypes.LOAD_CHAIN_SUCCESS;
  payload: {
    name: string;
    data: ScenarioChainResponse;
  };
}

export interface LoadChainFailureAction {
  type: ScenariosActionTypes.LOAD_CHAIN_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface SetCurrentPortfolioAction {
  type: ScenariosActionTypes.SET_CURRENT_PORTFOLIO;
  payload: string | null;
}

export interface SetSelectedScenariosAction {
  type: ScenariosActionTypes.SET_SELECTED_SCENARIOS;
  payload: string[];
}

export interface SetActiveSimulationAction {
  type: ScenariosActionTypes.SET_ACTIVE_SIMULATION;
  payload: string | null;
}

export interface SetViewModeAction {
  type: ScenariosActionTypes.SET_VIEW_MODE;
  payload: ScenarioViewMode;
}

export interface SetSelectedChainAction {
  type: ScenariosActionTypes.SET_SELECTED_CHAIN;
  payload: string | null;
}

export interface SetChainVisualizationDataAction {
  type: ScenariosActionTypes.SET_CHAIN_VISUALIZATION_DATA;
  payload: any;
}

export interface UpdateSimulationParametersAction {
  type: ScenariosActionTypes.UPDATE_SIMULATION_PARAMETERS;
  payload: Partial<ScenariosState['simulationParameters']>;
}

export interface ResetSimulationParametersAction {
  type: ScenariosActionTypes.RESET_SIMULATION_PARAMETERS;
}

export interface AddCustomScenarioAction {
  type: ScenariosActionTypes.ADD_CUSTOM_SCENARIO;
  payload: CustomScenario;
}

export interface UpdateCustomScenarioAction {
  type: ScenariosActionTypes.UPDATE_CUSTOM_SCENARIO;
  payload: {
    id: string;
    updates: Partial<CustomScenario>;
  };
}

export interface DeleteCustomScenarioAction {
  type: ScenariosActionTypes.DELETE_CUSTOM_SCENARIO;
  payload: string;
}

export interface ClearCacheAction {
  type: ScenariosActionTypes.CLEAR_CACHE;
}

export interface ClearSimulationCacheAction {
  type: ScenariosActionTypes.CLEAR_SIMULATION_CACHE;
}

export interface ClearImpactCacheAction {
  type: ScenariosActionTypes.CLEAR_IMPACT_CACHE;
}

export interface UpdateSettingsAction {
  type: ScenariosActionTypes.UPDATE_SETTINGS;
  payload: Partial<ScenariosState['settings']>;
}

export interface ResetSettingsAction {
  type: ScenariosActionTypes.RESET_SETTINGS;
}

export interface ClearErrorsAction {
  type: ScenariosActionTypes.CLEAR_ERRORS;
}

export interface ResetStateAction {
  type: ScenariosActionTypes.RESET_STATE;
}

/**
 * Scenarios action union type
 */
export type ScenariosAction =
  | LoadScenariosRequestAction
  | LoadScenariosSuccessAction
  | LoadScenariosFailureAction
  | RunSimulationRequestAction
  | RunSimulationSuccessAction
  | RunSimulationFailureAction
  | AnalyzeImpactRequestAction
  | AnalyzeImpactSuccessAction
  | AnalyzeImpactFailureAction
  | CreateChainRequestAction
  | CreateChainSuccessAction
  | CreateChainFailureAction
  | ModifyChainRequestAction
  | ModifyChainSuccessAction
  | ModifyChainFailureAction
  | DeleteChainRequestAction
  | DeleteChainSuccessAction
  | DeleteChainFailureAction
  | LoadChainRequestAction
  | LoadChainSuccessAction
  | LoadChainFailureAction
  | SetCurrentPortfolioAction
  | SetSelectedScenariosAction
  | SetActiveSimulationAction
  | SetViewModeAction
  | SetSelectedChainAction
  | SetChainVisualizationDataAction
  | UpdateSimulationParametersAction
  | ResetSimulationParametersAction
  | AddCustomScenarioAction
  | UpdateCustomScenarioAction
  | DeleteCustomScenarioAction
  | ClearCacheAction
  | ClearSimulationCacheAction
  | ClearImpactCacheAction
  | UpdateSettingsAction
  | ResetSettingsAction
  | ClearErrorsAction
  | ResetStateAction;