import apiService from '../api/client';
import endpoints from '../api/endpoints';
import {
  PriceRequest,
  PriceResponse,
  SearchRequest,
  SearchResponse,
  SectorResponse,
  IndicatorRequest,
  IndicatorResponse,
  FundamentalRequest,
  FundamentalResponse
} from '../../types/marketData';

/**
 * Service for market data
 */
const marketDataService = {
  /**
   * Get historical price data
   */
  getPriceData: async (request: PriceRequest) => {
    try {
      const response = await apiService.post<PriceResponse>(
        endpoints.marketData.prices,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
  },

  /**
   * Search for assets
   */
  searchAssets: async (request: SearchRequest) => {
    try {
      const response = await apiService.post<SearchResponse>(
        endpoints.marketData.search,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error searching for assets:', error);
      throw error;
    }
  },

  /**
   * Get sector performance data
   */
  getSectorPerformance: async () => {
    try {
      const response = await apiService.get<SectorResponse>(
        endpoints.marketData.sectors
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  },

  /**
   * Get economic indicators
   */
  getEconomicIndicators: async (request: IndicatorRequest) => {
    try {
      const response = await apiService.post<IndicatorResponse>(
        endpoints.marketData.indicators,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  },

  /**
   * Get fundamental data for an asset
   */
  getFundamentalData: async (request: FundamentalRequest) => {
    try {
      const response = await apiService.post<FundamentalResponse>(
        endpoints.marketData.fundamentals,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching fundamental data:', error);
      throw error;
    }
  },
};

export default marketDataService;