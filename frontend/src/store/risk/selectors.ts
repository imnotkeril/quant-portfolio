/**
 * Risk store selectors
 */
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { RiskState } from './types';

/**
 * Base risk selector
 */
export const selectRisk = (state: RootState): RiskState => state.risk;

/**
 * Loading state selectors
 */
export const selectVaRLoading = createSelector(
  selectRisk,
  (risk) => risk.varLoading
);

export const selectStressTestLoading = createSelector(
  selectRisk,
  (risk) => risk.stressTestLoading
);

export const selectMonteCarloLoading = createSelector(
  selectRisk,
  (risk) => risk.monteCarloLoading
);

export const selectDrawdownsLoading = createSelector(
  selectRisk,
  (risk) => risk.drawdownsLoading
);

export const selectRiskContributionLoading = createSelector(
  selectRisk,
  (risk) => risk.riskContributionLoading
);

export const selectAnyRiskLoading = createSelector(
  selectVaRLoading,
  selectStressTestLoading,
  selectMonteCarloLoading,
  selectDrawdownsLoading,
  selectRiskContributionLoading,
  (varLoading, stressLoading, monteLoading, drawdownLoading, contributionLoading) =>
    varLoading || stressLoading || monteLoading || drawdownLoading || contributionLoading
);

/**
 * Data selectors
 */
export const selectVaRResults = createSelector(
  selectRisk,
  (risk) => risk.varResults
);

export const selectStressTestResults = createSelector(
  selectRisk,
  (risk) => risk.stressTestResults
);

export const selectMonteCarloResults = createSelector(
  selectRisk,
  (risk) => risk.monteCarloResults
);

export const selectDrawdownResults = createSelector(
  selectRisk,
  (risk) => risk.drawdownResults
);

export const selectRiskContributionResults = createSelector(
  selectRisk,
  (risk) => risk.riskContributionResults
);

/**
 * Portfolio-specific data selectors
 */
export const selectVaRForPortfolio = (portfolioId: string) =>
  createSelector(
    selectVaRResults,
    (results) => results[portfolioId]
  );

export const selectStressTestForPortfolio = (portfolioId: string) =>
  createSelector(
    selectStressTestResults,
    (results) => results[portfolioId]
  );

export const selectMonteCarloForPortfolio = (portfolioId: string) =>
  createSelector(
    selectMonteCarloResults,
    (results) => results[portfolioId]
  );

export const selectDrawdownForPortfolio = (portfolioId: string) =>
  createSelector(
    selectDrawdownResults,
    (results) => results[portfolioId]
  );

export const selectRiskContributionForPortfolio = (portfolioId: string) =>
  createSelector(
    selectRiskContributionResults,
    (results) => results[portfolioId]
  );

/**
 * Current analysis selectors
 */
export const selectCurrentPortfolioId = createSelector(
  selectRisk,
  (risk) => risk.currentPortfolioId
);

export const selectCurrentAnalysisType = createSelector(
  selectRisk,
  (risk) => risk.currentAnalysisType
);

export const selectCurrentPortfolioRiskData = createSelector(
  selectRisk,
  selectCurrentPortfolioId,
  (risk, portfolioId) => {
    if (!portfolioId) return null;

    return {
      var: risk.varResults[portfolioId],
      stressTest: risk.stressTestResults[portfolioId],
      monteCarlo: risk.monteCarloResults[portfolioId],
      drawdowns: risk.drawdownResults[portfolioId],
      riskContribution: risk.riskContributionResults[portfolioId],
    };
  }
);

/**
 * UI state selectors
 */
export const selectSelectedScenarios = createSelector(
  selectRisk,
  (risk) => risk.selectedScenarios
);

export const selectSelectedConfidenceLevels = createSelector(
  selectRisk,
  (risk) => risk.selectedConfidenceLevels
);

export const selectSelectedTimeHorizons = createSelector(
  selectRisk,
  (risk) => risk.selectedTimeHorizons
);

/**
 * Cache selectors
 */
export const selectVaRCache = createSelector(
  selectRisk,
  (risk) => risk.cache.varCache
);

export const selectStressTestCache = createSelector(
  selectRisk,
  (risk) => risk.cache.stressTestCache
);

export const selectMonteCarloCache = createSelector(
  selectRisk,
  (risk) => risk.cache.monteCarloCache
);

export const selectCachedVaRForPortfolio = (portfolioId: string) =>
  createSelector(
    selectVaRCache,
    (cache) => cache[portfolioId]
  );

export const selectCachedStressTestForPortfolio = (portfolioId: string) =>
  createSelector(
    selectStressTestCache,
    (cache) => cache[portfolioId]
  );

export const selectCachedMonteCarloForPortfolio = (portfolioId: string) =>
  createSelector(
    selectMonteCarloCache,
    (cache) => cache[portfolioId]
  );

/**
 * Error selectors
 */
export const selectRiskErrors = createSelector(
  selectRisk,
  (risk) => risk.errors
);

export const selectVaRError = createSelector(
  selectRiskErrors,
  (errors) => errors.var
);

export const selectStressTestError = createSelector(
  selectRiskErrors,
  (errors) => errors.stressTest
);

export const selectMonteCarloError = createSelector(
  selectRiskErrors,
  (errors) => errors.monteCarlo
);

export const selectDrawdownsError = createSelector(
  selectRiskErrors,
  (errors) => errors.drawdowns
);

export const selectRiskContributionError = createSelector(
  selectRiskErrors,
  (errors) => errors.riskContribution
);

export const selectHasAnyRiskError = createSelector(
  selectRiskErrors,
  (errors) => Object.values(errors).some(error => error !== null)
);

/**
 * Settings selectors
 */
export const selectRiskSettings = createSelector(
  selectRisk,
  (risk) => risk.settings
);

export const selectDefaultConfidenceLevel = createSelector(
  selectRiskSettings,
  (settings) => settings.defaultConfidenceLevel
);

export const selectDefaultTimeHorizon = createSelector(
  selectRiskSettings,
  (settings) => settings.defaultTimeHorizon
);

export const selectDefaultSimulations = createSelector(
  selectRiskSettings,
  (settings) => settings.defaultSimulations
);

export const selectAutoRefresh = createSelector(
  selectRiskSettings,
  (settings) => settings.autoRefresh
);

export const selectRefreshInterval = createSelector(
  selectRiskSettings,
  (settings) => settings.refreshInterval
);

/**
 * Computed selectors
 */
export const selectPortfoliosWithRiskData = createSelector(
  selectVaRResults,
  selectStressTestResults,
  selectMonteCarloResults,
  selectDrawdownResults,
  selectRiskContributionResults,
  (varResults, stressResults, monteResults, drawdownResults, contributionResults) => {
    const allPortfolioIds = new Set([
      ...Object.keys(varResults),
      ...Object.keys(stressResults),
      ...Object.keys(monteResults),
      ...Object.keys(drawdownResults),
      ...Object.keys(contributionResults),
    ]);

    return Array.from(allPortfolioIds).map(portfolioId => ({
      portfolioId,
      hasVaR: !!varResults[portfolioId],
      hasStressTest: !!stressResults[portfolioId],
      hasMonteCarlo: !!monteResults[portfolioId],
      hasDrawdowns: !!drawdownResults[portfolioId],
      hasRiskContribution: !!contributionResults[portfolioId],
    }));
  }
);

export const selectRiskSummaryForPortfolio = (portfolioId: string) =>
  createSelector(
    selectVaRForPortfolio(portfolioId),
    selectStressTestForPortfolio(portfolioId),
    selectMonteCarloForPortfolio(portfolioId),
    selectDrawdownForPortfolio(portfolioId),
    selectRiskContributionForPortfolio(portfolioId),
    (varData, stressData, monteData, drawdownData, contributionData) => {
      if (!varData && !stressData && !monteData && !drawdownData && !contributionData) {
        return null;
      }

      return {
        portfolioId,
        var95: varData?.var,
        worstCaseScenario: stressData?.scenarioName,
        maxDrawdown: drawdownData?.maxDrawdown,
        expectedValue: monteData?.percentiles?.mean,
        riskContribution: contributionData?.riskContributions,
        hasCompleteAnalysis: !!(varData && stressData && monteData && drawdownData && contributionData),
      };
    }
  );

/**
 * Cache utility selectors
 */
export const selectIsCacheValid = (cacheTimestamp: number, maxAge: number = 300000) => // 5 minutes default
  createSelector(
    () => Date.now(),
    (now) => now - cacheTimestamp < maxAge
  );

export const selectShouldRefreshData = (portfolioId: string) =>
  createSelector(
    selectCachedVaRForPortfolio(portfolioId),
    selectCachedStressTestForPortfolio(portfolioId),
    selectCachedMonteCarloForPortfolio(portfolioId),
    selectAutoRefresh,
    selectRefreshInterval,
    (varCache, stressCache, monteCache, autoRefresh, refreshInterval) => {
      if (!autoRefresh) return false;

      const now = Date.now();
      const shouldRefreshVar = !varCache || (now - varCache.timestamp) > refreshInterval;
      const shouldRefreshStress = !stressCache || (now - stressCache.timestamp) > refreshInterval;
      const shouldRefreshMonte = !monteCache || (now - monteCache.timestamp) > refreshInterval;

      return shouldRefreshVar || shouldRefreshStress || shouldRefreshMonte;
    }
  );