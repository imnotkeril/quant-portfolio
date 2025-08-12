/**
 * Analytics actions
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analytics/analyticsService';
import {
  LoadPerformanceMetricsPayload,
  LoadRiskMetricsPayload,
  LoadReturnsPayload,
  LoadCumulativeReturnsPayload,
  LoadDrawdownsPayload,
  LoadRollingMetricsPayload,
  LoadComparisonPayload,
} from './types';
import {
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  CumulativeReturnsResponse,
  DrawdownsResponse,
  RollingMetricsResponse,
  ComparisonResponse,
} from '../../types/analytics';

/**
 * Load performance metrics
 */
export const loadPerformanceMetrics = createAsyncThunk<
  PerformanceMetricsResponse,
  LoadPerformanceMetricsPayload,
  { rejectValue: string }
>(
  'analytics/loadPerformanceMetrics',
  async (request, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading performance metrics for:', request.portfolioId);
      const metrics = await analyticsService.calculatePerformanceMetrics(request);
      console.log('✅ Performance metrics loaded:', metrics);
      return metrics;
    } catch (error: any) {
      console.error('❌ Error loading performance metrics:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load performance metrics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load risk metrics
 */
export const loadRiskMetrics = createAsyncThunk<
  RiskMetricsResponse,
  LoadRiskMetricsPayload,
  { rejectValue: string }
>(
  'analytics/loadRiskMetrics',
  async (request, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading risk metrics for:', request.portfolioId);
      const metrics = await analyticsService.calculateRiskMetrics(request);
      console.log('✅ Risk metrics loaded:', metrics);
      return metrics;
    } catch (error: any) {
      console.error('❌ Error loading risk metrics:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load risk metrics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load returns data
 */
export const loadReturns = createAsyncThunk<
  ReturnsResponse,
  LoadReturnsPayload,
  { rejectValue: string }
>(
  'analytics/loadReturns',
  async ({ period = 'daily', method = 'simple', ...request }, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading returns for:', request.portfolioId, { period, method });
      const returns = await analyticsService.calculateReturns(request, period, method);
      console.log('✅ Returns loaded:', returns);
      return returns;
    } catch (error: any) {
      console.error('❌ Error loading returns:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load returns';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load cumulative returns
 */
export const loadCumulativeReturns = createAsyncThunk<
  CumulativeReturnsResponse,
  LoadCumulativeReturnsPayload,
  { rejectValue: string }
>(
  'analytics/loadCumulativeReturns',
  async ({ method = 'simple', ...request }, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading cumulative returns for:', request.portfolioId, { method });
      const cumulativeReturns = await analyticsService.calculateCumulativeReturns(request, method);
      console.log('✅ Cumulative returns loaded:', cumulativeReturns);
      return cumulativeReturns;
    } catch (error: any) {
      console.error('❌ Error loading cumulative returns:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load cumulative returns';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load drawdowns
 */
export const loadDrawdowns = createAsyncThunk<
  DrawdownsResponse,
  LoadDrawdownsPayload,
  { rejectValue: string }
>(
  'analytics/loadDrawdowns',
  async (request, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading drawdowns for:', request.portfolioId);
      const drawdowns = await analyticsService.calculateDrawdowns(request);
      console.log('✅ Drawdowns loaded:', drawdowns);
      return drawdowns;
    } catch (error: any) {
      console.error('❌ Error loading drawdowns:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load drawdowns';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load rolling metrics
 */
export const loadRollingMetrics = createAsyncThunk<
  RollingMetricsResponse,
  LoadRollingMetricsPayload,
  { rejectValue: string }
>(
  'analytics/loadRollingMetrics',
  async (request, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading rolling metrics for:', request.portfolioId);
      const rollingMetrics = await analyticsService.calculateRollingMetrics(request);
      console.log('✅ Rolling metrics loaded:', rollingMetrics);
      return rollingMetrics;
    } catch (error: any) {
      console.error('❌ Error loading rolling metrics:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load rolling metrics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load portfolio comparison
 */
export const loadComparison = createAsyncThunk<
  ComparisonResponse,
  LoadComparisonPayload,
  { rejectValue: string }
>(
  'analytics/loadComparison',
  async ({ portfolio1Id, portfolio2Id, startDate, endDate, benchmark }, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading portfolio comparison:', portfolio1Id, 'vs', portfolio2Id);
      const comparison = await analyticsService.comparePortfolios(
        portfolio1Id,
        portfolio2Id,
        startDate,
        endDate,
        benchmark
      );
      console.log('✅ Portfolio comparison loaded:', comparison);
      return comparison;
    } catch (error: any) {
      console.error('❌ Error loading portfolio comparison:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to load portfolio comparison';
      return rejectWithValue(message);
    }
  }
);

/**
 * Load all analytics data for a portfolio
 */
export const loadAllAnalytics = createAsyncThunk<
  void,
  { portfolioId: string; startDate?: string; endDate?: string; benchmark?: string },
  { rejectValue: string }
>(
  'analytics/loadAllAnalytics',
  async ({ portfolioId, startDate, endDate, benchmark }, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔍 Loading all analytics for portfolio:', portfolioId);

      const commonParams = {
        portfolioId,
        startDate,
        endDate,
        benchmark,
        riskFreeRate: 0.02,
        periodsPerYear: 252,
      };

      // Load all analytics data
      const promises = [
        dispatch(loadPerformanceMetrics(commonParams)),
        dispatch(loadRiskMetrics({
          ...commonParams,
          confidenceLevel: 0.95,
        })),
        dispatch(loadCumulativeReturns({
          portfolioId,
          startDate,
          endDate,
          benchmark,
          method: 'simple',
        })),
        dispatch(loadDrawdowns({
          portfolioId,
          startDate,
          endDate,
        })),
      ];

      await Promise.all(promises);
      console.log('✅ All analytics loaded successfully');
    } catch (error: any) {
      console.error('❌ Error loading all analytics:', error);
      const message = error?.message || 'Failed to load analytics data';
      return rejectWithValue(message);
    }
  }
);

/**
 * Refresh analytics data
 */
export const refreshAnalytics = createAsyncThunk<
  void,
  { portfolioId: string },
  { rejectValue: string }
>(
  'analytics/refreshAnalytics',
  async ({ portfolioId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const { selectedBenchmark, selectedTimeframe, analysisParams } = state.analytics;

      // Calculate date range
      const getDateRange = (timeframe: string) => {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeframe) {
          case '1M':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6M':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case '2Y':
            startDate.setFullYear(endDate.getFullYear() - 2);
            break;
          case '5Y':
            startDate.setFullYear(endDate.getFullYear() - 5);
            break;
          default:
            startDate.setFullYear(endDate.getFullYear() - 1);
        }

        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };
      };

      const { startDate, endDate } = getDateRange(selectedTimeframe);

      await dispatch(loadAllAnalytics({
        portfolioId,
        startDate,
        endDate,
        benchmark: selectedBenchmark || undefined,
      }));
    } catch (error: any) {
      console.error('❌ Error refreshing analytics:', error);
      const message = error?.message || 'Failed to refresh analytics data';
      return rejectWithValue(message);
    }
  }
);