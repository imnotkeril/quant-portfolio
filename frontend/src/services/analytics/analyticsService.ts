/**
 * Analytics service
 * Handles analytics-related API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  AnalyticsRequest,
  PerformanceMetricsResponse,
  RiskMetricsResponse,
  ReturnsResponse,
  CumulativeReturnsResponse,
  DrawdownsResponse,
  ComparisonResponse,
  RollingMetricsRequest,
  RollingMetricsResponse,
  EnhancedAnalyticsRequest,
} from '../../types/analytics';
import { formatDate } from '../../utils/formatters';

/**
 * Analytics Service class
 */
class AnalyticsService {
  /**
   * Build query parameters from analytics request
   */
  private buildQueryParams(request: AnalyticsRequest): URLSearchParams {
    const params = new URLSearchParams();

    params.append('portfolio_id', request.portfolioId);

    if (request.startDate) {
      params.append('start_date', request.startDate);
    }

    if (request.endDate) {
      params.append('end_date', request.endDate);
    }

    if (request.benchmark) {
      params.append('benchmark', request.benchmark);
    }

    if (request.riskFreeRate !== undefined) {
      params.append('risk_free_rate', request.riskFreeRate.toString());
    }

    if (request.periodsPerYear !== undefined) {
      params.append('periods_per_year', request.periodsPerYear.toString());
    }

    if (request.confidenceLevel !== undefined) {
      params.append('confidence_level', request.confidenceLevel.toString());
    }

    return params;
  }

  /**
   * Calculate performance metrics for a portfolio
   */
  async calculatePerformanceMetrics(request: AnalyticsRequest): Promise<PerformanceMetricsResponse> {
    try {
      const params = this.buildQueryParams(request);

      const response = await apiClient.get<PerformanceMetricsResponse>(
        `${endpoints.analytics.performance()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate risk metrics for a portfolio
   */
  async calculateRiskMetrics(request: AnalyticsRequest): Promise<RiskMetricsResponse> {
    try {
      const params = this.buildQueryParams(request);

      const response = await apiClient.get<RiskMetricsResponse>(
        `${endpoints.analytics.risk()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate returns for a portfolio
   */
  async calculateReturns(
    request: AnalyticsRequest,
    period: string = 'daily',
    method: string = 'simple'
  ): Promise<ReturnsResponse> {
    try {
      const params = this.buildQueryParams(request);
      params.append('period', period);
      params.append('method', method);

      const response = await apiClient.get<ReturnsResponse>(
        `${endpoints.analytics.returns()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating returns:', error);
      throw error;
    }
  }

  /**
   * Calculate cumulative returns for a portfolio
   */
  async calculateCumulativeReturns(
    request: AnalyticsRequest,
    method: string = 'simple'
  ): Promise<CumulativeReturnsResponse> {
    try {
      const params = this.buildQueryParams(request);
      params.append('method', method);

      const response = await apiClient.get<CumulativeReturnsResponse>(
        `${endpoints.analytics.cumulativeReturns()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating cumulative returns:', error);
      throw error;
    }
  }

  /**
   * Calculate drawdowns for a portfolio
   */
  async calculateDrawdowns(request: AnalyticsRequest): Promise<DrawdownsResponse> {
    try {
      const params = this.buildQueryParams(request);

      const response = await apiClient.get<DrawdownsResponse>(
        `${endpoints.analytics.drawdowns()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating drawdowns:', error);
      throw error;
    }
  }

  /**
   * Compare two portfolios
   */
  async comparePortfolios(
    portfolio1Id: string,
    portfolio2Id: string,
    startDate?: string,
    endDate?: string,
    benchmark?: string
  ): Promise<ComparisonResponse> {
    try {
      const params = new URLSearchParams();
      params.append('portfolio_id1', portfolio1Id);
      params.append('portfolio_id2', portfolio2Id);

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (benchmark) params.append('benchmark', benchmark);

      const response = await apiClient.get<ComparisonResponse>(
        `${endpoints.analytics.compare()}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error comparing portfolios:', error);
      throw error;
    }
  }

  /**
   * Calculate rolling metrics
   */
  async calculateRollingMetrics(request: RollingMetricsRequest): Promise<RollingMetricsResponse> {
    try {
      // For rolling metrics, keep POST since it's more complex data
      const requestData = {
        portfolio_id: request.portfolioId,
        start_date: request.startDate,
        end_date: request.endDate,
        benchmark: request.benchmark,
        risk_free_rate: request.riskFreeRate,
        periods_per_year: request.periodsPerYear,
        confidence_level: request.confidenceLevel,
        window: request.window,
        metrics: request.metrics,
        min_periods: request.minPeriods,
      };

      const response = await apiClient.post<RollingMetricsResponse>(
        endpoints.enhancedAnalytics.rollingMetrics(),
        requestData
      );
      return response;
    } catch (error) {
      console.error('Error calculating rolling metrics:', error);
      throw error;
    }
  }

  /**
   * Validate analytics request data
   */
  validateAnalyticsRequest(request: AnalyticsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.portfolioId?.trim()) {
      errors.push('Portfolio ID is required');
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
    if (request.riskFreeRate !== undefined && (request.riskFreeRate < 0 || request.riskFreeRate > 1)) {
      errors.push('Risk-free rate must be between 0 and 1');
    }

    // Validate confidence level
    if (request.confidenceLevel !== undefined && (request.confidenceLevel <= 0 || request.confidenceLevel >= 1)) {
      errors.push('Confidence level must be between 0 and 1');
    }

    // Validate periods per year
    if (request.periodsPerYear !== undefined && request.periodsPerYear <= 0) {
      errors.push('Periods per year must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default date range (1 year)
   */
  getDefaultDateRange(): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    return {
      startDate: formatDate(startDate, 'short'),
      endDate: formatDate(endDate, 'short')
    };
  }

  /**
   * Get predefined time ranges
   */
  getPredefinedTimeRanges(): Record<string, { startDate: string; endDate: string; label: string }> {
    const today = new Date();
    const ranges: Record<string, { startDate: string; endDate: string; label: string }> = {};

    // 1 Month
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    ranges['1M'] = {
      startDate: formatDate(oneMonthAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '1 Month'
    };

    // 3 Months
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    ranges['3M'] = {
      startDate: formatDate(threeMonthsAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '3 Months'
    };

    // 6 Months
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    ranges['6M'] = {
      startDate: formatDate(sixMonthsAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '6 Months'
    };

    // 1 Year
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    ranges['1Y'] = {
      startDate: formatDate(oneYearAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '1 Year'
    };

    // 2 Years
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    ranges['2Y'] = {
      startDate: formatDate(twoYearsAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '2 Years'
    };

    // 5 Years
    const fiveYearsAgo = new Date(today);
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    ranges['5Y'] = {
      startDate: formatDate(fiveYearsAgo, 'short'),
      endDate: formatDate(today, 'short'),
      label: '5 Years'
    };

    // YTD (Year to Date)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    ranges['YTD'] = {
      startDate: formatDate(startOfYear, 'short'),
      endDate: formatDate(today, 'short'),
      label: 'Year to Date'
    };

    return ranges;
  }

  /**
   * Format metrics for display
   */
  formatMetricsForDisplay(metrics: Record<string, number>): Record<string, string> {
    const formatted: Record<string, string> = {};

    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Different formatting based on metric type
        if (key.toLowerCase().includes('ratio') || key.toLowerCase().includes('beta') || key.toLowerCase().includes('alpha')) {
          formatted[key] = value.toFixed(3);
        } else if (key.toLowerCase().includes('return') || key.toLowerCase().includes('volatility') || key.toLowerCase().includes('drawdown')) {
          formatted[key] = (value * 100).toFixed(2) + '%';
        } else {
          formatted[key] = value.toFixed(4);
        }
      } else {
        formatted[key] = String(value);
      }
    });

    return formatted;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;