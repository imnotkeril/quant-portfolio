import React from 'react';
import { Link } from 'react-router-dom';
import { Portfolio } from '../../../types/portfolio';
import Card from '../../common/Card/Card';
import { ROUTES } from '../../../constants/routes';
import { formatDate } from '../../../utils/formatters';
import MinimalChart from '../../charts/MinimalChart/MinimalChart';

interface PortfolioCardProps {
  portfolio: Portfolio;
  selected?: boolean;
  onClick?: () => void;
  onAnalyze?: () => void;
  performance?: {
    returns: number;
    chartData?: Array<{ date: string; value: number }>;
  };
  className?: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  selected = false,
  onClick,
  onAnalyze,
  performance,
  className = '',
}) => {
  const {
    id,
    name,
    description,
    created,
    last_updated,
    assets = [],
  } = portfolio;

  // Calculate total weight to check if it's normalized
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  const isNormalized = Math.abs(totalWeight - 1) < 0.001; // Allow small floating point errors

  // Prepare data for mini chart
  const chartData = performance?.chartData || Array(20).fill(0).map((_, i) => ({
    name: `Point ${i}`,
    value: Math.random() * 10,
  }));

  return (
    <Card
      className={`transition-all duration-200 ${selected ? 'border-accent' : ''} ${className}`}
      onClick={onClick}
      hoverable
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-text-light font-semibold">{name}</h3>
          {description && (
            <p className="text-neutral-gray text-xs mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        {performance && (
          <div className="flex flex-col items-end">
            <span
              className={`text-sm font-medium ${
                performance.returns >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {performance.returns >= 0 ? '+' : ''}{performance.returns.toFixed(2)}%
            </span>
            <div className="w-24 h-12 mt-1">
              <MinimalChart
                data={chartData}
                dataKey="value"
                type="line"
                height={40}
                width={96}
                color={performance.returns >= 0 ? undefined : '#FAA1A4'}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-gray">Assets: {assets.length}</span>
          <span className="text-xs text-neutral-gray mt-1">
            Updated: {formatDate(last_updated || created)}
          </span>
        </div>

        <div className="flex space-x-2">
          {!isNormalized && (
            <span className="px-2 py-1 bg-negative bg-opacity-20 text-negative text-xs rounded">
              Not normalized
            </span>
          )}

          {onAnalyze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              className="px-3 py-1 bg-accent text-text-light text-xs rounded hover:bg-hover transition-colors"
            >
              Analyze
            </button>
          )}

          <Link
            to={ROUTES.PORTFOLIO.DETAILS(id)}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1 bg-background border border-divider text-text-light text-xs rounded hover:border-accent transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioCard;