/**
 * Risk types
 */
import { ApiResponse } from './common';

/**
 * Risk type
 */
export type RiskType =
  | 'market'
  | 'credit'
  | 'liquidity'
  | 'operational'
  | 'systematic'
  | 'unsystematic';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  id: string;
  portfolioId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskMetrics: Record<string, number>;
  riskBreakdown: Record<string, number>;
  riskTypes: Record<RiskType, number>;
  description?: string;
  createdAt: string;
}

/**
 * Stress Test Scenario
 */
export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  shocks: Record<string, number>;
  durationDays?: number;
  recoveryMultiplier?: number;
  isHistorical: boolean;
  historicalPeriod?: string;
  createdAt: string;
}

/**
 * Stress Test Result
 */
export interface StressTestResult {
  id: string;
  portfolioId: string;
  scenarioId: string;
  portfolioValue: number;
  postStressValue: number;
  lossAmount: number;
  lossPercentage: number;
  assetImpacts: Record<string, Record<string, any>>;
  recoveryDays?: number;
  recoveryMonths?: number;
  createdAt: string;
}

/**
 * VaR Request
 */
export interface VaRRequest {
  returns: Record<string, number[]>;
  confidenceLevel?: number;
  timeHorizon?: number;
  simulations?: number;
}

/**
 * VaR Response
 */
export interface VaRResponse {
  var: number;
  method: string;
  confidenceLevel: number;
  timeHorizon?: number;
  simulations?: number;
}

/**
 * Stress Test Request
 */
export interface StressTestRequest {
  returns?: Record<string, any>;
  scenario: string;
  portfolioValue?: number;
  dataFetcher?: any;
  currentPortfolioTickers?: string[];
  weights?: Record<string, number>;
  portfolioData?: Record<string, any>;
}

/**
 * Custom Stress Test Request
 */
export interface CustomStressTestRequest {
  returns: Record<string, any>;
  weights: Record<string, number>;
  shocks: Record<string, number>;
  portfolioValue?: number;
}

/**
 * Advanced Stress Test Request
 */
export interface AdvancedStressTestRequest {
  returns: Record<string, any>;
  weights: Record<string, number>;
  customShocks: Record<string, any>;
  assetSectors?: Record<string, string>;
  portfolioValue?: number;
  correlationAdjusted?: boolean;
  useBeta?: boolean;
}

/**
 * Stress Test Response
 */
export interface StressTestResponse {
  scenario?: string;
  scenarioName?: string;
  scenarioDescription?: string;
  period?: string;
  shockPercentage: number;
  portfolioValue: number;
  portfolioLoss: number;
  portfolioAfterShock: number;
  recoveryDays?: number;
  recoveryMonths?: number;
  positionImpacts?: Record<string, any>;
  indexPriceChange?: number;
  stdDeviations?: number;
  shockDurationDays?: number;
  errorMsg?: string;
}

/**
 * Monte Carlo Request
 */
export interface MonteCarloRequest {
  returns: Record<string, any>;
  initialValue?: number;
  years?: number;
  simulations?: number;
  annualContribution?: number;
}

/**
 * Monte Carlo Response
 */
export interface MonteCarloResponse {
  initialValue: number;
  years: number;
  simulations: number;
  annualContribution: number;
  annualMeanReturn: number;
  annualVolatility: number;
  percentiles: Record<string, number>;
  probabilities: Record<string, number>;
  simulationSummary: Record<string, any>;
  simulationDataSample?: number[][];
}

/**
 * Drawdown Request
 */
export interface DrawdownRequest {
  returns: Record<string, any>;
}

/**
 * Drawdown Period
 */
export interface DrawdownPeriod {
  startDate: string;
  valleyDate: string;
  recoveryDate?: string;
  depth: number;
  length: number;
  recovery?: number;
}

/**
 * Drawdown Response
 */
export interface DrawdownResponse {
  drawdownPeriods: DrawdownPeriod[];
  underwaterSeries: Record<string, number>;
  maxDrawdown?: number;
  avgDrawdown?: number;
  avgRecoveryTime?: number;
  painIndex?: number;
  painRatio?: number;
  ulcerIndex?: number;
}

/**
 * Risk Contribution Request
 */
export interface RiskContributionRequest {
  returns: Record<string, any>;
  weights: Record<string, number>;
}

/**
 * Risk Contribution Response
 */
export interface RiskContributionResponse {
  riskContributions: Record<string, number>;
  marginalContributions?: Record<string, number>;
  percentageContributions?: Record<string, number>;
  diversificationRatio?: number;
  portfolioVolatility?: number;
}

/**
 * API VaR Response
 */
export type ApiVaRResponse = ApiResponse<VaRResponse>;

/**
 * API Stress Test Response
 */
export type ApiStressTestResponse = ApiResponse<StressTestResponse>;

/**
 * API Monte Carlo Response
 */
export type ApiMonteCarloResponse = ApiResponse<MonteCarloResponse>;

/**
 * API Drawdown Response
 */
export type ApiDrawdownResponse = ApiResponse<DrawdownResponse>;

/**
 * API Risk Contribution Response
 */
export type ApiRiskContributionResponse = ApiResponse<RiskContributionResponse>;