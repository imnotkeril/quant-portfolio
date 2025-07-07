/**
 * CreationStepReview Component - FIXED
 * Review and confirm portfolio creation
 */
import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Badge } from '../../../components/common/Badge/Badge';
import { PieChart } from '../../../components/charts/PieChart/PieChart';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from '../PortfolioCreation.module.css';
import { useAssets } from '../../../hooks/useAssets';

interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

interface ConstraintsData {
  maxPositionSize: number;
  minPositionSize: number;
  sectorLimits: Record<string, number>;
  allowedRegions: string[];
  enableTaxOptimization: boolean;
  enableESG: boolean;
  enableCurrencyHedging: boolean;
}

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  portfolioType?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  rebalancingFrequency?: string;
  tags?: string[];
  assets: AssetFormData[];
  constraints?: ConstraintsData;
}

interface CreationStepReviewProps {
  mode: 'easy' | 'professional';
  formData: PortfolioFormData;
  onCreate: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepReview: React.FC<CreationStepReviewProps> = ({
  mode,
  formData,
  onCreate,
  onBack,
  loading = false,
  error = null,
}) => {
  const isEasyMode = mode === 'easy';
  const stepTitle = isEasyMode ? '✨ Ready to Create!' : '📋 Portfolio Review';
  const stepDescription = isEasyMode
    ? 'Your portfolio is ready! Review the details and create your portfolio.'
    : 'Review all portfolio settings before creation. You can make changes later.';

  const [enrichedAssets, setEnrichedAssets] = useState<AssetFormData[]>(formData.assets);
  const { getAssetInfo } = useAssets();

  useEffect(() => {
    const enrichAssets = async () => {
      const enrichedData = await Promise.all(
        formData.assets.map(async (asset) => {
          if (asset.sector) return asset;

          try {
            const assetInfo = await getAssetInfo(asset.ticker);
            return {
              ...asset,
              sector: assetInfo?.sector || 'Other'
            };
          } catch {
            return { ...asset, sector: 'Other' };
          }
        })
      );
      setEnrichedAssets(enrichedData);
    };

    enrichAssets();
  }, [formData.assets, getAssetInfo]);


  // Calculate total weight and amounts
  const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
  const cashWeight = 100 - totalWeight; // Cash percentage
  const isOverAllocated = totalWeight > 100;
  const isUnderAllocated = totalWeight < 100;

  // Calculate asset amounts with automatic quantity calculation
  const assetAmounts = formData.assets.map(asset => {
    const targetAmount = (formData.startingAmount * asset.weight) / 100;
    const quantity = asset.purchasePrice && asset.purchasePrice > 0
      ? Math.floor(targetAmount / asset.purchasePrice)
      : 0;
    const actualAmount = quantity * (asset.purchasePrice || 0);

    return {
      ...asset,
      targetAmount,
      calculatedQuantity: quantity,
      actualAmount,
    };
  });

  // Calculate cash remaining
  const totalActualAmount = assetAmounts.reduce((sum, asset) => sum + asset.actualAmount, 0);
  const cashRemaining = formData.startingAmount - totalActualAmount;

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

        {/* Portfolio Summary */}
        <div className={styles.reviewSummary}>
          <h3 className={styles.reviewSectionTitle}>Portfolio Overview</h3>

          <div className={styles.summaryCard}>
            <div className={styles.summaryCardTitle}>
              {formData.name}
            </div>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Starting Amount:</span>
                <span className={styles.summaryValue}>{formatCurrency(formData.startingAmount, 'USD')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Assets:</span>
                <span className={styles.summaryValue}>{formData.assets.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Weight:</span>
                <span className={styles.summaryValue}>{formatPercentage(totalWeight / 100)}</span>
              </div>
              {formData.description && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Description:</span>
                  <span className={styles.summaryValue}>{formData.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className={styles.allocationSection}>
          <h3 className={styles.reviewSectionTitle}>Asset Allocation</h3>

          <div className={styles.allocationGrid}>
            {/* Assets Chart */}
            <div className={styles.chartContainer}>
              <div className={styles.chartTitle}>By Assets</div>
              <div className={styles.allocationChart}>
                <PieChart
                  data={[
                    // Add all assets
                    ...formData.assets.map((asset, index) => ({
                      name: asset.ticker,
                      value: asset.weight,
                      color: getChartColor(index),
                    })),
                    // Add cash if there's any
                    ...(cashWeight > 0 ? [{
                      name: 'Cash',
                      value: cashWeight,
                      color: '#6B7280',
                    }] : [])
                  ]}
                  width={300}
                  height={300}
                />
              </div>
            </div>

            {/* Sectors Chart */}
            <div className={styles.chartContainer}>
              <div className={styles.chartTitle}>By Sectors</div>
              <div className={styles.allocationChart}>
                <PieChart
                  data={[
                    // Group assets by sector
                    ...Object.entries(
                      enrichedAssets.reduce((acc, asset) => {
                        const sector = (asset.sector && asset.sector.trim() !== '') ? asset.sector : 'Other';
                        acc[sector] = (acc[sector] || 0) + asset.weight;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([sector, weight], index) => ({
                      name: sector,
                      value: weight,
                      color: getChartColor(index),
                    })),
                    // Add cash if there's any
                    ...(cashWeight > 0 ? [{
                      name: 'Cash',
                      value: cashWeight,
                      color: '#6B7280',
                    }] : [])
                  ]}
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </div>

          {/* Detailed Asset Table - WITH ACTIONS=FALSE */}
          <div className={styles.detailedTable} style={{ marginTop: '2rem' }}>
          <div className={styles.detailedTable}>
            <AssetTable
              assets={formData.assets}
              portfolioValue={formData.startingAmount}
              showActions={false}
              showPnL={false}
              showDeleteAll={false}
            />
          </div>
          </div>
        </div>

        {/* Professional Mode - Constraints Summary */}
        {!isEasyMode && formData.constraints && (
          <div className={styles.constraintsSection}>
            <h3 className={styles.reviewSectionTitle}>Risk Constraints</h3>
            <div className={styles.constraintsGrid}>
              <div className={styles.constraintItem}>
                <span className={styles.constraintLabel}>Max Position Size:</span>
                <span className={styles.constraintValue}>
                  {formatPercentage(formData.constraints.maxPositionSize / 100)}
                </span>
              </div>
              <div className={styles.constraintItem}>
                <span className={styles.constraintLabel}>Min Position Size:</span>
                <span className={styles.constraintValue}>
                  {formatPercentage(formData.constraints.minPositionSize / 100)}
                </span>
              </div>
              {formData.constraints.enableTaxOptimization && (
                <div className={styles.constraintItem}>
                  <Badge variant="success" size="small">Tax Optimization Enabled</Badge>
                </div>
              )}
              {formData.constraints.enableESG && (
                <div className={styles.constraintItem}>
                  <Badge variant="success" size="small">ESG Screening Enabled</Badge>
                </div>
              )}
              {formData.constraints.enableCurrencyHedging && (
                <div className={styles.constraintItem}>
                  <Badge variant="success" size="small">Currency Hedging Enabled</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnings */}
        {(isOverAllocated || isUnderAllocated) && (
          <div className={styles.warningSection}>
            <h4 className={styles.warningTitle}>⚠️ Allocation Warnings</h4>
            {isOverAllocated && (
              <div className={styles.warningItem}>
                Your portfolio is over-allocated by {formatPercentage((totalWeight - 100) / 100)}.
                Consider reducing some positions.
              </div>
            )}
            {isUnderAllocated && (
              <div className={styles.warningItem}>
                Your portfolio is under-allocated by {formatPercentage((100 - totalWeight) / 100)}.
                Consider increasing positions or adding more assets.
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.stepActions}>
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
            variant="primary"
            onClick={onCreate}
            loading={loading}
            disabled={loading || formData.assets.length === 0}
          >
            {loading ? 'Creating Portfolio...' : 'Create Portfolio'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreationStepReview;