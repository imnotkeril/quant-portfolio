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
 * Risk action payloads
 */
export interface CalculateVaRPayload {
  portfolioId: string;
  returns: Record<string, number[]>;
  confidenceLevel?: number;
  timeHorizon?: number;
  simulations?: number;
  method?: 'parametric' | 'historical' | 'monte_carlo';
}

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
}

export interface PerformMonteCarloPayload {
  portfolioId: string;
  returns: Record<string, any>;
  initialValue?: number;
  years?: number;
  simulations?: number;
  annualContribution?: number;
}

export interface AnalyzeDrawdownsPayload {
  portfolioId: string;
  returns: Record<string, any>;
}

export interface CalculateRiskContributionPayload {
  portfolioId: string;
  returns: Record<string, any>;
  weights: Record<string, number>;
}

export interface SetRiskParamsPayload {
  params: Partial<RiskParams>;
}

export interface SetSelectedPortfolioPayload {
  portfolioId: string | null;
}

export interface SetSelectedAnalysisTypePayload {
  analysisType: RiskAnalysisType | null;
}

export interface SetSelectedScenariosPayload {
  scenarios: string[];
}

export interface SetSelectedConfidenceLevelsPayload {
  levels: number[];
}

export interface SetSelectedTimeHorizonsPayload {
  horizons: number[];
}