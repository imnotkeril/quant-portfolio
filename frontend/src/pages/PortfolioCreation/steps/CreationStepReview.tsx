/**
 * CreationStepReview Component
 * Review and confirm portfolio creation
 */
import React from 'react';
import Card from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { PieChart } from '../../../components/charts/PieChart/PieChart';
import { AssetTable } from '../../../components/portfolio/AssetTable/AssetTable';
import { PortfolioCreate } from '../../../types/portfolio';
import { formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from '../styles.module.css';

interface CreationStepReviewProps {
  portfolioData: PortfolioCreate;
  onComplete: (data?: any) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepReview: React.FC<CreationStepReviewProps> = ({
  portfolioData,
  onComplete,
  onCancel,
  loading = false,
  error = null,
}) => {
  // Prepare chart data
  const chartData = (portfolioData.assets || [])
    .filter(asset => asset.weight && asset.weight > 0)
    .map((asset, index) => ({
      name: asset.ticker,
      value: asset.weight || 0,
      color: getChartColor(index),
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate summary statistics
  const totalAssets = (portfolioData.assets || []).length;
  const totalWeight = (portfolioData.assets || []).reduce((sum, asset) => sum + (asset.weight || 0), 0);

  // Sector allocation
  const sectorAllocation = (portfolioData.assets || []).reduce((acc, asset) => {
    if (asset.sector && asset.weight) {
      acc[asset.sector] = (acc[asset.sector] || 0) + asset.weight;
    }
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorAllocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Asset class allocation
  const assetClassAllocation = (portfolioData.assets || []).reduce((acc, asset) => {
    if (asset.assetClass && asset.weight) {
      acc[asset.assetClass] = (acc[asset.assetClass] || 0) + asset.weight;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <h2>Review Portfolio</h2>
        <p>Review your portfolio configuration before creating</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.reviewContent}>
        {/* Portfolio Info */}
        <Card className={styles.reviewSection}>
          <h3>Portfolio Information</h3>
          <div className={styles.portfolioInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name:</span>
              <span className={styles.infoValue}>{portfolioData.name}</span>
            </div>
            {portfolioData.description && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Description:</span>
                <span className={styles.infoValue}>{portfolioData.description}</span>
              </div>
            )}
            {portfolioData.tags && portfolioData.tags.length > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tags:</span>
                <div className={styles.tagsList}>
                  {portfolioData.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Portfolio Summary */}
        <Card className={styles.reviewSection}>
          <h3>Portfolio Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Assets</span>
              <span className={styles.summaryValue}>{totalAssets}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Weight</span>
              <span className={styles.summaryValue}>
                {formatPercentage(totalWeight / 100)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Largest Holding</span>
              <span className={styles.summaryValue}>
                {chartData.length > 0
                  ? `${chartData[0].name} (${formatPercentage(chartData[0].value / 100)})`
                  : 'N/A'
                }
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Diversification</span>
              <span className={styles.summaryValue}>
                {totalAssets >= 10 ? 'High' : totalAssets >= 5 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </Card>

        {/* Asset Allocation Chart */}
        <Card className={styles.reviewSection}>
          <h3>Asset Allocation</h3>
          <div className={styles.allocationContent}>
            <div className={styles.chartContainer}>
              <PieChart
                data={chartData}
                height={300}
                showLabels={true}
                showLegend={true}
                innerRadius={50}
                labelFormatter={(entry) => {
                  const percentage = entry.value;
                  return percentage > 3 ? `${percentage.toFixed(1)}%` : '';
                }}
              />
            </div>
            <div className={styles.allocationSummary}>
              <div className={styles.topHoldings}>
                <h4>Top Holdings</h4>
                {chartData.slice(0, 5).map((asset, index) => (
                  <div key={asset.name} className={styles.holdingItem}>
                    <div
                      className={styles.holdingColor}
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className={styles.holdingName}>{asset.name}</span>
                    <span className={styles.holdingWeight}>
                      {formatPercentage(asset.value / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Sector Allocation */}
        {topSectors.length > 0 && (
          <Card className={styles.reviewSection}>
            <h3>Sector Allocation</h3>
            <div className={styles.sectorAllocation}>
              {topSectors.map(([sector, weight]) => (
                <div key={sector} className={styles.sectorItem}>
                  <span className={styles.sectorName}>{sector}</span>
                  <div className={styles.sectorBar}>
                    <div
                      className={styles.sectorProgress}
                      style={{ width: `${(weight / Math.max(...topSectors.map(([, w]) => w))) * 100}%` }}
                    />
                  </div>
                  <span className={styles.sectorWeight}>
                    {formatPercentage(weight / 100)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Asset Class Allocation */}
        {Object.keys(assetClassAllocation).length > 1 && (
          <Card className={styles.reviewSection}>
            <h3>Asset Class Allocation</h3>
            <div className={styles.assetClassGrid}>
              {Object.entries(assetClassAllocation).map(([assetClass, weight]) => (
                <div key={assetClass} className={styles.assetClassItem}>
                  <span className={styles.assetClassName}>
                    {assetClass.charAt(0).toUpperCase() + assetClass.slice(1)}
                  </span>
                  <span className={styles.assetClassWeight}>
                    {formatPercentage(weight / 100)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Assets Table */}
        <Card className={styles.reviewSection}>
          <h3>Assets Details</h3>
          <AssetTable
            assets={portfolioData.assets || []}
            showPerformance={false}
            className={styles.reviewTable}
          />
        </Card>
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
          onClick={onComplete}
          loading={loading}
        >
          Create Portfolio
        </Button>
      </div>
    </Card>
  );
};