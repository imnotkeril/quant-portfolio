/**
 * CreationStepReview Component
 * Review and confirm portfolio creation (Easy/Professional modes)
 */
import React from 'react';
import Card from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Badge } from '../../../components/common/Badge/Badge';
import { PieChart } from '../../../components/charts/PieChart/PieChart';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
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

  // Prepare chart data
  const chartData = formData.assets
    .filter(asset => asset.weight && asset.weight > 0)
    .map((asset, index) => ({
      name: asset.ticker,
      value: asset.weight || 0,
      color: getChartColor(index),
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate summary statistics
  const totalAssets = formData.assets.length;
  const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);

  // Calculate dollar amounts
  const assetAmounts = formData.assets.map(asset => ({
    ...asset,
    amount: (asset.weight / 100) * formData.startingAmount,
  }));

  // Sector allocation
  const sectorAllocation = formData.assets.reduce((acc, asset) => {
    if (asset.sector && asset.weight) {
      acc[asset.sector] = (acc[asset.sector] || 0) + asset.weight;
    }
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorAllocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Asset class allocation
  const assetClassAllocation = formData.assets.reduce((acc, asset) => {
    if (asset.assetClass && asset.weight) {
      acc[asset.assetClass] = (acc[asset.assetClass] || 0) + asset.weight;
    }
    return acc;
  }, {} as Record<string, number>);

  // Risk metrics (simplified for display)
  const largestPosition = Math.max(...formData.assets.map(a => a.weight));
  const concentrationRisk = largestPosition > 25 ? 'High' : largestPosition > 15 ? 'Medium' : 'Low';
  const diversificationScore = totalAssets >= 10 ? 'High' : totalAssets >= 5 ? 'Medium' : 'Low';

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
          <h3 className={styles.reviewSectionTitle}>Portfolio Summary</h3>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h4 className={styles.summaryCardTitle}>Basic Information</h4>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Name:</span>
                  <span className={styles.summaryValue}>{formData.name}</span>
                </div>
                {formData.description && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Description:</span>
                    <span className={styles.summaryValue}>{formData.description}</span>
                  </div>
                )}
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Starting Amount:</span>
                  <span className={styles.summaryValue}>{formatCurrency(formData.startingAmount)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Number of Assets:</span>
                  <span className={styles.summaryValue}>{totalAssets}</span>
                </div>
              </div>
            </div>

            {/* Professional Mode Additional Settings */}
            {!isEasyMode && (
              <div className={styles.summaryCard}>
                <h4 className={styles.summaryCardTitle}>Portfolio Settings</h4>
                <div className={styles.summaryDetails}>
                  {formData.portfolioType && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Type:</span>
                      <span className={styles.summaryValue}>{formData.portfolioType}</span>
                    </div>
                  )}
                  {formData.riskTolerance && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Risk Tolerance:</span>
                      <span className={styles.summaryValue}>{formData.riskTolerance}</span>
                    </div>
                  )}
                  {formData.investmentObjective && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Investment Objective:</span>
                      <span className={styles.summaryValue}>{formData.investmentObjective}</span>
                    </div>
                  )}
                  {formData.rebalancingFrequency && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Rebalancing:</span>
                      <span className={styles.summaryValue}>{formData.rebalancingFrequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.summaryCard}>
              <h4 className={styles.summaryCardTitle}>Risk Metrics</h4>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Largest Position:</span>
                  <span className={styles.summaryValue}>{formatPercentage(largestPosition / 100)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Concentration Risk:</span>
                  <Badge
                    variant={concentrationRisk === 'High' ? 'warning' : concentrationRisk === 'Medium' ? 'neutral' : 'success'}
                    size="small"
                  >
                    {concentrationRisk}
                  </Badge>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Diversification:</span>
                  <Badge
                    variant={diversificationScore === 'High' ? 'success' : diversificationScore === 'Medium' ? 'neutral' : 'warning'}
                    size="small"
                  >
                    {diversificationScore}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tags for Professional Mode */}
          {!isEasyMode && formData.tags && formData.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h4 className={styles.tagsTitle}>Portfolio Tags</h4>
              <div className={styles.tagsList}>
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" size="small">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Asset Allocation Chart and Table */}
        <div className={styles.allocationSection}>
          <h3 className={styles.reviewSectionTitle}>Asset Allocation</h3>

          <div className={styles.allocationGrid}>
            <div className={styles.chartContainer}>
              <h4 className={styles.chartTitle}>Portfolio Composition</h4>
              <PieChart
                data={chartData}
                height={300}
                showTooltip={true}
                showLegend={false}
                className={styles.allocationChart}
              />
            </div>

            <div className={styles.allocationStats}>
              <h4 className={styles.chartTitle}>Asset Details</h4>
              <div className={styles.assetsList}>
                {assetAmounts.map((asset, index) => (
                  <div key={asset.id} className={styles.assetItem}>
                    <div className={styles.assetInfo}>
                      <div className={styles.assetTicker}>{asset.ticker}</div>
                      <div className={styles.assetName}>{asset.name}</div>
                    </div>
                    <div className={styles.assetAllocation}>
                      <div className={styles.assetWeight}>{formatPercentage(asset.weight / 100)}</div>
                      <div className={styles.assetAmount}>{formatCurrency(asset.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sector Allocation for Professional Mode */}
        {!isEasyMode && topSectors.length > 0 && (
          <div className={styles.sectorSection}>
            <h3 className={styles.reviewSectionTitle}>Sector Allocation</h3>
            <div className={styles.sectorGrid}>
              {topSectors.map(([sector, weight]) => (
                <div key={sector} className={styles.sectorItem}>
                  <span className={styles.sectorName}>{sector}</span>
                  <span className={styles.sectorWeight}>{formatPercentage(weight / 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints for Professional Mode */}
        {!isEasyMode && formData.constraints && (
          <div className={styles.constraintsSection}>
            <h3 className={styles.reviewSectionTitle}>Portfolio Constraints</h3>
            <div className={styles.constraintsGrid}>
              <div className={styles.constraintItem}>
                <span className={styles.constraintLabel}>Position Limits:</span>
                <span className={styles.constraintValue}>
                  {formatPercentage(formData.constraints.minPositionSize / 100)} - {formatPercentage(formData.constraints.maxPositionSize / 100)}
                </span>
              </div>

              <div className={styles.constraintItem}>
                <span className={styles.constraintLabel}>Geographic Regions:</span>
                <span className={styles.constraintValue}>
                  {formData.constraints.allowedRegions.join(', ')}
                </span>
              </div>

              <div className={styles.constraintItem}>
                <span className={styles.constraintLabel}>Advanced Options:</span>
                <div className={styles.advancedOptionsList}>
                  {formData.constraints.enableTaxOptimization && (
                    <Badge variant="success" size="small">Tax Optimization</Badge>
                  )}
                  {formData.constraints.enableESG && (
                    <Badge variant="success" size="small">ESG Screening</Badge>
                  )}
                  {formData.constraints.enableCurrencyHedging && (
                    <Badge variant="success" size="small">Currency Hedging</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {concentrationRisk === 'High' && (
          <div className={styles.warningMessage}>
            ⚠️ High concentration risk detected. Consider reducing your largest position for better diversification.
          </div>
        )}

        {diversificationScore === 'Low' && (
          <div className={styles.warningMessage}>
            💡 Consider adding more assets to improve diversification and reduce risk.
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
            onClick={onCreate}
            loading={loading}
            disabled={loading}
            size="large"
          >
            {loading ? 'Creating Portfolio...' : '🚀 Create Portfolio'}
          </Button>
        </div>
      </Card>
    </div>
  );
};