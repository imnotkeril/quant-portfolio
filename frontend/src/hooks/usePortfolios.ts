import { useState, useEffect, useCallback } from 'react';
import portfolioService from '../services/portfolio/portfolioService';
import { Portfolio, PortfolioCreate, PortfolioUpdate, TextPortfolioCreate } from '../types/portfolio';

/**
 * Custom hook for managing portfolios
 */
export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all portfolios
   */
  const loadPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await portfolioService.getPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading portfolios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load a specific portfolio by ID
   */
  const loadPortfolio = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await portfolioService.getPortfolio(id);
      setPortfolio(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error loading portfolio ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new portfolio
   */
  const createPortfolio = useCallback(async (portfolioData: PortfolioCreate) => {
    setLoading(true);
    setError(null);

    try {
      const data = await portfolioService.createPortfolio(portfolioData);
      setPortfolios(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating portfolio');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a portfolio from text input
   */
  const createPortfolioFromText = useCallback(async (data: TextPortfolioCreate) => {
    setLoading(true);
    setError(null);

    try {
      const newPortfolio = await portfolioService.createPortfolioFromText(data);
      setPortfolios(prev => [...prev, newPortfolio]);
      return newPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating portfolio from text');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing portfolio
   */
  const updatePortfolio = useCallback(async (id: string, portfolioData: PortfolioUpdate) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(id, portfolioData);

      // Update portfolios list
      setPortfolios(prev =>
        prev.map(p => p.id === id ? updatedPortfolio : p)
      );

      // Update current portfolio if it's the one being updated
      if (portfolio && portfolio.id === id) {
        setPortfolio(updatedPortfolio);
      }

      return updatedPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error updating portfolio ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  /**
   * Delete a portfolio
   */
  const deletePortfolio = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await portfolioService.deletePortfolio(id);

      // Remove from portfolios list
      setPortfolios(prev => prev.filter(p => p.id !== id));

      // Clear current portfolio if it's the one being deleted
      if (portfolio && portfolio.id === id) {
        setPortfolio(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error deleting portfolio ${id}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  /**
   * Update portfolio prices
   */
  const updatePortfolioPrices = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPortfolio = await portfolioService.updatePortfolioPrices(id);

      // Update portfolios list
      setPortfolios(prev =>
        prev.map(p => p.id === id ? updatedPortfolio : p)
      );

      // Update current portfolio if it's the one being updated
      if (portfolio && portfolio.id === id) {
        setPortfolio(updatedPortfolio);
      }

      return updatedPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error updating prices for portfolio ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  /**
   * Import portfolio from CSV
   */
  const importPortfolioFromCsv = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const newPortfolio = await portfolioService.importPortfolioFromCsv(formData);
      setPortfolios(prev => [...prev, newPortfolio]);
      return newPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing portfolio from CSV');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export portfolio to CSV
   */
  const exportPortfolioCsv = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await portfolioService.exportPortfolioCsv(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error exporting portfolio ${id} to CSV`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load portfolios on initial mount
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  return {
    portfolios,
    portfolio,
    loading,
    error,
    loadPortfolios,
    loadPortfolio,
    createPortfolio,
    createPortfolioFromText,
    updatePortfolio,
    deletePortfolio,
    updatePortfolioPrices,
    importPortfolioFromCsv,
    exportPortfolioCsv
  };
};