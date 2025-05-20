import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse
} from '../../types/optimization';

/**
 * Service for portfolio optimization
 */
const optimizationService = {
  /**
   * Optimize a portfolio using the specified method
   */
  optimizePortfolio: async (request: OptimizationRequest, method: string = 'markowitz') => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        `${endpoints.optimization.optimize}?method=${method}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Error optimizing portfolio with ${method} method:`, error);
      throw error;
    }
  },

  /**
   * Calculate the efficient frontier for a portfolio
   */
  calculateEfficientFrontier: async (request: EfficientFrontierRequest) => {
    try {
      const response = await apiService.post<EfficientFrontierResponse>(
        endpoints.optimization.efficientFrontier,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating efficient frontier:', error);
      throw error;
    }
  },

  /**
   * Optimize using Markowitz method
   */
  markowitzOptimization: async (request: OptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.optimization.markowitz,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with Markowitz optimization:', error);
      throw error;
    }
  },

  /**
   * Optimize using Risk Parity method
   */
  riskParityOptimization: async (request: OptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.optimization.riskParity,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with Risk Parity optimization:', error);
      throw error;
    }
  },

  /**
   * Optimize using Minimum Variance method
   */
  minimumVarianceOptimization: async (request: OptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.optimization.minimumVariance,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with Minimum Variance optimization:', error);
      throw error;
    }
  },

  /**
   * Optimize using Maximum Sharpe Ratio method
   */
  maximumSharpeOptimization: async (request: OptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.optimization.maximumSharpe,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with Maximum Sharpe optimization:', error);
      throw error;
    }
  },

  /**
   * Create an equal weight portfolio
   */
  equalWeightOptimization: async (request: OptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.optimization.equalWeight,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with Equal Weight optimization:', error);
      throw error;
    }
  },
};

export default optimizationService;