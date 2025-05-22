/**
 * Common types used across the application
 */

/**
 * Date range for filtering data
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy: string;
  sortOrder: SortOrder;
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'eq'          // Equal
  | 'neq'         // Not equal
  | 'gt'          // Greater than
  | 'gte'         // Greater than or equal
  | 'lt'          // Less than
  | 'lte'         // Less than or equal
  | 'contains'    // Contains substring
  | 'startsWith'  // Starts with
  | 'endsWith'    // Ends with
  | 'in'          // In a list
  | 'between';    // Between two values

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  filters: FilterCondition[];
  logicalOperator: 'and' | 'or';
}

/**
 * API Response
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: 'success' | 'error';
}

/**
 * API Error
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

/**
 * Status message
 */
export interface StatusMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  timestamp: string;
  code?: string;
}

/**
 * Time frame options
 */
export type TimeFrame =
  | '1d'    // 1 day
  | '1w'    // 1 week
  | '1m'    // 1 month
  | '3m'    // 3 months
  | '6m'    // 6 months
  | '1y'    // 1 year
  | '2y'    // 2 years
  | '5y'    // 5 years
  | 'max'   // Maximum available
  | 'ytd'   // Year to date
  | 'mtd'   // Month to date
  | 'qtd';  // Quarter to date

/**
 * File information
 */
export interface FileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}