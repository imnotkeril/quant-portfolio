/**
 * Historical state types
 */
import {
  HistoricalScenariosResponse,
  HistoricalContextResponse,
  HistoricalAnalogiesResponse,
  HistoricalSimilarityResponse,
  HistoricalEvent,
  MarketRegime,
} from '../../types/historical';

/**
 * Historical state interface
 */
export interface HistoricalState {
  // Scenarios
  scenarios: string[];
  scenariosLoading: boolean;
  scenariosError: string | null;

  // Context
  contextData: Record<string, HistoricalContextResponse>;
  contextLoading: boolean;
  contextError: string | null;

  // Analogies
  analogiesData: Record<string, HistoricalAnalogiesResponse>;
  analogiesLoading: boolean;
  analogiesError: string | null;

  // Similarity
  similarityData: Record<string, HistoricalSimilarityResponse>;
  similarityLoading: boolean;
  similarityError: string | null;

  // Events and regimes
  historicalEvents: Record<string, HistoricalEvent>;
  marketRegimes: Record<string, MarketRegime>;

  // UI state
  currentScenarioKey: string | null;
  selectedAnalogies: string[];
  currentMarketData: any | null;
  viewMode: HistoricalViewMode;
  selectedTimeRange: TimeRange;
  comparisonMode: boolean;

  // Analysis parameters
  analysisParams: AnalysisParams;
}

/**
 * Historical view modes
 */
export type HistoricalViewMode =
  | 'timeline'
  | 'analogies'
  | 'context'
  | 'comparison'
  | 'search';

/**
 * Time range for historical analysis
 */
export interface TimeRange {
  start: number;
  end: number;
  label: string;
}

/**
 * Analysis parameters
 */
export interface AnalysisParams {
  similarityThreshold: number;
  maxAnalogies: number;
  includedMetrics: string[];
  weightings: Record<string, number>;
  autoLoadContext: boolean;
  cacheTimeout: number;
}

/**
 * Action payloads
 */
export interface LoadContextPayload {
  scenarioKey: string;
}

export interface FindAnalogiesPayload {
  currentMarketData: any;
  metrics?: string[];
  cacheKey: string;
}

export interface CalculateSimilarityPayload {
  currentData: Record<string, any>;
  historicalData: Record<string, any>;
  metrics?: string[];
  cacheKey: string;
}

export interface AddScenarioPayload {
  key: string;
  name: string;
  period: string;
  triggerEvents: string[];
  keyIndicators: Array<Record<string, string>>;
  marketImpact: Record<string, string>;
  policyResponse: string[];
  lessonsLearned: string[];
  earlyWarningSigns: string[];
  mostResilientAssets: string[];
  mostAffectedAssets: string[];
}

export interface DeleteScenarioPayload {
  key: string;
}

export interface PerformSearchPayload {
  query: string;
  filters: {
    timeRange?: [number, number];
    eventTypes: string[];
    regions: string[];
    assetClasses: string[];
    severityLevels: string[];
  };
}