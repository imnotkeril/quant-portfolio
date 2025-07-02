/**
 * Enhanced QuickAssetForm Component
 * Simplified asset form with auto-completion and real-time price fetching
 */
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Badge } from '../../common/Badge/Badge';
import { Loader } from '../../common/Loader/Loader';
import { AssetCreate } from '../../../types/portfolio';
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

interface AssetSuggestion {
  ticker: string;
  name: string;
  price: number;
  sector: string;
  assetClass: string;
  exchange: string;
  currency: string;
  marketCap?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

const QUICK_ASSET_CLASSES = [
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'etf', label: '📊 ETF' },
  { value: 'bonds', label: '🏛️ Bonds' },
  { value: 'crypto', label: '₿ Crypto' },
  { value: 'reit', label: '🏢 REITs' },
  { value: 'commodity', label: '🥇 Commodities' },
];

// Mock API service for asset search
const searchAssets = async (query: string): Promise<AssetSuggestion[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockDatabase: AssetSuggestion[] = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      price: 175.23,
      sector: 'Technology',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 2800000000000,
      volume: 45000000,
      change: 2.45,
      changePercent: 1.42
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.85,
      sector: 'Technology',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 2900000000000,
      volume: 35000000,
      change: -1.23,
      changePercent: -0.32
    },
    {
      ticker: 'GOOGL',
      name: 'Alphabet Inc. Class A',
      price: 142.56,
      sector: 'Technology',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 1800000000000,
      volume: 28000000,
      change: 5.67,
      changePercent: 4.14
    },
    {
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 153.87,
      sector: 'Consumer Cyclical',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 1600000000000,
      volume: 42000000,
      change: -3.21,
      changePercent: -2.04
    },
    {
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      price: 243.92,
      sector: 'Consumer Cyclical',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 780000000000,
      volume: 95000000,
      change: 12.45,
      changePercent: 5.38
    },
    {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 498.36,
      sector: 'Technology',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 1200000000000,
      volume: 38000000,
      change: 15.23,
      changePercent: 3.15
    },
    {
      ticker: 'META',
      name: 'Meta Platforms Inc.',
      price: 348.15,
      sector: 'Technology',
      assetClass: 'stocks',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 880000000000,
      volume: 22000000,
      change: -8.45,
      changePercent: -2.37
    },
    {
      ticker: 'JNJ',
      name: 'Johnson & Johnson',
      price: 158.47,
      sector: 'Healthcare',
      assetClass: 'stocks',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 420000000000,
      volume: 8500000,
      change: 0.85,
      changePercent: 0.54
    },
    {
      ticker: 'PG',
      name: 'Procter & Gamble Co.',
      price: 154.32,
      sector: 'Consumer Defensive',
      assetClass: 'stocks',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 360000000000,
      volume: 6200000,
      change: -1.23,
      changePercent: -0.79
    },
    {
      ticker: 'KO',
      name: 'Coca-Cola Co.',
      price: 62.18,
      sector: 'Consumer Defensive',
      assetClass: 'stocks',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 270000000000,
      volume: 12000000,
      change: 0.45,
      changePercent: 0.73
    },
    {
      ticker: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      price: 456.78,
      sector: 'Diversified',
      assetClass: 'etf',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 450000000000,
      volume: 75000000,
      change: 2.34,
      changePercent: 0.51
    },
    {
      ticker: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 389.45,
      sector: 'Technology',
      assetClass: 'etf',
      exchange: 'NASDAQ',
      currency: 'USD',
      marketCap: 180000000000,
      volume: 45000000,
      change: 5.67,
      changePercent: 1.48
    },
    {
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      price: 234.56,
      sector: 'Diversified',
      assetClass: 'etf',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 320000000000,
      volume: 28000000,
      change: 1.78,
      changePercent: 0.76
    },
    {
      ticker: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      price: 78.92,
      sector: 'Fixed Income',
      assetClass: 'bonds',
      exchange: 'NYSE',
      currency: 'USD',
      marketCap: 85000000000,
      volume: 5500000,
      change: -0.12,
      changePercent: -0.15
    }
  ];

  return mockDatabase.filter(asset =>
    asset.ticker.toLowerCase().includes(query.toLowerCase()) ||
    asset.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Format large numbers
const formatMarketCap = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return `${value.toLocaleString()}`;
};

const QuickAssetForm: React.FC<QuickAssetFormProps> = ({
  onSubmit,
  onCancel,
  onSwitchToAdvanced,
  existingTickers = [],
  remainingWeight = 100,
  loading = false,
  className,
  'data-testid': testId,
}) => {
  const [formData, setFormData] = useState({
    ticker: '',
    weight: '',
    assetClass: 'stocks'
  });

  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<AssetSuggestion | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle ticker input with debounced search
  const handleTickerChange = (value: string) => {
    setFormData(prev => ({ ...prev, ticker: value }));
    setSelectedAssetInfo(null);
    setShowSuggestions(true);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear errors
    if (errors.ticker) {
      setErrors(prev => ({ ...prev, ticker: '' }));
    }

    // Don't search for very short queries
    if (value.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchAssets(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Error searching assets:', error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Handle asset selection from suggestions
  const handleAssetSelect = (asset: AssetSuggestion) => {
    setFormData(prev => ({
      ...prev,
      ticker: asset.ticker,
      assetClass: asset.assetClass
    }));
    setSelectedAssetInfo(asset);
    setShowSuggestions(false);
    setSuggestions([]);

    // Clear ticker error if exists
    if (errors.ticker) {
      setErrors(prev => ({ ...prev, ticker: '' }));
    }
  };

  // Handle weight input validation
  const handleWeightChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, weight: value }));

      // Clear error
      if (errors.weight) {
        setErrors(prev => ({ ...prev, weight: '' }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    } else if (existingTickers.includes(formData.ticker.toUpperCase())) {
      newErrors.ticker = 'This ticker is already in your portfolio';
    }

    const weightNum = Number(formData.weight);
    if (!formData.weight || weightNum <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    } else if (weightNum > 100) {
      newErrors.weight = 'Weight cannot exceed 100%';
    } else if (weightNum > remainingWeight) {
      newErrors.weight = `Weight cannot exceed remaining ${remainingWeight.toFixed(1)}%`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create asset data with real or mock data
    const assetData: AssetCreate = {
      ticker: formData.ticker.toUpperCase(),
      name: selectedAssetInfo?.name || `${formData.ticker.toUpperCase()} Asset`,
      weight: weightNum,
      quantity: 0, // Will be calculated based on weight and starting amount
      purchasePrice: selectedAssetInfo?.price || 100, // Use real price or fallback
      currentPrice: selectedAssetInfo?.price || 100,
      assetClass: formData.assetClass,
      currency: selectedAssetInfo?.currency || 'USD',
      sector: selectedAssetInfo?.sector || 'Unknown',
      industry: '',
      country: 'United States',
      exchange: selectedAssetInfo?.exchange || 'NASDAQ',
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    onSubmit(assetData);
  };

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={classNames(styles.quickAssetForm, className)} data-testid={testId}>
      <div className={styles.formHeader}>
        <h3>🚀 Quick Add Asset</h3>
        <p>Add assets with smart auto-completion and real-time prices</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formBody}>
          {/* Ticker input with suggestions */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ticker Symbol *
            </label>
            <div className={styles.searchContainer} ref={suggestionsRef}>
              <div className={styles.inputContainer}>
                <Input
                  value={formData.ticker}
                  onChange={handleTickerChange}
                  error={errors.ticker}
                  placeholder="AAPL"
                  className={styles.tickerInput}
                  autoComplete="off"
                />
                {searchLoading && (
                  <div className={styles.searchLoader}>
                    <Loader size="sm" />
                  </div>
                )}
                <div className={styles.searchIcon}>🔍</div>
              </div>

              {/* Asset suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.slice(0, 8).map((asset) => (
                    <div
                      key={asset.ticker}
                      className={styles.suggestion}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <div className={styles.suggestionMain}>
                        <div className={styles.tickerPrice}>
                          <strong>{asset.ticker}</strong>
                          <span className={styles.price}>${asset.price.toFixed(2)}</span>
                          {asset.change && (
                            <span className={classNames(styles.change, {
                              [styles.positive]: asset.change > 0,
                              [styles.negative]: asset.change < 0
                            })}>
                              {asset.change > 0 ? '+' : ''}{asset.changePercent?.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <div className={styles.assetName}>{asset.name}</div>
                      </div>
                      <div className={styles.suggestionMeta}>
                        <Badge variant="secondary" size="sm">{asset.assetClass}</Badge>
                        <span className={styles.sector}>{asset.sector}</span>
                        <span className={styles.exchange}>{asset.exchange}</span>
                        {asset.marketCap && (
                          <span className={styles.marketCap}>{formatMarketCap(asset.marketCap)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSuggestions && !searchLoading && formData.ticker.length > 0 && suggestions.length === 0 && (
                <div className={styles.noResults}>
                  <div className={styles.noResultsText}>
                    No assets found for "{formData.ticker}"
                  </div>
                  <div className={styles.noResultsHint}>
                    Try searching by ticker symbol or company name
                  </div>
                </div>
              )}
            </div>

            {/* Selected asset info */}
            {selectedAssetInfo && (
              <div className={styles.selectedAsset}>
                <div className={styles.selectedAssetHeader}>
                  <span className={styles.selectedTicker}>💡 {selectedAssetInfo.ticker}</span>
                  <span className={styles.selectedPrice}>${selectedAssetInfo.price.toFixed(2)}</span>
                  {selectedAssetInfo.change && (
                    <span className={classNames(styles.selectedChange, {
                      [styles.positive]: selectedAssetInfo.change > 0,
                      [styles.negative]: selectedAssetInfo.change < 0
                    })}>
                      {selectedAssetInfo.change > 0 ? '+' : ''}{selectedAssetInfo.changePercent?.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className={styles.selectedAssetInfo}>
                  <span>{selectedAssetInfo.name}</span>
                  <span>{selectedAssetInfo.sector}</span>
                  <span>{selectedAssetInfo.exchange}</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Weight (%) *
            </label>
            <Input
              type="number"
              value={formData.weight}
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

          {/* Asset class selector */}
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

        {/* Info box */}
        <div className={styles.infoBox}>
          <h4>💡 Quick Mode Benefits</h4>
          <ul>
            <li>✅ Auto-completion for popular tickers</li>
            <li>📈 Real-time prices fetched automatically</li>
            <li>🏢 Company info filled automatically</li>
            <li>⚡ Only essential fields required</li>
          </ul>
        </div>

        {/* Form actions */}
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
            disabled={loading || !formData.ticker || !formData.weight}
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