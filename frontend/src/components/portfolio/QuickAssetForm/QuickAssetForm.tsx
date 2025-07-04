/**
 * Enhanced QuickAssetForm Component
 * Simplified asset form with auto-completion and real-time price fetching
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Badge } from '../../common/Badge/Badge';
import { Loader } from '../../common/Loader/Loader';
import { useAssets } from '../../../hooks/useAssets';
import { AssetCreate, AssetSearch } from '../../../types/portfolio';
import { AssetInfo } from '../../../services/portfolio/assetService';
import styles from './QuickAssetForm.module.css';

interface QuickAssetFormProps {
  onSubmit: (asset: AssetCreate) => void;
  onCancel?: () => void;
  onSwitchToAdvanced?: () => void;
  existingTickers?: string[];
  remainingWeight?: number;
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

const QUICK_ASSET_CLASSES = [
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'etf', label: '📊 ETF' },
  { value: 'bonds', label: '🏛️ Bonds' },
  { value: 'crypto', label: '₿ Crypto' },
  { value: 'reit', label: '🏢 REITs' },
  { value: 'commodity', label: '🥇 Commodities' },
];

interface FormData {
  ticker: string;
  name: string;
  weight: number;
  currentPrice: number | null;
  sector: string;
  industry: string;
  assetClass: string;
  exchange: string;
  currency: string;
  country: string;
}

interface FormErrors {
  ticker?: string;
  weight?: string;
  general?: string;
}

export const QuickAssetForm: React.FC<QuickAssetFormProps> = ({
  onSubmit,
  onCancel,
  onSwitchToAdvanced,
  existingTickers = [],
  remainingWeight = 100,
  loading = false,
  className,
  'data-testid': testId,
}) => {
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    name: '',
    weight: 0,
    currentPrice: null,
    sector: '',
    industry: '',
    assetClass: 'stocks',
    exchange: '',
    currency: 'USD',
    country: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<AssetInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTickerSelected, setIsTickerSelected] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Use assets hook for search functionality
  const {
    searchAssets,
    searchResults,
    searchLoading,
    searchError,
    getAssetInfo,
    assetInfo,
    assetInfoLoading,
    getAssetPrice,
    clearSearch,
    clearAssetInfo
  } = useAssets();

  // Filter search results to show only main tickers

  // Простая фильтрация - только основные тикеры
  const filteredSuggestions = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    return searchResults
      .filter(suggestion => {
        // Показываем только тикеры без точек и коротких названий
        return (
          suggestion.ticker.toUpperCase().startsWith(searchQuery.toUpperCase()) &&
          !suggestion.ticker.includes('.') &&
          suggestion.ticker.length <= 5
        );
      })
      .slice(0, 3);
  }, [searchResults, searchQuery]);

  // Handle ticker input changes
  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, ticker: value }));
    setSearchQuery(value);
    setIsTickerSelected(false);
    setSelectedAssetInfo(null);
    setErrors(prev => ({ ...prev, ticker: undefined }));

    // Clear previous asset info
    clearAssetInfo();

    // Show suggestions if typing
    if (value.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);

      // Trigger search with debounce
      const timeoutId = setTimeout(() => {
        searchAssets(value, 20); // Get more results for better filtering
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setShowSuggestions(false);
      clearSearch();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AssetSearch) => {
    setFormData(prev => ({
      ...prev,
      ticker: suggestion.ticker,
      name: suggestion.name,
      sector: suggestion.sector || '',
      industry: suggestion.industry || '',
      assetClass: suggestion.assetType || 'stocks',
      exchange: suggestion.exchange || '',
      currency: suggestion.currency || 'USD',
      country: suggestion.country || '',
    }));

    setSearchQuery(suggestion.ticker);
    setIsTickerSelected(true);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Get detailed asset info
    const info = await getAssetInfo(suggestion.ticker);
    if (info) {
      setSelectedAssetInfo(info);
      setFormData(prev => ({
        ...prev,
        currentPrice: info.currentPrice || null,
        name: info.name || prev.name,
        sector: info.sector || prev.sector,
        industry: info.industry || prev.industry,
        exchange: info.exchange || prev.exchange,
        currency: info.currency || prev.currency,
        country: info.country || prev.country,
      }));
    } else {
      // Fallback: try to get price separately if asset info fails
      const price = await getAssetPrice(suggestion.ticker);
      if (price) {
        setFormData(prev => ({
          ...prev,
          currentPrice: price,
        }));
        setSelectedAssetInfo({
          ticker: suggestion.ticker,
          name: suggestion.name,
          sector: suggestion.sector || '',
          industry: suggestion.industry || '',
          country: suggestion.country || '',
          currency: suggestion.currency || 'USD',
          exchange: suggestion.exchange || '',
          assetType: suggestion.assetType || 'stocks',
          currentPrice: price
        });
      }
    }
  };

  // Handle weight input changes
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, weight: value }));
    setErrors(prev => ({ ...prev, weight: undefined }));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate ticker
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    } else if (existingTickers.includes(formData.ticker.toUpperCase())) {
      newErrors.ticker = 'This asset is already in your portfolio';
    } else if (!isTickerSelected) {
      newErrors.ticker = 'Please select a ticker from the suggestions';
    }

    // Validate weight
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    } else if (formData.weight > remainingWeight) {
      newErrors.weight = `Weight cannot exceed ${remainingWeight.toFixed(1)}%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const asset: AssetCreate = {
      ticker: formData.ticker.toUpperCase(),
      name: formData.name,
      weight: formData.weight / 100, // Convert percentage to decimal
      currentPrice: formData.currentPrice,
      sector: formData.sector,
      industry: formData.industry,
      assetClass: formData.assetClass,
      exchange: formData.exchange,
      currency: formData.currency,
      country: formData.country,
    };

    onSubmit(asset);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionRefs.current[selectedSuggestionIndex]) {
      suggestionRefs.current[selectedSuggestionIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedSuggestionIndex]);

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          🚀 Quick Add Asset
        </h2>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContent}>
          {/* Ticker Symbol Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ticker Symbol *
            </label>
            <div className={styles.tickerInputContainer} ref={inputRef}>
              <Input
                type="text"
                value={formData.ticker}
                onChange={handleTickerChange}
                onKeyDown={handleKeyDown}
                error={errors.ticker}
                placeholder="AAPL"
                className={styles.tickerInput}
                autoComplete="off"
              />

              {searchLoading && (
                <div className={styles.searchLoader}>
                  <Loader size="small" />
                </div>
              )}

              {/* Search Suggestions */}
              {/* Search Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {(() => {
                    console.log('🔍 Showing suggestions:', filteredSuggestions);
                    console.log('🔍 Original results:', searchResults);
                    return filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.ticker}
                        ref={el => suggestionRefs.current[index] = el}
                        className={classNames(
                          styles.suggestion,
                          index === selectedSuggestionIndex && styles.suggestionSelected
                        )}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className={styles.suggestionMain}>
                          <span className={styles.suggestionTicker}>
                            {suggestion.ticker}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* No Results */}
              {showSuggestions && filteredSuggestions.length === 0 && searchQuery && !searchLoading && (
                <div className={styles.noResults}>
                  No main tickers found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Selected Asset Info */}
            {selectedAssetInfo && (
              <div className={styles.selectedAssetInfo}>
                <div className={styles.assetPrice}>
                  <span className={styles.priceLabel}>Current Price:</span>
                  <span className={styles.priceValue}>
                    ${selectedAssetInfo.currentPrice?.toFixed(2) || 'N/A'}
                  </span>
                  {selectedAssetInfo.priceChangePercent && (
                    <span className={classNames(
                      styles.priceChange,
                      selectedAssetInfo.priceChangePercent >= 0 ? styles.positive : styles.negative
                    )}>
                      {selectedAssetInfo.priceChangePercent >= 0 ? '+' : ''}{selectedAssetInfo.priceChangePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className={styles.assetDetails}>
                  <span>{selectedAssetInfo.name}</span>
                  <span>{selectedAssetInfo.sector}</span>
                  <span>{selectedAssetInfo.exchange}</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Weight (%) *
            </label>
            <Input
              type="number"
              value={formData.weight || ''}
              onChange={handleWeightChange}
              error={errors.weight}
              placeholder="15"
              min="0.01"
              max={remainingWeight}
              step="0.01"
              className={styles.weightInput}
            />

            {remainingWeight < 100 && (
              <div className={styles.remainingInfo}>
                💡 Remaining: {remainingWeight.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Asset Class Selector */}
          <div className={styles.formGroup}>
            <Select
              label="Asset Type"
              value={formData.assetClass}
              onChange={(value) => setFormData(prev => ({ ...prev, assetClass: value }))}
              options={QUICK_ASSET_CLASSES}
              className={styles.assetClassSelect}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <h4>💡 Quick Mode Benefits</h4>
          <ul>
            <li>✅ Auto-completion for popular tickers</li>
            <li>📈 Real-time prices fetched automatically</li>
            <li>🏢 Company info filled automatically</li>
            <li>⚡ Only essential fields required</li>
          </ul>
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}

        {searchError && (
          <div className={styles.errorMessage}>
            Search error: {searchError}
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="ghost"
                disabled={loading}
              >
                Cancel
              </Button>
            )}

            {onSwitchToAdvanced && (
              <Button
                type="button"
                onClick={onSwitchToAdvanced}
                variant="secondary"
                disabled={loading}
                className={styles.advancedButton}
              >
                📝 Advanced Form
              </Button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || !formData.ticker || !formData.weight || !isTickerSelected}
            className={styles.submitButton}
          >
            {loading ? 'Adding...' : 'Add Asset'} ✅
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuickAssetForm;