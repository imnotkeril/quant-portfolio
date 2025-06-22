/**
 * Portfolio Selector Component
 * Allows users to select a portfolio for analysis
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button/Button';
import { Card } from '../../components/common/Card/Card';
import { Badge } from '../../components/common/Badge/Badge';
import { ROUTES } from '../../constants/routes';
import styles from './PortfolioSelector.module.css';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  dailyReturn: number;
  totalReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: string;
  lastUpdated: string;
  status: 'Active' | 'Inactive';
}

const PortfolioSelector: React.FC = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockPortfolios: Portfolio[] = [
      {
        id: 'portfolio-1',
        name: 'Growth Portfolio',
        description: 'High-growth technology stocks with moderate risk',
        totalValue: 125000,
        dailyReturn: 0.8,
        totalReturn: 15.4,
        riskLevel: 'High',
        createdAt: '2024-01-15',
        lastUpdated: '2025-06-23',
        status: 'Active'
      },
      {
        id: 'portfolio-2',
        name: 'Conservative Portfolio',
        description: 'Blue-chip stocks and bonds for stable returns',
        totalValue: 89000,
        dailyReturn: -0.2,
        totalReturn: 8.1,
        riskLevel: 'Low',
        createdAt: '2024-02-10',
        lastUpdated: '2025-06-23',
        status: 'Active'
      },
      {
        id: 'portfolio-3',
        name: 'Dividend Portfolio',
        description: 'High-dividend yielding stocks for income generation',
        totalValue: 76500,
        dailyReturn: 0.3,
        totalReturn: 12.7,
        riskLevel: 'Medium',
        createdAt: '2024-03-05',
        lastUpdated: '2025-06-22',
        status: 'Active'
      },
      {
        id: 'portfolio-4',
        name: 'International Portfolio',
        description: 'Diversified global equity exposure',
        totalValue: 42300,
        dailyReturn: -0.5,
        totalReturn: 6.8,
        riskLevel: 'Medium',
        createdAt: '2024-04-20',
        lastUpdated: '2025-06-21',
        status: 'Inactive'
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setPortfolios(mockPortfolios);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
  };

  const handleAnalyze = () => {
    if (selectedPortfolio) {
      navigate(ROUTES.PORTFOLIO.ANALYSIS_PATH(selectedPortfolio));
    }
  };

  const handleCreatePortfolio = () => {
    navigate(ROUTES.PORTFOLIO.CREATE);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'neutral';
    }
  };

  const getReturnColorClass = (value: number) => {
    return value >= 0 ? styles.positive : styles.negative;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Portfolio Analysis</h1>
          <p className={styles.subtitle}>Select a portfolio to analyze</p>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Portfolio Analysis</h1>
          <p className={styles.subtitle}>
            Select a portfolio to view detailed performance analytics, risk metrics, and insights
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreatePortfolio}
          className={styles.createButton}
        >
          Create New Portfolio
        </Button>
      </div>

      {portfolios.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No Portfolios Found</h3>
            <p className={styles.emptyDescription}>
              Create your first portfolio to start analyzing your investments
            </p>
            <Button variant="primary" onClick={handleCreatePortfolio}>
              Create Portfolio
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.portfoliosGrid}>
            {portfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                className={`${styles.portfolioCard} ${
                  selectedPortfolio === portfolio.id ? styles.selected : ''
                } ${portfolio.status === 'Inactive' ? styles.inactive : ''}`}
                onClick={() => handlePortfolioSelect(portfolio.id)}
              >
                <div className={styles.portfolioHeader}>
                  <div className={styles.portfolioInfo}>
                    <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                    <p className={styles.portfolioDescription}>
                      {portfolio.description}
                    </p>
                  </div>
                  <div className={styles.portfolioBadges}>
                    <Badge
                      variant={getRiskBadgeVariant(portfolio.riskLevel)}
                      size="small"
                    >
                      {portfolio.riskLevel} Risk
                    </Badge>
                    <Badge
                      variant={portfolio.status === 'Active' ? 'success' : 'neutral'}
                      size="small"
                    >
                      {portfolio.status}
                    </Badge>
                  </div>
                </div>

                <div className={styles.portfolioMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Total Value</span>
                    <span className={styles.metricValue}>
                      {formatCurrency(portfolio.totalValue)}
                    </span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Daily Return</span>
                    <span className={`${styles.metricValue} ${getReturnColorClass(portfolio.dailyReturn)}`}>
                      {formatPercentage(portfolio.dailyReturn)}
                    </span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Total Return</span>
                    <span className={`${styles.metricValue} ${getReturnColorClass(portfolio.totalReturn)}`}>
                      {formatPercentage(portfolio.totalReturn)}
                    </span>
                  </div>
                </div>

                <div className={styles.portfolioFooter}>
                  <span className={styles.lastUpdated}>
                    Updated: {new Date(portfolio.lastUpdated).toLocaleDateString()}
                  </span>
                  {selectedPortfolio === portfolio.id && (
                    <div className={styles.selectedIndicator}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className={styles.actionBar}>
            <div className={styles.selectionInfo}>
              {selectedPortfolio ? (
                <span className={styles.selectedText}>
                  Selected: {portfolios.find(p => p.id === selectedPortfolio)?.name}
                </span>
              ) : (
                <span className={styles.selectPrompt}>
                  Select a portfolio to begin analysis
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="large"
              onClick={handleAnalyze}
              disabled={!selectedPortfolio}
              className={styles.analyzeButton}
            >
              Analyze Portfolio
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioSelector;