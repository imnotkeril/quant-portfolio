/**
 * MetricsTable Component
 * Displays performance and risk metrics in a formatted table
 */
import React from 'react';
import classNames from 'classnames';
import { Table, TableColumn } from '../../common/Table/Table';
import { Card } from '../../common/Card/Card';
import { formatPercentage, formatNumber, formatCurrency } from '../../../utils/formatters';
import styles from './MetricsTable.module.css';

export interface MetricItem {
  name: string;
  value: number | string;
  benchmark?: number | string;
  description?: string;
  type?: 'percentage' | 'currency' | 'number' | 'ratio';
  precision?: number;
  trend?: 'positive' | 'negative' | 'neutral';
  category?: string;
}

interface MetricsTableProps {
  metrics: MetricItem[];
  title?: string;
  showBenchmark?: boolean;
  showTrend?: boolean;
  grouped?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  'data-testid'?: string;
}

export const MetricsTable: React.FC<MetricsTableProps> = ({
  metrics,
  title = 'Metrics',
  showBenchmark = false,
  showTrend = false,
  grouped = false,
  loading = false,
  className,
  size = 'medium',
  'data-testid': testId,
}) => {
  const formatValue = (value: number | string, type: string = 'number', precision: number = 2): string => {
    if (typeof value === 'string') return value;

    switch (type) {
      case 'percentage':
        return formatPercentage(value, precision);
      case 'currency':
        return formatCurrency(value, precision.toString());
      case 'ratio':
        return formatNumber(value, precision);
      default:
        return formatNumber(value, precision);
    }
  };
  const tableSize = size === 'medium' ? 'middle' : size;
  const getTrendBadge = (trend?: string) => {
  if (!trend || !showTrend) return null;

  const trendConfig = {
    positive: { className: styles.trendPositive, text: '↗' },
    negative: { className: styles.trendNegative, text: '↘' },
    neutral: { className: styles.trendNeutral, text: '→' },
  };

  const config = trendConfig[trend as keyof typeof trendConfig];
  if (!config) return null;

  return <span className={config.className}>{config.text}</span>;
};

  const renderDifference = (value: number | string, benchmark: number | string) => {
    if (typeof value === 'string' || typeof benchmark === 'string') return null;

    const diff = value - benchmark;
    const diffPercentage = benchmark !== 0 ? (diff / benchmark) * 100 : 0;

    const isPositive = diff > 0;
    const diffClass = isPositive ? styles.positive : styles.negative;

    return (
      <span className={diffClass}>
        {isPositive ? '+' : ''}{formatPercentage(diffPercentage / 100, 1)}
      </span>
    );
  };

  const columns: TableColumn<MetricItem>[] = [
    {
      key: 'name',
      title: 'Metric',
      dataIndex: 'name',
      width: '40%',
      render: (value, record) => (
        <div className={styles.metricName}>
          <span className={styles.name}>{value}</span>
          {record.description && (
            <span className={styles.description}>{record.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'value',
      title: 'Value',
      dataIndex: 'value',
      align: 'right',
      width: showBenchmark ? '25%' : '40%',
      render: (value, record) => (
        <div className={styles.valueCell}>
          <span className={styles.value}>
            {formatValue(value, record.type, record.precision)}
          </span>
          {getTrendBadge(record.trend)}
        </div>
      ),
    },
  ];

  if (showBenchmark) {
    columns.push(
      {
        key: 'benchmark',
        title: 'Benchmark',
        dataIndex: 'benchmark',
        align: 'right',
        width: '25%',
        render: (value, record) =>
          value !== undefined ? formatValue(value, record.type, record.precision) : '-',
      },
      {
        key: 'difference',
        title: 'Diff',
        align: 'right',
        width: '15%',
        render: (_, record) =>
          record.benchmark !== undefined
            ? renderDifference(record.value, record.benchmark)
            : '-',
      }
    );
  }

  // Group metrics by category if grouped is true
  const groupedMetrics = grouped
    ? metrics.reduce((acc, metric) => {
        const category = metric.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(metric);
        return acc;
      }, {} as Record<string, MetricItem[]>)
    : { [title]: metrics };

  const tableClasses = classNames(
    styles.table,
    styles[size],
    className
  );

  if (grouped) {
    return (
      <div className={styles.groupedContainer} data-testid={testId}>
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
          <Card key={category} title={category} className={styles.categoryCard}>
            <Table
              columns={columns}
              data={categoryMetrics}
              rowKey="name"
              loading={loading}
              pagination={false}
              size={size === 'medium' ? 'middle' : size}
              className={tableClasses}
              showHeader={category === Object.keys(groupedMetrics)[0]}
            />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card title={title} className={className} data-testid={testId}>
      <Table
        columns={columns}
        data={metrics}
        rowKey="name"
        loading={loading}
        pagination={false}
        size={size === 'medium' ? 'middle' : size}
        className={tableClasses}
      />
    </Card>
  );
};

export default MetricsTable;