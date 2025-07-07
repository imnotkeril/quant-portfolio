/**
 * PortfolioForm Component - FIXED
 * Form for creating and editing portfolios with working Edit/Delete handlers
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
    initialValue: 100000, // Default starting value
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
        initialValue: portfolio.initialValue || 100000,
        assets: portfolio.assets.map(asset => ({
          ticker: asset.ticker,
          name: asset.name,
          weight: asset.weight,
          purchasePrice: asset.purchasePrice,
          purchaseDate: asset.purchaseDate,
          currentPrice: asset.currentPrice,
          sector: asset.sector,
          industry: asset.industry,
          assetClass: asset.assetClass,
          country: asset.country,
          exchange: asset.exchange,
        })),
      });
      setAssets(portfolio.assets.map(asset => ({
        ticker: asset.ticker,
        name: asset.name,
        weight: asset.weight,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate,
        currentPrice: asset.currentPrice,
        sector: asset.sector,
        industry: asset.industry,
        assetClass: asset.assetClass,
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
    console.log('Editing asset:', asset);
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleDeleteAsset = (ticker: string) => {
    console.log('Deleting asset:', ticker);

    // Show confirmation
    if (!window.confirm(`Are you sure you want to delete ${ticker}?`)) {
      return;
    }

    const updatedAssets = assets.filter(asset => asset.ticker !== ticker);
    setAssets(updatedAssets);
    setFormData(prev => ({ ...prev, assets: updatedAssets }));

    console.log(`Asset ${ticker} deleted. Remaining assets:`, updatedAssets.length);
  };

  const handleDeleteAllAssets = () => {
    console.log('Deleting all assets');

    // Show confirmation
    if (!window.confirm(`Are you sure you want to delete all ${assets.length} assets?`)) {
      return;
    }

    setAssets([]);
    setFormData(prev => ({ ...prev, assets: [] }));

    console.log('All assets deleted');
  };

  const handleAssetSubmit = (assetData: AssetCreate) => {
    console.log('Asset submitted:', assetData);

    let updatedAssets: AssetCreate[];

    if (editingAsset) {
      // Update existing asset
      updatedAssets = assets.map(asset =>
        asset.ticker === editingAsset.ticker ? assetData : asset
      );
      console.log('Updated existing asset');
    } else {
      // Add new asset
      updatedAssets = [...assets, assetData];
      console.log('Added new asset');
    }

    setAssets(updatedAssets);
    setFormData(prev => ({ ...prev, assets: updatedAssets }));
    setShowAssetForm(false);
    setEditingAsset(null);

    console.log('Total assets now:', updatedAssets.length);
  };

  const handleAssetCancel = () => {
    console.log('Asset form cancelled');
    setShowAssetForm(false);
    setEditingAsset(null);
  };

  // Calculate remaining weight
  const totalWeight = assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  const remainingWeight = Math.max(0, 100 - totalWeight);

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
                error={validationErrors.description}
                multiline
                rows={3}
                fullWidth
              />

              <div className={styles.row}>
                <Input
                  label="Initial Value"
                  type="number"
                  placeholder="100000"
                  value={formData.initialValue}
                  onChange={(e) => handleFieldChange('initialValue', Number(e.target.value))}
                  min={1000}
                  step={1000}
                  required
                />

                <Input
                  label="Tags"
                  placeholder="Enter tags separated by commas"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                  onChange={handleTagsChange}
                  helperText="Use tags to categorize and organize your portfolios"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionInfo}>
                <h3 className={styles.sectionTitle}>Assets</h3>
                <div className={styles.allocationInfo}>
                  <span className={styles.totalAllocation}>
                    Total: {totalWeight.toFixed(1)}%
                  </span>
                  {remainingWeight > 0 && (
                    <span className={styles.remainingAllocation}>
                      Remaining: {remainingWeight.toFixed(1)}%
                    </span>
                  )}
                  {totalWeight > 100 && (
                    <span className={styles.overAllocation}>
                      Over-allocated by {(totalWeight - 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddAsset}
                variant="primary"
                size="small"
                disabled={loading}
              >
                Add Asset
              </Button>
            </div>

            {validationErrors.assets && (
              <div className={styles.error}>
                {validationErrors.assets}
              </div>
            )}

            {assets.length > 0 ? (
              <AssetTable
                assets={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                onDeleteAll={handleDeleteAllAssets}
                showActions={true}
                showPnL={false}
                showDeleteAll={true}
                loading={loading}
              />
            ) : (
              <div className={styles.emptyAssets}>
                <div className={styles.emptyIcon}>📊</div>
                <h4>No assets added yet</h4>
                <p className={styles.emptyDescription}>
                  Click "Add Asset" to start building your portfolio
                </p>
              </div>
            )}
          </div>

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
              disabled={loading || assets.length === 0}
            >
              {loading ? 'Saving...' : submitText}
            </Button>
          </div>
        </form>
      </Card>

      {/* Asset Form Modal */}
      {showAssetForm && (
        <Modal
          isOpen={showAssetForm}
          onClose={handleAssetCancel}
          title={editingAsset ? `Edit ${editingAsset.ticker}` : 'Add Asset'}
          maxWidth="xl"
        >
          <AssetForm
            asset={editingAsset}
            onSubmit={handleAssetSubmit}
            onCancel={handleAssetCancel}
            existingTickers={assets.map(a => a.ticker)}
            loading={loading}
            mode="professional" // Default to professional mode in form
            remainingWeight={remainingWeight}
            showTemplates={!editingAsset} // Only show templates when adding new assets
            showImport={!editingAsset} // Only show import when adding new assets
          />
        </Modal>
      )}
    </div>
  );
};

export default PortfolioForm;