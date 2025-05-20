import { BaseResponse, DateRange } from './common';

/**
 * Value at Risk request
 */
export interface VaRRequest {
  portfolioId: string;
  dateRange: DateRange;
  confidenceLevel?: number;
  horizon?: number;
}

/**
 * Value at Risk response
 */
export interface VaRResponse extends BaseResponse {
  value: number;
  confidenceLevel: number;
  horizon: number;
  method: string;
  percentageOfPortfolio: number;
  absoluteValue: number;
}

/**
 * Historical scenario for stress testing
 */
export interface HistoricalScenario {
  id: string;
  name: string;
  description: string;
  period: string;
  maxLossPercentage: number;
  recoveryMonths: number;
  assetImpacts: { [ticker: string]: number };
  sectorImpacts: { [sector: string]: number };
}

/**
 * Custom shock for stress testing
 */
export interface CustomShock {
  market?: number;
  sectors?: { [sector: string]: number };
  assets?: { [ticker: string]: number };
}

/**
 * Stress test request
 */
export interface StressTestRequest {
  portfolioId: string;
  portfolioValue?: number;
  scenario?: string;
  customShocks?: CustomShock;
  useCorrelations?: boolean;
  useBeta?: boolean;
}

/**
 * Position impact in stress test
 */
export interface PositionImpact {
  ticker: string;
  weight: number;
  priceChange: number;
  positionValue: number;
  positionLoss: number;
  beta?: number;
}

/**
 * Sector impact in stress test
 */
export interface SectorImpact {
  sector: string;
  weight: number;
  priceChange: number;
  value: number;
  loss: number;
  tickers: string[];
}

/**
 * Stress test response
 */
export interface StressTestResponse extends BaseResponse {
  scenario?: string;
  scenarioName?: string;
  period?: string;
  scenarioDescription?: string;
  portfolioValue: number;
  portfolioLoss: number;
  shockPercentage: number;
  portfolioAfterShock: number;
  recoveryMonths: number;
  positionImpacts: { [ticker: string]: PositionImpact };
  sectorImpacts?: { [sector: string]: SectorImpact };
}

/**
 * Monte Carlo simulation request
 */
export interface MonteCarloRequest {
  portfolioId: string;
  initialValue: number;
  years: number;
  simulations: number;
  annualContribution?: number;
  rebalanceFrequency?: 'none' | 'monthly' | 'quarterly' | 'annually';
  confidenceLevel?: number;
}

/**
 * Monte Carlo simulation response
 */
export interface MonteCarloResponse extends BaseResponse {
  simulationData: number[][];
  percentiles: {
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
  };
  probabilities: {
    probReachingDouble: number;
    probReachingTarget?: number;
    probNegative: number;
  };
  timePoints: string[];
  years: number;
  initialValue: number;
  var: number;
  cvar: number;
  expectedValue: number;
}

/**
 * Drawdown analysis request
 */
export interface DrawdownRequest {
  portfolioId: string;
  dateRange: DateRange;
  minDepth?: number;
}

/**
 * Drawdown analysis response
 */
export interface DrawdownResponse extends BaseResponse {
  drawdowns: {
    startDate: string;
    valleyDate: string;
    recoveryDate: string | null;
    depth: number;
    length: number;
    recovery: number | null;
  }[];
  underwaterSeries: {
    date: string;
    value: number;
  }[];
  maxDrawdown: number;
  averageDrawdown: number;
  averageRecovery: number;
  drawdownFrequency: number;
}