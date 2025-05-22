/**
 * Analytics types
 */
import { ApiResponse, TimeFrame } from './common';

/**
 * Analytics Request
 */
export interface AnalyticsRequest {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  riskFreeRate?: number;
  periodsPerYear?: number;
}

/**
 * Metric Response
 */
export interface MetricResponse {
  name: string;
  value: number;
  description?: string;
}

/**
 * Performance Metric Response
 */
export interface PerformanceMetricResponse extends MetricResponse {
  period?: string;
  annualized?: boolean;
  benchmarkValue?: number;
}

/**
 * Risk Metric Response
 */
export interface RiskMetricResponse extends MetricResponse {
  confidenceLevel?: number;
  period?: string;
}

/**
 * Ratio Metric Response
 */
export interface RatioMetricResponse extends MetricResponse {
  numerator?: number;
  denominator?: number;
}

/**
 * Metrics Group Response
 */
export interface MetricsGroupResponse {
  groupName: string;
  metrics: Array<MetricResponse | PerformanceMetricResponse | RiskMetricResponse | RatioMetricResponse>;
}

/**
 * Performance Metrics Response
 */
export interface PerformanceMetricsResponse {
  totalReturn: number;
  annualizedReturn: number;
  periodReturns: Record<string, number>;
  riskMetrics: Record<string, number>;
  ratioMetrics: Record<string, number>;
  benchmarkComparison?: Record<string, any>;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  metricsGroups?: MetricsGroupResponse[];
}

/**
 * Risk Metrics Response
 */
export interface RiskMetricsResponse {
  volatility: number;
  maxDrawdown: number;
  var95: number;
  cvar95: number;
  var99?: number;
  cvar99?: number;
  downsideDeviation?: number;
  skewness?: number;
  kurtosis?: number;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Returns Response
 */
export interface ReturnsResponse {
  returns: Record<string, number[]>;
  dates: string[];
  portfolioId: string;
  benchmarkId?: string;
  period: string;
  method: string;
}

/**
 * Cumulative Returns Response
 */
export interface CumulativeReturnsResponse {
  cumulativeReturns: Record<string, number[]>;
  dates: string[];
  portfolioId: string;
  benchmarkId?: string;
  base: number;
}

/**
 * Drawdowns Response
 */
export interface DrawdownsResponse {
  drawdowns: Record<string, number[]>;
  dates: string[];
  portfolioId: string;
  benchmarkId?: string;
  maxDrawdown: number;
  maxDrawdownDate: string;
}

/**
 * Rolling Metrics Request
 */
export interface RollingMetricsRequest extends AnalyticsRequest {
  window: number;
  metrics: string[];
  minPeriods?: number;
}

/**
 * Rolling Metrics Response
 */
export interface RollingMetricsResponse {
  rollingMetrics: Record<string, Record<string, number[]>>;
  dates: string[];
  portfolioId: string;
  benchmarkId?: string;
  window: number;
}

/**
 * Enhanced Analytics Request
 */
export interface EnhancedAnalyticsRequest extends AnalyticsRequest {
  confidenceLevel?: number;
  targetReturn?: number;
}

/**
 * Omega Ratio Response
 */
export interface OmegaRatioResponse {
  omegaRatio: number;
  threshold: number;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Tail Risk Response
 */
export interface TailRiskResponse {
  var95: number;
  cvar95: number;
  var99: number;
  cvar99: number;
  extremeLossProbability: number;
  tailRiskMetrics: Record<string, number>;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Seasonal Analysis Response
 */
export interface SeasonalAnalysisResponse {
  monthlyReturns: Record<string, Record<string, number>>;
  weekdayReturns: Record<string, number>;
  quarterlyReturns: Record<string, number>;
  monthlyHeatmapData: Record<string, any>;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Confidence Intervals Response
 */
export interface ConfidenceIntervalsResponse {
  meanReturn: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
  portfolioId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Comparison Response
 */
export interface ComparisonResponse {
  portfolio1Id: string;
  portfolio2Id: string;
  benchmarkId?: string;
  performanceMetrics: Record<string, Record<string, number>>;
  riskMetrics: Record<string, Record<string, number>>;
  ratioMetrics: Record<string, Record<string, number>>;
  cumulativeReturns?: Record<string, Record<string, number[]>>;
  drawdowns?: Record<string, Record<string, number[]>>;
  startDate?: string;
  endDate?: string;
}

/**
 * API Analytics Response
 */
export type ApiPerformanceMetricsResponse = ApiResponse<PerformanceMetricsResponse>;

/**
 * API Risk Metrics Response
 */
export type ApiRiskMetricsResponse = ApiResponse<RiskMetricsResponse>;

/**
 * API Returns Response
 */
export type ApiReturnsResponse = ApiResponse<ReturnsResponse>;

/**
 * API Rolling Metrics Response
 */
export type ApiRollingMetricsResponse = ApiResponse<RollingMetricsResponse>;