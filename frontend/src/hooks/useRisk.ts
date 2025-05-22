/**
 * Hook for managing risk analysis
 */
import { useState, useCallback } from 'react';
// import { riskService } from '../services/risk/riskService'; // TODO: Uncomment when service is created
import {
  VaRRequest,
  VaRResponse,
  StressTestRequest,
  StressTestResponse,
  CustomStressTestRequest,
  AdvancedStressTestRequest,
  MonteCarloRequest,
  MonteCarloResponse,
  DrawdownRequest,
  DrawdownResponse,
  RiskContributionRequest,
  RiskContributionResponse,
} from '../types/risk';

interface UseRiskState {
  varResult: VaRResponse | null;
  stressTestResult: StressTestResponse | null;
  monteCarloResult: MonteCarloResponse | null;
  drawdownResult: DrawdownResponse | null;
  riskContributionResult: RiskContributionResponse | null;
  loading: boolean;
  calculatingVaR: boolean;
  runningStressTest: boolean;
  runningMonteCarlo: boolean;
  calculatingDrawdowns: boolean;
  calculatingRiskContribution: boolean;
  error: string | null;
}

interface UseRiskActions {
  calculateVaR: (request: VaRRequest, method?: 'historical' | 'parametric' | 'monte_carlo') => Promise<VaRResponse | null>;
  runStressTest: (request: StressTestRequest) => Promise<StressTestResponse | null>;
  runCustomStressTest: (request: CustomStressTestRequest) => Promise<StressTestResponse | null>;
  runAdvancedStressTest: (request: AdvancedStressTestRequest) => Promise<StressTestResponse | null>;
  runMonteCarloSimulation: (request: MonteCarloRequest) => Promise<MonteCarloResponse | null>;
  calculateDrawdowns: (request: DrawdownRequest) => Promise<DrawdownResponse | null>;
  calculateRiskContribution: (request: RiskContributionRequest) => Promise<RiskContributionResponse | null>;
  getStressTestScenarios: () => Array<{ value: string; label: string; description: string }>;
  getConfidenceLevels: () => Array<{ value: number; label: string }>;
  clearError: () => void;
  clearResults: () => void;
}

export const useRisk = (): UseRiskState & UseRiskActions => {
  const [state, setState] = useState<UseRiskState>({
    varResult: null,
    stressTestResult: null,
    monteCarloResult: null,
    drawdownResult: null,
    riskContributionResult: null,
    loading: false,
    calculatingVaR: false,
    runningStressTest: false,
    runningMonteCarlo: false,
    calculatingDrawdowns: false,
    calculatingRiskContribution: false,
    error: null,
  });

  // Calculate Value at Risk
  const calculateVaR = useCallback(async (
    request: VaRRequest,
    method: 'historical' | 'parametric' | 'monte_carlo' = 'historical'
  ): Promise<VaRResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, calculatingVaR: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      if (request.confidenceLevel && (request.confidenceLevel <= 0 || request.confidenceLevel >= 1)) {
        throw new Error('Confidence level must be between 0 and 1');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.calculateVaR(request, method);
      const result: VaRResponse = {
        var: 0.05,
        method,
        confidenceLevel: request.confidenceLevel || 0.95,
        timeHorizon: request.timeHorizon,
        simulations: request.simulations,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        varResult: result,
        calculatingVaR: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate VaR';
      setState((prev: UseRiskState) => ({
        ...prev,
        calculatingVaR: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Run stress test
  const runStressTest = useCallback(async (
    request: StressTestRequest
  ): Promise<StressTestResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, runningStressTest: true, error: null }));

    try {
      // Validate request
      if (!request.scenario) {
        throw new Error('Stress test scenario is required');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.runStressTest(request);
      const result: StressTestResponse = {
        scenario: request.scenario,
        shockPercentage: -0.2,
        portfolioValue: request.portfolioValue || 10000,
        portfolioLoss: -2000,
        portfolioAfterShock: 8000,
        recoveryDays: 120,
        recoveryMonths: 4,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        stressTestResult: result,
        runningStressTest: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run stress test';
      setState((prev: UseRiskState) => ({
        ...prev,
        runningStressTest: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Run custom stress test
  const runCustomStressTest = useCallback(async (
    request: CustomStressTestRequest
  ): Promise<StressTestResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, runningStressTest: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      if (!request.weights || Object.keys(request.weights).length === 0) {
        throw new Error('Portfolio weights are required');
      }

      if (!request.shocks || Object.keys(request.shocks).length === 0) {
        throw new Error('Shock scenarios are required');
      }

      // Validate weights sum to 1
      const totalWeight = Object.values(request.weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeight - 1.0) > 0.001) {
        throw new Error('Portfolio weights must sum to 1.0');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.runCustomStressTest(request);
      const result: StressTestResponse = {
        scenario: 'custom',
        shockPercentage: -0.15,
        portfolioValue: request.portfolioValue || 10000,
        portfolioLoss: -1500,
        portfolioAfterShock: 8500,
        recoveryDays: 90,
        recoveryMonths: 3,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        stressTestResult: result,
        runningStressTest: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run custom stress test';
      setState((prev: UseRiskState) => ({
        ...prev,
        runningStressTest: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Run advanced stress test
  const runAdvancedStressTest = useCallback(async (
    request: AdvancedStressTestRequest
  ): Promise<StressTestResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, runningStressTest: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      if (!request.weights || Object.keys(request.weights).length === 0) {
        throw new Error('Portfolio weights are required');
      }

      if (!request.customShocks || Object.keys(request.customShocks).length === 0) {
        throw new Error('Custom shock scenarios are required');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.runAdvancedStressTest(request);
      const result: StressTestResponse = {
        scenario: 'advanced',
        shockPercentage: -0.18,
        portfolioValue: request.portfolioValue || 10000,
        portfolioLoss: -1800,
        portfolioAfterShock: 8200,
        recoveryDays: 100,
        recoveryMonths: 3.3,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        stressTestResult: result,
        runningStressTest: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run advanced stress test';
      setState((prev: UseRiskState) => ({
        ...prev,
        runningStressTest: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Run Monte Carlo simulation
  const runMonteCarloSimulation = useCallback(async (
    request: MonteCarloRequest
  ): Promise<MonteCarloResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, runningMonteCarlo: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      if (request.years && request.years <= 0) {
        throw new Error('Number of years must be positive');
      }

      if (request.simulations && (request.simulations < 100 || request.simulations > 10000)) {
        throw new Error('Number of simulations must be between 100 and 10,000');
      }

      if (request.initialValue && request.initialValue <= 0) {
        throw new Error('Initial value must be positive');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.runMonteCarloSimulation(request);
      const result: MonteCarloResponse = {
        initialValue: request.initialValue || 10000,
        years: request.years || 10,
        simulations: request.simulations || 1000,
        annualContribution: request.annualContribution || 0,
        annualMeanReturn: 0.08,
        annualVolatility: 0.15,
        percentiles: {
          min: 5000,
          p10: 12000,
          p25: 18000,
          median: 25000,
          p75: 35000,
          p90: 48000,
          max: 75000,
          mean: 26500,
        },
        probabilities: {
          prob_reaching_double: 0.85,
          prob_reaching_triple: 0.65,
          prob_reaching_quadruple: 0.35,
        },
        simulationSummary: {
          successRate: 0.78,
          averageReturn: 0.082,
          worstCase: -0.45,
          bestCase: 0.28,
        },
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        monteCarloResult: result,
        runningMonteCarlo: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run Monte Carlo simulation';
      setState((prev: UseRiskState) => ({
        ...prev,
        runningMonteCarlo: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate drawdowns
  const calculateDrawdowns = useCallback(async (
    request: DrawdownRequest
  ): Promise<DrawdownResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, calculatingDrawdowns: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.calculateDrawdowns(request);
      const result: DrawdownResponse = {
        drawdownPeriods: [
          {
            startDate: '2020-02-15',
            valleyDate: '2020-03-23',
            recoveryDate: '2020-08-15',
            depth: -0.35,
            length: 182,
            recovery: 145,
          },
          {
            startDate: '2022-01-01',
            valleyDate: '2022-06-15',
            recoveryDate: '2022-12-01',
            depth: -0.22,
            length: 334,
            recovery: 169,
          },
        ],
        underwaterSeries: {
          '2020-02-15': -0.05,
          '2020-03-23': -0.35,
          '2020-08-15': 0,
          '2022-01-01': -0.03,
          '2022-06-15': -0.22,
          '2022-12-01': 0,
        },
        maxDrawdown: -0.35,
        avgDrawdown: -0.285,
        avgRecoveryTime: 157,
        painIndex: 0.12,
        painRatio: 0.08,
        ulcerIndex: 0.15,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        drawdownResult: result,
        calculatingDrawdowns: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate drawdowns';
      setState((prev: UseRiskState) => ({
        ...prev,
        calculatingDrawdowns: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Calculate risk contribution
  const calculateRiskContribution = useCallback(async (
    request: RiskContributionRequest
  ): Promise<RiskContributionResponse | null> => {
    setState((prev: UseRiskState) => ({ ...prev, calculatingRiskContribution: true, error: null }));

    try {
      // Validate request
      if (!request.returns || Object.keys(request.returns).length === 0) {
        throw new Error('Returns data is required');
      }

      if (!request.weights || Object.keys(request.weights).length === 0) {
        throw new Error('Portfolio weights are required');
      }

      // Validate weights sum to 1
      const totalWeight = Object.values(request.weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeight - 1.0) > 0.001) {
        throw new Error('Portfolio weights must sum to 1.0');
      }

      // TODO: Replace with actual service call when riskService is available
      // const result = await riskService.calculateRiskContribution(request);
      const tickers = Object.keys(request.weights);
      const riskContributions: Record<string, number> = {};
      const marginalContributions: Record<string, number> = {};
      const percentageContributions: Record<string, number> = {};

      tickers.forEach((ticker, index) => {
        riskContributions[ticker] = 0.15 + (index * 0.05);
        marginalContributions[ticker] = 0.12 + (index * 0.03);
        percentageContributions[ticker] = request.weights[ticker] * 100;
      });

      const result: RiskContributionResponse = {
        riskContributions,
        marginalContributions,
        percentageContributions,
        diversificationRatio: 1.25,
        portfolioVolatility: 0.18,
      };

      setState((prev: UseRiskState) => ({
        ...prev,
        riskContributionResult: result,
        calculatingRiskContribution: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate risk contribution';
      setState((prev: UseRiskState) => ({
        ...prev,
        calculatingRiskContribution: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Get stress test scenarios
  const getStressTestScenarios = useCallback(() => {
    return [
      {
        value: 'financial_crisis_2008',
        label: 'Financial Crisis 2008',
        description: 'Global financial crisis impact (-50% market decline)'
      },
      {
        value: 'covid_2020',
        label: 'COVID-19 Pandemic 2020',
        description: 'Market crash due to pandemic (-35% decline)'
      },
      {
        value: 'tech_bubble_2000',
        label: 'Dot-com Crash 2000',
        description: 'Technology bubble burst (-45% decline)'
      },
      {
        value: 'black_monday_1987',
        label: 'Black Monday 1987',
        description: 'Single-day market crash (-22% decline)'
      },
      {
        value: 'inflation_shock',
        label: 'Inflation Shock',
        description: 'High inflation period impact (-20% decline)'
      },
      {
        value: 'rate_hike_2018',
        label: 'Rate Hike 2018',
        description: 'Federal Reserve rate hike impact (-18% decline)'
      },
      {
        value: 'moderate_recession',
        label: 'Moderate Recession',
        description: 'Typical recession scenario (-25% decline)'
      },
      {
        value: 'severe_recession',
        label: 'Severe Recession',
        description: 'Deep recession scenario (-45% decline)'
      }
    ];
  }, []);

  // Get confidence levels
  const getConfidenceLevels = useCallback(() => {
    return [
      { value: 0.90, label: '90%' },
      { value: 0.95, label: '95%' },
      { value: 0.99, label: '99%' },
      { value: 0.999, label: '99.9%' }
    ];
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev: UseRiskState) => ({ ...prev, error: null }));
  }, []);

  // Clear all results
  const clearResults = useCallback(() => {
    setState((prev: UseRiskState) => ({
      ...prev,
      varResult: null,
      stressTestResult: null,
      monteCarloResult: null,
      drawdownResult: null,
      riskContributionResult: null,
      error: null
    }));
  }, []);

  return {
    ...state,
    calculateVaR,
    runStressTest,
    runCustomStressTest,
    runAdvancedStressTest,
    runMonteCarloSimulation,
    calculateDrawdowns,
    calculateRiskContribution,
    getStressTestScenarios,
    getConfidenceLevels,
    clearError,
    clearResults,
  };
};

export default useRisk;