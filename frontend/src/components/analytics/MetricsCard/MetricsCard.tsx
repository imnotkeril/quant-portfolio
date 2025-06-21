/**
 * MetricsCard Component
 * Displays individual metric in a card format
 */
import React from 'react';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { formatPercentage, formatNumber, formatCurrency } from '../../../utils/formatters';
import styles from './MetricsCard.module.css';

export interface MetricsCardData {
  title: string;
  value: number | string;
  previousValue?: number | string;
  benchmark?: number | string;
  type?: 'percentage' | 'currency' | 'number' | 'ratio';
  precision?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  subtitle?: string;
}

interface MetricsCardProps {
  data: MetricsCardData;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  showBenchmark?: boolean;
  showChange?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  data,
  size = 'medium',
  showTrend = true,
  showBenchmark = false,
  showChange = true,
  loading = false,
  className,
  onClick,
  'data-testid': testId,
}) => {
  const {
    title,
    value,
    previousValue,
    benchmark,
    type = 'number',
    precision = 2,
    trend,
    icon,
    description,
    subtitle,
  } = data;

  const formatValue = (val: number | string): string => {
  if (typeof val === 'string') return val;

  switch (type) {
    case 'percentage':
      return formatPercentage(val / 100, precision); // Если val уже в процентах, то val
    case 'currency':
      return formatCurrency(val, precision.toString());
    case 'ratio':
      return formatNumber(val, precision);
    default:
      return formatNumber(val, precision);
  }
};

  const calculateChange = (): { change: number; changePercentage: number } | null => {
    if (typeof value === 'string' || typeof previousValue === 'string' || previousValue === undefined) {
      return null;
    }

    const change = value - previousValue;
    const changePercentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return { change, changePercentage };
  };

  const calculateBenchmarkDiff = (): { diff: number; diffPercentage: number } | null => {
    if (typeof value === 'string' || typeof benchmark === 'string' || benchmark === undefined) {
      return null;
    }

    const diff = value - benchmark;
    const diffPercentage = benchmark !== 0 ? (diff / benchmark) * 100 : 0;

    return { diff, diffPercentage };
  };

  const getTrendIcon = () => {
    if (!trend || !showTrend) return null;

    const trendConfig = {
      up: { icon: '↗', color: 'var(--color-positive)' },
      down: { icon: '↘', color: 'var(--color-negative)' },
      neutral: { icon: '→', color: 'var(--color-neutral-gray)' },
    };

    const config = trendConfig[trend];
    if (!config) return null;

    return (
      <span className={styles.trendIcon} style={{ color: config.color }}>
        {config.icon}
      </span>
    );
  };

  const change = calculateChange();
  const benchmarkDiff = calculateBenchmarkDiff();

  const cardClasses = classNames(
    styles.card,
    styles[size],
    {
      [styles.clickable]: !!onClick,
      [styles.loading]: loading,
    },
    className
  );

  return (
    <Card
      className={cardClasses}
      onClick={onClick}
      loading={loading}
      hoverable={!!onClick}
      data-testid={testId}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <div className={styles.titleWrapper}>
              <h3 className={styles.title}>{title}</h3>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {getTrendIcon()}
        </div>

        <div className={styles.valueSection}>
          <div className={styles.mainValue}>
            {formatValue(value)}
          </div>

          <div className={styles.metrics}>
            {showChange && change && (
              <div className={classNames(
                styles.change,
                {
                  [styles.positive]: change.change > 0,
                  [styles.negative]: change.change < 0,
                }
              )}>
                <span className={styles.changeIcon}>
                  {change.change > 0 ? '+' : ''}
                </span>
                <span className={styles.changeValue}>
                  {formatPercentage(change.changePercentage, 1)}
                </span>
              </div>
            )}

            {showBenchmark && benchmarkDiff && (
              <div className={styles.benchmark}>
                <span className={styles.benchmarkLabel}>vs Benchmark:</span>
                <span className={classNames(
                  styles.benchmarkValue,
                  {
                    [styles.positive]: benchmarkDiff.diff > 0,
                    [styles.negative]: benchmarkDiff.diff < 0,
                  }
                )}>
                  {benchmarkDiff.diff > 0 ? '+' : ''}{formatPercentage(benchmarkDiff.diffPercentage, 1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {description && (
          <div className={styles.description}>
            {description}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricsCard;