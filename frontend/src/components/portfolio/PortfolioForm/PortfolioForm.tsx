/**
 * PortfolioForm Component
 * Form for creating and editing portfolios
 */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Card from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { AssetTable } from '../AssetTable';
import { AssetForm } from '../AssetForm';
import { PortfolioCreate, PortfolioUpdate, Portfolio, AssetCreate } from '../../../types/portfolio';
import { validatePortfolio } from '../../../utils/validators';
import styles from './PortfolioForm.module.css';

interface PortfolioFormProps {
  portfolio?: Portfolio | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: PortfolioCreate | PortfolioUpdate) => void;
  onCancel?: () => void;
  submitText?: string;
  title?: string;
  className?: string;
  'data-testid'?: string;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({
  portfolio = null,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  submitText = 'Save Portfolio',
  title = 'Create Portfolio',
  className,
  'data-testid': testId,
}) => {
  const [formData, setFormData] = useState<PortfolioCreate>({
    name: '',
    description: '',
    tags: [],
    assets: [],
  });

  const [assets, setAssets] = useState<AssetCreate[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetCreate | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when portfolio prop changes
  useEffect(() => {
    if (portfolio) {
      setFormData({
        name: portfolio.name,
        description: portfolio.description || '',
        tags: portfolio.tags || [],
        assets: portfolio.assets.map(asset => ({
          ticker: asset.ticker,
          name: asset.name,
          weight: asset.weight,
          quantity: asset.quantity,
          purchasePrice: asset.purchasePrice,
          purchaseDate: asset.purchaseDate,
          currentPrice: asset.currentPrice,
          sector: asset.sector,
          industry: asset.industry,
          assetClass: asset.assetClass,
          currency: asset.currency,
          country: asset.country,
          exchange: asset.exchange,
        })),
      });
      setAssets(portfolio.assets.map(asset => ({
        ticker: asset.ticker,
        name: asset.name,
        weight: asset.weight,
        quantity: asset.quantity,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate,
        currentPrice: asset.currentPrice,
        sector: asset.sector,
        industry: asset.industry,
        assetClass: asset.assetClass,
        currency: asset.currency,
        country: asset.country,
        exchange: asset.exchange,
      })));
    }
  }, [portfolio]);

  // Handle form field changes
  const handleFieldChange = (field: keyof PortfolioCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle tags change
  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    handleFieldChange('tags', tags);
  };

  // Handle asset operations
  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetForm(true);
  };

  const handleEditAsset = (asset: AssetCreate) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleDeleteAsset = (ticker: string) => {
    const updatedAssets = assets.filter(asset => asset.ticker !== ticker);
    setAssets(updatedAssets);
    setFormData(prev => ({ ...prev, assets: updatedAssets }));
  };

  const handleAssetSubmit = (assetData: AssetCreate) => {
    let updatedAssets: AssetCreate[];

    if (editingAsset) {
      // Update existing asset
      updatedAssets = assets.map(asset =>
        asset.ticker === editingAsset.ticker ? assetData : asset
      );
    } else {
      // Add new asset
      updatedAssets = [...assets, assetData];
    }

    setAssets(updatedAssets);
    setFormData(prev => ({ ...prev, assets: updatedAssets }));
    setShowAssetForm(false);
    setEditingAsset(null);
  };

  const handleAssetCancel = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form
    const validation = validatePortfolio({ ...formData, assets });
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('name')) errors.name = error;
        if (error.includes('assets')) errors.assets = error;
      });
      setValidationErrors(errors);
      return;
    }

    // Submit form data
    onSubmit({ ...formData, assets });
  };

  const containerClasses = classNames(styles.container, className);

  return (
    <div className={containerClasses} data-testid={testId}>
      <Card title={title}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>

            <div className={styles.fields}>
              <Input
                label="Portfolio Name"
                placeholder="Enter portfolio name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={validationErrors.name}
                required
                fullWidth
              />

              <Input
                label="Description"
                placeholder="Enter portfolio description (optional)"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                fullWidth
              />

              <Input
                label="Tags"
                placeholder="Enter tags separated by commas"
                value={formData.tags?.join(', ') || ''}
                onChange={handleTagsChange}
                helperText="Separate multiple tags with commas"
                fullWidth
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Assets</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddAsset}
                disabled={loading}
              >
                Add Asset
              </Button>
            </div>

            {validationErrors.assets && (
              <div className={styles.fieldError}>
                {validationErrors.assets}
              </div>
            )}

            {assets.length > 0 ? (
              <AssetTable
                assets={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                className={styles.assetTable}
              />
            ) : (
              <div className={styles.emptyAssets}>
                <p>No assets added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAsset}
                  disabled={loading}
                >
                  Add Your First Asset
                </Button>
              </div>
            )}
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
              disabled={!formData.name.trim() || assets.length === 0}
            >
              {submitText}
            </Button>
          </div>
        </form>
      </Card>

      {/* Asset Form Modal */}
      <Modal
        isOpen={showAssetForm}
        onClose={handleAssetCancel}
        title={editingAsset ? 'Edit Asset' : 'Add Asset'}
        size="large"
      >
        <AssetForm
          asset={editingAsset}
          onSubmit={handleAssetSubmit}
          onCancel={handleAssetCancel}
          existingTickers={assets.map(a => a.ticker).filter(t => t !== editingAsset?.ticker)}
        />
      </Modal>
    </div>
  );
};

export default PortfolioForm;