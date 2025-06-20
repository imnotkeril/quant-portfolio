/**
 * DashboardLayout Component
 * Main layout for dashboard overview content
 */
import React from 'react';
import classNames from 'classnames';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { DashboardWidget } from './DashboardWidget';
import { Portfolio } from '../../types/portfolio';
import styles from './styles.module.css';

interface DashboardLayoutProps {
  selectedPortfolio: Portfolio | null;
  portfolios: any[];
  performanceData: any[];
  keyMetrics: any[];
  topHoldings: any[];
  timeframe: string;
  onPortfolioSelect: (portfolioId: string) => void;
  onAnalyzePortfolio: (portfolioId: string) => void;
  onOptimizePortfolio: (portfolioId: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  selectedPortfolio,
  portfolios,
  performanceData,
  keyMetrics,
  topHoldings,
  timeframe,
  onPortfolioSelect,
  onAnalyzePortfolio,
  onOptimizePortfolio,
  onTimeframeChange,
  className,
}) => {
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  const layoutClasses = classNames(styles.dashboardLayout, className);

  const renderPortfolioSelector = () => (
    <Card className={styles.portfolioSelector}>
      <div className={styles.selectorHeader}>
        <h3>Select Portfolio</h3>
        <span className={styles.portfolioCount}>
          {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className={styles.portfolioList}>
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className={classNames(styles.portfolioItem, {
              [styles.selected]: selectedPortfolio?.id === portfolio.id,
            })}
            onClick={() => onPortfolioSelect(portfolio.id)}
          >
            <div className={styles.portfolioInfo}>
              <h4>{portfolio.name}</h4>
              <span className={styles.assetCount}>
                {portfolio.assetCount} assets
              </span>
            </div>
            <div className={styles.portfolioActions}>
              <Button
                variant="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyzePortfolio(portfolio.id);
                }}
              >
                Analyze
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderTimeframeSelector = () => (
    <div className={styles.timeframeSelector}>
      {timeframes.map((tf) => (
        <Button
          key={tf}
          variant={timeframe === tf ? 'primary' : 'outline'}
          size="small"
          onClick={() => onTimeframeChange(tf)}
          className={styles.timeframeButton}
        >
          {tf}
        </Button>
      ))}
    </div>
  );

  const renderPerformanceSection = () => (
    <div className={styles.performanceSection}>
      <Card className={styles.performanceCard}>
        <div className={styles.performanceHeader}>
          <h3>Portfolio Performance</h3>
          {renderTimeframeSelector()}
        </div>
        <DashboardWidget
          title=""
          type="chart"
          data={performanceData}
          className={styles.performanceChart}
        />
        <div className={styles.performanceSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Current Value</span>
            <span className={styles.summaryValue}>$112,400</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Return</span>
            <span className={classNames(styles.summaryValue, styles.positive)}>
              +$12,400 (12.4%)
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Today's Change</span>
            <span className={classNames(styles.summaryValue, styles.positive)}>
              +$890 (0.8%)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMetricsGrid = () => (
    <div className={styles.metricsGrid}>
      {keyMetrics.map((metric, index) => (
        <DashboardWidget
          key={index}
          title={metric.name}
          type="number"
          value={metric.value}
          change={metric.change}
          positive={metric.positive}
          className={styles.metricWidget}
        />
      ))}
    </div>
  );

  const renderHoldingsTable = () => (
    <Card className={styles.holdingsCard}>
      <div className={styles.holdingsHeader}>
        <h3>Top Holdings</h3>
        <Button
          variant="text"
          size="small"
          onClick={() => selectedPortfolio && onAnalyzePortfolio(selectedPortfolio.id)}
        >
          View All
        </Button>
      </div>
      <div className={styles.holdingsTable}>
        <div className={styles.tableHeader}>
          <span>Asset</span>
          <span>Weight</span>
          <span>Value</span>
          <span>Change</span>
        </div>
        {topHoldings.map((holding, index) => (
          <div key={index} className={styles.tableRow}>
            <div className={styles.assetInfo}>
              <span className={styles.ticker}>{holding.ticker}</span>
              <span className={styles.name}>{holding.name}</span>
            </div>
            <span className={styles.weight}>{holding.weight}%</span>
            <span className={styles.value}>
              ${holding.value.toLocaleString()}
            </span>
            <span className={classNames(styles.change, {
              [styles.positive]: holding.change > 0,
              [styles.negative]: holding.change < 0,
            })}>
              {holding.change > 0 ? '+' : ''}{holding.change}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderQuickActions = () => (
    <Card className={styles.quickActions}>
      <h3>Quick Actions</h3>
      <div className={styles.actionButtons}>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => selectedPortfolio && onAnalyzePortfolio(selectedPortfolio.id)}
          disabled={!selectedPortfolio}
        >
          Analyze Portfolio
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => selectedPortfolio && onOptimizePortfolio(selectedPortfolio.id)}
          disabled={!selectedPortfolio}
        >
          Optimize Portfolio
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={() => console.log('Generate Report')}
          disabled={!selectedPortfolio}
        >
          Generate Report
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={() => console.log('Risk Analysis')}
          disabled={!selectedPortfolio}
        >
          Risk Analysis
        </Button>
      </div>
    </Card>
  );

  if (!selectedPortfolio) {
    return (
      <div className={layoutClasses}>
        <div className={styles.noPortfolioSelected}>
          {renderPortfolioSelector()}
          <Card className={styles.selectPrompt}>
            <div className={styles.selectPromptContent}>
              <h3>Select a Portfolio</h3>
              <p>Choose a portfolio from the list to view its performance and analytics.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutClasses}>
      <div className={styles.layoutGrid}>
        <div className={styles.leftColumn}>
          {renderPortfolioSelector()}
          {renderQuickActions()}
        </div>

        <div className={styles.centerColumn}>
          {renderPerformanceSection()}
          {renderMetricsGrid()}
        </div>

        <div className={styles.rightColumn}>
          {renderHoldingsTable()}

          <Card className={styles.allocationCard}>
            <h3>Asset Allocation</h3>
            <DashboardWidget
              title=""
              type="pie"
              data={[
                { name: 'Stocks', value: 65, color: '#BF9FFB' },
                { name: 'Bonds', value: 25, color: '#74F174' },
                { name: 'Cash', value: 10, color: '#90BFF9' },
              ]}
              className={styles.allocationWidget}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};