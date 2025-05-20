import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  VaRRequest,
  VaRResponse,
  StressTestRequest,
  StressTestResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  DrawdownRequest,
  DrawdownResponse
} from '../../types/risk';

/**
 * Service for risk management
 */
const riskService = {
  /**
   * Calculate Value at Risk (VaR)
   */
  calculateVaR: async (request: VaRRequest, method: string = 'historical') => {
    try {
      const response = await apiService.post<VaRResponse>(
        `${endpoints.risk.var}?method=${method}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Error calculating VaR with ${method} method:`, error);
      throw error;
    }
  },

  /**
   * Calculate Conditional Value at Risk (CVaR)
   */
  calculateCVaR: async (request: VaRRequest) => {
    try {
      const response = await apiService.post<VaRResponse>(
        endpoints.risk.cvar,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating CVaR:', error);
      throw error;
    }
  },

  /**
   * Perform stress testing
   */
  performStressTest: async (request: StressTestRequest) => {
    try {
      const response = await apiService.post<StressTestResponse>(
        endpoints.risk.stressTest,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error performing stress test:', error);
      throw error;
    }
  },

  /**
   * Perform custom stress testing
   */
  performCustomStressTest: async (request: StressTestRequest) => {
    try {
      const response = await apiService.post<StressTestResponse>(
        endpoints.risk.customStressTest,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error performing custom stress test:', error);
      throw error;
    }
  },

  /**
   * Perform Monte Carlo simulation
   */
  performMonteCarloSimulation: async (request: MonteCarloRequest) => {
    try {
      const response = await apiService.post<MonteCarloResponse>(
        endpoints.risk.monteCarlo,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error performing Monte Carlo simulation:', error);
      throw error;
    }
  },

  /**
   * Analyze drawdowns
   */
  analyzeDrawdowns: async (request: DrawdownRequest) => {
    try {
      const response = await apiService.post<DrawdownResponse>(
        endpoints.risk.drawdowns,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing drawdowns:', error);
      throw error;
    }
  },

  /**
   * Perform advanced Monte Carlo simulation
   */
  performAdvancedMonteCarloSimulation: async (request: MonteCarloRequest) => {
    try {
      const response = await apiService.post<MonteCarloResponse>(
        endpoints.risk.advancedMonteCarlo,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error performing advanced Monte Carlo simulation:', error);
      throw error;
    }
  },
};

export default riskService;