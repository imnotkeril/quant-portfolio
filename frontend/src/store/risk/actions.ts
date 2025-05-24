/**
 * Risk state types
 */
import {
  VaRResponse,
  StressTestResponse,
  MonteCarloResponse,
  DrawdownResponse,
  RiskContributionResponse,
} from '../../types/risk';

/**
 * Risk analysis types
 */
export type RiskAnalysisType =
  | 'var'
  | 'stress_test'
  | 'monte_carlo'
  | 'drawdowns'
  | 'risk_contribution';

/**
 * Risk state interface
 */
export interface RiskState {
  // VaR analysis
  varResults: Record<string, VaRResponse>;
  varLoading: boolean;
  varError: string | null;

  // Stress test analysis
  stressTestResults: Record<string, StressTestResponse>;
  stressTestLoading: boolean;
  stressTestError: string | null;

  // Monte Carlo simulation
  monteCarloResults: Record<string, MonteCarloResponse>;
  monteCarloLoading: boolean;
  monteCarloError: string | null;

  // Drawdown analysis
  drawdownResults: Record<string, DrawdownResponse>;
  drawdownsLoading: boolean;
  drawdownsError: string | null;

  // Risk contribution analysis
  riskContributionResults: Record<string, RiskContributionResponse>;
  riskContributionLoading: boolean;
  riskContributionError: string | null;

  // UI state
  selectedPortfolioId: string | null;
  selectedAnalysisType: RiskAnalysisType | null;
  selectedScenarios: string[];
  selectedConfidenceLevels: number[];
  selectedTimeHorizons: number[];
  riskParams: RiskParams;
}

/**
 * Risk analysis parameters
 */
export interface RiskParams {
  confidenceLevel: number;
  timeHorizon: number;
  simulations: number;
  startDate: string | null;
  endDate: string | null;
  riskFreeRate: number;
}

/**
 * Calculate VaR payload
 */
export interface CalculateVaRPayload {
  portfolioId: string;
  returns: Record<string, number[]>;
  confidenceLevel?: number;
  timeHorizon?: number;
  simulations?: number;
  method?: 'parametric' | 'historical' | 'monte_carlo';
}

/**
 * Perform stress test payload
 */
export interface PerformStressTestPayload {
  portfolioId: string;
  scenario: string;
  returns?: Record<string, any>;
  portfolioValue?: number;
  dataFetcher?: any;
  currentPortfolioTickers?: string[];
  weights?: Record<string, number>;
  portfolioData?: Record<string, any>;
  testType?: 'historical' | 'custom' | 'advanced';

  // For custom stress test
  shocks?: Record<string, number>;

  // For advanced stress test
  customShocks?: Record<string, any>;
  assetSectors?: Record<string, string>;
  correlationAdjusted?: boolean;
  useBeta?: boolean;
}

/**
 * Perform Monte Carlo payload
 */
export interface PerformMonteCarloPayload {
  portfolioId: string;
  returns: Record<string, any>;
  initialValue?: number;
  years?: number;
  simulations?: number;
  annualContribution?: number;
}

/**
 * Analyze drawdowns payload
 */
export interface AnalyzeDrawdownsPayload {
  portfolioId: string;
  returns: Record<string, any>;
}

/**
 * Calculate risk contribution payload
 */
export interface CalculateRiskContributionPayload {
  portfolioId: string;
  returns: Record<string, any>;
  weights: Record<string, number>;
}

/**
 * Set risk params payload
 */
export interface SetRiskParamsPayload {
  params: Partial<RiskParams>;
}

/**
 * Set selected portfolio payload
 */
export interface SetSelectedPortfolioPayload {
  portfolioId: string | null;
}

/**
 * Set selected analysis type payload
 */
export interface SetSelectedAnalysisTypePayload {
  analysisType: RiskAnalysisType | null;
}

/**
 * Set selected scenarios payload
 */
export interface SetSelectedScenariosPayload {
  scenarios: string[];
}

/**
 * Set selected confidence levels payload
 */
export interface SetSelectedConfidenceLevelsPayload {
  levels: number[];
}

/**
 * Set selected time horizons payload
 */
export interface SetSelectedTimeHorizonsPayload {
  horizons: number[];
}