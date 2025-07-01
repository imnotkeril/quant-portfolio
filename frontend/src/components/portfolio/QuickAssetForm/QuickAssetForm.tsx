/**
 * QuickAssetForm Component
 * Simplified asset form for Easy Mode - only ticker and weight required
 */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Badge } from '../../common/Badge/Badge';
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

const QUICK_ASSET_CLASSES = [
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'etf', label: '📊 ETF' },
  { value: 'bonds', label: '🏛️ Bonds' },
  { value: 'crypto', label: '₿ Crypto' },
  { value: 'reit', label: '🏢 REITs' },
  { value: 'commodity', label: '🥇 Commodities' },
];

// Popular tickers for auto-suggestions
const POPULAR_TICKERS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financial Services' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Diversified' },
  { ticker: 'QQQ', name: 'Invesco QQQ ETF', sector: 'Technology' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market', sector: 'Diversified' },
  { ticker: 'BND', name: 'Vanguard Total Bond Market', sector: 'Fixed Income' },
];

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
  const [formData, setFormData] = useState({
    ticker: '',
    weight: '',
    assetClass: 'stocks'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tickerSuggestions, setTickerSuggestions] = useState<typeof POPULAR_TICKERS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<typeof POPULAR_TICKERS[0] | null>(null);

  // Auto-complete for ticker
  useEffect(() => {
    if (formData.ticker.length >= 1) {
      const suggestions = POPULAR_TICKERS.filter(item =>
        item.ticker.toLowerCase().includes(formData.ticker.toLowerCase()) ||
        item.name.toLowerCase().includes(formData.ticker.toLowerCase())
      ).slice(0, 6);

      setTickerSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.ticker]);

  // Auto-fill weight with remaining weight
  useEffect(() => {
    if (remainingWeight > 0 && remainingWeight <= 100 && !formData.weight) {
      setFormData(prev => ({ ...prev, weight: remainingWeight.toString() }));
    }
  }, [remainingWeight]);

  const handleTickerChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, ticker: upperValue }));

    // Check if ticker matches a known asset
    const matchedAsset = POPULAR_TICKERS.find(item =>
      item.ticker === upperValue
    );
    setSelectedAssetInfo(matchedAsset || null);

    // Clear error
    if (errors.ticker) {
      setErrors(prev => ({ ...prev, ticker: '' }));
    }
  };

  const handleSuggestionClick = (suggestion: typeof POPULAR_TICKERS[0]) => {
    setFormData(prev => ({ ...prev, ticker: suggestion.ticker }));
    setSelectedAssetInfo(suggestion);
    setShowSuggestions(false);
  };

  const handleWeightChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, weight: value }));

      // Clear error
      if (errors.weight) {
        setErrors(prev => ({ ...prev, weight: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Quick validation
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

    // Create asset data with smart defaults
    const assetData: AssetCreate = {
      ticker: formData.ticker.toUpperCase(),
      name: selectedAssetInfo?.name || `${formData.ticker.toUpperCase()} Asset`,
      weight: weightNum,
      quantity: 0, // Will be calculated based on weight and cash
      purchasePrice: 0, // Will be fetched from API
      currentPrice: 0, // Will be fetched from API
      assetClass: formData.assetClass,
      currency: 'USD',
      sector: selectedAssetInfo?.sector || '',
      industry: '',
      country: 'United States',
      exchange: 'NASDAQ',
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    onSubmit(assetData);

    // Reset form
    setFormData({ ticker: '', weight: '', assetClass: 'stocks' });
    setSelectedAssetInfo(null);
    setErrors({});
  };

  const quickWeightButtons = [
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
    { label: '25%', value: 25 },
    { label: `All (${remainingWeight.toFixed(1)}%)`, value: remainingWeight },
  ].filter(btn => btn.value <= remainingWeight);

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      <div className={styles.header}>
        <h3>🚀 Quick Add Asset</h3>
        <p>Add assets fast with smart auto-completion</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.quickFields}>
          {/* Ticker input with auto-complete */}
          <div className={styles.tickerField}>
            <Input
              label="Ticker Symbol *"
              placeholder="Type AAPL, GOOGL, SPY..."
              value={formData.ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              error={errors.ticker}
              autoFocus
              className={styles.tickerInput}
            />

            {showSuggestions && (
              <div className={styles.suggestions}>
                {tickerSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className={styles.suggestionInfo}>
                      <span className={styles.suggestionTicker}>{suggestion.ticker}</span>
                      <span className={styles.suggestionName}>{suggestion.name}</span>
                    </div>
                    <Badge size="small" variant="neutral">
                      {suggestion.sector}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedAssetInfo && (
              <div className={styles.assetInfo}>
                ✅ {selectedAssetInfo.name} • {selectedAssetInfo.sector}
              </div>
            )}
          </div>

          {/* Weight input with quick buttons */}
          <div className={styles.weightField}>
            <Input
              type="text"
              label="Weight (%) *"
              placeholder="0"
              value={formData.weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              error={errors.weight}
              min="0"
              max="100"
              step="0.1"
            />

            <div className={styles.quickWeights}>
              <span className={styles.quickWeightsLabel}>Quick:</span>
              {quickWeightButtons.map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  className={classNames(styles.quickWeightBtn, {
                    [styles.active]: Number(formData.weight) === btn.value
                  })}
                  onClick={() => setFormData(prev => ({ ...prev, weight: btn.value.toString() }))}
                  disabled={btn.value > remainingWeight}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {remainingWeight < 100 && (
              <div className={styles.remainingInfo}>
                Remaining: {remainingWeight.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Asset class selector */}
          <Select
            label="Asset Type"
            value={formData.assetClass}
            onChange={(value) => setFormData(prev => ({ ...prev, assetClass: value }))}
            options={QUICK_ASSET_CLASSES}
          />
        </div>

        <div className={styles.infoBox}>
          <h4>💡 Quick Mode Benefits</h4>
          <ul>
            <li>✅ Auto-completion for popular tickers</li>
            <li>📈 Current prices fetched automatically</li>
            <li>🏢 Company info filled automatically</li>
            <li>⚡ Only essential fields required</li>
          </ul>
        </div>

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
              >
                📝 Advanced Form
              </Button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Asset'} ✅
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuickAssetForm;