/**
 * DrawdownChart Component
 * Visualizes portfolio drawdowns over time
 */
import React from 'react';
import classNames from 'classnames';
import { LineChart } from '../../charts/LineChart/LineChart';
import { ChartContainer } from '../../charts/ChartContainer/ChartContainer';
import { COLORS } from '../../../constants/colors';
import { DrawdownResponse, DrawdownPeriod } from '../../../types/risk';
import { formatPercentage, formatDate } from '../../../utils/formatters';
import styles from './DrawdownChart.module.css';

interface DrawdownChartProps {
  data: DrawdownResponse;
  height?: number;
  showPeriods?: boolean;
  showUnderwaterChart?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
  onExportPNG?: () => void;
  onExportSVG?: () => void;
  onExportData?: () => void;
  'data-testid'?: string;
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({
  data,
  height = 400,
  showPeriods = true,
  showUnderwaterChart = true,
  loading = false,
  error,
  className,
  onExportPNG,
  onExportSVG,
  onExportData,
  'data-testid': testId,
}) => {
  // Transform underwater series data for chart
  const chartData = React.useMemo(() => {
    if (!data.underwaterSeries) return [];

    return Object.entries(data.underwaterSeries).map(([date, value]) => ({
      name: date,
      date,
      drawdown: value,
    }));
  }, [data.underwaterSeries]);

  const series = [
    {
      key: 'drawdown',
      name: 'Drawdown',
      color: COLORS.NEGATIVE,
      type: 'monotone' as const,
      strokeWidth: 2,
    },
  ];

  const yAxisFormatter = (value: number) => formatPercentage(value);
  const xAxisFormatter = (value: string) => formatDate(value, 'short');
  const tooltipFormatter = (value: number, name: string) => [
    formatPercentage(value),
    'Drawdown'
  ] as [string, string];

  // Sort periods by depth for display
  const sortedPeriods = React.useMemo(() => {
    if (!data.drawdownPeriods) return [];
    return [...data.drawdownPeriods].sort((a, b) => a.depth - b.depth);
  }, [data.drawdownPeriods]);

  const renderPeriodRow = (period: DrawdownPeriod, index: number) => (
    <tr key={index} className={styles.periodRow}>
      <td className={styles.periodCell}>
        {formatDate(period.startDate)}
      </td>
      <td className={styles.periodCell}>
        {formatDate(period.valleyDate)}
      </td>
      <td className={styles.periodCell}>
        {period.recoveryDate ? formatDate(period.recoveryDate) : 'Ongoing'}
      </td>
      <td className={classNames(styles.periodCell, styles.depthCell)}>
        {formatPercentage(period.depth)}
      </td>
      <td className={styles.periodCell}>
        {period.length} days
      </td>
      <td className={styles.periodCell}>
        {period.recovery ? `${period.recovery} days` : 'N/A'}
      </td>
    </tr>
  );

  const exportOptions = {
    onExportPNG,
    onExportSVG,
    onExportData,
  };

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      <ChartContainer
        title="Portfolio Drawdowns"
        subtitle="Underwater equity curve and drawdown periods"
        loading={loading}
        error={error}
        height={height}
        exportOptions={exportOptions}
        fullscreenEnabled
      >
        {showUnderwaterChart && !loading && !error && (
          <div className={styles.chartSection}>
            <LineChart
              data={chartData}
              series={series}
              height={height - 100}
              yAxisFormatter={yAxisFormatter}
              xAxisFormatter={xAxisFormatter}
              tooltipFormatter={tooltipFormatter}
              yAxisDomain={['dataMin', 0]}
              showGrid
              showLegend={false}
            />
          </div>
        )}

        {!loading && !error && (
          <div className={styles.summarySection}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Max Drawdown</span>
                <span className={styles.summaryValue}>
                  {data.maxDrawdown ? formatPercentage(data.maxDrawdown) : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Avg Drawdown</span>
                <span className={styles.summaryValue}>
                  {data.avgDrawdown ? formatPercentage(data.avgDrawdown) : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Avg Recovery Time</span>
                <span className={styles.summaryValue}>
                  {data.avgRecoveryTime ? `${Math.round(data.avgRecoveryTime)} days` : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pain Index</span>
                <span className={styles.summaryValue}>
                  {data.painIndex ? formatPercentage(data.painIndex) : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Ulcer Index</span>
                <span className={styles.summaryValue}>
                  {data.ulcerIndex ? formatPercentage(data.ulcerIndex) : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pain Ratio</span>
                <span className={styles.summaryValue}>
                  {data.painRatio ? data.painRatio.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {showPeriods && !loading && !error && sortedPeriods.length > 0 && (
          <div className={styles.periodsSection}>
            <h4 className={styles.periodsTitle}>Drawdown Periods</h4>
            <div className={styles.tableWrapper}>
              <table className={styles.periodsTable}>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>Valley Date</th>
                    <th>Recovery Date</th>
                    <th>Depth</th>
                    <th>Length</th>
                    <th>Recovery Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPeriods.map(renderPeriodRow)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ChartContainer>
    </div>
  );
};

export default DrawdownChart;