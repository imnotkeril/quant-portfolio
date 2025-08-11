/**
 * Hook for managing analytics
 */
import { useState, useCallback } from 'react';
import { analyticsService } from '../services/analytics/analyticsService';
import {
  AnalyticsRequest,
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  CumulativeReturnsResponse,
  DrawdownsResponse,
  ComparisonResponse,
  RollingMetricsRequest,
  RollingMetricsResponse,
} from '../types/analytics';

interface UseAnalyticsState {
  performanceMetrics: PerformanceMetricsResponse | null;
  riskMetrics: RiskMetricsResponse | null;
  returns: ReturnsResponse | null;
  cumulativeReturns: CumulativeReturnsResponse | null;
  drawdowns: DrawdownsResponse | null;
  comparison: ComparisonResponse | null;
  rollingMetrics: RollingMetricsResponse | null;
  loading: boolean;
  calculatingPerformance: boolean;
  calculatingRisk: boolean;
  calculatingReturns: boolean;
  calculatingDrawdowns: boolean;
  comparing: boolean;
  calculatingRolling: boolean;
  error: string | null;
}

interface UseAnalyticsActions {
  calculatePerformanceMetrics: (request: AnalyticsRequest) => Promise<PerformanceMetricsResponse | null>;
  calculateRiskMetrics: (request: AnalyticsRequest) => Promise<RiskMetricsResponse | null>;
  calculateReturns: (request: AnalyticsRequest, period?: string, method?: string) => Promise<ReturnsResponse | null>;
  calculateCumulativeReturns: (request: AnalyticsRequest, method?: string) => Promise<CumulativeReturnsResponse | null>;
  calculateDrawdowns: (request: AnalyticsRequest) => Promise<DrawdownsResponse | null>;
  comparePortfolios: (
    portfolio1Id: string,
    portfolio2Id: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ) => Promise<ComparisonResponse | null>;
  calculateRollingMetrics: (request: RollingMetricsRequest) => Promise<RollingMetricsResponse | null>;
  clearError: () => void;
  clearAnalytics: () => void;
  getDefaultDateRange: (timeframe?: string) => { startDate: string; endDate: string };
  getPredefinedTimeRanges: () => Record<string, { startDate: string; endDate: string; label: string }>;
}

export const useAnalytics = (): UseAnalyticsState & UseAnalyticsActions => {
  const [state, setState] = useState<UseAnalyticsState>({
    performanceMetrics: null,
    riskMetrics: null,
    returns: null,
    cumulativeReturns: null,
    drawdowns: null,
    comparison: null,
    rollingMetrics: null,
    loading: false,
    calculatingPerformance: false,
    calculatingRisk: false,
    calculatingReturns: false,
    calculatingDrawdowns: false,
    comparing: false,
    calculatingRolling: false,
    error: null,
  });

  // Calculate performance metrics
  const calculatePerformanceMetrics = useCallback(async (
    request: AnalyticsRequest
  ): Promise<PerformanceMetricsResponse | null> => {
    setState(prev => ({ ...prev, calculatingPerformance: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const metrics = await analyticsService.calculatePerformanceMetrics(request);

      setState(prev => ({
        ...prev,
        performanceMetrics: metrics,
        calculatingPerformance: false
      }));

      return metrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate performance metrics';
      setState(prev => ({
        ...prev,
        calculatingPerformance: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate risk metrics
  const calculateRiskMetrics = useCallback(async (
    request: AnalyticsRequest
  ): Promise<RiskMetricsResponse | null> => {
    setState(prev => ({ ...prev, calculatingRisk: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const metrics = await analyticsService.calculateRiskMetrics(request);

      setState(prev => ({
        ...prev,
        riskMetrics: metrics,
        calculatingRisk: false
      }));

      return metrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate risk metrics';
      setState(prev => ({
        ...prev,
        calculatingRisk: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate returns
  const calculateReturns = useCallback(async (
    request: AnalyticsRequest,
    period: string = 'daily',
    method: string = 'simple'
  ): Promise<ReturnsResponse | null> => {
    setState(prev => ({ ...prev, calculatingReturns: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const returns = await analyticsService.calculateReturns(request, period, method);

      setState(prev => ({
        ...prev,
        returns,
        calculatingReturns: false
      }));

      return returns;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate returns';
      setState(prev => ({
        ...prev,
        calculatingReturns: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate cumulative returns
  const calculateCumulativeReturns = useCallback(async (
    request: AnalyticsRequest,
    method: string = 'simple'
  ): Promise<CumulativeReturnsResponse | null> => {
    setState(prev => ({ ...prev, calculatingReturns: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const cumulativeReturns = await analyticsService.calculateCumulativeReturns(request, method);

      setState(prev => ({
        ...prev,
        cumulativeReturns,
        calculatingReturns: false
      }));

      return cumulativeReturns;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate cumulative returns';
      setState(prev => ({
        ...prev,
        calculatingReturns: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate drawdowns
  const calculateDrawdowns = useCallback(async (
    request: AnalyticsRequest
  ): Promise<DrawdownsResponse | null> => {
    setState(prev => ({ ...prev, calculatingDrawdowns: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      const drawdowns = await analyticsService.calculateDrawdowns(request);

      setState(prev => ({
        ...prev,
        drawdowns,
        calculatingDrawdowns: false
      }));

      return drawdowns;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate drawdowns';
      setState(prev => ({
        ...prev,
        calculatingDrawdowns: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Compare portfolios
  const comparePortfolios = useCallback(async (
    portfolio1Id: string,
    portfolio2Id: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ): Promise<ComparisonResponse | null> => {
    setState(prev => ({ ...prev, comparing: true, error: null }));

    try {
      if (!portfolio1Id || !portfolio2Id) {
        throw new Error('Both portfolio IDs are required for comparison');
      }

      const comparison = await analyticsService.comparePortfolios(
        portfolio1Id,
        portfolio2Id,
        startDate,
        endDate,
        benchmark
      );

      setState(prev => ({
        ...prev,
        comparison,
        comparing: false
      }));

      return comparison;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare portfolios';
      setState(prev => ({
        ...prev,
        comparing: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate rolling metrics
  const calculateRollingMetrics = useCallback(async (
    request: RollingMetricsRequest
  ): Promise<RollingMetricsResponse | null> => {
    setState(prev => ({ ...prev, calculatingRolling: true, error: null }));

    try {
      // Validate request
      const validation = analyticsService.validateAnalyticsRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Validate window size
      if (!request.window || request.window < 5) {
        throw new Error('Window size must be at least 5 periods');
      }

      const rollingMetrics = await analyticsService.calculateRollingMetrics(request);

      setState(prev => ({
        ...prev,
        rollingMetrics,
        calculatingRolling: false
      }));

      return rollingMetrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate rolling metrics';
      setState(prev => ({
        ...prev,
        calculatingRolling: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear analytics
  const clearAnalytics = useCallback(() => {
    setState(prev => ({
      ...prev,
      performanceMetrics: null,
      riskMetrics: null,
      returns: null,
      cumulativeReturns: null,
      drawdowns: null,
      comparison: null,
      rollingMetrics: null,
      error: null,
    }));
  }, []);

  // Get default date range
  const getDefaultDateRange = useCallback((timeframe: string = '1Y') => {
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
  }, []);

  // Get predefined time ranges
  const getPredefinedTimeRanges = useCallback(() => {
    return {
      '1M': { ...getDefaultDateRange('1M'), label: '1 Month' },
      '3M': { ...getDefaultDateRange('3M'), label: '3 Months' },
      '6M': { ...getDefaultDateRange('6M'), label: '6 Months' },
      '1Y': { ...getDefaultDateRange('1Y'), label: '1 Year' },
      '2Y': { ...getDefaultDateRange('2Y'), label: '2 Years' },
      '5Y': { ...getDefaultDateRange('5Y'), label: '5 Years' },
    };
  }, [getDefaultDateRange]);

  return {
    ...state,
    calculatePerformanceMetrics,
    calculateRiskMetrics,
    calculateReturns,
    calculateCumulativeReturns,
    calculateDrawdowns,
    comparePortfolios,
    calculateRollingMetrics,
    clearError,
    clearAnalytics,
    getDefaultDateRange,
    getPredefinedTimeRanges,
  };
};

export default useAnalytics;