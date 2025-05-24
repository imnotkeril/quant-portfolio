/**
 * Portfolio state types
 */
import { 
  Portfolio, 
  PortfolioListItem, 
  PortfolioCreate, 
  PortfolioUpdate,
  UpdatePricesResponse 
} from '../../types/portfolio';
import { ApiError } from '../../types/common';

/**
 * Portfolio state interface
 */
export interface PortfolioState {
  // Portfolio list
  portfolios: PortfolioListItem[];
  portfoliosLoading: boolean;
  portfoliosError: string | null;

  // Current portfolio
  currentPortfolio: Portfolio | null;
  currentPortfolioLoading: boolean;
  currentPortfolioError: string | null;

  // Portfolio operations
  creating: boolean;
  createError: string | null;
  updating: boolean;
  updateError: string | null;
  deleting: boolean;
  deleteError: string | null;

  // Price updates
  updatingPrices: boolean;
  priceUpdateError: string | null;
  lastPriceUpdate: UpdatePricesResponse | null;

  // UI state
  selectedPortfolioId: string | null;
  portfolioFilters: PortfolioFilters;
  portfolioSort: PortfolioSort;
}

/**
 * Portfolio filters
 */
export interface PortfolioFilters {
  search: string;
  tags: string[];
  assetCountRange: [number, number] | null;
  lastUpdatedRange: [string, string] | null;
}

/**
 * Portfolio sort options
 */
export interface PortfolioSort {
  field: 'name' | 'lastUpdated' | 'assetCount' | 'totalValue';
  direction: 'asc' | 'desc';
}

/**
 * Portfolio action payloads
 */
export interface LoadPortfoliosPayload {
  filters?: Partial<PortfolioFilters>;
  sort?: Partial<PortfolioSort>;
}

export interface LoadPortfolioPayload {
  id: string;
}

export interface CreatePortfolioPayload {
  portfolio: PortfolioCreate;
}

export interface UpdatePortfolioPayload {
  id: string;
  updates: PortfolioUpdate;
}

export interface DeletePortfolioPayload {
  id: string;
}

export interface UpdatePricesPayload {
  id: string;
}

export interface SetFiltersPayload {
  filters: Partial<PortfolioFilters>;
}

export interface SetSortPayload {
  sort: Partial<PortfolioSort>;
}

export interface SetSelectedPortfolioPayload {
  id: string | null;
}