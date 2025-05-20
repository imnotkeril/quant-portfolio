/**
 * Common types shared across multiple features
 */

/**
 * Date range for data queries
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Time period types
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Return calculation method
 */
export type ReturnMethod = 'simple' | 'log';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination result
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/**
 * Base response interface with common fields
 */
export interface BaseResponse {
  success: boolean;
  message?: string;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  date: string;
  value: number;
}

/**
 * Drawdown period
 */
export interface DrawdownPeriod {
  startDate: string;
  valleyDate: string;
  recoveryDate?: string;
  depth: number;
  duration: number;
  recovery?: number;
}