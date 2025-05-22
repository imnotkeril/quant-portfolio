/**
 * API configuration
 * Contains base URLs, endpoints, and other API-related constants
 */

// Base API URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Authentication endpoints
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/auth/token`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

// Portfolio endpoints
export const PORTFOLIO_API = {
  LIST: `${API_BASE_URL}/portfolios`,
  DETAILS: (id: string) => `${API_BASE_URL}/portfolios/${id}`,
  CREATE: `${API_BASE_URL}/portfolios`,
  UPDATE: (id: string) => `${API_BASE_URL}/portfolios/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/portfolios/${id}`,
  CREATE_FROM_TEXT: `${API_BASE_URL}/portfolios/from-text`,
  IMPORT_CSV: `${API_BASE_URL}/portfolios/import-csv`,
  EXPORT_CSV: (id: string) => `${API_BASE_URL}/portfolios/${id}/export-csv`,
  UPDATE_PRICES: (id: string) => `${API_BASE_URL}/portfolios/${id}/update-prices`,
  ADD_ASSET: (id: string) => `${API_BASE_URL}/portfolios/${id}/assets`,
  REMOVE_ASSET: (id: string, ticker: string) => `${API_BASE_URL}/portfolios/${id}/assets/${ticker}`,
};

// Asset endpoints
export const ASSET_API = {
  SEARCH: `${API_BASE_URL}/assets/search`,
  HISTORICAL: (ticker: string) => `${API_BASE_URL}/assets/historical/${ticker}`,
  INFO: (ticker: string) => `${API_BASE_URL}/assets/info/${ticker}`,
  PERFORMANCE: (ticker: string) => `${API_BASE_URL}/assets/performance/${ticker}`,
  VALIDATE: (ticker: string) => `${API_BASE_URL}/assets/validate/${ticker}`,
  MARKET_STATUS: `${API_BASE_URL}/assets/market-status`,
  SECTOR_PERFORMANCE: `${API_BASE_URL}/assets/sectors/performance`,
};

// Analytics endpoints
export const ANALYTICS_API = {
  PERFORMANCE: `${API_BASE_URL}/analytics/performance`,
  RISK: `${API_BASE_URL}/analytics/risk`,
  RETURNS: `${API_BASE_URL}/analytics/returns`,
  CUMULATIVE_RETURNS: `${API_BASE_URL}/analytics/cumulative-returns`,
  DRAWDOWNS: `${API_BASE_URL}/analytics/drawdowns`,
  COMPARE: `${API_BASE_URL}/analytics/compare`,
};

// Enhanced analytics endpoints
export const ENHANCED_ANALYTICS_API = {
  ADVANCED_METRICS: `${API_BASE_URL}/enhanced-analytics/advanced-metrics`,
  ROLLING_METRICS: `${API_BASE_URL}/enhanced-analytics/rolling-metrics`,
  SEASONAL_PATTERNS: `${API_BASE_URL}/enhanced-analytics/seasonal-patterns`,
  CONFIDENCE_INTERVALS: `${API_BASE_URL}/enhanced-analytics/confidence-intervals`,
  TAIL_RISK: `${API_BASE_URL}/enhanced-analytics/tail-risk`,
};

// Optimization endpoints
export const OPTIMIZATION_API = {
  OPTIMIZE: `${API_BASE_URL}/optimization`,
  EFFICIENT_FRONTIER: `${API_BASE_URL}/optimization/efficient-frontier`,
  MARKOWITZ: `${API_BASE_URL}/optimization/markowitz`,
  RISK_PARITY: `${API_BASE_URL}/optimization/risk-parity`,
  MINIMUM_VARIANCE: `${API_BASE_URL}/optimization/minimum-variance`,
  MAXIMUM_SHARPE: `${API_BASE_URL}/optimization/maximum-sharpe`,
  EQUAL_WEIGHT: `${API_BASE_URL}/optimization/equal-weight`,
};

// Advanced optimization endpoints
export const ADVANCED_OPTIMIZATION_API = {
  ROBUST: `${API_BASE_URL}/advanced-optimization/robust`,
  COST_AWARE: `${API_BASE_URL}/advanced-optimization/cost-aware`,
  CONDITIONAL: `${API_BASE_URL}/advanced-optimization/conditional`,
  ESG: `${API_BASE_URL}/advanced-optimization/esg`,
  HIERARCHICAL: `${API_BASE_URL}/advanced-optimization/hierarchical`,
};

// Risk management endpoints
export const RISK_API = {
  VAR: `${API_BASE_URL}/risk/var`,
  CVAR: `${API_BASE_URL}/risk/cvar`,
  STRESS_TEST: `${API_BASE_URL}/risk/stress-test`,
  HISTORICAL_STRESS_TEST: `${API_BASE_URL}/risk/historical-stress-test`,
  CUSTOM_STRESS_TEST: `${API_BASE_URL}/risk/custom-stress-test`,
  ADVANCED_STRESS_TEST: `${API_BASE_URL}/risk/advanced-stress-test`,
  MONTE_CARLO: `${API_BASE_URL}/risk/monte-carlo`,
  DRAWDOWNS: `${API_BASE_URL}/risk/drawdowns`,
  RISK_CONTRIBUTION: `${API_BASE_URL}/risk/risk-contribution`,
};

// Scenario endpoints
export const SCENARIO_API = {
  LIST: `${API_BASE_URL}/scenarios`,
  SIMULATE: `${API_BASE_URL}/scenarios/simulate`,
  IMPACT: `${API_BASE_URL}/scenarios/impact`,
  CHAIN: `${API_BASE_URL}/scenarios/chain`,
  CHAIN_DETAILS: (name: string) => `${API_BASE_URL}/scenarios/chain/${name}`,
  DELETE_CHAIN: (name: string) => `${API_BASE_URL}/scenarios/chain/${name}`,
};

// Historical analysis endpoints
export const HISTORICAL_API = {
  LIST: `${API_BASE_URL}/historical`,
  CONTEXT: `${API_BASE_URL}/historical/context`,
  ANALOGIES: `${API_BASE_URL}/historical/analogies`,
  SIMILARITY: `${API_BASE_URL}/historical/similarity`,
  SCENARIO: `${API_BASE_URL}/historical/scenario`,
  DELETE_SCENARIO: (key: string) => `${API_BASE_URL}/historical/scenario/${key}`,
};

// Comparison endpoints
export const COMPARISON_API = {
  COMPARE: `${API_BASE_URL}/comparison`,
  COMPOSITION: `${API_BASE_URL}/comparison/composition`,
  PERFORMANCE: `${API_BASE_URL}/comparison/performance`,
  RISK: `${API_BASE_URL}/comparison/risk`,
  SECTORS: `${API_BASE_URL}/comparison/sectors`,
  DIFFERENTIAL_RETURNS: `${API_BASE_URL}/comparison/differential-returns`,
  SCENARIOS: `${API_BASE_URL}/comparison/scenarios`,
};

// Report endpoints
export const REPORT_API = {
  GENERATE: `${API_BASE_URL}/reports/generate`,
  COMPARE: `${API_BASE_URL}/reports/compare`,
  SCHEDULE: `${API_BASE_URL}/reports/schedule`,
  SCHEDULED: `${API_BASE_URL}/reports/scheduled`,
  CANCEL_SCHEDULED: (id: string) => `${API_BASE_URL}/reports/scheduled/${id}`,
  HISTORY: `${API_BASE_URL}/reports/history`,
  TEMPLATES: `${API_BASE_URL}/reports/templates`,
  DOWNLOAD: (id: string) => `${API_BASE_URL}/reports/download/${id}`,
};

// System endpoints
export const SYSTEM_API = {
  HEALTH: `${API_BASE_URL}/system/health`,
  INFO: `${API_BASE_URL}/system/info`,
  CONFIG: `${API_BASE_URL}/system/config`,
  PING: `${API_BASE_URL}/system/ping`,
};

// API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// API error codes
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export default {
  API_BASE_URL,
  AUTH_API,
  PORTFOLIO_API,
  ASSET_API,
  ANALYTICS_API,
  ENHANCED_ANALYTICS_API,
  OPTIMIZATION_API,
  ADVANCED_OPTIMIZATION_API,
  RISK_API,
  SCENARIO_API,
  HISTORICAL_API,
  COMPARISON_API,
  REPORT_API,
  SYSTEM_API,
  API_TIMEOUT,
  API_ERROR_CODES,
};