import { BaseResponse, DateRange, TimeSeriesPoint } from './common';

/**
 * Historical price data request
 */
export interface PriceRequest {
  tickers: string[];
  dateRange: DateRange;
  interval?: 'daily' | 'weekly' | 'monthly';
  adjustedClose?: boolean;
}

/**
 * Price data for a single ticker
 */
export interface TickerPriceData {
  ticker: string;
  name?: string;
  timeSeries: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjustedClose?: number;
    volume?: number;
  }[];
  currency: string;
  exchange?: string;
}

/**
 * Historical price data response
 */
export interface PriceResponse extends BaseResponse {
  priceData: { [ticker: string]: TickerPriceData };
}

/**
 * Asset search request
 */
export interface SearchRequest {
  query: string;
  limit?: number;
  assetType?: 'stock' | 'etf' | 'mutual_fund' | 'index' | 'all';
  exchange?: string;
}

/**
 * Asset search result
 */
export interface SearchResult {
  ticker: string;
  name: string;
  assetType: string;
  exchange: string;
  currency: string;
  region: string;
}

/**
 * Asset search response
 */
export interface SearchResponse extends BaseResponse {
  results: SearchResult[];
  query: string;
}

/**
 * Sector performance data
 */
export interface SectorPerformance {
  sector: string;
  oneDayChange: number;
  fiveDayChange: number;
  oneMonthChange: number;
  threeMonthChange: number;
  sixMonthChange: number;
  ytdChange: number;
  oneYearChange: number;
  threeYearChange: number;
  fiveYearChange: number;
}

/**
 * Sector performance response
 */
export interface SectorResponse extends BaseResponse {
  date: string;
  sectors: SectorPerformance[];
}

/**
 * Economic indicator request
 */
export interface IndicatorRequest {
  indicators: string[];
  dateRange: DateRange;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

/**
 * Economic indicator data
 */
export interface IndicatorData {
  name: string;
  description: string;
  timeSeries: TimeSeriesPoint[];
  unit: string;
  source: string;
  lastUpdated: string;
}

/**
 * Economic indicators response
 */
export interface IndicatorResponse extends BaseResponse {
  indicators: { [indicator: string]: IndicatorData };
}

/**
 * Fundamental data type
 */
export type FundamentalType = 'income' | 'balance' | 'cash_flow' | 'ratios' | 'all';

/**
 * Fundamental data request
 */
export interface FundamentalRequest {
  ticker: string;
  type: FundamentalType;
  period?: 'annual' | 'quarterly';
  limit?: number;
}

/**
 * Financial statement item
 */
export interface FinancialStatementItem {
  reportDate: string;
  fiscalYear: number;
  fiscalQuarter?: number;
  values: { [field: string]: number };
  currency: string;
}

/**
 * Financial ratio
 */
export interface FinancialRatio {
  reportDate: string;
  fiscalYear: number;
  fiscalQuarter?: number;
  ratios: { [ratio: string]: number };
}

/**
 * Fundamental data response
 */
export interface FundamentalResponse extends BaseResponse {
  ticker: string;
  name: string;
  income?: FinancialStatementItem[];
  balance?: FinancialStatementItem[];
  cashFlow?: FinancialStatementItem[];
  ratios?: FinancialRatio[];
  currency: string;
  exchange: string;
  sector: string;
  industry: string;
  companyInfo: {
    description: string;
    website: string;
    employees: number;
    marketCap: number;
    peRatio: number;
    dividendYield: number;
    beta: number;
    [key: string]: string | number;
  };
}