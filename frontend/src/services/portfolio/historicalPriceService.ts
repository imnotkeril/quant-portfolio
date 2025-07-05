/**
 * Historical Price Service
 * Service for fetching historical prices by date
 */
import apiClient from '../api/client';
import { assetEndpoints } from '../api/endpoints';

interface HistoricalPriceData {
  ticker: string;
  date: string;
  price: number;
  currency: string;
  source: string;
}

interface PriceByDateRequest {
  ticker: string;
  date: string;
}

/**
 * Historical Price Service class
 */
class HistoricalPriceService {
  private priceCache = new Map<string, { data: HistoricalPriceData; timestamp: number }>();

  // Cache expiration time (1 hour for historical data)
  private readonly CACHE_EXPIRY = 60 * 60 * 1000;

  /**
   * Get historical price for a specific date
   */
  async getPriceByDate(ticker: string, date: string): Promise<number | null> {
    try {
      // Create cache key
      const cacheKey = `${ticker.toUpperCase()}_${date}`;
      const cached = this.priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.data.price;
      }

      // Make API call to get historical price
      const response = await apiClient.get<HistoricalPriceData>(
        `${assetEndpoints.historical(ticker)}/price`,
        {
          params: { date }
        }
      );

      // Cache the result
      this.priceCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response.price;

    } catch (error) {
      console.error(`Error getting historical price for ${ticker} on ${date}:`, error);

      // Fallback: try to get current price if historical fails
      try {
        const currentPriceResponse = await apiClient.get<{ currentPrice: number }>(
          assetEndpoints.price(ticker)
        );

        console.warn(`Using current price as fallback for ${ticker} historical price`);
        return currentPriceResponse.currentPrice;
      } catch (fallbackError) {
        console.error(`Fallback price fetch also failed for ${ticker}:`, fallbackError);
        return null;
      }
    }
  }

  /**
   * Get historical prices for multiple assets and dates
   */
  async getMultiplePricesByDate(requests: PriceByDateRequest[]): Promise<Record<string, number | null>> {
    const results: Record<string, number | null> = {};

    // Process requests in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchPromises = batch.map(async (request) => {
        const price = await this.getPriceByDate(request.ticker, request.date);
        return { key: `${request.ticker}_${request.date}`, price };
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => {
        results[result.key] = result.price;
      });

      // Small delay between batches to be respectful to the API
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get historical price range for analysis
   */
  async getPriceRange(
    ticker: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[] | null> {
    try {
      const response = await apiClient.get<HistoricalPriceData[]>(
        assetEndpoints.historical(ticker),
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            interval: 'daily'
          }
        }
      );

      return response;
    } catch (error) {
      console.error(`Error getting price range for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Validate if date is a trading day (rough check)
   */
  isLikelyTradingDay(date: string): boolean {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Exclude weekends (rough check - doesn't account for holidays)
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  /**
   * Get nearest trading day price if exact date unavailable
   */
  async getNearestTradingDayPrice(ticker: string, date: string): Promise<number | null> {
    try {
      // Try exact date first
      let price = await this.getPriceByDate(ticker, date);
      if (price !== null) {
        return price;
      }

      // If exact date fails, try nearby dates (within 5 business days)
      const targetDate = new Date(date);

      for (let i = 1; i <= 5; i++) {
        // Try previous days
        const prevDate = new Date(targetDate);
        prevDate.setDate(prevDate.getDate() - i);

        if (this.isLikelyTradingDay(prevDate.toISOString().split('T')[0])) {
          price = await this.getPriceByDate(ticker, prevDate.toISOString().split('T')[0]);
          if (price !== null) {
            console.info(`Used price from ${prevDate.toISOString().split('T')[0]} for ${ticker} (requested: ${date})`);
            return price;
          }
        }

        // Try next days
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + i);

        if (this.isLikelyTradingDay(nextDate.toISOString().split('T')[0])) {
          price = await this.getPriceByDate(ticker, nextDate.toISOString().split('T')[0]);
          if (price !== null) {
            console.info(`Used price from ${nextDate.toISOString().split('T')[0]} for ${ticker} (requested: ${date})`);
            return price;
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error getting nearest trading day price for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Clear price cache
   */
  clearCache(ticker?: string): void {
    if (ticker) {
      // Clear cache for specific ticker
      const tickerUpper = ticker.toUpperCase();
      const keysToDelete = Array.from(this.priceCache.keys()).filter(key =>
        key.startsWith(tickerUpper + '_')
      );
      keysToDelete.forEach(key => this.priceCache.delete(key));
    } else {
      // Clear entire cache
      this.priceCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.priceCache.size,
      keys: Array.from(this.priceCache.keys())
    };
  }
}

// Export singleton instance
export const historicalPriceService = new HistoricalPriceService();
export default historicalPriceService;