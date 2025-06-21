/**
 * RollingMetrics Component
 * Displays rolling performance metrics over time
 */
import React, { useMemo, useState } from 'react';
import { LineChart, LineChartSeries } from '../../charts/LineChart/LineChart';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import Input from '../../common/Input/Input';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatNumber, formatDate } from '../../../utils/formatters';
import { RollingMetricsResponse } from '../../../types/analytics';
import styles from './RollingMetrics.module.css';

interface RollingMetricsProps {
  data?: RollingMetricsResponse | null;
  loading?: boolean;
  title?: string;
  height?: number;
  onWindowChange?: (window: number) => void;
  onMetricsChange?: (metrics: string[]) => void;
  onRefresh?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  type: 'percentage' | 'ratio' | 'number';
  description: string;
}

const AVAILABLE_METRICS: MetricConfig[] = [
  {
    key: 'return',
    label: 'Rolling Return',
    color: COLORS.ACCENT,
    type: 'percentage',
    description: 'Rolling period returns',
  },
  {
    key: 'volatility',
    label: 'Rolling Volatility',
    color: COLORS.NEGATIVE,
    type: 'percentage',
    description: 'Rolling standard deviation of returns',
  },
  {
    key: 'sharpe',
    label: 'Rolling Sharpe Ratio',
    color: COLORS.POSITIVE,
    type: 'ratio',
    description: 'Rolling risk-adjusted return',
  },
  {
    key: 'sortino',
    label: 'Rolling Sortino Ratio',
    color: COLORS.NEUTRAL_1,
    type: 'ratio',
    description: 'Rolling downside risk-adjusted return',
  },
  {
    key: 'maxDrawdown',
    label: 'Rolling Max Drawdown',
    color: COLORS.NEUTRAL_2,
    type: 'percentage',
    description: 'Rolling maximum drawdown',
  },
];

const WINDOW_OPTIONS = [
  { value: 21, label: '21 Days (1 Month)' },
  { value: 63, label: '63 Days (3 Months)' },
  { value: 126, label: '126 Days (6 Months)' },
  { value: 252, label: '252 Days (1 Year)' },
  { value: 504, label: '504 Days (2 Years)' },
];

export const RollingMetrics: React.FC<RollingMetricsProps> = ({
  data,
  loading = false,
  title = 'Rolling Metrics Analysis',
  height = 400,
  onWindowChange,
  onMetricsChange,
  onRefresh,
  className,
  'data-testid': testId,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['return', 'volatility', 'sharpe']);
  const [rollingWindow, setRollingWindow] = useState(63);
  const [customWindow, setCustomWindow] = useState('');
  const [showCustomWindow, setShowCustomWindow] = useState(false);

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data || !data.rollingMetrics) return [];

    const portfolioKey = Object.keys(data.rollingMetrics)[0];
    const portfolioMetrics = data.rollingMetrics[portfolioKey];

    if (!portfolioMetrics) return [];

    return data.dates.map((date, index) => {
      const dataPoint: any = { name: date, date };

      selectedMetrics.forEach(metricKey => {
        const metricData = portfolioMetrics[metricKey];
        if (metricData && metricData[index] !== undefined) {
          dataPoint[metricKey] = metricData[index];
        }
      });

      return dataPoint;
    });
  }, [data, selectedMetrics]);

  // Create chart series
  const chartSeries = useMemo((): LineChartSeries[] => {
    return selectedMetrics.map(metricKey => {
      const config = AVAILABLE_METRICS.find(m => m.key === metricKey);
      if (!config) return null;

      return {
        key: metricKey,
        name: config.label,
        color: config.color,
        strokeWidth: 2,
        type: 'monotone',
      };
    }).filter(Boolean) as LineChartSeries[];
  }, [selectedMetrics]);

  const handleMetricToggle = (metricKey: string) => {
    const newMetrics = selectedMetrics.includes(metricKey)
      ? selectedMetrics.filter(m => m !== metricKey)
      : [...selectedMetrics, metricKey];

    setSelectedMetrics(newMetrics);
    onMetricsChange?.(newMetrics);
  };

  const handleWindowChange = (window: number) => {
    setRollingWindow(window);
    onWindowChange?.(window);
  };

  const handleCustomWindowSubmit = () => {
    const window = parseInt(customWindow);
    if (window >= 5 && window <= 1000) {
      handleWindowChange(window);
      setShowCustomWindow(false);
      setCustomWindow('');
    }
  };

  const formatTooltip = (value: any, name: string): [string, string] => {
    const config = AVAILABLE_METRICS.find(m => m.label === name);
    if (!config) return [String(value), name];

    switch (config.type) {
      case 'percentage':
        return [formatPercentage(value, 2), name];
      case 'ratio':
        return [formatNumber(value, 2), name];
      default:
        return [formatNumber(value, 2), name];
    }
  };

  const yAxisFormatter = (value: number) => {
    // Use the primary metric type for Y-axis formatting
    const primaryMetric = AVAILABLE_METRICS.find(m => m.key === selectedMetrics[0]);
    if (!primaryMetric) return formatNumber(value, 1);

    switch (primaryMetric.type) {
      case 'percentage':
        return formatPercentage(value, 0);
      case 'ratio':
        return formatNumber(value, 1);
      default:
        return formatNumber(value, 1);
    }
  };

  const xAxisFormatter = (value: string) => {
    return formatDate(value, 'short');
  };

  const getCurrentValues = () => {
    if (!chartData.length) return null;
    const lastData = chartData[chartData.length - 1];

    return selectedMetrics.map(metricKey => {
      const config = AVAILABLE_METRICS.find(m => m.key === metricKey);
      const value = lastData[metricKey];

      return {
        key: metricKey,
        label: config?.label || metricKey,
        value,
        type: config?.type || 'number',
        color: config?.color || COLORS.NEUTRAL_GRAY,
      };
    });
  };

  const currentValues = getCurrentValues();

  return (
    <Card
      title={title}
      className={className}
      extra={
        <div className={styles.controls}>
          {onRefresh && (
            <Button variant="outline" size="small" onClick={onRefresh}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
              </svg>
              Refresh
            </Button>
          )}
        </div>
      }
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controlsSection}>
          <div className={styles.windowControl}>
            <label className={styles.controlLabel}>Rolling Window:</label>
            <Select
              value={rollingWindow}
              onChange={(value) => {
                const window = Array.isArray(value) ? value[0] : value;
                handleWindowChange(Number(window));
              }}
              options={WINDOW_OPTIONS.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
              size="small"
              className={styles.windowSelect}
            />
            <Button
              variant="text"
              size="small"
              onClick={() => setShowCustomWindow(!showCustomWindow)}
            >
              Custom
            </Button>
          </div>

          {showCustomWindow && (
            <div className={styles.customWindowInput}>
              <Input
                type="number"
                placeholder="Enter days (5-1000)"
                value={customWindow}
                onChange={(e) => setCustomWindow(e.target.value)}
                min={5}
                max={1000}
                size="small"
              />
              <Button
                variant="primary"
                size="small"
                onClick={handleCustomWindowSubmit}
                disabled={!customWindow || parseInt(customWindow) < 5 || parseInt(customWindow) > 1000}
              >
                Apply
              </Button>
            </div>
          )}

          <div className={styles.metricsControl}>
            <label className={styles.controlLabel}>Metrics:</label>
            <div className={styles.metricButtons}>
              {AVAILABLE_METRICS.map(metric => (
                <Button
                  key={metric.key}
                  variant={selectedMetrics.includes(metric.key) ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => handleMetricToggle(metric.key)}
                  aria-label={metric.description}
                  className={styles.metricButton}
                >
                  {metric.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Values Summary */}
        {currentValues && currentValues.length > 0 && (
          <div className={styles.summary}>
            {currentValues.map(item => (
              <div key={item.key} className={styles.summaryItem}>
                <div className={styles.summaryLabel} style={{ color: item.color }}>
                  {item.label}
                </div>
                <div className={styles.summaryValue}>
                  {item.value !== undefined ? (
                    item.type === 'percentage'
                      ? formatPercentage(item.value, 2)
                      : formatNumber(item.value, 2)
                  ) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
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
          emptyText="No rolling metrics data available"
        />

        {/* Metrics Legend */}
        {selectedMetrics.length > 0 && (
          <div className={styles.legend}>
            <h4 className={styles.legendTitle}>Selected Metrics:</h4>
            <div className={styles.legendItems}>
              {selectedMetrics.map(metricKey => {
                const config = AVAILABLE_METRICS.find(m => m.key === metricKey);
                if (!config) return null;

                return (
                  <div key={config.key} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: config.color }}
                    />
                    <div className={styles.legendInfo}>
                      <span className={styles.legendLabel}>{config.label}</span>
                      <span className={styles.legendDescription}>{config.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RollingMetrics;