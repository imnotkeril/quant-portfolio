/**
 * RiskContribution Component
 * Analysis of individual asset risk contributions to portfolio
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Table } from '../../common/Table/Table';
import { PieChart } from '../../charts/PieChart/PieChart';
import { BarChart } from '../../charts/BarChart/BarChart';
import { COLORS } from '../../../constants/colors';
import { RiskContributionResponse } from '../../../types/risk';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './RiskContribution.module.css';

interface RiskContributionProps {
  data: RiskContributionResponse;
  loading?: boolean;
  error?: string;
  onRecalculate?: (method: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const RiskContribution: React.FC<RiskContributionProps> = ({
  data,
  loading = false,
  error,
  onRecalculate,
  className,
  'data-testid': testId,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'pie' | 'bar'>('table');
  const [sortBy, setSortBy] = useState<'contribution' | 'marginal' | 'percentage'>('contribution');
  const [calculationMethod, setCalculationMethod] = useState('component');

  const methodOptions = [
    { value: 'component', label: 'Component VaR' },
    { value: 'marginal', label: 'Marginal VaR' },
    { value: 'incremental', label: 'Incremental VaR' },
  ];

  const viewOptions = [
    { value: 'table', label: 'Table View' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'bar', label: 'Bar Chart' },
  ];

  const sortOptions = [
    { value: 'contribution', label: 'Risk Contribution' },
    { value: 'marginal', label: 'Marginal Contribution' },
    { value: 'percentage', label: 'Portfolio Weight' },
  ];

  // Prepare table data
  const tableData = React.useMemo(() => {
    if (!data.riskContributions) return [];

    const assets = Object.keys(data.riskContributions);
    const tableRows = assets.map(asset => ({
      asset,
      riskContribution: data.riskContributions[asset] || 0,
      marginalContribution: data.marginalContributions?.[asset] || 0,
      percentageContribution: data.percentageContributions?.[asset] || 0,
      id: asset,
    }));

    // Sort by selected criteria
    return tableRows.sort((a, b) => {
      const aValue = sortBy === 'contribution' ? a.riskContribution :
                     sortBy === 'marginal' ? a.marginalContribution :
                     a.percentageContribution;
      const bValue = sortBy === 'contribution' ? b.riskContribution :
                     sortBy === 'marginal' ? b.marginalContribution :
                     b.percentageContribution;
      return bValue - aValue; // Descending order
    });

  }, [data, sortBy]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    return tableData.map((row, index) => ({
      name: row.asset,
      value: row.riskContribution,
      contribution: row.riskContribution,
      marginal: row.marginalContribution,
      weight: row.percentageContribution,
      color: getChartColor(index),
    }));
  }, [tableData]);

  const pieChartData = chartData.map(item => ({
    name: item.name,
    value: Math.abs(item.value),
    color: item.color,
  }));

  const barChartSeries = [
    {
      key: 'value',
      name: 'Risk Contribution',
      color: COLORS.ACCENT,
    },
  ];

  // Table columns
  const columns: any[] = [
    {
      key: 'asset',
      title: 'Asset',
      dataIndex: 'asset',
      render: (value: string) => (
        <span className={styles.assetName}>{value}</span>
      ),
    },
    {
      key: 'riskContribution',
      title: 'Risk Contribution',
      dataIndex: 'riskContribution',
      render: (value: number) => (
        <span className={styles.contributionValue}>
          {formatNumber(value, 4)}
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'marginalContribution',
      title: 'Marginal Contribution',
      dataIndex: 'marginalContribution',
      render: (value: number) => (
        <span className={styles.marginalValue}>
          {formatNumber(value, 4)}
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'percentageContribution',
      title: 'Portfolio Weight',
      dataIndex: 'percentageContribution',
      render: (value: number) => (
        <span className={styles.weightValue}>
          {formatPercentage(value / 100)}
        </span>
      ),
      align: 'right',
      sortable: true,
    },
    {
      key: 'riskRatio',
      title: 'Risk/Weight Ratio',
      render: (_: any, record: any) => {
        const ratio = record.percentageContribution > 0
          ? Math.abs(record.riskContribution) / (record.percentageContribution / 100)
          : 0;
        return (
          <span className={classNames(
            styles.ratioValue,
            {
              [styles.highRisk]: ratio > 1.5,
              [styles.lowRisk]: ratio < 0.5,
            }
          )}>
            {formatNumber(ratio, 2)}
          </span>
        );
      },
      align: 'right',
    },
  ];

  return (
    <Card
      title="Risk Contribution Analysis"
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Calculation Method</label>
            <Select
              value={calculationMethod}
              onChange={(value) => {
                const method = Array.isArray(value) ? value[0]?.toString() : value.toString();
                setCalculationMethod(method);
                onRecalculate?.(method);
              }}
              options={methodOptions}
              placeholder="Select method"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>View Mode</label>
            <Select
              value={viewMode}
              onChange={(value) => {
                const mode = Array.isArray(value) ? value[0]?.toString() : value.toString();
                setViewMode(mode as typeof viewMode);
              }}
              options={viewOptions}
              placeholder="Select view"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Sort By</label>
            <Select
              value={sortBy}
              onChange={(value) => {
                const sort = Array.isArray(value) ? value[0]?.toString() : value.toString();
                setSortBy(sort as typeof sortBy);
              }}
              options={sortOptions}
              placeholder="Select sort criteria"
            />
          </div>

          <div className={styles.controlGroup}>
            <Button
              onClick={() => onRecalculate?.(calculationMethod)}
              disabled={loading}
              loading={loading}
              variant="outline"
            >
              Recalculate
            </Button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span>Error calculating risk contribution: {error}</span>
          </div>
        )}

        {!loading && !error && data.riskContributions && (
          <>
            {/* Summary Statistics */}
            <div className={styles.summarySection}>
              <h4 className={styles.sectionTitle}>Portfolio Risk Summary</h4>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Portfolio Volatility</span>
                  <span className={styles.summaryValue}>
                    {data.portfolioVolatility ? formatPercentage(data.portfolioVolatility) : 'N/A'}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Diversification Ratio</span>
                  <span className={styles.summaryValue}>
                    {data.diversificationRatio ? formatNumber(data.diversificationRatio, 2) : 'N/A'}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Number of Assets</span>
                  <span className={styles.summaryValue}>
                    {Object.keys(data.riskContributions).length}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Risk Concentration</span>
                  <span className={styles.summaryValue}>
                    {(() => {
                      const contributions = Object.values(data.riskContributions);
                      const maxContribution = Math.max(...contributions.map(Math.abs));
                      const totalRisk = contributions.reduce((sum, val) => sum + Math.abs(val), 0);
                      const concentration = totalRisk > 0 ? maxContribution / totalRisk : 0;
                      return formatPercentage(concentration);
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className={styles.visualizationSection}>
              <h4 className={styles.sectionTitle}>Risk Contribution Breakdown</h4>

              {viewMode === 'table' && (
                <div className={styles.tableContainer}>
                  <Table
                    data={tableData}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </div>
              )}

              {viewMode === 'pie' && (
                <div className={styles.chartContainer}>
                  <PieChart
                    data={pieChartData}
                    height={400}
                    showLabels={true}
                    showLegend={true}
                    showTooltip={true}
                    innerRadius={60}
                    tooltipFormatter={(value, name) => [
                      formatNumber(value, 4),
                      `${name} Risk Contribution`
                    ]}
                  />
                </div>
              )}

              {viewMode === 'bar' && (
                <div className={styles.chartContainer}>
                  <BarChart
                    data={chartData}
                    series={barChartSeries}
                    height={400}
                    layout="horizontal"
                    showGrid={true}
                    showLegend={false}
                    yAxisFormatter={(value) => value}
                    xAxisFormatter={(value) => formatNumber(value, 4)}
                    tooltipFormatter={(value, name) => [
                      formatNumber(value, 4),
                      'Risk Contribution'
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Insights and Recommendations */}
            <div className={styles.insightsSection}>
              <h4 className={styles.sectionTitle}>Risk Analysis Insights</h4>
              <div className={styles.insightsList}>
                {(() => {
                  const contributions = Object.entries(data.riskContributions);
                  const totalRisk = contributions.reduce((sum, [, val]) => sum + Math.abs(val), 0);
                  const topContributor = contributions.reduce((max, [asset, contribution]) =>
                    Math.abs(contribution) > Math.abs(max[1]) ? [asset, contribution] : max
                  );
                  const topContributorPct = totalRisk > 0 ? Math.abs(topContributor[1]) / totalRisk : 0;

                  const insights = [];

                  if (topContributorPct > 0.4) {
                    insights.push({
                      type: 'warning',
                      text: `${topContributor[0]} contributes ${formatPercentage(topContributorPct)} of total risk - consider reducing exposure`,
                    });
                  }

                  if (data.diversificationRatio && data.diversificationRatio < 0.5) {
                    insights.push({
                      type: 'warning',
                      text: `Low diversification ratio (${formatNumber(data.diversificationRatio, 2)}) indicates concentrated risk`,
                    });
                  }

                  if (data.diversificationRatio && data.diversificationRatio > 0.8) {
                    insights.push({
                      type: 'positive',
                      text: `Good diversification ratio (${formatNumber(data.diversificationRatio, 2)}) indicates well-spread risk`,
                    });
                  }

                  const negativeContributors = contributions.filter(([, val]) => val < 0);
                  if (negativeContributors.length > 0) {
                    insights.push({
                      type: 'info',
                      text: `${negativeContributors.length} asset(s) provide risk reduction benefits through negative correlation`,
                    });
                  }

                  return insights;
                })().map((insight, index) => (
                  <div
                    key={index}
                    className={classNames(
                      styles.insightItem,
                      styles[insight.type]
                    )}
                  >
                    <span className={styles.insightIcon}>
                      {insight.type === 'warning' ? '⚠️' :
                       insight.type === 'positive' ? '✅' : 'ℹ️'}
                    </span>
                    <span className={styles.insightText}>{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !error && !data.riskContributions && (
          <div className={styles.empty}>
            No risk contribution data available. Please run analysis first.
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskContribution;