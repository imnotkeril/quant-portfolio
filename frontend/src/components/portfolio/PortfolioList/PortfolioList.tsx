/**
 * PortfolioList Component
 * List container for portfolio cards with filtering and search
 */
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Select } from '../../common/Select';
import { PortfolioCard } from '../PortfolioCard';
import { PortfolioListItem } from '../../../types/portfolio';
import { PortfolioFilters, PortfolioSort } from '../../../store/portfolio/types';
import styles from './PortfolioList.module.css';

interface PortfolioListProps {
  portfolios: PortfolioListItem[];
  loading?: boolean;
  error?: string | null;
  selectedPortfolioId?: string | null;
  filters?: PortfolioFilters;
  sort?: PortfolioSort;
  onPortfolioSelect?: (portfolioId: string) => void;
  onPortfolioAnalyze?: (portfolioId: string) => void;
  onPortfolioEdit?: (portfolioId: string) => void;
  onPortfolioDelete?: (portfolioId: string) => void;
  onCreatePortfolio?: () => void;
  onFiltersChange?: (filters: Partial<PortfolioFilters>) => void;
  onSortChange?: (sort: Partial<PortfolioSort>) => void;
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

export const PortfolioList: React.FC<PortfolioListProps> = ({
  portfolios,
  loading = false,
  error = null,
  selectedPortfolioId = null,
  filters = {
    search: '',
    tags: [],
    assetCountRange: null,
    lastUpdatedRange: null,
  },
  sort = {
    field: 'lastUpdated',
    direction: 'desc',
  },
  onPortfolioSelect,
  onPortfolioAnalyze,
  onPortfolioEdit,
  onPortfolioDelete,
  onCreatePortfolio,
  onFiltersChange,
  onSortChange,
  className,
  'data-testid': testId,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Handle search input with debouncing
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    // Simple debouncing - in real app, use useDebounce hook
    setTimeout(() => {
      onFiltersChange?.({ search: value });
    }, 300);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [PortfolioSort['field'], PortfolioSort['direction']];
    onSortChange?.({ field, direction });
  };

  // Get current sort value
  const currentSortValue = `${sort.field}-${sort.direction}`;

  // Filter and sort portfolios
  const filteredPortfolios = useMemo(() => {
    let filtered = [...portfolios];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags.every(tag => p.tags.includes(tag))
      );
    }

    // Apply asset count range filter
    if (filters.assetCountRange) {
      const [min, max] = filters.assetCountRange;
      filtered = filtered.filter(p => p.assetCount >= min && p.assetCount <= max);
    }

    // Apply last updated range filter
    if (filters.lastUpdatedRange) {
      const [startDate, endDate] = filters.lastUpdatedRange;
      filtered = filtered.filter(p => {
        const lastUpdated = new Date(p.lastUpdated);
        return lastUpdated >= new Date(startDate) && lastUpdated <= new Date(endDate);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      // Handle date sorting
      if (sort.field === 'lastUpdated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [portfolios, filters, sort]);

  const containerClasses = classNames(styles.container, className);

  if (loading) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading portfolios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <div className={styles.error}>
          <p>Error loading portfolios: {error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2>Your Portfolios</h2>
          <span className={styles.count}>
            {filteredPortfolios.length} of {portfolios.length}
          </span>
        </div>

        {onCreatePortfolio && (
          <Button onClick={onCreatePortfolio}>
            Create Portfolio
          </Button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <Input
            type="search"
            placeholder="Search portfolios..."
            value={searchValue}
            onChange={handleSearchChange}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            }
            iconPosition="left"
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortSection}>
          <Select
            value={currentSortValue}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            placeholder="Sort by..."
            className={styles.sortSelect}
          />
        </div>
      </div>

      <div className={styles.content}>
        {filteredPortfolios.length === 0 ? (
          <div className={styles.empty}>
            {filters.search || filters.tags.length > 0 ? (
              <>
                <p>No portfolios match your filters.</p>
                <Button
                  variant="text"
                  onClick={() => {
                    setSearchValue('');
                    onFiltersChange?.({ search: '', tags: [] });
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p>You don't have any portfolios yet.</p>
                {onCreatePortfolio && (
                  <Button onClick={onCreatePortfolio}>
                    Create Your First Portfolio
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredPortfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                selected={portfolio.id === selectedPortfolioId}
                onClick={() => onPortfolioSelect?.(portfolio.id)}
                onAnalyze={() => onPortfolioAnalyze?.(portfolio.id)}
                onEdit={() => onPortfolioEdit?.(portfolio.id)}
                onDelete={() => onPortfolioDelete?.(portfolio.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioList;