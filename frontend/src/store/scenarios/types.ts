/**
 * Scenarios state types
 */
import {
  ScenarioListResponse,
  ScenarioSimulationResponse,
  ScenarioImpactResponse,
  ScenarioChainResponse,
  ScenarioSimulationRequest,
  ScenarioImpactRequest,
  ScenarioChainRequest,
  ScenarioModificationRequest,
} from '../../types/scenarios';
import { ApiResponse } from '../../types/common';

/**
 * Scenario analysis state
 */
export interface ScenariosState {
  // Loading states
  scenariosLoading: boolean;
  simulationLoading: boolean;
  impactAnalysisLoading: boolean;
  chainManagementLoading: boolean;

  // Data
  availableScenarios: string[];
  simulationResults: Record<string, ScenarioSimulationResponse>;
  impactResults: Record<string, ScenarioImpactResponse>;
  scenarioChains: Record<string, ScenarioChainResponse>;

  // Current analysis
  currentPortfolioId: string | null;
  selectedScenarios: string[];
  activeSimulation: string | null;

  // UI state
  viewMode: ScenarioViewMode;
  selectedChain: string | null;
  chainVisualizationData: any | null;

  // Simulation parameters
  simulationParameters: {
    numSimulations: number;
    confidenceLevel: number;
    timeHorizon: number;
  };

  // Custom scenarios
  customScenarios: Record<string, CustomScenario>;

  // Cache
  cache: {
    scenarioListCache: { data: string[]; timestamp: number } | null;
    simulationCache: Record<string, { data: ScenarioSimulationResponse; timestamp: number }>;
    impactCache: Record<string, { data: ScenarioImpactResponse; timestamp: number }>;
  };

  // Errors
  errors: {
    scenarios: string | null;
    simulation: string | null;
    impact: string | null;
    chainManagement: string | null;
  };

  // Settings
  settings: {
    autoRunSimulations: boolean;
    defaultSimulations: number;
    cacheTimeout: number;
    maxConcurrentAnalyses: number;
  };
}

/**
 * Scenario view modes
 */
export type ScenarioViewMode =
  | 'list'
  | 'simulation'
  | 'impact'
  | 'chains'
  | 'comparison';

/**
 * Custom scenario definition
 */
export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  initialImpact: Record<string, number>;
  leadsTo: Array<{
    scenario: string;
    probability: number;
    delay: number;
    magnitudeModifier: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Action payloads
 */
export interface RunSimulationPayload {
  request: ScenarioSimulationRequest;
  simulationId: string;
}

export interface AnalyzeImpactPayload {
  request: ScenarioImpactRequest;
  portfolioId: string;
}

export interface CreateChainPayload {
  request: ScenarioChainRequest;
}

export interface ModifyChainPayload {
  request: ScenarioModificationRequest;
}

export interface LoadChainPayload {
  name: string;
}

export interface DeleteChainPayload {
  name: string;
}