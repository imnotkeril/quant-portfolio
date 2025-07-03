/**
 * Hook for managing asset search and data
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { assetService, AssetInfo } from '../services/portfolio/assetService';
import { AssetSearch, AssetHistoricalData, AssetPerformance } from '../types/portfolio';

interface UseAssetsState {
  // Search state
  searchResults: AssetSearch[];
  searchLoading: boolean;
  searchError: string | null;

  // Asset info state
  assetInfo: AssetInfo | null;
  assetInfoLoading: boolean;
  assetInfoError: string | null;

  // Price state
  currentPrice: number | null;
  priceLoading: boolean;
  priceError: string | null;

  // Historical data state
  historicalData: AssetHistoricalData | null;
  historicalLoading: boolean;
  historicalError: string | null;

  // Performance state
  performanceData: AssetPerformance | null;
  performanceLoading: boolean;
  performanceError: string | null;

  // Popular assets
  popularAssets: AssetSearch[];
  popularAssetsLoading: boolean;
  popularAssetsError: string | null;
}

interface UseAssetsActions {
  // Search actions
  searchAssets: (query: string, limit?: number) => Promise<void>;
  clearSearch: () => void;

  // Asset info actions
  getAssetInfo: (ticker: string) => Promise<AssetInfo | null>;
  clearAssetInfo: () => void;

  // Price actions
  getAssetPrice: (ticker: string) => Promise<number | null>;
  getMultipleAssetPrices: (tickers: string[]) => Promise<Record<string, number | null>>;

  // Historical data actions
  getHistoricalData: (
    ticker: string,
    startDate?: string,
    endDate?: string,
    interval?: string
  ) => Promise<AssetHistoricalData | null>;

  // Performance actions
  getPerformanceData: (
    ticker: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ) => Promise<AssetPerformance | null>;

  // Validation
  validateTicker: (ticker: string) => Promise<boolean>;

  // Popular assets
  loadPopularAssets: (limit?: number) => Promise<void>;

  // Cache management
  clearCache: () => void;
  clearCacheForTicker: (ticker: string) => void;

  // Error handling
  clearAllErrors: () => void;
}

/**
 * Hook for debounced search
 */
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useAssets = (): UseAssetsState & UseAssetsActions => {
  const [state, setState] = useState<UseAssetsState>({
    // Search state
    searchResults: [],
    searchLoading: false,
    searchError: null,

    // Asset info state
    assetInfo: null,
    assetInfoLoading: false,
    assetInfoError: null,

    // Price state
    currentPrice: null,
    priceLoading: false,
    priceError: null,

    // Historical data state
    historicalData: null,
    historicalLoading: false,
    historicalError: null,

    // Performance state
    performanceData: null,
    performanceLoading: false,
    performanceError: null,

    // Popular assets
    popularAssets: [],
    popularAssetsLoading: false,
    popularAssetsError: null,
  });

  // Ref for current search abort controller
  const searchAbortController = useRef<AbortController | null>(null);

  // Search assets with debouncing
  const searchAssets = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        searchResults: [],
        searchLoading: false,
        searchError: null
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      searchLoading: true,
      searchError: null
    }));

    try {
      // Cancel previous search if still running
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }

      // Create new abort controller
      searchAbortController.current = new AbortController();

      const results = await assetService.searchAssetsDebounced(
        query,
        limit,
        searchAbortController.current
      );

      setState(prev => ({
        ...prev,
        searchResults: results,
        searchLoading: false,
        searchError: null
      }));
    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search assets';
        setState(prev => ({
          ...prev,
          searchResults: [],
          searchLoading: false,
          searchError: errorMessage
        }));
      }
    }
  }, []);

  // Clear search results
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchResults: [],
      searchLoading: false,
      searchError: null
    }));

    // Cancel any ongoing search
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
  }, []);

  // Get asset info
  const getAssetInfo = useCallback(async (ticker: string): Promise<AssetInfo | null> => {
    setState(prev => ({
      ...prev,
      assetInfoLoading: true,
      assetInfoError: null
    }));

    try {
      const info = await assetService.getAssetInfo(ticker);

      setState(prev => ({
        ...prev,
        assetInfo: info,
        assetInfoLoading: false,
        assetInfoError: null
      }));

      return info;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get asset info';
      setState(prev => ({
        ...prev,
        assetInfo: null,
        assetInfoLoading: false,
        assetInfoError: errorMessage
      }));
      return null;
    }
  }, []);

  // Clear asset info
  const clearAssetInfo = useCallback(() => {
    setState(prev => ({
      ...prev,
      assetInfo: null,
      assetInfoLoading: false,
      assetInfoError: null
    }));
  }, []);

  // Get asset price
  const getAssetPrice = useCallback(async (ticker: string): Promise<number | null> => {
    setState(prev => ({
      ...prev,
      priceLoading: true,
      priceError: null
    }));

    try {
      const price = await assetService.getAssetPrice(ticker);

      setState(prev => ({
        ...prev,
        currentPrice: price,
        priceLoading: false,
        priceError: null
      }));

      return price;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get asset price';
      setState(prev => ({
        ...prev,
        currentPrice: null,
        priceLoading: false,
        priceError: errorMessage
      }));
      return null;
    }
  }, []);

  // Get multiple asset prices
  const getMultipleAssetPrices = useCallback(async (tickers: string[]) => {
    try {
      const prices = await assetService.getMultipleAssetPrices(tickers);
      return prices;
    } catch (error) {
      console.error('Error getting multiple asset prices:', error);
      return {};
    }
  }, []);

  // Get historical data
  const getHistoricalData = useCallback(async (
    ticker: string,
    startDate?: string,
    endDate?: string,
    interval: string = '1d'
  ): Promise<AssetHistoricalData | null> => {
    setState(prev => ({
      ...prev,
      historicalLoading: true,
      historicalError: null
    }));

    try {
      const data = await assetService.getAssetHistoricalData(
        ticker,
        startDate,
        endDate,
        interval
      );

      setState(prev => ({
        ...prev,
        historicalData: data,
        historicalLoading: false,
        historicalError: null
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get historical data';
      setState(prev => ({
        ...prev,
        historicalData: null,
        historicalLoading: false,
        historicalError: errorMessage
      }));
      return null;
    }
  }, []);

  // Get performance data
  const getPerformanceData = useCallback(async (
    ticker: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ): Promise<AssetPerformance | null> => {
    setState(prev => ({
      ...prev,
      performanceLoading: true,
      performanceError: null
    }));

    try {
      const data = await assetService.getAssetPerformance(
        ticker,
        startDate,
        endDate,
        benchmark
      );

      setState(prev => ({
        ...prev,
        performanceData: data,
        performanceLoading: false,
        performanceError: null
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get performance data';
      setState(prev => ({
        ...prev,
        performanceData: null,
        performanceLoading: false,
        performanceError: errorMessage
      }));
      return null;
    }
  }, []);

  // Validate ticker
  const validateTicker = useCallback(async (ticker: string): Promise<boolean> => {
    try {
      const isValid = await assetService.validateTicker(ticker);
      return isValid;
    } catch (error) {
      console.error('Error validating ticker:', error);
      return false;
    }
  }, []);

  // Load popular assets
  const loadPopularAssets = useCallback(async (limit: number = 20) => {
    setState(prev => ({
      ...prev,
      popularAssetsLoading: true,
      popularAssetsError: null
    }));

    try {
      const assets = await assetService.getPopularAssets(limit);

      setState(prev => ({
        ...prev,
        popularAssets: assets,
        popularAssetsLoading: false,
        popularAssetsError: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load popular assets';
      setState(prev => ({
        ...prev,
        popularAssets: [],
        popularAssetsLoading: false,
        popularAssetsError: errorMessage
      }));
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    assetService.clearCache();
  }, []);

  // Clear cache for specific ticker
  const clearCacheForTicker = useCallback((ticker: string) => {
    assetService.clearCacheForTicker(ticker);
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchError: null,
      assetInfoError: null,
      priceError: null,
      historicalError: null,
      performanceError: null,
      popularAssetsError: null
    }));
  }, []);

  // Load popular assets on mount
  useEffect(() => {
    loadPopularAssets();
  }, [loadPopularAssets]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing search
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    searchAssets,
    clearSearch,
    getAssetInfo,
    clearAssetInfo,
    getAssetPrice,
    getMultipleAssetPrices,
    getHistoricalData,
    getPerformanceData,
    validateTicker,
    loadPopularAssets,
    clearCache,
    clearCacheForTicker,
    clearAllErrors,
  };
};

/**
 * Hook for debounced asset search
 */
export const useAssetSearch = (debounceMs: number = 300) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);
  const { searchAssets, searchResults, searchLoading, searchError, clearSearch } = useAssets();

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchAssets(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchAssets, clearSearch]);

  return {
    query,
    setQuery,
    searchResults,
    searchLoading,
    searchError,
    clearSearch
  };
};

export default useAssets;