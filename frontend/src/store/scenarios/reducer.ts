/**
 * Scenarios reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScenariosState, ScenarioViewMode, CustomScenario } from './types';
import {
  loadScenarios,
  runSimulation,
  analyzeImpact,
  createChain,
  modifyChain,
  loadChain,
  deleteChain,
} from './actions';

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

const scenariosSlice = createSlice({
  name: 'scenarios',
  initialState,
  reducers: {
    // UI state actions
    setCurrentPortfolio: (state, action: PayloadAction<string | null>) => {
      state.currentPortfolioId = action.payload;
    },
    setSelectedScenarios: (state, action: PayloadAction<string[]>) => {
      state.selectedScenarios = action.payload;
    },
    setActiveSimulation: (state, action: PayloadAction<string | null>) => {
      state.activeSimulation = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ScenarioViewMode>) => {
      state.viewMode = action.payload;
    },
    setSelectedChain: (state, action: PayloadAction<string | null>) => {
      state.selectedChain = action.payload;
    },
    setChainVisualizationData: (state, action: PayloadAction<any>) => {
      state.chainVisualizationData = action.payload;
    },

    // Parameters actions
    updateSimulationParameters: (
      state,
      action: PayloadAction<Partial<ScenariosState['simulationParameters']>>
    ) => {
      state.simulationParameters = { ...state.simulationParameters, ...action.payload };
    },
    resetSimulationParameters: (state) => {
      state.simulationParameters = initialState.simulationParameters;
    },

    // Custom scenarios actions
    addCustomScenario: (state, action: PayloadAction<CustomScenario>) => {
      state.customScenarios[action.payload.id] = action.payload;
    },
    updateCustomScenario: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CustomScenario> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.customScenarios[id]) {
        state.customScenarios[id] = {
          ...state.customScenarios[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteCustomScenario: (state, action: PayloadAction<string>) => {
      delete state.customScenarios[action.payload];
    },

    // Cache management actions
    clearCache: (state) => {
      state.cache = {
        scenarioListCache: null,
        simulationCache: {},
        impactCache: {},
      };
    },
    clearSimulationCache: (state) => {
      state.cache.simulationCache = {};
    },
    clearImpactCache: (state) => {
      state.cache.impactCache = {};
    },

    // Settings actions
    updateSettings: (
      state,
      action: PayloadAction<Partial<ScenariosState['settings']>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = initialState.settings;
    },

    // General actions
    clearErrors: (state) => {
      state.errors = {
        scenarios: null,
        simulation: null,
        impact: null,
        chainManagement: null,
      };
    },
    clearScenariosData: (state) => {
      state.availableScenarios = [];
      state.simulationResults = {};
      state.impactResults = {};
      state.scenarioChains = {};
      state.selectedScenarios = [];
      state.activeSimulation = null;
      state.selectedChain = null;
      state.chainVisualizationData = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load scenarios
    builder
      .addCase(loadScenarios.pending, (state) => {
        state.scenariosLoading = true;
        state.errors.scenarios = null;
      })
      .addCase(loadScenarios.fulfilled, (state, action) => {
        state.scenariosLoading = false;
        state.availableScenarios = action.payload.scenarios;
        state.cache.scenarioListCache = {
          data: action.payload.scenarios,
          timestamp: Date.now(),
        };
      })
      .addCase(loadScenarios.rejected, (state, action) => {
        state.scenariosLoading = false;
        state.errors.scenarios = action.payload || 'Failed to load scenarios';
      });

    // Run simulation
    builder
      .addCase(runSimulation.pending, (state) => {
        state.simulationLoading = true;
        state.errors.simulation = null;
      })
      .addCase(runSimulation.fulfilled, (state, action) => {
        state.simulationLoading = false;
        const { simulationId, data } = action.payload;
        state.simulationResults[simulationId] = data;
        state.cache.simulationCache[simulationId] = {
          data,
          timestamp: Date.now(),
        };
        state.activeSimulation = simulationId;
      })
      .addCase(runSimulation.rejected, (state, action) => {
        state.simulationLoading = false;
        state.errors.simulation = action.payload || 'Failed to run simulation';
      });

    // Analyze impact
    builder
      .addCase(analyzeImpact.pending, (state) => {
        state.impactAnalysisLoading = true;
        state.errors.impact = null;
      })
      .addCase(analyzeImpact.fulfilled, (state, action) => {
        state.impactAnalysisLoading = false;
        const { portfolioId, data } = action.payload;
        state.impactResults[portfolioId] = data;
        state.cache.impactCache[portfolioId] = {
          data,
          timestamp: Date.now(),
        };
      })
      .addCase(analyzeImpact.rejected, (state, action) => {
        state.impactAnalysisLoading = false;
        state.errors.impact = action.payload || 'Failed to analyze impact';
      });

    // Create chain
    builder
      .addCase(createChain.pending, (state) => {
        state.chainManagementLoading = true;
        state.errors.chainManagement = null;
      })
      .addCase(createChain.fulfilled, (state, action) => {
        state.chainManagementLoading = false;
        const { name, data } = action.payload;
        state.scenarioChains[name] = data;
        state.selectedChain = name;
      })
      .addCase(createChain.rejected, (state, action) => {
        state.chainManagementLoading = false;
        state.errors.chainManagement = action.payload || 'Failed to create chain';
      });

    // Modify chain
    builder
      .addCase(modifyChain.pending, (state) => {
        state.chainManagementLoading = true;
        state.errors.chainManagement = null;
      })
      .addCase(modifyChain.fulfilled, (state, action) => {
        state.chainManagementLoading = false;
        const { name, data } = action.payload;
        state.scenarioChains[name] = data;
      })
      .addCase(modifyChain.rejected, (state, action) => {
        state.chainManagementLoading = false;
        state.errors.chainManagement = action.payload || 'Failed to modify chain';
      });

    // Load chain
    builder
      .addCase(loadChain.pending, (state) => {
        state.chainManagementLoading = true;
        state.errors.chainManagement = null;
      })
      .addCase(loadChain.fulfilled, (state, action) => {
        state.chainManagementLoading = false;
        const { name, data } = action.payload;
        state.scenarioChains[name] = data;
      })
      .addCase(loadChain.rejected, (state, action) => {
        state.chainManagementLoading = false;
        state.errors.chainManagement = action.payload || 'Failed to load chain';
      });

    // Delete chain
    builder
      .addCase(deleteChain.pending, (state) => {
        state.chainManagementLoading = true;
        state.errors.chainManagement = null;
      })
      .addCase(deleteChain.fulfilled, (state, action) => {
        state.chainManagementLoading = false;
        const chainName = action.payload;
        delete state.scenarioChains[chainName];
        if (state.selectedChain === chainName) {
          state.selectedChain = null;
        }
      })
      .addCase(deleteChain.rejected, (state, action) => {
        state.chainManagementLoading = false;
        state.errors.chainManagement = action.payload || 'Failed to delete chain';
      });
  },
});

export const {
  setCurrentPortfolio,
  setSelectedScenarios,
  setActiveSimulation,
  setViewMode,
  setSelectedChain,
  setChainVisualizationData,
  updateSimulationParameters,
  resetSimulationParameters,
  addCustomScenario,
  updateCustomScenario,
  deleteCustomScenario,
  clearCache,
  clearSimulationCache,
  clearImpactCache,
  updateSettings,
  resetSettings,
  clearErrors,
  clearScenariosData,
  resetState,
} = scenariosSlice.actions;

export default scenariosSlice.reducer;