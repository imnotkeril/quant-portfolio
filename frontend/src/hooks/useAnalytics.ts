import { useState, useCallback } from 'react';
import analyticsService from '../services/analytics/analyticsService';
import {
  AnalyticsRequest,
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  DrawdownResponse,
  ComparisonRequest,
  ComparisonResponse
} from '../types/analytics';

/**
 * Custom hook for portfolio analytics
 */
export const useAnalytics = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = useCallback(async (request: AnalyticsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getPerformanceMetrics(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting performance metrics');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get risk metrics
   */
  const getRiskMetrics = useCallback(async (request: AnalyticsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRiskMetrics(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting risk metrics');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get returns data
   */
  const getReturns = useCallback(async (
    request: AnalyticsRequest,
    period: string = 'daily',
    method: string = 'simple'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getReturns(request, period, method);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting returns');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get cumulative returns
   */
  const getCumulativeReturns = useCallback(async (
    request: AnalyticsRequest,
    method: string = 'simple'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getCumulativeReturns(request, method);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting cumulative returns');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get drawdowns analysis
   */
  const getDrawdowns = useCallback(async (request: AnalyticsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDrawdowns(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting drawdowns');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Compare portfolios
   */
  const comparePortfolios = useCallback(async (request: ComparisonRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.comparePortfolios(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error comparing portfolios');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get portfolio analysis dashboard with all key metrics
   */
  const getPortfolioDashboard = useCallback(async (request: AnalyticsRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Run requests in parallel for better performance
      const [performanceMetrics, riskMetrics, cumulativeReturns, drawdowns] = await Promise.all([
        analyticsService.getPerformanceMetrics(request),
        analyticsService.getRiskMetrics(request),
        analyticsService.getCumulativeReturns(request),
        analyticsService.getDrawdowns(request)
      ]);

      return {
        performanceMetrics,
        riskMetrics,
        cumulativeReturns,
        drawdowns
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting portfolio dashboard');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPerformanceMetrics,
    getRiskMetrics,
    getReturns,
    getCumulativeReturns,
    getDrawdowns,
    comparePortfolios,
    getPortfolioDashboard
  };
};