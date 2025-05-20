import React, { useState, useEffect } from 'react';
import { Asset, AssetClass, Sector } from '../../../types/portfolio';
import { useMarketData } from '../../../hooks/useMarketData';

interface AssetFormProps {
  asset?: Partial<Asset>;
  onSave: (asset: Asset) => void;
  onCancel?: () => void;
  className?: string;
  allowTickerChange?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  asset = {},
  onSave,
  onCancel,
  className = '',
  allowTickerChange = true,
}) => {
  // Form state
  const [ticker, setTicker] = useState(asset.ticker || '');
  const [weight, setWeight] = useState(asset.weight !== undefined ? asset.weight : 0);
  const [name, setName] = useState(asset.name || '');
  const [sector, setSector] = useState<Sector | undefined>(asset.sector);
  const [assetClass, setAssetClass] = useState<AssetClass | undefined>(asset.asset_class);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Market data hook for searching and validating assets
  const { searchAssets, getAssetInfo, loading: marketDataLoading } = useMarketData();

  // Reset form when asset prop changes
  useEffect(() => {
    setTicker(asset.ticker || '');
    setWeight(asset.weight !== undefined ? asset.weight : 0);
    setName(asset.name || '');
    setSector(asset.sector);
    setAssetClass(asset.asset_class);
    setError(null);
  }, [asset]);

  // Validate form
  useEffect(() => {
    setIsValid(ticker.trim() !== '' && weight >= 0 && weight <= 1);
  }, [ticker, weight]);

  // Handle search
  const handleSearch = async () => {
    if (!ticker.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchAssets(ticker);
      setSearchResults(results);

      if (results.length === 0) {
        setError('No results found for this ticker. Please try another search term.');
      }
    } catch (err) {
      setError('Error searching for assets. Please try again.');
      console.error('Asset search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle select asset from search results
  const handleSelectAsset = (selectedAsset: Asset) => {
    setTicker(selectedAsset.ticker);
    setName(selectedAsset.name || '');
    setSector(selectedAsset.sector);
    setAssetClass(selectedAsset.asset_class);
    setSearchResults([]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    // If we have minimal info but need to get additional data
    if (!name || !sector) {
      try {
        const assetInfo = await getAssetInfo(ticker);

        if (assetInfo) {
          onSave({
            ticker,
            weight,
            name: name || assetInfo.name || ticker,
            sector: sector || assetInfo.sector,
            asset_class: assetClass || assetInfo.asset_class,
            current_price: assetInfo.current_price,
            price_change_pct: assetInfo.price_change_pct,
          });
          return;
        }
      } catch (err) {
        console.warn('Could not fetch additional asset data:', err);
        // Continue with minimal data
      }
    }

    // Save with available data
    onSave({
      ticker,
      weight,
      name: name || ticker,
      sector,
      asset_class: assetClass,
    });
  };

  // Available asset classes
  const assetClasses: AssetClass[] = [
    'Stock',
    'ETF',
    'Bond',
    'Mutual Fund',
    'Commodity',
    'Cryptocurrency',
    'Cash',
    'Real Estate',
    'Other'
  ];

  // Available sectors
  const sectors: Sector[] = [
    'Technology',
    'Healthcare',
    'Financials',
    'Consumer Discretionary',
    'Consumer Staples',
    'Industrials',
    'Energy',
    'Materials',
    'Utilities',
    'Communication Services',
    'Real Estate'
  ];

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Ticker Symbol
          </label>
          <div className="flex">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              disabled={!allowTickerChange && ticker !== ''}
              placeholder="AAPL"
              className="flex-1 px-3 py-2 bg-background border border-divider rounded-l text-text-light focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={!ticker.trim() || isSearching}
              className="px-4 py-2 bg-accent text-text-light rounded-r hover:bg-hover transition-colors disabled:bg-disabled"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-negative">{error}</p>}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-divider rounded">
            <ul className="divide-y divide-divider">
              {searchResults.map((result) => (
                <li
                  key={result.ticker}
                  className="p-2 hover:bg-background cursor-pointer"
                  onClick={() => handleSelectAsset(result)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-text-light">{result.ticker}</span>
                    {result.asset_class && (
                      <span className="text-xs text-neutral-gray px-2 py-0.5 bg-background rounded-full">
                        {result.asset_class}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-gray">{result.name}</p>
                  {result.sector && (
                    <p className="text-xs text-neutral-gray">{result.sector}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Weight (0-100%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={weight * 100}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setWeight(isNaN(value) ? 0 : value / 100);
              }}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-neutral-gray">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Apple Inc."
            className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Sector
          </label>
          <select
            value={sector || ''}
            onChange={(e) => setSector(e.target.value as Sector)}
            className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">Select Sector</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Asset Class
          </label>
          <select
            value={assetClass || ''}
            onChange={(e) => setAssetClass(e.target.value as AssetClass)}
            className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">Select Asset Class</option>
            {assetClasses.map((ac) => (
              <option key={ac} value={ac}>{ac}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-divider">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-divider text-text-light rounded hover:border-accent transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || marketDataLoading}
            className="px-4 py-2 bg-accent text-text-light rounded hover:bg-hover transition-colors disabled:bg-disabled"
          >
            {marketDataLoading ? 'Processing...' : asset.ticker ? 'Update Asset' : 'Add Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;