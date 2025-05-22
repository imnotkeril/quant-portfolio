/**
 * Risk service
 * Handles risk management API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
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
} from '../../types/risk';

/**
 * Risk Service class
 */
class RiskService {
  /**
   * Calculate Value at Risk (VaR)
   */
  async calculateVaR(
    request: VaRRequest,
    method: 'parametric' | 'historical' | 'monte_carlo' = 'historical'
  ): Promise<VaRResponse> {
    try {
      const response = await apiClient.post<VaRResponse>(
        `${endpoints.risk.var()}?method=${method}`,
        request
      );
      return response;
    } catch (error) {
      console.error(`Error calculating VaR with ${method} method:`, error);
      throw error;
    }
  }

  /**
   * Calculate Conditional Value at Risk (CVaR)
   */
  async calculateCVaR(request: VaRRequest): Promise<VaRResponse> {
    try {
      const response = await apiClient.post<VaRResponse>(
        endpoints.risk.cvar(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating CVaR:', error);
      throw error;
    }
  }

  /**
   * Perform stress test
   */
  async performStressTest(request: StressTestRequest): Promise<StressTestResponse> {
    try {
      const response = await apiClient.post<StressTestResponse>(
        endpoints.risk.stressTest(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing stress test:', error);
      throw error;
    }
  }

  /**
   * Perform historical stress test
   */
  async performHistoricalStressTest(request: StressTestRequest): Promise<StressTestResponse> {
    try {
      const response = await apiClient.post<StressTestResponse>(
        endpoints.risk.historicalStressTest(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing historical stress test:', error);
      throw error;
    }
  }

  /**
   * Perform custom stress test
   */
  async performCustomStressTest(request: CustomStressTestRequest): Promise<StressTestResponse> {
    try {
      const response = await apiClient.post<StressTestResponse>(
        endpoints.risk.customStressTest(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing custom stress test:', error);
      throw error;
    }
  }

  /**
   * Perform advanced stress test
   */
  async performAdvancedStressTest(request: AdvancedStressTestRequest): Promise<StressTestResponse> {
    try {
      const response = await apiClient.post<StressTestResponse>(
        endpoints.risk.advancedStressTest(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing advanced stress test:', error);
      throw error;
    }
  }

  /**
   * Perform Monte Carlo simulation
   */
  async performMonteCarloSimulation(request: MonteCarloRequest): Promise<MonteCarloResponse> {
    try {
      const response = await apiClient.post<MonteCarloResponse>(
        endpoints.risk.monteCarlo(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Monte Carlo simulation:', error);
      throw error;
    }
  }

  /**
   * Analyze drawdowns
   */
  async analyzeDrawdowns(request: DrawdownRequest): Promise<DrawdownResponse> {
    try {
      const response = await apiClient.post<DrawdownResponse>(
        endpoints.risk.drawdowns(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error analyzing drawdowns:', error);
      throw error;
    }
  }

  /**
   * Calculate risk contribution
   */
  async calculateRiskContribution(request: RiskContributionRequest): Promise<RiskContributionResponse> {
    try {
      const response = await apiClient.post<RiskContributionResponse>(
        endpoints.risk.riskContribution(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating risk contribution:', error);
      throw error;
    }
  }

  /**
   * Validate VaR request
   */
  validateVaRRequest(request: VaRRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if returns data is provided
    if (!request.returns || Object.keys(request.returns).length === 0) {
      errors.push('Returns data is required');
    }

    // Validate confidence level
    if (request.confidenceLevel !== undefined) {
      if (isNaN(request.confidenceLevel) || request.confidenceLevel <= 0 || request.confidenceLevel >= 1) {
        errors.push('Confidence level must be between 0 and 1');
      }
    }

    // Validate time horizon
    if (request.timeHorizon !== undefined) {
      if (isNaN(request.timeHorizon) || request.timeHorizon <= 0) {
        errors.push('Time horizon must be a positive number');
      }
    }

    // Validate simulations count for Monte Carlo
    if (request.simulations !== undefined) {
      if (isNaN(request.simulations) || request.simulations <= 0 || request.simulations > 100000) {
        errors.push('Number of simulations must be between 1 and 100,000');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate stress test request
   */
  validateStressTestRequest(request: StressTestRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check scenario
    if (!request.scenario?.trim()) {
      errors.push('Scenario is required');
    }

    // Validate portfolio value
    if (request.portfolioValue !== undefined) {
      if (isNaN(request.portfolioValue) || request.portfolioValue <= 0) {
        errors.push('Portfolio value must be a positive number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Monte Carlo request
   */
  validateMonteCarloRequest(request: MonteCarloRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if returns data is provided
    if (!request.returns || Object.keys(request.returns).length === 0) {
      errors.push('Returns data is required');
    }

    // Validate initial value
    if (request.initialValue !== undefined) {
      if (isNaN(request.initialValue) || request.initialValue <= 0) {
        errors.push('Initial value must be a positive number');
      }
    }

    // Validate years
    if (request.years !== undefined) {
      if (isNaN(request.years) || request.years <= 0 || request.years > 50) {
        errors.push('Number of years must be between 1 and 50');
      }
    }

    // Validate simulations
    if (request.simulations !== undefined) {
      if (isNaN(request.simulations) || request.simulations <= 0 || request.simulations > 10000) {
        errors.push('Number of simulations must be between 1 and 10,000');
      }
    }

    // Validate annual contribution
    if (request.annualContribution !== undefined && isNaN(request.annualContribution)) {
      errors.push('Annual contribution must be a valid number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get predefined stress test scenarios
   */
  getPredefinedStressScenarios(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'market_crash_2008',
        label: '2008 Financial Crisis',
        description: 'Global financial crisis impact on markets'
      },
      {
        value: 'covid_2020',
        label: 'COVID-19 Pandemic (2020)',
        description: 'Market impact during COVID-19 outbreak'
      },
      {
        value: 'tech_bubble_2000',
        label: 'Dot-com Bubble (2000)',
        description: 'Technology sector crash in early 2000s'
      },
      {
        value: 'black_monday_1987',
        label: 'Black Monday (1987)',
        description: 'October 1987 stock market crash'
      },
      {
        value: 'oil_crisis_1973',
        label: 'Oil Crisis (1973)',
        description: '1973 oil embargo impact on markets'
      },
      {
        value: 'inflation_1970s',
        label: 'High Inflation (1970s)',
        description: 'High inflation period impact'
      },
      {
        value: 'interest_rate_shock',
        label: 'Interest Rate Shock',
        description: 'Sudden increase in interest rates'
      },
      {
        value: 'currency_crisis',
        label: 'Currency Crisis',
        description: 'Major currency devaluation impact'
      }
    ];
  }

  /**
   * Get VaR confidence levels
   */
  getVaRConfidenceLevels(): Array<{ value: number; label: string }> {
    return [
      { value: 0.90, label: '90%' },
      { value: 0.95, label: '95%' },
      { value: 0.99, label: '99%' },
      { value: 0.999, label: '99.9%' }
    ];
  }

  /**
   * Format risk metrics for display
   */
  formatRiskMetrics(metrics: Record<string, number>): Record<string, string> {
    const formatted: Record<string, string> = {};

    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Different formatting based on metric type
        if (key.toLowerCase().includes('var') || key.toLowerCase().includes('cvar') ||
            key.toLowerCase().includes('drawdown') || key.toLowerCase().includes('volatility')) {
          formatted[key] = (Math.abs(value) * 100).toFixed(2) + '%';
        } else if (key.toLowerCase().includes('ratio') || key.toLowerCase().includes('index')) {
          formatted[key] = value.toFixed(3);
        } else if (key.toLowerCase().includes('days') || key.toLowerCase().includes('time')) {
          formatted[key] = Math.round(value).toString() + ' days';
        } else {
          formatted[key] = value.toFixed(4);
        }
      } else {
        formatted[key] = String(value);
      }
    });

    return formatted;
  }

  /**
   * Format stress test results for display
   */
  formatStressTestResults(results: StressTestResponse): {
    summary: Record<string, string>;
    details: Record<string, any>;
  } {
    const summary: Record<string, string> = {
      'Scenario': results.scenarioName || results.scenario || 'Unknown',
      'Portfolio Loss': (Math.abs(results.shockPercentage) * 100).toFixed(2) + '%',
      'Loss Amount': '$' + Math.abs(results.portfolioLoss).toLocaleString(),
      'Portfolio Value After': '$' + results.portfolioAfterShock.toLocaleString(),
    };

    if (results.recoveryMonths) {
      summary['Estimated Recovery'] = results.recoveryMonths.toFixed(1) + ' months';
    }

    const details: Record<string, any> = {
      initialValue: results.portfolioValue,
      finalValue: results.portfolioAfterShock,
      absoluteLoss: results.portfolioLoss,
      percentageLoss: results.shockPercentage,
      recoveryTime: results.recoveryMonths,
      positionImpacts: results.positionImpacts,
    };

    return { summary, details };
  }

  /**
   * Calculate risk-adjusted return metrics
   */
  calculateRiskAdjustedMetrics(
    returns: number[],
    riskFreeRate: number = 0.02
  ): {
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    maxDrawdown: number;
  } {
    if (!returns || returns.length === 0) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
        maxDrawdown: 0
      };
    }

    // Calculate mean return
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

    // Calculate standard deviation
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);

    // Calculate downside deviation (for Sortino ratio)
    const downsideReturns = returns.filter(ret => ret < 0);
    const downsideVariance = downsideReturns.length > 0
      ? downsideReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / downsideReturns.length
      : 0;
    const downsideDeviation = Math.sqrt(downsideVariance);

    // Calculate cumulative returns for max drawdown
    const cumulativeReturns = [1];
    for (let i = 0; i < returns.length; i++) {
      cumulativeReturns.push(cumulativeReturns[cumulativeReturns.length - 1] * (1 + returns[i]));
    }

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = cumulativeReturns[0];

    for (let i = 1; i < cumulativeReturns.length; i++) {
      if (cumulativeReturns[i] > peak) {
        peak = cumulativeReturns[i];
      }
      const drawdown = (peak - cumulativeReturns[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    // Calculate ratios
    const excessReturn = meanReturn - riskFreeRate / 252; // Daily risk-free rate
    const sharpeRatio = stdDev > 0 ? (excessReturn * Math.sqrt(252)) / (stdDev * Math.sqrt(252)) : 0;
    const sortinoRatio = downsideDeviation > 0 ? (excessReturn * Math.sqrt(252)) / (downsideDeviation * Math.sqrt(252)) : 0;
    const annualizedReturn = Math.pow(1 + meanReturn, 252) - 1;
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;

    return {
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      maxDrawdown
    };
  }
}

// Export singleton instance
export const riskService = new RiskService();
export default riskService;