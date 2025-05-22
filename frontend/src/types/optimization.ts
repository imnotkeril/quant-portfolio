/**
 * Optimization types
 */
import { ApiResponse } from './common';

/**
 * Optimization method
 */
export type OptimizationMethod =
  | 'markowitz'
  | 'risk_parity'
  | 'minimum_variance'
  | 'maximum_sharpe'
  | 'equal_weight'
  | 'robust'
  | 'conditional'
  | 'hierarchical'
  | 'esg'
  | 'cost_aware';

/**
 * Base Optimization Request
 */
export interface OptimizationRequest {
  portfolioId?: string;
  tickers?: string[];
  startDate?: string;
  endDate?: string;
  riskFreeRate?: number;
  minWeight?: number;
  maxWeight?: number;
  constraints?: Record<string, any>;
  createOptimizedPortfolio?: boolean;
  targetReturn?: number;
  targetRisk?: number;
}

/**
 * Efficient Frontier Request
 */
export interface EfficientFrontierRequest extends OptimizationRequest {
  points?: number;
  riskRange?: [number, number];
  returnRange?: [number, number];
}

/**
 * Markowitz Request
 */
export interface MarkowitzRequest extends OptimizationRequest {
  targetReturn?: number;
  targetRisk?: number;
}

/**
 * Risk Parity Request
 */
export interface RiskParityRequest extends OptimizationRequest {
  riskBudget?: Record<string, number>;
}

/**
 * Optimization Result
 */
export interface OptimizationResult {
  weights: Record<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio?: number;
  additionalMetrics?: Record<string, any>;
}

/**
 * Optimization Response
 */
export interface OptimizationResponse {
  optimizationMethod: string;
  tickers: string[];
  startDate: string;
  endDate: string;
  riskFreeRate: number;
  optimalWeights: Record<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  performanceMetrics: Record<string, any>;
  efficientFrontier?: Array<{
    return: number;
    risk: number;
    sharpeRatio?: number;
    weights?: Record<string, number>;
  }>;
  optimizedPortfolioId?: string;
}

/**
 * Efficient Frontier Point
 */
export interface EfficientFrontierPoint {
  risk: number;
  return: number;
  sharpe?: number;
  weights?: Record<string, number>;
}

/**
 * Efficient Frontier Response
 */
export interface EfficientFrontierResponse {
  tickers: string[];
  startDate: string;
  endDate: string;
  riskFreeRate: number;
  efficientFrontier: EfficientFrontierPoint[];
  minVariancePortfolio: OptimizationResult;
  maxSharpePortfolio: OptimizationResult;
  maxReturnPortfolio: OptimizationResult;
  equalWeightPortfolio?: OptimizationResult;
  currentPortfolio?: OptimizationResult;
}

/**
 * Advanced Optimization Request
 */
export interface AdvancedOptimizationRequest extends OptimizationRequest {}

/**
 * Robust Optimization Request
 */
export interface RobustOptimizationRequest extends AdvancedOptimizationRequest {
  uncertaintyLevel?: number;
}

/**
 * Cost Aware Optimization Request
 */
export interface CostAwareOptimizationRequest extends AdvancedOptimizationRequest {
  currentWeights: Record<string, number>;
  transactionCosts: Record<string, number>;
}

/**
 * Conditional Optimization Request
 */
export interface ConditionalOptimizationRequest extends AdvancedOptimizationRequest {
  scenarios: Record<string, any>;
  scenarioProbabilities: Record<string, number>;
}

/**
 * ESG Optimization Request
 */
export interface ESGOptimizationRequest extends AdvancedOptimizationRequest {
  esgScores: Record<string, number>;
  esgTarget?: number;
}

/**
 * Hierarchical Optimization Request
 */
export interface HierarchicalOptimizationRequest extends AdvancedOptimizationRequest {
  assetGroups: Record<string, string[]>;
  groupWeights?: Record<string, number>;
}

/**
 * API Optimization Response
 */
export type ApiOptimizationResponse = ApiResponse<OptimizationResponse>;

/**
 * API Efficient Frontier Response
 */
export type ApiEfficientFrontierResponse = ApiResponse<EfficientFrontierResponse>;