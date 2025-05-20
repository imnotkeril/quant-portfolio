import { useState, useCallback } from 'react';
import riskService from '../services/risk/riskService';
import {
  VaRRequest,
  VaRResponse,
  StressTestRequest,
  StressTestResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  DrawdownRequest,
  DrawdownResponse
} from '../types/risk';

/**
 * Custom hook for risk management
 */
export const useRisk = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate Value at Risk (VaR)
   */
  const calculateVaR = useCallback(async (request: VaRRequest, method: string = 'historical') => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.calculateVaR(request, method);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error calculating VaR with ${method} method`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate Conditional Value at Risk (CVaR)
   */
  const calculateCVaR = useCallback(async (request: VaRRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.calculateCVaR(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating CVaR');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform stress testing
   */
  const performStressTest = useCallback(async (request: StressTestRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.performStressTest(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error performing stress test');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform custom stress testing
   */
  const performCustomStressTest = useCallback(async (request: StressTestRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.performCustomStressTest(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error performing custom stress test');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform Monte Carlo simulation
   */
  const performMonteCarloSimulation = useCallback(async (request: MonteCarloRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.performMonteCarloSimulation(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error performing Monte Carlo simulation');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analyze drawdowns
   */
  const analyzeDrawdowns = useCallback(async (request: DrawdownRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.analyzeDrawdowns(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing drawdowns');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform advanced Monte Carlo simulation
   */
  const performAdvancedMonteCarloSimulation = useCallback(async (request: MonteCarloRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await riskService.performAdvancedMonteCarloSimulation(request);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error performing advanced Monte Carlo simulation');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get comprehensive risk analysis dashboard
   */
  const getRiskDashboard = useCallback(async (portfolioId: string, dateRange: { startDate: string, endDate: string }) => {
    setLoading(true);
    setError(null);

    try {
      // Run requests in parallel for better performance
      const [
        varResult,
        cvarResult,
        drawdownsResult
      ] = await Promise.all([
        riskService.calculateVaR({ portfolioId, dateRange }),
        riskService.calculateCVaR({ portfolioId, dateRange }),
        riskService.analyzeDrawdowns({ portfolioId, dateRange })
      ]);

      return {
        var: varResult,
        cvar: cvarResult,
        drawdowns: drawdownsResult
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting risk dashboard');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    calculateVaR,
    calculateCVaR,
    performStressTest,
    performCustomStressTest,
    performMonteCarloSimulation,
    analyzeDrawdowns,
    performAdvancedMonteCarloSimulation,
    getRiskDashboard
  };
};