/**
 * Portfolio actions
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioService } from '../../services/portfolio/portfolioService';
import {
  LoadPortfoliosPayload,
  LoadPortfolioPayload,
  CreatePortfolioPayload,
  UpdatePortfolioPayload,
  DeletePortfolioPayload,
  UpdatePricesPayload,
} from './types';
import {
  Portfolio,
  PortfolioListItem,
  UpdatePricesResponse
} from '../../types/portfolio';

/**
 * Load portfolios list
 */
export const loadPortfolios = createAsyncThunk<
  PortfolioListItem[],
  LoadPortfoliosPayload | void,
  { rejectValue: string }
>(
  'portfolio/loadPortfolios',
  async (payload, { rejectWithValue }) => {
    try {
      const portfolios = await portfolioService.getPortfolios();
      return portfolios;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load portfolios');
    }
  }
);

/**
 * Load single portfolio
 */
export const loadPortfolio = createAsyncThunk<
  Portfolio,
  LoadPortfolioPayload,
  { rejectValue: string }
>(
  'portfolio/loadPortfolio',
  async ({ id }, { rejectWithValue }) => {
    try {
      const portfolio = await portfolioService.getPortfolio(id);
      return portfolio;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load portfolio');
    }
  }
);

/**
 * Create new portfolio
 */
export const createPortfolio = createAsyncThunk<
  Portfolio,
  CreatePortfolioPayload,
  { rejectValue: string }
>(
  'portfolio/createPortfolio',
  async ({ portfolio }, { rejectWithValue }) => {
    try {
      const newPortfolio = await portfolioService.createPortfolio(portfolio);
      return newPortfolio;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create portfolio');
    }
  }
);

/**
 * Update portfolio
 */
export const updatePortfolio = createAsyncThunk<
  Portfolio,
  UpdatePortfolioPayload,
  { rejectValue: string }
>(
  'portfolio/updatePortfolio',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(id, updates);
      return updatedPortfolio;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update portfolio');
    }
  }
);

/**
 * Delete portfolio
 */
export const deletePortfolio = createAsyncThunk<
  string,
  DeletePortfolioPayload,
  { rejectValue: string }
>(
  'portfolio/deletePortfolio',
  async ({ id }, { rejectWithValue }) => {
    try {
      await portfolioService.deletePortfolio(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete portfolio');
    }
  }
);

/**
 * Update portfolio prices
 */
export const updatePortfolioPrices = createAsyncThunk<
  UpdatePricesResponse,
  UpdatePricesPayload,
  { rejectValue: string }
>(
  'portfolio/updatePrices',
  async ({ id }, { rejectWithValue }) => {
    try {
      const updateResult = await portfolioService.updatePortfolioPrices(id);
      return updateResult;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update prices');
    }
  }
);