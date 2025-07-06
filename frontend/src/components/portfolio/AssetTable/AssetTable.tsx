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
      !('purchasePrice' in asset && asset.purchasePrice && asset.purchasePrice > 0)
    );

    console.log('Assets needing prices:', assetsNeedingPrices.map(a => a.ticker));

    if (assetsNeedingPrices.length > 0) {
      const loadPrices = async () => {
        setPricesLoading(true);
        try {
          const tickers = assetsNeedingPrices.map(asset => asset.ticker);
          console.log('Fetching prices for tickers:', tickers);

          const prices = await getMultipleAssetPrices(tickers);
          console.log('Received prices from API:', prices);

          // Filter out null prices and convert to our format
          const validPrices: Record<string, number> = {};
          Object.entries(prices).forEach(([ticker, price]) => {
            if (price !== null && price > 0) {
              validPrices[ticker.toUpperCase()] = price;
            }
          });

          console.log('Valid prices after filtering:', validPrices);
          setAssetPrices(validPrices);
        } catch (error) {
          console.error('Error loading asset prices:', error);
        } finally {
          setPricesLoading(false);
        }
      };

      loadPrices();
    }
  }, [assets, getMultipleAssetPrices]);

  // Helper function to get asset price (use record data first)
  const getAssetPrice = (record: Asset | AssetCreate): number => {
    const ticker = record.ticker.toUpperCase();

    // PRIORITY 1: currentPrice from record data
    if ('currentPrice' in record && record.currentPrice && record.currentPrice > 0) {
      console.log(`Using currentPrice for ${ticker}:`, record.currentPrice);
      return record.currentPrice;
    }

    // PRIORITY 2: purchasePrice from record data
    if ('purchasePrice' in record && record.purchasePrice && record.purchasePrice > 0) {
      console.log(`Using purchasePrice for ${ticker}:`, record.purchasePrice);
      return record.purchasePrice;
    }

    // PRIORITY 3: loaded API price (if available)
    const apiPrice = assetPrices[ticker];
    if (apiPrice && apiPrice > 0) {
      console.log(`Using API price for ${ticker}:`, apiPrice);
      return apiPrice;
    }

    // FALLBACK: $100 (only if no data available)
    console.log(`Using fallback price for ${ticker}: $100`);
    return 100;
  };

  // Check if assets have P&L data
  const hasPositionValue = assets.some(asset =>
    'positionValue' in asset || 'profitLoss' in asset
  );

  const showPnLColumn = showPnL && hasPositionValue;

  // Calculate total allocation
  const totalWeight = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  }, [assets]);

  // Helper function to calculate quantity (whole shares only)
  const calculateQuantity = (weight: number, price: number) => {
    if (!price || price <= 0) return 0;
    const targetValue = (weight / 100) * portfolioValue;
    return Math.floor(targetValue / price);
  };

  // Helper function to calculate ACTUAL value (quantity × price)
  const calculateActualValue = (weight: number, price: number) => {
    const quantity = calculateQuantity(weight, price);
    return quantity * price;
  };

  // Define table columns
  const columns: TableColumn[] = useMemo(() => {
    const cols: TableColumn[] = [
      {
        key: 'asset',
        title: 'Asset',
        width: 180,
        render: (value, record) => (
          <div className={styles.tickerCell}>
            <div className={styles.ticker}>{record.ticker}</div>
            <div className={styles.assetName}>{record.name || record.ticker}</div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'weight',
        title: 'Weight',
        width: 80,
        render: (value, record) => (
          <span className={styles.weight}>
            {formatPercentage((record.weight || 0) / 100)}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'price',
        title: 'Price',
        width: 100,
        render: (value, record) => {
          const price = getAssetPrice(record);
          const isLoadingPrice = pricesLoading &&
            !('currentPrice' in record && record.currentPrice) &&
            !assetPrices[record.ticker.toUpperCase()];

          return (
            <span className={styles.price}>
              {isLoadingPrice ? '...' : formatCurrency(price, record.currency || 'USD')}
            </span>
          );
        },
        sortable: true,
      },
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

          const actualValue = calculateActualValue(record.weight || 0, price);
          return (
            <span className={styles.value}>
              {formatCurrency(actualValue, 'USD')}
            </span>
          );
        },
        sortable: true,
      },
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

          const quantity = calculateQuantity(record.weight || 0, price);
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

    // Add actions column
    if (showActions && (onEdit || onDelete)) {
      cols.push({
        key: 'actions',
        title: 'Actions',
        width: 120,
        render: (value, record) => (
          <div className={styles.actions}>
            {onEdit && (
              <Button
                variant="ghost"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(record);
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
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
            )}
          </div>
        ),
      });
    }

    return cols;
  }, [assets, portfolioValue, showPnLColumn, showActions, onEdit, onDelete, assetPrices, pricesLoading]);

  // Handle row click
  const handleRowClick = (record: Asset | AssetCreate) => {
    if (onRowClick) {
      onRowClick(record);
    }
  };

  // Calculate total portfolio value (actual, not target)
  const totalPortfolioValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const price = getAssetPrice(asset);
      return sum + calculateActualValue(asset.weight || 0, price);
    }, 0);
  }, [assets, portfolioValue, assetPrices]);

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
            Total Weight: <span className={styles.statValue}>{formatPercentage(totalWeight / 100)}</span> Total Value: <span className={styles.statValue}>{pricesLoading ? '...' : formatCurrency(totalPortfolioValue, 'USD')}</span>
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

      {/* Table without any additional header */}
      <Table
        data={assets}
        columns={columns}
        rowKey="ticker"
        onRowClick={handleRowClick ? (record, index, event) => handleRowClick(record) : undefined}
        pagination={false}
        size="small"
        showHeader={true}
      />
    </div>
  );
};

export default AssetTable;