/**
 * AssetForm Component
 * Form for adding and editing portfolio assets
 */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Select } from '../../common/Select';
import { AssetCreate } from '../../../types/portfolio';
import { validateAsset } from '../../../utils/validators';
import { formatDate } from '../../../utils/formatters';
import styles from './AssetForm.module.css';

interface AssetFormProps {
  asset?: AssetCreate | null;
  onSubmit: (asset: AssetCreate) => void;
  onCancel?: () => void;
  existingTickers?: string[];
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

const ASSET_CLASSES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
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

export const AssetForm: React.FC<AssetFormProps> = ({
  asset = null,
  onSubmit,
  onCancel,
  existingTickers = [],
  loading = false,
  className,
  'data-testid': testId,
}) => {
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
    }
  }, [asset]);

  // Handle form field changes
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

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form
    const validation = validateAsset(formData);
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('ticker')) errors.ticker = error;
        if (error.includes('weight')) errors.weight = error;
        if (error.includes('quantity')) errors.quantity = error;
        if (error.includes('price')) {
          if (error.includes('purchase')) errors.purchasePrice = error;
          else errors.currentPrice = error;
        }
      });
      setValidationErrors(errors);
      return;
    }

    // Check for duplicate ticker
    if (!asset && existingTickers.includes(formData.ticker.toUpperCase())) {
      setValidationErrors({ ticker: 'This ticker already exists in the portfolio' });
      return;
    }

    // Submit form data
    onSubmit({
      ...formData,
      ticker: formData.ticker.toUpperCase(),
      weight: Number(formData.weight),
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchasePrice),
      currentPrice: Number(formData.currentPrice),
    });
  };

  const containerClasses = classNames(styles.container, className);

  return (
    <div className={containerClasses} data-testid={testId}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Basic Information</h4>

          <div className={styles.row}>
            <Input
              label="Ticker Symbol"
              placeholder="e.g., AAPL"
              value={formData.ticker}
              onChange={(e) => handleFieldChange('ticker', e.target.value.toUpperCase())}
              error={validationErrors.ticker}
              required
              disabled={!!asset} // Disable editing ticker for existing assets
            />

            <Input
              label="Asset Name"
              placeholder="e.g., Apple Inc."
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={validationErrors.name}
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

            <Select
              label="Currency"
              value={formData.currency}
              onChange={(value) => handleFieldChange('currency', value)}
              options={CURRENCIES}
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Position Details</h4>

          <div className={styles.row}>
            <Input
              type="number"
              label="Weight (%)"
              placeholder="0"
              value={formData.weight?.toString() || ''}
              onChange={(e) => handleFieldChange('weight', e.target.value)}
              error={validationErrors.weight}
              min="0"
              max="100"
              step="0.01"
            />

            <Input
              type="number"
              label="Quantity"
              placeholder="0"
              value={formData.quantity?.toString() || ''}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              error={validationErrors.quantity}
              min="0"
              step="0.001"
            />
          </div>

          <div className={styles.row}>
            <Input
              type="number"
              label="Purchase Price"
              placeholder="0.00"
              value={formData.purchasePrice?.toString() || ''}
              onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
              error={validationErrors.purchasePrice}
              min="0"
              step="0.01"
            />

            <Input
              type="date"
              label="Purchase Date"
              value={formData.purchaseDate}
              onChange={(e) => handleFieldChange('purchaseDate', e.target.value)}
              error={validationErrors.purchaseDate}
            />
          </div>

          <div className={styles.row}>
            <Input
              type="number"
              label="Current Price"
              placeholder="0.00"
              value={formData.currentPrice?.toString() || ''}
              onChange={(e) => handleFieldChange('currentPrice', e.target.value)}
              error={validationErrors.currentPrice}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Additional Information</h4>

          <div className={styles.row}>
            <Input
              label="Sector"
              placeholder="e.g., Technology"
              value={formData.sector}
              onChange={(e) => handleFieldChange('sector', e.target.value)}
            />

            <Input
              label="Industry"
              placeholder="e.g., Consumer Electronics"
              value={formData.industry}
              onChange={(e) => handleFieldChange('industry', e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Country"
              placeholder="e.g., United States"
              value={formData.country}
              onChange={(e) => handleFieldChange('country', e.target.value)}
            />

            <Input
              label="Exchange"
              placeholder="e.g., NASDAQ"
              value={formData.exchange}
              onChange={(e) => handleFieldChange('exchange', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!formData.ticker.trim()}
          >
            {asset ? 'Update Asset' : 'Add Asset'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;