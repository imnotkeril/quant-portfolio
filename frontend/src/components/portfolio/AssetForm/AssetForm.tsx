/**
 * AssetForm Component
 * Form for adding and editing portfolio assets with Easy/Professional modes
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Select } from '../../common/Select';
import { Badge } from '../../common/Badge';
import { Loader } from '../../common/Loader';
import { Tabs } from '../../common/Tabs';
import { AssetCreate, AssetSearch } from '../../../types/portfolio';
import { useAssets } from '../../../hooks/useAssets';
import { validateAsset } from '../../../utils/validators';
import { formatDate } from '../../../utils/formatters';
import TemplateSelector from '../TemplateSelector/TemplateSelector';
import AssetImport from '../AssetImport/AssetImport';
import styles from './AssetForm.module.css';

type AssetFormMode = 'easy' | 'professional';

interface AssetFormProps {
  asset?: AssetCreate | null;
  onSubmit: (asset: AssetCreate) => void;
  onCancel?: () => void;
  existingTickers?: string[];
  loading?: boolean;
  mode?: AssetFormMode;
  remainingWeight?: number;
  showTemplates?: boolean;
  showImport?: boolean;
  className?: string;
  'data-testid'?: string;
}

// Unified asset classes with emojis (like QuickAssetForm)
const ASSET_CLASSES = [
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'etf', label: '📊 ETF' },
  { value: 'bonds', label: '🏛️ Bonds' },
  { value: 'mutual_fund', label: '🏦 Mutual Fund' },
  { value: 'crypto', label: '₿ Cryptocurrency' },
  { value: 'commodity', label: '🥇 Commodity' },
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'cash', label: '💵 Cash' },
  { value: 'other', label: '📄 Other' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'JPY', label: 'JPY' },
  { value: 'CAD', label: 'CAD' },
  { value: 'AUD', label: 'AUD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'CNY', label: 'CNY' },
];

// Quick weight buttons for easy mode
const QUICK_WEIGHTS = [5, 10, 15, 20, 25];

export const AssetForm: React.FC<AssetFormProps> = ({
  asset = null,
  onSubmit,
  onCancel,
  existingTickers = [],
  loading = false,
  mode = 'professional',
  remainingWeight = 100,
  showTemplates = true,
  showImport = true,
  className,
  'data-testid': testId,
}) => {
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState<AssetCreate>({
    ticker: '',
    name: '',
    weight: 0,
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: formatDate(new Date(), 'input'),
    currentPrice: 0,
    sector: '',
    industry: '',
    assetClass: 'stocks',
    currency: 'USD',
    country: '',
    exchange: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<any>(null);
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

  // Filter search results
  const filteredSuggestions = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    return searchResults
      .filter(suggestion => {
        return (
          suggestion.ticker.toUpperCase().startsWith(searchQuery.toUpperCase()) &&
          !suggestion.ticker.includes('.') &&
          suggestion.ticker.length <= 5 &&
          !existingTickers.includes(suggestion.ticker.toUpperCase())
        );
      })
      .slice(0, 8);
  }, [searchResults, searchQuery, existingTickers]);

  // Initialize form data when asset prop changes
  useEffect(() => {
    if (asset) {
      setFormData({
        ticker: asset.ticker || '',
        name: asset.name || '',
        weight: asset.weight || 0,
        quantity: asset.quantity || 0,
        purchasePrice: asset.purchasePrice || 0,
        purchaseDate: asset.purchaseDate || formatDate(new Date(), 'input'),
        currentPrice: asset.currentPrice || 0,
        sector: asset.sector || '',
        industry: asset.industry || '',
        assetClass: asset.assetClass || 'stocks',
        currency: asset.currency || 'USD',
        country: asset.country || '',
        exchange: asset.exchange || '',
      });
      setIsTickerSelected(true);
      setSearchQuery(asset.ticker || '');
    }
  }, [asset]);

  const handleFieldChange = (field: keyof AssetCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle ticker search with autocomplete
  const handleTickerChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setSearchQuery(upperValue);
    handleFieldChange('ticker', upperValue);
    setSelectedAssetInfo(null);
    setIsTickerSelected(false);

    if (upperValue.length >= 1) {
      setShowSuggestions(true);
      searchAssets(upperValue, 10);
    } else {
      setShowSuggestions(false);
      clearSearch();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AssetSearch) => {
    setSearchQuery(suggestion.ticker);
    handleFieldChange('ticker', suggestion.ticker);
    setShowSuggestions(false);
    setIsTickerSelected(true);

    // Auto-fill data from suggestion
    if (suggestion.name) {
      handleFieldChange('name', suggestion.name);
    }
    if (suggestion.sector) {
      handleFieldChange('sector', suggestion.sector);
    }
    if (suggestion.exchange) {
      handleFieldChange('exchange', suggestion.exchange);
    }
    if (suggestion.country) {
      handleFieldChange('country', suggestion.country);
    }
    if (suggestion.currency) {
      handleFieldChange('currency', suggestion.currency);
    }

    // Get detailed asset info and current price
    try {
      const assetInfo = await getAssetInfo(suggestion.ticker);
      setSelectedAssetInfo(assetInfo);

      if (assetInfo) {
        if (assetInfo.sector) handleFieldChange('sector', assetInfo.sector);
        if (assetInfo.industry) handleFieldChange('industry', assetInfo.industry);
        if (assetInfo.exchange) handleFieldChange('exchange', assetInfo.exchange);
        if (assetInfo.currency) handleFieldChange('currency', assetInfo.currency);
        if (assetInfo.country) handleFieldChange('country', assetInfo.country);
      }

      // Get current price
      const price = await getAssetPrice(suggestion.ticker);
      if (price) {
        handleFieldChange('currentPrice', price);
      }
    } catch (error) {
      console.error('Error fetching asset info:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
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

  // Handle weight quick selection (easy mode)
  const handleQuickWeight = (weight: number) => {
    const actualWeight = Math.min(weight, remainingWeight);
    handleFieldChange('weight', actualWeight);
  };

  // Handle template selection
  const handleTemplateSelect = (assets: AssetCreate[]) => {
    assets.forEach(assetData => {
      onSubmit(assetData);
    });
  };

  // Handle import
  const handleImport = (assets: AssetCreate[]) => {
    assets.forEach(assetData => {
      onSubmit(assetData);
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate asset data
    const validation = validateAsset(formData, existingTickers);
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('ticker')) errors.ticker = error;
        if (error.includes('name')) errors.name = error;
        if (error.includes('weight')) errors.weight = error;
        if (error.includes('quantity')) errors.quantity = error;
        if (error.includes('price')) {
          if (error.includes('purchase')) {
            errors.purchasePrice = error;
          } else {
            errors.currentPrice = error;
          }
        }
      });
      setValidationErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  const containerClasses = classNames(styles.container, className);
  const isEasyMode = mode === 'easy';
  const hasMultipleTabs = showTemplates || showImport;

  // ✅ ФУНКЦИЯ ПЕРЕНЕСЕНА СЮДА - до использования!
  const renderAssetForm = () => {
    return (
      <>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Basic Information</h4>

          <div className={styles.row}>
            {/* Ticker with Autocomplete */}
            <div className={styles.tickerField}>
              <Input
                ref={inputRef}
                label="Ticker Symbol"
                placeholder="e.g., AAPL, GOOGL, SPY"
                value={searchQuery}
                onChange={(e) => handleTickerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                error={validationErrors.ticker}
                required
                disabled={!!asset} // Disable editing ticker for existing assets
              />

              {/* Search Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {searchLoading && (
                    <div className={styles.loadingSuggestion}>
                      <Loader size="small" />
                      <span>Searching...</span>
                    </div>
                  )}

                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.ticker}
                      ref={el => suggestionRefs.current[index] = el}
                      className={classNames(styles.suggestion, {
                        [styles.selectedSuggestion]: index === selectedSuggestionIndex
                      })}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className={styles.suggestionInfo}>
                        <div className={styles.suggestionTicker}>
                          {suggestion.ticker}
                        </div>
                        <div className={styles.suggestionName}>
                          {suggestion.name}
                        </div>
                        {suggestion.exchange && (
                          <div className={styles.suggestionExchange}>
                            {suggestion.exchange}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Asset Info Display */}
              {selectedAssetInfo && (
                <div className={styles.assetInfo}>
                  <strong>{selectedAssetInfo.name}</strong>
                  {selectedAssetInfo.currentPrice && (
                    <span>Price: ${selectedAssetInfo.currentPrice.toFixed(2)}</span>
                  )}
                  {selectedAssetInfo.sector && (
                    <Badge variant="secondary">{selectedAssetInfo.sector}</Badge>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Asset Name"
              placeholder="e.g., Apple Inc."
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={validationErrors.name}
              disabled={assetInfoLoading}
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Asset Class"
              value={formData.assetClass}
              onChange={(value) => handleFieldChange('assetClass', value)}
              options={ASSET_CLASSES}
              required
            />

            {!isEasyMode && (
              <Select
                label="Currency"
                value={formData.currency}
                onChange={(value) => handleFieldChange('currency', value)}
                options={CURRENCIES}
                required
              />
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Position Details</h4>

          <div className={styles.row}>
            <div className={styles.weightField}>
              <Input
                type="number"
                label="Weight (%)"
                placeholder="0"
                value={formData.weight?.toString() || ''}
                onChange={(e) => handleFieldChange('weight', Number(e.target.value))}
                error={validationErrors.weight}
                min="0"
                max="100"
                step="0.01"
                required
              />

              {/* Quick Weight Buttons (Easy Mode) */}
              {isEasyMode && (
                <div className={styles.quickWeights}>
                  <span className={styles.quickWeightsLabel}>Quick:</span>
                  {QUICK_WEIGHTS.map(weight => (
                    <button
                      key={weight}
                      type="button"
                      className={classNames(styles.quickWeightBtn, {
                        [styles.active]: formData.weight === weight
                      })}
                      onClick={() => handleQuickWeight(weight)}
                      disabled={weight > remainingWeight}
                    >
                      {weight}%
                    </button>
                  ))}
                  {remainingWeight < 100 && (
                    <div className={styles.remainingInfo}>
                      Remaining: {remainingWeight.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isEasyMode && (
              <Input
                type="number"
                label="Quantity"
                placeholder="0"
                value={formData.quantity?.toString() || ''}
                onChange={(e) => handleFieldChange('quantity', Number(e.target.value))}
                error={validationErrors.quantity}
                min="0"
                step="0.001"
              />
            )}
          </div>

          {!isEasyMode && (
            <>
              <div className={styles.row}>
                <Input
                  type="number"
                  label="Purchase Price"
                  placeholder="0.00"
                  value={formData.purchasePrice?.toString() || ''}
                  onChange={(e) => handleFieldChange('purchasePrice', Number(e.target.value))}
                  error={validationErrors.purchasePrice}
                  min="0"
                  step="0.01"
                />

                <Input
                  type="number"
                  label="Current Price"
                  placeholder="0.00"
                  value={formData.currentPrice?.toString() || ''}
                  onChange={(e) => handleFieldChange('currentPrice', Number(e.target.value))}
                  error={validationErrors.currentPrice}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className={styles.row}>
                <Input
                  type="date"
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleFieldChange('purchaseDate', e.target.value)}
                  max={formatDate(new Date(), 'input')}
                />
              </div>
            </>
          )}
        </div>

        {!isEasyMode && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Additional Information (Optional)</h4>

            <div className={styles.row}>
              <Input
                label="Sector"
                placeholder="e.g., Technology, Healthcare"
                value={formData.sector}
                onChange={(e) => handleFieldChange('sector', e.target.value)}
                disabled={assetInfoLoading}
              />

              <Input
                label="Industry"
                placeholder="e.g., Software, Pharmaceuticals"
                value={formData.industry}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                disabled={assetInfoLoading}
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Country"
                placeholder="e.g., United States, Germany"
                value={formData.country}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                disabled={assetInfoLoading}
              />

              <Input
                label="Exchange"
                placeholder="e.g., NASDAQ, NYSE"
                value={formData.exchange}
                onChange={(e) => handleFieldChange('exchange', e.target.value)}
                disabled={assetInfoLoading}
              />
            </div>
          </div>
        )}
      </>
    );
  };

  // If editing existing asset, only show form
  if (asset) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <h3>Edit Asset</h3>
            {mode && (
              <Badge variant={isEasyMode ? 'primary' : 'secondary'}>
                {isEasyMode ? '⚡ Easy Mode' : '⚙️ Professional Mode'}
              </Badge>
            )}
          </div>

          {renderAssetForm()}

          <div className={styles.actions}>
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !formData.ticker || !formData.weight}
            >
              {loading ? 'Saving...' : 'Update Asset'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // For new assets, show tabs if templates/import are enabled
  if (!hasMultipleTabs) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <h3>Add Asset</h3>
            {mode && (
              <Badge variant={isEasyMode ? 'primary' : 'secondary'}>
                {isEasyMode ? '⚡ Easy Mode' : '⚙️ Professional Mode'}
              </Badge>
            )}
          </div>

          {renderAssetForm()}

          {/* Error Messages */}
          {searchError && (
            <div className={styles.errorMessage}>
              Search error: {searchError}
            </div>
          )}

          <div className={styles.actions}>
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !formData.ticker || !formData.weight || (isEasyMode && !isTickerSelected)}
            >
              {loading ? 'Saving...' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Multi-tab interface
  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <h3>Add Assets to Portfolio</h3>
        {mode && (
          <Badge variant={isEasyMode ? 'primary' : 'secondary'}>
            {isEasyMode ? '⚡ Easy Mode' : '⚙️ Professional Mode'}
          </Badge>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        defaultActiveKey="form"
        onChange={(key) => setActiveTab(key)}
        type="line"
        className={styles.assetTabs}
      >
        <Tabs.TabPane tab="⚡ Quick Add" key="form">
          <form onSubmit={handleSubmit} className={styles.form}>
            {renderAssetForm()}

            {/* Error Messages */}
            {searchError && (
              <div className={styles.errorMessage}>
                Search error: {searchError}
              </div>
            )}

            <div className={styles.actions}>
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || !formData.ticker || !formData.weight || (isEasyMode && !isTickerSelected)}
              >
                {loading ? 'Saving...' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </Tabs.TabPane>

        {showTemplates && (
          <Tabs.TabPane tab="📋 Templates" key="templates">
            <TemplateSelector
              onTemplateSelect={handleTemplateSelect}
              onCancel={() => setActiveTab('form')}
            />
          </Tabs.TabPane>
        )}

        {showImport && (
          <Tabs.TabPane tab="📁 Import" key="import">
            <AssetImport
              onImport={handleImport}
              onCancel={() => setActiveTab('form')}
              existingTickers={existingTickers}
              isOpen={true}
              onClose={() => setActiveTab('form')}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default AssetForm;