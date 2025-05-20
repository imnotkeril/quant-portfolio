import { BaseResponse } from './common';

/**
 * Asset (security) in a portfolio
 */
export interface Asset {
  ticker: string;
  weight: number;
  name?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  quantity?: number;
  sector?: string;
  industry?: string;
  assetClass?: string;
  currency?: string;
  country?: string;
  exchange?: string;
  currentPrice?: number;
  priceChangePercent?: number;
  beta?: number;
}

/**
 * Portfolio entity
 */
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  created: string;
  lastUpdated: string;
  assets: Asset[];
  assetCount: number;
}

/**
 * Data for creating a new portfolio
 */
export interface PortfolioCreate {
  name: string;
  description?: string;
  assets: Asset[];
}

/**
 * Data for creating a portfolio from text input
 */
export interface TextPortfolioCreate {
  name: string;
  description?: string;
  text: string;
}

/**
 * Data for updating a portfolio
 */
export interface PortfolioUpdate {
  name?: string;
  description?: string;
  assets?: Asset[];
}

/**
 * Simple portfolio listing item
 */
export interface PortfolioListItem {
  id: string;
  name: string;
  assetCount: number;
  lastUpdated: string;
}

/**
 * Portfolio list response
 */
export interface PortfolioListResponse extends BaseResponse {
  portfolios: PortfolioListItem[];
}

/**
 * Portfolio response
 */
export interface PortfolioResponse extends BaseResponse {
  portfolio: Portfolio;
}

/**
 * Template for portfolio creation
 */
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
}

/**
 * Template list response
 */
export interface TemplateListResponse extends BaseResponse {
  templates: PortfolioTemplate[];
}