/**
 * Comparison store types
 */
import {
  PortfolioComparisonResponse,
  CompositionComparisonResponse,
  PerformanceComparisonResponse,
  RiskComparisonResponse,
  SectorComparisonResponse,
  ScenarioComparisonResponse,
  DifferentialReturnsResponse,
  PortfolioComparisonRequest,
  CompositionComparisonRequest,
  PerformanceComparisonRequest,
  RiskComparisonRequest,
  SectorComparisonRequest,
  ScenarioComparisonRequest,
  DifferentialReturnsRequest,
} from '../../types/comparison';
import { ApiError } from '../../types/common';

/**
 * Comparison analysis state
 */
export interface ComparisonState {
  // Loading states
  comparisonLoading: boolean;
  compositionLoading: boolean;
  performanceLoading: boolean;
  riskLoading: boolean;
  sectorLoading: boolean;
  scenarioLoading: boolean;
  differentialLoading: boolean;

  // Data
  comparisons: Record<string, PortfolioComparisonResponse>;
  compositionComparisons: Record<string, CompositionComparisonResponse>;
  performanceComparisons: Record<string, PerformanceComparisonResponse>;
  riskComparisons: Record<string, RiskComparisonResponse>;
  sectorComparisons: Record<string, SectorComparisonResponse>;
  scenarioComparisons: Record<string, ScenarioComparisonResponse>;
  differentialReturns: Record<string, DifferentialReturnsResponse>;

  // Current comparison
  activeComparison: string | null;
  selectedPortfolios: string[];
  benchmarkPortfolio: string | null;

  // UI state
  viewMode: ComparisonViewMode;
  displayMode: ComparisonDisplayMode;
  selectedMetrics: string[];
  selectedTimeframe: string;

  // Filters and grouping
  filters: {
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
    includeOnly: string[];
    excludeMetrics: string[];
    minDifference: number;
  };

  // Comparison parameters
  parameters: {
    confidenceLevel: number;
    includeStatisticalTests: boolean;
    adjustForRisk: boolean;
    normalizeReturns: boolean;
    includeBenchmark: boolean;
  };

  // Cache
  cache: {
    comparisonCache: Record<string, { data: PortfolioComparisonResponse; timestamp: number }>;
    compositionCache: Record<string, { data: CompositionComparisonResponse; timestamp: number }>;
    performanceCache: Record<string, { data: PerformanceComparisonResponse; timestamp: number }>;
    riskCache: Record<string, { data: RiskComparisonResponse; timestamp: number }>;
    sectorCache: Record<string, { data: SectorComparisonResponse; timestamp: number }>;
    scenarioCache: Record<string, { data: ScenarioComparisonResponse; timestamp: number }>;
    differentialCache: Record<string, { data: DifferentialReturnsResponse; timestamp: number }>;
  };

  // Errors
  errors: {
    comparison: ApiError | null;
    composition: ApiError | null;
    performance: ApiError | null;
    risk: ApiError | null;
    sector: ApiError | null;
    scenario: ApiError | null;
    differential: ApiError | null;
  };

  // Settings
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    cacheTimeout: number;
    maxComparisons: number;
    defaultMetrics: string[];
    enableNotifications: boolean;
  };
}

/**
 * Comparison view modes
 */
export type ComparisonViewMode =
  | 'overview'
  | 'detailed'
  | 'side_by_side'
  | 'matrix'
  | 'charts';

/**
 * Comparison display modes
 */
export type ComparisonDisplayMode =
  | 'absolute'
  | 'relative'
  | 'percentage'
  | 'normalized';

/**
 * Comparison action types
 */
export enum ComparisonActionTypes {
  // Comprehensive comparison actions
  COMPARE_PORTFOLIOS_REQUEST = 'comparison/COMPARE_PORTFOLIOS_REQUEST',
  COMPARE_PORTFOLIOS_SUCCESS = 'comparison/COMPARE_PORTFOLIOS_SUCCESS',
  COMPARE_PORTFOLIOS_FAILURE = 'comparison/COMPARE_PORTFOLIOS_FAILURE',

  // Composition comparison actions
  COMPARE_COMPOSITION_REQUEST = 'comparison/COMPARE_COMPOSITION_REQUEST',
  COMPARE_COMPOSITION_SUCCESS = 'comparison/COMPARE_COMPOSITION_SUCCESS',
  COMPARE_COMPOSITION_FAILURE = 'comparison/COMPARE_COMPOSITION_FAILURE',

  // Performance comparison actions
  COMPARE_PERFORMANCE_REQUEST = 'comparison/COMPARE_PERFORMANCE_REQUEST',
  COMPARE_PERFORMANCE_SUCCESS = 'comparison/COMPARE_PERFORMANCE_SUCCESS',
  COMPARE_PERFORMANCE_FAILURE = 'comparison/COMPARE_PERFORMANCE_FAILURE',

  // Risk comparison actions
  COMPARE_RISK_REQUEST = 'comparison/COMPARE_RISK_REQUEST',
  COMPARE_RISK_SUCCESS = 'comparison/COMPARE_RISK_SUCCESS',
  COMPARE_RISK_FAILURE = 'comparison/COMPARE_RISK_FAILURE',

  // Sector comparison actions
  COMPARE_SECTORS_REQUEST = 'comparison/COMPARE_SECTORS_REQUEST',
  COMPARE_SECTORS_SUCCESS = 'comparison/COMPARE_SECTORS_SUCCESS',
  COMPARE_SECTORS_FAILURE = 'comparison/COMPARE_SECTORS_FAILURE',

  // Scenario comparison actions
  COMPARE_SCENARIOS_REQUEST = 'comparison/COMPARE_SCENARIOS_REQUEST',
  COMPARE_SCENARIOS_SUCCESS = 'comparison/COMPARE_SCENARIOS_SUCCESS',
  COMPARE_SCENARIOS_FAILURE = 'comparison/COMPARE_SCENARIOS_FAILURE',

  // Differential returns actions
  CALCULATE_DIFFERENTIAL_REQUEST = 'comparison/CALCULATE_DIFFERENTIAL_REQUEST',
  CALCULATE_DIFFERENTIAL_SUCCESS = 'comparison/CALCULATE_DIFFERENTIAL_SUCCESS',
  CALCULATE_DIFFERENTIAL_FAILURE = 'comparison/CALCULATE_DIFFERENTIAL_FAILURE',

  // UI state actions
  SET_ACTIVE_COMPARISON = 'comparison/SET_ACTIVE_COMPARISON',
  SET_SELECTED_PORTFOLIOS = 'comparison/SET_SELECTED_PORTFOLIOS',
  SET_BENCHMARK_PORTFOLIO = 'comparison/SET_BENCHMARK_PORTFOLIO',
  SET_VIEW_MODE = 'comparison/SET_VIEW_MODE',
  SET_DISPLAY_MODE = 'comparison/SET_DISPLAY_MODE',
  SET_SELECTED_METRICS = 'comparison/SET_SELECTED_METRICS',
  SET_SELECTED_TIMEFRAME = 'comparison/SET_SELECTED_TIMEFRAME',

  // Filter actions
  SET_FILTERS = 'comparison/SET_FILTERS',
  RESET_FILTERS = 'comparison/RESET_FILTERS',
  SET_DATE_RANGE = 'comparison/SET_DATE_RANGE',

  // Parameters actions
  UPDATE_PARAMETERS = 'comparison/UPDATE_PARAMETERS',
  RESET_PARAMETERS = 'comparison/RESET_PARAMETERS',

  // Cache actions
  CLEAR_CACHE = 'comparison/CLEAR_CACHE',
  CLEAR_COMPARISON_CACHE = 'comparison/CLEAR_COMPARISON_CACHE',
  CLEAR_COMPOSITION_CACHE = 'comparison/CLEAR_COMPOSITION_CACHE',
  CLEAR_PERFORMANCE_CACHE = 'comparison/CLEAR_PERFORMANCE_CACHE',
  CLEAR_RISK_CACHE = 'comparison/CLEAR_RISK_CACHE',
  CLEAR_SECTOR_CACHE = 'comparison/CLEAR_SECTOR_CACHE',
  CLEAR_SCENARIO_CACHE = 'comparison/CLEAR_SCENARIO_CACHE',
  CLEAR_DIFFERENTIAL_CACHE = 'comparison/CLEAR_DIFFERENTIAL_CACHE',

  // Settings actions
  UPDATE_SETTINGS = 'comparison/UPDATE_SETTINGS',
  RESET_SETTINGS = 'comparison/RESET_SETTINGS',

  // General actions
  CLEAR_ERRORS = 'comparison/CLEAR_ERRORS',
  RESET_STATE = 'comparison/RESET_STATE',
}

/**
 * Request payload types
 */
export interface ComparePortfoliosPayload {
  request: PortfolioComparisonRequest;
  comparisonId: string;
}

export interface CompareCompositionPayload {
  request: CompositionComparisonRequest;
  comparisonId: string;
}

export interface ComparePerformancePayload {
  request: PerformanceComparisonRequest;
  comparisonId: string;
}

export interface CompareRiskPayload {
  request: RiskComparisonRequest;
  comparisonId: string;
}

export interface CompareSectorsPayload {
  request: SectorComparisonRequest;
  comparisonId: string;
}

export interface CompareScenariosPayload {
  request: ScenarioComparisonRequest;
  comparisonId: string;
}

export interface CalculateDifferentialPayload {
  request: DifferentialReturnsRequest;
  comparisonId: string;
}

/**
 * Comparison action interfaces
 */
export interface ComparePortfoliosRequestAction {
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_REQUEST;
  payload: ComparePortfoliosPayload;
}

export interface ComparePortfoliosSuccessAction {
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_SUCCESS;
  payload: {
    comparisonId: string;
    data: PortfolioComparisonResponse;
  };
}

export interface ComparePortfoliosFailureAction {
  type: ComparisonActionTypes.COMPARE_PORTFOLIOS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CompareCompositionRequestAction {
  type: ComparisonActionTypes.COMPARE_COMPOSITION_REQUEST;
  payload: CompareCompositionPayload;
}

export interface CompareCompositionSuccessAction {
  type: ComparisonActionTypes.COMPARE_COMPOSITION_SUCCESS;
  payload: {
    comparisonId: string;
    data: CompositionComparisonResponse;
  };
}

export interface CompareCompositionFailureAction {
  type: ComparisonActionTypes.COMPARE_COMPOSITION_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface ComparePerformanceRequestAction {
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_REQUEST;
  payload: ComparePerformancePayload;
}

export interface ComparePerformanceSuccessAction {
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_SUCCESS;
  payload: {
    comparisonId: string;
    data: PerformanceComparisonResponse;
  };
}

export interface ComparePerformanceFailureAction {
  type: ComparisonActionTypes.COMPARE_PERFORMANCE_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CompareRiskRequestAction {
  type: ComparisonActionTypes.COMPARE_RISK_REQUEST;
  payload: CompareRiskPayload;
}

export interface CompareRiskSuccessAction {
  type: ComparisonActionTypes.COMPARE_RISK_SUCCESS;
  payload: {
    comparisonId: string;
    data: RiskComparisonResponse;
  };
}

export interface CompareRiskFailureAction {
  type: ComparisonActionTypes.COMPARE_RISK_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CompareSectorsRequestAction {
  type: ComparisonActionTypes.COMPARE_SECTORS_REQUEST;
  payload: CompareSectorsPayload;
}

export interface CompareSectorsSuccessAction {
  type: ComparisonActionTypes.COMPARE_SECTORS_SUCCESS;
  payload: {
    comparisonId: string;
    data: SectorComparisonResponse;
  };
}

export interface CompareSectorsFailureAction {
  type: ComparisonActionTypes.COMPARE_SECTORS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CompareScenariosRequestAction {
  type: ComparisonActionTypes.COMPARE_SCENARIOS_REQUEST;
  payload: CompareScenariosPayload;
}

export interface CompareScenariosSuccessAction {
  type: ComparisonActionTypes.COMPARE_SCENARIOS_SUCCESS;
  payload: {
    comparisonId: string;
    data: ScenarioComparisonResponse;
  };
}

export interface CompareScenariosFailureAction {
  type: ComparisonActionTypes.COMPARE_SCENARIOS_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface CalculateDifferentialRequestAction {
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_REQUEST;
  payload: CalculateDifferentialPayload;
}

export interface CalculateDifferentialSuccessAction {
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_SUCCESS;
  payload: {
    comparisonId: string;
    data: DifferentialReturnsResponse;
  };
}

export interface CalculateDifferentialFailureAction {
  type: ComparisonActionTypes.CALCULATE_DIFFERENTIAL_FAILURE;
  payload: {
    error: ApiError;
  };
}

export interface SetActiveComparisonAction {
  type: ComparisonActionTypes.SET_ACTIVE_COMPARISON;
  payload: string | null;
}

export interface SetSelectedPortfoliosAction {
  type: ComparisonActionTypes.SET_SELECTED_PORTFOLIOS;
  payload: string[];
}

export interface SetBenchmarkPortfolioAction {
  type: ComparisonActionTypes.SET_BENCHMARK_PORTFOLIO;
  payload: string | null;
}

export interface SetViewModeAction {
  type: ComparisonActionTypes.SET_VIEW_MODE;
  payload: ComparisonViewMode;
}

export interface SetDisplayModeAction {
  type: ComparisonActionTypes.SET_DISPLAY_MODE;
  payload: ComparisonDisplayMode;
}

export interface SetSelectedMetricsAction {
  type: ComparisonActionTypes.SET_SELECTED_METRICS;
  payload: string[];
}

export interface SetSelectedTimeframeAction {
  type: ComparisonActionTypes.SET_SELECTED_TIMEFRAME;
  payload: string;
}

export interface SetFiltersAction {
  type: ComparisonActionTypes.SET_FILTERS;
  payload: Partial<ComparisonState['filters']>;
}

export interface ResetFiltersAction {
  type: ComparisonActionTypes.RESET_FILTERS;
}

export interface SetDateRangeAction {
  type: ComparisonActionTypes.SET_DATE_RANGE;
  payload: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface UpdateParametersAction {
  type: ComparisonActionTypes.UPDATE_PARAMETERS;
  payload: Partial<ComparisonState['parameters']>;
}

export interface ResetParametersAction {
  type: ComparisonActionTypes.RESET_PARAMETERS;
}

export interface ClearCacheAction {
  type: ComparisonActionTypes.CLEAR_CACHE;
}

export interface ClearComparisonCacheAction {
  type: ComparisonActionTypes.CLEAR_COMPARISON_CACHE;
}

export interface ClearCompositionCacheAction {
  type: ComparisonActionTypes.CLEAR_COMPOSITION_CACHE;
}

export interface ClearPerformanceCacheAction {
  type: ComparisonActionTypes.CLEAR_PERFORMANCE_CACHE;
}

export interface ClearRiskCacheAction {
  type: ComparisonActionTypes.CLEAR_RISK_CACHE;
}

export interface ClearSectorCacheAction {
  type: ComparisonActionTypes.CLEAR_SECTOR_CACHE;
}

export interface ClearScenarioCacheAction {
  type: ComparisonActionTypes.CLEAR_SCENARIO_CACHE;
}

export interface ClearDifferentialCacheAction {
  type: ComparisonActionTypes.CLEAR_DIFFERENTIAL_CACHE;
}

export interface UpdateSettingsAction {
  type: ComparisonActionTypes.UPDATE_SETTINGS;
  payload: Partial<ComparisonState['settings']>;
}

export interface ResetSettingsAction {
  type: ComparisonActionTypes.RESET_SETTINGS;
}

export interface ClearErrorsAction {
  type: ComparisonActionTypes.CLEAR_ERRORS;
}

export interface ResetStateAction {
  type: ComparisonActionTypes.RESET_STATE;
}

/**
 * Comparison action union type
 */
export type ComparisonAction =
  | ComparePortfoliosRequestAction
  | ComparePortfoliosSuccessAction
  | ComparePortfoliosFailureAction
  | CompareCompositionRequestAction
  | CompareCompositionSuccessAction
  | CompareCompositionFailureAction
  | ComparePerformanceRequestAction
  | ComparePerformanceSuccessAction
  | ComparePerformanceFailureAction
  | CompareRiskRequestAction
  | CompareRiskSuccessAction
  | CompareRiskFailureAction
  | CompareSectorsRequestAction
  | CompareSectorsSuccessAction
  | CompareSectorsFailureAction
  | CompareScenariosRequestAction
  | CompareScenariosSuccessAction
  | CompareScenariosFailureAction
  | CalculateDifferentialRequestAction
  | CalculateDifferentialSuccessAction
  | CalculateDifferentialFailureAction
  | SetActiveComparisonAction
  | SetSelectedPortfoliosAction
  | SetBenchmarkPortfolioAction
  | SetViewModeAction
  | SetDisplayModeAction
  | SetSelectedMetricsAction
  | SetSelectedTimeframeAction
  | SetFiltersAction
  | ResetFiltersAction
  | SetDateRangeAction
  | UpdateParametersAction
  | ResetParametersAction
  | ClearCacheAction
  | ClearComparisonCacheAction
  | ClearCompositionCacheAction
  | ClearPerformanceCacheAction
  | ClearRiskCacheAction
  | ClearSectorCacheAction
  | ClearScenarioCacheAction
  | ClearDifferentialCacheAction
  | UpdateSettingsAction
  | ResetSettingsAction
  | ClearErrorsAction
  | ResetStateAction;