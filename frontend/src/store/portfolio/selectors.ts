/**
 * Portfolio selectors
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
export const selectPortfolioState = (state: RootState) => state.portfolio;

// Portfolio list selectors
export const selectPortfolios = createSelector(
  selectPortfolioState,
  (state) => state.portfolios
);

export const selectPortfoliosLoading = createSelector(
  selectPortfolioState,
  (state) => state.portfoliosLoading
);

export const selectPortfoliosError = createSelector(
  selectPortfolioState,
  (state) => state.portfoliosError
);

// Current portfolio selectors
export const selectCurrentPortfolio = createSelector(
  selectPortfolioState,
  (state) => state.currentPortfolio
);

export const selectCurrentPortfolioLoading = createSelector(
  selectPortfolioState,
  (state) => state.currentPortfolioLoading
);

export const selectCurrentPortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.currentPortfolioError
);

// Selected portfolio selectors
export const selectSelectedPortfolioId = createSelector(
  selectPortfolioState,
  (state) => state.selectedPortfolioId
);

export const selectSelectedPortfolio = createSelector(
  [selectPortfolios, selectSelectedPortfolioId],
  (portfolios, selectedId) => {
    if (!selectedId) return null;
    return portfolios.find(p => p.id === selectedId) || null;
  }
);

// Operation status selectors
export const selectPortfolioOperations = createSelector(
  selectPortfolioState,
  (state) => ({
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    updatingPrices: state.updatingPrices,
  })
);

export const selectCreatePortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.createError
);

export const selectUpdatePortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.updateError
);

export const selectDeletePortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.deleteError
);

export const selectPriceUpdateError = createSelector(
  selectPortfolioState,
  (state) => state.priceUpdateError
);

export const selectLastPriceUpdate = createSelector(
  selectPortfolioState,
  (state) => state.lastPriceUpdate
);

// Filter and sort selectors
export const selectPortfolioFilters = createSelector(
  selectPortfolioState,
  (state) => state.portfolioFilters
);

export const selectPortfolioSort = createSelector(
  selectPortfolioState,
  (state) => state.portfolioSort
);

// Filtered and sorted portfolios
export const selectFilteredPortfolios = createSelector(
  [selectPortfolios, selectPortfolioFilters, selectPortfolioSort],
  (portfolios, filters, sort) => {
    let filtered = [...portfolios];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags.some(tag => p.tags.includes(tag))
      );
    }

    // Apply asset count range filter
    if (filters.assetCountRange) {
      const [min, max] = filters.assetCountRange;
      filtered = filtered.filter(p => p.assetCount >= min && p.assetCount <= max);
    }

    // Apply last updated range filter
    if (filters.lastUpdatedRange) {
      const [startDate, endDate] = filters.lastUpdatedRange;
      filtered = filtered.filter(p => {
        const lastUpdated = new Date(p.lastUpdated);
        return lastUpdated >= new Date(startDate) && lastUpdated <= new Date(endDate);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      // Handle date sorting
      if (sort.field === 'lastUpdated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }
);

// Portfolio statistics selectors - ИСПРАВЛЕНО: защита от undefined
export const selectPortfolioStats = createSelector(
  selectPortfolios,
  (portfolios) => ({
    totalPortfolios: portfolios.length,
    totalAssets: portfolios.reduce((sum, p) => sum + (p.assetCount || 0), 0),
    avgAssetsPerPortfolio: portfolios.length > 0
      ? Math.round(portfolios.reduce((sum, p) => sum + (p.assetCount || 0), 0) / portfolios.length)
      : 0,
    allTags: Array.from(new Set(portfolios.flatMap(p => p.tags || []))).sort(),
    lastUpdated: portfolios.length > 0
      ? portfolios.reduce((latest, p) =>
          new Date(p.lastUpdated || new Date()) > new Date(latest.lastUpdated || new Date()) ? p : latest
        ).lastUpdated
      : null
  })
);

// Portfolio by ID selector factory
export const selectPortfolioById = (id: string) =>
  createSelector(
    selectPortfolios,
    (portfolios) => portfolios.find(p => p.id === id) || null
  );

// Additional helper selectors
export const selectIsAnyPortfolioLoading = createSelector(
  selectPortfolioState,
  (state) => state.portfoliosLoading || state.creating || state.updating || state.deleting
);

export const selectHasAnyPortfolioError = createSelector(
  selectPortfolioState,
  (state) => !!(state.portfoliosError || state.createError || state.updateError || state.deleteError)
);

// Portfolio count by status
export const selectPortfolioStatsByStatus = createSelector(
  [selectPortfolios, selectPortfolioOperations],
  (portfolios, operations) => ({
    total: portfolios.length,
    loaded: portfolios.length,
    creating: operations.creating,
    updating: operations.updating,
    deleting: operations.deleting,
  })
);