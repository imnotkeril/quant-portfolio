/**
 * Scenario types
 */
import { ApiResponse } from './common';

/**
 * Scenario List Response
 */
export interface ScenarioListResponse {
  scenarios: string[];
}

/**
 * Scenario Simulation Request
 */
export interface ScenarioSimulationRequest {
  startingScenario: string;
  numSimulations?: number;
}

/**
 * Scenario Result
 */
export interface ScenarioResult {
  chain: string[];
  timeline: number[];
  totalImpact: Record<string, number>;
}

/**
 * Scenario Simulation Response
 */
export interface ScenarioSimulationResponse {
  simulationResults: ScenarioResult[];
  startingScenario: string;
  numSimulations: number;
  impactStatistics?: Record<string, Record<string, number>>;
  mostCommonChains?: Array<Record<string, any>>;
  chainVisualizationData?: Record<string, any>;
}

/**
 * Scenario Impact Request
 */
export interface ScenarioImpactRequest {
  portfolio: Record<string, any>;
  scenarios: string[];
  dataFetcher: any;
}

/**
 * Scenario Impact
 */
export interface ScenarioImpact {
  scenarioName: string;
  portfolioImpact: number;
  assetImpacts: Record<string, number>;
  sectorImpacts?: Record<string, number>;
  riskChanges?: Record<string, number>;
  recoveryEstimate?: Record<string, any>;
}

/**
 * Scenario Impact Response
 */
export interface ScenarioImpactResponse {
  scenarioImpacts: Record<string, ScenarioImpact>;
  portfolioId: string;
  analyzedScenarios: string[];
  portfolioVulnerabilities?: string[];
  recommendedActions?: string[];
}

/**
 * Scenario Event
 */
export interface ScenarioEvent {
  scenario: string;
  probability: number;
  delay: number;
  magnitudeModifier: number;
}

/**
 * Scenario Chain Request
 */
export interface ScenarioChainRequest {
  name: string;
  description?: string;
  initialImpact: Record<string, number>;
  leadsTo: ScenarioEvent[];
}

/**
 * Scenario Modification Request
 */
export interface ScenarioModificationRequest {
  name: string;
  initialImpact?: Record<string, number>;
  leadsTo?: ScenarioEvent[];
}

/**
 * Scenario Chain
 */
export interface ScenarioChain {
  name: string;
  description?: string;
  initialImpact: Record<string, number>;
  leadsTo: ScenarioEvent[];
}

/**
 * Scenario Chain Response
 */
export interface ScenarioChainResponse {
  scenarioChain: ScenarioChain;
  name: string;
}

/**
 * Scenario Impact
 */
export interface ScenarioImpact {
  entityType: string;
  entityId: string;
  impactValue: number;
  probability?: number;
  description?: string;
}