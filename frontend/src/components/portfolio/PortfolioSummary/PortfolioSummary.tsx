/**
 * PortfolioSummary Component
 * Summary card showing key portfolio metrics and performance
 */
import React from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { PieChart, PieChartDataPoint } from '../../charts/PieChart';
import { Portfolio } from '../../../types/portfolio';
import { formatCurrency, formatPercentage, formatDate, formatNumber } from '../../../utils/formatters';
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

  // Prepare asset allocation data for pie chart
  const allocationData: PieChartDataPoint[] = portfolio.assets
    .filter(asset => asset.weight && asset.weight > 0)
    .map(asset => ({
      name: asset.ticker,
      value: asset.weight || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 assets

  // Group smaller assets
  const remainingWeight = portfolio.assets
    .filter(asset => asset.weight && asset.weight > 0)
    .slice(8)
    .reduce((sum, asset) => sum + (asset.weight || 0), 0);

  if (remainingWeight > 0) {
    allocationData.push({
      name: 'Others',
      value: remainingWeight,
    });
  }

  // Calculate sector allocation
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
                variant="outline"
                size="small"
                loading={updatingPrices}
                onClick={onUpdatePrices}
                disabled={updatingPrices}
              >
                Update Prices
              </Button>
            )}
            {onOptimize && (
              <Button
                variant="secondary"
                size="small"
                onClick={onOptimize}
              >
                Optimize
              </Button>
            )}
            {onAnalyze && (
              <Button
                variant="primary"
                size="small"
                onClick={onAnalyze}
              >
                Analyze
              </Button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.metricsSection}>
            <div className={styles.primaryMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Total Value</span>
                <span className={styles.metricValue}>
                  {formatCurrency(totalValue)}
                </span>
              </div>

              <div className={styles.metric}>
                <span className={styles.metricLabel}>Total P&L</span>
                <span className={classNames(
                  styles.metricValue,
                  styles.pnlValue,
                  {
                    [styles.positive]: totalPnL >= 0,
                    [styles.negative]: totalPnL < 0
                  }
                )}>
                  {formatCurrency(totalPnL)}
                  <span className={styles.pnlPercent}>
                    ({formatPercentage(totalPnLPercent / 100)})
                  </span>
                </span>
              </div>
            </div>

            <div className={styles.secondaryMetrics}>
              <div className={styles.metricSmall}>
                <span className={styles.metricSmallLabel}>Assets</span>
                <span className={styles.metricSmallValue}>
                  {formatNumber(portfolio.assets.length)}
                </span>
              </div>

              <div className={styles.metricSmall}>
                <span className={styles.metricSmallLabel}>Last Updated</span>
                <span className={styles.metricSmallValue}>
                  {formatDate(portfolio.lastUpdated, 'relative')}
                </span>
              </div>

              <div className={styles.metricSmall}>
                <span className={styles.metricSmallLabel}>Created</span>
                <span className={styles.metricSmallValue}>
                  {formatDate(portfolio.created, 'short')}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.allocationChart}>
              <h3 className={styles.chartTitle}>Asset Allocation</h3>
              {allocationData.length > 0 ? (
                <PieChart
                  data={allocationData}
                  height={200}
                  showLegend={false}
                  innerRadius={40}
                  labelFormatter={(entry) => {
                    const percentage = entry.value;
                    return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
                  }}
                />
              ) : (
                <div className={styles.noChart}>
                  <p>No allocation data available</p>
                </div>
              )}
            </div>

            {topSectors.length > 0 && (
              <div className={styles.sectorsSection}>
                <h3 className={styles.chartTitle}>Top Sectors</h3>
                <div className={styles.sectors}>
                  {topSectors.map(([sector, weight]) => (
                    <div key={sector} className={styles.sector}>
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
        </div>
      </Card>
    </div>
  );
};

export default PortfolioSummary;