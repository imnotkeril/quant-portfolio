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
      const metrics = await analyticsService.calculatePerformanceMetrics(request);
      return metrics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load performance metrics');
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
      const metrics = await analyticsService.calculateRiskMetrics(request);
      return metrics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load risk metrics');
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
      const returns = await analyticsService.calculateReturns(request, period, method);
      return returns;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load returns');
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
      const cumulativeReturns = await analyticsService.calculateCumulativeReturns(request, method);
      return cumulativeReturns;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load cumulative returns');
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
      const drawdowns = await analyticsService.calculateDrawdowns(request);
      return drawdowns;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load drawdowns');
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
      const rollingMetrics = await analyticsService.calculateRollingMetrics(request);
      return rollingMetrics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load rolling metrics');
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
      const comparison = await analyticsService.comparePortfolios(
        portfolio1Id,
        portfolio2Id,
        startDate,
        endDate,
        benchmark
      );
      return comparison;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load portfolio comparison');
    }
  }
);