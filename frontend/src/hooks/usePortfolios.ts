/**
 * Hook for managing portfolios - Updated with template and import support
 */
import { useState, useEffect, useCallback } from 'react';
import { portfolioService } from '../services/portfolio/portfolioService';
import { templateService, PortfolioTemplate } from '../services/portfolio/templateService';
import { importService, ImportValidationResult } from '../services/portfolio/importService';
import {
  Portfolio,
  PortfolioListItem,
  PortfolioCreate,
  PortfolioUpdate,
  TextPortfolioCreate,
  AssetCreate,
  UpdatePricesResponse,
} from '../types/portfolio';

interface UsePortfoliosState {
  portfolios: PortfolioListItem[];
  currentPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  updatingPrices: boolean;

  // Template state
  templates: PortfolioTemplate[];
  templatesLoading: boolean;
  templatesError: string | null;

  // Import state
  importing: boolean;
  importError: string | null;
  lastImportResult: ImportValidationResult | null;
}

interface UsePortfoliosActions {
  // Portfolio CRUD operations
  loadPortfolios: () => Promise<void>;
  loadPortfolio: (id: string) => Promise<void>;
  createPortfolio: (portfolio: PortfolioCreate) => Promise<Portfolio | null>;
  createPortfolioFromText: (portfolioText: TextPortfolioCreate) => Promise<Portfolio | null>;
  updatePortfolio: (id: string, updates: PortfolioUpdate) => Promise<Portfolio | null>;
  deletePortfolio: (id: string) => Promise<boolean>;

  // Asset management
  addAssetToPortfolio: (portfolioId: string, asset: AssetCreate) => Promise<Portfolio | null>;
  removeAssetFromPortfolio: (portfolioId: string, ticker: string) => Promise<Portfolio | null>;
  updatePortfolioPrices: (id: string) => Promise<UpdatePricesResponse | null>;

  // Import/Export operations
  importFromCSV: (file: File, name?: string, description?: string) => Promise<Portfolio | null>;
  exportToCSV: (id: string) => Promise<void>;
  importFromText: (text: string, name: string, description?: string) => Promise<Portfolio | null>;

  // Template operations
  loadTemplates: () => Promise<void>;
  getTemplateById: (id: string) => PortfolioTemplate | null;
  getTemplatesByCategory: (category: string) => PortfolioTemplate[];
  getPopularTemplates: (limit?: number) => PortfolioTemplate[];
  searchTemplates: (query: string) => PortfolioTemplate[];
  createPortfolioFromTemplate: (template: PortfolioTemplate, name?: string, description?: string) => Promise<Portfolio | null>;

  // Validation and utilities
  validatePortfolio: (portfolio: PortfolioCreate) => { isValid: boolean; errors: string[]; warnings: string[] };
  normalizePortfolioWeights: (portfolio: PortfolioCreate) => PortfolioCreate;
  calculatePortfolioStats: (portfolio: Portfolio) => any;

  // Error handling
  clearError: () => void;
  clearImportError: () => void;
  clearTemplatesError: () => void;
  clearCurrentPortfolio: () => void;
  clearLastImportResult: () => void;
}

export const usePortfolios = (): UsePortfoliosState & UsePortfoliosActions => {
  const [state, setState] = useState<UsePortfoliosState>({
    portfolios: [],
    currentPortfolio: null,
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
    updatingPrices: false,

    // Template state
    templates: [],
    templatesLoading: false,
    templatesError: null,

    // Import state
    importing: false,
    importError: null,
    lastImportResult: null,
  });

  // Load all portfolios
  const loadPortfolios = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const portfolios = await portfolioService.getPortfolios();
      setState(prev => ({ ...prev, portfolios, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load portfolios';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  // Load specific portfolio
  const loadPortfolio = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const portfolio = await portfolioService.getPortfolio(id);
      setState(prev => ({ ...prev, currentPortfolio: portfolio, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load portfolio';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        currentPortfolio: null
      }));
    }
  }, []);

  // Create new portfolio
  const createPortfolio = useCallback(async (portfolio: PortfolioCreate): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      // Validate portfolio before creating
      const validation = portfolioService.validatePortfolio(portfolio);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Normalize weights
      const normalizedPortfolio = portfolioService.normalizePortfolioWeights(portfolio);

      const newPortfolio = await portfolioService.createPortfolio(normalizedPortfolio);

      setState(prev => ({
        ...prev,
        creating: false,
        portfolios: [...prev.portfolios, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          assetCount: newPortfolio.assets.length,
          tags: newPortfolio.tags || [],
          lastUpdated: newPortfolio.lastUpdated
        }]
      }));

      return newPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create portfolio';
      setState(prev => ({ ...prev, creating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Create portfolio from text
  const createPortfolioFromText = useCallback(async (portfolioText: TextPortfolioCreate): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      const newPortfolio = await portfolioService.createPortfolioFromText(portfolioText);

      setState(prev => ({
        ...prev,
        creating: false,
        portfolios: [...prev.portfolios, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          assetCount: newPortfolio.assets.length,
          tags: newPortfolio.tags || [],
          lastUpdated: newPortfolio.lastUpdated
        }]
      }));

      return newPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create portfolio from text';
      setState(prev => ({ ...prev, creating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Update portfolio
  const updatePortfolio = useCallback(async (id: string, updates: PortfolioUpdate): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, updating: true, error: null }));

    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(id, updates);

      setState(prev => ({
        ...prev,
        updating: false,
        currentPortfolio: prev.currentPortfolio?.id === id ? updatedPortfolio : prev.currentPortfolio,
        portfolios: prev.portfolios.map(p =>
          p.id === id
            ? {
                ...p,
                name: updatedPortfolio.name,
                description: updatedPortfolio.description,
                assetCount: updatedPortfolio.assets.length,
                tags: updatedPortfolio.tags || [],
                lastUpdated: updatedPortfolio.lastUpdated
              }
            : p
        )
      }));

      return updatedPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update portfolio';
      setState(prev => ({ ...prev, updating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Delete portfolio
  const deletePortfolio = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, deleting: true, error: null }));

    try {
      await portfolioService.deletePortfolio(id);

      setState(prev => ({
        ...prev,
        deleting: false,
        portfolios: prev.portfolios.filter(p => p.id !== id),
        currentPortfolio: prev.currentPortfolio?.id === id ? null : prev.currentPortfolio
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete portfolio';
      setState(prev => ({ ...prev, deleting: false, error: errorMessage }));
      return false;
    }
  }, []);

  // Update portfolio prices
  const updatePortfolioPrices = useCallback(async (id: string): Promise<UpdatePricesResponse | null> => {
    setState(prev => ({ ...prev, updatingPrices: true, error: null }));

    try {
      const result = await portfolioService.updatePortfolioPrices(id);

      // Reload the portfolio to get updated prices
      if (state.currentPortfolio?.id === id) {
        await loadPortfolio(id);
      }

      setState(prev => ({ ...prev, updatingPrices: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update portfolio prices';
      setState(prev => ({ ...prev, updatingPrices: false, error: errorMessage }));
      return null;
    }
  }, [state.currentPortfolio?.id, loadPortfolio]);

  // Add asset to portfolio
  const addAssetToPortfolio = useCallback(async (portfolioId: string, asset: AssetCreate): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, updating: true, error: null }));

    try {
      const updatedPortfolio = await portfolioService.addAssetToPortfolio(portfolioId, asset);

      setState(prev => ({
        ...prev,
        updating: false,
        currentPortfolio: prev.currentPortfolio?.id === portfolioId ? updatedPortfolio : prev.currentPortfolio,
        portfolios: prev.portfolios.map(p =>
          p.id === portfolioId
            ? {
                ...p,
                assetCount: updatedPortfolio.assets.length,
                lastUpdated: updatedPortfolio.lastUpdated
              }
            : p
        )
      }));

      return updatedPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add asset to portfolio';
      setState(prev => ({ ...prev, updating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Remove asset from portfolio
  const removeAssetFromPortfolio = useCallback(async (portfolioId: string, ticker: string): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, updating: true, error: null }));

    try {
      const updatedPortfolio = await portfolioService.removeAssetFromPortfolio(portfolioId, ticker);

      setState(prev => ({
        ...prev,
        updating: false,
        currentPortfolio: prev.currentPortfolio?.id === portfolioId ? updatedPortfolio : prev.currentPortfolio,
        portfolios: prev.portfolios.map(p =>
          p.id === portfolioId
            ? {
                ...p,
                assetCount: updatedPortfolio.assets.length,
                lastUpdated: updatedPortfolio.lastUpdated
              }
            : p
        )
      }));

      return updatedPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove asset from portfolio';
      setState(prev => ({ ...prev, updating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Import portfolio from CSV
  const importFromCSV = useCallback(async (
    file: File,
    name?: string,
    description?: string
  ): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, importing: true, importError: null }));

    try {
      const newPortfolio = await portfolioService.importPortfolioFromCSV(file, name, description);

      setState(prev => ({
        ...prev,
        importing: false,
        portfolios: [...prev.portfolios, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          assetCount: newPortfolio.assets.length,
          tags: newPortfolio.tags || [],
          lastUpdated: newPortfolio.lastUpdated
        }]
      }));

      return newPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import portfolio from CSV';
      setState(prev => ({ ...prev, importing: false, importError: errorMessage }));
      return null;
    }
  }, []);

  // Import portfolio from text
  const importFromText = useCallback(async (
    text: string,
    name: string,
    description?: string
  ): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, importing: true, importError: null }));

    try {
      // Parse text using import service
      const parseResult = importService.parseText(text, {
        format: 'ticker-weight',
        validateWeights: true,
        normalizeWeights: true
      });

      setState(prev => ({ ...prev, lastImportResult: parseResult }));

      if (!parseResult.isValid) {
        throw new Error(parseResult.errors[0] || 'Failed to parse text');
      }

      // Convert to portfolio format
      const assets = importService.parsedAssetsToAssetCreate(parseResult.assets);
      const portfolioData: TextPortfolioCreate = {
        name,
        description,
        text
      };

      const newPortfolio = await portfolioService.createPortfolioFromText(portfolioData);

      setState(prev => ({
        ...prev,
        importing: false,
        portfolios: [...prev.portfolios, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          assetCount: newPortfolio.assets.length,
          tags: newPortfolio.tags || [],
          lastUpdated: newPortfolio.lastUpdated
        }]
      }));

      return newPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import portfolio from text';
      setState(prev => ({ ...prev, importing: false, importError: errorMessage }));
      return null;
    }
  }, []);

  // Export portfolio to CSV
  const exportToCSV = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await portfolioService.exportPortfolioToCSV(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export portfolio to CSV';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, templatesLoading: true, templatesError: null }));

    try {
      const templates = templateService.getTemplates();
      setState(prev => ({ ...prev, templates, templatesLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
      setState(prev => ({ ...prev, templatesLoading: false, templatesError: errorMessage }));
    }
  }, []);

  // Get template by ID
  const getTemplateById = useCallback((id: string): PortfolioTemplate | null => {
    return templateService.getTemplateById(id);
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string): PortfolioTemplate[] => {
    return templateService.getTemplatesByCategory(category);
  }, []);

  // Get popular templates
  const getPopularTemplates = useCallback((limit?: number): PortfolioTemplate[] => {
    return templateService.getPopularTemplates(limit);
  }, []);

  // Search templates
  const searchTemplates = useCallback((query: string): PortfolioTemplate[] => {
    return templateService.searchTemplates(query);
  }, []);

  // Create portfolio from template
  const createPortfolioFromTemplate = useCallback(async (
    template: PortfolioTemplate,
    name?: string,
    description?: string
  ): Promise<Portfolio | null> => {
    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      const assets = templateService.templateToAssets(template);
      const portfolioData: PortfolioCreate = {
        name: name || template.name,
        description: description || template.description,
        tags: template.tags,
        assets
      };

      const newPortfolio = await portfolioService.createPortfolio(portfolioData);

      setState(prev => ({
        ...prev,
        creating: false,
        portfolios: [...prev.portfolios, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          description: newPortfolio.description,
          assetCount: newPortfolio.assets.length,
          tags: newPortfolio.tags || [],
          lastUpdated: newPortfolio.lastUpdated
        }]
      }));

      return newPortfolio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create portfolio from template';
      setState(prev => ({ ...prev, creating: false, error: errorMessage }));
      return null;
    }
  }, []);

  // Validate portfolio
  const validatePortfolio = useCallback((portfolio: PortfolioCreate) => {
    return portfolioService.validatePortfolio(portfolio);
  }, []);

  // Normalize portfolio weights
  const normalizePortfolioWeights = useCallback((portfolio: PortfolioCreate) => {
    return portfolioService.normalizePortfolioWeights(portfolio);
  }, []);

  // Calculate portfolio stats
  const calculatePortfolioStats = useCallback((portfolio: Portfolio) => {
    return portfolioService.calculatePortfolioStats(portfolio);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear import error
  const clearImportError = useCallback(() => {
    setState(prev => ({ ...prev, importError: null }));
  }, []);

  // Clear templates error
  const clearTemplatesError = useCallback(() => {
    setState(prev => ({ ...prev, templatesError: null }));
  }, []);

  // Clear current portfolio
  const clearCurrentPortfolio = useCallback(() => {
    setState(prev => ({ ...prev, currentPortfolio: null }));
  }, []);

  // Clear last import result
  const clearLastImportResult = useCallback(() => {
    setState(prev => ({ ...prev, lastImportResult: null }));
  }, []);

  // Load portfolios and templates on mount
  useEffect(() => {
    loadPortfolios();
    loadTemplates();
  }, [loadPortfolios, loadTemplates]);

  return {
    ...state,
    loadPortfolios,
    loadPortfolio,
    createPortfolio,
    createPortfolioFromText,
    updatePortfolio,
    deletePortfolio,
    updatePortfolioPrices,
    addAssetToPortfolio,
    removeAssetFromPortfolio,
    importFromCSV,
    importFromText,
    exportToCSV,
    loadTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getPopularTemplates,
    searchTemplates,
    createPortfolioFromTemplate,
    validatePortfolio,
    normalizePortfolioWeights,
    calculatePortfolioStats,
    clearError,
    clearImportError,
    clearTemplatesError,
    clearCurrentPortfolio,
    clearLastImportResult,
  };
};

export default usePortfolios;