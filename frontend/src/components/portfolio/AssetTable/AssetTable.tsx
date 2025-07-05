/**
 * AssetTable Component - FIXED
 * Table for displaying portfolio assets with working Edit/Delete actions
 */
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Table } from '../../common/Table';
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
  onDeleteAll?: () => void;
  onRowClick?: (asset: Asset | AssetCreate) => void;
  showActions?: boolean;
  showPnL?: boolean;
  showDeleteAll?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  render?: (value: any, record: Asset | AssetCreate) => React.ReactNode;
  sorter?: boolean;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets = [],
  loading = false,
  onEdit,
  onDelete,
  onDeleteAll,
  onRowClick,
  showActions = true,
  showPnL = true,
  showDeleteAll = true,
  className,
  'data-testid': testId,
}) => {
  // Check if assets have P&L data
  const hasPositionValue = assets.some(asset =>
    'positionValue' in asset || 'profitLoss' in asset
  );

  const showPnLColumn = showPnL && hasPositionValue;

  // Calculate total allocation
  const totalWeight = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  }, [assets]);

  // Define table columns
  const columns: TableColumn[] = useMemo(() => {
    const cols: TableColumn[] = [
      {
        key: 'ticker',
        title: 'Asset',
        width: 180,
        render: (_, record) => (
          <div className={styles.tickerCell}>
            <div className={styles.ticker}>{record.ticker}</div>
            <div className={styles.assetName}>{record.name || record.ticker}</div>
          </div>
        ),
        sorter: true,
      },
      {
        key: 'weight',
        title: 'Weight',
        width: 100,
        render: (_, record) => (
          <span className={styles.weight}>
            {formatPercentage(record.weight || 0)}
          </span>
        ),
        sorter: true,
      },
    ];

    // Add quantity column if assets have quantity data
    const hasQuantity = assets.some(asset => 'quantity' in asset && asset.quantity);
    if (hasQuantity) {
      cols.push({
        key: 'quantity',
        title: 'Quantity',
        width: 100,
        render: (_, record) => (
          'quantity' in record && record.quantity !== undefined
            ? record.quantity.toLocaleString()
            : '-'
        ),
        sorter: true,
      });
    }

    // Add price columns
    cols.push(
      {
        key: 'price',
        title: 'Price',
        width: 120,
        render: (_, record) => (
          <div className={styles.priceCell}>
            <div className={styles.currentPrice}>
              {record.currentPrice ? formatCurrency(record.currentPrice) : '-'}
            </div>
            {'purchasePrice' in record && record.purchasePrice && (
              <div className={styles.purchasePrice}>
                Bought: {formatCurrency(record.purchasePrice)}
              </div>
            )}
          </div>
        ),
      }
    );

    // Add P&L column if applicable
    if (showPnLColumn) {
      cols.push({
        key: 'pnl',
        title: 'P&L',
        width: 140,
        render: (_, record) => {
          if (!('profitLoss' in record) || record.profitLoss === undefined) {
            return '-';
          }

          const isPositive = record.profitLoss >= 0;
          const pnlClasses = classNames(styles.pnlCell, {
            [styles.positive]: isPositive,
            [styles.negative]: !isPositive,
          });

          return (
            <div className={pnlClasses}>
              <div className={styles.pnlValue}>
                {formatCurrency(record.profitLoss)}
              </div>
              {'profitLossPct' in record && record.profitLossPct !== undefined && (
                <div className={styles.pnlPercent}>
                  {formatPercentage(record.profitLossPct)}
                </div>
              )}
            </div>
          );
        },
        sorter: true,
      });
    }

    // Add sector column
    cols.push({
      key: 'sector',
      title: 'Sector',
      width: 150,
      render: (_, record) => (
        <div className={styles.sectorCell}>
          <div className={styles.sector}>{record.sector || 'Unknown'}</div>
          {'industry' in record && record.industry && (
            <div className={styles.industry}>{record.industry}</div>
          )}
        </div>
      ),
    });

    // Add purchase date column if available
    const hasPurchaseDate = assets.some(asset =>
      'purchaseDate' in asset && asset.purchaseDate
    );
    if (hasPurchaseDate) {
      cols.push({
        key: 'purchaseDate',
        title: 'Purchase Date',
        width: 120,
        render: (_, record) => (
          'purchaseDate' in record && record.purchaseDate
            ? formatDate(record.purchaseDate, 'short')
            : '-'
        ),
        sorter: true,
      });
    }

    return cols;
  }, [assets, showPnLColumn]);

  // Add actions column if edit/delete handlers provided
  const finalColumns = useMemo(() => {
    const cols = [...columns];

    if (showActions && (onEdit || onDelete)) {
      cols.push({
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
                className={styles.editButton}
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
                  // Confirm deletion
                  if (window.confirm(`Are you sure you want to delete ${record.ticker}?`)) {
                    onDelete(record.ticker);
                  }
                }}
                aria-label={`Delete ${record.ticker}`}
                className={styles.deleteButton}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      });
    }

    return cols;
  }, [columns, showActions, onEdit, onDelete]);

  const tableClasses = classNames(styles.table, className);

  // Custom table header with Delete All button
  const tableHeader = useMemo(() => {
    if (!showDeleteAll || !onDeleteAll || assets.length === 0) {
      return null;
    }

    return (
      <div className={styles.tableHeader}>
        <div className={styles.headerInfo}>
          <span className={styles.assetCount}>
            {assets.length} assets
          </span>
          <span className={styles.totalWeight}>
            Total allocation: {formatPercentage(totalWeight)}
            {totalWeight !== 100 && (
              <Badge
                variant={totalWeight > 100 ? 'error' : 'warning'}
                size="small"
                className={styles.allocationBadge}
              >
                {totalWeight > 100 ? 'Over-allocated' : 'Under-allocated'}
              </Badge>
            )}
          </span>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="text"
            size="small"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete all ${assets.length} assets?`)) {
                onDeleteAll();
              }
            }}
            className={styles.deleteAllButton}
            disabled={assets.length === 0}
          >
            🗑️ Delete All
          </Button>
        </div>
      </div>
    );
  }, [showDeleteAll, onDeleteAll, assets.length, totalWeight]);

  const emptyState = (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📊</div>
      <h3>No assets found</h3>
      <p>Add some assets to start building your portfolio</p>
    </div>
  );

  return (
    <div className={tableClasses} data-testid={testId}>
      {tableHeader}

      <Table
        columns={finalColumns}
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
        emptyText={emptyState}
        size="middle"
        className={styles.tableContent}
      />
    </div>
  );
};

export default AssetTable;