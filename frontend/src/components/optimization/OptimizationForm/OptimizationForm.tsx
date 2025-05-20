import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card/Card';

export type OptimizationMethod =
  | 'maximum_sharpe'
  | 'minimum_variance'
  | 'risk_parity'
  | 'markowitz'
  | 'equal_weight';

export interface SectorConstraint {
  name: string;
  tickers: string[];
  maxWeight: number;
  currentWeight: number;
}

export interface OptimizationParams {
  method: OptimizationMethod;
  riskFreeRate: number;
  targetReturn?: number;
  minWeight: number;
  maxWeight: number;
  sectorConstraints?: SectorConstraint[];
}

interface AssetDetails {
  ticker: string;
  name?: string;
  weight: number;
  sector?: string;
}

interface OptimizationFormProps {
  portfolioId: string;
  assets: AssetDetails[];
  isLoading?: boolean;
  onSubmit: (params: OptimizationParams) => void;
  onCancel?: () => void;
}

const OptimizationForm: React.FC<OptimizationFormProps> = ({
  portfolioId,
  assets,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  // State for optimization parameters
  const [method, setMethod] = useState<OptimizationMethod>('maximum_sharpe');
  const [riskFreeRate, setRiskFreeRate] = useState<number>(2.0);
  const [targetReturn, setTargetReturn] = useState<number>(10.0);
  const [minWeight, setMinWeight] = useState<number>(1.0);
  const [maxWeight, setMaxWeight] = useState<number>(30.0);
  const [useSectorConstraints, setUseSectorConstraints] = useState<boolean>(false);
  const [sectorConstraints, setSectorConstraints] = useState<SectorConstraint[]>([]);

  // Calculate initial suggested values based on number of assets
  useEffect(() => {
    if (assets.length > 0) {
      // Suggested min weight based on number of assets
      const suggestedMinWeight = Math.max(0.01, Math.min(0.05, 1.0 / (assets.length * 2)));
      setMinWeight(suggestedMinWeight * 100);

      // Suggested max weight based on number of assets
      const suggestedMaxWeight = Math.min(30.0, 100.0 / (assets.length / 3));
      setMaxWeight(suggestedMaxWeight);

      // Generate sector constraints
      const sectors: { [key: string]: { tickers: string[], weight: number } } = {};

      assets.forEach(asset => {
        if (asset.sector && asset.sector !== 'N/A') {
          if (!sectors[asset.sector]) {
            sectors[asset.sector] = { tickers: [], weight: 0 };
          }
          sectors[asset.sector].tickers.push(asset.ticker);
          sectors[asset.sector].weight += asset.weight;
        }
      });

      const constraintsList = Object.entries(sectors).map(([name, data]) => ({
        name,
        tickers: data.tickers,
        currentWeight: data.weight,
        maxWeight: Math.min(data.weight + 0.1, 1.0) // Current weight + 10%, capped at 100%
      }));

      setSectorConstraints(constraintsList);
    }
  }, [assets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: OptimizationParams = {
      method,
      riskFreeRate: riskFreeRate / 100, // Convert to decimal
      minWeight: minWeight / 100, // Convert to decimal
      maxWeight: maxWeight / 100, // Convert to decimal
    };

    // Add target return for Markowitz method
    if (method === 'markowitz') {
      params.targetReturn = targetReturn / 100; // Convert to decimal
    }

    // Add sector constraints if enabled
    if (useSectorConstraints && sectorConstraints.length > 0) {
      params.sectorConstraints = sectorConstraints.map(constraint => ({
        ...constraint,
        maxWeight: constraint.maxWeight / 100 // Convert to decimal
      }));
    }

    onSubmit(params);
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Portfolio Optimization</h2>

      <form onSubmit={handleSubmit}>
        {/* Optimization Method */}
        <div className="mb-4">
          <label htmlFor="method" className="block text-sm font-medium mb-2">
            Optimization Method
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as OptimizationMethod)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
            disabled={isLoading}
          >
            <option value="maximum_sharpe">Maximum Sharpe Ratio</option>
            <option value="minimum_variance">Minimum Variance</option>
            <option value="risk_parity">Risk Parity</option>
            <option value="markowitz">Markowitz (Efficient Frontier)</option>
            <option value="equal_weight">Equal Weights</option>
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {method === 'maximum_sharpe' && 'Optimizes the portfolio for the highest return per unit of risk.'}
            {method === 'minimum_variance' && 'Creates the portfolio with the lowest possible volatility.'}
            {method === 'risk_parity' && 'Allocates weights so each asset contributes equally to portfolio risk.'}
            {method === 'markowitz' && 'Finds the optimal portfolio for a given target return.'}
            {method === 'equal_weight' && 'Assigns equal weight to all assets in the portfolio.'}
          </p>
        </div>

        {/* Risk-Free Rate */}
        <div className="mb-4">
          <label htmlFor="riskFreeRate" className="block text-sm font-medium mb-2">
            Risk-Free Rate (%)
          </label>
          <input
            id="riskFreeRate"
            type="number"
            min="0"
            max="10"
            step="0.25"
            value={riskFreeRate}
            onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The rate of return of a risk-free asset (e.g., Treasury bills).
          </p>
        </div>

        {/* Target Return (only for Markowitz) */}
        {method === 'markowitz' && (
          <div className="mb-4">
            <label htmlFor="targetReturn" className="block text-sm font-medium mb-2">
              Target Annual Return (%)
            </label>
            <input
              id="targetReturn"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={targetReturn}
              onChange={(e) => setTargetReturn(parseFloat(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The desired annualized return for the optimized portfolio.
            </p>
          </div>
        )}

        {/* Weight Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="minWeight" className="block text-sm font-medium mb-2">
              Minimum Asset Weight (%)
            </label>
            <input
              id="minWeight"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={minWeight}
              onChange={(e) => setMinWeight(parseFloat(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="maxWeight" className="block text-sm font-medium mb-2">
              Maximum Asset Weight (%)
            </label>
            <input
              id="maxWeight"
              type="number"
              min="5"
              max="100"
              step="5"
              value={maxWeight}
              onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Sector Constraints */}
        {sectorConstraints.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                id="useSectorConstraints"
                type="checkbox"
                checked={useSectorConstraints}
                onChange={(e) => setUseSectorConstraints(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="useSectorConstraints" className="ml-2 block text-sm font-medium">
                Enable Sector Constraints
              </label>
            </div>

            {useSectorConstraints && (
              <div className="mt-4 border rounded-md p-4 dark:border-gray-700">
                <h3 className="text-md font-medium mb-2">Maximum Sector Weights</h3>

                {sectorConstraints.map((constraint, index) => (
                  <div key={constraint.name} className="mb-2">
                    <label className="flex justify-between text-sm font-medium">
                      <span>{constraint.name} ({constraint.tickers.length} assets)</span>
                      <span>Current: {(constraint.currentWeight * 100).toFixed(1)}%</span>
                    </label>
                    <input
                      type="range"
                      min={constraint.currentWeight * 100}
                      max="100"
                      step="5"
                      value={constraint.maxWeight * 100}
                      onChange={(e) => {
                        const newConstraints = [...sectorConstraints];
                        newConstraints[index] = {
                          ...newConstraints[index],
                          maxWeight: parseFloat(e.target.value) / 100
                        };
                        setSectorConstraints(newConstraints);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{(constraint.currentWeight * 100).toFixed(1)}%</span>
                      <span>{(constraint.maxWeight * 100).toFixed(1)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            disabled={isLoading}
          >
            {isLoading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default OptimizationForm;