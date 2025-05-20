import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio, Asset } from '../../../types/portfolio';
import Card from '../../common/Card/Card';
import AssetForm from '../AssetForm/AssetForm';
import AssetTable from '../AssetTable/AssetTable';
import { ROUTES } from '../../../constants/routes';
import PieChart from '../../charts/PieChart/PieChart';
import { getChartColorScheme } from '../../../constants/colors';

interface PortfolioFormProps {
  portfolio?: Partial<Portfolio>;
  onSave: (portfolio: Portfolio) => void;
  onCancel?: () => void;
  className?: string;
  loading?: boolean;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({
  portfolio = {},
  onSave,
  onCancel,
  className = '',
  loading = false,
}) => {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState(portfolio.name || '');
  const [description, setDescription] = useState(portfolio.description || '');
  const [assets, setAssets] = useState<Asset[]>(portfolio.assets || []);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Partial<Asset>>({});
  const [isValid, setIsValid] = useState(false);
  const [isNormalized, setIsNormalized] = useState(true);

  // Validate form and check normalization
  useEffect(() => {
    // Check if form is valid
    setIsValid(name.trim() !== '' && assets.length > 0);

    // Check if weights are normalized
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    setIsNormalized(Math.abs(totalWeight - 1) < 0.001);
  }, [name, assets]);

  // Add or update asset
  const handleSaveAsset = (asset: Asset) => {
    const existingIndex = assets.findIndex(a => a.ticker === asset.ticker);

    if (existingIndex >= 0) {
      // Update existing asset
      const updatedAssets = [...assets];
      updatedAssets[existingIndex] = asset;
      setAssets(updatedAssets);
    } else {
      // Add new asset
      setAssets([...assets, asset]);
    }

    setShowAssetForm(false);
    setCurrentAsset({});
  };

  // Edit existing asset
  const handleEditAsset = (asset: Asset) => {
    setCurrentAsset(asset);
    setShowAssetForm(true);
  };

  // Add new asset
  const handleAddAsset = () => {
    setCurrentAsset({});
    setShowAssetForm(true);
  };

  // Delete asset
  const handleDeleteAsset = (ticker: string) => {
    setAssets(assets.filter(asset => asset.ticker !== ticker));
  };

  // Update asset weight
  const handleWeightChange = (ticker: string, weight: number) => {
    const updatedAssets = assets.map(asset =>
      asset.ticker === ticker ? { ...asset, weight } : asset
    );
    setAssets(updatedAssets);
  };

  // Normalize weights
  const normalizeWeights = () => {
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

    if (totalWeight === 0) return;

    const normalizedAssets = assets.map(asset => ({
      ...asset,
      weight: asset.weight / totalWeight
    }));

    setAssets(normalizedAssets);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    // Create portfolio object
    const portfolioData: Portfolio = {
      id: portfolio.id || `portfolio-${Date.now()}`,
      name,
      description,
      assets,
      created: portfolio.created || new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    onSave(portfolioData);
  };

  // Calculate total weight
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

  // Prepare data for pie chart
  const pieChartData = assets.map((asset, index) => ({
    name: asset.ticker,
    value: asset.weight,
    color: getChartColorScheme(assets.length)[index]
  }));

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-text-light mb-4">
            {portfolio.id ? 'Edit Portfolio' : 'Create New Portfolio'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Portfolio Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Portfolio"
                className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Long-term investment portfolio focused on technology and healthcare sectors"
                rows={3}
                className="w-full px-3 py-2 bg-background border border-divider rounded text-text-light focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[60%]">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text-light">Assets</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={normalizeWeights}
                    disabled={isNormalized || assets.length === 0}
                    className="px-3 py-1 border border-divider text-text-light text-sm rounded hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Normalize Weights
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="px-3 py-1 bg-accent text-text-light text-sm rounded hover:bg-hover transition-colors"
                  >
                    Add Asset
                  </button>
                </div>
              </div>

              <div className="mb-2 flex justify-between items-center">
                <div className="text-sm text-neutral-gray">
                  {assets.length} assets | Total weight: {(totalWeight * 100).toFixed(2)}%
                </div>

                {!isNormalized && assets.length > 0 && (
                  <div className="text-sm text-negative">
                    Weights do not sum to 100%
                  </div>
                )}
              </div>

              {showAssetForm ? (
                <div className="mb-4 p-4 border border-divider rounded">
                  <h3 className="text-md font-medium text-text-light mb-3">
                    {currentAsset.ticker ? `Edit ${currentAsset.ticker}` : 'Add New Asset'}
                  </h3>
                  <AssetForm
                    asset={currentAsset}
                    onSave={handleSaveAsset}
                    onCancel={() => setShowAssetForm(false)}
                    allowTickerChange={!currentAsset.ticker}
                  />
                </div>
              ) : null}

              <AssetTable
                assets={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                onWeightChange={handleWeightChange}
                isNormalized={isNormalized}
              />
            </Card>
          </div>

          {assets.length > 0 && (
            <div className="flex-1 min-w-[30%]">
              <Card>
                <h2 className="text-lg font-semibold text-text-light mb-4">Portfolio Allocation</h2>
                <div className="h-64">
                  <PieChart
                    data={pieChartData}
                    height={250}
                  />
                </div>
              </Card>
            </div>
          )}
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
            disabled={!isValid || loading}
            className="px-4 py-2 bg-accent text-text-light rounded hover:bg-hover transition-colors disabled:bg-disabled"
          >
            {loading ? 'Saving...' : portfolio.id ? 'Update Portfolio' : 'Create Portfolio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;