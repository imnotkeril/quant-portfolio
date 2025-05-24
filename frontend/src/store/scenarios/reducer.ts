/**
 * Scenarios store reducer
 */
import { ScenariosState, ScenariosAction, ScenariosActionTypes } from './types';

/**
 * Initial scenarios state
 */
const initialState: ScenariosState = {
  // Loading states
  scenariosLoading: false,
  simulationLoading: false,
  impactAnalysisLoading: false,
  chainManagementLoading: false,

  // Data
  availableScenarios: [],
  simulationResults: {},
  impactResults: {},
  scenarioChains: {},

  // Current analysis
  currentPortfolioId: null,
  selectedScenarios: [],
  activeSimulation: null,

  // UI state
  viewMode: 'list',
  selectedChain: null,
  chainVisualizationData: null,

  // Simulation parameters
  simulationParameters: {
    numSimulations: 1000,
    confidenceLevel: 0.95,
    timeHorizon: 252, // 1 year in trading days
  },

  // Custom scenarios
  customScenarios: {},

  // Cache
  cache: {
    scenarioListCache: null,
    simulationCache: {},
    impactCache: {},
  },

  // Errors
  errors: {
    scenarios: null,
    simulation: null,
    impact: null,
    chainManagement: null,
  },

  // Settings
  settings: {
    autoRunSimulations: false,
    defaultSimulations: 1000,
    cacheTimeout: 300000, // 5 minutes
    maxConcurrentAnalyses: 3,
  },
};

/**
 * Scenarios reducer
 */
export const scenariosReducer = (
  state: ScenariosState = initialState,
  action: ScenariosAction
): ScenariosState => {
  switch (action.type) {
    // Scenario list
    case ScenariosActionTypes.LOAD_SCENARIOS_REQUEST:
      return {
        ...state,
        scenariosLoading: true,
        errors: {
          ...state.errors,
          scenarios: null,
        },
      };

    case ScenariosActionTypes.LOAD_SCENARIOS_SUCCESS:
      return {
        ...state,
        scenariosLoading: false,
        availableScenarios: action.payload.scenarios,
        cache: {
          ...state.cache,
          scenarioListCache: {
            data: action.payload.scenarios,
            timestamp: Date.now(),
          },
        },
        errors: {
          ...state.errors,
          scenarios: null,
        },
      };

    case ScenariosActionTypes.LOAD_SCENARIOS_FAILURE:
      return {
        ...state,
        scenariosLoading: false,
        errors: {
          ...state.errors,
          scenarios: action.payload.error,
        },
      };

    // Simulation
    case ScenariosActionTypes.RUN_SIMULATION_REQUEST:
      return {
        ...state,
        simulationLoading: true,
        errors: {
          ...state.errors,
          simulation: null,
        },
      };

    case ScenariosActionTypes.RUN_SIMULATION_SUCCESS:
      return {
        ...state,
        simulationLoading: false,
        simulationResults: {
          ...state.simulationResults,
          [action.payload.simulationId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          simulationCache: {
            ...state.cache.simulationCache,
            [action.payload.simulationId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          simulation: null,
        },
      };

    case ScenariosActionTypes.RUN_SIMULATION_FAILURE:
      return {
        ...state,
        simulationLoading: false,
        errors: {
          ...state.errors,
          simulation: action.payload.error,
        },
      };

    // Impact analysis
    case ScenariosActionTypes.ANALYZE_IMPACT_REQUEST:
      return {
        ...state,
        impactAnalysisLoading: true,
        errors: {
          ...state.errors,
          impact: null,
        },
      };

    case ScenariosActionTypes.ANALYZE_IMPACT_SUCCESS:
      return {
        ...state,
        impactAnalysisLoading: false,
        impactResults: {
          ...state.impactResults,
          [action.payload.portfolioId]: action.payload.data,
        },
        cache: {
          ...state.cache,
          impactCache: {
            ...state.cache.impactCache,
            [action.payload.portfolioId]: {
              data: action.payload.data,
              timestamp: Date.now(),
            },
          },
        },
        errors: {
          ...state.errors,
          impact: null,
        },
      };

    case ScenariosActionTypes.ANALYZE_IMPACT_FAILURE:
      return {
        ...state,
        impactAnalysisLoading: false,
        errors: {
          ...state.errors,
          impact: action.payload.error,
        },
      };

    // Chain management
    case ScenariosActionTypes.CREATE_CHAIN_REQUEST:
    case ScenariosActionTypes.MODIFY_CHAIN_REQUEST:
    case ScenariosActionTypes.DELETE_CHAIN_REQUEST:
    case ScenariosActionTypes.LOAD_CHAIN_REQUEST:
      return {
        ...state,
        chainManagementLoading: true,
        errors: {
          ...state.errors,
          chainManagement: null,
        },
      };

    case ScenariosActionTypes.CREATE_CHAIN_SUCCESS:
    case ScenariosActionTypes.MODIFY_CHAIN_SUCCESS:
    case ScenariosActionTypes.LOAD_CHAIN_SUCCESS:
      return {
        ...state,
        chainManagementLoading: false,
        scenarioChains: {
          ...state.scenarioChains,
          [action.payload.name]: action.payload.data,
        },
        errors: {
          ...state.errors,
          chainManagement: null,
        },
      };

    case ScenariosActionTypes.DELETE_CHAIN_SUCCESS:
      const { [action.payload.name]: deletedChain, ...remainingChains } = state.scenarioChains;
      return {
        ...state,
        chainManagementLoading: false,
        scenarioChains: remainingChains,
        selectedChain: state.selectedChain === action.payload.name ? null : state.selectedChain,
        errors: {
          ...state.errors,
          chainManagement: null,
        },
      };

    case ScenariosActionTypes.CREATE_CHAIN_FAILURE:
    case ScenariosActionTypes.MODIFY_CHAIN_FAILURE:
    case ScenariosActionTypes.DELETE_CHAIN_FAILURE:
    case ScenariosActionTypes.LOAD_CHAIN_FAILURE:
      return {
        ...state,
        chainManagementLoading: false,
        errors: {
          ...state.errors,
          chainManagement: action.payload.error,
        },
      };

    // UI state actions
    case ScenariosActionTypes.SET_CURRENT_PORTFOLIO:
      return {
        ...state,
        currentPortfolioId: action.payload,
      };

    case ScenariosActionTypes.SET_SELECTED_SCENARIOS:
      return {
        ...state,
        selectedScenarios: action.payload,
      };

    case ScenariosActionTypes.SET_ACTIVE_SIMULATION:
      return {
        ...state,
        activeSimulation: action.payload,
      };

    case ScenariosActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case ScenariosActionTypes.SET_SELECTED_CHAIN:
      return {
        ...state,
        selectedChain: action.payload,
      };

    case ScenariosActionTypes.SET_CHAIN_VISUALIZATION_DATA:
      return {
        ...state,
        chainVisualizationData: action.payload,
      };

    // Parameters
    case ScenariosActionTypes.UPDATE_SIMULATION_PARAMETERS:
      return {
        ...state,
        simulationParameters: {
          ...state.simulationParameters,
          ...action.payload,
        },
      };

    case ScenariosActionTypes.RESET_SIMULATION_PARAMETERS:
      return {
        ...state,
        simulationParameters: initialState.simulationParameters,
      };

    // Custom scenarios
    case ScenariosActionTypes.ADD_CUSTOM_SCENARIO:
      return {
        ...state,
        customScenarios: {
          ...state.customScenarios,
          [action.payload.id]: action.payload,
        },
      };

    case ScenariosActionTypes.UPDATE_CUSTOM_SCENARIO:
      return {
        ...state,
        customScenarios: {
          ...state.customScenarios,
          [action.payload.id]: {
            ...state.customScenarios[action.payload.id],
            ...action.payload.updates,
            updatedAt: new Date().toISOString(),
          },
        },
      };

    case ScenariosActionTypes.DELETE_CUSTOM_SCENARIO:
      const { [action.payload]: deletedScenario, ...remainingScenarios } = state.customScenarios;
      return {
        ...state,
        customScenarios: remainingScenarios,
      };

    // Cache management
    case ScenariosActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: {
          scenarioListCache: null,
          simulationCache: {},
          impactCache: {},
        },
      };

    case ScenariosActionTypes.CLEAR_SIMULATION_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          simulationCache: {},
        },
      };

    case ScenariosActionTypes.CLEAR_IMPACT_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          impactCache: {},
        },
      };

    // Settings
    case ScenariosActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ScenariosActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings,
      };

    // General actions
    case ScenariosActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {
          scenarios: null,
          simulation: null,
          impact: null,
          chainManagement: null,
        },
      };

    case ScenariosActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default scenariosReducer;