import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  ScenarioListResponse,
  ScenarioSimulationRequest,
  ScenarioSimulationResponse,
  ScenarioImpactRequest,
  ScenarioImpactResponse
} from '../../types/scenario';

/**
 * Service for scenario analysis
 */
const scenarioService = {
  /**
   * Get list of available scenarios
   */
  getScenarios: async () => {
    try {
      const response = await apiService.get<ScenarioListResponse>(endpoints.scenarios.list);
      return response.data;
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
  },

  /**
   * Simulate scenario chain
   */
  simulateScenarioChain: async (request: ScenarioSimulationRequest) => {
    try {
      const response = await apiService.post<ScenarioSimulationResponse>(
        endpoints.scenarios.simulate,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error simulating scenario chain:', error);
      throw error;
    }
  },

  /**
   * Analyze scenario impact on portfolio
   */
  analyzeScenarioImpact: async (request: ScenarioImpactRequest) => {
    try {
      const response = await apiService.post<ScenarioImpactResponse>(
        endpoints.scenarios.impact,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing scenario impact:', error);
      throw error;
    }
  },
};

export default scenarioService;