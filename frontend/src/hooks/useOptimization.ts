/**
 * Hook for managing portfolio optimization
 */
import { useState, useCallback } from 'react';
// import { optimizationService } from '../services/optimization/optimizationService'; // TODO: Uncomment when service is created
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  MarkowitzRequest,
  RiskParityRequest,
  OptimizationMethod,
} from '../types/optimization';

interface UseOptimizationState {
  optimizationResult: OptimizationResponse | null;
  efficientFrontier: EfficientFrontierResponse | null;
  loading: boolean;
  optimizing: boolean;
  calculatingFrontier: boolean;
  error: string | null;
  lastOptimizationMethod: OptimizationMethod | null;
}

interface UseOptimizationActions {
  optimizePortfolio: (
    method: OptimizationMethod,
    request: OptimizationRequest
  ) => Promise<OptimizationResponse | null>;
  calculateEfficientFrontier: (request: EfficientFrontierRequest) => Promise<EfficientFrontierResponse | null>;
  optimizeMarkowitz: (request: MarkowitzRequest) => Promise<OptimizationResponse | null>;
  optimizeRiskParity: (request: RiskParityRequest) => Promise<OptimizationResponse | null>;
  optimizeMinimumVariance: (request: OptimizationRequest) => Promise<OptimizationResponse | null>;
  optimizeMaximumSharpe: (request: OptimizationRequest) => Promise<OptimizationResponse | null>;
  optimizeEqualWeight: (request: OptimizationRequest) => Promise<OptimizationResponse | null>;
  getOptimizationMethods: () => Array<{ value: OptimizationMethod; label: string; description: string }>;
  validateOptimizationRequest: (request: OptimizationRequest) => { isValid: boolean; errors: string[] };
  clearError: () => void;
  clearResults: () => void;
}

export const useOptimization = (): UseOptimizationState & UseOptimizationActions => {
  const [state, setState] = useState<UseOptimizationState>({
    optimizationResult: null,
    efficientFrontier: null,
    loading: false,
    optimizing: false,
    calculatingFrontier: false,
    error: null,
    lastOptimizationMethod: null,
  });

  // Generic optimize portfolio function
  const optimizePortfolio = useCallback(async (
    method: OptimizationMethod,
    request: OptimizationRequest
  ): Promise<OptimizationResponse | null> => {
    setState((prev: UseOptimizationState) => ({ ...prev, optimizing: true, error: null, lastOptimizationMethod: method }));

    try {
      // Validate request
      const validation = validateOptimizationRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // TODO: Replace with actual service call when optimizationService is available
      // const result = await optimizationService.optimizePortfolio(method, request);
      const result: OptimizationResponse = {
        optimizationMethod: method,
        tickers: request.tickers || [],
        startDate: request.startDate || '',
        endDate: request.endDate || '',
        riskFreeRate: request.riskFreeRate || 0,
        optimalWeights: request.tickers?.reduce((acc, ticker, index) => {
          acc[ticker] = 1 / (request.tickers?.length || 1);
          return acc;
        }, {} as Record<string, number>) || {},
        expectedReturn: 0.08,
        expectedRisk: 0.12,
        performanceMetrics: {
          sharpeRatio: 0.67,
          sortinoRatio: 0.85,
          calmarRatio: 0.45,
        },
      };

      setState((prev: UseOptimizationState) => ({
        ...prev,
        optimizationResult: result,
        optimizing: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize portfolio';
      setState((prev: UseOptimizationState) => ({
        ...prev,
        optimizing: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate efficient frontier
  const calculateEfficientFrontier = useCallback(async (
    request: EfficientFrontierRequest
  ): Promise<EfficientFrontierResponse | null> => {
    setState((prev: UseOptimizationState) => ({ ...prev, calculatingFrontier: true, error: null }));

    try {
      // Validate request
      const validation = validateOptimizationRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Validate points parameter
      if (request.points && (request.points < 10 || request.points > 100)) {
        throw new Error('Number of points must be between 10 and 100');
      }

      // TODO: Replace with actual service call when optimizationService is available
      // const frontier = await optimizationService.calculateEfficientFrontier(request);
      const frontier: EfficientFrontierResponse = {
        tickers: request.tickers || [],
        startDate: request.startDate || '',
        endDate: request.endDate || '',
        riskFreeRate: request.riskFreeRate || 0,
        efficientFrontier: Array.from({ length: request.points || 50 }, (_, i) => ({
          risk: 0.05 + (i * 0.01),
          return: 0.02 + (i * 0.005),
          sharpe: (0.02 + (i * 0.005)) / (0.05 + (i * 0.01)),
        })),
        minVariancePortfolio: {
          weights: {},
          expectedReturn: 0.04,
          expectedRisk: 0.06,
          sharpeRatio: 0.67,
        },
        maxSharpePortfolio: {
          weights: {},
          expectedReturn: 0.12,
          expectedRisk: 0.15,
          sharpeRatio: 0.8,
        },
        maxReturnPortfolio: {
          weights: {},
          expectedReturn: 0.18,
          expectedRisk: 0.25,
          sharpeRatio: 0.72,
        },
      };

      setState((prev: UseOptimizationState) => ({
        ...prev,
        efficientFrontier: frontier,
        calculatingFrontier: false
      }));

      return frontier;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate efficient frontier';
      setState((prev: UseOptimizationState) => ({
        ...prev,
        calculatingFrontier: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Markowitz optimization
  const optimizeMarkowitz = useCallback(async (
    request: MarkowitzRequest
  ): Promise<OptimizationResponse | null> => {
    return optimizePortfolio('markowitz', request);
  }, [optimizePortfolio]);

  // Risk Parity optimization
  const optimizeRiskParity = useCallback(async (
    request: RiskParityRequest
  ): Promise<OptimizationResponse | null> => {
    setState((prev: UseOptimizationState) => ({ ...prev, optimizing: true, error: null, lastOptimizationMethod: 'risk_parity' }));

    try {
      // Validate request
      const validation = validateOptimizationRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Validate risk budget if provided
      if (request.riskBudget) {
        const totalRiskBudget = Object.values(request.riskBudget).reduce((sum, budget) => sum + budget, 0);
        if (Math.abs(totalRiskBudget - 1.0) > 0.001) {
          throw new Error('Risk budget must sum to 1.0');
        }
      }

      // TODO: Replace with actual service call when optimizationService is available
      // const result = await optimizationService.optimizeRiskParity(request);
      const result: OptimizationResponse = {
        optimizationMethod: 'risk_parity',
        tickers: request.tickers || [],
        startDate: request.startDate || '',
        endDate: request.endDate || '',
        riskFreeRate: request.riskFreeRate || 0,
        optimalWeights: request.tickers?.reduce((acc, ticker, index) => {
          acc[ticker] = 1 / (request.tickers?.length || 1);
          return acc;
        }, {} as Record<string, number>) || {},
        expectedReturn: 0.075,
        expectedRisk: 0.10,
        performanceMetrics: {
          sharpeRatio: 0.75,
          sortinoRatio: 0.92,
          calmarRatio: 0.52,
        },
      };

      setState((prev: UseOptimizationState) => ({
        ...prev,
        optimizationResult: result,
        optimizing: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize risk parity portfolio';
      setState((prev: UseOptimizationState) => ({
        ...prev,
        optimizing: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Minimum variance optimization
  const optimizeMinimumVariance = useCallback(async (
    request: OptimizationRequest
  ): Promise<OptimizationResponse | null> => {
    return optimizePortfolio('minimum_variance', request);
  }, [optimizePortfolio]);

  // Maximum Sharpe optimization
  const optimizeMaximumSharpe = useCallback(async (
    request: OptimizationRequest
  ): Promise<OptimizationResponse | null> => {
    return optimizePortfolio('maximum_sharpe', request);
  }, [optimizePortfolio]);

  // Equal weight optimization
  const optimizeEqualWeight = useCallback(async (
    request: OptimizationRequest
  ): Promise<OptimizationResponse | null> => {
    return optimizePortfolio('equal_weight', request);
  }, [optimizePortfolio]);

  // Get available optimization methods
  const getOptimizationMethods = useCallback(() => {
    return [
      {
        value: 'markowitz' as OptimizationMethod,
        label: 'Markowitz Mean-Variance',
        description: 'Classic mean-variance optimization with optional target return or risk constraints'
      },
      {
        value: 'maximum_sharpe' as OptimizationMethod,
        label: 'Maximum Sharpe Ratio',
        description: 'Maximize risk-adjusted returns (Sharpe ratio)'
      },
      {
        value: 'minimum_variance' as OptimizationMethod,
        label: 'Minimum Variance',
        description: 'Minimize portfolio volatility'
      },
      {
        value: 'risk_parity' as OptimizationMethod,
        label: 'Risk Parity',
        description: 'Equal risk contribution from each asset'
      },
      {
        value: 'equal_weight' as OptimizationMethod,
        label: 'Equal Weight',
        description: 'Equal allocation to all assets (1/N strategy)'
      }
    ];
  }, []);

  // Validate optimization request
  const validateOptimizationRequest = useCallback((request: OptimizationRequest) => {
    const errors: string[] = [];

    // Check portfolio ID or tickers
    if (!request.portfolioId && (!request.tickers || request.tickers.length === 0)) {
      errors.push('Either portfolio ID or list of tickers is required');
    }

    // Check date range
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }

      // Check if date range is reasonable (at least 30 days)
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) {
        errors.push('Date range must be at least 30 days');
      }

      // Check if date range is not too long (max 10 years)
      if (daysDiff > 3650) {
        errors.push('Date range cannot exceed 10 years');
      }
    }

    // Check risk-free rate
    if (request.riskFreeRate !== undefined) {
      if (request.riskFreeRate < -0.1 || request.riskFreeRate > 0.2) {
        errors.push('Risk-free rate must be between -10% and 20%');
      }
    }

    // Check weight constraints
    if (request.minWeight !== undefined && request.maxWeight !== undefined) {
      if (request.minWeight < 0) {
        errors.push('Minimum weight cannot be negative');
      }
      if (request.maxWeight > 1) {
        errors.push('Maximum weight cannot exceed 100%');
      }
      if (request.minWeight > request.maxWeight) {
        errors.push('Minimum weight must be less than or equal to maximum weight');
      }
    }

    // Check tickers array if provided
    if (request.tickers) {
      if (request.tickers.length < 2) {
        errors.push('At least 2 assets are required for optimization');
      }
      if (request.tickers.length > 100) {
        errors.push('Too many assets (maximum 100)');
      }

      // Check for duplicate tickers
      const uniqueTickers = new Set(request.tickers);
      if (uniqueTickers.size !== request.tickers.length) {
        errors.push('Duplicate tickers found');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev: UseOptimizationState) => ({ ...prev, error: null }));
  }, []);

  // Clear all results
  const clearResults = useCallback(() => {
    setState((prev: UseOptimizationState) => ({
      ...prev,
      optimizationResult: null,
      efficientFrontier: null,
      error: null,
      lastOptimizationMethod: null
    }));
  }, []);

  return {
    ...state,
    optimizePortfolio,
    calculateEfficientFrontier,
    optimizeMarkowitz,
    optimizeRiskParity,
    optimizeMinimumVariance,
    optimizeMaximumSharpe,
    optimizeEqualWeight,
    getOptimizationMethods,
    validateOptimizationRequest,
    clearError,
    clearResults,
  };
};

export default useOptimization;