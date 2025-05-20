import { BaseResponse, DateRange } from './common';

/**
 * Common optimization constraints
 */
export interface OptimizationConstraints {
  minWeight?: number;
  maxWeight?: number;
  targetReturn?: number;
  targetRisk?: number;
  riskFreeRate?: number;
  sectorConstraints?: {
    [sector: string]: {
      tickers: string[];
      maxWeight: number;
    };
  };
  assetClassConstraints?: {
    [assetClass: string]: {
      tickers: string[];
      maxWeight: number;
    };
  };
}

/**
 * Portfolio optimization request
 */
export interface OptimizationRequest {
  portfolioId?: string;
  tickers?: string[];
  weights?: { [ticker: string]: number };
  dateRange: DateRange;
  constraints: OptimizationConstraints;
}

/**
 * Efficient frontier point
 */
export interface EfficientFrontierPoint {
  return: number;
  risk: number;
  sharpe?: number;
  weights: { [ticker: string]: number };
}

/**
 * Efficient frontier request
 */
export interface EfficientFrontierRequest {
  portfolioId?: string;
  tickers?: string[];
  dateRange: DateRange;
  constraints: OptimizationConstraints;
  points?: number;
}

/**
 * Portfolio optimization result
 */
export interface OptimizationResponse extends BaseResponse {
  optimalWeights: { [ticker: string]: number };
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio?: number;
  efficientFrontier?: EfficientFrontierPoint[];
  riskContribution?: { [ticker: string]: number };
}

/**
 * Efficient frontier response
 */
export interface EfficientFrontierResponse extends BaseResponse {
  efficientFrontier: EfficientFrontierPoint[];
  minimumVariancePoint: EfficientFrontierPoint;
  maximumSharpePoint?: EfficientFrontierPoint;
}

/**
 * Advanced optimization request with additional parameters
 */
export interface AdvancedOptimizationRequest extends OptimizationRequest {
  // Additional parameters for advanced optimization methods

  // For robust optimization
  uncertaintyLevel?: number;

  // For cost-aware optimization
  currentWeights?: { [ticker: string]: number };
  transactionCosts?: { [ticker: string]: number };

  // For conditional optimization
  scenarios?: {
    [scenarioName: string]: {
      returns: { [ticker: string]: number[] };
      probability: number;
    }
  };

  // For ESG optimization
  esgScores?: { [ticker: string]: number };
  esgTarget?: number;

  // For hierarchical optimization
  assetGroups?: { [groupName: string]: string[] };
  groupWeights?: { [groupName: string]: number };
}