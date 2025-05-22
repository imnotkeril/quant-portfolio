/**
 * API endpoints definitions
 * Centralized endpoint URLs and parameters
 */
import {
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
  AUTH_API,
} from '../../constants/api';

/**
 * Portfolio endpoints
 */
export const portfolioEndpoints = {
  list: () => PORTFOLIO_API.LIST,
  details: (id: string) => PORTFOLIO_API.DETAILS(id),
  create: () => PORTFOLIO_API.CREATE,
  update: (id: string) => PORTFOLIO_API.UPDATE(id),
  delete: (id: string) => PORTFOLIO_API.DELETE(id),
  createFromText: () => PORTFOLIO_API.CREATE_FROM_TEXT,
  importCsv: () => PORTFOLIO_API.IMPORT_CSV,
  exportCsv: (id: string) => PORTFOLIO_API.EXPORT_CSV(id),
  updatePrices: (id: string) => PORTFOLIO_API.UPDATE_PRICES(id),
  addAsset: (id: string) => PORTFOLIO_API.ADD_ASSET(id),
  removeAsset: (id: string, ticker: string) => PORTFOLIO_API.REMOVE_ASSET(id, ticker),
};

/**
 * Asset endpoints
 */
export const assetEndpoints = {
  search: () => ASSET_API.SEARCH,
  historical: (ticker: string) => ASSET_API.HISTORICAL(ticker),
  info: (ticker: string) => ASSET_API.INFO(ticker),
  performance: (ticker: string) => ASSET_API.PERFORMANCE(ticker),
  validate: (ticker: string) => ASSET_API.VALIDATE(ticker),
  marketStatus: () => ASSET_API.MARKET_STATUS,
  sectorPerformance: () => ASSET_API.SECTOR_PERFORMANCE,
};

/**
 * Analytics endpoints
 */
export const analyticsEndpoints = {
  performance: () => ANALYTICS_API.PERFORMANCE,
  risk: () => ANALYTICS_API.RISK,
  returns: () => ANALYTICS_API.RETURNS,
  cumulativeReturns: () => ANALYTICS_API.CUMULATIVE_RETURNS,
  drawdowns: () => ANALYTICS_API.DRAWDOWNS,
  compare: () => ANALYTICS_API.COMPARE,
};

/**
 * Enhanced analytics endpoints
 */
export const enhancedAnalyticsEndpoints = {
  advancedMetrics: () => ENHANCED_ANALYTICS_API.ADVANCED_METRICS,
  rollingMetrics: () => ENHANCED_ANALYTICS_API.ROLLING_METRICS,
  seasonalPatterns: () => ENHANCED_ANALYTICS_API.SEASONAL_PATTERNS,
  confidenceIntervals: () => ENHANCED_ANALYTICS_API.CONFIDENCE_INTERVALS,
  tailRisk: () => ENHANCED_ANALYTICS_API.TAIL_RISK,
};

/**
 * Optimization endpoints
 */
export const optimizationEndpoints = {
  optimize: () => OPTIMIZATION_API.OPTIMIZE,
  efficientFrontier: () => OPTIMIZATION_API.EFFICIENT_FRONTIER,
  markowitz: () => OPTIMIZATION_API.MARKOWITZ,
  riskParity: () => OPTIMIZATION_API.RISK_PARITY,
  minimumVariance: () => OPTIMIZATION_API.MINIMUM_VARIANCE,
  maximumSharpe: () => OPTIMIZATION_API.MAXIMUM_SHARPE,
  equalWeight: () => OPTIMIZATION_API.EQUAL_WEIGHT,
};

/**
 * Advanced optimization endpoints
 */
export const advancedOptimizationEndpoints = {
  robust: () => ADVANCED_OPTIMIZATION_API.ROBUST,
  costAware: () => ADVANCED_OPTIMIZATION_API.COST_AWARE,
  conditional: () => ADVANCED_OPTIMIZATION_API.CONDITIONAL,
  esg: () => ADVANCED_OPTIMIZATION_API.ESG,
  hierarchical: () => ADVANCED_OPTIMIZATION_API.HIERARCHICAL,
};

/**
 * Risk management endpoints
 */
export const riskEndpoints = {
  var: () => RISK_API.VAR,
  cvar: () => RISK_API.CVAR,
  stressTest: () => RISK_API.STRESS_TEST,
  historicalStressTest: () => RISK_API.HISTORICAL_STRESS_TEST,
  customStressTest: () => RISK_API.CUSTOM_STRESS_TEST,
  advancedStressTest: () => RISK_API.ADVANCED_STRESS_TEST,
  monteCarlo: () => RISK_API.MONTE_CARLO,
  drawdowns: () => RISK_API.DRAWDOWNS,
  riskContribution: () => RISK_API.RISK_CONTRIBUTION,
};

/**
 * Scenario endpoints
 */
export const scenarioEndpoints = {
  list: () => SCENARIO_API.LIST,
  simulate: () => SCENARIO_API.SIMULATE,
  impact: () => SCENARIO_API.IMPACT,
  chain: () => SCENARIO_API.CHAIN,
  chainDetails: (name: string) => SCENARIO_API.CHAIN_DETAILS(name),
  deleteChain: (name: string) => SCENARIO_API.DELETE_CHAIN(name),
};

/**
 * Historical analysis endpoints
 */
export const historicalEndpoints = {
  list: () => HISTORICAL_API.LIST,
  context: () => HISTORICAL_API.CONTEXT,
  analogies: () => HISTORICAL_API.ANALOGIES,
  similarity: () => HISTORICAL_API.SIMILARITY,
  scenario: () => HISTORICAL_API.SCENARIO,
  deleteScenario: (key: string) => HISTORICAL_API.DELETE_SCENARIO(key),
};

/**
 * Comparison endpoints
 */
export const comparisonEndpoints = {
  compare: () => COMPARISON_API.COMPARE,
  composition: () => COMPARISON_API.COMPOSITION,
  performance: () => COMPARISON_API.PERFORMANCE,
  risk: () => COMPARISON_API.RISK,
  sectors: () => COMPARISON_API.SECTORS,
  differentialReturns: () => COMPARISON_API.DIFFERENTIAL_RETURNS,
  scenarios: () => COMPARISON_API.SCENARIOS,
};

/**
 * Report endpoints
 */
export const reportEndpoints = {
  generate: () => REPORT_API.GENERATE,
  compare: () => REPORT_API.COMPARE,
  schedule: () => REPORT_API.SCHEDULE,
  scheduled: () => REPORT_API.SCHEDULED,
  cancelScheduled: (id: string) => REPORT_API.CANCEL_SCHEDULED(id),
  history: () => REPORT_API.HISTORY,
  templates: () => REPORT_API.TEMPLATES,
  download: (id: string) => REPORT_API.DOWNLOAD(id),
};

/**
 * System endpoints
 */
export const systemEndpoints = {
  health: () => SYSTEM_API.HEALTH,
  info: () => SYSTEM_API.INFO,
  config: () => SYSTEM_API.CONFIG,
  ping: () => SYSTEM_API.PING,
};

/**
 * Authentication endpoints
 */
export const authEndpoints = {
  login: () => AUTH_API.LOGIN,
  refresh: () => AUTH_API.REFRESH,
  logout: () => AUTH_API.LOGOUT,
};

/**
 * All endpoints grouped by feature
 */
export const endpoints = {
  portfolio: portfolioEndpoints,
  asset: assetEndpoints,
  analytics: analyticsEndpoints,
  enhancedAnalytics: enhancedAnalyticsEndpoints,
  optimization: optimizationEndpoints,
  advancedOptimization: advancedOptimizationEndpoints,
  risk: riskEndpoints,
  scenario: scenarioEndpoints,
  historical: historicalEndpoints,
  comparison: comparisonEndpoints,
  report: reportEndpoints,
  system: systemEndpoints,
  auth: authEndpoints,
};

export default endpoints;