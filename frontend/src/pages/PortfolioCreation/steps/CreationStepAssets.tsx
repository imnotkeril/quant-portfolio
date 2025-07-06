/**
 * CreationStepAssets Component
 * Assets selection step for portfolio creation (Easy/Professional modes)
 */
import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Badge } from '../../../components/common/Badge/Badge';
import { AssetForm } from '../../../components/portfolio/AssetForm/AssetForm';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { AssetCreate } from '../../../types/portfolio';
import styles from '../PortfolioCreation.module.css';

interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  assets: AssetFormData[];
}

interface CreationStepAssetsProps {
  mode: 'easy' | 'professional';
  formData: PortfolioFormData;
  onNext: (assets: AssetFormData[]) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepAssets: React.FC<CreationStepAssetsProps> = ({
  mode,
  formData,
  onNext,
  onBack,
  loading = false,
  error = null,
}) => {
  const [assets, setAssets] = useState<AssetFormData[]>(formData.assets || []);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setAssets(formData.assets || []);
  }, [formData.assets]);

  const handleAddAsset = (assetData: AssetCreate) => {
    console.log('handleAddAsset called with:', assetData); // Debug log

    // Check for duplicate ticker
    const existingAsset = assets.find(a =>
      a.ticker.toUpperCase() === assetData.ticker.toUpperCase()
    );

    if (existingAsset) {
      setValidationError(`Asset with ticker "${assetData.ticker}" already exists`);
      return;
    }

    // Create new asset with ID - FIXED: ensure weight is a number
    const newAsset: AssetFormData = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticker: assetData.ticker.toUpperCase(),
      name: assetData.name || assetData.ticker,
      weight: Number(assetData.weight) || 0, // FIXED: ensure numeric weight
      sector: assetData.sector,
      assetClass: assetData.assetClass,
      currentPrice: assetData.currentPrice,
      quantity: assetData.quantity,
      purchasePrice: assetData.purchasePrice,
      purchaseDate: assetData.purchaseDate,
    };

    console.log('Adding new asset:', newAsset); // Debug log
    setAssets(prev => {
      const updated = [...prev, newAsset];
      console.log('Updated assets:', updated); // Debug log
      return updated;
    });
    setValidationError('');
  };

  const handleEditAsset = (asset: AssetFormData) => {
    console.log('handleEditAsset called with:', asset); // Debug log
    setAssets(prev => prev.map(a =>
      a.id === asset.id ? { ...a, ...asset } : a
    ));
    setValidationError('');
  };

  const handleDeleteAsset = (ticker: string) => {
    console.log('handleDeleteAsset called with ticker:', ticker); // Debug log
    setAssets(prev => {
      const updated = prev.filter(asset => asset.ticker !== ticker);
      console.log('Assets after deletion:', updated); // Debug log
      return updated;
    });
    setValidationError('');
  };

  const normalizeWeights = () => {
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

    if (totalWeight === 0) return;

    const normalizedAssets = assets.map(asset => ({
      ...asset,
      weight: (asset.weight / totalWeight) * 100,
    }));

    setAssets(normalizedAssets);
    setValidationError('');
  };

  const validatePortfolio = (): boolean => {
    if (assets.length === 0) {
      setValidationError('Please add at least one asset to your portfolio');
      return false;
    }

    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

    if (Math.abs(totalWeight - 100) > 0.1) {
      setValidationError(`Total portfolio weight is ${totalWeight.toFixed(2)}%. Please adjust weights to total 100%.`);
      return false;
    }

    // Professional mode additional validations
    if (mode === 'professional') {
      // Check for overly concentrated positions
      const maxWeight = Math.max(...assets.map(a => a.weight));
      if (maxWeight > 50) {
        setValidationError(`Maximum position size (${maxWeight.toFixed(1)}%) exceeds recommended 50% limit. Consider diversifying.`);
        return false;
      }

      // Check for minimum positions
      const minWeight = Math.min(...assets.map(a => a.weight));
      if (minWeight < 1) {
        setValidationError(`Minimum position size (${minWeight.toFixed(1)}%) is below 1%. Consider consolidating small positions.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (validatePortfolio()) {
      onNext(assets);
    }
  };

  // Calculate portfolio metrics
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  const remainingWeight = Math.max(0, 100 - totalWeight);
  const isComplete = Math.abs(totalWeight - 100) <= 0.1;
  const existingTickers = assets.map(asset => asset.ticker);

  // Asset table columns configuration
  const assetTableColumns = mode === 'easy'
    ? ['ticker', 'name', 'weight', 'actions']  // Simple view for easy mode
    : ['ticker', 'name', 'weight', 'sector', 'currentPrice', 'actions']; // Extended view for professional

  const isEasyMode = mode === 'easy';
  const stepTitle = isEasyMode ? '📊 Add Your Assets' : '📊 Portfolio Assets Management';
  const stepDescription = isEasyMode
    ? 'Add stocks, ETFs, and other assets to build your portfolio'
    : 'Configure detailed asset allocations and portfolio composition';

  return (
    <div className={styles.stepContainer}>
      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <div className={styles.stepTitleRow}>
            <h2 className={styles.stepTitle}>{stepTitle}</h2>
            <Badge variant={isEasyMode ? 'success' : 'primary'}>
              {isEasyMode ? '⚡ Easy Mode' : '⚙️ Professional Mode'}
            </Badge>
          </div>
          <p className={styles.stepDescription}>{stepDescription}</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {validationError && (
          <div className={styles.errorMessage}>
            {validationError}
          </div>
        )}

        {/* Portfolio Progress */}
        <div className={styles.portfolioProgress}>
          <div className={styles.progressHeader}>
            <h3 className={styles.progressTitle}>Portfolio Allocation</h3>
            <div className={styles.progressStats}>
              <span className={styles.totalWeight}>
                {totalWeight.toFixed(1)}% allocated
              </span>
              <span className={styles.remainingWeight}>
                {remainingWeight.toFixed(1)}% remaining
              </span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(totalWeight, 100)}%`,
                backgroundColor: isComplete ? '#10B981' : totalWeight > 100 ? '#EF4444' : '#3B82F6'
              }}
            />
          </div>

          {totalWeight > 100 && (
            <div className={styles.progressWarning}>
              ⚠️ Portfolio is over-allocated. Please reduce some positions.
            </div>
          )}
        </div>

        {/* Asset Form */}
        <div className={styles.addAssetsSection}>
          <AssetForm
            onSubmit={handleAddAsset}
            onCancel={() => setActiveTab('form')}
            existingTickers={assets.map(a => a.ticker)}
            mode={mode}
            remainingWeight={remainingWeight}
            showTemplates={true}
            showImport={true}
          />
        </div>

        {/* Current Portfolio Assets */}
        <div className={styles.currentPortfolio}>
          <div className={styles.portfolioHeader}>
            <h3 className={styles.portfolioTitle}>
              Current Portfolio ({assets.length} asset{assets.length !== 1 ? 's' : ''})
            </h3>

            {assets.length > 1 && totalWeight !== 100 && (
              <Button
                variant="outline"
                size="small"
                onClick={normalizeWeights}
                disabled={loading || assets.length === 0}
              >
                🎯 Auto-Balance Weights
              </Button>
            )}
          </div>

          {assets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h4>No assets added yet</h4>
              <p>
                {isEasyMode
                  ? 'Use the form above to add your first asset, or try a template for quick setup.'
                  : 'Add individual assets or import your existing portfolio to get started.'
                }
              </p>
            </div>
          ) : (
            <div className={styles.portfolioTable}>
              <AssetTable
                assets={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                showActions={true}
                showPnL={false}
                loading={loading}
                className={styles.assetsTable}
              />
            </div>
          )}
        </div>

        {/* Portfolio Summary for Professional Mode */}
        {!isEasyMode && assets.length > 0 && (
          <div className={styles.portfolioSummary}>
            <h4 className={styles.summaryTitle}>Portfolio Summary</h4>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Assets:</span>
                <span className={styles.summaryValue}>{assets.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Largest Position:</span>
                <span className={styles.summaryValue}>
                  {assets.length > 0 ? `${Math.max(...assets.map(a => a.weight)).toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Smallest Position:</span>
                <span className={styles.summaryValue}>
                  {assets.length > 0 ? `${Math.min(...assets.map(a => a.weight)).toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Average Position:</span>
                <span className={styles.summaryValue}>
                  {assets.length > 0 ? `${(totalWeight / assets.length).toFixed(1)}%` : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !isComplete || assets.length === 0}
          >
            {isEasyMode ? 'Create Portfolio ✨' : 'Next: Review Portfolio'}
          </Button>
        </div>
      </Card>
    </div>
  );
};