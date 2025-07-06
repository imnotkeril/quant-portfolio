/**
 * AssetTable Component - ENHANCED WITH REAL API PRICES
 * Table for displaying portfolio assets with Price, Value, Quantity columns
 */
import React, { useMemo, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Table } from '../../common/Table';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Asset, AssetCreate } from '../../../types/portfolio';
import { formatCurrency, formatPercentage, formatDate } from '../../../utils/formatters';
import { useAssets } from '../../../hooks/useAssets';
import styles from './AssetTable.module.css';

interface AssetTableProps {
  assets: Asset[] | AssetCreate[];
  portfolioValue?: number; // Total portfolio value for calculations
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
  sortable?: boolean;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets = [],
  portfolioValue = 100000, // Default $100k portfolio
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
  const { getMultipleAssetPrices } = useAssets();
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Load prices for assets that don't have currentPrice
  useEffect(() => {
    const assetsNeedingPrices = assets.filter(asset =>
      !('currentPrice' in asset && asset.currentPrice && asset.currentPrice > 0) &&
      !assetPrices[asset.ticker?.toUpperCase()]
    );

    if (assetsNeedingPrices.length > 0) {
      setPricesLoading(true);
      const tickers = assetsNeedingPrices.map(asset => asset.ticker.toUpperCase());

      getMultipleAssetPrices(tickers)
        .then(prices => {
          setAssetPrices(prev => ({ ...prev, ...prices }));
        })
        .catch(error => {
          console.error('Failed to fetch asset prices:', error);
        })
        .finally(() => {
          setPricesLoading(false);
        });
    }
  }, [assets, getMultipleAssetPrices, assetPrices]);

  // Helper function to get asset price
  const getAssetPrice = (asset: Asset | AssetCreate): number => {
    if ('currentPrice' in asset && asset.currentPrice && asset.currentPrice > 0) {
      return asset.currentPrice;
    }
    return assetPrices[asset.ticker?.toUpperCase()] || 0;
  };

  // Helper function to calculate ACTUAL quantity (rounded down)
  const calculateActualQuantity = (weight: number, price: number): number => {
    if (!price || !portfolioValue) return 0;
    const targetAmount = (weight / 100) * portfolioValue;
    return Math.floor(targetAmount / price); // Round down to get actual shares
  };

  // Helper function to calculate ACTUAL value (quantity * price)
  const calculateActualValue = (weight: number, price: number): number => {
    if (!price || !portfolioValue) return 0;
    const quantity = calculateActualQuantity(weight, price);
    return quantity * price; // Actual value used
  };

  // Calculate metrics
  const totalWeight = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  }, [assets]);

  // Calculate total ACTUAL portfolio value (sum of actual values)
  const totalActualValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const price = getAssetPrice(asset);
      return sum + calculateActualValue(asset.weight || 0, price);
    }, 0);
  }, [assets, portfolioValue, assetPrices]);

  // Calculate cash remaining
  const cashRemaining = useMemo(() => {
    return portfolioValue - totalActualValue;
  }, [portfolioValue, totalActualValue]);

  const showPnLColumn = showPnL && assets.some(asset => 'profitLoss' in asset);

  // Define table columns
  const columns = useMemo<TableColumn[]>(() => {
    const cols: TableColumn[] = [
      // Ticker and Name column
      {
        key: 'ticker',
        title: 'Asset',
        width: 200,
        render: (value, record) => (
          <div className={styles.tickerCell}>
            <div className={styles.ticker}>{record.ticker}</div>
            <div className={styles.assetName}>
              {record.name || record.ticker}
            </div>
          </div>
        ),
        sortable: true,
      },
      // Weight column
      {
        key: 'weight',
        title: 'Weight',
        width: 100,
        render: (value, record) => (
          <span className={styles.weight}>
            {formatPercentage((record.weight || 0) / 100)}
          </span>
        ),
        sortable: true,
      },
      // Price column
      {
        key: 'price',
        title: 'Price',
        width: 120,
        render: (value, record) => {
          const isLoadingPrice = pricesLoading &&
            !('currentPrice' in record && record.currentPrice) &&
            !assetPrices[record.ticker.toUpperCase()];

          if (isLoadingPrice) {
            return <span className={styles.price}>...</span>;
          }

          const price = getAssetPrice(record);
          return (
            <span className={styles.price}>
              {price > 0 ? formatCurrency(price, record.currency || 'USD') : '-'}
            </span>
          );
        },
        sortable: true,
      },
      // Value column (FIXED: calculated with actual quantity)
      {
        key: 'value',
        title: 'Value',
        width: 120,
        render: (value, record) => {
          const price = getAssetPrice(record);
          const isLoadingPrice = pricesLoading &&
            !('currentPrice' in record && record.currentPrice) &&
            !assetPrices[record.ticker.toUpperCase()];

          if (isLoadingPrice) {
            return <span className={styles.value}>...</span>;
          }

          // FIXED: Use actual value calculation
          const actualValue = calculateActualValue(record.weight || 0, price);
          return (
            <span className={styles.value}>
              {actualValue > 0 ? formatCurrency(actualValue, 'USD') : '-'}
            </span>
          );
        },
        sortable: true,
      },
      // Quantity column (FIXED: calculated with floor)
      {
        key: 'quantity',
        title: 'Shares',
        width: 100,
        render: (value, record) => {
          const price = getAssetPrice(record);
          const isLoadingPrice = pricesLoading &&
            !('currentPrice' in record && record.currentPrice) &&
            !assetPrices[record.ticker.toUpperCase()];

          if (isLoadingPrice) {
            return <span className={styles.quantity}>...</span>;
          }

          // FIXED: Use actual quantity calculation with floor
          const quantity = calculateActualQuantity(record.weight || 0, price);
          return (
            <span className={styles.quantity}>
              {quantity.toLocaleString()}
            </span>
          );
        },
        sortable: true,
      },
    ];

    // Add sector column
    const hasSector = assets.some(asset => asset.sector);
    if (hasSector) {
      cols.push({
        key: 'sector',
        title: 'Sector',
        width: 140,
        render: (value, record) => (
          <div className={styles.sectorCell}>
            <div>{record.sector || '-'}</div>
            {record.industry && (
              <div className={styles.industry}>{record.industry}</div>
            )}
          </div>
        ),
        sortable: true,
      });
    }

    // Add P&L column if available
    if (showPnLColumn) {
      cols.push({
        key: 'pnl',
        title: 'P&L',
        width: 120,
        render: (value, record) => {
          if (!('profitLoss' in record) || record.profitLoss === undefined) {
            return '-';
          }

          const isPositive = record.profitLoss >= 0;
          const profitLossPercent = 'profitLossPercent' in record ? record.profitLossPercent : null;

          return (
            <div className={classNames(styles.pnlCell, {
              [styles.positive]: isPositive,
              [styles.negative]: !isPositive
            })}>
              <div className={styles.pnlValue}>
                {formatCurrency(record.profitLoss, record.currency || 'USD')}
              </div>
              {profitLossPercent !== null && (
                <div className={styles.pnlPercent}>
                  {formatPercentage(profitLossPercent / 100)}
                </div>
              )}
            </div>
          );
        },
        sortable: true,
      });
    }

    // Add actions column - ONLY DELETE BUTTON (NO EDIT)
    if (showActions && onDelete) {
      cols.push({
        key: 'actions',
        title: 'Actions',
        width: 120,
        render: (value, record) => (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record.ticker);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [assets, portfolioValue, showPnLColumn, showActions, onDelete, assetPrices, pricesLoading]);

  // Handle row click
  const handleRowClick = (record: Asset | AssetCreate) => {
    if (onRowClick) {
      onRowClick(record);
    }
  };

  if (loading) {
    return (
      <div className={classNames(styles.table, className)}>
        <div className={styles.loadingState}>
          Loading assets...
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={classNames(styles.table, className)}>
        <div className={styles.emptyState}>
          <h4>No assets yet</h4>
          <p>Add your first asset to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.table, className)} data-testid={testId}>
      {/* Header with portfolio stats */}
      <div className={styles.header}>
        <h3>Current Portfolio ({assets.length} assets)</h3>
        <div className={styles.headerStats}>
          <span className={styles.totalStats}>
            Total Weight: <span className={styles.statValue}>{formatPercentage(totalWeight / 100)}</span> Total Value: <span className={styles.statValue}>{pricesLoading ? '...' : formatCurrency(totalActualValue, 'USD')}</span>
          </span>
          {showDeleteAll && onDeleteAll && assets.length > 0 && (
            <Button
              variant="outline"
              size="small"
              onClick={onDeleteAll}
              className={styles.deleteAllButton}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Table and Cash wrapped with borders */}
      <div className={styles.tableWrapper}>
        <Table
          data={assets}
          columns={columns}
          rowKey="ticker"
          onRowClick={handleRowClick ? (record, index, event) => handleRowClick(record) : undefined}
          pagination={false}
          size="small"
          showHeader={true}
        />

        {/* Cash remaining display - ALWAYS SHOW */}
        <div className={styles.cashRow}>
          <div className={styles.cashInfo}>
            <span className={styles.cashLabel}>Cash Remaining:</span>
            <span className={styles.cashValue}>{formatCurrency(cashRemaining, 'USD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;