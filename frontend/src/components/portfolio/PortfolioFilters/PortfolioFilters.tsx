/**
 * PortfolioFilters Component
 * Advanced filtering options for portfolio list
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import Card from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { PortfolioFilters as FilterType } from '../../../store/portfolio/types';
import { formatDate } from '../../../utils/formatters';
import styles from './PortfolioFilters.module.css';

interface PortfolioFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters?: () => void;
  availableTags?: string[];
  assetCountRange?: [number, number];
  className?: string;
  'data-testid'?: string;
}

const PRESET_DATE_RANGES = [
  { value: 'last-week', label: 'Last Week' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableTags = [],
  assetCountRange = [0, 100],
  className,
  'data-testid': testId,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: event.target.value });
  };

  // Handle tag selection
  const handleTagAdd = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFiltersChange({ tags: [...filters.tags, tag] });
    }
  };

  const handleTagRemove = (tag: string) => {
    onFiltersChange({ tags: filters.tags.filter(t => t !== tag) });
  };

  // Handle asset count range
  const handleAssetCountMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(event.target.value) || 0;
    const max = filters.assetCountRange?.[1] || assetCountRange[1];
    onFiltersChange({ assetCountRange: [min, max] });
  };

  const handleAssetCountMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const min = filters.assetCountRange?.[0] || assetCountRange[0];
    const max = parseInt(event.target.value) || assetCountRange[1];
    onFiltersChange({ assetCountRange: [min, max] });
  };

  // Handle date range presets
  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);

    if (value === 'custom') {
      return;
    }

    const now = new Date();
    let startDate: Date;

    switch (value) {
      case 'last-week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last-6-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = now;
    }

    if (value) {
      onFiltersChange({
        lastUpdatedRange: [
          formatDate(startDate, 'input'),
          formatDate(now, 'input')
        ]
      });
    }
  };

  // Handle custom date range
  const handleCustomDateApply = () => {
    if (customDateStart && customDateEnd) {
      onFiltersChange({
        lastUpdatedRange: [customDateStart, customDateEnd]
      });
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedDateRange('');
    setCustomDateStart('');
    setCustomDateEnd('');
    onClearFilters?.();
  };

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.search ||
    filters.tags.length > 0 ||
    filters.assetCountRange ||
    filters.lastUpdatedRange
  );

  const containerClasses = classNames(styles.container, className);

  return (
    <Card className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <div className={styles.headerActions}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="text"
              size="small"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Search */}
        <div className={styles.section}>
          <Input
            type="search"
            placeholder="Search portfolios..."
            value={filters.search}
            onChange={handleSearchChange}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            }
            iconPosition="left"
            fullWidth
          />
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Tags</label>
            <div className={styles.tagsList}>
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'primary' : 'outline'}
                  size="small"
                  className={styles.tagBadge}
                  onClick={() =>
                    filters.tags.includes(tag)
                      ? handleTagRemove(tag)
                      : handleTagAdd(tag)
                  }
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {filters.tags.length > 0 && (
              <div className={styles.selectedTags}>
                <span className={styles.selectedLabel}>Selected:</span>
                {filters.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="primary"
                    size="small"
                    className={styles.selectedTag}
                    onClick={() => handleTagRemove(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Asset Count Range */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>Number of Assets</label>
              <div className={styles.rangeInputs}>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.assetCountRange?.[0]?.toString() || ''}
                  onChange={handleAssetCountMinChange}
                  min={assetCountRange[0]}
                  max={assetCountRange[1]}
                />
                <span className={styles.rangeSeparator}>to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.assetCountRange?.[1]?.toString() || ''}
                  onChange={handleAssetCountMaxChange}
                  min={assetCountRange[0]}
                  max={assetCountRange[1]}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>Last Updated</label>
              <Select
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                options={PRESET_DATE_RANGES}
                placeholder="Select date range..."
              />

              {selectedDateRange === 'custom' && (
                <div className={styles.customDateRange}>
                  <div className={styles.rangeInputs}>
                    <Input
                      type="date"
                      value={customDateStart}
                      onChange={(e) => setCustomDateStart(e.target.value)}
                    />
                    <span className={styles.rangeSeparator}>to</span>
                    <Input
                      type="date"
                      value={customDateEnd}
                      onChange={(e) => setCustomDateEnd(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleCustomDateApply}
                    disabled={!customDateStart || !customDateEnd}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Active filters:</span>
          <div className={styles.summaryItems}>
            {filters.search && (
              <Badge variant="secondary" size="small">
                Search: "{filters.search}"
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" size="small">
                Tag: {tag}
              </Badge>
            ))}
            {filters.assetCountRange && (
              <Badge variant="secondary" size="small">
                Assets: {filters.assetCountRange[0]}-{filters.assetCountRange[1]}
              </Badge>
            )}
            {filters.lastUpdatedRange && (
              <Badge variant="secondary" size="small">
                Updated: {formatDate(filters.lastUpdatedRange[0], 'short')} - {formatDate(filters.lastUpdatedRange[1], 'short')}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PortfolioFilters;