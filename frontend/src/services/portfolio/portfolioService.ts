import apiService from '../api/client';
import endpoints from '../api/endpoints';
import { Portfolio, PortfolioCreate, PortfolioUpdate, TextPortfolioCreate } from '../../types/portfolio';

/**
 * Service for managing portfolios
 */
const portfolioService = {
  /**
   * Get list of all portfolios
   */
  getPortfolios: async () => {
    try {
      const response = await apiService.get<Portfolio[]>(endpoints.portfolios.list);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  },

  /**
   * Get a specific portfolio by ID
   */
  getPortfolio: async (id: string) => {
    try {
      const response = await apiService.get<Portfolio>(endpoints.portfolios.details(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching portfolio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new portfolio
   */
  createPortfolio: async (portfolioData: PortfolioCreate) => {
    try {
      const response = await apiService.post<Portfolio>(endpoints.portfolios.create, portfolioData);
      return response.data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  },

  /**
   * Create a portfolio from text input
   */
  createPortfolioFromText: async (data: TextPortfolioCreate) => {
    try {
      const response = await apiService.post<Portfolio>(endpoints.portfolios.fromText, data);
      return response.data;
    } catch (error) {
      console.error('Error creating portfolio from text:', error);
      throw error;
    }
  },

  /**
   * Update an existing portfolio
   */
  updatePortfolio: async (id: string, portfolioData: PortfolioUpdate) => {
    try {
      const response = await apiService.put<Portfolio>(
        endpoints.portfolios.update(id),
        portfolioData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating portfolio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a portfolio
   */
  deletePortfolio: async (id: string) => {
    try {
      const response = await apiService.delete(endpoints.portfolios.delete(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting portfolio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update portfolio prices
   */
  updatePortfolioPrices: async (id: string) => {
    try {
      const response = await apiService.post<Portfolio>(endpoints.portfolios.updatePrices(id));
      return response.data;
    } catch (error) {
      console.error(`Error updating prices for portfolio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Import portfolio from CSV
   */
  importPortfolioFromCsv: async (formData: FormData) => {
    try {
      const response = await apiService.post<Portfolio>(
        endpoints.portfolios.importCsv,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error importing portfolio from CSV:', error);
      throw error;
    }
  },

  /**
   * Export portfolio to CSV
   */
  exportPortfolioCsv: async (id: string) => {
    try {
      const response = await apiService.get<Blob>(
        endpoints.portfolios.exportCsv(id),
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `portfolio_${id}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Error exporting portfolio ${id} to CSV:`, error);
      throw error;
    }
  },
};

export default portfolioService;