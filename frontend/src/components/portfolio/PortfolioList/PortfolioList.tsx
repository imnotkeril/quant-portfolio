import React, { useState, useEffect } from 'react';
import { Portfolio } from '../../../types/portfolio';
import PortfolioCard from '../PortfolioCard/PortfolioCard';
import Card from '../../common/Card/Card';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { usePortfolios } from '../../../hooks/usePortfolios';

interface PortfolioListProps {
  portfolios?: Portfolio[];
  loading?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  showCreateButton?: boolean;
  showHeader?: boolean;
  className?: string;
  performanceData?: Record<string, { returns: number; chartData?: Array<{ date: string; value: number }> }>;
}

export const PortfolioList: React.FC<PortfolioListProps> = ({
  portfolios: propPortfolios,
  loading: propLoading,
  selectedId,
  onSelect,
  showCreateButton = true,
  showHeader = true,
  className = '',
  performanceData = {},
}) => {
  const navigate = useNavigate();
  const { portfolios: hookPortfolios, loading: hookLoading, error } = usePortfolios();

  // Use either props or hook data
  const portfolios = propPortfolios || hookPortfolios;
  const loading = propLoading !== undefined ? propLoading : hookLoading;

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]);

  // Filter portfolios based on search term
  useEffect(() => {
    if (!portfolios) {
      setFilteredPortfolios([]);
      return;
    }

    if (!searchTerm) {
      setFilteredPortfolios(portfolios);
      return;
    }

    const filtered = portfolios.filter(
      (portfolio) =>
        portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (portfolio.description && portfolio.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        portfolio.assets.some(asset => asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredPortfolios(filtered);
  }, [portfolios, searchTerm]);

  // Navigate to portfolio creation
  const handleCreatePortfolio = () => {
    navigate(ROUTES.PORTFOLIO.CREATE);
  };

  // Navigate to portfolio analysis
  const handleAnalyzePortfolio = (id: string) => {
    navigate(ROUTES.ANALYSIS.PERFORMANCE(id));
  };

  // Handle portfolio selection
  const handleSelectPortfolio = (id: string) => {
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-light">Your Portfolios</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search portfolios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-background border border-divider text-text-light text-sm rounded focus:border-accent focus:outline-none transition-colors"
            />

            {showCreateButton && (
              <button
                onClick={handleCreatePortfolio}
                className="px-4 py-2 bg-accent text-text-light text-sm rounded hover:bg-hover transition-colors"
              >
                Create Portfolio
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Card loading loadingRows={3} />
      ) : error ? (
        <Card className="text-center py-8">
          <p className="text-negative mb-2">Failed to load portfolios</p>
          <p className="text-neutral-gray text-sm">{error}</p>
        </Card>
      ) : filteredPortfolios.length === 0 ? (
        <Card className="text-center py-8">
          {searchTerm ? (
            <p className="text-neutral-gray">No portfolios found matching "{searchTerm}"</p>
          ) : (
            <>
              <p className="text-neutral-gray mb-4">You don't have any portfolios yet</p>
              {showCreateButton && (
                <button
                  onClick={handleCreatePortfolio}
                  className="px-4 py-2 bg-accent text-text-light text-sm rounded hover:bg-hover transition-colors"
                >
                  Create Your First Portfolio
                </button>
              )}
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              selected={portfolio.id === selectedId}
              onClick={() => handleSelectPortfolio(portfolio.id)}
              onAnalyze={() => handleAnalyzePortfolio(portfolio.id)}
              performance={performanceData[portfolio.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioList;