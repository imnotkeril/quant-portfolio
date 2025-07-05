/**
 * CreationStepReview Component - FIXED
 * Review and confirm portfolio creation - TAGS HIDDEN IN PROFESSIONAL MODE
 */
import React from 'react';
import Card from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Badge } from '../../../components/common/Badge/Badge';
import { PieChart } from '../../../components/charts/PieChart/PieChart';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import { calculateQuantity } from '../../../types/portfolio';
import styles from '../PortfolioCreation.module.css';

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

  // Calculate total weight and amounts
  const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
  const isOverAllocated = totalWeight > 100;
  const isUnderAllocated = totalWeight < 100;

  // Calculate asset amounts with automatic quantity calculation
  const assetAmounts = formData.assets.map(asset => {
    const targetAmount = (formData.startingAmount * asset.weight) / 100;
    const quantity = asset.purchasePrice && asset.purchasePrice > 0
      ? calculateQuantity(asset.weight, formData.startingAmount, asset.purchasePrice)
      : 0;

    return {
      ...asset,
      targetAmount,
      calculatedQuantity: quantity,
    };
  });

  // Chart data for pie chart
  const chartData = formData.assets.map((asset, index) => ({
    name: asset.ticker,
    value: asset.weight,
    color: getChartColor(index),
  }));

  // Portfolio analysis
  const sectorDistribution = formData.assets.reduce((acc, asset) => {
    const sector = asset.sector || 'Unknown';
    acc[sector] = (acc[sector] || 0) + asset.weight;
    return acc;
  }, {} as Record<string, number>);

  const topSector = Object.entries(sectorDistribution).reduce((top, [sector, weight]) =>
    weight > top.weight ? { sector, weight } : top, { sector: '', weight: 0 });

  // Risk assessment
  const getConcentrationRisk = () => {
    const maxWeight = Math.max(...formData.assets.map(a => a.weight));
    if (maxWeight > 50) return 'High';
    if (maxWeight > 30) return 'Medium';
    return 'Low';
  };

  const getDiversificationScore = () => {
    const uniqueSectors = new Set(formData.assets.map(a => a.sector || 'Unknown')).size;
    if (uniqueSectors >= 5) return 'High';
    if (uniqueSectors >= 3) return 'Medium';
    return 'Low';
  };

  const concentrationRisk = getConcentrationRisk();
  const diversificationScore = getDiversificationScore();

  return (
    <div className={styles.stepContainer}>
      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>{stepTitle}</h2>
          <p className={styles.stepDescription}>{stepDescription}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.errorMessage}>
              {error}
            </div>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className={styles.reviewContent}>
          <div className={styles.summarySection}>
            <h3 className={styles.reviewSectionTitle}>Portfolio Summary</h3>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4 className={styles.summaryLabel}>Portfolio Name</h4>
                <p className={styles.summaryValue}>{formData.name}</p>
                {formData.description && (
                  <p className={styles.summaryDescription}>{formData.description}</p>
                )}
              </div>

              <div className={styles.summaryCard}>
                <h4 className={styles.summaryLabel}>Starting Amount</h4>
                <p className={styles.summaryValue}>{formatCurrency(formData.startingAmount)}</p>
              </div>

              <div className={styles.summaryCard}>
                <h4 className={styles.summaryLabel}>Total Assets</h4>
                <p className={styles.summaryValue}>{formData.assets.length}</p>
              </div>

              <div className={styles.summaryCard}>
                <h4 className={styles.summaryLabel}>Allocation</h4>
                <p className={styles.summaryValue}>
                  {formatPercentage(totalWeight)}
                  {isOverAllocated && (
                    <Badge variant="error" size="small" className={styles.allocationBadge}>
                      Over-allocated
                    </Badge>
                  )}
                  {isUnderAllocated && (
                    <Badge variant="warning" size="small" className={styles.allocationBadge}>
                      Under-allocated
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {/* Professional Mode - Additional Configuration Display */}
            {!isEasyMode && (
              <div className={styles.configurationSection}>
                <h4 className={styles.configTitle}>Portfolio Configuration</h4>
                <div className={styles.configGrid}>
                  {formData.portfolioType && (
                    <div className={styles.configItem}>
                      <span className={styles.configLabel}>Type:</span>
                      <span className={styles.configValue}>{formData.portfolioType}</span>
                    </div>
                  )}
                  {formData.riskTolerance && (
                    <div className={styles.configItem}>
                      <span className={styles.configLabel}>Risk Tolerance:</span>
                      <span className={styles.configValue}>{formData.riskTolerance}</span>
                    </div>
                  )}
                  {formData.investmentObjective && (
                    <div className={styles.configItem}>
                      <span className={styles.configLabel}>Objective:</span>
                      <span className={styles.configValue}>{formData.investmentObjective}</span>
                    </div>
                  )}
                  {formData.rebalancingFrequency && (
                    <div className={styles.configItem}>
                      <span className={styles.configLabel}>Rebalancing:</span>
                      <span className={styles.configValue}>{formData.rebalancingFrequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Portfolio Analysis */}
            <div className={styles.analysisSection}>
              <h4 className={styles.analysisTitle}>Portfolio Analysis</h4>
              <div className={styles.analysisGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Top Sector:</span>
                  <span className={styles.summaryValue}>
                    {topSector.sector} ({formatPercentage(topSector.weight)})
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Concentration Risk:</span>
                  <Badge
                    variant={concentrationRisk === 'High' ? 'error' : concentrationRisk === 'Medium' ? 'warning' : 'success'}
                    size="small"
                  >
                    {concentrationRisk}
                  </Badge>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Diversification:</span>
                  <Badge
                    variant={diversificationScore === 'High' ? 'success' : diversificationScore === 'Medium' ? 'warning' : 'error'}
                    size="small"
                  >
                    {diversificationScore}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* TAGS SECTION - ONLY FOR EASY MODE */}
          {isEasyMode && formData.tags && formData.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h4 className={styles.tagsTitle}>Portfolio Tags</h4>
              <div className={styles.tagsList}>
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" size="small">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
                      <div className={styles.assetHeader}>
                        <div className={styles.assetTicker}>{asset.ticker}</div>
                        <div className={styles.assetWeight}>{formatPercentage(asset.weight)}</div>
                      </div>
                      <div className={styles.assetDetails}>
                        <div className={styles.assetName}>{asset.name}</div>
                        <div className={styles.assetAmount}>
                          {formatCurrency(asset.targetAmount)}
                          {asset.calculatedQuantity > 0 && (
                            <span className={styles.assetQuantity}>
                              ({asset.calculatedQuantity} shares)
                            </span>
                          )}
                        </div>
                      </div>
                      {asset.sector && (
                        <div className={styles.assetSector}>{asset.sector}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Asset Table */}
            <div className={styles.detailedTable}>
              <AssetTable
                assets={formData.assets}
                showActions={false}
                showPnL={false}
                showDeleteAll={false}
              />
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
                    {formatPercentage(formData.constraints.maxPositionSize)}
                  </span>
                </div>
                <div className={styles.constraintItem}>
                  <span className={styles.constraintLabel}>Min Position Size:</span>
                  <span className={styles.constraintValue}>
                    {formatPercentage(formData.constraints.minPositionSize)}
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
              </div>
            </div>
          )}

          {/* Warnings */}
          {(isOverAllocated || isUnderAllocated) && (
            <div className={styles.warningSection}>
              <h4 className={styles.warningTitle}>⚠️ Allocation Warnings</h4>
              {isOverAllocated && (
                <div className={styles.warningItem}>
                  Your portfolio is over-allocated by {formatPercentage(totalWeight - 100)}.
                  Consider reducing some positions.
                </div>
              )}
              {isUnderAllocated && (
                <div className={styles.warningItem}>
                  Your portfolio is under-allocated by {formatPercentage(100 - totalWeight)}.
                  Consider increasing positions or adding more assets.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className={styles.stepActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Back
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onCreate}
            loading={loading}
            disabled={loading || formData.assets.length === 0}
            size="large"
          >
            {loading ? 'Creating Portfolio...' : '🚀 Create Portfolio'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreationStepReview;