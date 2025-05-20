import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  HistoricalContextRequest,
  HistoricalContextResponse,
  HistoricalAnalogiesRequest,
  HistoricalAnalogiesResponse
} from '../../types/historical';

/**
 * Service for historical analysis
 */
const historicalService = {
  /**
   * Get list of historical scenarios
   */
  getHistoricalScenarios: async () => {
    try {
      const response = await apiService.get<string[]>(endpoints.historical.list);
      return response.data;
    } catch (error) {
      console.error('Error fetching historical scenarios:', error);
      throw error;
    }
  },

  /**
   * Get historical context for a scenario
   */
  getHistoricalContext: async (request: HistoricalContextRequest) => {
    try {
      const response = await apiService.post<HistoricalContextResponse>(
        endpoints.historical.context,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error getting historical context:', error);
      throw error;
    }
  },

  /**
   * Find historical analogies for current market conditions
   */
  findHistoricalAnalogies: async (request: HistoricalAnalogiesRequest) => {
    try {
      const response = await apiService.post<HistoricalAnalogiesResponse>(
        endpoints.historical.analogies,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error finding historical analogies:', error);
      throw error;
    }
  },
};

export default historicalService;