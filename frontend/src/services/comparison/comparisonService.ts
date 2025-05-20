import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  PortfolioComparisonRequest,
  PortfolioComparisonResponse,
  BenchmarkComparisonRequest,
  BenchmarkComparisonResponse,
  PerformanceComparisonRequest,
  PerformanceComparisonResponse,
  RiskComparisonRequest,
  RiskComparisonResponse,
  HoldingsComparisonRequest,
  HoldingsComparisonResponse
} from '../../types/comparison';

/**
 * Service for portfolio comparison
 */
const comparisonService = {
  /**
   * Compare multiple portfolios
   */
  comparePortfolios: async (request: PortfolioComparisonRequest) => {
    try {
      const response = await apiService.post<PortfolioComparisonResponse>(
        endpoints.comparison.portfolios,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing portfolios:', error);
      throw error;
    }
  },

  /**
   * Compare portfolio with benchmark
   */
  compareToBenchmark: async (request: BenchmarkComparisonRequest) => {
    try {
      const response = await apiService.post<BenchmarkComparisonResponse>(
        endpoints.comparison.benchmark,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing to benchmark:', error);
      throw error;
    }
  },

  /**
   * Compare performance of portfolios
   */
  comparePerformance: async (request: PerformanceComparisonRequest) => {
    try {
      const response = await apiService.post<PerformanceComparisonResponse>(
        endpoints.comparison.performance,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing performance:', error);
      throw error;
    }
  },

  /**
   * Compare risk metrics of portfolios
   */
  compareRiskMetrics: async (request: RiskComparisonRequest) => {
    try {
      const response = await apiService.post<RiskComparisonResponse>(
        endpoints.comparison.risk,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing risk metrics:', error);
      throw error;
    }
  },

  /**
   * Compare holdings composition of portfolios
   */
  compareHoldings: async (request: HoldingsComparisonRequest) => {
    try {
      const response = await apiService.post<HoldingsComparisonResponse>(
        endpoints.comparison.holdings,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing holdings:', error);
      throw error;
    }
  },
};

export default comparisonService;