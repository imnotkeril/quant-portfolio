/**
 * API configuration
 * Contains base URLs, endpoints, and other API-related constants
 * ИСПРАВЛЕННАЯ ВЕРСИЯ
 */

// Get environment variables safely in React - ИСПРАВЛЕННАЯ ФУНКЦИЯ
const getEnvVar = (key: string, defaultValue: string): string => {
  // В production среде Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }

  // В development среде для Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || defaultValue;
  }

  // Для Create React App
  if (typeof window !== 'undefined' && (window as any).env) {
    return (window as any).env[key] || defaultValue;
  }

  // Browser fallback для runtime config
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }

  return defaultValue;
};

// API Base URL configuration
export const API_BASE_URL = getEnvVar('REACT_APP_API_URL', 'http://localhost:8080/api/v1');

// API timeout configuration
export const API_TIMEOUT = 30000; // 30 seconds

// API error codes
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0,
} as const;

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
  SECTOR_PERFORMANCE: `${API_BASE_URL}/assets/sector-performance`,
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
  ATTRIBUTION: `${API_BASE_URL}/enhanced-analytics/attribution`,
  BENCHMARK_ANALYSIS: `${API_BASE_URL}/enhanced-analytics/benchmark-analysis`,
  CALENDAR_ANALYSIS: `${API_BASE_URL}/enhanced-analytics/calendar-analysis`,
  FACTOR_ANALYSIS: `${API_BASE_URL}/enhanced-analytics/factor-analysis`,
};

// Optimization endpoints
export const OPTIMIZATION_API = {
  EFFICIENT_FRONTIER: `${API_BASE_URL}/optimization/efficient-frontier`,
  OPTIMIZE: `${API_BASE_URL}/optimization/optimize`,
  RISK_PARITY: `${API_BASE_URL}/optimization/risk-parity`,
  MEAN_VARIANCE: `${API_BASE_URL}/optimization/mean-variance`,
  MINIMUM_VARIANCE: `${API_BASE_URL}/optimization/minimum-variance`,
  MAXIMUM_SHARPE: `${API_BASE_URL}/optimization/maximum-sharpe`,
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
  COMPARE: `${API_BASE_URL}/comparison/compare`,
  COMPOSITION: `${API_BASE_URL}/comparison/composition`,
  PERFORMANCE: `${API_BASE_URL}/comparison/performance`,
  RISK: `${API_BASE_URL}/comparison/risk`,
  SECTORS: `${API_BASE_URL}/comparison/sectors`,
  SCENARIOS: `${API_BASE_URL}/comparison/scenarios`,
  DIFFERENTIAL: `${API_BASE_URL}/comparison/differential`,
};

// Report endpoints
export const REPORT_API = {
  GENERATE: `${API_BASE_URL}/reports/generate`,
  LIST: `${API_BASE_URL}/reports/list`,
  DOWNLOAD: (reportId: string) => `${API_BASE_URL}/reports/download/${reportId}`,
  DELETE: (reportId: string) => `${API_BASE_URL}/reports/${reportId}`,
  SCHEDULE: `${API_BASE_URL}/reports/schedule`,
  TEMPLATES: `${API_BASE_URL}/reports/templates`,
};

// System endpoints
export const SYSTEM_API = {
  HEALTH: `${API_BASE_URL}/health`,
  INFO: `${API_BASE_URL}/system/info`,
  STATUS: `${API_BASE_URL}/system/status`,
};

// Consolidated endpoints object for easier imports
export const endpoints = {
  auth: AUTH_API,
  portfolio: PORTFOLIO_API,
  asset: ASSET_API,
  analytics: ANALYTICS_API,
  enhancedAnalytics: ENHANCED_ANALYTICS_API,
  optimization: OPTIMIZATION_API,
  advancedOptimization: ADVANCED_OPTIMIZATION_API,
  risk: RISK_API,
  scenario: SCENARIO_API,
  historical: HISTORICAL_API,
  comparison: COMPARISON_API,
  report: REPORT_API,
  system: SYSTEM_API,
};

// Export API configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  errorCodes: API_ERROR_CODES,
};

// Debug information for development
if (getEnvVar('REACT_APP_DEBUG', 'false') === 'true') {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    environment: getEnvVar('REACT_APP_ENV', 'development'),
  });
}