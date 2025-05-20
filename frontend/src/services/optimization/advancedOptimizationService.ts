import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  AdvancedOptimizationRequest,
  OptimizationResponse
} from '../../types/optimization';

/**
 * Service for advanced portfolio optimization
 */
const advancedOptimizationService = {
  /**
   * Perform robust optimization
   */
  robustOptimization: async (request: AdvancedOptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.advancedOptimization.robust,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with robust optimization:', error);
      throw error;
    }
  },

  /**
   * Perform cost-aware optimization
   */
  costAwareOptimization: async (request: AdvancedOptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.advancedOptimization.costAware,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with cost-aware optimization:', error);
      throw error;
    }
  },

  /**
   * Perform conditional optimization for different scenarios
   */
  conditionalOptimization: async (request: AdvancedOptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.advancedOptimization.conditional,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with conditional optimization:', error);
      throw error;
    }
  },

  /**
   * Perform ESG-focused optimization
   */
  esgOptimization: async (request: AdvancedOptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.advancedOptimization.esg,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with ESG optimization:', error);
      throw error;
    }
  },

  /**
   * Perform hierarchical optimization
   */
  hierarchicalOptimization: async (request: AdvancedOptimizationRequest) => {
    try {
      const response = await apiService.post<OptimizationResponse>(
        endpoints.advancedOptimization.hierarchical,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error with hierarchical optimization:', error);
      throw error;
    }
  },
};

export default advancedOptimizationService;