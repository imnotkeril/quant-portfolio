/**
 * PortfolioSummary Component - FIXED: Cash as automatic remainder
 * File: frontend/src/components/portfolio/PortfolioSummary/PortfolioSummary.tsx
 */
import React from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Badge } from '../../common/Badge/Badge';
import { Button } from '../../common/Button/Button';
import { PieChart, PieChartDataPoint } from '../../charts/PieChart/PieChart';
import { Portfolio } from '../../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './PortfolioSummary.module.css';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  loading?: boolean;
  onUpdatePrices?: () => void;
  onOptimize?: () => void;
  onAnalyze?: () => void;
  updatingPrices?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  loading = false,
  onUpdatePrices,
  onOptimize,
  onAnalyze,
  updatingPrices = false,
  className,
  'data-testid': testId,
}) => {
  // Calculate portfolio statistics
  const totalValue = portfolio.totalValue || portfolio.assets.reduce(
    (sum, asset) => sum + (asset.positionValue || 0), 0
  );

  const totalPnL = portfolio.assets.reduce(
    (sum, asset) => sum + (asset.profitLoss || 0), 0
  );

  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  // FIXED: Calculate total allocated weight and cash remainder
  const totalAllocatedWeight = portfolio.assets.reduce(
    (sum, asset) => sum + (asset.weight || 0), 0
  );
  const cashWeight = Math.max(0, 100 - totalAllocatedWeight);

  // FIXED: Prepare asset allocation data for pie chart INCLUDING CASH
  const allocationData: PieChartDataPoint[] = portfolio.assets
    .filter(asset => asset.weight && asset.weight > 0)
    .map((asset, index) => ({
      name: asset.ticker,
      value: asset.weight || 0,
      color: getChartColor(index),
    }))
    .sort((a, b) => b.value - a.value);

  // FIXED: Add cash as separate item if there's any remainder
  if (cashWeight > 0) {
    allocationData.push({
      name: 'Cash',
      value: cashWeight,
      color: getChartColor(allocationData.length), // Next available color
    });
  }

  // Group smaller assets (keep top 8 + cash)
  const topAssets = allocationData.slice(0, 8);
  const remainingWeight = allocationData.slice(8).reduce((sum, item) => sum + item.value, 0);

  let finalAllocationData = [...topAssets];
  if (remainingWeight > 0) {
    finalAllocationData.push({
      name: 'Others',
      value: remainingWeight,
      color: getChartColor(topAssets.length),
    });
  }

  // Calculate sector allocation (excluding cash)
  const sectorAllocation = portfolio.assets.reduce((acc, asset) => {
    if (asset.sector && asset.weight) {
      acc[asset.sector] = (acc[asset.sector] || 0) + asset.weight;
    }
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorAllocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const containerClasses = classNames(styles.container, className);

  if (loading) {
    return (
      <Card className={containerClasses} loading data-testid={testId} />
    );
  }

  return (
    <div className={containerClasses} data-testid={testId}>
      <Card>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{portfolio.name}</h2>
            {portfolio.description && (
              <p className={styles.description}>{portfolio.description}</p>
            )}

            {portfolio.tags && portfolio.tags.length > 0 && (
              <div className={styles.tags}>
                {portfolio.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" size="small">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {onUpdatePrices && (
              <Button
                variant="secondary"
                size="small"
                onClick={onUpdatePrices}
                loading={updatingPrices}
                disabled={updatingPrices}
              >
                {updatingPrices ? 'Updating...' : '🔄 Update Prices'}
              </Button>
            )}

            {onOptimize && (
              <Button
                variant="secondary"
                size="small"
                onClick={onOptimize}
              >
                ⚖️ Optimize
              </Button>
            )}

            {onAnalyze && (
              <Button
                variant="primary"
                size="small"
                onClick={onAnalyze}
              >
                📊 Analyze
              </Button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* Portfolio Value */}
          <div className={styles.valueSection}>
            <div className={styles.totalValue}>
              <span className={styles.valueLabel}>Total Value</span>
              <span className={styles.valueAmount}>
                {formatCurrency(totalValue)}
              </span>
            </div>

            <div className={styles.pnlSection}>
              <span className={styles.pnlLabel}>Total P&L</span>
              <span className={classNames(
                styles.pnlAmount,
                { [styles.positive]: totalPnL >= 0, [styles.negative]: totalPnL < 0 }
              )}>
                {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercent / 100)})
              </span>
            </div>
          </div>

          {/* Asset Allocation Chart */}
          <div className={styles.allocationSection}>
            <h3 className={styles.sectionTitle}>Asset Allocation</h3>

            <div className={styles.chartContainer}>
              <PieChart
                data={finalAllocationData}
                height={200}
                showLegend={false}
                innerRadius={60}
                outerRadius={90}
              />
            </div>

            {/* FIXED: Asset list including cash */}
            <div className={styles.assetList}>
              {finalAllocationData.map((item, index) => (
                <div key={index} className={styles.assetItem}>
                  <div
                    className={styles.assetColor}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={styles.assetName}>{item.name}</span>
                  <span className={styles.assetWeight}>
                    {formatPercentage(item.value / 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sectors */}
          {topSectors.length > 0 && (
            <div className={styles.sectorsSection}>
              <h3 className={styles.sectionTitle}>Top Sectors</h3>
              <div className={styles.sectorsList}>
                {topSectors.map(([sector, weight], index) => (
                  <div key={sector} className={styles.sectorItem}>
                    <span className={styles.sectorName}>{sector}</span>
                    <span className={styles.sectorWeight}>
                      {formatPercentage(weight / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PortfolioSummary;