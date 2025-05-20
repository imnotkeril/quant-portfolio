import { BaseResponse, DateRange, TimeSeriesPoint, DrawdownPeriod } from './common';

/**
 * Request for portfolio analytics
 */
export interface AnalyticsRequest {
  portfolioId: string;
  dateRange: DateRange;
  benchmark?: string;
  riskFreeRate?: number;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  benchmarkValue?: number;
  difference?: number;
  period?: string;
  annualized?: boolean;
  description?: string;
}

/**
 * Risk metric
 */
export interface RiskMetric {
  name: string;
  value: number;
  benchmarkValue?: number;
  difference?: number;
  confidenceLevel?: number;
  period?: string;
  description?: string;
}

/**
 * Ratio metric
 */
export interface RatioMetric {
  name: string;
  value: number;
  benchmarkValue?: number;
  difference?: number;
  numerator?: number;
  denominator?: number;
  description?: string;
}

/**
 * Performance metrics response
 */
export interface PerformanceMetricsResponse extends BaseResponse {
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    alpha: number;
    informationRatio: number;
    winRate: number;
    bestMonth: number;
    worstMonth: number;
    [key: string]: number | string;
  };
  benchmarkMetrics?: {
    totalReturn: number;
    annualizedReturn: number;
    [key: string]: number | string;
  };
  timeSeries?: {
    returns: TimeSeriesPoint[];
    cumulativeReturns: TimeSeriesPoint[];
    benchmarkReturns?: TimeSeriesPoint[];
    benchmarkCumulativeReturns?: TimeSeriesPoint[];
  };
}

/**
 * Risk metrics response
 */
export interface RiskMetricsResponse extends BaseResponse {
  metrics: {
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    var95: number;
    cvar95: number;
    beta: number;
    upCapture: number;
    downCapture: number;
    [key: string]: number | string;
  };
  benchmarkMetrics?: {
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    [key: string]: number | string;
  };
  drawdowns?: DrawdownPeriod[];
  riskContribution?: { [ticker: string]: number };
}

/**
 * Returns response
 */
export interface ReturnsResponse extends BaseResponse {
  returns: TimeSeriesPoint[];
  benchmarkReturns?: TimeSeriesPoint[];
}

/**
 * Drawdown response
 */
export interface DrawdownResponse extends BaseResponse {
  drawdowns: DrawdownPeriod[];
  underwater: TimeSeriesPoint[];
  benchmarkUnderwater?: TimeSeriesPoint[];
}

/**
 * Request for comparing portfolios
 */
export interface ComparisonRequest {
  portfolioIds: string[];
  dateRange: DateRange;
  benchmark?: string;
  metrics?: string[];
}

/**
 * Comparison response
 */
export interface ComparisonResponse extends BaseResponse {
  portfolios: {
    id: string;
    name: string;
    metrics: {
      [metricName: string]: number;
    };
    timeSeries: {
      returns: TimeSeriesPoint[];
      cumulativeReturns: TimeSeriesPoint[];
    };
  }[];
  benchmark?: {
    name: string;
    metrics: {
      [metricName: string]: number;
    };
    timeSeries: {
      returns: TimeSeriesPoint[];
      cumulativeReturns: TimeSeriesPoint[];
    };
  };
}

/**
 * Rolling metrics response
 */
export interface RollingMetricsResponse extends BaseResponse {
  rollingMetrics: {
    [metricName: string]: TimeSeriesPoint[];
  };
  benchmarkRollingMetrics?: {
    [metricName: string]: TimeSeriesPoint[];
  };
}

/**
 * Confidence intervals response
 */
export interface ConfidenceIntervalsResponse extends BaseResponse {
  intervals: {
    [metricName: string]: {
      mean: number;
      lower: number;
      upper: number;
      confidenceLevel: number;
    };
  };
}

/**
 * Tail risk response
 */
export interface TailRiskResponse extends BaseResponse {
  tailRisk: {
    var: number;
    cvar: number;
    expectedShortfall: number;
    tailRatio: number;
    skewness: number;
    kurtosis: number;
    confidenceLevel: number;
  };
}

/**
 * Seasonal patterns response
 */
export interface SeasonalPatternsResponse extends BaseResponse {
  dailyPatterns: { [day: string]: number };
  monthlyPatterns: { [month: string]: number };
  quarterlyPatterns: { [quarter: string]: number };
}

/**
 * Statistics response
 */
export interface StatisticsResponse extends BaseResponse {
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
    isNormal: boolean;
    pValue: number;
    jarqueBera: number;
    autocorrelation: number;
    stationarity: boolean;
  };
}