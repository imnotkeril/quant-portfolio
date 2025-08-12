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
  loadAllAnalytics,
  refreshAnalytics,
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
    resetAnalyticsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load all analytics
    builder
      .addCase(loadAllAnalytics.pending, (state) => {
        // Set all loading states to true when loading all analytics
        state.performanceLoading = true;
        state.riskLoading = true;
        state.cumulativeReturnsLoading = true;
        state.drawdownsLoading = true;

        // Clear previous errors
        state.performanceError = null;
        state.riskError = null;
        state.cumulativeReturnsError = null;
        state.drawdownsError = null;
      })
      .addCase(loadAllAnalytics.fulfilled, (state) => {
        // Keep individual loading states as they will be updated by individual actions
        console.log('✅ All analytics load initiated successfully');
      })
      .addCase(loadAllAnalytics.rejected, (state, action) => {
        // Set all loading states to false and set errors
        state.performanceLoading = false;
        state.riskLoading = false;
        state.cumulativeReturnsLoading = false;
        state.drawdownsLoading = false;

        const error = action.payload || 'Failed to load analytics data';
        state.performanceError = error;
        state.riskError = error;
        state.cumulativeReturnsError = error;
        state.drawdownsError = error;

        console.error('❌ Failed to load all analytics:', error);
      });

    // Refresh analytics
    builder
      .addCase(refreshAnalytics.pending, (state) => {
        state.performanceLoading = true;
        state.riskLoading = true;
        state.cumulativeReturnsLoading = true;
        state.drawdownsLoading = true;
      })
      .addCase(refreshAnalytics.fulfilled, (state) => {
        console.log('✅ Analytics refresh completed');
      })
      .addCase(refreshAnalytics.rejected, (state, action) => {
        state.performanceLoading = false;
        state.riskLoading = false;
        state.cumulativeReturnsLoading = false;
        state.drawdownsLoading = false;

        const error = action.payload || 'Failed to refresh analytics';
        console.error('❌ Failed to refresh analytics:', error);
      });

    // Load performance metrics
    builder
      .addCase(loadPerformanceMetrics.pending, (state) => {
        state.performanceLoading = true;
        state.performanceError = null;
      })
      .addCase(loadPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceLoading = false;
        state.performanceMetrics = action.payload;
        console.log('✅ Performance metrics stored in Redux state:', action.payload);
      })
      .addCase(loadPerformanceMetrics.rejected, (state, action) => {
        state.performanceLoading = false;
        state.performanceError = action.payload || 'Failed to load performance metrics';
        console.error('❌ Performance metrics error stored in Redux state:', state.performanceError);
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
        console.log('✅ Risk metrics stored in Redux state:', action.payload);
      })
      .addCase(loadRiskMetrics.rejected, (state, action) => {
        state.riskLoading = false;
        state.riskError = action.payload || 'Failed to load risk metrics';
        console.error('❌ Risk metrics error stored in Redux state:', state.riskError);
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
        console.log('✅ Returns stored in Redux state:', action.payload);
      })
      .addCase(loadReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.returnsError = action.payload || 'Failed to load returns';
        console.error('❌ Returns error stored in Redux state:', state.returnsError);
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
        console.log('✅ Cumulative returns stored in Redux state:', action.payload);
      })
      .addCase(loadCumulativeReturns.rejected, (state, action) => {
        state.cumulativeReturnsLoading = false;
        state.cumulativeReturnsError = action.payload || 'Failed to load cumulative returns';
        console.error('❌ Cumulative returns error stored in Redux state:', state.cumulativeReturnsError);
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
        console.log('✅ Drawdowns stored in Redux state:', action.payload);
      })
      .addCase(loadDrawdowns.rejected, (state, action) => {
        state.drawdownsLoading = false;
        state.drawdownsError = action.payload || 'Failed to load drawdowns';
        console.error('❌ Drawdowns error stored in Redux state:', state.drawdownsError);
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
        console.log('✅ Rolling metrics stored in Redux state:', action.payload);
      })
      .addCase(loadRollingMetrics.rejected, (state, action) => {
        state.rollingMetricsLoading = false;
        state.rollingMetricsError = action.payload || 'Failed to load rolling metrics';
        console.error('❌ Rolling metrics error stored in Redux state:', state.rollingMetricsError);
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
        console.log('✅ Comparison stored in Redux state:', action.payload);
      })
      .addCase(loadComparison.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.comparisonError = action.payload || 'Failed to load comparison';
        console.error('❌ Comparison error stored in Redux state:', state.comparisonError);
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
  resetAnalyticsState,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;