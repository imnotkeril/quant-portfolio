/**
 * Scenario service
 * Handles scenario analysis API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  ScenarioListResponse,
  ScenarioSimulationRequest,
  ScenarioSimulationResponse,
  ScenarioImpactRequest,
  ScenarioImpactResponse,
  ScenarioChainRequest,
  ScenarioChainResponse,
  ScenarioModificationRequest,
} from '../../types/scenarios';

/**
 * Scenario Service class
 */
class ScenarioService {
  /**
   * Get list of available scenarios
   */
  async getAvailableScenarios(): Promise<ScenarioListResponse> {
    try {
      const response = await apiClient.get<ScenarioListResponse>(
        endpoints.scenario.list()
      );
      return response;
    } catch (error) {
      console.error('Error fetching available scenarios:', error);
      throw error;
    }
  }

  /**
   * Simulate scenario chain
   */
  async simulateScenarioChain(request: ScenarioSimulationRequest): Promise<ScenarioSimulationResponse> {
    try {
      const response = await apiClient.post<ScenarioSimulationResponse>(
        endpoints.scenario.simulate(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error simulating scenario chain:', error);
      throw error;
    }
  }

  /**
   * Analyze scenario impact on portfolio
   */
  async analyzeScenarioImpact(request: ScenarioImpactRequest): Promise<ScenarioImpactResponse> {
    try {
      const response = await apiClient.post<ScenarioImpactResponse>(
        endpoints.scenario.impact(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error analyzing scenario impact:', error);
      throw error;
    }
  }

  /**
   * Create scenario chain
   */
  async createScenarioChain(request: ScenarioChainRequest): Promise<ScenarioChainResponse> {
    try {
      const response = await apiClient.post<ScenarioChainResponse>(
        endpoints.scenario.chain(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error creating scenario chain:', error);
      throw error;
    }
  }

  /**
   * Modify scenario chain
   */
  async modifyScenarioChain(request: ScenarioModificationRequest): Promise<ScenarioChainResponse> {
    try {
      const response = await apiClient.put<ScenarioChainResponse>(
        endpoints.scenario.chain(),
        request
      );
      return response;
    } catch (error) {
      console.error('Error modifying scenario chain:', error);
      throw error;
    }
  }

  /**
   * Get scenario chain details
   */
  async getScenarioChain(name: string): Promise<ScenarioChainResponse> {
    try {
      const response = await apiClient.get<ScenarioChainResponse>(
        endpoints.scenario.chainDetails(name)
      );
      return response;
    } catch (error) {
      console.error(`Error fetching scenario chain ${name}:`, error);
      throw error;
    }
  }

  /**
   * Delete scenario chain
   */
  async deleteScenarioChain(name: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.scenario.deleteChain(name));
    } catch (error) {
      console.error(`Error deleting scenario chain ${name}:`, error);
      throw error;
    }
  }

  /**
   * Validate scenario simulation request
   */
  validateScenarioSimulationRequest(request: ScenarioSimulationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check starting scenario
    if (!request.startingScenario?.trim()) {
      errors.push('Starting scenario is required');
    }

    // Validate number of simulations
    if (request.numSimulations !== undefined) {
      if (isNaN(request.numSimulations) || request.numSimulations <= 0 || request.numSimulations > 10000) {
        errors.push('Number of simulations must be between 1 and 10,000');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate scenario impact request
   */
  validateScenarioImpactRequest(request: ScenarioImpactRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check portfolio data
    if (!request.portfolio || Object.keys(request.portfolio).length === 0) {
      errors.push('Portfolio data is required');
    }

    // Check scenarios
    if (!request.scenarios || request.scenarios.length === 0) {
      errors.push('At least one scenario is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate scenario chain request
   */
  validateScenarioChainRequest(request: ScenarioChainRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check name
    if (!request.name?.trim()) {
      errors.push('Scenario chain name is required');
    } else if (request.name.length > 100) {
      errors.push('Scenario chain name must be less than 100 characters');
    }

    // Check initial impact
    if (!request.initialImpact || Object.keys(request.initialImpact).length === 0) {
      errors.push('Initial impact data is required');
    }

    // Validate initial impact values
    if (request.initialImpact) {
      Object.entries(request.initialImpact).forEach(([key, value]) => {
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`Initial impact value for ${key} must be a valid number`);
        }
      });
    }

    // Validate events
    if (request.leadsTo && request.leadsTo.length > 0) {
      request.leadsTo.forEach((event, index) => {
        if (!event.scenario?.trim()) {
          errors.push(`Event ${index + 1} must have a scenario name`);
        }

        if (typeof event.probability !== 'number' || event.probability < 0 || event.probability > 1) {
          errors.push(`Event ${index + 1} probability must be between 0 and 1`);
        }

        if (typeof event.delay !== 'number' || event.delay < 0) {
          errors.push(`Event ${index + 1} delay must be a non-negative number`);
        }

        if (typeof event.magnitudeModifier !== 'number' || event.magnitudeModifier <= 0) {
          errors.push(`Event ${index + 1} magnitude modifier must be a positive number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get predefined scenario categories
   */
  getScenarioCategories(): Array<{ value: string; label: string; scenarios: string[] }> {
    return [
      {
        value: 'economic',
        label: 'Economic Scenarios',
        scenarios: [
          'recession',
          'inflation_spike',
          'deflation',
          'interest_rate_shock',
          'currency_crisis',
          'sovereign_debt_crisis'
        ]
      },
      {
        value: 'market',
        label: 'Market Scenarios',
        scenarios: [
          'market_crash',
          'sector_rotation',
          'volatility_spike',
          'liquidity_crisis',
          'flash_crash',
          'bubble_burst'
        ]
      },
      {
        value: 'geopolitical',
        label: 'Geopolitical Scenarios',
        scenarios: [
          'trade_war',
          'military_conflict',
          'sanctions',
          'brexit_type_event',
          'political_instability',
          'regulatory_changes'
        ]
      },
      {
        value: 'natural',
        label: 'Natural Disasters',
        scenarios: [
          'pandemic',
          'earthquake',
          'climate_change_impact',
          'supply_chain_disruption',
          'energy_crisis',
          'cyber_attack'
        ]
      },
      {
        value: 'technological',
        label: 'Technological Scenarios',
        scenarios: [
          'ai_disruption',
          'cyber_security_breach',
          'tech_bubble',
          'automation_impact',
          'digital_currency_adoption',
          'quantum_computing_breakthrough'
        ]
      }
    ];
  }

  /**
   * Get default simulation parameters
   */
  getDefaultSimulationParameters(): {
    numSimulations: number;
    timeHorizon: number;
    confidenceLevel: number;
  } {
    return {
      numSimulations: 1000,
      timeHorizon: 252, // 1 year in trading days
      confidenceLevel: 0.95
    };
  }

  /**
   * Format scenario impact results for display
   */
  formatScenarioImpactResults(results: ScenarioImpactResponse): {
    summary: Record<string, string>;
    detailedImpacts: Array<{
      scenario: string;
      impact: string;
      recovery: string;
      vulnerability: string;
    }>;
  } {
    const summary: Record<string, string> = {
      'Portfolio ID': results.portfolioId,
      'Scenarios Analyzed': results.analyzedScenarios.length.toString(),
      'Most Vulnerable To': this.getMostVulnerableScenario(results),
      'Most Resilient To': this.getMostResilientScenario(results),
    };

    const detailedImpacts = results.analyzedScenarios.map(scenarioName => {
      const impact = results.scenarioImpacts[scenarioName];
      return {
        scenario: scenarioName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        impact: (impact.portfolioImpact * 100).toFixed(2) + '%',
        recovery: impact.recoveryEstimate?.months
          ? `${impact.recoveryEstimate.months.toFixed(1)} months`
          : 'Unknown',
        vulnerability: this.getVulnerabilityLevel(Math.abs(impact.portfolioImpact))
      };
    });

    return { summary, detailedImpacts };
  }

  /**
   * Get most vulnerable scenario
   */
  private getMostVulnerableScenario(results: ScenarioImpactResponse): string {
    let worstScenario = '';
    let worstImpact = 0;

    Object.entries(results.scenarioImpacts).forEach(([scenario, impact]) => {
      if (Math.abs(impact.portfolioImpact) > Math.abs(worstImpact)) {
        worstImpact = impact.portfolioImpact;
        worstScenario = scenario;
      }
    });

    return worstScenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get most resilient scenario
   */
  private getMostResilientScenario(results: ScenarioImpactResponse): string {
    let bestScenario = '';
    let bestImpact = -Infinity;

    Object.entries(results.scenarioImpacts).forEach(([scenario, impact]) => {
      if (impact.portfolioImpact > bestImpact) {
        bestImpact = impact.portfolioImpact;
        bestScenario = scenario;
      }
    });

    return bestScenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get vulnerability level based on impact
   */
  private getVulnerabilityLevel(impact: number): string {
    if (impact < 0.05) return 'Low';
    if (impact < 0.15) return 'Medium';
    if (impact < 0.30) return 'High';
    return 'Very High';
  }

  /**
   * Generate scenario chain visualization data
   */
  generateVisualizationData(scenarioChain: any): {
    nodes: Array<{ id: string; label: string; probability?: number }>;
    edges: Array<{ from: string; to: string; label: string; probability: number }>;
  } {
    const nodes: Array<{ id: string; label: string; probability?: number }> = [
      {
        id: scenarioChain.name,
        label: scenarioChain.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      }
    ];

    const edges: Array<{ from: string; to: string; label: string; probability: number }> = [];

    if (scenarioChain.leadsTo) {
      scenarioChain.leadsTo.forEach((event: any) => {
        nodes.push({
          id: event.scenario,
          label: event.scenario.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          probability: event.probability
        });

        edges.push({
          from: scenarioChain.name,
          to: event.scenario,
          label: `${(event.probability * 100).toFixed(1)}%`,
          probability: event.probability
        });
      });
    }

    return { nodes, edges };
  }
}

// Export singleton instance
export const scenarioService = new ScenarioService();
export default scenarioService;