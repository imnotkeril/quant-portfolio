/**
 * Historical store actions
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { historicalService } from '../../services/historical/historicalService';
import {
  HistoricalScenariosResponse,
  HistoricalContextResponse,
  HistoricalAnalogiesResponse,
  HistoricalSimilarityResponse,
  HistoricalContextRequest,
  HistoricalAnalogiesRequest,
  HistoricalSimilarityRequest,
  HistoricalScenarioRequest,
} from '../../types/historical';

/**
 * Load available scenarios
 */
export const loadScenarios = createAsyncThunk<
  HistoricalScenariosResponse,
  void,
  { rejectValue: string }
>(
  'historical/loadScenarios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await historicalService.getHistoricalScenarios();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load historical scenarios');
    }
  }
);

/**
 * Load historical context
 */
export const loadContext = createAsyncThunk<
  { scenarioKey: string; data: HistoricalContextResponse },
  HistoricalContextRequest,
  { rejectValue: string }
>(
  'historical/loadContext',
  async (request, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = historicalService.validateHistoricalContextRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await historicalService.getHistoricalContext(request);
      return { scenarioKey: request.scenarioKey, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load historical context');
    }
  }
);

/**
 * Find historical analogies
 */
export const findAnalogies = createAsyncThunk<
  { cacheKey: string; data: HistoricalAnalogiesResponse },
  { request: HistoricalAnalogiesRequest; cacheKey: string },
  { rejectValue: string }
>(
  'historical/findAnalogies',
  async ({ request, cacheKey }, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = historicalService.validateHistoricalAnalogiesRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await historicalService.findHistoricalAnalogies(request);
      return { cacheKey, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to find historical analogies');
    }
  }
);

/**
 * Calculate similarity score
 */
export const calculateSimilarity = createAsyncThunk<
  { cacheKey: string; data: HistoricalSimilarityResponse },
  { request: HistoricalSimilarityRequest; cacheKey: string },
  { rejectValue: string }
>(
  'historical/calculateSimilarity',
  async ({ request, cacheKey }, { rejectWithValue }) => {
    try {
      const response = await historicalService.calculateSimilarityScore(request);
      return { cacheKey, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to calculate similarity score');
    }
  }
);

/**
 * Add historical scenario
 */
export const addScenario = createAsyncThunk<
  string,
  HistoricalScenarioRequest,
  { rejectValue: string }
>(
  'historical/addScenario',
  async (request, { rejectWithValue }) => {
    try {
      // Validate request
      const validation = historicalService.validateHistoricalScenarioRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      await historicalService.addHistoricalScenario(request);
      return request.key;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add historical scenario');
    }
  }
);

/**
 * Delete historical scenario
 */
export const deleteScenario = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'historical/deleteScenario',
  async (key, { rejectWithValue }) => {
    try {
      await historicalService.deleteHistoricalScenario(key);
      return key;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete historical scenario');
    }
  }
);

/**
 * Perform search
 */
export const performSearch = createAsyncThunk<
  any,
  { query: string; filters: any },
  { rejectValue: string }
>(
  'historical/performSearch',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      // Simulate search functionality
      // In a real implementation, this would call appropriate search APIs
      const searchResults = {
        events: [],
        regimes: [],
        analogies: [],
      };

      // This is a placeholder - implement actual search logic
      await new Promise(resolve => setTimeout(resolve, 500));

      return searchResults;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);