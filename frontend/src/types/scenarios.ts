import { BaseResponse } from './common';

/**
 * Scenario impact on asset
 */
export interface ScenarioAssetImpact {
  ticker: string;
  impact: number;
  description?: string;
}

/**
 * Scenario impact on sector
 */
export interface ScenarioSectorImpact {
  sector: string;
  impact: number;
  description?: string;
}

/**
 * Scenario stage
 */
export interface ScenarioStage {
  name: string;
  description: string;
  probability: number;
  assetImpacts: ScenarioAssetImpact[];
  sectorImpacts: ScenarioSectorImpact[];
  macroIndicators?: { [indicator: string]: number };
  timeframe?: string;
  leadsTo?: string[];
}

/**
 * Scenario definition
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  initialStage: ScenarioStage;
  subsequentStages: { [stageId: string]: ScenarioStage };
}

/**
 * Scenario list response
 */
export interface ScenarioListResponse extends BaseResponse {
  scenarios: {
    id: string;
    name: string;
    description: string;
  }[];
}

/**
 * Scenario simulation request
 */
export interface ScenarioSimulationRequest {
  portfolioId: string;
  scenarioId: string;
  initialPortfolioValue: number;
  customProbabilities?: { [stageId: string]: number };
}

/**
 * Stage outcome in simulation
 */
export interface StageOutcome {
  stageName: string;
  portfolioValue: number;
  portfolioChange: number;
  changePercentage: number;
  positionValues: { [ticker: string]: number };
  positionChanges: { [ticker: string]: number };
}

/**
 * Scenario path in simulation
 */
export interface ScenarioPath {
  probability: number;
  stages: StageOutcome[];
  finalValue: number;
  totalChange: number;
  totalChangePercentage: number;
}

/**
 * Scenario simulation response
 */
export interface ScenarioSimulationResponse extends BaseResponse {
  scenarioName: string;
  initialValue: number;
  expectedFinalValue: number;
  expectedChangePercentage: number;
  worstCaseFinalValue: number;
  worstCaseChangePercentage: number;
  bestCaseFinalValue: number;
  bestCaseChangePercentage: number;
  paths: ScenarioPath[];
}

/**
 * Scenario impact request
 */
export interface ScenarioImpactRequest {
  portfolioIds: string[];
  scenarioId: string;
}

/**
 * Portfolio impact in scenario
 */
export interface PortfolioScenarioImpact {
  portfolioId: string;
  portfolioName: string;
  totalImpact: number;
  assetImpacts: { [ticker: string]: number };
  sectorImpacts: { [sector: string]: number };
  resistanceScore: number;
}

/**
 * Scenario impact response
 */
export interface ScenarioImpactResponse extends BaseResponse {
  scenarioName: string;
  scenarioDescription: string;
  portfolioImpacts: PortfolioScenarioImpact[];
  comparisonChart: {
    labels: string[];
    values: number[];
  };
}