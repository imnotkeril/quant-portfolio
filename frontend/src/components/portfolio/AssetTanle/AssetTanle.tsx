import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import { Asset, AssetClass, Sector } from '../../../types/portfolio';
import { getColorByValue } from '../../../constants/colors';

interface AssetTableProps {
  assets: Asset[];
  onSelect?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (ticker: string) => void;
  onWeightChange?: (ticker: string, weight: number) => void;
  className?: string;
  showActions?: boolean;
  showCurrentPrice?: boolean;
  showPerformance?: boolean;
  interactive?: boolean;
  isNormalized?: boolean;
  loading?: boolean;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onSelect,
  onEdit,
  onDelete,
  onWeightChange,
  className = '',
  showActions = true,
  showCurrentPrice = true,
  showPerformance = true,
  interactive = true,
  isNormalized = true,
  loading = false,
}) => {
  const [editableAsset, setEditableAsset] = useState<string | null>(null);
  const [editedWeight, setEditedWeight] = useState<number>(0);

  // Calculate total weight
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

  // Group assets by sector if sector information is available
  const hasSectors = assets.some(asset => asset.sector);
  const sectorGroups = hasSectors
    ? assets.reduce<Record<string, Asset[]>>((groups, asset) => {
        const sector = asset.sector || 'Other';
        if (!groups[sector]) {
          groups[sector] = [];
        }
        groups[sector].push(asset);
        return groups;
      }, {})
    : {};

  // Handle weight edit
  const handleEditWeight = (ticker: string, weight: number) => {
    setEditableAsset(ticker);
    setEditedWeight(weight);
  };

  // Save edited weight
  const handleSaveWeight = (ticker: string) => {
    if (onWeightChange && editableAsset === ticker) {
      onWeightChange(ticker, editedWeight);
    }
    setEditableAsset(null);
  };

  // Cancel weight edit
  const handleCancelEdit = () => {
    setEditableAsset(null);
  };

  // Handle key press in weight input
  const handleKeyPress = (e: React.KeyboardEvent, ticker: string) => {
    if (e.key === 'Enter') {
      handleSaveWeight(ticker);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Render table with or without sector grouping
  const renderAssetTable = (assetsToRender: Asset[], sectorName?: string) => {
    return (
      <table className="min-w-full divide-y divide-divider">
        <thead className="bg-background">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
              Ticker
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
              Weight
            </th>
            {showCurrentPrice && (
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                Price
              </th>
            )}
            {showPerformance && (
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                Change (%)
              </th>
            )}
            {showActions && (
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-divider">
          {assetsToRender.map((asset) => (
            <tr
              key={asset.ticker}
              className={`${interactive ? 'hover:bg-background hover:bg-opacity-50 cursor-pointer' : ''}`}
              onClick={() => interactive && onSelect && onSelect(asset)}
            >
              <td className="px-4 py-3 text-sm text-text-light font-medium">
                {asset.ticker}
              </td>
              <td className="px-4 py-3 text-sm text-text-light">
                {asset.name || asset.ticker}
                {asset.asset_class && (
                  <span className="ml-2 px-2 py-0.5 bg-background rounded-full text-xs text-neutral-gray">
                    {asset.asset_class}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-text-light text-right">
                {editableAsset === asset.ticker ? (
                  <div className="flex justify-end items-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editedWeight}
                      onChange={(e) => setEditedWeight(Number(e.target.value))}
                      onKeyDown={(e) => handleKeyPress(e, asset.ticker)}
                      autoFocus
                      className="w-20 px-2 py-1 bg-background border border-accent text-text-light text-right rounded"
                    />
                    <button
                      onClick={() => handleSaveWeight(asset.ticker)}
                      className="ml-2 p-1 text-accent hover:text-hover transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="ml-1 p-1 text-negative hover:text-hover transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className={`${onWeightChange ? 'hover:underline hover:text-accent' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWeightChange && handleEditWeight(asset.ticker, asset.weight);
                    }}
                  >
                    {(asset.weight * 100).toFixed(2)}%
                  </div>
                )}
              </td>
              {showCurrentPrice && (
                <td className="px-4 py-3 text-sm text-text-light text-right">
                  {asset.current_price
                    ? `$${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </td>
              )}
              {showPerformance && (
                <td className="px-4 py-3 text-sm text-right">
                  {asset.price_change_pct !== undefined ? (
                    <span style={{ color: getColorByValue(asset.price_change_pct) }}>
                      {asset.price_change_pct >= 0 ? '+' : ''}
                      {asset.price_change_pct.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-neutral-gray">—</span>
                  )}
                </td>
              )}
              {showActions && (
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(asset);
                        }}
                        className="text-xs px-2 py-1 text-accent hover:text-hover transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(asset.ticker);
                        }}
                        className="text-xs px-2 py-1 text-negative hover:text-hover transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {sectorName && (
          <tfoot>
            <tr className="bg-background bg-opacity-30">
              <td className="px-4 py-2 text-xs font-medium text-neutral-gray">
                {sectorName} Total
              </td>
              <td></td>
              <td className="px-4 py-2 text-xs font-medium text-neutral-gray text-right">
                {(assetsToRender.reduce((sum, asset) => sum + asset.weight, 0) * 100).toFixed(2)}%
              </td>
              {showCurrentPrice && <td></td>}
              {showPerformance && <td></td>}
              {showActions && <td></td>}
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  if (loading) {
    return <Card loading loadingRows={5} />;
  }

  if (assets.length === 0) {
    return (
      <Card className={`text-center py-8 ${className}`}>
        <p className="text-neutral-gray">No assets in this portfolio</p>
        {onEdit && (
          <button
            onClick={() => onEdit({ ticker: '', weight: 0 })}
            className="mt-4 px-4 py-2 bg-accent text-text-light text-sm rounded hover:bg-hover transition-colors"
          >
            Add First Asset
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      {!isNormalized && (
        <div className="px-4 py-2 mb-4 bg-negative bg-opacity-20 border border-negative border-opacity-30 rounded">
          <p className="text-negative text-sm">
            Warning: Portfolio weights do not sum to 100% (Current total: {(totalWeight * 100).toFixed(2)}%).
            Consider normalizing the weights for accurate analytics.
          </p>
        </div>
      )}

      {hasSectors ? (
        <div className="space-y-6">
          {Object.entries(sectorGroups).map(([sector, sectorAssets]) => (
            <Card key={sector}>
              <h3 className="text-text-light font-medium mb-3">{sector}</h3>
              {renderAssetTable(sectorAssets, sector)}
            </Card>
          ))}
          <Card>
            <h3 className="text-text-light font-medium mb-3">Portfolio Summary</h3>
            <table className="min-w-full">
              <tbody>
                {Object.entries(sectorGroups).map(([sector, sectorAssets]) => {
                  const sectorWeight = sectorAssets.reduce((sum, asset) => sum + asset.weight, 0);
                  return (
                    <tr key={sector} className="border-b border-divider">
                      <td className="px-4 py-3 text-sm text-text-light">{sector}</td>
                      <td className="px-4 py-3 text-sm text-text-light text-right">
                        {(sectorWeight * 100).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-medium">
                  <td className="px-4 py-3 text-sm text-text-light">Total</td>
                  <td className="px-4 py-3 text-sm text-text-light text-right">
                    {(totalWeight * 100).toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <Card>
          {renderAssetTable(assets)}
        </Card>
      )}
    </div>
  );
};

export default AssetTable;