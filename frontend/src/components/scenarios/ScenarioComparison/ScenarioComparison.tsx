/**
 * ScenarioComparison Component
 * Compares multiple scenarios side by side
 */
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Table, TableColumn } from '../../common/Table/Table';
import { BarChart } from '../../charts/BarChart/BarChart';
import { LineChart } from '../../charts/LineChart/LineChart';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import {
  selectCurrentPortfolioId,
  selectImpactForPortfolio,
  selectSimulationResults,
  selectSelectedScenarios
} from '../../../store/scenarios/selectors';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import { COLORS } from '../../../constants/colors';
import styles from './ScenarioComparison.module.css';

interface ScenarioComparisonProps {
  className?: string;
  scenarios?: string[];
  'data-testid'?: string;
}

type ComparisonMetric = 'impact' | 'probability' | 'recovery' | 'risk';
type ChartType = 'bar' | 'line' | 'heatmap';

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  className,
  scenarios: propScenarios,
  'data-testid': testId,
}) => {
  const currentPortfolioId = useSelector(selectCurrentPortfolioId);
  const impactResults = useSelector(selectImpactForPortfolio(currentPortfolioId || ''));
  const simulationResults = useSelector(selectSimulationResults);
  const selectedScenarios = useSelector(selectSelectedScenarios);

  const [selectedMetric, setSelectedMetric] = useState<ComparisonMetric>('impact');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showDetails, setShowDetails] = useState(false);

  // Use prop scenarios or selected scenarios
  const scenariosToCompare = propScenarios || selectedScenarios;

  // Process comparison data
  const comparisonData = useMemo(() => {
    if (!impactResults?.scenarioImpacts || scenariosToCompare.length === 0) {
      return null;
    }

    const scenarios = scenariosToCompare
      .filter(name => impactResults.scenarioImpacts[name])
      .map(name => ({
        displayName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        originalName: name,
        data: impactResults.scenarioImpacts[name],
      }));

    if (scenarios.length === 0) return null;

    // Portfolio impact comparison
    const portfolioImpactData = scenarios.map(scenario => ({
      name: scenario.displayName,
      impact: scenario.data.portfolioImpact * 100,
      color: scenario.data.portfolioImpact >= 0 ? COLORS.POSITIVE : COLORS.NEGATIVE,
    }));

    // Asset impact comparison
    const allAssets = new Set<string>();
    scenarios.forEach(scenario => {
      Object.keys(scenario.data.assetImpacts || {}).forEach(asset => allAssets.add(asset));
    });

    const assetImpactData = Array.from(allAssets).flatMap(asset =>
      scenarios.map(scenario => ({
        x: scenario.displayName,
        y: asset,
        value: scenario.data.assetImpacts?.[asset] || 0,
      }))
    );

    // Risk metrics comparison
    const riskMetricsData = scenarios.map(scenario => {
      const riskChanges = scenario.data.riskChanges || {};
      return {
        name: scenario.displayName,
        volatility: (riskChanges.volatility || 0) * 100,
        varChange: (riskChanges.var || 0) * 100,
        maxDrawdown: (riskChanges.maxDrawdown || 0) * 100,
      };
    });

    // Summary statistics
    const summary = {
      totalScenarios: scenarios.length,
      worstImpact: Math.min(...scenarios.map(s => s.data.portfolioImpact)),
      bestImpact: Math.max(...scenarios.map(s => s.data.portfolioImpact)),
      avgImpact: scenarios.reduce((sum, s) => sum + s.data.portfolioImpact, 0) / scenarios.length,
      riskiest: scenarios.reduce((worst, current) =>
        current.data.portfolioImpact < worst.data.portfolioImpact ? current : worst
      ),
      safest: scenarios.reduce((best, current) =>
        current.data.portfolioImpact > best.data.portfolioImpact ? current : best
      ),
    };

    return {
      scenarios,
      portfolioImpactData,
      assetImpactData,
      riskMetricsData,
      summary,
    };
  }, [impactResults, scenariosToCompare]);

  // Table columns for detailed comparison
  const tableColumns: TableColumn[] = [
    {
      key: 'displayName',
      title: 'Scenario',
      dataIndex: 'displayName',
      render: (value: string) => (
        <div className={styles.scenarioName}>{value}</div>
      ),
    },
    {
      key: 'portfolioImpact',
      title: 'Portfolio Impact',
      render: (_, record: any) => (
        <div className={classNames(
          styles.impactValue,
          {
            [styles.positive]: record.data.portfolioImpact >= 0,
            [styles.negative]: record.data.portfolioImpact < 0,
          }
        )}>
          {formatPercentage(record.data.portfolioImpact)}
        </div>
      ),
    },
    {
      key: 'worstAsset',
      title: 'Most Affected Asset',
      render: (_, record: any) => {
        const assetImpacts = record.data.assetImpacts || {};
        const worstAsset = Object.entries(assetImpacts)
          .reduce((worst: any, [asset, impact]: [string, any]) =>
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
      key: 'riskChanges',
      title: 'Risk Changes',
      render: (_, record: any) => {
        const riskChanges = record.data.riskChanges || {};
        const volatilityChange = riskChanges.volatility || 0;

        return (
          <div className={styles.riskChanges}>
            <div className={classNames(
              styles.riskValue,
              {
                [styles.positive]: volatilityChange <= 0,
                [styles.negative]: volatilityChange > 0,
              }
            )}>
              Vol: {formatPercentage(volatilityChange)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'recovery',
      title: 'Recovery Estimate',
      render: (_, record: any) => {
        const recovery = record.data.recoveryEstimate;
        if (!recovery) return '-';

        return (
          <div className={styles.recoveryInfo}>
            <div>{recovery.timeToRecover || 'Unknown'}</div>
            {recovery.probability && (
              <div className={styles.recoveryProbability}>
                {formatPercentage(recovery.probability)}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Get chart data based on selected metric
  const getChartData = () => {
    if (!comparisonData) return [];

    switch (selectedMetric) {
      case 'impact':
        return comparisonData.portfolioImpactData;
      case 'risk':
        return comparisonData.riskMetricsData;
      default:
        return comparisonData.portfolioImpactData;
    }
  };

  // Get chart series based on metric
  const getChartSeries = () => {
    switch (selectedMetric) {
      case 'impact':
        return [{ key: 'impact', name: 'Portfolio Impact (%)' }];
      case 'risk':
        return [
          { key: 'volatility', name: 'Volatility Change (%)', color: COLORS.NEGATIVE },
          { key: 'varChange', name: 'VaR Change (%)', color: COLORS.NEUTRAL_1 },
          { key: 'maxDrawdown', name: 'Max Drawdown Change (%)', color: COLORS.ACCENT },
        ];
      default:
        return [{ key: 'impact', name: 'Portfolio Impact (%)' }];
    }
  };

  if (!comparisonData || scenariosToCompare.length === 0) {
    return (
      <Card className={classNames(styles.container, className)} data-testid={testId}>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v5h5"/>
            <path d="M21 21v-5h-5"/>
            <path d="M21 3v5h-5"/>
            <path d="M3 21v-5h5"/>
            <path d="M9 9h6v6H9z"/>
          </svg>
          <div>
            <h3>No Scenarios to Compare</h3>
            <p>Select multiple scenarios to see a detailed comparison</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      {/* Header */}
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Scenario Comparison</h2>
            <p className={styles.subtitle}>
              Comparing {comparisonData.scenarios.length} scenarios
            </p>
          </div>

          <div className={styles.controls}>
            <div className={styles.metricSelector}>
              <label>Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as ComparisonMetric)}
                className={styles.controlSelect}
              >
                <option value="impact">Portfolio Impact</option>
                <option value="risk">Risk Changes</option>
                <option value="recovery">Recovery Time</option>
              </select>
            </div>

            <div className={styles.chartTypeSelector}>
              <label>Chart:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className={styles.controlSelect}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="heatmap">Heatmap</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className={styles.summaryCard} title="Comparison Summary">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Scenarios Compared</div>
            <div className={styles.summaryValue}>
              {comparisonData.summary.totalScenarios}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Worst Case</div>
            <div className={classNames(styles.summaryValue, styles.negative)}>
              {formatPercentage(comparisonData.summary.worstImpact)}
            </div>
            <div className={styles.summaryDetail}>
              {comparisonData.summary.riskiest.displayName}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Best Case</div>
            <div className={classNames(styles.summaryValue, styles.positive)}>
              {formatPercentage(comparisonData.summary.bestImpact)}
            </div>
            <div className={styles.summaryDetail}>
              {comparisonData.summary.safest.displayName}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Average Impact</div>
            <div className={classNames(
              styles.summaryValue,
              {
                [styles.positive]: comparisonData.summary.avgImpact >= 0,
                [styles.negative]: comparisonData.summary.avgImpact < 0,
              }
            )}>
              {formatPercentage(comparisonData.summary.avgImpact)}
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className={styles.chartCard} title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Comparison`}>
        {chartType === 'bar' && (
          <BarChart
            data={getChartData()}
            series={getChartSeries()}
            layout="horizontal"
            height={Math.max(300, comparisonData.scenarios.length * 50)}
            yAxisFormatter={(value) => `${value}%`}
            showLegend={selectedMetric === 'risk'}
            className={styles.chart}
          />
        )}

        {chartType === 'line' && (
          <LineChart
            data={getChartData().map((item, index) => ({ chartName: index.toString(), ...item }))}
            series={getChartSeries()}
            height={400}
            yAxisFormatter={(value) => `${value}%`}
            xAxisFormatter={(value) => comparisonData.scenarios[parseInt(value)]?.displayName || value}
            showLegend={selectedMetric === 'risk'}
            className={styles.chart}
          />
        )}

        {chartType === 'heatmap' && comparisonData.assetImpactData.length > 0 && (
          <HeatmapChart
            data={comparisonData.assetImpactData}
            colorScale="correlation"
            showLabels={false}
            formatter={formatPercentage}
            height={Math.max(300, comparisonData.assetImpactData.length * 25)}
            className={styles.chart}
          />
        )}
      </Card>

      {/* Detailed Comparison Table */}
      {showDetails && (
        <Card className={styles.tableCard} title="Detailed Comparison">
          <Table
            data={comparisonData.scenarios}
            columns={tableColumns}
            rowKey="originalName"
            pagination={false}
            size="middle"
            className={styles.comparisonTable}
          />
        </Card>
      )}

      {/* Asset Impact Breakdown */}
      {comparisonData.assetImpactData.length > 0 && (
        <Card className={styles.assetCard} title="Asset Impact Breakdown">
          <div className={styles.assetBreakdown}>
            {Array.from(new Set(comparisonData.assetImpactData.map(d => d.y))).map(asset => (
              <div key={asset} className={styles.assetGroup}>
                <h4 className={styles.assetTitle}>{asset}</h4>
                <div className={styles.assetScenarios}>
                  {comparisonData.scenarios.map(scenario => {
                    const impact = scenario.data.assetImpacts?.[asset] || 0;
                    return (
                      <div key={scenario.originalName} className={styles.assetScenario}>
                        <div className={styles.assetScenarioName}>{scenario.displayName}</div>
                        <div className={classNames(
                          styles.assetScenarioImpact,
                          {
                            [styles.positive]: impact >= 0,
                            [styles.negative]: impact < 0,
                          }
                        )}>
                          {formatPercentage(impact)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk Analysis */}
      <Card className={styles.riskCard} title="Risk Analysis Comparison">
        <div className={styles.riskAnalysis}>
          <div className={styles.riskMetrics}>
            {comparisonData.scenarios.map(scenario => {
              const riskChanges = scenario.data.riskChanges || {};
              return (
                <div key={scenario.originalName} className={styles.riskScenario}>
                  <div className={styles.riskScenarioName}>{scenario.displayName}</div>
                  <div className={styles.riskValues}>
                    <div className={styles.riskItem}>
                      <span className={styles.riskLabel}>Volatility:</span>
                      <span className={classNames(
                        styles.riskValue,
                        {
                          [styles.positive]: (riskChanges.volatility || 0) <= 0,
                          [styles.negative]: (riskChanges.volatility || 0) > 0,
                        }
                      )}>
                        {formatPercentage(riskChanges.volatility || 0)}
                      </span>
                    </div>
                    <div className={styles.riskItem}>
                      <span className={styles.riskLabel}>VaR:</span>
                      <span className={classNames(
                        styles.riskValue,
                        {
                          [styles.positive]: (riskChanges.var || 0) <= 0,
                          [styles.negative]: (riskChanges.var || 0) > 0,
                        }
                      )}>
                        {formatPercentage(riskChanges.var || 0)}
                      </span>
                    </div>
                    <div className={styles.riskItem}>
                      <span className={styles.riskLabel}>Max Drawdown:</span>
                      <span className={classNames(
                        styles.riskValue,
                        {
                          [styles.positive]: (riskChanges.maxDrawdown || 0) <= 0,
                          [styles.negative]: (riskChanges.maxDrawdown || 0) > 0,
                        }
                      )}>
                        {formatPercentage(riskChanges.maxDrawdown || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScenarioComparison;