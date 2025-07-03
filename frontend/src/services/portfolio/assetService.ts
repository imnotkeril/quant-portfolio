/**
 * Asset service
 * Handles asset-related API operations
 */
import apiClient from '../api/client';
import { assetEndpoints } from '../api/endpoints';
import {
  AssetSearch,
  AssetHistoricalData,
  AssetPerformance,
  AssetPriceUpdate,
} from '../../types/portfolio';

/**
 * Asset Info interface for detailed asset information
 */
export interface AssetInfo {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  exchange: string;
  assetType: string;
  marketCap?: number;
  description?: string;
  website?: string;
  employees?: number;
  foundedYear?: number;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  volume?: number;
  avgVolume?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  beta?: number;
  lastUpdated?: string;
}

/**
 * Search options for asset search
 */
export interface AssetSearchOptions {
  query: string;
  limit?: number;
  assetTypes?: string[];
  exchanges?: string[];
  countries?: string[];
  sectors?: string[];
}

/**
 * Asset Service class
 */
class AssetService {
  private searchCache = new Map<string, { data: AssetSearch[]; timestamp: number }>();
  private infoCache = new Map<string, { data: AssetInfo; timestamp: number }>();
  private priceCache = new Map<string, { data: number; timestamp: number }>();

  // Cache expiration time (5 minutes)
  private readonly CACHE_EXPIRY = 5 * 60 * 1000;

  /**
   * Search for assets by query
   */
  async searchAssets(query: string, limit: number = 10): Promise<AssetSearch[]> {
    try {
      // Check cache first
      const cacheKey = `${query.toLowerCase()}_${limit}`;
      const cached = this.searchCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.data;
      }

      // Make API call
      const response = await apiClient.get<AssetSearch[]>(
        assetEndpoints.search(),
        {
          params: { query, limit }
        }
      );

      // Cache the result
      this.searchCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Error searching assets:', error);

      // Return empty array on error, but don't throw
      // This allows the UI to continue working
      return [];
    }
  }

  /**
   * Search assets with advanced options
   */
  async searchAssetsAdvanced(options: AssetSearchOptions): Promise<AssetSearch[]> {
    try {
      const response = await apiClient.get<AssetSearch[]>(
        assetEndpoints.search(),
        {
          params: {
            query: options.query,
            limit: options.limit || 10,
            asset_types: options.assetTypes?.join(','),
            exchanges: options.exchanges?.join(','),
            countries: options.countries?.join(','),
            sectors: options.sectors?.join(',')
          }
        }
      );

      return response;
    } catch (error) {
      console.error('Error searching assets with advanced options:', error);
      return [];
    }
  }

  /**
   * Get detailed information about an asset
   */
  async getAssetInfo(ticker: string): Promise<AssetInfo | null> {
    try {
      // Check cache first
      const cacheKey = ticker.toUpperCase();
      const cached = this.infoCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.data;
      }

      // Make API call
      const response = await apiClient.get<AssetInfo>(
        assetEndpoints.info(ticker)
      );

      // Cache the result
      this.infoCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error(`Error getting asset info for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get current price for an asset
   */
  async getAssetPrice(ticker: string): Promise<number | null> {
    try {
      // Check cache first
      const cacheKey = ticker.toUpperCase();
      const cached = this.priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.data;
      }

      // Get asset info which includes current price
      const info = await this.getAssetInfo(ticker);

      if (info?.currentPrice) {
        // Cache the price
        this.priceCache.set(cacheKey, {
          data: info.currentPrice,
          timestamp: Date.now()
        });

        return info.currentPrice;
      }

      return null;
    } catch (error) {
      console.error(`Error getting asset price for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get historical data for an asset
   */
  async getAssetHistoricalData(
    ticker: string,
    startDate?: string,
    endDate?: string,
    interval: string = '1d'
  ): Promise<AssetHistoricalData | null> {
    try {
      const response = await apiClient.get<AssetHistoricalData>(
        assetEndpoints.historical(ticker),
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            interval
          }
        }
      );

      return response;
    } catch (error) {
      console.error(`Error getting historical data for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get performance metrics for an asset
   */
  async getAssetPerformance(
    ticker: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ): Promise<AssetPerformance | null> {
    try {
      const response = await apiClient.get<AssetPerformance>(
        assetEndpoints.performance(ticker),
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            benchmark
          }
        }
      );

      return response;
    } catch (error) {
      console.error(`Error getting performance for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Validate if a ticker exists
   */
  async validateTicker(ticker: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ valid: boolean }>(
        assetEndpoints.validate(ticker)
      );

      return response.valid;
    } catch (error) {
      console.error(`Error validating ticker ${ticker}:`, error);
      return false;
    }
  }

  /**
   * Get market status
   */
  async getMarketStatus(): Promise<any> {
    try {
      const response = await apiClient.get(assetEndpoints.marketStatus());
      return response;
    } catch (error) {
      console.error('Error getting market status:', error);
      return null;
    }
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<any> {
    try {
      const response = await apiClient.get(assetEndpoints.sectorPerformance());
      return response;
    } catch (error) {
      console.error('Error getting sector performance:', error);
      return null;
    }
  }

  /**
   * Get multiple asset prices at once
   */
  async getMultipleAssetPrices(tickers: string[]): Promise<Record<string, number | null>> {
    const prices: Record<string, number | null> = {};

    // Use Promise.allSettled to handle failures gracefully
    const results = await Promise.allSettled(
      tickers.map(ticker => this.getAssetPrice(ticker))
    );

    results.forEach((result, index) => {
      const ticker = tickers[index];
      if (result.status === 'fulfilled') {
        prices[ticker] = result.value;
      } else {
        prices[ticker] = null;
        console.error(`Failed to get price for ${ticker}:`, result.reason);
      }
    });

    return prices;
  }

  /**
   * Search assets with debouncing support
   */
  async searchAssetsDebounced(
    query: string,
    limit: number = 10,
    abortController?: AbortController
  ): Promise<AssetSearch[]> {
    try {
      const response = await apiClient.get<AssetSearch[]>(
        assetEndpoints.search(),
        {
          params: { query, limit },
          signal: abortController?.signal
        }
      );

      return response;
    } catch (error) {
      // Handle aborted requests gracefully
      if (error.name === 'AbortError') {
        return [];
      }

      console.error('Error searching assets:', error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.searchCache.clear();
    this.infoCache.clear();
    this.priceCache.clear();
  }

  /**
   * Clear specific cache
   */
  clearCacheForTicker(ticker: string): void {
    const upperTicker = ticker.toUpperCase();
    this.infoCache.delete(upperTicker);
    this.priceCache.delete(upperTicker);

    // Clear search cache entries that might contain this ticker
    for (const key of this.searchCache.keys()) {
      if (key.includes(ticker.toLowerCase())) {
        this.searchCache.delete(key);
      }
    }
  }

  /**
   * Get popular/trending assets
   */
  async getPopularAssets(limit: number = 20): Promise<AssetSearch[]> {
    try {
      // Search for popular tickers
      const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
      const searchPromises = popularTickers.map(ticker =>
        this.searchAssets(ticker, 1).then(results => results[0]).catch(() => null)
      );

      const results = await Promise.allSettled(searchPromises);
      const popularAssets = results
        .filter((result): result is PromiseFulfilledResult<AssetSearch> =>
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .slice(0, limit);

      return popularAssets;
    } catch (error) {
      console.error('Error getting popular assets:', error);
      return [];
    }
  }
}

// Export singleton instance
export const assetService = new AssetService();
export default assetService;