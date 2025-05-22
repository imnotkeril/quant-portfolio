/**
 * Portfolio service
 * Handles portfolio-related API operations
 */
import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';
import {
  Portfolio,
  PortfolioListItem,
  PortfolioCreate,
  PortfolioUpdate,
  TextPortfolioCreate,
  UpdatePricesResponse,
  AssetCreate,
  ApiPortfolioResponse,
  ApiPortfolioListResponse,
} from '../../types/portfolio';
import { ApiResponse } from '../../types/common';

/**
 * Portfolio Service class
 */
class PortfolioService {
  /**
   * Get list of all portfolios
   */
  async getPortfolios(): Promise<PortfolioListItem[]> {
    try {
      const response = await apiClient.get<PortfolioListItem[]>(
        endpoints.portfolio.list()
      );
      return response;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  }

  /**
   * Get portfolio by ID
   */
  async getPortfolio(id: string): Promise<Portfolio> {
    try {
      const response = await apiClient.get<Portfolio>(
        endpoints.portfolio.details(id)
      );
      return response;
    } catch (error) {
      console.error(`Error fetching portfolio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new portfolio
   */
  async createPortfolio(portfolio: PortfolioCreate): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(
        endpoints.portfolio.create(),
        portfolio
      );
      return response;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  /**
   * Update existing portfolio
   */
  async updatePortfolio(id: string, updates: PortfolioUpdate): Promise<Portfolio> {
    try {
      const response = await apiClient.put<Portfolio>(
        endpoints.portfolio.update(id),
        updates
      );
      return response;
    } catch (error) {
      console.error(`Error updating portfolio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.portfolio.delete(id));
    } catch (error) {
      console.error(`Error deleting portfolio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create portfolio from text
   */
  async createPortfolioFromText(portfolioText: TextPortfolioCreate): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(
        endpoints.portfolio.createFromText(),
        portfolioText
      );
      return response;
    } catch (error) {
      console.error('Error creating portfolio from text:', error);
      throw error;
    }
  }

  /**
   * Import portfolio from CSV
   */
  async importPortfolioFromCSV(
    file: File,
    portfolioName?: string,
    description?: string
  ): Promise<Portfolio> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (portfolioName) {
        formData.append('portfolio_name', portfolioName);
      }
      if (description) {
        formData.append('description', description);
      }

      const response = await apiClient.post<Portfolio>(
        endpoints.portfolio.importCsv(),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error importing portfolio from CSV:', error);
      throw error;
    }
  }

  /**
   * Export portfolio to CSV
   */
  async exportPortfolioToCSV(id: string): Promise<void> {
    try {
      await apiClient.downloadFile(
        endpoints.portfolio.exportCsv(id),
        `portfolio_${id}.csv`
      );
    } catch (error) {
      console.error(`Error exporting portfolio ${id} to CSV:`, error);
      throw error;
    }
  }

  /**
   * Update portfolio prices
   */
  async updatePortfolioPrices(id: string): Promise<UpdatePricesResponse> {
    try {
      const response = await apiClient.post<UpdatePricesResponse>(
        endpoints.portfolio.updatePrices(id)
      );
      return response;
    } catch (error) {
      console.error(`Error updating prices for portfolio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add asset to portfolio
   */
  async addAssetToPortfolio(portfolioId: string, asset: AssetCreate): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(
        endpoints.portfolio.addAsset(portfolioId),
        asset
      );
      return response;
    } catch (error) {
      console.error(`Error adding asset to portfolio ${portfolioId}:`, error);
      throw error;
    }
  }

  /**
   * Remove asset from portfolio
   */
  async removeAssetFromPortfolio(portfolioId: string, ticker: string): Promise<Portfolio> {
    try {
      const response = await apiClient.delete<Portfolio>(
        endpoints.portfolio.removeAsset(portfolioId, ticker)
      );
      return response;
    } catch (error) {
      console.error(`Error removing asset ${ticker} from portfolio ${portfolioId}:`, error);
      throw error;
    }
  }

  /**
   * Validate portfolio data
   */
  validatePortfolio(portfolio: PortfolioCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!portfolio.name?.trim()) {
      errors.push('Portfolio name is required');
    }

    // Check assets
    if (!portfolio.assets || portfolio.assets.length === 0) {
      errors.push('Portfolio must have at least one asset');
    } else {
      // Check each asset
      portfolio.assets.forEach((asset, index) => {
        if (!asset.ticker?.trim()) {
          errors.push(`Asset #${index + 1} must have a ticker symbol`);
        }

        if (typeof asset.weight !== 'number' || asset.weight < 0) {
          errors.push(`Asset #${index + 1} (${asset.ticker || 'unknown'}) must have a valid weight`);
        }
      });

      // Check if weights sum to 1 (with tolerance)
      const totalWeight = portfolio.assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
      if (Math.abs(totalWeight - 1) > 0.0001) {
        errors.push('Asset weights must sum to 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalize portfolio weights
   */
  normalizePortfolioWeights(portfolio: PortfolioCreate): PortfolioCreate {
    if (!portfolio.assets || portfolio.assets.length === 0) {
      return portfolio;
    }

    const totalWeight = portfolio.assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);

    if (totalWeight === 0) {
      // Equal weights if no weights specified
      const equalWeight = 1 / portfolio.assets.length;
      return {
        ...portfolio,
        assets: portfolio.assets.map(asset => ({
          ...asset,
          weight: equalWeight
        }))
      };
    }

    // Normalize weights to sum to 1
    return {
      ...portfolio,
      assets: portfolio.assets.map(asset => ({
        ...asset,
        weight: (asset.weight || 0) / totalWeight
      }))
    };
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
export default portfolioService;