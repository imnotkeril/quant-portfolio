/**
 * RiskMetricsPanel Component
 * Displays key risk metrics for a portfolio
 */
import React from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { formatPercentage, formatCurrency, formatNumber } from '../../../utils/formatters';
import styles from './RiskMetricsPanel.module.css';

interface RiskMetric {
  name: string;
  value: number | string;
  previousValue?: number | string;
  format?: 'percentage' | 'currency' | 'number' | 'ratio' | 'days';
  tooltip?: string;
  status?: 'good' | 'warning' | 'danger';
}

interface RiskMetricsPanelProps {
  metrics: RiskMetric[];
  loading?: boolean;
  error?: string;
  title?: string;
  className?: string;
  'data-testid'?: string;
}

export const RiskMetricsPanel: React.FC<RiskMetricsPanelProps> = ({
  metrics,
  loading = false,
  error,
  title = 'Risk Metrics',
  className,
  'data-testid': testId,
}) => {
  const formatValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'percentage':
        return formatPercentage(value);
      case 'currency':
        return formatCurrency(value);
      case 'ratio':
        return formatNumber(value, 2);
      case 'days':
        return `${Math.round(value)} days`;
      case 'number':
      default:
        return formatNumber(value, 2);
    }
  };

  const getChangeIndicator = (current: number | string, previous?: number | string) => {
    if (!previous || typeof current === 'string' || typeof previous === 'string') {
      return null;
    }

    const change = current - previous;
    const changePercent = (change / previous) * 100;

    if (Math.abs(changePercent) < 0.1) return null;

    return (
      <span className={classNames(
        styles.changeIndicator,
        change > 0 ? styles.increase : styles.decrease
      )}>
        {change > 0 ? '↗' : '↘'} {Math.abs(changePercent).toFixed(1)}%
      </span>
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good':
        return styles.statusGood;
      case 'warning':
        return styles.statusWarning;
      case 'danger':
        return styles.statusDanger;
      default:
        return '';
    }
  };

  return (
    <Card
      title={title}
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      {error && (
        <div className={styles.error}>
          <span>Error loading risk metrics: {error}</span>
        </div>
      )}

      {!error && (
        <div className={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <div
              key={metric.name}
              className={classNames(
                styles.metricItem,
                getStatusColor(metric.status)
              )}
              title={metric.tooltip}
            >
              <div className={styles.metricHeader}>
                <span className={styles.metricName}>{metric.name}</span>
                {getChangeIndicator(metric.value, metric.previousValue)}
              </div>

              <div className={styles.metricValue}>
                {formatValue(metric.value, metric.format)}
              </div>

              {metric.previousValue && (
                <div className={styles.metricPrevious}>
                  Previous: {formatValue(metric.previousValue, metric.format)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && metrics.length === 0 && (
        <div className={styles.empty}>
          No risk metrics available
        </div>
      )}
    </Card>
  );
};

export default RiskMetricsPanel;