/**
 * Comparison store actions
 */
import {
  ComparisonActionTypes,
  ComparisonAction,
  ComparePortfoliosPayload,
  CompareCompositionPayload,
  ComparePerformancePayload,
  CompareRiskPayload,
  CompareSectorsPayload,
  CompareScenariosPayload,
  CalculateDifferentialPayload,
  ComparisonViewMode,
  ComparisonDisplayMode,
  ComparisonState,
} from './types';
import { ApiError } from '../../types/common';
import {
  PortfolioComparisonResponse,
  CompositionComparisonResponse,
  PerformanceComparisonResponse,
  RiskComparisonResponse,
  SectorComparisonResponse,
  ScenarioComparisonResponse,
  DifferentialReturnsResponse,
} from '../../types/comparison';
import { AppThunk } from '../index';
/**
 * Portfolio comparison actions
 */
export const comparePortfoliosRequest = (payload: ComparePortfoliosPayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST,
  payload,
});

export const comparePortfoliosSuccess = (
  comparisonId: string,
  data: PortfolioComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS,
  payload: { comparisonId, data },
});

export const comparePortfoliosFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE,
  payload: { error },
});

/**
 * Composition comparison actions
 */
export const compareCompositionRequest = (payload: CompareCompositionPayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_COMPOSITION_REQUEST,
  payload,
});

export const compareCompositionSuccess = (
  comparisonId: string,
  data: CompositionComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_COMPOSITION_SUCCESS,
  payload: { comparisonId, data },
});

export const compareCompositionFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_COMPOSITION_FAILURE,
  payload: { error },
});

/**
 * Performance comparison actions
 */
export const comparePerformanceRequest = (payload: ComparePerformancePayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST,
  payload,
});

export const comparePerformanceSuccess = (
  comparisonId: string,
  data: PerformanceComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_SUCCESS,
  payload: { comparisonId, data },
});

export const comparePerformanceFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE,
  payload: { error },
});

/**
 * Risk comparison actions
 */
export const compareRiskRequest = (payload: CompareRiskPayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_RISK_REQUEST,
  payload,
});

export const compareRiskSuccess = (
  comparisonId: string,
  data: RiskComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_RISK_SUCCESS,
  payload: { comparisonId, data },
});

export const compareRiskFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_RISK_FAILURE,
  payload: { error },
});

/**
 * Sector comparison actions
 */
export const compareSectorsRequest = (payload: CompareSectorsPayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SECTORS_REQUEST,
  payload,
});

export const compareSectorsSuccess = (
  comparisonId: string,
  data: SectorComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SECTORS_SUCCESS,
  payload: { comparisonId, data },
});

export const compareSectorsFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SECTORS_FAILURE,
  payload: { error },
});

/**
 * Scenario comparison actions
 */
export const compareScenariosRequest = (payload: CompareScenariosPayload): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SCENARIOS_REQUEST,
  payload,
});

export const compareScenariosSuccess = (
  comparisonId: string,
  data: ScenarioComparisonResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SCENARIOS_SUCCESS,
  payload: { comparisonId, data },
});

export const compareScenariosFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.COMPARE_SCENARIOS_FAILURE,
  payload: { error },
});

/**
 * Differential returns actions
 */
export const calculateDifferentialRequest = (payload: CalculateDifferentialPayload): ComparisonAction => ({
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_REQUEST,
  payload,
});

export const calculateDifferentialSuccess = (
  comparisonId: string,
  data: DifferentialReturnsResponse
): ComparisonAction => ({
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_SUCCESS,
  payload: { comparisonId, data },
});

export const calculateDifferentialFailure = (error: ApiError): ComparisonAction => ({
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_FAILURE,
  payload: { error },
});

/**
 * UI state actions
 */
export const setActiveComparison = (comparisonId: string | null): ComparisonAction => ({
  type: ComparisonActionTypes.SET_ACTIVE_COMPARISON,
  payload: comparisonId,
});

export const setSelectedPortfolios = (portfolioIds: string[]): ComparisonAction => ({
  type: ComparisonActionTypes.SET_SELECTED_PORTFOLIOS,
  payload: portfolioIds,
});

export const setBenchmarkPortfolio = (portfolioId: string | null): ComparisonAction => ({
  type: ComparisonActionTypes.SET_BENCHMARK_PORTFOLIO,
  payload: portfolioId,
});

export const setViewMode = (viewMode: ComparisonViewMode): ComparisonAction => ({
  type: ComparisonActionTypes.SET_VIEW_MODE,
  payload: viewMode,
});

export const setDisplayMode = (displayMode: ComparisonDisplayMode): ComparisonAction => ({
  type: ComparisonActionTypes.SET_DISPLAY_MODE,
  payload: displayMode,
});

export const setSelectedMetrics = (metrics: string[]): ComparisonAction => ({
  type: ComparisonActionTypes.SET_SELECTED_METRICS,
  payload: metrics,
});

export const setSelectedTimeframe = (timeframe: string): ComparisonAction => ({
  type: ComparisonActionTypes.SET_SELECTED_TIMEFRAME,
  payload: timeframe,
});

/**
 * Filter actions
 */
export const setFilters = (filters: Partial<ComparisonState['filters']>): ComparisonAction => ({
  type: ComparisonActionTypes.SET_FILTERS,
  payload: filters,
});

export const resetFilters = (): ComparisonAction => ({
  type: ComparisonActionTypes.RESET_FILTERS,
});

export const setDateRange = (startDate: string | null, endDate: string | null): ComparisonAction => ({
  type: ComparisonActionTypes.SET_DATE_RANGE,
  payload: { startDate, endDate },
});

/**
 * Parameters actions
 */
export const updateParameters = (parameters: Partial<ComparisonState['parameters']>): ComparisonAction => ({
  type: ComparisonActionTypes.UPDATE_PARAMETERS,
  payload: parameters,
});

export const resetParameters = (): ComparisonAction => ({
  type: ComparisonActionTypes.RESET_PARAMETERS,
});

/**
 * Cache management actions
 */
export const clearCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_CACHE,
});

export const clearComparisonCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_COMPARISON_CACHE,
});

export const clearCompositionCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_COMPOSITION_CACHE,
});

export const clearPerformanceCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_PERFORMANCE_CACHE,
});

export const clearRiskCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_RISK_CACHE,
});

export const clearSectorCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_SECTOR_CACHE,
});

export const clearScenarioCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_SCENARIO_CACHE,
});

export const clearDifferentialCache = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_DIFFERENTIAL_CACHE,
});

/**
 * Settings actions
 */
export const updateSettings = (settings: Partial<ComparisonState['settings']>): ComparisonAction => ({
  type: ComparisonActionTypes.UPDATE_SETTINGS,
  payload: settings,
});

export const resetSettings = (): ComparisonAction => ({
  type: ComparisonActionTypes.RESET_SETTINGS,
});

/**
 * General actions
 */
export const clearErrors = (): ComparisonAction => ({
  type: ComparisonActionTypes.CLEAR_ERRORS,
});

export const resetState = (): ComparisonAction => ({
  type: ComparisonActionTypes.RESET_STATE,
});

/**
 * Thunk action creators (for async operations)
 */
export const comparePortfolios = (payload: ComparePortfoliosPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_PORTFOLIOS',
    payload,
  };
};

export const compareComposition = (payload: CompareCompositionPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_COMPOSITION',
    payload,
  };
};

export const comparePerformance = (payload: ComparePerformancePayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_PERFORMANCE',
    payload,
  };
};

export const compareRisk = (payload: CompareRiskPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_RISK',
    payload,
  };
};

export const compareSectors = (payload: CompareSectorsPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_SECTORS',
    payload,
  };
};

export const compareScenarios = (payload: CompareScenariosPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'COMPARE_SCENARIOS',
    payload,
  };
};

export const calculateDifferential = (payload: CalculateDifferentialPayload) => {
  return {
    type: 'ASYNC_ACTION',
    action: 'CALCULATE_DIFFERENTIAL',
    payload,
  };
};