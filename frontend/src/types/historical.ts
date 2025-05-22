/**
 * Historical analysis types
 */
import { ApiResponse } from './common';

/**
 * Historical Scenarios Response
 */
export interface HistoricalScenariosResponse {
  scenarios: string[];
}

/**
 * Historical Context Request
 */
export interface HistoricalContextRequest {
  scenarioKey: string;
}

/**
 * Key Indicator
 */
export interface KeyIndicator {
  name: string;
  value: string;
  normal: string;
}

/**
 * Historical Context
 */
export interface HistoricalContext {
  name: string;
  period: string;
  triggerEvents: string[];
  keyIndicators: KeyIndicator[];
  marketImpact: Record<string, string>;
  policyResponse: string[];
  lessonsLearned: string[];
  earlyWarningSigns: string[];
  mostResilientAssets: string[];
  mostAffectedAssets: string[];
  currentParallels?: string[];
}

/**
 * Historical Context Response
 */
export interface HistoricalContextResponse {
  context: HistoricalContext;
  scenarioKey: string;
}

/**
 * Historical Analogies Request
 */
export interface HistoricalAnalogiesRequest {
  currentMarketData: Record<string, any>;
  metrics?: string[];
}

/**
 * Historical Analogy
 */
export interface HistoricalAnalogy {
  period: string;
  event: string;
  similarity: number;
  keySimilarities: string[];
  keyDifferences: string[];
  outcome: string;
  lessons: string[];
  recommendedActions: string[];
}

/**
 * Historical Analogies Response
 */
export interface HistoricalAnalogiesResponse {
  analogies: HistoricalAnalogy[];
  currentRegime: string;
  disclaimer: string;
}

/**
 * Historical Similarity Request
 */
export interface HistoricalSimilarityRequest {
  currentData: Record<string, any>;
  historicalData: Record<string, any>;
  metrics?: string[];
  weights?: Record<string, number>;
}

/**
 * Historical Similarity Response
 */
export interface HistoricalSimilarityResponse {
  similarityScore: number;
  currentDataId: string;
  historicalDataId: string;
  metricScores?: Record<string, number>;
}

/**
 * Historical Scenario Request
 */
export interface HistoricalScenarioRequest {
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

/**
 * Historical Event
 */
export interface HistoricalEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  triggerEvents: string[];
  keyIndicators: Array<Record<string, any>>;
  marketImpact: Record<string, string>;
  policyResponse: string[];
  lessonsLearned: string[];
  earlyWarningSigns: string[];
  mostResilientAssets: string[];
  mostAffectedAssets: string[];
  description: string;
  tags: string[];
  createdAt: string;
}

/**
 * Market Regime
 */
export interface MarketRegime {
  id: string;
  name: string;
  description: string;
  characteristics: Record<string, any>;
  indicators: Array<Record<string, any>>;
  typicalAssetPerformance: Record<string, number>;
  historicalExamples: string[];
  transitionIndicators: string[];
  tags: string[];
  createdAt: string;
}

/**
 * Historical Analogy Data
 */
export interface HistoricalAnalogyData {
  id: string;
  currentRegimeId?: string;
  historicalEventId?: string;
  similarityScore: number;
  similarityFactors: Record<string, number>;
  recommendations: string[];
  createdAt: string;
}

/**
 * API Historical Scenarios Response
 */
export type ApiHistoricalScenariosResponse = ApiResponse<HistoricalScenariosResponse>;

/**
 * API Historical Context Response
 */
export type ApiHistoricalContextResponse = ApiResponse<HistoricalContextResponse>;

/**
 * API Historical Analogies Response
 */
export type ApiHistoricalAnalogiesResponse = ApiResponse<HistoricalAnalogiesResponse>;

/**
 * API Historical Similarity Response
 */
export type ApiHistoricalSimilarityResponse = ApiResponse<HistoricalSimilarityResponse>;