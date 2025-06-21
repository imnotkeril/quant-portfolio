/**
 * ScenarioImpact Component
 * Displays the impact analysis results for selected scenarios
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { Table, TableColumn } from '../../common/Table/Table';
import { BarChart } from '../../charts/BarChart/BarChart';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import { Loader } from '../../common/Loader/Loader';
import {
  selectCurrentPortfolioId,
  selectImpactForPortfolio,
  selectImpactAnalysisLoading,
  selectImpactError
} from '../../../store/scenarios/selectors';
import { ScenarioImpact as ScenarioImpactType } from '../../../types/scenarios';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import styles from './ScenarioImpact.module.css';

interface ScenarioImpactProps {
  className?: string;
  showDetails?: boolean;
  'data-testid'?: string;
}

export const ScenarioImpact: React.FC<ScenarioImpactProps> = ({
  className,
  showDetails = true,
  'data-testid': testId,
}) => {
  const currentPortfolioId = useSelector(selectCurrentPortfolioId);
  const impactResults = useSelector(selectImpactForPortfolio(currentPortfolioId || ''));
  const loading = useSelector(selectImpactAnalysisLoading);
  const error = useSelector(selectImpactError);

  // Process impact data for visualization
  const impactData = useMemo(() => {
    if (!impactResults?.scenarioImpacts) return null;

    const scenarios = Object.entries(impactResults.scenarioImpacts);

    // Chart data for portfolio impact
    const chartData = scenarios.map(([name, impact]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      portfolioImpact: impact.portfolioImpact * 100, // Convert to percentage
      color: impact.portfolioImpact >= 0 ? '#74F174' : '#FAA1A4'
    }));

    // Heatmap data for asset impacts
    const heatmapData = scenarios.flatMap(([scenarioName, impact]) =>
      Object.entries(impact.assetImpacts || {}).map(([assetName, assetImpact]) => ({
        x: assetName,
        y: scenarioName.replace(/_/g, ' '),
        value: assetImpact
      }))
    );

    // Top vulnerabilities
    const vulnerabilities = scenarios
      .filter(([, impact]) => impact.portfolioImpact < -0.05) // More than 5% negative impact
      .sort(([, a], [, b]) => a.portfolioImpact - b.portfolioImpact)
      .slice(0, 5);

    return {
      chartData,
      heatmapData,
      vulnerabilities,
      scenarios: scenarios.map(([name, impact]) => ({ name, ...impact })),
    };
  }, [impactResults]);

  // Table columns for scenario details
  const tableColumns: TableColumn<ScenarioImpactType & { name: string }>[] = [
    {
      key: 'name',
      title: 'Scenario',
      dataIndex: 'name',
      render: (value: string) => (
        <div className={styles.scenarioName}>
          {value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      ),
    },
    {
      key: 'portfolioImpact',
      title: 'Portfolio Impact',
      dataIndex: 'portfolioImpact',
      align: 'right',
      render: (value: number) => (
        <div className={classNames(
          styles.impactValue,
          {
            [styles.positive]: value >= 0,
            [styles.negative]: value < 0,
          }
        )}>
          {formatPercentage(value)}
        </div>
      ),
    },
    {
      key: 'worstAsset',
      title: 'Most Affected Asset',
      render: (_, record: ScenarioImpactType & { name: string }) => {
        if (!record.assetImpacts) return '-';

        const worstAsset = Object.entries(record.assetImpacts)
          .reduce((worst, [asset, impact]) =>
            impact < worst.impact ? { asset, impact } : worst,
            { asset: '', impact: 0 }
          );

        return worstAsset.asset ? (
          <div>
            <div className={styles.assetName}>{worstAsset.asset}</div>
            <div className={styles.assetImpact}>
              {formatPercentage(worstAsset.impact)}
            </div>
          </div>
        ) : '-';
      },
    },
    {
      key: 'recovery',
      title: 'Recovery Est.',
      render: (_, record: ScenarioImpactType & { name: string }) => {
        const recovery = record.recoveryEstimate;
        if (!recovery) return '-';

        return (
          <div className={styles.recoveryInfo}>
            <div>{recovery.timeToRecover || 'Unknown'}</div>
            <div className={styles.recoveryProbability}>
              {recovery.probability ? formatPercentage(recovery.probability) : ''}
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Card className={classNames(styles.container, className)} data-testid={testId}>
        <div className={styles.loading}>
          <Loader type="spinner" size="large" text="Analyzing scenario impacts..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={classNames(styles.container, className)} data-testid={testId}>
        <div className={styles.error}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <div>
            <h3>Analysis Failed</h3>
            <p>{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!impactData || !currentPortfolioId) {
    return (
      <Card className={classNames(styles.container, className)} data-testid={testId}>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M8 17l4 4 4-4m-4-5v9"/>
            <path d="M3 4h6l4 4 4-4h6"/>
          </svg>
          <div>
            <h3>No Impact Analysis</h3>
            <p>Select scenarios and run impact analysis to see results</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      {/* Summary Section */}
      <Card className={styles.summaryCard} title="Impact Summary">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Scenarios Analyzed</div>
            <div className={styles.summaryValue}>
              {impactData.scenarios.length}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Worst Case Impact</div>
            <div className={classNames(styles.summaryValue, styles.negative)}>
              {formatPercentage(Math.min(...impactData.scenarios.map(s => s.portfolioImpact)))}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Best Case Impact</div>
            <div className={classNames(styles.summaryValue, styles.positive)}>
              {formatPercentage(Math.max(...impactData.scenarios.map(s => s.portfolioImpact)))}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>High Risk Scenarios</div>
            <div className={styles.summaryValue}>
              {impactData.vulnerabilities.length}
            </div>
          </div>
        </div>

        {/* Vulnerabilities */}
        {impactData.vulnerabilities.length > 0 && (
          <div className={styles.vulnerabilities}>
            <h4>Key Vulnerabilities</h4>
            <div className={styles.vulnerabilityList}>
              {impactData.vulnerabilities.map(([name, impact]) => (
                <div key={name} className={styles.vulnerabilityItem}>
                  <div className={styles.vulnerabilityName}>
                    {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className={styles.vulnerabilityImpact}>
                    {formatPercentage(impact.portfolioImpact)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {impactResults?.recommendedActions && impactResults.recommendedActions.length > 0 && (
          <div className={styles.recommendations}>
            <h4>Recommended Actions</h4>
            <ul className={styles.recommendationsList}>
              {impactResults.recommendedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Portfolio Impact Chart */}
      <Card className={styles.chartCard} title="Portfolio Impact by Scenario">
        <BarChart
          data={impactData.chartData}
          series={[{
            key: 'portfolioImpact',
            name: 'Portfolio Impact (%)',
          }]}
          layout="horizontal"
          height={Math.max(300, impactData.chartData.length * 40)}
          yAxisFormatter={(value) => `${value}%`}
          showLegend={false}
          className={styles.impactChart}
        />
      </Card>

      {/* Asset Impact Heatmap */}
      {impactData.heatmapData.length > 0 && (
        <Card className={styles.chartCard} title="Asset Impact Heatmap">
          <HeatmapChart
            data={impactData.heatmapData}
            colorScale="correlation"
            showLabels={false}
            formatter={formatPercentage}
            height={Math.max(300, impactData.heatmapData.length * 25)}
            className={styles.heatmap}
          />
        </Card>
      )}

      {/* Detailed Table */}
      {showDetails && (
        <Card className={styles.tableCard} title="Detailed Impact Analysis">
          <Table
            data={impactData.scenarios}
            columns={tableColumns}
            rowKey="name"
            pagination={false}
            size="middle"
            className={styles.impactTable}
          />
        </Card>
      )}
    </div>
  );
};

export default ScenarioImpact;