/**
 * Scenarios store selectors
 */
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { ScenariosState } from './types';

/**
 * Base scenarios selector
 */
export const selectScenarios = (state: RootState): ScenariosState => state.scenarios;

/**
 * Loading state selectors
 */
export const selectScenariosLoading = createSelector(
  selectScenarios,
  (scenarios) => scenarios.scenariosLoading
);

export const selectSimulationLoading = createSelector(
  selectScenarios,
  (scenarios) => scenarios.simulationLoading
);

export const selectImpactAnalysisLoading = createSelector(
  selectScenarios,
  (scenarios) => scenarios.impactAnalysisLoading
);

export const selectChainManagementLoading = createSelector(
  selectScenarios,
  (scenarios) => scenarios.chainManagementLoading
);

export const selectAnyScenariosLoading = createSelector(
  selectScenariosLoading,
  selectSimulationLoading,
  selectImpactAnalysisLoading,
  selectChainManagementLoading,
  (scenariosLoading, simulationLoading, impactLoading, chainLoading) =>
    scenariosLoading || simulationLoading || impactLoading || chainLoading
);

/**
 * Data selectors
 */
export const selectAvailableScenarios = createSelector(
  selectScenarios,
  (scenarios) => scenarios.availableScenarios
);

export const selectSimulationResults = createSelector(
  selectScenarios,
  (scenarios) => scenarios.simulationResults
);

export const selectImpactResults = createSelector(
  selectScenarios,
  (scenarios) => scenarios.impactResults
);

export const selectScenarioChains = createSelector(
  selectScenarios,
  (scenarios) => scenarios.scenarioChains
);

export const selectCustomScenarios = createSelector(
  selectScenarios,
  (scenarios) => scenarios.customScenarios
);

/**
 * Specific data selectors
 */
export const selectSimulationById = (simulationId: string) =>
  createSelector(
    selectSimulationResults,
    (results) => results[simulationId]
  );

export const selectImpactForPortfolio = (portfolioId: string) =>
  createSelector(
    selectImpactResults,
    (results) => results[portfolioId]
  );

export const selectChainByName = (chainName: string) =>
  createSelector(
    selectScenarioChains,
    (chains) => chains[chainName]
  );

export const selectCustomScenarioById = (scenarioId: string) =>
  createSelector(
    selectCustomScenarios,
    (scenarios) => scenarios[scenarioId]
  );

/**
 * Current analysis selectors
 */
export const selectCurrentPortfolioId = createSelector(
  selectScenarios,
  (scenarios) => scenarios.currentPortfolioId
);

export const selectSelectedScenarios = createSelector(
  selectScenarios,
  (scenarios) => scenarios.selectedScenarios
);

export const selectActiveSimulation = createSelector(
  selectScenarios,
  (scenarios) => scenarios.activeSimulation
);

export const selectCurrentPortfolioImpact = createSelector(
  selectScenarios,
  selectCurrentPortfolioId,
  (scenarios, portfolioId) => {
    if (!portfolioId) return null;
    return scenarios.impactResults[portfolioId];
  }
);

/**
 * UI state selectors
 */
export const selectViewMode = createSelector(
  selectScenarios,
  (scenarios) => scenarios.viewMode
);

export const selectSelectedChain = createSelector(
  selectScenarios,
  (scenarios) => scenarios.selectedChain
);

export const selectChainVisualizationData = createSelector(
  selectScenarios,
  (scenarios) => scenarios.chainVisualizationData
);

export const selectSelectedChainData = createSelector(
  selectScenarios,
  selectSelectedChain,
  (scenarios, selectedChain) => {
    if (!selectedChain) return null;
    return scenarios.scenarioChains[selectedChain];
  }
);

/**
 * Parameters selectors
 */
export const selectSimulationParameters = createSelector(
  selectScenarios,
  (scenarios) => scenarios.simulationParameters
);

export const selectNumSimulations = createSelector(
  selectSimulationParameters,
  (parameters) => parameters.numSimulations
);

export const selectConfidenceLevel = createSelector(
  selectSimulationParameters,
  (parameters) => parameters.confidenceLevel
);

export const selectTimeHorizon = createSelector(
  selectSimulationParameters,
  (parameters) => parameters.timeHorizon
);

/**
 * Cache selectors
 */
export const selectScenarioListCache = createSelector(
  selectScenarios,
  (scenarios) => scenarios.cache.scenarioListCache
);

export const selectSimulationCache = createSelector(
  selectScenarios,
  (scenarios) => scenarios.cache.simulationCache
);

export const selectImpactCache = createSelector(
  selectScenarios,
  (scenarios) => scenarios.cache.impactCache
);

export const selectCachedSimulation = (simulationId: string) =>
  createSelector(
    selectSimulationCache,
    (cache) => cache[simulationId]
  );

export const selectCachedImpact = (portfolioId: string) =>
  createSelector(
    selectImpactCache,
    (cache) => cache[portfolioId]
  );

/**
 * Error selectors
 */
export const selectScenariosErrors = createSelector(
  selectScenarios,
  (scenarios) => scenarios.errors
);

export const selectScenariosError = createSelector(
  selectScenariosErrors,
  (errors) => errors.scenarios
);

export const selectSimulationError = createSelector(
  selectScenariosErrors,
  (errors) => errors.simulation
);

export const selectImpactError = createSelector(
  selectScenariosErrors,
  (errors) => errors.impact
);

export const selectChainManagementError = createSelector(
  selectScenariosErrors,
  (errors) => errors.chainManagement
);

export const selectHasAnyScenariosError = createSelector(
  selectScenariosErrors,
  (errors) => Object.values(errors).some(error => error !== null)
);

/**
 * Settings selectors
 */
export const selectScenariosSettings = createSelector(
  selectScenarios,
  (scenarios) => scenarios.settings
);

export const selectAutoRunSimulations = createSelector(
  selectScenariosSettings,
  (settings) => settings.autoRunSimulations
);

export const selectDefaultSimulations = createSelector(
  selectScenariosSettings,
  (settings) => settings.defaultSimulations
);

export const selectCacheTimeout = createSelector(
  selectScenariosSettings,
  (settings) => settings.cacheTimeout
);

export const selectMaxConcurrentAnalyses = createSelector(
  selectScenariosSettings,
  (settings) => settings.maxConcurrentAnalyses
);

/**
 * Computed selectors
 */
export const selectAllScenarios = createSelector(
  selectAvailableScenarios,
  selectCustomScenarios,
  (available, custom) => {
    const customScenarioNames = Object.keys(custom);
    return [...available, ...customScenarioNames];
  }
);

export const selectScenarioCategories = createSelector(
  selectAvailableScenarios,
  selectCustomScenarios,
  (available, custom) => {
    // Group scenarios by category
    const categories = {
      predefined: available,
      custom: Object.keys(custom),
    };

    return categories;
  }
);

export const selectPortfoliosWithImpactData = createSelector(
  selectImpactResults,
  (results) => Object.keys(results)
);

export const selectSimulationSummary = createSelector(
  selectSimulationResults,
  (results) => {
    const simulations = Object.entries(results);

    return {
      totalSimulations: simulations.length,
      completedSimulations: simulations.filter(([, result]) => result.simulationResults).length,
      averageImpact: simulations.length > 0
        ? simulations.reduce((sum, [, result]) => {
            const totalImpact = result.simulationResults?.reduce((impactSum, sim) => {
              const portfolioImpact = Object.values(sim.totalImpact || {}).reduce((a, b) => a + b, 0);
              return impactSum + portfolioImpact;
            }, 0) || 0;
            return sum + totalImpact;
          }, 0) / simulations.length
        : 0,
    };
  }
);

export const selectChainsSummary = createSelector(
  selectScenarioChains,
  (chains) => {
    const chainEntries = Object.entries(chains);

    return {
      totalChains: chainEntries.length,
      averageChainLength: chainEntries.length > 0
        ? chainEntries.reduce((sum, [, chain]) => {
            return sum + (chain.scenarioChain?.leadsTo?.length || 0);
          }, 0) / chainEntries.length
        : 0,
      mostComplexChain: chainEntries.reduce((max, [name, chain]) => {
        const complexity = chain.scenarioChain?.leadsTo?.length || 0;
        return complexity > max.complexity ? { name, complexity } : max;
      }, { name: '', complexity: 0 }),
    };
  }
);

export const selectScenarioImpactSummary = (portfolioId: string) =>
  createSelector(
    selectImpactForPortfolio(portfolioId),
    (impact) => {
      if (!impact) return null;

      const scenarios = Object.entries(impact.scenarioImpacts);

      return {
        portfolioId,
        totalScenariosAnalyzed: scenarios.length,
        worstScenario: scenarios.reduce((worst, [name, data]) => {
          return data.portfolioImpact < worst.impact
            ? { name, impact: data.portfolioImpact }
            : worst;
        }, { name: '', impact: 0 }),
        bestScenario: scenarios.reduce((best, [name, data]) => {
          return data.portfolioImpact > best.impact
            ? { name, impact: data.portfolioImpact }
            : best;
        }, { name: '', impact: -Infinity }),
        averageImpact: scenarios.length > 0
          ? scenarios.reduce((sum, [, data]) => sum + data.portfolioImpact, 0) / scenarios.length
          : 0,
        vulnerabilities: impact.portfolioVulnerabilities || [],
        recommendations: impact.recommendedActions || [],
      };
    }
  );

/**
 * Cache utility selectors
 */
export const selectIsCacheValid = (timestamp: number, timeout: number) =>
  createSelector(
    () => Date.now(),
    (now) => now - timestamp < timeout
  );

export const selectShouldRefreshScenarios = createSelector(
  selectScenarioListCache,
  selectCacheTimeout,
  (cache, timeout) => {
    if (!cache) return true;
    return Date.now() - cache.timestamp > timeout;
  }
);

export const selectShouldRefreshImpact = (portfolioId: string) =>
  createSelector(
    selectCachedImpact(portfolioId),
    selectCacheTimeout,
    (cache, timeout) => {
      if (!cache) return true;
      return Date.now() - cache.timestamp > timeout;
    }
  );

/**
 * Selection utility selectors
 */
export const selectIsScenarioSelected = (scenarioName: string) =>
  createSelector(
    selectSelectedScenarios,
    (selected) => selected.includes(scenarioName)
  );

export const selectSelectedScenariosData = createSelector(
  selectSelectedScenarios,
  selectAvailableScenarios,
  selectCustomScenarios,
  (selected, available, custom) => {
    return selected.map(name => {
      if (available.includes(name)) {
        return { name, type: 'predefined' as const };
      } else if (custom[name]) {
        return { name, type: 'custom' as const, data: custom[name] };
      }
      return { name, type: 'unknown' as const };
    }).filter(item => item.type !== 'unknown');
  }
);

export const selectCanRunSimulation = createSelector(
  selectSelectedScenarios,
  selectCurrentPortfolioId,
  selectSimulationLoading,
  (selectedScenarios, portfolioId, loading) => {
    return selectedScenarios.length > 0 && portfolioId && !loading;
  }
);

export const selectCanAnalyzeImpact = createSelector(
  selectSelectedScenarios,
  selectCurrentPortfolioId,
  selectImpactAnalysisLoading,
  (selectedScenarios, portfolioId, loading) => {
    return selectedScenarios.length > 0 && portfolioId && !loading;
  }
);