/**
 * Analytics reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsState, AnalysisParams } from './types';
import {
  loadPerformanceMetrics,
  loadRiskMetrics,
  loadReturns,
  loadCumulativeReturns,
  loadDrawdowns,
  loadRollingMetrics,
  loadComparison,
} from './actions';

const initialState: AnalyticsState = {
  // Performance metrics
  performanceMetrics: null,
  performanceLoading: false,
  performanceError: null,

  // Risk metrics
  riskMetrics: null,
  riskLoading: false,
  riskError: null,

  // Returns data
  returns: null,
  returnsLoading: false,
  returnsError: null,

  // Cumulative returns
  cumulativeReturns: null,
  cumulativeReturnsLoading: false,
  cumulativeReturnsError: null,

  // Drawdowns
  drawdowns: null,
  drawdownsLoading: false,
  drawdownsError: null,

  // Rolling metrics
  rollingMetrics: null,
  rollingMetricsLoading: false,
  rollingMetricsError: null,

  // Portfolio comparison
  comparison: null,
  comparisonLoading: false,
  comparisonError: null,

  // UI state
  selectedPortfolioId: null,
  selectedBenchmark: null,
  selectedTimeframe: '1Y',
  selectedMetrics: ['totalReturn', 'volatility', 'sharpeRatio', 'maxDrawdown'],
  analysisParams: {
    startDate: null,
    endDate: null,
    riskFreeRate: 0.02,
    periodsPerYear: 252,
    confidenceLevel: 0.95,
    rollingWindow: 21,
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // UI actions
    setSelectedPortfolio: (state, action: PayloadAction<string | null>) => {
      state.selectedPortfolioId = action.payload;
    },
    setSelectedBenchmark: (state, action: PayloadAction<string | null>) => {
      state.selectedBenchmark = action.payload;
    },
    setSelectedTimeframe: (state, action: PayloadAction<string>) => {
      state.selectedTimeframe = action.payload;
    },
    setSelectedMetrics: (state, action: PayloadAction<string[]>) => {
      state.selectedMetrics = action.payload;
    },
    setAnalysisParams: (state, action: PayloadAction<Partial<AnalysisParams>>) => {
      state.analysisParams = { ...state.analysisParams, ...action.payload };
    },
    clearAnalyticsData: (state) => {
      state.performanceMetrics = null;
      state.riskMetrics = null;
      state.returns = null;
      state.cumulativeReturns = null;
      state.drawdowns = null;
      state.rollingMetrics = null;
      state.comparison = null;
    },
    clearAnalyticsErrors: (state) => {
      state.performanceError = null;
      state.riskError = null;
      state.returnsError = null;
      state.cumulativeReturnsError = null;
      state.drawdownsError = null;
      state.rollingMetricsError = null;
      state.comparisonError = null;
    },
  },
  extraReducers: (builder) => {
    // Load performance metrics
    builder
      .addCase(loadPerformanceMetrics.pending, (state) => {
        state.performanceLoading = true;
        state.performanceError = null;
      })
      .addCase(loadPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceLoading = false;
        state.performanceMetrics = action.payload;
      })
      .addCase(loadPerformanceMetrics.rejected, (state, action) => {
        state.performanceLoading = false;
        state.performanceError = action.payload || 'Failed to load performance metrics';
      });

    // Load risk metrics
    builder
      .addCase(loadRiskMetrics.pending, (state) => {
        state.riskLoading = true;
        state.riskError = null;
      })
      .addCase(loadRiskMetrics.fulfilled, (state, action) => {
        state.riskLoading = false;
        state.riskMetrics = action.payload;
      })
      .addCase(loadRiskMetrics.rejected, (state, action) => {
        state.riskLoading = false;
        state.riskError = action.payload || 'Failed to load risk metrics';
      });

    // Load returns
    builder
      .addCase(loadReturns.pending, (state) => {
        state.returnsLoading = true;
        state.returnsError = null;
      })
      .addCase(loadReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.returns = action.payload;
      })
      .addCase(loadReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.returnsError = action.payload || 'Failed to load returns';
      });

    // Load cumulative returns
    builder
      .addCase(loadCumulativeReturns.pending, (state) => {
        state.cumulativeReturnsLoading = true;
        state.cumulativeReturnsError = null;
      })
      .addCase(loadCumulativeReturns.fulfilled, (state, action) => {
        state.cumulativeReturnsLoading = false;
        state.cumulativeReturns = action.payload;
      })
      .addCase(loadCumulativeReturns.rejected, (state, action) => {
        state.cumulativeReturnsLoading = false;
        state.cumulativeReturnsError = action.payload || 'Failed to load cumulative returns';
      });

    // Load drawdowns
    builder
      .addCase(loadDrawdowns.pending, (state) => {
        state.drawdownsLoading = true;
        state.drawdownsError = null;
      })
      .addCase(loadDrawdowns.fulfilled, (state, action) => {
        state.drawdownsLoading = false;
        state.drawdowns = action.payload;
      })
      .addCase(loadDrawdowns.rejected, (state, action) => {
        state.drawdownsLoading = false;
        state.drawdownsError = action.payload || 'Failed to load drawdowns';
      });

    // Load rolling metrics
    builder
      .addCase(loadRollingMetrics.pending, (state) => {
        state.rollingMetricsLoading = true;
        state.rollingMetricsError = null;
      })
      .addCase(loadRollingMetrics.fulfilled, (state, action) => {
        state.rollingMetricsLoading = false;
        state.rollingMetrics = action.payload;
      })
      .addCase(loadRollingMetrics.rejected, (state, action) => {
        state.rollingMetricsLoading = false;
        state.rollingMetricsError = action.payload || 'Failed to load rolling metrics';
      });

    // Load comparison
    builder
      .addCase(loadComparison.pending, (state) => {
        state.comparisonLoading = true;
        state.comparisonError = null;
      })
      .addCase(loadComparison.fulfilled, (state, action) => {
        state.comparisonLoading = false;
        state.comparison = action.payload;
      })
      .addCase(loadComparison.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.comparisonError = action.payload || 'Failed to load comparison';
      });
  },
});

export const {
  setSelectedPortfolio,
  setSelectedBenchmark,
  setSelectedTimeframe,
  setSelectedMetrics,
  setAnalysisParams,
  clearAnalyticsData,
  clearAnalyticsErrors,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;