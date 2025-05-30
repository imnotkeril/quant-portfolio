/**
 * PortfolioHeader Component
 * Header with portfolio navigation, actions and status indicators
 */
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Select } from '../../common/Select';
import { PortfolioListItem } from '../../../types/portfolio';
import { PortfolioSort } from '../../../store/portfolio/types';
import { formatDate, formatNumber } from '../../../utils/formatters';
import styles from './PortfolioHeader.module.css';

interface PortfolioHeaderProps {
  portfolios: PortfolioListItem[];
  selectedPortfolioId?: string | null;
  currentPortfolio?: PortfolioListItem | null;
  loading?: boolean;
  sort?: PortfolioSort;
  onPortfolioSelect?: (portfolioId: string) => void;
  onCreatePortfolio?: () => void;
  onImportPortfolio?: () => void;
  onExportPortfolio?: (portfolioId: string) => void;
  onRefresh?: () => void;
  onSortChange?: (sort: Partial<PortfolioSort>) => void;
  showStats?: boolean;
  className?: string;
  'data-testid'?: string;
}

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'lastUpdated-desc', label: 'Recently Updated' },
  { value: 'lastUpdated-asc', label: 'Oldest Updated' },
  { value: 'assetCount-desc', label: 'Most Assets' },
  { value: 'assetCount-asc', label: 'Fewest Assets' },
];

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  portfolios,
  selectedPortfolioId,
  currentPortfolio,
  loading = false,
  sort = { field: 'lastUpdated', direction: 'desc' },
  onPortfolioSelect,
  onCreatePortfolio,
  onImportPortfolio,
  onExportPortfolio,
  onRefresh,
  onSortChange,
  showStats = true,
  className,
  'data-testid': testId,
}) => {
  // Create portfolio options for select
  const portfolioOptions = portfolios.map(portfolio => ({
    value: portfolio.id,
    label: portfolio.name,
  }));

  // Handle portfolio selection from dropdown
  const handlePortfolioSelect = (portfolioId: string) => {
    onPortfolioSelect?.(portfolioId);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [PortfolioSort['field'], PortfolioSort['direction']];
    onSortChange?.({ field, direction });
  };

  // Handle export current portfolio
  const handleExport = () => {
    if (selectedPortfolioId) {
      onExportPortfolio?.(selectedPortfolioId);
    }
  };

  // Get current sort value
  const currentSortValue = `${sort.field}-${sort.direction}`;

  // Calculate portfolio statistics
  const totalPortfolios = portfolios.length;
  const totalAssets = portfolios.reduce((sum, p) => sum + p.assetCount, 0);
  const avgAssetsPerPortfolio = totalPortfolios > 0 ? totalAssets / totalPortfolios : 0;
  const recentlyUpdated = portfolios.filter(p => {
    const lastUpdated = new Date(p.lastUpdated);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastUpdated > weekAgo;
  }).length;

  const containerClasses = classNames(styles.container, className);

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.topSection}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Portfolio Management</h1>
          {currentPortfolio && (
            <div className={styles.currentPortfolio}>
              <span className={styles.currentLabel}>Current:</span>
              <Badge variant="primary" size="small">
                {currentPortfolio.name}
              </Badge>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="small"
            onClick={onRefresh}
            disabled={loading}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
              </svg>
            }
            aria-label="Refresh portfolios"
          >
            Refresh
          </Button>

          {onImportPortfolio && (
            <Button
              variant="outline"
              size="small"
              onClick={onImportPortfolio}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8Z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              }
            >
              Import
            </Button>
          )}

          {selectedPortfolioId && onExportPortfolio && (
            <Button
              variant="outline"
              size="small"
              onClick={handleExport}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8Z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <polyline points="9,15 12,12 15,15"/>
                </svg>
              }
            >
              Export
            </Button>
          )}

          {onCreatePortfolio && (
            <Button
              onClick={onCreatePortfolio}
              size="small"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              }
            >
              Create Portfolio
            </Button>
          )}
        </div>
      </div>

      <div className={styles.controlsSection}>
        <div className={styles.portfolioSelector}>
          {portfolios.length > 0 && (
            <Select
              value={selectedPortfolioId || ''}
              onChange={handlePortfolioSelect}
              options={portfolioOptions}
              placeholder="Select a portfolio..."
              className={styles.portfolioSelect}
            />
          )}
        </div>

        <div className={styles.viewControls}>
          <Select
            value={currentSortValue}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            placeholder="Sort by..."
            className={styles.sortSelect}
          />
        </div>
      </div>

      {showStats && portfolios.length > 0 && (
        <div className={styles.statsSection}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(totalPortfolios)}</span>
            <span className={styles.statLabel}>Portfolios</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(totalAssets)}</span>
            <span className={styles.statLabel}>Total Assets</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(avgAssetsPerPortfolio, 1)}</span>
            <span className={styles.statLabel}>Avg Assets/Portfolio</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(recentlyUpdated)}</span>
            <span className={styles.statLabel}>Updated This Week</span>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress} />
        </div>
      )}
    </div>
  );
};

export default PortfolioHeader;