/**
 * Historical service
 * Handles historical analysis API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  HistoricalScenariosResponse,
  HistoricalContextRequest,
  HistoricalContextResponse,
  HistoricalAnalogiesRequest,
  HistoricalAnalogiesResponse,
  HistoricalScenarioRequest,
  HistoricalSimilarityRequest,
  HistoricalSimilarityResponse,
} from '../../types/historical';

/**
 * Historical Service class
 */
class HistoricalService {
  /**
   * Get list of available historical scenarios
   */
  async getHistoricalScenarios(): Promise<HistoricalScenariosResponse> {
    try {
      const response = await apiClient.get<HistoricalScenariosResponse>(
        endpoints.historical.list()
      );
      return response;
    } catch (error) {
      console.error('Error fetching historical scenarios:', error);
      throw error;
    }
  }

  /**
   * Get historical context for a scenario
   */
  async getHistoricalContext(request: HistoricalContextRequest): Promise<HistoricalContextResponse> {
    try {
      const response = await apiClient.post<HistoricalContextResponse>(
        endpoints.historical.context(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error fetching historical context:', error);
      throw error;
    }
  }

  /**
   * Find historical analogies
   */
  async findHistoricalAnalogies(request: HistoricalAnalogiesRequest): Promise<HistoricalAnalogiesResponse> {
    try {
      const response = await apiClient.post<HistoricalAnalogiesResponse>(
        endpoints.historical.analogies(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error finding historical analogies:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity score
   */
  async calculateSimilarityScore(request: HistoricalSimilarityRequest): Promise<HistoricalSimilarityResponse> {
    try {
      const response = await apiClient.post<HistoricalSimilarityResponse>(
        endpoints.historical.similarity(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error calculating similarity score:', error);
      throw error;
    }
  }

  /**
   * Add new historical scenario
   */
  async addHistoricalScenario(request: HistoricalScenarioRequest): Promise<void> {
    try {
      await apiClient.post(endpoints.historical.scenario(), request);
    } catch (error) {
      console.error('Error adding historical scenario:', error);
      throw error;
    }
  }

  /**
   * Delete historical scenario
   */
  async deleteHistoricalScenario(key: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.historical.deleteScenario(key));
    } catch (error) {
      console.error(`Error deleting historical scenario ${key}:`, error);
      throw error;
    }
  }

  /**
   * Validate historical context request
   */
  validateHistoricalContextRequest(request: HistoricalContextRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check scenario key
    if (!request.scenarioKey?.trim()) {
      errors.push('Scenario key is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate historical analogies request
   */
  validateHistoricalAnalogiesRequest(request: HistoricalAnalogiesRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check current market data
    if (!request.currentMarketData || Object.keys(request.currentMarketData).length === 0) {
      errors.push('Current market data is required');
    }

    // Validate metrics if provided
    if (request.metrics && request.metrics.length === 0) {
      errors.push('If metrics are specified, at least one metric is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate historical scenario request
   */
  validateHistoricalScenarioRequest(request: HistoricalScenarioRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.key?.trim()) {
      errors.push('Scenario key is required');
    } else if (!/^[a-zA-Z0-9_]+$/.test(request.key)) {
      errors.push('Scenario key must contain only letters, numbers, and underscores');
    }

    if (!request.name?.trim()) {
      errors.push('Scenario name is required');
    }

    if (!request.period?.trim()) {
      errors.push('Period is required');
    }

    // Check arrays
    if (!request.triggerEvents || request.triggerEvents.length === 0) {
      errors.push('At least one trigger event is required');
    }

    if (!request.keyIndicators || request.keyIndicators.length === 0) {
      errors.push('At least one key indicator is required');
    }

    if (!request.marketImpact || Object.keys(request.marketImpact).length === 0) {
      errors.push('Market impact data is required');
    }

    if (!request.policyResponse || request.policyResponse.length === 0) {
      errors.push('At least one policy response is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get predefined historical periods
   */
  getHistoricalPeriods(): Array<{ key: string; name: string; period: string; description: string }> {
    return [
      {
        key: 'great_depression',
        name: 'Great Depression',
        period: '1929-1939',
        description: 'The worst economic downturn in modern history'
      },
      {
        key: 'black_monday_1987',
        name: 'Black Monday',
        period: 'October 19, 1987',
        description: 'Stock market crash with 22% decline in one day'
      },
      {
        key: 'dot_com_crash',
        name: 'Dot-com Bubble Burst',
        period: '2000-2002',
        description: 'Technology stock bubble burst'
      },
      {
        key: 'financial_crisis_2008',
        name: 'Financial Crisis',
        period: '2007-2009',
        description: 'Global financial crisis and recession'
      },
      {
        key: 'covid_pandemic',
        name: 'COVID-19 Pandemic',
        period: '2020-2022',
        description: 'Global pandemic impact on markets'
      },
      {
        key: 'oil_crisis_1973',
        name: 'Oil Crisis',
        period: '1973-1974',
        description: 'Oil embargo and energy crisis'
      },
      {
        key: 'stagflation_1970s',
        name: 'Stagflation Period',
        period: '1970s',
        description: 'High inflation and unemployment'
      },
      {
        key: 'asian_crisis_1997',
        name: 'Asian Financial Crisis',
        period: '1997-1998',
        description: 'Currency and financial crisis in Asia'
      },
      {
        key: 'russian_crisis_1998',
        name: 'Russian Financial Crisis',
        period: '1998',
        description: 'Russian ruble devaluation and default'
      },
      {
        key: 'european_debt_crisis',
        name: 'European Debt Crisis',
        period: '2010-2012',
        description: 'Sovereign debt crisis in Europe'
      }
    ];
  }

  /**
   * Get market regime indicators
   */
  getMarketRegimeIndicators(): Array<{ key: string; name: string; description: string; normalRange: string }> {
    return [
      {
        key: 'volatility',
        name: 'Market Volatility (VIX)',
        description: 'Fear index measuring market volatility',
        normalRange: '10-20'
      },
      {
        key: 'yield_curve',
        name: 'Yield Curve Slope',
        description: 'Difference between long and short-term rates',
        normalRange: '1-3%'
      },
      {
        key: 'credit_spreads',
        name: 'Credit Spreads',
        description: 'Difference between corporate and treasury bonds',
        normalRange: '1-2%'
      },
      {
        key: 'pe_ratio',
        name: 'Market P/E Ratio',
        description: 'Price-to-earnings ratio of the market',
        normalRange: '15-20'
      },
      {
        key: 'unemployment',
        name: 'Unemployment Rate',
        description: 'Percentage of unemployed workers',
        normalRange: '3-6%'
      },
      {
        key: 'inflation',
        name: 'Inflation Rate',
        description: 'Consumer price index growth rate',
        normalRange: '2-3%'
      },
      {
        key: 'gdp_growth',
        name: 'GDP Growth',
        description: 'Economic growth rate',
        normalRange: '2-4%'
      },
      {
        key: 'interest_rates',
        name: 'Federal Funds Rate',
        description: 'Central bank policy rate',
        normalRange: '2-5%'
      }
    ];
  }

  /**
   * Format historical context for display
   */
  formatHistoricalContext(context: any): {
    summary: Record<string, string>;
    timeline: Array<{ date: string; event: string }>;
    indicators: Array<{ name: string; crisis: string; normal: string }>;
    lessons: string[];
  } {
    const summary: Record<string, string> = {
      'Event Name': context.name,
      'Time Period': context.period,
      'Duration': this.calculateDuration(context.period),
      'Trigger Events': context.triggerEvents.length.toString(),
    };

    // Create timeline from trigger events
    const timeline = context.triggerEvents.map((event: string, index: number) => ({
      date: `Event ${index + 1}`,
      event: event
    }));

    // Format key indicators
    const indicators = context.keyIndicators.map((indicator: any) => ({
      name: indicator.name,
      crisis: indicator.value,
      normal: indicator.normal
    }));

    return {
      summary,
      timeline,
      indicators,
      lessons: context.lessonsLearned || []
    };
  }

  /**
   * Format historical analogies for display
   */
  formatHistoricalAnalogies(analogies: HistoricalAnalogiesResponse): {
    topAnalogies: Array<{
      period: string;
      event: string;
      similarity: string;
      outcome: string;
      confidence: string;
    }>;
    recommendations: string[];
  } {
    const topAnalogies = analogies.analogies
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(analogy => ({
        period: analogy.period,
        event: analogy.event,
        similarity: (analogy.similarity * 100).toFixed(1) + '%',
        outcome: this.summarizeOutcome(analogy.outcome),
        confidence: this.getConfidenceLevel(analogy.similarity)
      }));

    // Aggregate recommendations from all analogies
    const allRecommendations = analogies.analogies.flatMap(a => a.recommendedActions);
    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    return {
      topAnalogies,
      recommendations: uniqueRecommendations.slice(0, 10) // Top 10 recommendations
    };
  }

  /**
   * Calculate duration from period string
   */
  private calculateDuration(period: string): string {
    // Try to extract years from period string
    const yearMatch = period.match(/(\d{4})-(\d{4})/);
    if (yearMatch) {
      const duration = parseInt(yearMatch[2]) - parseInt(yearMatch[1]);
      return `${duration} year${duration !== 1 ? 's' : ''}`;
    }

    const singleYearMatch = period.match(/(\d{4})/);
    if (singleYearMatch) {
      return 'Less than 1 year';
    }

    return 'Unknown duration';
  }

  /**
   * Summarize outcome text
   */
  private summarizeOutcome(outcome: string): string {
    if (outcome.length <= 100) {
      return outcome;
    }
    return outcome.substring(0, 97) + '...';
  }

  /**
   * Get confidence level based on similarity score
   */
  private getConfidenceLevel(similarity: number): string {
    if (similarity >= 0.8) return 'Very High';
    if (similarity >= 0.6) return 'High';
    if (similarity >= 0.4) return 'Medium';
    if (similarity >= 0.2) return 'Low';
    return 'Very Low';
  }

  /**
   * Generate analogy visualization data
   */
  generateAnalogyVisualization(analogies: HistoricalAnalogiesResponse): {
    similarityChart: Array<{ name: string; similarity: number; period: string }>;
    timelineData: Array<{ period: string; events: string[]; outcome: string }>;
  } {
    const similarityChart = analogies.analogies
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(analogy => ({
        name: analogy.event.length > 30 ? analogy.event.substring(0, 27) + '...' : analogy.event,
        similarity: analogy.similarity * 100,
        period: analogy.period
      }));

    const timelineData = analogies.analogies
      .sort((a, b) => {
        // Sort by period start year
        const yearA = parseInt(a.period.match(/\d{4}/)?.[0] || '0');
        const yearB = parseInt(b.period.match(/\d{4}/)?.[0] || '0');
        return yearA - yearB;
      })
      .map(analogy => ({
        period: analogy.period,
        events: [analogy.event],
        outcome: analogy.outcome
      }));

    return { similarityChart, timelineData };
  }
}

// Export singleton instance
export const historicalService = new HistoricalService();
export default historicalService;