/**
 * AssetTable Component
 * Table for displaying portfolio assets with actions
 */
import React from 'react';
import classNames from 'classnames';
import { Table, TableColumn } from '../../common/Table';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Asset, AssetCreate } from '../../../types/portfolio';
import { formatCurrency, formatPercentage, formatDate } from '../../../utils/formatters';
import styles from './AssetTable.module.css';

interface AssetTableProps {
  assets: Asset[] | AssetCreate[];
  loading?: boolean;
  onEdit?: (asset: Asset | AssetCreate) => void;
  onDelete?: (ticker: string) => void;
  onRowClick?: (asset: Asset | AssetCreate) => void;
  showPerformance?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  loading = false,
  onEdit,
  onDelete,
  onRowClick,
  showPerformance = false,
  className,
  'data-testid': testId,
}) => {
  const hasPerformanceData = showPerformance && assets.some((asset): asset is Asset =>
    'profitLoss' in asset && asset.profitLoss !== undefined
  );

  const columns: TableColumn<Asset | AssetCreate>[] = [
    {
      key: 'ticker',
      title: 'Symbol',
      dataIndex: 'ticker',
      width: 100,
      render: (value: string, record) => (
        <div className={styles.tickerCell}>
          <span className={styles.ticker}>{value}</span>
          {record.name && (
            <span className={styles.assetName}>{record.name}</span>
          )}
        </div>
      ),
    },
    {
      key: 'weight',
      title: 'Weight',
      dataIndex: 'weight',
      width: 80,
      align: 'right',
      render: (value: number) => (
        value ? formatPercentage(value / 100) : '-'
      ),
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      align: 'right',
      render: (value: number) => (
        value ? value.toLocaleString() : '-'
      ),
    },
    {
      key: 'currentPrice',
      title: 'Price',
      dataIndex: 'currentPrice',
      width: 100,
      align: 'right',
      render: (value: number) => (
        value ? formatCurrency(value) : '-'
      ),
    },
  ];

  // Add performance columns if needed
  if (hasPerformanceData) {
    columns.push(
      {
        key: 'positionValue',
        title: 'Value',
        dataIndex: 'positionValue',
        width: 120,
        align: 'right',
        render: (value: number) => (
          value ? formatCurrency(value) : '-'
        ),
      },
      {
        key: 'profitLoss',
        title: 'P&L',
        dataIndex: 'profitLoss',
        width: 120,
        align: 'right',
        render: (value: number, record: Asset) => {
          if (value === undefined) return '-';

          const isPositive = value >= 0;
          const pnlPct = record.profitLossPct;

          return (
            <div className={classNames(
              styles.pnlCell,
              { [styles.positive]: isPositive, [styles.negative]: !isPositive }
            )}>
              <span className={styles.pnlValue}>
                {formatCurrency(value)}
              </span>
              {pnlPct !== undefined && (
                <span className={styles.pnlPercent}>
                  ({formatPercentage(pnlPct / 100)})
                </span>
              )}
            </div>
          );
        },
      }
    );
  }

  // Add sector/industry column
  columns.push({
    key: 'sector',
    title: 'Sector',
    dataIndex: 'sector',
    width: 120,
    render: (value: string, record) => (
      <div className={styles.sectorCell}>
        {value && (
          <Badge variant="neutral" size="small">
            {value}
          </Badge>
        )}
        {record.industry && (
          <span className={styles.industry}>{record.industry}</span>
        )}
      </div>
    ),
  });

  // Add purchase date column
  columns.push({
    key: 'purchaseDate',
    title: 'Purchase Date',
    dataIndex: 'purchaseDate',
    width: 120,
    render: (value: string) => (
      value ? formatDate(value, 'short') : '-'
    ),
  });

  // Add actions column
  if (onEdit || onDelete) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <div className={styles.actions}>
          {onEdit && (
            <Button
              variant="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              aria-label={`Edit ${record.ticker}`}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record.ticker);
              }}
              aria-label={`Delete ${record.ticker}`}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    });
  }

  const tableClasses = classNames(styles.table, className);

  return (
    <div className={tableClasses} data-testid={testId}>
      <Table
        columns={columns}
        data={assets}
        rowKey="ticker"
        loading={loading}
        onRowClick={onRowClick ? (record) => onRowClick(record) : undefined}
        pagination={assets.length > 10 ? {
          current: 1,
          pageSize: 10,
          total: assets.length,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} assets`,
        } : false}
        emptyText="No assets found"
        size="middle"
      />
    </div>
  );
};

export default AssetTable;