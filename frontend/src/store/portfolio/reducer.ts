/**
 * Portfolio reducer
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState, PortfolioFilters, PortfolioSort } from './types';
import {
  loadPortfolios,
  loadPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  updatePortfolioPrices,
} from './actions';

const initialState: PortfolioState = {
  // Portfolio list
  portfolios: [],
  portfoliosLoading: false,
  portfoliosError: null,

  // Current portfolio
  currentPortfolio: null,
  currentPortfolioLoading: false,
  currentPortfolioError: null,

  // Portfolio operations
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deleting: false,
  deleteError: null,

  // Price updates
  updatingPrices: false,
  priceUpdateError: null,
  lastPriceUpdate: null,

  // UI state
  selectedPortfolioId: null,
  portfolioFilters: {
    search: '',
    tags: [],
    assetCountRange: null,
    lastUpdatedRange: null,
  },
  portfolioSort: {
    field: 'lastUpdated',
    direction: 'desc',
  },
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    // UI actions
    setSelectedPortfolio: (state, action: PayloadAction<string | null>) => {
      state.selectedPortfolioId = action.payload;
    },
    setPortfolioFilters: (state, action: PayloadAction<Partial<PortfolioFilters>>) => {
      state.portfolioFilters = { ...state.portfolioFilters, ...action.payload };
    },
    setPortfolioSort: (state, action: PayloadAction<Partial<PortfolioSort>>) => {
      state.portfolioSort = { ...state.portfolioSort, ...action.payload };
    },
    clearPortfolioErrors: (state) => {
      state.portfoliosError = null;
      state.currentPortfolioError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.priceUpdateError = null;
    },
    // ДОБАВЛЕНО: Additional UI actions for better UX
    resetPortfolioFilters: (state) => {
      state.portfolioFilters = {
        search: '',
        tags: [],
        assetCountRange: null,
        lastUpdatedRange: null,
      };
    },
    resetPortfolioSort: (state) => {
      state.portfolioSort = {
        field: 'lastUpdated',
        direction: 'desc',
      };
    },
    // ДОБАВЛЕНО: Clear current portfolio
    clearCurrentPortfolio: (state) => {
      state.currentPortfolio = null;
      state.currentPortfolioError = null;
    },
    // ДОБАВЛЕНО: Set portfolios loading manually (for refresh UX)
    setPortfoliosLoading: (state, action: PayloadAction<boolean>) => {
      state.portfoliosLoading = action.payload;
      if (action.payload) {
        state.portfoliosError = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Load portfolios
    builder
      .addCase(loadPortfolios.pending, (state) => {
        state.portfoliosLoading = true;
        state.portfoliosError = null;
      })
      .addCase(loadPortfolios.fulfilled, (state, action) => {
        state.portfoliosLoading = false;
        state.portfolios = action.payload;
        // ДОБАВЛЕНО: Clear errors on successful load
        state.portfoliosError = null;
      })
      .addCase(loadPortfolios.rejected, (state, action) => {
        state.portfoliosLoading = false;
        state.portfoliosError = action.payload || 'Failed to load portfolios';
      });

    // Load single portfolio
    builder
      .addCase(loadPortfolio.pending, (state) => {
        state.currentPortfolioLoading = true;
        state.currentPortfolioError = null;
      })
      .addCase(loadPortfolio.fulfilled, (state, action) => {
        state.currentPortfolioLoading = false;
        state.currentPortfolio = action.payload;
        state.currentPortfolioError = null;
      })
      .addCase(loadPortfolio.rejected, (state, action) => {
        state.currentPortfolioLoading = false;
        state.currentPortfolioError = action.payload || 'Failed to load portfolio';
      });

    // Create portfolio
    builder
      .addCase(createPortfolio.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.creating = false;
        state.portfolios.push({
          id: action.payload.id,
          name: action.payload.name,
          description: action.payload.description,
          assetCount: action.payload.assets.length,
          tags: action.payload.tags || [],
          lastUpdated: action.payload.lastUpdated,
        });
        state.currentPortfolio = action.payload;
        state.createError = null;
        // ДОБАВЛЕНО: Automatically select newly created portfolio
        state.selectedPortfolioId = action.payload.id;
      })
      .addCase(createPortfolio.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || 'Failed to create portfolio';
      });

    // Update portfolio
    builder
      .addCase(updatePortfolio.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.portfolios.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.portfolios[index] = {
            id: action.payload.id,
            name: action.payload.name,
            description: action.payload.description,
            assetCount: action.payload.assets.length,
            tags: action.payload.tags || [],
            lastUpdated: action.payload.lastUpdated,
          };
        }
        if (state.currentPortfolio?.id === action.payload.id) {
          state.currentPortfolio = action.payload;
        }
        state.updateError = null;
      })
      .addCase(updatePortfolio.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || 'Failed to update portfolio';
      });

    // Delete portfolio
    builder
      .addCase(deletePortfolio.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.deleting = false;
        state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
        if (state.currentPortfolio?.id === action.payload) {
          state.currentPortfolio = null;
        }
        if (state.selectedPortfolioId === action.payload) {
          state.selectedPortfolioId = null;
        }
        state.deleteError = null;
      })
      .addCase(deletePortfolio.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || 'Failed to delete portfolio';
      });

    // Update prices
    builder
      .addCase(updatePortfolioPrices.pending, (state) => {
        state.updatingPrices = true;
        state.priceUpdateError = null;
      })
      .addCase(updatePortfolioPrices.fulfilled, (state, action) => {
        state.updatingPrices = false;
        state.lastPriceUpdate = action.payload;
        state.priceUpdateError = null;
        // ДОБАВЛЕНО: Update lastUpdated for affected portfolio in list
        if (action.payload?.portfolioId) {
          const portfolioIndex = state.portfolios.findIndex(p => p.id === action.payload.portfolioId);
          if (portfolioIndex !== -1) {
            state.portfolios[portfolioIndex].lastUpdated = action.payload.timestamp;
          }
        }
      })
      .addCase(updatePortfolioPrices.rejected, (state, action) => {
        state.updatingPrices = false;
        state.priceUpdateError = action.payload || 'Failed to update prices';
      });
  },
});

// ОБНОВЛЕНО: Export all actions including new ones
export const {
  setSelectedPortfolio,
  setPortfolioFilters,
  setPortfolioSort,
  clearPortfolioErrors,
  resetPortfolioFilters,
  resetPortfolioSort,
  clearCurrentPortfolio,
  setPortfoliosLoading,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;