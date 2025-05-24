/**
 * Risk selectors
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';

// Base selector
export const selectRiskState = (state: RootState) => state.risk;

// VaR selectors
export const selectVaRResults = createSelector(
  selectRiskState,
  (state) => state.varResults
);

export const selectVaRLoading = createSelector(
  selectRiskState,
  (state) => state.varLoading
);

export const selectVaRError = createSelector(
  selectRiskState,
  (state) => state.varError
);

// Stress test selectors
export const selectStressTestResults = createSelector(
  selectRiskState,
  (state) => state.stressTestResults
);

export const selectStressTestLoading = createSelector(
  selectRiskState,
  (state) => state.stressTestLoading
);

export const selectStressTestError = createSelector(
  selectRiskState,
  (state) => state.stressTestError
);

// Monte Carlo selectors
export const selectMonteCarloResults = createSelector(
  selectRiskState,
  (state) => state.monteCarloResults
);

export const selectMonteCarloLoading = createSelector(
  selectRiskState,
  (state) => state.monteCarloLoading
);

export const selectMonteCarloError = createSelector(
  selectRiskState,
  (state) => state.monteCarloError
);

// Drawdown selectors
export const selectDrawdownResults = createSelector(
  selectRiskState,
  (state) => state.drawdownResults
);

export const selectDrawdownsLoading = createSelector(
  selectRiskState,
  (state) => state.drawdownsLoading
);

export const selectDrawdownsError = createSelector(
  selectRiskState,
  (state) => state.drawdownsError
);

// Risk contribution selectors
export const selectRiskContributionResults = createSelector(
  selectRiskState,
  (state) => state.riskContributionResults
);

export const selectRiskContributionLoading = createSelector(
  selectRiskState,
  (state) => state.riskContributionLoading
);

export const selectRiskContributionError = createSelector(
  selectRiskState,
  (state) => state.riskContributionError
);

// UI state selectors
export const selectSelectedPortfolioId = createSelector(
  selectRiskState,
  (state) => state.selectedPortfolioId
);

export const selectSelectedAnalysisType = createSelector(
  selectRiskState,
  (state) => state.selectedAnalysisType
);

export const selectSelectedScenarios = createSelector(
  selectRiskState,
  (state) => state.selectedScenarios
);

export const selectSelectedConfidenceLevels = createSelector(
  selectRiskState,
  (state) => state.selectedConfidenceLevels
);

export const selectSelectedTimeHorizons = createSelector(
  selectRiskState,
  (state) => state.selectedTimeHorizons
);

export const selectRiskParams = createSelector(
  selectRiskState,
  (state) => state.riskParams
);

// Loading state selectors
export const selectRiskLoading = createSelector(
  selectRiskState,
  (state) => ({
    var: state.varLoading,
    stressTest: state.stressTestLoading,
    monteCarlo: state.monteCarloLoading,
    drawdowns: state.drawdownsLoading,
    riskContribution: state.riskContributionLoading,
  })
);

export const selectAnyRiskLoading = createSelector(
  selectRiskLoading,
  (loading) => Object.values(loading).some(Boolean)
);

// Error state selectors
export const selectRiskErrors = createSelector(
  selectRiskState,
  (state) => ({
    var: state.varError,
    stressTest: state.stressTestError,
    monteCarlo: state.monteCarloError,
    drawdowns: state.drawdownsError,
    riskContribution: state.riskContributionError,
  })
);

export const selectAnyRiskError = createSelector(
  selectRiskErrors,
  (errors) => Object.values(errors).some(Boolean)
);

// Portfolio-specific selectors
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

// Combined data selectors
export const selectRiskData = createSelector(
  selectRiskState,
  (state) => ({
    varResults: state.varResults,
    stressTestResults: state.stressTestResults,
    monteCarloResults: state.monteCarloResults,
    drawdownResults: state.drawdownResults,
    riskContributionResults: state.riskContributionResults,
  })
);

export const selectHasRiskData = createSelector(
  selectRiskData,
  (data) => Object.values(data).some(results => Object.keys(results).length > 0)
);

// Computed selectors
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
        expectedValue: monteData?.percentiles?.['50.0'],
        riskContribution: contributionData?.riskContributions,
        hasCompleteAnalysis: !!(varData && stressData && monteData && drawdownData && contributionData),
      };
    }
  );

export const selectPortfoliosWithRiskData = createSelector(
  selectRiskData,
  (data) => {
    const allPortfolioIds = new Set([
      ...Object.keys(data.varResults),
      ...Object.keys(data.stressTestResults),
      ...Object.keys(data.monteCarloResults),
      ...Object.keys(data.drawdownResults),
      ...Object.keys(data.riskContributionResults),
    ]);

    return Array.from(allPortfolioIds).map(portfolioId => ({
      portfolioId,
      hasVaR: !!data.varResults[portfolioId],
      hasStressTest: !!data.stressTestResults[portfolioId],
      hasMonteCarlo: !!data.monteCarloResults[portfolioId],
      hasDrawdowns: !!data.drawdownResults[portfolioId],
      hasRiskContribution: !!data.riskContributionResults[portfolioId],
    }));
  }
);