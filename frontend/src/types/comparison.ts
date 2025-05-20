import { BaseResponse, DateRange, TimeSeriesPoint } from './common';

/**
 * Portfolio comparison request
 */
export interface PortfolioComparisonRequest {
  portfolioIds: string[];
  dateRange: DateRange;
  benchmark?: string;
}

/**
 * Portfolio metrics in comparison
 */
export interface PortfolioComparisonMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta?: number;
  alpha?: number;
  [key: string]: number | undefined;
}

/**
 * Portfolio comparison response
 */
export interface PortfolioComparisonResponse extends BaseResponse {
  portfolios: {
    id: string;
    name: string;
    metrics: PortfolioComparisonMetrics;
    timeSeries: {
      cumulativeReturns: TimeSeriesPoint[];
      drawdowns: TimeSeriesPoint[];
    };
    holdings: {
      ticker: string;
      weight: number;
      sector?: string;
      assetClass?: string;
    }[];
  }[];
  benchmark?: {
    name: string;
    metrics: PortfolioComparisonMetrics;
    timeSeries: {
      cumulativeReturns: TimeSeriesPoint[];
      drawdowns: TimeSeriesPoint[];
    };
  };
}

/**
 * Benchmark comparison request
 */
export interface BenchmarkComparisonRequest {
  portfolioId: string;
  benchmarks: string[];
  dateRange: DateRange;
}

/**
 * Benchmark comparison response
 */
export interface BenchmarkComparisonResponse extends BaseResponse {
  portfolio: {
    id: string;
    name: string;
    metrics: PortfolioComparisonMetrics;
    timeSeries: {
      cumulativeReturns: TimeSeriesPoint[];
    };
  };
  benchmarks: {
    name: string;
    metrics: PortfolioComparisonMetrics;
    timeSeries: {
      cumulativeReturns: TimeSeriesPoint[];
    };
  }[];
  relativeMetrics: {
    [benchmarkName: string]: {
      excessReturn: number;
      trackingError: number;
      informationRatio: number;
      activePremium: number;
      upCapture: number;
      downCapture: number;
    };
  };
}

/**
 * Performance comparison request
 */
export interface PerformanceComparisonRequest {
  portfolioIds: string[];
  dateRange: DateRange;
  periods?: string[];
}

/**
 * Performance comparison response
 */
export interface PerformanceComparisonResponse extends BaseResponse {
  periodReturns: {
    period: string;
    returns: {
      [portfolioId: string]: number;
    };
  }[];
  cumulativeReturns: {
    portfolioId: string;
    name: string;
    timeSeries: TimeSeriesPoint[];
  }[];
  rollingReturns: {
    portfolioId: string;
    name: string;
    timeSeries: TimeSeriesPoint[];
  }[];
  performanceMetrics: {
    portfolioId: string;
    name: string;
    totalReturn: number;
    annualizedReturn: number;
    bestPeriod: { period: string; return: number };
    worstPeriod: { period: string; return: number };
  }[];
}

/**
 * Risk comparison request
 */
export interface RiskComparisonRequest {
  portfolioIds: string[];
  dateRange: DateRange;
  confidenceLevel?: number;
}

/**
 * Risk comparison response
 */
export interface RiskComparisonResponse extends BaseResponse {
  riskMetrics: {
    portfolioId: string;
    name: string;
    volatility: number;
    maxDrawdown: number;
    var: number;
    cvar: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
  }[];
  drawdowns: {
    portfolioId: string;
    name: string;
    timeSeries: TimeSeriesPoint[];
  }[];
  rollingVolatility: {
    portfolioId: string;
    name: string;
    timeSeries: TimeSeriesPoint[];
  }[];
  riskContribution: {
    portfolioId: string;
    name: string;
    assets: {
      ticker: string;
      weight: number;
      contribution: number;
    }[];
  }[];
}

/**
 * Holdings comparison request
 */
export interface HoldingsComparisonRequest {
  portfolioIds: string[];
}

/**
 * Holdings comparison response
 */
export interface HoldingsComparisonResponse extends BaseResponse {
  commonHoldings: {
    ticker: string;
    name?: string;
    sector?: string;
    weights: {
      [portfolioId: string]: number;
    };
  }[];
  uniqueHoldings: {
    portfolioId: string;
    name: string;
    holdings: {
      ticker: string;
      name?: string;
      sector?: string;
      weight: number;
    }[];
  }[];
  sectorAllocations: {
    portfolioId: string;
    name: string;
    sectors: {
      [sector: string]: number;
    };
  }[];
  assetClassAllocations: {
    portfolioId: string;
    name: string;
    assetClasses: {
      [assetClass: string]: number;
    };
  }[];
}