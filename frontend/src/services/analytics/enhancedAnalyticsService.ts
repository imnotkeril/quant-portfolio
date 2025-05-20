import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  AnalyticsRequest,
  RollingMetricsResponse,
  ConfidenceIntervalsResponse,
  TailRiskResponse,
  SeasonalPatternsResponse,
  StatisticsResponse
} from '../../types/analytics';

/**
 * Service for enhanced portfolio analytics
 */
const enhancedAnalyticsService = {
  /**
   * Get rolling metrics for a portfolio
   */
  getRollingMetrics: async (request: AnalyticsRequest, window: number = 21, metrics?: string[]) => {
    try {
      let url = `${endpoints.enhancedAnalytics.rollingMetrics}?window=${window}`;

      if (metrics && metrics.length > 0) {
        url += `&metrics=${metrics.join(',')}`;
      }

      const response = await apiService.post<RollingMetricsResponse>(url, request);
      return response.data;
    } catch (error) {
      console.error('Error calculating rolling metrics:', error);
      throw error;
    }
  },

  /**
   * Get confidence intervals for portfolio metrics
   */
  getConfidenceIntervals: async (request: AnalyticsRequest, confidenceLevel: number = 0.95) => {
    try {
      const response = await apiService.post<ConfidenceIntervalsResponse>(
        `${endpoints.enhancedAnalytics.confidenceIntervals}?confidence_level=${confidenceLevel}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating confidence intervals:', error);
      throw error;
    }
  },

  /**
   * Get tail risk metrics for a portfolio
   */
  getTailRisk: async (request: AnalyticsRequest, confidenceLevel: number = 0.95, method: string = 'historical') => {
    try {
      const response = await apiService.post<TailRiskResponse>(
        `${endpoints.enhancedAnalytics.tailRisk}?confidence_level=${confidenceLevel}&method=${method}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating tail risk:', error);
      throw error;
    }
  },

  /**
   * Get seasonal patterns for a portfolio
   */
  getSeasonalPatterns: async (request: AnalyticsRequest) => {
    try {
      const response = await apiService.post<SeasonalPatternsResponse>(
        endpoints.enhancedAnalytics.seasonalPatterns,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing seasonal patterns:', error);
      throw error;
    }
  },

  /**
   * Get statistical analysis for a portfolio
   */
  getStatistics: async (request: AnalyticsRequest) => {
    try {
      const response = await apiService.post<StatisticsResponse>(
        endpoints.enhancedAnalytics.statistics,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw error;
    }
  },
};

export default enhancedAnalyticsService;