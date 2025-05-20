// Base API URL - should be environment specific
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// API version
export const API_VERSION = 'v1';

// Timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    REGISTER: '/auth/register',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // Portfolios
  PORTFOLIOS: {
    LIST: '/portfolios',
    CREATE: '/portfolios',
    GET: (id: string) => `/portfolios/${id}`,
    UPDATE: (id: string) => `/portfolios/${id}`,
    DELETE: (id: string) => `/portfolios/${id}`,
    CREATE_FROM_TEXT: '/portfolios/from-text',
    IMPORT_CSV: '/portfolios/import-csv',
    EXPORT_CSV: (id: string) => `/portfolios/${id}/export-csv`,
    UPDATE_PRICES: (id: string) => `/portfolios/${id}/update-prices`,
  },

  // Analytics
  ANALYTICS: {
    PERFORMANCE: '/analytics/performance',
    RISK: '/analytics/risk',
    RETURNS: '/analytics/returns',
    CUMULATIVE_RETURNS: '/analytics/cumulative-returns',
    DRAWDOWNS: '/analytics/drawdowns',
    COMPARE: '/analytics/compare',
  },

  // Enhanced Analytics
  ENHANCED_ANALYTICS: {
    OMEGA_RATIO: '/enhanced-analytics/omega-ratio',
    ULCER_INDEX: '/enhanced-analytics/ulcer-index',
    TAIL_RISK: '/enhanced-analytics/tail-risk',
    DRAWDOWN_STATISTICS: '/enhanced-analytics/drawdown-statistics',
    CONFIDENCE_INTERVALS: '/enhanced-analytics/confidence-intervals',
    ROLLING_STATISTICS: '/enhanced-analytics/rolling-statistics',
    SEASONAL_PATTERNS: '/enhanced-analytics/seasonal-patterns',
  },

  // Optimization
  OPTIMIZATION: {
    OPTIMIZE: '/optimization',
    EFFICIENT_FRONTIER: '/optimization/efficient-frontier',
    MARKOWITZ: '/optimization/markowitz',
    RISK_PARITY: '/optimization/risk-parity',
    MINIMUM_VARIANCE: '/optimization/minimum-variance',
    MAXIMUM_SHARPE: '/optimization/maximum-sharpe',
    EQUAL_WEIGHT: '/optimization/equal-weight',
  },

  // Advanced Optimization
  ADVANCED_OPTIMIZATION: {
    ROBUST: '/advanced-optimization/robust',
    COST_AWARE: '/advanced-optimization/cost-aware',
    CONDITIONAL: '/advanced-optimization/conditional',
    ESG: '/advanced-optimization/esg',
    HIERARCHICAL: '/advanced-optimization/hierarchical',
  },

  // Risk
  RISK: {
    VAR: '/risk/var',
    CVAR: '/risk/cvar',
    STRESS_TEST: '/risk/stress-test',
    CUSTOM_STRESS_TEST: '/risk/custom-stress-test',
    MONTE_CARLO: '/risk/monte-carlo',
    DRAWDOWNS: '/risk/drawdowns',
    ADVANCED_MONTE_CARLO: '/risk/advanced-monte-carlo',
  },

  // Scenarios
  SCENARIOS: {
    LIST: '/scenarios',
    SIMULATE: '/scenarios/simulate',
    IMPACT: '/scenarios/impact',
  },

  // Historical
  HISTORICAL: {
    LIST: '/historical',
    CONTEXT: '/historical/context',
    ANALOGIES: '/historical/analogies',
  },

  // Comparison
  COMPARISON: {
    COMPARE: '/comparison',
  },

  // Reports
  REPORTS: {
    GENERATE: '/reports/generate',
    COMPARE: '/reports/compare',
    SCHEDULE: '/reports/schedule',
    SCHEDULED: '/reports/scheduled',
    HISTORY: '/reports/history',
    TEMPLATES: '/reports/templates',
    DOWNLOAD: (id: string) => `/reports/download/${id}`,
  },

  // Market Data
  MARKET_DATA: {
    SEARCH: '/market-data/search',
    PRICE_HISTORY: '/market-data/price-history',
    COMPANY_INFO: '/market-data/company-info',
    SECTOR_PERFORMANCE: '/market-data/sector-performance',
    ECONOMIC_INDICATORS: '/market-data/economic-indicators',
    MARKET_SUMMARY: '/market-data/market-summary',
  },
};

// Helper function to build full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/${API_VERSION}${endpoint}`;
};

export default API_ENDPOINTS;