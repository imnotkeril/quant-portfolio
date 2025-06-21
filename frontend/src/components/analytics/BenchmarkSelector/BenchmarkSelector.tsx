/**
 * BenchmarkSelector Component
 * Dropdown selector for choosing portfolio benchmarks
 */
import React from 'react';
import { Select } from '../../common/Select/Select';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import styles from './BenchmarkSelector.module.css';

export interface BenchmarkOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
}

interface BenchmarkSelectorProps {
  value?: string | null;
  onChange: (benchmark: string | null) => void;
  options?: BenchmarkOption[];
  loading?: boolean;
  disabled?: boolean;
  showCard?: boolean;
  title?: string;
  allowNone?: boolean;
  className?: string;
  'data-testid'?: string;
}

const DEFAULT_BENCHMARKS: BenchmarkOption[] = [
  // US Equity
  { value: 'SPY', label: 'S&P 500 (SPY)', description: 'Large-cap US stocks', category: 'US Equity' },
  { value: 'VTI', label: 'Total Stock Market (VTI)', description: 'Entire US stock market', category: 'US Equity' },
  { value: 'QQQ', label: 'NASDAQ-100 (QQQ)', description: 'Tech-heavy large-cap stocks', category: 'US Equity' },
  { value: 'IWM', label: 'Russell 2000 (IWM)', description: 'Small-cap US stocks', category: 'US Equity' },
  { value: 'VTV', label: 'Value ETF (VTV)', description: 'Large-cap value stocks', category: 'US Equity' },
  { value: 'VUG', label: 'Growth ETF (VUG)', description: 'Large-cap growth stocks', category: 'US Equity' },

  // International Equity
  { value: 'VXUS', label: 'International Stocks (VXUS)', description: 'Non-US developed and emerging markets', category: 'International Equity' },
  { value: 'VEA', label: 'Developed Markets (VEA)', description: 'Developed international markets', category: 'International Equity' },
  { value: 'VWO', label: 'Emerging Markets (VWO)', description: 'Emerging market stocks', category: 'International Equity' },
  { value: 'EFA', label: 'EAFE (EFA)', description: 'Europe, Australasia, Far East', category: 'International Equity' },

  // Fixed Income
  { value: 'BND', label: 'Total Bond Market (BND)', description: 'US investment-grade bonds', category: 'Fixed Income' },
  { value: 'AGG', label: 'Core Bond ETF (AGG)', description: 'US aggregate bond market', category: 'Fixed Income' },
  { value: 'TLT', label: 'Long Treasury (TLT)', description: '20+ year Treasury bonds', category: 'Fixed Income' },
  { value: 'HYG', label: 'High Yield (HYG)', description: 'High-yield corporate bonds', category: 'Fixed Income' },

  // Commodities & Alternatives
  { value: 'GLD', label: 'Gold (GLD)', description: 'Gold commodity ETF', category: 'Commodities' },
  { value: 'VNQ', label: 'Real Estate (VNQ)', description: 'US real estate investment trusts', category: 'Alternatives' },
  { value: 'DBC', label: 'Commodities (DBC)', description: 'Diversified commodities', category: 'Commodities' },
];

export const BenchmarkSelector: React.FC<BenchmarkSelectorProps> = ({
  value,
  onChange,
  options = DEFAULT_BENCHMARKS,
  loading = false,
  disabled = false,
  showCard = false,
  title = 'Benchmark',
  allowNone = true,
  className,
  'data-testid': testId,
}) => {
  // Group options by category
  const groupedOptions = React.useMemo(() => {
    const grouped: Record<string, BenchmarkOption[]> = {};

    options.forEach(option => {
      const category = option.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(option);
    });

    return grouped;
  }, [options]);

  // Create select options with groups
  const selectOptions = React.useMemo(() => {
    const opts: Array<{ value: string; label: string; group?: string }> = [];

    if (allowNone) {
      opts.push({ value: 'none', label: 'No Benchmark' });
    }

    Object.entries(groupedOptions).forEach(([category, categoryOptions]) => {
      categoryOptions.forEach(option => {
        opts.push({
          value: option.value,
          label: option.label,
          group: category,
        });
      });
    });

    return opts;
  }, [groupedOptions, allowNone]);

  const handleChange = (selectedValue: string | number | (string | number)[]) => {
  const value = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
  const stringValue = String(value);

  if (stringValue === 'none') {
    onChange(null);
  } else {
    onChange(stringValue);
  }
};

  const handleClear = () => {
    onChange(null);
  };

  const currentOption = options.find(opt => opt.value === value);
  const displayValue = value === null ? 'none' : value || 'none';

  const selector = (
    <div className={styles.selectorContainer}>
      <div className={styles.selectWrapper}>
        <Select
          value={displayValue}
          onChange={handleChange}
          options={selectOptions}
          loading={loading}
          disabled={disabled}
          placeholder="Select benchmark..."
          className={styles.select}
          data-testid={testId}
        />

        {value && allowNone && (
          <Button
            variant="text"
            size="small"
            onClick={handleClear}
            disabled={loading || disabled}
            className={styles.clearButton}
            aria-label="Clear benchmark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </Button>
        )}
      </div>

      {currentOption?.description && (
        <div className={styles.description}>
          {currentOption.description}
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card title={title} className={className}>
        {selector}
      </Card>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {selector}
    </div>
  );
};

export default BenchmarkSelector;