import { BaseResponse } from './common';

/**
 * Market condition
 */
export interface MarketCondition {
  indicator: string;
  value: number;
  description: string;
}

/**
 * Policy response
 */
export interface PolicyResponse {
  actor: string;
  action: string;
  date: string;
  impact: string;
}

/**
 * Market impact
 */
export interface MarketImpact {
  asset: string;
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
}

/**
 * Historical context
 */
export interface HistoricalContext {
  id: string;
  name: string;
  period: string;
  triggerEvents: string[];
  keyIndicators: MarketCondition[];
  marketImpacts: MarketImpact[];
  policyResponses: PolicyResponse[];
  description: string;
  aftermath: string;
  timeline: { date: string; event: string }[];
}

/**
 * Historical context request
 */
export interface HistoricalContextRequest {
  scenarioKey: string;
}

/**
 * Historical context response
 */
export interface HistoricalContextResponse extends BaseResponse {
  context: HistoricalContext;
}

/**
 * Market data point for analogy finding
 */
export interface MarketDataPoint {
  indicator: string;
  value: number;
  weight?: number;
}

/**
 * Historical analogies request
 */
export interface HistoricalAnalogiesRequest {
  currentMarketData: MarketDataPoint[];
  usePortfolioWeights?: boolean;
  portfolioId?: string;
  metricWeights?: { [metric: string]: number };
}

/**
 * Historical analogy
 */
export interface HistoricalAnalogy {
  period: string;
  name: string;
  similarityScore: number;
  description: string;
  indicators: { [indicator: string]: { current: number; historical: number; difference: number } };
  subsequentPerformance: { [period: string]: number };
  keyEvents: { date: string; event: string }[];
}

/**
 * Historical analogies response
 */
export interface HistoricalAnalogiesResponse extends BaseResponse {
  analogies: HistoricalAnalogy[];
  currentConditions: { [indicator: string]: number };
  methodology: string;
}