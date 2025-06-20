/**
 * CreationStepAssets Component
 * Assets selection step for portfolio creation
 */
import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Modal } from '../../../components/common/Modal/Modal';
import { AssetForm } from '../../../components/portfolio/AssetForm/AssetForm';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { AssetCreate } from '../../../types/portfolio';
import styles from '../styles.module.css';

interface CreationStepAssetsProps {
  initialAssets: AssetCreate[];
  onComplete: (assets: AssetCreate[]) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepAssets: React.FC<CreationStepAssetsProps> = ({
  initialAssets,
  onComplete,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [assets, setAssets] = useState<AssetCreate[]>(initialAssets);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetCreate | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetForm(true);
    setValidationError('');
  };

  const handleEditAsset = (asset: AssetCreate) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
    setValidationError('');
  };

  const handleDeleteAsset = (ticker: string) => {
    setAssets(prev => prev.filter(asset => asset.ticker !== ticker));
    setValidationError('');
  };

  const handleAssetSubmit = (assetData: AssetCreate) => {
    // Check for duplicate ticker
    const existingAsset = assets.find(a =>
      a.ticker.toUpperCase() === assetData.ticker.toUpperCase() &&
      (!editingAsset || a.ticker !== editingAsset.ticker)
    );

    if (existingAsset) {
      setValidationError(`Asset with ticker "${assetData.ticker}" already exists`);
      return;
    }

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
    setShowAssetForm(false);
    setEditingAsset(null);
    setValidationError('');
  };

  const handleAssetCancel = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
    setValidationError('');
  };

  const normalizeWeights = () => {
    const totalWeight = assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);

    if (totalWeight === 0) return;

    const normalizedAssets = assets.map(asset => ({
      ...asset,
      weight: asset.weight ? (asset.weight / totalWeight) * 100 : 0,
    }));

    setAssets(normalizedAssets);
  };

  const handleContinue = () => {
    // Validate assets
    if (assets.length === 0) {
      setValidationError('Please add at least one asset to your portfolio');
      return;
    }

    const totalWeight = assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);

    if (Math.abs(totalWeight - 100) > 0.01) {
      setValidationError(
        `Total weights must equal 100%. Current total: ${totalWeight.toFixed(2)}%`
      );
      return;
    }

    onComplete(assets);
  };

  const calculateTotalWeight = () => {
    return assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  };

  const getWeightStatus = () => {
    const total = calculateTotalWeight();
    if (Math.abs(total - 100) < 0.01) return 'valid';
    if (total > 100) return 'over';
    return 'under';
  };

  const popularAssets = [
    { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
    { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
    { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financial Services' },
  ];

  const handleQuickAdd = (assetInfo: any) => {
    const newAsset: AssetCreate = {
      ticker: assetInfo.ticker,
      name: assetInfo.name,
      sector: assetInfo.sector,
      weight: 0,
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      assetClass: 'stocks',
      currency: 'USD',
    };

    setAssets(prev => [...prev, newAsset]);
  };

  const weightStatus = getWeightStatus();
  const totalWeight = calculateTotalWeight();

  return (
    <Card className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <h2>Add Assets</h2>
        <p>Build your portfolio by adding assets and setting their weights</p>
      </div>

      {(error || validationError) && (
        <div className={styles.errorMessage}>
          {error || validationError}
        </div>
      )}

      <div className={styles.assetsContent}>
        <div className={styles.assetsHeader}>
          <div className={styles.weightsSummary}>
            <div className={styles.totalWeight}>
              <span className={styles.weightLabel}>Total Weight:</span>
              <span className={`${styles.weightValue} ${styles[weightStatus]}`}>
                {totalWeight.toFixed(2)}%
              </span>
            </div>
            <div className={styles.weightStatus}>
              {weightStatus === 'valid' && (
                <span className={styles.statusValid}>✓ Weights balanced</span>
              )}
              {weightStatus === 'over' && (
                <span className={styles.statusOver}>⚠ Over-allocated</span>
              )}
              {weightStatus === 'under' && (
                <span className={styles.statusUnder}>⚠ Under-allocated</span>
              )}
            </div>
          </div>

          <div className={styles.assetsActions}>
            {Math.abs(totalWeight - 100) > 0.01 && assets.length > 0 && (
              <Button
                variant="outline"
                size="small"
                onClick={normalizeWeights}
                disabled={loading}
              >
                Normalize Weights
              </Button>
            )}
            <Button
              onClick={handleAddAsset}
              disabled={loading}
            >
              Add Asset
            </Button>
          </div>
        </div>

        {assets.length > 0 ? (
          <AssetTable
            assets={assets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
            loading={loading}
            className={styles.assetsTable}
          />
        ) : (
          <div className={styles.emptyAssets}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>No Assets Added</h3>
              <p>Start building your portfolio by adding your first asset</p>

              <div className={styles.quickAddSection}>
                <h4>Popular Assets</h4>
                <div className={styles.popularAssets}>
                  {popularAssets.map((asset) => (
                    <button
                      key={asset.ticker}
                      className={styles.popularAssetButton}
                      onClick={() => handleQuickAdd(asset)}
                      disabled={loading}
                    >
                      <div className={styles.assetInfo}>
                        <span className={styles.assetTicker}>{asset.ticker}</span>
                        <span className={styles.assetName}>{asset.name}</span>
                        <span className={styles.assetSector}>{asset.sector}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddAsset}
                disabled={loading}
                className={styles.addFirstAsset}
              >
                Add Custom Asset
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.stepActions}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          loading={loading}
          disabled={assets.length === 0 || Math.abs(totalWeight - 100) > 0.01}
        >
          Continue to Review
        </Button>
      </div>

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
          loading={loading}
        />
      </Modal>
    </Card>
  );
};