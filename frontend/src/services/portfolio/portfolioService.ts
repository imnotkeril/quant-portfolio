/**
 * Portfolio service
 * Handles portfolio-related API operations
 */
import apiClient from '../api/client';
import { portfolioEndpoints } from '../api/endpoints';
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
 * Portfolio validation result
 */
export interface PortfolioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Portfolio statistics
 */
export interface PortfolioStats {
  totalAssets: number;
  totalWeight: number;
  totalValue: number;
  sectors: Record<string, number>;
  assetClasses: Record<string, number>;
  currencies: Record<string, number>;
  countries: Record<string, number>;
  exchanges: Record<string, number>;
}

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
        portfolioEndpoints.list()
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
        portfolioEndpoints.details(id)
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
        portfolioEndpoints.create(),
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
        portfolioEndpoints.update(id),
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
      await apiClient.delete(portfolioEndpoints.delete(id));
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
        portfolioEndpoints.createFromText(),
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
        portfolioEndpoints.importCsv(),
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
      const response = await apiClient.get(
        portfolioEndpoints.exportCsv(id),
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `portfolio_${id}.csv`);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
        portfolioEndpoints.updatePrices(id)
      );
      return response;
    } catch (error) {
      console.error(`Error updating portfolio ${id} prices:`, error);
      throw error;
    }
  }

  /**
   * Add asset to portfolio
   */
  async addAssetToPortfolio(portfolioId: string, asset: AssetCreate): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(
        portfolioEndpoints.addAsset(portfolioId),
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
        portfolioEndpoints.removeAsset(portfolioId, ticker)
      );
      return response;
    } catch (error) {
      console.error(`Error removing asset ${ticker} from portfolio ${portfolioId}:`, error);
      throw error;
    }
  }

  /**
   * Validate portfolio
   */
  validatePortfolio(portfolio: PortfolioCreate): PortfolioValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic fields
    if (!portfolio.name || portfolio.name.trim().length === 0) {
      errors.push('Portfolio name is required');
    }

    if (portfolio.name && portfolio.name.trim().length > 100) {
      errors.push('Portfolio name must be less than 100 characters');
    }

    if (portfolio.description && portfolio.description.length > 500) {
      errors.push('Portfolio description must be less than 500 characters');
    }

    // Validate assets
    if (!portfolio.assets || portfolio.assets.length === 0) {
      errors.push('Portfolio must contain at least one asset');
    } else {
      this.validateAssets(portfolio.assets, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate assets
   */
  private validateAssets(assets: AssetCreate[], errors: string[], warnings: string[]): void {
    const tickers = new Set<string>();
    let totalWeight = 0;
    let assetsWithWeights = 0;

    assets.forEach((asset, index) => {
      // Validate ticker
      if (!asset.ticker || asset.ticker.trim().length === 0) {
        errors.push(`Asset ${index + 1}: Ticker is required`);
      } else {
        const ticker = asset.ticker.trim().toUpperCase();

        if (tickers.has(ticker)) {
          errors.push(`Asset ${index + 1}: Duplicate ticker "${ticker}"`);
        } else {
          tickers.add(ticker);
        }

        // Validate ticker format
        if (!/^[A-Z0-9.-]+$/.test(ticker)) {
          warnings.push(`Asset ${index + 1}: Ticker "${ticker}" may not be valid`);
        }
      }

      // Validate weight
      if (asset.weight !== undefined) {
        assetsWithWeights++;

        if (asset.weight < 0 || asset.weight > 1) {
          errors.push(`Asset ${index + 1}: Weight must be between 0 and 1`);
        } else {
          totalWeight += asset.weight;
        }
      }

      // Validate quantity
      if (asset.quantity !== undefined && asset.quantity <= 0) {
        errors.push(`Asset ${index + 1}: Quantity must be greater than 0`);
      }

      // Validate purchase price
      if (asset.purchasePrice !== undefined && asset.purchasePrice <= 0) {
        errors.push(`Asset ${index + 1}: Purchase price must be greater than 0`);
      }

      // Validate current price
      if (asset.currentPrice !== undefined && asset.currentPrice <= 0) {
        errors.push(`Asset ${index + 1}: Current price must be greater than 0`);
      }

      // Validate purchase date
      if (asset.purchaseDate) {
        const date = new Date(asset.purchaseDate);
        if (isNaN(date.getTime())) {
          errors.push(`Asset ${index + 1}: Invalid purchase date format`);
        } else if (date > new Date()) {
          errors.push(`Asset ${index + 1}: Purchase date cannot be in the future`);
        }
      }
    });

    // Validate total weight
    if (assetsWithWeights > 0) {
      if (Math.abs(totalWeight - 1) > 0.0001) {
        if (totalWeight > 1) {
          errors.push(`Total weight exceeds 100% (${(totalWeight * 100).toFixed(2)}%)`);
        } else {
          warnings.push(`Total weight is less than 100% (${(totalWeight * 100).toFixed(2)}%)`);
        }
      }
    }
  }

  /**
   * Normalize portfolio weights
   */
  normalizePortfolioWeights(portfolio: PortfolioCreate): PortfolioCreate {
    if (!portfolio.assets || portfolio.assets.length === 0) {
      return portfolio;
    }

    const assetsWithWeights = portfolio.assets.filter(asset => asset.weight !== undefined);

    if (assetsWithWeights.length === 0) {
      return portfolio;
    }

    const totalWeight = assetsWithWeights.reduce((sum, asset) => sum + (asset.weight || 0), 0);

    if (totalWeight === 0) {
      return portfolio;
    }

    return {
      ...portfolio,
      assets: portfolio.assets.map(asset => ({
        ...asset,
        weight: asset.weight !== undefined ? asset.weight / totalWeight : undefined
      }))
    };
  }

  /**
   * Calculate portfolio statistics
   */
  calculatePortfolioStats(portfolio: Portfolio): PortfolioStats {
    const stats: PortfolioStats = {
      totalAssets: portfolio.assets.length,
      totalWeight: 0,
      totalValue: portfolio.totalValue || 0,
      sectors: {},
      assetClasses: {},
      currencies: {},
      countries: {},
      exchanges: {}
    };

    portfolio.assets.forEach(asset => {
      // Calculate total weight
      if (asset.weight) {
        stats.totalWeight += asset.weight;
      }

      // Group by sector
      if (asset.sector) {
        stats.sectors[asset.sector] = (stats.sectors[asset.sector] || 0) + (asset.weight || 0);
      }

      // Group by asset class
      if (asset.assetClass) {
        stats.assetClasses[asset.assetClass] = (stats.assetClasses[asset.assetClass] || 0) + (asset.weight || 0);
      }

      // Group by currency
      if (asset.currency) {
        stats.currencies[asset.currency] = (stats.currencies[asset.currency] || 0) + (asset.weight || 0);
      }

      // Group by country
      if (asset.country) {
        stats.countries[asset.country] = (stats.countries[asset.country] || 0) + (asset.weight || 0);
      }

      // Group by exchange
      if (asset.exchange) {
        stats.exchanges[asset.exchange] = (stats.exchanges[asset.exchange] || 0) + (asset.weight || 0);
      }
    });

    return stats;
  }

  /**
   * Get portfolio diversification score
   */
  getPortfolioDiversificationScore(portfolio: Portfolio): number {
    const stats = this.calculatePortfolioStats(portfolio);

    // Calculate Herfindahl-Hirschman Index (HHI) for diversification
    const weights = portfolio.assets.map(asset => asset.weight || 0);
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);

    // Convert to diversification score (0-100, higher is more diversified)
    const maxHHI = 1; // Maximum HHI for a single asset portfolio
    const diversificationScore = ((maxHHI - hhi) / maxHHI) * 100;

    return Math.max(0, Math.min(100, diversificationScore));
  }

  /**
   * Get portfolio risk level
   */
  getPortfolioRiskLevel(portfolio: Portfolio): 'Low' | 'Medium' | 'High' {
    const stats = this.calculatePortfolioStats(portfolio);

    // Simple risk assessment based on asset classes and sectors
    const riskScore = this.calculateRiskScore(stats);

    if (riskScore < 30) return 'Low';
    if (riskScore < 70) return 'Medium';
    return 'High';
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(stats: PortfolioStats): number {
    let riskScore = 0;

    // Asset class risk weights
    const assetClassRisk = {
      'bonds': 10,
      'stocks': 50,
      'etf': 30,
      'crypto': 90,
      'commodity': 70,
      'reit': 40
    };

    // Sector risk weights
    const sectorRisk = {
      'Technology': 70,
      'Healthcare': 30,
      'Financial Services': 50,
      'Consumer Defensive': 20,
      'Consumer Cyclical': 60,
      'Energy': 80,
      'Industrial': 40,
      'Materials': 60,
      'Utilities': 20,
      'Real Estate': 40
    };

    // Calculate weighted risk from asset classes
    Object.entries(stats.assetClasses).forEach(([assetClass, weight]) => {
      const risk = assetClassRisk[assetClass.toLowerCase()] || 50;
      riskScore += (weight * risk);
    });

    // Calculate weighted risk from sectors
    Object.entries(stats.sectors).forEach(([sector, weight]) => {
      const risk = sectorRisk[sector] || 50;
      riskScore += (weight * risk * 0.5); // Lower weight for sector risk
    });

    // Normalize to 0-100 range
    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Generate portfolio summary
   */
  generatePortfolioSummary(portfolio: Portfolio): string {
    const stats = this.calculatePortfolioStats(portfolio);
    const diversificationScore = this.getPortfolioDiversificationScore(portfolio);
    const riskLevel = this.getPortfolioRiskLevel(portfolio);

    const topSectors = Object.entries(stats.sectors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([sector, weight]) => `${sector} (${(weight * 100).toFixed(1)}%)`)
      .join(', ');

    const topAssetClasses = Object.entries(stats.assetClasses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([assetClass, weight]) => `${assetClass} (${(weight * 100).toFixed(1)}%)`)
      .join(', ');

    return `Portfolio "${portfolio.name}" contains ${stats.totalAssets} assets with a ${riskLevel.toLowerCase()} risk level. ` +
           `Diversification score: ${diversificationScore.toFixed(1)}/100. ` +
           `Top sectors: ${topSectors}. ` +
           `Top asset classes: ${topAssetClasses}.`;
  }

  /**
   * Compare two portfolios
   */
  comparePortfolios(portfolio1: Portfolio, portfolio2: Portfolio): any {
    const stats1 = this.calculatePortfolioStats(portfolio1);
    const stats2 = this.calculatePortfolioStats(portfolio2);

    return {
      portfolio1: {
        name: portfolio1.name,
        assets: stats1.totalAssets,
        diversification: this.getPortfolioDiversificationScore(portfolio1),
        riskLevel: this.getPortfolioRiskLevel(portfolio1),
        topSector: Object.entries(stats1.sectors).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
        topAssetClass: Object.entries(stats1.assetClasses).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      },
      portfolio2: {
        name: portfolio2.name,
        assets: stats2.totalAssets,
        diversification: this.getPortfolioDiversificationScore(portfolio2),
        riskLevel: this.getPortfolioRiskLevel(portfolio2),
        topSector: Object.entries(stats2.sectors).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
        topAssetClass: Object.entries(stats2.assetClasses).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      }
    };
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
export default portfolioService;