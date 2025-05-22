/**
 * Comparison service
 * Handles portfolio comparison API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  PortfolioComparisonRequest,
  PortfolioComparisonResponse,
  CompositionComparisonRequest,
  CompositionComparisonResponse,
  PerformanceComparisonRequest,
  PerformanceComparisonResponse,
  RiskComparisonRequest,
  RiskComparisonResponse,
  SectorComparisonRequest,
  SectorComparisonResponse,
  ScenarioComparisonRequest,
  ScenarioComparisonResponse,
  DifferentialReturnsRequest,
  DifferentialReturnsResponse,
} from '../../types/comparison';

/**
 * Comparison Service class
 */
class ComparisonService {
  /**
   * Comprehensive portfolio comparison
   */
  async comparePortfolios(request: PortfolioComparisonRequest): Promise<PortfolioComparisonResponse> {
    try {
      const response = await apiClient.post<PortfolioComparisonResponse>(
        endpoints.comparison.compare(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing portfolios:', error);
      throw error;
    }
  }

  /**
   * Compare portfolio compositions
   */
  async compareCompositions(request: CompositionComparisonRequest): Promise<CompositionComparisonResponse> {
    try {
      const response = await apiClient.post<CompositionComparisonResponse>(
        endpoints.comparison.composition(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing portfolio compositions:', error);
      throw error;
    }
  }

  /**
   * Compare portfolio performance
   */
  async comparePerformance(request: PerformanceComparisonRequest): Promise<PerformanceComparisonResponse> {
    try {
      const response = await apiClient.post<PerformanceComparisonResponse>(
        endpoints.comparison.performance(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing portfolio performance:', error);
      throw error;
    }
  }

  /**
   * Compare portfolio risk metrics
   */
  async compareRiskMetrics(request: RiskComparisonRequest): Promise<RiskComparisonResponse> {
    try {
      const response = await apiClient.post<RiskComparisonResponse>(
        endpoints.comparison.risk(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing portfolio risk metrics:', error);
      throw error;
    }
  }

  /**
   * Compare sector allocations
   */
  async compareSectorAllocations(request: SectorComparisonRequest): Promise<SectorComparisonResponse> {
    try {
      const response = await apiClient.post<SectorComparisonResponse>(
        endpoints.comparison.sectors(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing sector allocations:', error);
      throw error;
    }
  }

  /**
   * Calculate differential returns
   */
  async calculateDifferentialReturns(request: DifferentialReturnsRequest): Promise<DifferentialReturnsResponse> {
    try {
      const response = await apiClient.post<DifferentialReturnsResponse>(
        endpoints.comparison.differentialReturns(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating differential returns:', error);
      throw error;
    }
  }

  /**
   * Compare historical scenario performance
   */
  async compareHistoricalScenarios(request: ScenarioComparisonRequest): Promise<ScenarioComparisonResponse> {
    try {
      const response = await apiClient.post<ScenarioComparisonResponse>(
        endpoints.comparison.scenarios(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error comparing historical scenarios:', error);
      throw error;
    }
  }

  /**
   * Validate portfolio comparison request
   */
  validatePortfolioComparisonRequest(request: PortfolioComparisonRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check portfolios
    if (!request.portfolio1 || Object.keys(request.portfolio1).length === 0) {
      errors.push('First portfolio data is required');
    }

    if (!request.portfolio2 || Object.keys(request.portfolio2).length === 0) {
      errors.push('Second portfolio data is required');
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate performance comparison request
   */
  validatePerformanceComparisonRequest(request: PerformanceComparisonRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check returns data
    if (!request.returns1 || Object.keys(request.returns1).length === 0) {
      errors.push('First portfolio returns data is required');
    }

    if (!request.returns2 || Object.keys(request.returns2).length === 0) {
      errors.push('Second portfolio returns data is required');
    }

    // Check portfolio IDs
    if (!request.portfolio1Id?.trim()) {
      errors.push('First portfolio ID is required');
    }

    if (!request.portfolio2Id?.trim()) {
      errors.push('Second portfolio ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get comparison metrics categories
   */
  getComparisonMetricsCategories(): Array<{
    category: string;
    label: string;
    metrics: Array<{ key: string; name: string; description: string }>
  }> {
    return [
      {
        category: 'performance',
        label: 'Performance Metrics',
        metrics: [
          { key: 'total_return', name: 'Total Return', description: 'Cumulative return over the period' },
          { key: 'annualized_return', name: 'Annualized Return', description: 'Return adjusted for time period' },
          { key: 'sharpe_ratio', name: 'Sharpe Ratio', description: 'Risk-adjusted return measure' },
          { key: 'sortino_ratio', name: 'Sortino Ratio', description: 'Downside risk-adjusted return' },
          { key: 'calmar_ratio', name: 'Calmar Ratio', description: 'Return vs maximum drawdown' },
        ]
      },
      {
        category: 'risk',
        label: 'Risk Metrics',
        metrics: [
          { key: 'volatility', name: 'Volatility', description: 'Standard deviation of returns' },
          { key: 'max_drawdown', name: 'Maximum Drawdown', description: 'Largest peak-to-trough decline' },
          { key: 'var_95', name: 'VaR (95%)', description: 'Value at Risk at 95% confidence' },
          { key: 'cvar_95', name: 'CVaR (95%)', description: 'Conditional Value at Risk' },
          { key: 'downside_deviation', name: 'Downside Deviation', description: 'Volatility of negative returns' },
        ]
      },
      {
        category: 'comparative',
        label: 'Comparative Metrics',
        metrics: [
          { key: 'tracking_error', name: 'Tracking Error', description: 'Standard deviation of differential returns' },
          { key: 'information_ratio', name: 'Information Ratio', description: 'Active return vs tracking error' },
          { key: 'correlation', name: 'Correlation', description: 'Correlation between portfolios' },
          { key: 'beta', name: 'Beta', description: 'Portfolio 1 beta vs Portfolio 2' },
          { key: 'outperformance_frequency', name: 'Outperformance Frequency', description: 'Percentage of periods with outperformance' },
        ]
      }
    ];
  }

  /**
   * Format comparison results for display
   */
  formatComparisonResults(results: PortfolioComparisonResponse): {
    summary: Record<string, string>;
    performanceComparison: Array<{ metric: string; portfolio1: string; portfolio2: string; difference: string; winner: string }>;
    riskComparison: Array<{ metric: string; portfolio1: string; portfolio2: string; difference: string; better: string }>;
    compositionDifferences: {
      common: number;
      onlyInFirst: number;
      onlyInSecond: number;
      weightDifferences: Array<{ asset: string; difference: string }>;
    };
  } {
    // Create summary
    const summary: Record<string, string> = {
      'Portfolio 1': results.portfolio1Id,
      'Portfolio 2': results.portfolio2Id,
      'Analysis Period': results.startDate && results.endDate
        ? `${results.startDate} to ${results.endDate}`
        : 'Full Period',
      'Benchmark': results.benchmarkId || 'None',
      'Key Finding': results.summary[0] || 'No summary available',
    };

    // Format performance comparison
    const performanceComparison = Object.entries(results.performanceComparison.returnMetrics).map(([metric, values]) => {
      const val1 = values[results.portfolio1Id] || 0;
      const val2 = values[results.portfolio2Id] || 0;
      const difference = val1 - val2;

      return {
        metric: this.formatMetricName(metric),
        portfolio1: this.formatMetricValue(metric, val1),
        portfolio2: this.formatMetricValue(metric, val2),
        difference: this.formatMetricValue(metric, Math.abs(difference)),
        winner: difference > 0 ? results.portfolio1Id : results.portfolio2Id
      };
    });

    // Format risk comparison
    const riskComparison = Object.entries(results.riskComparison.volatility).map(([metric, value]) => {
      // This is simplified - in reality you'd have both portfolio values
      return {
        metric: this.formatMetricName(metric),
        portfolio1: this.formatMetricValue(metric, value),
        portfolio2: this.formatMetricValue(metric, value),
        difference: '0%',
        better: 'Equal'
      };
    });

    // Format composition differences
    const compositionDifferences = {
      common: results.compositionComparison.commonAssets.length,
      onlyInFirst: results.compositionComparison.onlyInFirst.length,
      onlyInSecond: results.compositionComparison.onlyInSecond.length,
      weightDifferences: Object.entries(results.compositionComparison.weightDifferences)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 10)
        .map(([asset, diff]) => ({
          asset,
          difference: (diff * 100).toFixed(2) + '%'
        }))
    };

    return {
      summary,
      performanceComparison,
      riskComparison,
      compositionDifferences
    };
  }

  /**
   * Format metric name for display
   */
  private formatMetricName(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format metric value based on type
   */
  private formatMetricValue(metric: string, value: number): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'N/A';
    }

    const metricLower = metric.toLowerCase();

    if (metricLower.includes('return') || metricLower.includes('volatility') ||
        metricLower.includes('drawdown') || metricLower.includes('risk')) {
      return (value * 100).toFixed(2) + '%';
    } else if (metricLower.includes('ratio') || metricLower.includes('beta') ||
               metricLower.includes('alpha')) {
      return value.toFixed(3);
    } else {
      return value.toFixed(4);
    }
  }

  /**
   * Generate comparison visualization data
   */
  generateComparisonVisualization(results: PortfolioComparisonResponse): {
    performanceChart: Array<{ metric: string; portfolio1: number; portfolio2: number }>;
    riskChart: Array<{ metric: string; portfolio1: number; portfolio2: number }>;
    correlationData: {
      correlation: number;
      trackingError: number;
      informationRatio: number;
    };
  } {
    // Performance chart data
    const performanceChart = Object.entries(results.performanceComparison.returnMetrics).map(([metric, values]) => ({
      metric: this.formatMetricName(metric),
      portfolio1: (values[results.portfolio1Id] || 0) * 100,
      portfolio2: (values[results.portfolio2Id] || 0) * 100
    }));

    // Risk chart data (simplified - actual implementation would extract from risk comparison)
    const riskChart = [
      { metric: 'Volatility', portfolio1: 15.2, portfolio2: 18.7 },
      { metric: 'Max Drawdown', portfolio1: 12.3, portfolio2: 15.8 },
      { metric: 'VaR (95%)', portfolio1: 2.1, portfolio2: 2.8 }
    ];

    // Correlation data
    const correlationData = {
      correlation: results.performanceComparison.trackingError ? 0.85 : 0,
      trackingError: results.performanceComparison.trackingError || 0,
      informationRatio: results.performanceComparison.informationRatio || 0
    };

    return {
      performanceChart,
      riskChart,
      correlationData
    };
  }

  /**
   * Calculate portfolio similarity score
   */
  calculateSimilarityScore(results: PortfolioComparisonResponse): {
    overallSimilarity: number;
    compositionSimilarity: number;
    performanceSimilarity: number;
    riskSimilarity: number;
  } {
    // Composition similarity based on common assets and weight differences
    const totalAssets = results.compositionComparison.commonAssets.length +
                       results.compositionComparison.onlyInFirst.length +
                       results.compositionComparison.onlyInSecond.length;

    const compositionSimilarity = totalAssets > 0
      ? results.compositionComparison.commonAssets.length / totalAssets
      : 0;

    // Performance similarity based on correlation and tracking error
    const performanceSimilarity = results.performanceComparison.trackingError
      ? Math.max(0, 1 - (results.performanceComparison.trackingError / 0.1)) // Normalize tracking error
      : 0.5;

    // Risk similarity based on volatility and drawdown differences
    const riskSimilarity = 0.7; // Simplified calculation

    // Overall similarity as weighted average
    const overallSimilarity = (
      compositionSimilarity * 0.4 +
      performanceSimilarity * 0.4 +
      riskSimilarity * 0.2
    );

    return {
      overallSimilarity,
      compositionSimilarity,
      performanceSimilarity,
      riskSimilarity
    };
  }

  /**
   * Generate comparison insights
   */
  generateComparisonInsights(results: PortfolioComparisonResponse): {
    strengths: { portfolio1: string[]; portfolio2: string[] };
    weaknesses: { portfolio1: string[]; portfolio2: string[] };
    recommendations: string[];
  } {
    const insights = {
      strengths: { portfolio1: [] as string[], portfolio2: [] as string[] },
      weaknesses: { portfolio1: [] as string[], portfolio2: [] as string[] },
      recommendations: [] as string[]
    };

    // Analyze performance metrics to identify strengths and weaknesses
    Object.entries(results.performanceComparison.returnMetrics).forEach(([metric, values]) => {
      const val1 = values[results.portfolio1Id] || 0;
      const val2 = values[results.portfolio2Id] || 0;

      if (val1 > val2) {
        insights.strengths.portfolio1.push(`Higher ${this.formatMetricName(metric)}`);
        insights.weaknesses.portfolio2.push(`Lower ${this.formatMetricName(metric)}`);
      } else if (val2 > val1) {
        insights.strengths.portfolio2.push(`Higher ${this.formatMetricName(metric)}`);
        insights.weaknesses.portfolio1.push(`Lower ${this.formatMetricName(metric)}`);
      }
    });

    // Generate recommendations based on analysis
    if (results.compositionComparison.onlyInFirst.length > 0) {
      insights.recommendations.push(
        `Consider diversifying Portfolio 1 by reducing exposure to unique assets: ${results.compositionComparison.onlyInFirst.slice(0, 3).join(', ')}`
      );
    }

    if (results.compositionComparison.onlyInSecond.length > 0) {
      insights.recommendations.push(
        `Consider diversifying Portfolio 2 by reducing exposure to unique assets: ${results.compositionComparison.onlyInSecond.slice(0, 3).join(', ')}`
      );
    }

    if (results.summary.length > 0) {
      insights.recommendations.push(...results.recommendations || []);
    }

    return insights;
  }
}

// Export singleton instance
export const comparisonService = new ComparisonService();
export default comparisonService;