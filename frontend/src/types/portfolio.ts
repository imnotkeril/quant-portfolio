/**
 * Portfolio types
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
 * Asset create request
 */
export interface AssetCreate extends AssetBase {
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  currency?: string;
  country?: string;
  exchange?: string;
}

/**
 * Asset update request
 */
export interface AssetUpdate {
  name?: string;
  weight?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentPrice?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  currency?: string;
  country?: string;
  exchange?: string;
}

/**
 * Asset in portfolio response
 */
export interface Asset extends AssetCreate {
  lastUpdated?: string;
  positionValue?: number;
  profitLoss?: number;
  profitLossPct?: number;
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
  currency?: string;
  sector?: string;
  industry?: string;
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
  startDate: string;
  endDate: string;
  interval: string;
}

/**
 * Asset Performance
 */
export interface AssetPerformance {
  ticker: string;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  beta?: number;
  alpha?: number;
  periodReturns: Record<string, number>;
  startDate: string;
  endDate: string;
  benchmarkId?: string;
}

/**
 * API Portfolio Response
 */
export type ApiPortfolioResponse = ApiResponse<Portfolio>;

/**
 * API Portfolio List Response
 */
export type ApiPortfolioListResponse = ApiResponse<PortfolioListItem[]>;

/**
 * API Asset Search Response
 */
export type ApiAssetSearchResponse = ApiResponse<AssetSearch[]>;