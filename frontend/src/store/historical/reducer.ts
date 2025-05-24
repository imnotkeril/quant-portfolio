/**
 * Historical store reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoricalState, HistoricalViewMode, TimeRange } from './types';
import {
  loadScenarios,
  loadContext,
  findAnalogies,
  calculateSimilarity,
  addScenario,
  deleteScenario,
  performSearch,
} from './actions';

const initialState: HistoricalState = {
  // Loading states
  scenariosLoading: false,
  contextLoading: false,
  analogiesLoading: false,
  similarityLoading: false,
  managementLoading: false,

  // Data
  availableScenarios: [],
  contextData: {},
  analogiesData: {},
  similarityData: {},
  historicalEvents: {},
  marketRegimes: {},

  // Current analysis
  currentScenarioKey: null,
  selectedAnalogies: [],
  currentMarketData: null,

  // UI state
  viewMode: 'timeline',
  selectedTimeRange: {
    start: new Date().getFullYear() - 10,
    end: new Date().getFullYear(),
    label: 'Last 10 years',
  },
  comparisonMode: false,

  // Analysis parameters
  analysisParameters: {
    similarityThreshold: 0.7,
    maxAnalogies: 10,
    includedMetrics: ['volatility', 'returns', 'correlation'],
    weightings: {
      volatility: 0.3,
      returns: 0.4,
      correlation: 0.3,
    },
  },

  // Settings
  settings: {
    autoLoadContext: true,
    cacheTimeout: 600000, // 10 minutes
    maxResults: 50,
    defaultMetrics: ['volatility', 'returns', 'correlation'],
    enableRealTimeUpdates: false,
  },
};

const historicalSlice = createSlice({
  name: 'historical',
  initialState,
  reducers: {
    // UI state actions
    setCurrentScenario: (state, action: PayloadAction<string | null>) => {
      state.currentScenarioKey = action.payload;
    },
    setSelectedAnalogies: (state, action: PayloadAction<string[]>) => {
      state.selectedAnalogies = action.payload;
    },
    setCurrentMarketData: (state, action: PayloadAction<any>) => {
      state.currentMarketData = action.payload;
    },
    setViewMode: (state, action: PayloadAction<HistoricalViewMode>) => {
      state.viewMode = action.payload;
    },
    setSelectedTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.selectedTimeRange = action.payload;
    },
    setComparisonMode: (state, action: PayloadAction<boolean>) => {
      state.comparisonMode = action.payload;
    },

    // Parameters actions
    updateAnalysisParameters: (
      state,
      action: PayloadAction<Partial<HistoricalState['analysisParameters']>>
    ) => {
      state.analysisParameters = { ...state.analysisParameters, ...action.payload };
    },
    resetAnalysisParameters: (state) => {
      state.analysisParameters = initialState.analysisParameters;
    },

    // Settings actions
    updateSettings: (
      state,
      action: PayloadAction<Partial<HistoricalState['settings']>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = initialState.settings;
    },

    // Cache management
    clearCache: (state) => {
      state.contextData = {};
      state.analogiesData = {};
      state.similarityData = {};
    },

    // General actions
    clearErrors: (state) => {
      // Clear any error states if they exist
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load scenarios
    builder
      .addCase(loadScenarios.pending, (state) => {
        state.scenariosLoading = true;
      })
      .addCase(loadScenarios.fulfilled, (state, action) => {
        state.scenariosLoading = false;
        state.availableScenarios = action.payload.scenarios;
      })
      .addCase(loadScenarios.rejected, (state, action) => {
        state.scenariosLoading = false;
        console.error('Failed to load scenarios:', action.payload);
      });

    // Load context
    builder
      .addCase(loadContext.pending, (state) => {
        state.contextLoading = true;
      })
      .addCase(loadContext.fulfilled, (state, action) => {
        state.contextLoading = false;
        state.contextData[action.payload.scenarioKey] = action.payload.data;
      })
      .addCase(loadContext.rejected, (state, action) => {
        state.contextLoading = false;
        console.error('Failed to load context:', action.payload);
      });

    // Find analogies
    builder
      .addCase(findAnalogies.pending, (state) => {
        state.analogiesLoading = true;
      })
      .addCase(findAnalogies.fulfilled, (state, action) => {
        state.analogiesLoading = false;
        state.analogiesData[action.payload.cacheKey] = action.payload.data;
      })
      .addCase(findAnalogies.rejected, (state, action) => {
        state.analogiesLoading = false;
        console.error('Failed to find analogies:', action.payload);
      });

    // Calculate similarity
    builder
      .addCase(calculateSimilarity.pending, (state) => {
        state.similarityLoading = true;
      })
      .addCase(calculateSimilarity.fulfilled, (state, action) => {
        state.similarityLoading = false;
        state.similarityData[action.payload.cacheKey] = action.payload.data;
      })
      .addCase(calculateSimilarity.rejected, (state, action) => {
        state.similarityLoading = false;
        console.error('Failed to calculate similarity:', action.payload);
      });

    // Add scenario
    builder
      .addCase(addScenario.pending, (state) => {
        state.managementLoading = true;
      })
      .addCase(addScenario.fulfilled, (state, action) => {
        state.managementLoading = false;
        state.availableScenarios.push(action.payload);
      })
      .addCase(addScenario.rejected, (state, action) => {
        state.managementLoading = false;
        console.error('Failed to add scenario:', action.payload);
      });

    // Delete scenario
    builder
      .addCase(deleteScenario.pending, (state) => {
        state.managementLoading = true;
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        state.managementLoading = false;
        state.availableScenarios = state.availableScenarios.filter(
          key => key !== action.payload
        );
        if (state.currentScenarioKey === action.payload) {
          state.currentScenarioKey = null;
        }
      })
      .addCase(deleteScenario.rejected, (state, action) => {
        state.managementLoading = false;
        console.error('Failed to delete scenario:', action.payload);
      });

    // Perform search
    builder
      .addCase(performSearch.pending, (state) => {
        state.analogiesLoading = true;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.analogiesLoading = false;
        // Handle search results
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.analogiesLoading = false;
        console.error('Search failed:', action.payload);
      });
  },
});

export const {
  setCurrentScenario,
  setSelectedAnalogies,
  setCurrentMarketData,
  setViewMode,
  setSelectedTimeRange,
  setComparisonMode,
  updateAnalysisParameters,
  resetAnalysisParameters,
  updateSettings,
  resetSettings,
  clearCache,
  clearErrors,
  resetState,
} = historicalSlice.actions;

export default historicalSlice.reducer;