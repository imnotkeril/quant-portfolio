/**
 * Risk store types
 */
import {
  VaRResponse,
  StressTestResponse,
  MonteCarloResponse,
  DrawdownResponse,
  RiskContributionResponse,
  StressTestRequest,
  MonteCarloRequest,
  VaRRequest,
  DrawdownRequest,
  RiskContributionRequest,
} from '../../types/risk';
import { ApiError } from '../../types/common';

/**
 * Risk analysis state
 */
export interface RiskState {
  // Loading states
  varLoading: boolean;
  stressTestLoading: boolean;
  monteCarloLoading: boolean;
  drawdownsLoading: boolean;
  riskContributionLoading: boolean;

  // Data
  varResults: Record<string, VaRResponse>;
  stressTestResults: Record<string, StressTestResponse>;
  monteCarloResults: Record<string, MonteCarloResponse>;
  drawdownResults: Record<string, DrawdownResponse>;
  riskContributionResults: Record<string, RiskContributionResponse>;

  // Current analysis
  currentPortfolioId: string | null;
  currentAnalysisType: RiskAnalysisType | null;

  // UI state
  selectedScenarios: string[];
  selectedConfidenceLevels: number[];
  selectedTimeHorizons: number[];

  // Cache
  cache: {
    varCache: Record<string, { data: VaRResponse; timestamp: number }>;
    stressTestCache: Record<string, { data: StressTestResponse; timestamp: number }>;
    monteCarloCache: Record<string, { data: MonteCarloResponse; timestamp: number }>;
  };

  // Errors
  errors: {
    var: ApiError | null;
    stressTest: ApiError | null;
    monteCarlo: ApiError | null;
    drawdowns: ApiError | null;
    riskContribution: ApiError | null;
  };

  // Settings
  settings: {
    defaultConfidenceLevel: number;
    defaultTimeHorizon: number;
    defaultSimulations: number;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

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
 * Risk action types
 */
export enum RiskActionTypes {
  // VaR actions
  CALCULATE_VAR_REQUEST = 'risk/CALCULATE_VAR_REQUEST',
  CALCULATE_VAR_SUCCESS = 'risk/CALCULATE_VAR_SUCCESS',
  CALCULATE_VAR_FAILURE = 'risk/CALCULATE_VAR_FAILURE',

  // Stress test actions
  PERFORM_STRESS_TEST_REQUEST = 'risk/PERFORM_STRESS_TEST_REQUEST',
  PERFORM_STRESS_TEST_SUCCESS = 'risk/PERFORM_STRESS_TEST_SUCCESS',
  PERFORM_STRESS_TEST_FAILURE = 'risk/PERFORM_STRESS_TEST_FAILURE',

  // Monte Carlo actions
  PERFORM_MONTE_CARLO_REQUEST = 'risk/PERFORM_MONTE_CARLO_REQUEST',
  PERFORM_MONTE_CARLO_SUCCESS = 'risk/PERFORM_MONTE_CARLO_SUCCESS',
  PERFORM_MONTE_CARLO_FAILURE = 'risk/PERFORM_MONTE_CARLO_FAILURE',

  // Drawdown actions
  ANALYZE_DRAWDOWNS_REQUEST = 'risk/ANALYZE_DRAWDOWNS_REQUEST',
  ANALYZE_DRAWDOWNS_SUCCESS = 'risk/ANALYZE_DRAWDOWNS_SUCCESS',
  ANALYZE_DRAWDOWNS_FAILURE = 'risk/ANALYZE_DRAWDOWNS_FAILURE',

  // Risk contribution actions
  CALCULATE_RISK_CONTRIBUTION_REQUEST = 'risk/CALCULATE_RISK_CONTRIBUTION_REQUEST',
  CALCULATE_RISK_CONTRIBUTION_SUCCESS = 'risk/CALCULATE_RISK_CONTRIBUTION_SUCCESS',
  CALCULATE_RISK_CONTRIBUTION_FAILURE = 'risk/CALCULATE_RISK_CONTRIBUTION_FAILURE',

  // UI actions
  SET_CURRENT_PORTFOLIO = 'risk/SET_CURRENT_PORTFOLIO',
  SET_CURRENT_ANALYSIS_TYPE = 'risk/SET_CURRENT_ANALYSIS_TYPE',
  SET_SELECTED_SCENARIOS = 'risk/SET_SELECTED_SCENARIOS',
  SET_SELECTED_CONFIDENCE_LEVELS = 'risk/SET_SELECTED_CONFIDENCE_LEVELS',
  SET_SELECTED_TIME_HORIZONS = 'risk/SET_SELECTED_TIME_HORIZONS',

  // Cache actions
  CLEAR_CACHE = 'risk/CLEAR_CACHE',
  CLEAR_VAR_CACHE = 'risk/CLEAR_VAR_CACHE',
  CLEAR_STRESS_TEST_CACHE = 'risk/CLEAR_STRESS_TEST_CACHE',
  CLEAR_MONTE_CARLO_CACHE = 'risk/CLEAR_MONTE_CARLO_CACHE',

  // Settings actions
  UPDATE_SETTINGS = 'risk/UPDATE_SETTINGS',
  RESET_SETTINGS = 'risk/RESET_SETTINGS',

  // General actions
  CLEAR_ERRORS = 'risk/CLEAR_ERRORS',
  RESET_STATE = 'risk/RESET_STATE',
}

/**
 * VaR calculation payload
 */
export interface CalculateVaRPayload {
  request: VaRRequest;
  method?: 'parametric' | 'historical' | 'monte_carlo';
  portfolioId: string;
}

/**
 * Stress test payload
 */
export interface PerformStressTestPayload {
  request: StressTestRequest;
  portfolioId: string;
  testType?: 'historical' | 'custom' | 'advanced';
}

/**
 * Monte Carlo payload
 */
export interface PerformMonteCarloPayload {
  request: MonteCarloRequest;
  portfolioId: string;
}

/**
 * Drawdown analysis payload
 */
export interface AnalyzeDrawdownsPayload {
  request: DrawdownRequest;
  portfolioId: string;
}

/**
 * Risk contribution payload
 */
export interface CalculateRiskContributionPayload {
  request: RiskContributionRequest;
  portfolioId: string;
}

/**
 * Risk action interfaces
 */
export interface CalculateVaRRequestAction {
  type: RiskActionTypes.CALCULATE_VAR_REQUEST;
  payload: CalculateVaRPayload;
}

export interface CalculateVaRSuccessAction {
  type: RiskActionTypes.CALCULATE_VAR_SUCCESS;
  payload: {
    portfolioId: string;
    data: VaRResponse;
  };
}

export interface CalculateVaRFailureAction {
  type: RiskActionTypes.CALCULATE_VAR_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface PerformStressTestRequestAction {
  type: RiskActionTypes.PERFORM_STRESS_TEST_REQUEST;
  payload: PerformStressTestPayload;
}

export interface PerformStressTestSuccessAction {
  type: RiskActionTypes.PERFORM_STRESS_TEST_SUCCESS;
  payload: {
    portfolioId: string;
    data: StressTestResponse;
  };
}

export interface PerformStressTestFailureAction {
  type: RiskActionTypes.PERFORM_STRESS_TEST_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface PerformMonteCarloRequestAction {
  type: RiskActionTypes.PERFORM_MONTE_CARLO_REQUEST;
  payload: PerformMonteCarloPayload;
}

export interface PerformMonteCarloSuccessAction {
  type: RiskActionTypes.PERFORM_MONTE_CARLO_SUCCESS;
  payload: {
    portfolioId: string;
    data: MonteCarloResponse;
  };
}

export interface PerformMonteCarloFailureAction {
  type: RiskActionTypes.PERFORM_MONTE_CARLO_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface AnalyzeDrawdownsRequestAction {
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_REQUEST;
  payload: AnalyzeDrawdownsPayload;
}

export interface AnalyzeDrawdownsSuccessAction {
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_SUCCESS;
  payload: {
    portfolioId: string;
    data: DrawdownResponse;
  };
}

export interface AnalyzeDrawdownsFailureAction {
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CalculateRiskContributionRequestAction {
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_REQUEST;
  payload: CalculateRiskContributionPayload;
}

export interface CalculateRiskContributionSuccessAction {
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_SUCCESS;
  payload: {
    portfolioId: string;
    data: RiskContributionResponse;
  };
}

export interface CalculateRiskContributionFailureAction {
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface SetCurrentPortfolioAction {
  type: RiskActionTypes.SET_CURRENT_PORTFOLIO;
  payload: string | null;
}

export interface SetCurrentAnalysisTypeAction {
  type: RiskActionTypes.SET_CURRENT_ANALYSIS_TYPE;
  payload: RiskAnalysisType | null;
}

export interface SetSelectedScenariosAction {
  type: RiskActionTypes.SET_SELECTED_SCENARIOS;
  payload: string[];
}

export interface SetSelectedConfidenceLevelsAction {
  type: RiskActionTypes.SET_SELECTED_CONFIDENCE_LEVELS;
  payload: number[];
}

export interface SetSelectedTimeHorizonsAction {
  type: RiskActionTypes.SET_SELECTED_TIME_HORIZONS;
  payload: number[];
}

export interface ClearCacheAction {
  type: RiskActionTypes.CLEAR_CACHE;
}

export interface ClearVaRCacheAction {
  type: RiskActionTypes.CLEAR_VAR_CACHE;
}

export interface ClearStressTestCacheAction {
  type: RiskActionTypes.CLEAR_STRESS_TEST_CACHE;
}

export interface ClearMonteCarloCacheAction {
  type: RiskActionTypes.CLEAR_MONTE_CARLO_CACHE;
}

export interface UpdateSettingsAction {
  type: RiskActionTypes.UPDATE_SETTINGS;
  payload: Partial<RiskState['settings']>;
}

export interface ResetSettingsAction {
  type: RiskActionTypes.RESET_SETTINGS;
}

export interface ClearErrorsAction {
  type: RiskActionTypes.CLEAR_ERRORS;
}

export interface ResetStateAction {
  type: RiskActionTypes.RESET_STATE;
}

/**
 * Risk action union type
 */
export type RiskAction =
  | CalculateVaRRequestAction
  | CalculateVaRSuccessAction
  | CalculateVaRFailureAction
  | PerformStressTestRequestAction
  | PerformStressTestSuccessAction
  | PerformStressTestFailureAction
  | PerformMonteCarloRequestAction
  | PerformMonteCarloSuccessAction
  | PerformMonteCarloFailureAction
  | AnalyzeDrawdownsRequestAction
  | AnalyzeDrawdownsSuccessAction
  | AnalyzeDrawdownsFailureAction
  | CalculateRiskContributionRequestAction
  | CalculateRiskContributionSuccessAction
  | CalculateRiskContributionFailureAction
  | SetCurrentPortfolioAction
  | SetCurrentAnalysisTypeAction
  | SetSelectedScenariosAction
  | SetSelectedConfidenceLevelsAction
  | SetSelectedTimeHorizonsAction
  | ClearCacheAction
  | ClearVaRCacheAction
  | ClearStressTestCacheAction
  | ClearMonteCarloCacheAction
  | UpdateSettingsAction
  | ResetSettingsAction
  | ClearErrorsAction
  | ResetStateAction;