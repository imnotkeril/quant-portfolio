/**
 * Risk store actions
 */
import {
  RiskActionTypes,
  RiskAction,
  CalculateVaRPayload,
  PerformStressTestPayload,
  PerformMonteCarloPayload,
  AnalyzeDrawdownsPayload,
  CalculateRiskContributionPayload,
  RiskAnalysisType,
  RiskState,
} from './types';
import { ApiError } from '../../types/common';
import {
  VaRResponse,
  StressTestResponse,
  MonteCarloResponse,
  DrawdownResponse,
  RiskContributionResponse,
} from '../../types/risk';

/**
 * VaR calculation actions
 */
export const calculateVaRRequest = (payload: CalculateVaRPayload): RiskAction => ({
  type: RiskActionTypes.CALCULATE_VAR_REQUEST,
  payload,
});

export const calculateVaRSuccess = (
  portfolioId: string,
  data: VaRResponse
): RiskAction => ({
  type: RiskActionTypes.CALCULATE_VAR_SUCCESS,
  payload: { portfolioId, data },
});

export const calculateVaRFailure = (error: ApiError): RiskAction => ({
  type: RiskActionTypes.CALCULATE_VAR_FAILURE,
  payload: { error },
});

/**
 * Stress test actions
 */
export const performStressTestRequest = (payload: PerformStressTestPayload): RiskAction => ({
  type: RiskActionTypes.PERFORM_STRESS_TEST_REQUEST,
  payload,
});

export const performStressTestSuccess = (
  portfolioId: string,
  data: StressTestResponse
): RiskAction => ({
  type: RiskActionTypes.PERFORM_STRESS_TEST_SUCCESS,
  payload: { portfolioId, data },
});

export const performStressTestFailure = (error: ApiError): RiskAction => ({
  type: RiskActionTypes.PERFORM_STRESS_TEST_FAILURE,
  payload: { error },
});

/**
 * Monte Carlo simulation actions
 */
export const performMonteCarloRequest = (payload: PerformMonteCarloPayload): RiskAction => ({
  type: RiskActionTypes.PERFORM_MONTE_CARLO_REQUEST,
  payload,
});

export const performMonteCarloSuccess = (
  portfolioId: string,
  data: MonteCarloResponse
): RiskAction => ({
  type: RiskActionTypes.PERFORM_MONTE_CARLO_SUCCESS,
  payload: { portfolioId, data },
});

export const performMonteCarloFailure = (error: ApiError): RiskAction => ({
  type: RiskActionTypes.PERFORM_MONTE_CARLO_FAILURE,
  payload: { error },
});

/**
 * Drawdown analysis actions
 */
export const analyzeDrawdownsRequest = (payload: AnalyzeDrawdownsPayload): RiskAction => ({
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_REQUEST,
  payload,
});

export const analyzeDrawdownsSuccess = (
  portfolioId: string,
  data: DrawdownResponse
): RiskAction => ({
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_SUCCESS,
  payload: { portfolioId, data },
});

export const analyzeDrawdownsFailure = (error: ApiError): RiskAction => ({
  type: RiskActionTypes.ANALYZE_DRAWDOWNS_FAILURE,
  payload: { error },
});

/**
 * Risk contribution actions
 */
export const calculateRiskContributionRequest = (payload: CalculateRiskContributionPayload): RiskAction => ({
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_REQUEST,
  payload,
});

export const calculateRiskContributionSuccess = (
  portfolioId: string,
  data: RiskContributionResponse
): RiskAction => ({
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_SUCCESS,
  payload: { portfolioId, data },
});

export const calculateRiskContributionFailure = (error: ApiError): RiskAction => ({
  type: RiskActionTypes.CALCULATE_RISK_CONTRIBUTION_FAILURE,
  payload: { error },
});

/**
 * UI state actions
 */
export const setCurrentPortfolio = (portfolioId: string | null): RiskAction => ({
  type: RiskActionTypes.SET_CURRENT_PORTFOLIO,
  payload: portfolioId,
});

export const setCurrentAnalysisType = (analysisType: RiskAnalysisType | null): RiskAction => ({
  type: RiskActionTypes.SET_CURRENT_ANALYSIS_TYPE,
  payload: analysisType,
});

export const setSelectedScenarios = (scenarios: string[]): RiskAction => ({
  type: RiskActionTypes.SET_SELECTED_SCENARIOS,
  payload: scenarios,
});

export const setSelectedConfidenceLevels = (levels: number[]): RiskAction => ({
  type: RiskActionTypes.SET_SELECTED_CONFIDENCE_LEVELS,
  payload: levels,
});

export const setSelectedTimeHorizons = (horizons: number[]): RiskAction => ({
  type: RiskActionTypes.SET_SELECTED_TIME_HORIZONS,
  payload: horizons,
});

/**
 * Cache management actions
 */
export const clearCache = (): RiskAction => ({
  type: RiskActionTypes.CLEAR_CACHE,
});

export const clearVaRCache = (): RiskAction => ({
  type: RiskActionTypes.CLEAR_VAR_CACHE,
});

export const clearStressTestCache = (): RiskAction => ({
  type: RiskActionTypes.CLEAR_STRESS_TEST_CACHE,
});

export const clearMonteCarloCache = (): RiskAction => ({
  type: RiskActionTypes.CLEAR_MONTE_CARLO_CACHE,
});

/**
 * Settings actions
 */
export const updateSettings = (settings: Partial<RiskState['settings']>): RiskAction => ({
  type: RiskActionTypes.UPDATE_SETTINGS,
  payload: settings,
});

export const resetSettings = (): RiskAction => ({
  type: RiskActionTypes.RESET_SETTINGS,
});

/**
 * General actions
 */
export const clearErrors = (): RiskAction => ({
  type: RiskActionTypes.CLEAR_ERRORS,
});

export const resetState = (): RiskAction => ({
  type: RiskActionTypes.RESET_STATE,
});

/**
 * Thunk action creators (for async operations)
 */
export const calculateVaR = (payload: CalculateVaRPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'CALCULATE_VAR',
    payload,
  };
};

export const performStressTest = (payload: PerformStressTestPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'PERFORM_STRESS_TEST',
    payload,
  };
};

export const performMonteCarlo = (payload: PerformMonteCarloPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'PERFORM_MONTE_CARLO',
    payload,
  };
};

export const analyzeDrawdowns = (payload: AnalyzeDrawdownsPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'ANALYZE_DRAWDOWNS',
    payload,
  };
};

export const calculateRiskContribution = (payload: CalculateRiskContributionPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'CALCULATE_RISK_CONTRIBUTION',
    payload,
  };
};