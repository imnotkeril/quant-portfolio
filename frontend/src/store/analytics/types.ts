/**
 * Analytics state types
 */
import {
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  CumulativeReturnsResponse,
  DrawdownsResponse,
  RollingMetricsResponse,
  ComparisonResponse,
} from '../../types/analytics';

/**
 * Analytics state interface
 */
export interface AnalyticsState {
  // Performance metrics
  performanceMetrics: PerformanceMetricsResponse | null;
  performanceLoading: boolean;
  performanceError: string | null;

  // Risk metrics
  riskMetrics: RiskMetricsResponse | null;
  riskLoading: boolean;
  riskError: string | null;

  // Returns data
  returns: ReturnsResponse | null;
  returnsLoading: boolean;
  returnsError: string | null;

  // Cumulative returns
  cumulativeReturns: CumulativeReturnsResponse | null;
  cumulativeReturnsLoading: boolean;
  cumulativeReturnsError: string | null;

  // Drawdowns
  drawdowns: DrawdownsResponse | null;
  drawdownsLoading: boolean;
  drawdownsError: string | null;

  // Rolling metrics
  rollingMetrics: RollingMetricsResponse | null;
  rollingMetricsLoading: boolean;
  rollingMetricsError: string | null;

  // Portfolio comparison
  comparison: ComparisonResponse | null;
  comparisonLoading: boolean;
  comparisonError: string | null;

  // UI state
  selectedPortfolioId: string | null;
  selectedBenchmark: string | null;
  selectedTimeframe: string;
  selectedMetrics: string[];
  analysisParams: AnalysisParams;
}

/**
 * Analysis parameters
 */
export interface AnalysisParams {
  startDate: string | null;
  endDate: string | null;
  riskFreeRate: number;
  periodsPerYear: number;
  confidenceLevel: number;
  rollingWindow: number;
}

/**
 * Analytics action payloads
 */
export interface LoadPerformanceMetricsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  riskFreeRate?: number;
  periodsPerYear?: number;
}

export interface LoadRiskMetricsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  riskFreeRate?: number;
  periodsPerYear?: number;
}

export interface LoadReturnsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  period?: string;
  method?: string;
}

export interface LoadCumulativeReturnsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
  method?: string;
}

export interface LoadDrawdownsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
}

export interface LoadRollingMetricsPayload {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  window: number;
  metrics: string[];
  minPeriods?: number;
}

export interface LoadComparisonPayload {
  portfolio1Id: string;
  portfolio2Id: string;
  startDate?: string;
  endDate?: string;
  benchmark?: string;
}

export interface SetAnalysisParamsPayload {
  params: Partial<AnalysisParams>;
}

export interface SetSelectedPortfolioPayload {
  portfolioId: string | null;
}

export interface SetSelectedBenchmarkPayload {
  benchmark: string | null;
}

export interface SetSelectedTimeframePayload {
  timeframe: string;
}

export interface SetSelectedMetricsPayload {
  metrics: string[];
}