import { useState, useCallback } from 'react';
import optimizationService from '../services/optimization/optimizationService';
import advancedOptimizationService from '../services/optimization/advancedOptimizationService';
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  AdvancedOptimizationRequest
} from '../types/optimization';

/**
 * Custom hook for portfolio optimization
 */
export const useOptimization = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Optimize portfolio using specified method
   */
  const optimizePortfolio = useCallback(async (
    request: OptimizationRequest,
    method: string = 'markowitz'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.optimizePortfolio(request, method);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error optimizing portfolio with ${method} method`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate efficient frontier
   */
  const calculateEfficientFrontier = useCallback(async (request: EfficientFrontierRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.calculateEfficientFrontier(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating efficient frontier');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Markowitz optimization
   */
  const markowitzOptimization = useCallback(async (request: OptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.markowitzOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with Markowitz optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Risk parity optimization
   */
  const riskParityOptimization = useCallback(async (request: OptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.riskParityOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with Risk Parity optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Minimum variance optimization
   */
  const minimumVarianceOptimization = useCallback(async (request: OptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.minimumVarianceOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with Minimum Variance optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Maximum Sharpe ratio optimization
   */
  const maximumSharpeOptimization = useCallback(async (request: OptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.maximumSharpeOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with Maximum Sharpe optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Equal weight optimization
   */
  const equalWeightOptimization = useCallback(async (request: OptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await optimizationService.equalWeightOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with Equal Weight optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Advanced optimization methods
   */

  /**
   * Robust optimization
   */
  const robustOptimization = useCallback(async (request: AdvancedOptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedOptimizationService.robustOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with robust optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cost-aware optimization
   */
  const costAwareOptimization = useCallback(async (request: AdvancedOptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedOptimizationService.costAwareOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with cost-aware optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Conditional optimization for different scenarios
   */
  const conditionalOptimization = useCallback(async (request: AdvancedOptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedOptimizationService.conditionalOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with conditional optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ESG-focused optimization
   */
  const esgOptimization = useCallback(async (request: AdvancedOptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedOptimizationService.esgOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with ESG optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hierarchical optimization
   */
  const hierarchicalOptimization = useCallback(async (request: AdvancedOptimizationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedOptimizationService.hierarchicalOptimization(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error with hierarchical optimization');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    optimizePortfolio,
    calculateEfficientFrontier,
    markowitzOptimization,
    riskParityOptimization,
    minimumVarianceOptimization,
    maximumSharpeOptimization,
    equalWeightOptimization,
    robustOptimization,
    costAwareOptimization,
    conditionalOptimization,
    esgOptimization,
    hierarchicalOptimization
  };
};