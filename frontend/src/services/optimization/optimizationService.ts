/**
 * Optimization service
 * Handles portfolio optimization API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  OptimizationRequest,
  OptimizationResponse,
  EfficientFrontierRequest,
  EfficientFrontierResponse,
  MarkowitzRequest,
  RiskParityRequest,
  OptimizationMethod,
} from '../../types/optimization';

/**
 * Optimization Service class
 */
class OptimizationService {
  /**
   * Generic portfolio optimization
   */
  async optimizePortfolio(
    request: OptimizationRequest,
    method: OptimizationMethod = 'markowitz'
  ): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        `${endpoints.optimization.optimize()}?method=${method}`,
        request
      );
      return response;
    } catch (error) {
      console.error(`Error optimizing portfolio with ${method} method:`, error);
      throw error;
    }
  }

  /**
   * Calculate efficient frontier
   */
  async calculateEfficientFrontier(request: EfficientFrontierRequest): Promise<EfficientFrontierResponse> {
    try {
      const response = await apiClient.post<EfficientFrontierResponse>(
        endpoints.optimization.efficientFrontier(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating efficient frontier:', error);
      throw error;
    }
  }

  /**
   * Markowitz optimization
   */
  async markowitzOptimization(request: MarkowitzRequest): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        endpoints.optimization.markowitz(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Markowitz optimization:', error);
      throw error;
    }
  }

  /**
   * Risk Parity optimization
   */
  async riskParityOptimization(request: RiskParityRequest): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        endpoints.optimization.riskParity(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Risk Parity optimization:', error);
      throw error;
    }
  }

  /**
   * Minimum Variance optimization
   */
  async minimumVarianceOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        endpoints.optimization.minimumVariance(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Minimum Variance optimization:', error);
      throw error;
    }
  }

  /**
   * Maximum Sharpe optimization
   */
  async maximumSharpeOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        endpoints.optimization.maximumSharpe(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Maximum Sharpe optimization:', error);
      throw error;
    }
  }

  /**
   * Equal Weight optimization
   */
  async equalWeightOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    try {
      const response = await apiClient.post<OptimizationResponse>(
        endpoints.optimization.equalWeight(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error performing Equal Weight optimization:', error);
      throw error;
    }
  }

  /**
   * Validate optimization request
   */
  validateOptimizationRequest(
    request: OptimizationRequest,
    method: OptimizationMethod = 'markowitz'
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if we have either portfolio ID or tickers
    if (!request.portfolioId && (!request.tickers || request.tickers.length === 0)) {
      errors.push('Either portfolio ID or list of tickers is required');
    }

    // If tickers provided, validate them
    if (request.tickers && request.tickers.length > 0) {
      if (request.tickers.length < 2) {
        errors.push('At least 2 assets are required for optimization');
      }

      // Check for duplicate tickers
      const uniqueTickers = new Set(request.tickers);
      if (uniqueTickers.size !== request.tickers.length) {
        errors.push('Duplicate tickers are not allowed');
      }
    }

    // Validate dates if provided
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (isNaN(startDate.getTime())) {
        errors.push('Start date is invalid');
      }

      if (isNaN(endDate.getTime())) {
        errors.push('End date is invalid');
      }

      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }
    }

    // Validate risk-free rate
    if (request.riskFreeRate !== undefined && (isNaN(request.riskFreeRate) || request.riskFreeRate < 0)) {
      errors.push('Risk-free rate must be a valid non-negative number');
    }

    // Validate weight constraints
    if (request.minWeight !== undefined && (isNaN(request.minWeight) || request.minWeight < 0 || request.minWeight > 1)) {
      errors.push('Minimum weight must be between 0 and 1');
    }

    if (request.maxWeight !== undefined && (isNaN(request.maxWeight) || request.maxWeight < 0 || request.maxWeight > 1)) {
      errors.push('Maximum weight must be between 0 and 1');
    }

    if (request.minWeight !== undefined && request.maxWeight !== undefined && request.minWeight > request.maxWeight) {
      errors.push('Minimum weight must be less than or equal to maximum weight');
    }

    // Method-specific validation
    if (method === 'markowitz') {
      const markowitzRequest = request as MarkowitzRequest;

      if (markowitzRequest.targetReturn !== undefined && isNaN(markowitzRequest.targetReturn)) {
        errors.push('Target return must be a valid number');
      }

      if (markowitzRequest.targetRisk !== undefined && (isNaN(markowitzRequest.targetRisk) || markowitzRequest.targetRisk < 0)) {
        errors.push('Target risk must be a valid non-negative number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available optimization methods
   */
  getAvailableOptimizationMethods(): Array<{ value: OptimizationMethod; label: string; description: string }> {
    return [
      {
        value: 'markowitz',
        label: 'Markowitz (Mean-Variance)',
        description: 'Classic mean-variance optimization balancing return and risk'
      },
      {
        value: 'risk_parity',
        label: 'Risk Parity',
        description: 'Equal risk contribution from each asset'
      },
      {
        value: 'minimum_variance',
        label: 'Minimum Variance',
        description: 'Minimize portfolio volatility'
      },
      {
        value: 'maximum_sharpe',
        label: 'Maximum Sharpe',
        description: 'Maximize risk-adjusted returns (Sharpe ratio)'
      },
      {
        value: 'equal_weight',
        label: 'Equal Weight',
        description: 'Equal allocation to all assets'
      }
    ];
  }

  /**
   * Get optimization constraints template
   */
  getOptimizationConstraintsTemplate(): {
    minWeight: number;
    maxWeight: number;
    riskFreeRate: number;
    targetReturn?: number;
    targetRisk?: number;
  } {
    return {
      minWeight: 0.0,
      maxWeight: 1.0,
      riskFreeRate: 0.02, // 2% default risk-free rate
    };
  }

  /**
   * Format optimization results for display
   */
  formatOptimizationResults(results: OptimizationResponse): {
    weights: Array<{ ticker: string; weight: number; weightPercent: string }>;
    metrics: Record<string, string>;
  } {
    // Format weights
    const weights = Object.entries(results.optimalWeights).map(([ticker, weight]) => ({
      ticker,
      weight,
      weightPercent: (weight * 100).toFixed(2) + '%'
    }));

    // Format metrics
    const metrics: Record<string, string> = {
      'Expected Return': (results.expectedReturn * 100).toFixed(2) + '%',
      'Expected Risk': (results.expectedRisk * 100).toFixed(2) + '%',
    };

    // Add Sharpe ratio if available
    if (results.performanceMetrics.sharpe_ratio) {
      metrics['Sharpe Ratio'] = results.performanceMetrics.sharpe_ratio.toFixed(3);
    }

    // Add other performance metrics
    Object.entries(results.performanceMetrics).forEach(([key, value]) => {
      if (key !== 'sharpe_ratio' && typeof value === 'number') {
        metrics[key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())] = value.toFixed(4);
      }
    });

    return { weights, metrics };
  }

  /**
   * Compare optimization results
   */
  compareOptimizationResults(
    result1: OptimizationResponse,
    result2: OptimizationResponse
  ): {
    returnDifference: number;
    riskDifference: number;
    sharpeDifference?: number;
    weightDifferences: Record<string, number>;
  } {
    const returnDifference = result1.expectedReturn - result2.expectedReturn;
    const riskDifference = result1.expectedRisk - result2.expectedRisk;

    let sharpeDifference: number | undefined;
    if (result1.performanceMetrics.sharpe_ratio && result2.performanceMetrics.sharpe_ratio) {
      sharpeDifference = result1.performanceMetrics.sharpe_ratio - result2.performanceMetrics.sharpe_ratio;
    }

    // Calculate weight differences
    const allTickers = new Set([
      ...Object.keys(result1.optimalWeights),
      ...Object.keys(result2.optimalWeights)
    ]);

    const weightDifferences: Record<string, number> = {};
    allTickers.forEach(ticker => {
      const weight1 = result1.optimalWeights[ticker] || 0;
      const weight2 = result2.optimalWeights[ticker] || 0;
      weightDifferences[ticker] = weight1 - weight2;
    });

    return {
      returnDifference,
      riskDifference,
      sharpeDifference,
      weightDifferences
    };
  }
}

// Export singleton instance
export const optimizationService = new OptimizationService();
export default optimizationService;