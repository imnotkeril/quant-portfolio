import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  AnalyticsRequest,
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  DrawdownResponse,
  ComparisonRequest,
  ComparisonResponse
} from '../../types/analytics';

/**
 * Service for portfolio analytics
 */
const analyticsService = {
  /**
   * Calculate performance metrics for a portfolio
   */
  getPerformanceMetrics: async (request: AnalyticsRequest) => {
    try {
      const response = await apiService.post<PerformanceMetricsResponse>(
        endpoints.analytics.performance,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw error;
    }
  },

  /**
   * Calculate risk metrics for a portfolio
   */
  getRiskMetrics: async (request: AnalyticsRequest) => {
    try {
      const response = await apiService.post<RiskMetricsResponse>(
        endpoints.analytics.risk,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  },

  /**
   * Calculate returns for a portfolio
   */
  getReturns: async (request: AnalyticsRequest, period: string = 'daily', method: string = 'simple') => {
    try {
      const response = await apiService.post<ReturnsResponse>(
        `${endpoints.analytics.returns}?period=${period}&method=${method}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating returns:', error);
      throw error;
    }
  },

  /**
   * Calculate cumulative returns for a portfolio
   */
  getCumulativeReturns: async (request: AnalyticsRequest, method: string = 'simple') => {
    try {
      const response = await apiService.post<ReturnsResponse>(
        `${endpoints.analytics.cumulativeReturns}?method=${method}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating cumulative returns:', error);
      throw error;
    }
  },

  /**
   * Calculate drawdowns for a portfolio
   */
  getDrawdowns: async (request: AnalyticsRequest) => {
    try {
      const response = await apiService.post<DrawdownResponse>(
        endpoints.analytics.drawdowns,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating drawdowns:', error);
      throw error;
    }
  },

  /**
   * Compare two portfolios
   */
  comparePortfolios: async (request: ComparisonRequest) => {
    try {
      const response = await apiService.post<ComparisonResponse>(
        endpoints.analytics.compare,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing portfolios:', error);
      throw error;
    }
  },
};

export default analyticsService;