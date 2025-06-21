/**
 * ReturnsChart Component
 * Specialized chart for displaying portfolio returns over time
 */
import React, { useMemo } from 'react';
import { LineChart, LineChartSeries } from '../../charts/LineChart/LineChart';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatDate } from '../../../utils/formatters';
import { ReturnsResponse, CumulativeReturnsResponse } from '../../../types/analytics';
import styles from './ReturnsChart.module.css';

interface ReturnsChartProps {
  returns?: ReturnsResponse | null;
  cumulativeReturns?: CumulativeReturnsResponse | null;
  benchmarkReturns?: ReturnsResponse | null;
  benchmarkCumulativeReturns?: CumulativeReturnsResponse | null;
  title?: string;
  showCumulative?: boolean;
  showBenchmark?: boolean;
  height?: number;
  loading?: boolean;
  onToggleCumulative?: (cumulative: boolean) => void;
  onToggleBenchmark?: (showBenchmark: boolean) => void;
  onPeriodChange?: (period: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const ReturnsChart: React.FC<ReturnsChartProps> = ({
  returns,
  cumulativeReturns,
  benchmarkReturns,
  benchmarkCumulativeReturns,
  title = 'Returns Analysis',
  showCumulative = false,
  showBenchmark = false,
  height = 400,
  loading = false,
  onToggleCumulative,
  onToggleBenchmark,
  onPeriodChange,
  className,
  'data-testid': testId,
}) => {
  const chartData = useMemo(() => {
    const dataSource = showCumulative ? cumulativeReturns : returns;
    const benchmarkDataSource = showCumulative ? benchmarkCumulativeReturns : benchmarkReturns;

    if (!dataSource) return [];

    const portfolioKey = Object.keys(
      'returns' in dataSource ? dataSource.returns : dataSource.cumulativeReturns
    )[0];

    const portfolioData = showCumulative
      ? ('cumulativeReturns' in dataSource ? dataSource.cumulativeReturns[portfolioKey] : []) || []
      : ('returns' in dataSource ? dataSource.returns[portfolioKey] : []) || [];

    let benchmarkData: number[] = [];
    if (showBenchmark && benchmarkDataSource) {
      const benchmarkKey = Object.keys(
        'returns' in benchmarkDataSource ? benchmarkDataSource.returns : benchmarkDataSource.cumulativeReturns
      )[0];

      benchmarkData = showCumulative
        ? ('cumulativeReturns' in benchmarkDataSource ? benchmarkDataSource.cumulativeReturns[benchmarkKey] : []) || []
        : ('returns' in benchmarkDataSource ? benchmarkDataSource.returns[benchmarkKey] : []) || [];
    }

    return dataSource.dates.map((date, index) => ({
      name: date,
      date,
      portfolio: portfolioData[index] || 0,
      ...(showBenchmark && benchmarkData.length > index && {
        benchmark: benchmarkData[index] || 0
      }),
    }));
  }, [returns, cumulativeReturns, benchmarkReturns, benchmarkCumulativeReturns, showCumulative, showBenchmark]);

  const chartSeries = useMemo((): LineChartSeries[] => {
    const series: LineChartSeries[] = [
      {
        key: 'portfolio',
        name: 'Portfolio',
        color: COLORS.ACCENT,
        strokeWidth: 2,
        type: 'monotone',
      },
    ];

    if (showBenchmark) {
      series.push({
        key: 'benchmark',
        name: 'Benchmark',
        color: COLORS.NEUTRAL_1,
        strokeWidth: 2,
        type: 'monotone',
        strokeDasharray: '5,5',
      });
    }

    return series;
  }, [showBenchmark]);

  const formatTooltip = (value: any, name: string): [string, string] => {
    const formattedValue = showCumulative
      ? formatPercentage(value, 2)
      : formatPercentage(value, 3);
    return [formattedValue, name];
  };

  const yAxisFormatter = (value: number) => {
    return showCumulative
      ? formatPercentage(value, 0)
      : formatPercentage(value, 1);
  };

  const xAxisFormatter = (value: string) => {
    return formatDate(value, 'short');
  };

  const getCurrentValue = () => {
    if (!chartData.length) return null;
    const lastData = chartData[chartData.length - 1];
    return {
      portfolio: lastData.portfolio,
      benchmark: lastData.benchmark,
    };
  };

  const currentValue = getCurrentValue();

  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <Card
      title={title}
      className={className}
      extra={
        <div className={styles.controls}>
          {onPeriodChange && (
            <Select
              value={returns?.period || 'daily'}
              onChange={(value) => {
              const period = Array.isArray(value) ? value[0] : value;
              onPeriodChange?.(String(period));
            }}
              options={periodOptions}
              size="small"
              className={styles.periodSelect}
            />
          )}

          {onToggleCumulative && (
            <Button
              variant={showCumulative ? 'primary' : 'outline'}
              size="small"
              onClick={() => onToggleCumulative(!showCumulative)}
            >
              Cumulative
            </Button>
          )}

          {onToggleBenchmark && (
            <Button
              variant={showBenchmark ? 'primary' : 'outline'}
              size="small"
              onClick={() => onToggleBenchmark(!showBenchmark)}
            >
              Benchmark
            </Button>
          )}
        </div>
      }
      data-testid={testId}
    >
      <div className={styles.content}>
        {currentValue && (
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Portfolio:</span>
              <span className={styles.summaryValue}>
                {showCumulative
                  ? formatPercentage(currentValue.portfolio, 2)
                  : formatPercentage(currentValue.portfolio, 3)
                }
              </span>
            </div>

            {showBenchmark && currentValue.benchmark !== undefined && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Benchmark:</span>
                <span className={styles.summaryValue}>
                  {showCumulative
                    ? formatPercentage(currentValue.benchmark, 2)
                    : formatPercentage(currentValue.benchmark, 3)
                  }
                </span>
              </div>
            )}

            {showBenchmark && currentValue.benchmark !== undefined && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Difference:</span>
                <span className={styles.summaryValue}>
                  {(() => {
                    const diff = currentValue.portfolio - currentValue.benchmark;
                    return (
                      <span className={diff >= 0 ? styles.positive : styles.negative}>
                        {diff >= 0 ? '+' : ''}{formatPercentage(diff, 2)}
                      </span>
                    );
                  })()}
                </span>
              </div>
            )}
          </div>
        )}

        <LineChart
          data={chartData}
          series={chartSeries}
          xAxisFormatter={xAxisFormatter}
          yAxisFormatter={yAxisFormatter}
          tooltipFormatter={formatTooltip}
          height={height}
          loading={loading}
          showGrid={true}
          showLegend={true}
          empty={!chartData.length}
          emptyText={showCumulative ? 'No cumulative returns data available' : 'No returns data available'}
        />
      </div>
    </Card>
  );
};

export default ReturnsChart;