/**
 * Portfolio types - UPDATED
 * Currency and Quantity fields removed as requested
 */
import { ApiResponse } from './common';

/**
 * Asset base type
 */
export interface AssetBase {
  ticker: string;
  name?: string;
  weight?: number;
}

/**
 * Asset create request - NO CURRENCY, NO QUANTITY
 */
export interface AssetCreate extends AssetBase {
  purchasePrice?: number;
  purchaseDate?: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  country?: string;
  exchange?: string;
}

/**
 * Asset update request - NO CURRENCY, NO QUANTITY
 */
export interface AssetUpdate {
  name?: string;
  weight?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  country?: string;
  exchange?: string;
}

/**
 * Asset in portfolio response - QUANTITY CALCULATED AUTOMATICALLY
 */
export interface Asset extends AssetCreate {
  lastUpdated?: string;
  positionValue?: number;
  profitLoss?: number;
  profitLossPct?: number;
  // quantity calculated automatically: (portfolioValue * weight/100) / purchasePrice
  calculatedQuantity?: number;
}

/**
 * Portfolio base type
 */
export interface PortfolioBase {
  name: string;
  description?: string;
  tags?: string[];
}

/**
 * Portfolio create request
 */
export interface PortfolioCreate extends PortfolioBase {
  assets?: AssetCreate[];
  initialValue?: number; // Starting portfolio value for quantity calculations
}

/**
 * Portfolio update request
 */
export interface PortfolioUpdate {
  name?: string;
  description?: string;
  tags?: string[];
  assets?: AssetCreate[];
  resetAssets?: boolean;
  assetsToDelete?: string[];
  initialValue?: number;
}

/**
 * Portfolio response
 */
export interface Portfolio extends PortfolioBase {
  id: string;
  assets: Asset[];
  created: string;
  lastUpdated: string;
  totalValue?: number;
  initialValue?: number;
  performance?: Record<string, number>;
}

/**
 * Portfolio list item
 */
export interface PortfolioListItem {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  tags: string[];
  lastUpdated: string;
}

/**
 * Text Portfolio Create
 */
export interface TextPortfolioCreate extends PortfolioBase {
  text: string;
  initialValue?: number;
}

/**
 * Update prices response
 */
export interface UpdatePricesResponse {
  portfolioId: string;
  updatedAssets: number;
  timestamp: string;
  priceChanges: Record<string, number>;
}

/**
 * Asset Price Update
 */
export interface AssetPriceUpdate {
  ticker: string;
  currentPrice: number;
  priceDate?: string;
  source?: string;
}

/**
 * Asset Search Result
 */
export interface AssetSearch {
  ticker: string;
  name: string;
  exchange?: string;
  assetType?: string;
  country?: string;
  sector?: string;
  industry?: string;
  // Currency determined automatically by exchange
}

/**
 * Historical Asset Data
 */
export interface AssetHistoricalData {
  ticker: string;
  dates: string[];
  prices: {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    adjClose: number[];
  };
  volumes?: number[];
  currency: string; // Auto-determined by API
}

/**
 * Asset Performance Data
 */
export interface AssetPerformance {
  ticker: string;
  returns: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    ytd: number;
  };
  volatility: number;
  sharpe: number;
  maxDrawdown: number;
  beta?: number;
  currency: string; // Auto-determined by API
}

/**
 * Portfolio Analytics Request
 */
export interface AnalyticsRequest {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
}

/**
 * Performance Metrics Response
 */
export interface PerformanceMetricsResponse {
  portfolioId: string;
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    calmarRatio: number;
    sortinoRatio: number;
    beta?: number;
    alpha?: number;
    informationRatio?: number;
  };
  periodStart: string;
  periodEnd: string;
  benchmark?: string;
}

/**
 * Risk Metrics Response
 */
export interface RiskMetricsResponse {
  portfolioId: string;
  riskMetrics: {
    valueAtRisk: number;
    conditionalVaR: number;
    standardDeviation: number;
    downside_deviation: number;
    trackingError?: number;
    correlation?: number;
  };
  confidence: number;
  timeHorizon: number;
}

/**
 * Portfolio Comparison Response
 */
export interface PortfolioComparisonResponse {
  portfolio1: string;
  portfolio2: string;
  comparison: {
    performance: {
      returns: Record<string, number>;
      volatility: Record<string, number>;
      sharpe: Record<string, number>;
    };
    allocation: {
      sectorDifferences: Record<string, number>;
      assetClassDifferences: Record<string, number>;
      geographicDifferences: Record<string, number>;
    };
    risk: {
      var: Record<string, number>;
      correlation: number;
      tracking_error: number;
    };
  };
}

/**
 * Asset Form Data Interface (for forms only)
 */
export interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  industry?: string;
  country?: string;
  exchange?: string;
}

/**
 * Currency Auto-Detection Map
 * Currency is automatically determined by exchange
 */
export const EXCHANGE_CURRENCY_MAP: Record<string, string> = {
  'NASDAQ': 'USD',
  'NYSE': 'USD',
  'LSE': 'GBP',
  'TSE': 'JPY',
  'HKSE': 'HKD',
  'ASX': 'AUD',
  'TSX': 'CAD',
  'FRA': 'EUR',
  'AMS': 'EUR',
  'SWX': 'CHF',
  'BSE': 'INR',
  'NSE': 'INR',
  'SSE': 'CNY',
  'SZSE': 'CNY',
  'KRX': 'KRW',
  'BMV': 'MXN',
  'B3': 'BRL',
};

/**
 * Get currency for exchange
 */
export const getCurrencyForExchange = (exchange: string): string => {
  return EXCHANGE_CURRENCY_MAP[exchange.toUpperCase()] || 'USD';
};

/**
 * Calculate quantity from weight and portfolio value
 */
export const calculateQuantity = (
  weight: number, // in percentage (0-100)
  portfolioValue: number,
  pricePerShare: number
): number => {
  if (pricePerShare <= 0) return 0;
  return Math.floor((portfolioValue * weight / 100) / pricePerShare);
};

/**
 * Calculate position value from quantity and current price
 */
export const calculatePositionValue = (
  quantity: number,
  currentPrice: number
): number => {
  return quantity * currentPrice;
};

/**
 * Calculate weight from position value and total portfolio value
 */
export const calculateWeight = (
  positionValue: number,
  totalPortfolioValue: number
): number => {
  if (totalPortfolioValue <= 0) return 0;
  return (positionValue / totalPortfolioValue) * 100;
};