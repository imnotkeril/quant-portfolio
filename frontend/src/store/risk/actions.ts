/**
 * Risk Management Actions
 * Async actions for risk analysis operations
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { riskService } from '../../services/risk/riskService';
import type {
  VaRResponse,
  StressTestResponse,
  MonteCarloResponse,
  DrawdownResponse,
  RiskContributionResponse,
} from '../../types/risk';

// Action payload types
export interface CalculateVaRPayload {
  portfolioId: string;
  returns: Record<string, number[]>;
  confidenceLevel?: number;
  timeHorizon?: number;
  simulations?: number;
  method?: 'parametric' | 'historical' | 'monte_carlo';
}

export interface PerformStressTestPayload {
  portfolioId: string;
  scenario: string;
  returns?: Record<string, any>;
  portfolioValue?: number;
  testType?: 'historical' | 'custom' | 'advanced';
  shocks?: Record<string, number>;
}

export interface PerformMonteCarloPayload {
  portfolioId: string;
  returns: Record<string, any>;
  initialValue?: number;
  years?: number;
  simulations?: number;
  annualContribution?: number;
}

export interface AnalyzeDrawdownsPayload {
  portfolioId: string;
  returns: Record<string, any>;
}

export interface CalculateRiskContributionPayload {
  portfolioId: string;
  returns: Record<string, any>;
  weights: Record<string, number>;
}

/**
 * Calculate Value at Risk (VaR)
 */
export const calculateVaR = createAsyncThunk<
  VaRResponse,
  CalculateVaRPayload,
  { rejectValue: string }
>(
  'risk/calculateVaR',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await riskService.calculateVaR(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to calculate VaR'
      );
    }
  }
);

/**
 * Perform stress test analysis
 */
export const performStressTest = createAsyncThunk<
  StressTestResponse,
  PerformStressTestPayload,
  { rejectValue: string }
>(
  'risk/performStressTest',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await riskService.performStressTest(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to perform stress test'
      );
    }
  }
);

/**
 * Perform Monte Carlo simulation
 */
export const performMonteCarlo = createAsyncThunk<
  MonteCarloResponse,
  PerformMonteCarloPayload,
  { rejectValue: string }
>(
  'risk/performMonteCarlo',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await riskService.performMonteCarlo(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to perform Monte Carlo simulation'
      );
    }
  }
);

/**
 * Analyze portfolio drawdowns
 */
export const analyzeDrawdowns = createAsyncThunk<
  DrawdownResponse,
  AnalyzeDrawdownsPayload,
  { rejectValue: string }
>(
  'risk/analyzeDrawdowns',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await riskService.analyzeDrawdowns(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to analyze drawdowns'
      );
    }
  }
);

/**
 * Calculate risk contribution analysis
 */
export const calculateRiskContribution = createAsyncThunk<
  RiskContributionResponse,
  CalculateRiskContributionPayload,
  { rejectValue: string }
>(
  'risk/calculateRiskContribution',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await riskService.calculateRiskContribution(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to calculate risk contribution'
      );
    }
  }
);

// Export all action creators
export const riskActions = {
  calculateVaR,
  performStressTest,
  performMonteCarlo,
  analyzeDrawdowns,
  calculateRiskContribution,
};

export default riskActions;