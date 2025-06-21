/**
 * PortfolioSelector Component
 * Multi-select component for choosing portfolios to compare
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Card } from '../../common/Card/Card';
import { Input } from '../../common/Input/Input';
import { Checkbox } from '../../common/Checkbox/Checkbox';
import styles from './PortfolioSelector.module.css';

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  value?: number;
  lastUpdated?: string;
  returnYTD?: number;
  sharpeRatio?: number;
  volatility?: number;
}

interface PortfolioSelectorProps {
  selectedPortfolios: string[];
  onSelectionChange: (portfolioIds: string[]) => void;
  maxSelection?: number;
  minSelection?: number;
  portfolios?: Portfolio[];
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  selectedPortfolios,
  onSelectionChange,
  maxSelection = 10,
  minSelection = 2,
  portfolios = [],
  className,
  disabled = false,
  'data-testid': testId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'return'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock portfolios data if not provided
  const defaultPortfolios: Portfolio[] = [
    {
      id: 'portfolio_1',
      name: 'Conservative Growth',
      description: 'Low-risk diversified portfolio',
      value: 125000,
      lastUpdated: '2024-01-15',
      returnYTD: 8.5,
      sharpeRatio: 1.2,
      volatility: 12.3,
    },
    {
      id: 'portfolio_2',
      name: 'Aggressive Tech',
      description: 'High-growth technology focused',
      value: 87500,
      lastUpdated: '2024-01-15',
      returnYTD: 15.2,
      sharpeRatio: 1.8,
      volatility: 24.1,
    },
    {
      id: 'portfolio_3',
      name: 'Dividend Income',
      description: 'Focus on dividend-paying stocks',
      value: 156000,
      lastUpdated: '2024-01-15',
      returnYTD: 6.8,
      sharpeRatio: 0.9,
      volatility: 9.7,
    },
    {
      id: 'portfolio_4',
      name: 'International Exposure',
      description: 'Global diversification strategy',
      value: 95000,
      lastUpdated: '2024-01-15',
      returnYTD: 11.3,
      sharpeRatio: 1.4,
      volatility: 16.8,
    },
    {
      id: 'portfolio_5',
      name: 'ESG Focused',
      description: 'Environmental and social governance',
      value: 112000,
      lastUpdated: '2024-01-15',
      returnYTD: 9.7,
      sharpeRatio: 1.1,
      volatility: 14.5,
    },
  ];

  const availablePortfolios = portfolios.length > 0 ? portfolios : defaultPortfolios;

  // Filter portfolios based on search term
  const filteredPortfolios = availablePortfolios.filter(portfolio =>
    portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (portfolio.description && portfolio.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort portfolios
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'value':
        comparison = (a.value || 0) - (b.value || 0);
        break;
      case 'return':
        comparison = (a.returnYTD || 0) - (b.returnYTD || 0);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle portfolio selection
  const handlePortfolioToggle = (portfolioId: string) => {
    if (disabled) return;

    const isSelected = selectedPortfolios.includes(portfolioId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedPortfolios.filter(id => id !== portfolioId);
    } else {
      if (selectedPortfolios.length >= maxSelection) {
        return; // Max selection reached
      }
      newSelection = [...selectedPortfolios, portfolioId];
    }

    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (disabled) return;

    const visibleIds = sortedPortfolios.map(p => p.id);
    const availableSlots = maxSelection - selectedPortfolios.length;
    const toSelect = visibleIds.slice(0, availableSlots);

    onSelectionChange([...selectedPortfolios, ...toSelect]);
  };

  // Handle clear selection
  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  // Handle sort change
  const handleSort = (field: 'name' | 'value' | 'return') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const containerClasses = classNames(
    styles.container,
    {
      [styles.disabled]: disabled,
    },
    className
  );

  const canSelectMore = selectedPortfolios.length < maxSelection;
  const hasMinimumSelection = selectedPortfolios.length >= minSelection;

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>Select Portfolios to Compare</h3>
          <span className={styles.selectionCount}>
            {selectedPortfolios.length} of {maxSelection} selected
            {!hasMinimumSelection && (
              <span className={styles.minWarning}>
                (minimum {minSelection} required)
              </span>
            )}
          </span>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="text"
            size="small"
            onClick={handleSelectAll}
            disabled={disabled || !canSelectMore || sortedPortfolios.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleClearAll}
            disabled={disabled || selectedPortfolios.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <Input
            type="search"
            placeholder="Search portfolios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            }
            iconPosition="left"
          />
        </div>

        <div className={styles.sortSection}>
          <span className={styles.sortLabel}>Sort by:</span>
          <div className={styles.sortButtons}>
            <Button
              variant={sortBy === 'name' ? 'primary' : 'outline'}
              size="small"
              onClick={() => handleSort('name')}
              disabled={disabled}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'value' ? 'primary' : 'outline'}
              size="small"
              onClick={() => handleSort('value')}
              disabled={disabled}
            >
              Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'return' ? 'primary' : 'outline'}
              size="small"
              onClick={() => handleSort('return')}
              disabled={disabled}
            >
              Return {sortBy === 'return' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.portfolioList}>
        {sortedPortfolios.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>No portfolios found matching your search</p>
          </div>
        ) : (
          sortedPortfolios.map((portfolio) => {
            const isSelected = selectedPortfolios.includes(portfolio.id);
            const canSelect = canSelectMore || isSelected;

            return (
              <Card
                key={portfolio.id}
                className={classNames(styles.portfolioCard, {
                  [styles.selected]: isSelected,
                  [styles.disabled]: disabled || !canSelect,
                })}
                onClick={() => canSelect && handlePortfolioToggle(portfolio.id)}
                hoverable={canSelect && !disabled}
              >
                <div className={styles.portfolioContent}>
                  <div className={styles.portfolioHeader}>
                    <div className={styles.portfolioInfo}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => canSelect && handlePortfolioToggle(portfolio.id)}
                        disabled={disabled || !canSelect}
                        className={styles.portfolioCheckbox}
                      />
                      <div className={styles.portfolioDetails}>
                        <h4 className={styles.portfolioName}>{portfolio.name}</h4>
                        {portfolio.description && (
                          <p className={styles.portfolioDescription}>
                            {portfolio.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {portfolio.value && (
                      <div className={styles.portfolioValue}>
                        {formatCurrency(portfolio.value)}
                      </div>
                    )}
                  </div>

                  <div className={styles.portfolioMetrics}>
                    {portfolio.returnYTD !== undefined && (
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>YTD Return:</span>
                        <span className={classNames(styles.metricValue, {
                          [styles.positive]: portfolio.returnYTD >= 0,
                          [styles.negative]: portfolio.returnYTD < 0,
                        })}>
                          {formatPercentage(portfolio.returnYTD)}
                        </span>
                      </div>
                    )}

                    {portfolio.sharpeRatio !== undefined && (
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Sharpe Ratio:</span>
                        <span className={styles.metricValue}>
                          {portfolio.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {portfolio.volatility !== undefined && (
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Volatility:</span>
                        <span className={styles.metricValue}>
                          {portfolio.volatility.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {portfolio.lastUpdated && (
                    <div className={styles.lastUpdated}>
                      Last updated: {new Date(portfolio.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedPortfolios.length > 0 && (
        <div className={styles.selectedSummary}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>Selected Portfolios:</span>
            <div className={styles.selectedList}>
              {selectedPortfolios.map((portfolioId) => {
                const portfolio = availablePortfolios.find(p => p.id === portfolioId);
                return portfolio ? (
                  <span key={portfolioId} className={styles.selectedTag}>
                    {portfolio.name}
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handlePortfolioToggle(portfolioId)}
                      disabled={disabled}
                      aria-label={`Remove ${portfolio.name}`}
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSelector;