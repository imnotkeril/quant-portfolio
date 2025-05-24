/**
 * Scenarios store actions
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { scenarioService } from '../../services/scenarios/scenarioService';
import {
  RunSimulationPayload,
  AnalyzeImpactPayload,
  CreateChainPayload,
  ModifyChainPayload,
  LoadChainPayload,
  DeleteChainPayload,
} from './types';
import {
  ScenarioListResponse,
  ScenarioSimulationResponse,
  ScenarioImpactResponse,
  ScenarioChainResponse,
} from '../../types/scenarios';

/**
 * Load available scenarios
 */
export const loadScenarios = createAsyncThunk<
  ScenarioListResponse,
  void,
  { rejectValue: string }
>(
  'scenarios/loadScenarios',
  async (_, { rejectWithValue }) => {
    try {
      return await scenarioService.getAvailableScenarios();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load scenarios');
    }
  }
);

/**
 * Run scenario simulation
 */
export const runSimulation = createAsyncThunk<
  { simulationId: string; data: ScenarioSimulationResponse },
  RunSimulationPayload,
  { rejectValue: string }
>(
  'scenarios/runSimulation',
  async (payload, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = scenarioService.validateScenarioSimulationRequest(payload.request);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors.join(', '));
      }

      const data = await scenarioService.simulateScenarioChain(payload.request);
      return { simulationId: payload.simulationId, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to run simulation');
    }
  }
);

/**
 * Analyze scenario impact
 */
export const analyzeImpact = createAsyncThunk<
  { portfolioId: string; data: ScenarioImpactResponse },
  AnalyzeImpactPayload,
  { rejectValue: string }
>(
  'scenarios/analyzeImpact',
  async (payload, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = scenarioService.validateScenarioImpactRequest(payload.request);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors.join(', '));
      }

      const data = await scenarioService.analyzeScenarioImpact(payload.request);
      return { portfolioId: payload.portfolioId, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to analyze scenario impact');
    }
  }
);

/**
 * Create scenario chain
 */
export const createChain = createAsyncThunk<
  { name: string; data: ScenarioChainResponse },
  CreateChainPayload,
  { rejectValue: string }
>(
  'scenarios/createChain',
  async (payload, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = scenarioService.validateScenarioChainRequest(payload.request);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors.join(', '));
      }

      const data = await scenarioService.createScenarioChain(payload.request);
      return { name: payload.request.name, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create scenario chain');
    }
  }
);

/**
 * Modify scenario chain
 */
export const modifyChain = createAsyncThunk<
  { name: string; data: ScenarioChainResponse },
  ModifyChainPayload,
  { rejectValue: string }
>(
  'scenarios/modifyChain',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await scenarioService.modifyScenarioChain(payload.request);
      return { name: payload.request.name, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to modify scenario chain');
    }
  }
);

/**
 * Load scenario chain
 */
export const loadChain = createAsyncThunk<
  { name: string; data: ScenarioChainResponse },
  LoadChainPayload,
  { rejectValue: string }
>(
  'scenarios/loadChain',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await scenarioService.getScenarioChain(payload.name);
      return { name: payload.name, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load scenario chain');
    }
  }
);

/**
 * Delete scenario chain
 */
export const deleteChain = createAsyncThunk<
  string,
  DeleteChainPayload,
  { rejectValue: string }
>(
  'scenarios/deleteChain',
  async (payload, { rejectWithValue }) => {
    try {
      await scenarioService.deleteScenarioChain(payload.name);
      return payload.name;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete scenario chain');
    }
  }
);