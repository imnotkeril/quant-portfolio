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
   * Calculate performance metrics for a portfolio
   */
  async calculatePerformanceMetrics(request: AnalyticsRequest): Promise<PerformanceMetricsResponse> {
    try {
      const response = await apiClient.post<PerformanceMetricsResponse>(
        endpoints.analytics.performance(),
        request
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
      const response = await apiClient.post<RiskMetricsResponse>(
        endpoints.analytics.risk(),
        request
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
      const response = await apiClient.post<ReturnsResponse>(
        `${endpoints.analytics.returns()}?period=${period}&method=${method}`,
        request
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
      const response = await apiClient.post<CumulativeReturnsResponse>(
        `${endpoints.analytics.cumulativeReturns()}?method=${method}`,
        request
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
      const response = await apiClient.post<DrawdownsResponse>(
        endpoints.analytics.drawdowns(),
        request
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

      const response = await apiClient.post<ComparisonResponse>(
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
      const response = await apiClient.post<RollingMetricsResponse>(
        endpoints.enhancedAnalytics.rollingMetrics(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating rolling metrics:', error);
      throw error;
    }
  }

  /**
   * Validate analytics request
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
    if (request.riskFreeRate !== undefined && (isNaN(request.riskFreeRate) || request.riskFreeRate < 0)) {
      errors.push('Risk-free rate must be a valid non-negative number');
    }

    // Validate periods per year
    if (request.periodsPerYear !== undefined && (isNaN(request.periodsPerYear) || request.periodsPerYear <= 0)) {
      errors.push('Periods per year must be a positive number');
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