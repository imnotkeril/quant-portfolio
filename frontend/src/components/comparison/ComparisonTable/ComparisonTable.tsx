/**
 * ComparisonTable Component
 * Table for displaying comparison metrics between portfolios
 */
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Table, TableColumn } from '../../common/Table/Table';
import { Button } from '../../common/Button/Button';
import { ComparisonDisplayMode } from '../../../store/comparison/types';
import { formatCurrency, formatPercentage, formatNumber } from '../../../utils/formatters';
import styles from './ComparisonTable.module.css';

interface ComparisonTableProps {
  data: Record<string, Record<string, number>>;
  displayMode?: ComparisonDisplayMode;
  portfolios?: string[];
  metrics?: string[];
  showDifferences?: boolean;
  compact?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface TableRowData {
  metric: string;
  [key: string]: string | number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  data,
  displayMode = 'absolute',
  portfolios,
  metrics,
  showDifferences = true,
  compact = false,
  sortable = true,
  exportable = false,
  className,
  'data-testid': testId,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Extract portfolios and metrics from data if not provided
  const availablePortfolios = portfolios || Object.keys(data);
  const availableMetrics = metrics || (Object.keys(data).length > 0 ? Object.keys(Object.values(data)[0]) : []);

  // Transform data for table display
  const tableData = useMemo((): TableRowData[] => {
    return availableMetrics.map(metric => {
      const row: TableRowData = { metric };

      availablePortfolios.forEach(portfolio => {
        const value = data[portfolio]?.[metric];
        if (value !== undefined) {
          row[portfolio] = value;
        }
      });

      // Calculate differences if requested
      if (showDifferences && availablePortfolios.length === 2) {
        const [portfolio1, portfolio2] = availablePortfolios;
        const value1 = data[portfolio1]?.[metric];
        const value2 = data[portfolio2]?.[metric];

        if (value1 !== undefined && value2 !== undefined) {
          switch (displayMode) {
            case 'relative':
              row.difference = value1 !== 0 ? ((value2 - value1) / Math.abs(value1)) * 100 : 0;
              break;
            case 'percentage':
              row.difference = value2 - value1;
              break;
            case 'normalized':
              const max = Math.max(Math.abs(value1), Math.abs(value2));
              row.difference = max !== 0 ? ((value2 - value1) / max) * 100 : 0;
              break;
            default:
              row.difference = value2 - value1;
          }
        }
      }

      return row;
    });
  }, [data, availablePortfolios, availableMetrics, showDifferences, displayMode]);

  // Sort data if sort configuration is set
  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      return 0;
    });
  }, [tableData, sortConfig]);

  // Format value based on metric type and display mode
  const formatValue = (value: number | string, metricName: string, isOriginalValue: boolean = true): string => {
    if (typeof value === 'string') return value;

    // Determine formatting based on metric type
    const isPercentageMetric = metricName.toLowerCase().includes('return') ||
                              metricName.toLowerCase().includes('ratio') ||
                              metricName.toLowerCase().includes('volatility') ||
                              metricName.toLowerCase().includes('drawdown');

    const isCurrencyMetric = metricName.toLowerCase().includes('value') ||
                            metricName.toLowerCase().includes('amount') ||
                            metricName.toLowerCase().includes('cost');

    // Apply display mode transformations
    let displayValue = value;

    if (!isOriginalValue && displayMode === 'percentage') {
      // Already calculated as percentage difference
      displayValue = value;
    } else if (!isOriginalValue && displayMode === 'relative') {
      // Already calculated as relative percentage
      displayValue = value;
    } else if (displayMode === 'normalized' && isOriginalValue) {
      // Normalize to 0-100 scale (simplified)
      displayValue = Math.abs(value) > 1 ? value / 100 : value * 100;
    }

    // Format based on metric type
    if (isCurrencyMetric && isOriginalValue) {
      return formatCurrency(displayValue);
    } else if (isPercentageMetric || !isOriginalValue) {
      return formatPercentage(displayValue / 100);
    } else {
      return formatNumber(displayValue, 2);
    }
  };

  // Get cell styling based on value
  const getCellStyle = (value: number | string, metricName: string): string => {
    if (typeof value !== 'number') return '';

    // For difference columns, use positive/negative styling
    if (metricName === 'difference') {
      return value > 0 ? styles.positive : value < 0 ? styles.negative : '';
    }

    // For certain metrics, higher is better
    const higherIsBetter = ['return', 'ratio', 'alpha'].some(term =>
      metricName.toLowerCase().includes(term)
    );

    // For certain metrics, lower is better
    const lowerIsBetter = ['volatility', 'drawdown', 'risk', 'expense'].some(term =>
      metricName.toLowerCase().includes(term)
    );

    if (higherIsBetter && value > 0) return styles.positive;
    if (lowerIsBetter && value < 0) return styles.positive;
    if (higherIsBetter && value < 0) return styles.negative;
    if (lowerIsBetter && value > 0) return styles.negative;

    return '';
  };

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle export
  const handleExport = () => {
    if (!exportable) return;

    const csvContent = [
      // Header
      ['Metric', ...availablePortfolios, ...(showDifferences && availablePortfolios.length === 2 ? ['Difference'] : [])].join(','),
      // Data rows
      ...sortedData.map(row => [
        row.metric,
        ...availablePortfolios.map(portfolio => row[portfolio] || ''),
        ...(showDifferences && availablePortfolios.length === 2 ? [row.difference || ''] : [])
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_comparison_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Define table columns
  const columns: TableColumn<TableRowData>[] = [
    {
      key: 'metric',
      title: 'Metric',
      dataIndex: 'metric',
      width: compact ? 120 : 150,
      className: styles.metricColumn,
      render: (value: string) => value,
    },
    ...availablePortfolios.map((portfolio, index) => ({
      key: portfolio,
      title: `Portfolio ${index + 1}`,
      dataIndex: portfolio as keyof TableRowData,
      width: compact ? 100 : 120,
      align: 'right' as const,
      render: (value: number | string, record: TableRowData) =>
        formatValue(value, record.metric, true),
    })),
  ];

  // Add difference column if applicable
  if (showDifferences && availablePortfolios.length === 2) {
    columns.push({
      key: 'difference',
      title: 'Difference',
      dataIndex: 'difference',
      width: compact ? 100 : 120,
      align: 'right',
      render: (value: number | string, record: TableRowData) =>
        formatValue(value, 'difference', false),
    });
  }

  const containerClasses = classNames(
    styles.container,
    {
      [styles.compact]: compact,
    },
    className
  );

  if (!sortedData.length) {
    return (
      <div className={containerClasses} data-testid={testId}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <p>No comparison data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={testId}>
      {exportable && (
        <div className={styles.tableActions}>
          <Button
            variant="outline"
            size="small"
            onClick={handleExport}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            }
          >
            Export CSV
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        data={sortedData}
        rowKey="metric"
        size={compact ? 'small' : 'middle'}
        bordered
        showHeader
        scroll={{ x: true }}
        onSort={sortable ? handleSort : undefined}
        sortState={sortConfig ? { key: sortConfig.key, direction: sortConfig.direction } : undefined}
      />

      {displayMode !== 'absolute' && (
        <div className={styles.displayModeNote}>
          <span className={styles.noteIcon}>ℹ️</span>
          <span className={styles.noteText}>
            Values displayed in {displayMode} mode
            {displayMode === 'relative' && ' (percentage change from first portfolio)'}
            {displayMode === 'percentage' && ' (absolute difference)'}
            {displayMode === 'normalized' && ' (normalized scale)'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;