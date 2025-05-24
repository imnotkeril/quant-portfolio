/**
 * Risk reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RiskState, RiskParams } from './types';
import {
  calculateVaR,
  performStressTest,
  performMonteCarlo,
  analyzeDrawdowns,
  calculateRiskContribution,
} from './actions';

const initialState: RiskState = {
  // VaR analysis
  varResults: {},
  varLoading: false,
  varError: null,

  // Stress test analysis
  stressTestResults: {},
  stressTestLoading: false,
  stressTestError: null,

  // Monte Carlo simulation
  monteCarloResults: {},
  monteCarloLoading: false,
  monteCarloError: null,

  // Drawdown analysis
  drawdownResults: {},
  drawdownsLoading: false,
  drawdownsError: null,

  // Risk contribution analysis
  riskContributionResults: {},
  riskContributionLoading: false,
  riskContributionError: null,

  // UI state
  selectedPortfolioId: null,
  selectedAnalysisType: null,
  selectedScenarios: [],
  selectedConfidenceLevels: [0.95],
  selectedTimeHorizons: [1],
  riskParams: {
    confidenceLevel: 0.95,
    timeHorizon: 1,
    simulations: 1000,
    startDate: null,
    endDate: null,
    riskFreeRate: 0.02,
  },
};

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    // UI actions
    setSelectedPortfolio: (state, action: PayloadAction<string | null>) => {
      state.selectedPortfolioId = action.payload;
    },
    setSelectedAnalysisType: (state, action: PayloadAction<RiskState['selectedAnalysisType']>) => {
      state.selectedAnalysisType = action.payload;
    },
    setSelectedScenarios: (state, action: PayloadAction<string[]>) => {
      state.selectedScenarios = action.payload;
    },
    setSelectedConfidenceLevels: (state, action: PayloadAction<number[]>) => {
      state.selectedConfidenceLevels = action.payload;
    },
    setSelectedTimeHorizons: (state, action: PayloadAction<number[]>) => {
      state.selectedTimeHorizons = action.payload;
    },
    setRiskParams: (state, action: PayloadAction<Partial<RiskParams>>) => {
      state.riskParams = { ...state.riskParams, ...action.payload };
    },
    clearRiskData: (state) => {
      state.varResults = {};
      state.stressTestResults = {};
      state.monteCarloResults = {};
      state.drawdownResults = {};
      state.riskContributionResults = {};
    },
    clearRiskErrors: (state) => {
      state.varError = null;
      state.stressTestError = null;
      state.monteCarloError = null;
      state.drawdownsError = null;
      state.riskContributionError = null;
    },
  },
  extraReducers: (builder) => {
    // Calculate VaR
    builder
      .addCase(calculateVaR.pending, (state) => {
        state.varLoading = true;
        state.varError = null;
      })
      .addCase(calculateVaR.fulfilled, (state, action) => {
        state.varLoading = false;
        const portfolioId = action.meta.arg.portfolioId;
        state.varResults[portfolioId] = action.payload;
      })
      .addCase(calculateVaR.rejected, (state, action) => {
        state.varLoading = false;
        state.varError = action.payload || 'Failed to calculate VaR';
      });

    // Perform stress test
    builder
      .addCase(performStressTest.pending, (state) => {
        state.stressTestLoading = true;
        state.stressTestError = null;
      })
      .addCase(performStressTest.fulfilled, (state, action) => {
        state.stressTestLoading = false;
        const portfolioId = action.meta.arg.portfolioId;
        state.stressTestResults[portfolioId] = action.payload;
      })
      .addCase(performStressTest.rejected, (state, action) => {
        state.stressTestLoading = false;
        state.stressTestError = action.payload || 'Failed to perform stress test';
      });

    // Perform Monte Carlo
    builder
      .addCase(performMonteCarlo.pending, (state) => {
        state.monteCarloLoading = true;
        state.monteCarloError = null;
      })
      .addCase(performMonteCarlo.fulfilled, (state, action) => {
        state.monteCarloLoading = false;
        const portfolioId = action.meta.arg.portfolioId;
        state.monteCarloResults[portfolioId] = action.payload;
      })
      .addCase(performMonteCarlo.rejected, (state, action) => {
        state.monteCarloLoading = false;
        state.monteCarloError = action.payload || 'Failed to perform Monte Carlo simulation';
      });

    // Analyze drawdowns
    builder
      .addCase(analyzeDrawdowns.pending, (state) => {
        state.drawdownsLoading = true;
        state.drawdownsError = null;
      })
      .addCase(analyzeDrawdowns.fulfilled, (state, action) => {
        state.drawdownsLoading = false;
        const portfolioId = action.meta.arg.portfolioId;
        state.drawdownResults[portfolioId] = action.payload;
      })
      .addCase(analyzeDrawdowns.rejected, (state, action) => {
        state.drawdownsLoading = false;
        state.drawdownsError = action.payload || 'Failed to analyze drawdowns';
      });

    // Calculate risk contribution
    builder
      .addCase(calculateRiskContribution.pending, (state) => {
        state.riskContributionLoading = true;
        state.riskContributionError = null;
      })
      .addCase(calculateRiskContribution.fulfilled, (state, action) => {
        state.riskContributionLoading = false;
        const portfolioId = action.meta.arg.portfolioId;
        state.riskContributionResults[portfolioId] = action.payload;
      })
      .addCase(calculateRiskContribution.rejected, (state, action) => {
        state.riskContributionLoading = false;
        state.riskContributionError = action.payload || 'Failed to calculate risk contribution';
      });
  },
});

export const {
  setSelectedPortfolio,
  setSelectedAnalysisType,
  setSelectedScenarios,
  setSelectedConfidenceLevels,
  setSelectedTimeHorizons,
  setRiskParams,
  clearRiskData,
  clearRiskErrors,
} = riskSlice.actions;

export default riskSlice.reducer;