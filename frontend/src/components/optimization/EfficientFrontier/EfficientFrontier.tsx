import React, { useMemo } from 'react';
import { ScatterChart } from '../../../components/charts/ScatterChart/ScatterChart';
import { Card } from '../../../components/common/Card/Card';
import { COLORS } from '../../../constants/colors';

export interface EfficientFrontierPoint {
  risk: number;
  return: number;
  sharpe?: number;
  weights?: Record<string, number>;
}

export interface PortfolioPoint {
  risk: number;
  return: number;
  name: string;
  isSelected?: boolean;
}

interface EfficientFrontierProps {
  efficientFrontierPoints: EfficientFrontierPoint[];
  currentPortfolio?: PortfolioPoint;
  optimizedPortfolio?: PortfolioPoint;
  minimumVariancePortfolio?: PortfolioPoint;
  maximumSharpePortfolio?: PortfolioPoint;
  onPointClick?: (point: EfficientFrontierPoint) => void;
  height?: number;
  className?: string;
  isLoading?: boolean;
}

const EfficientFrontier: React.FC<EfficientFrontierProps> = ({
  efficientFrontierPoints,
  currentPortfolio,
  optimizedPortfolio,
  minimumVariancePortfolio,
  maximumSharpePortfolio,
  onPointClick,
  height = 500,
  className = '',
  isLoading = false
}) => {
  // Prepare data for the scatter chart
  const chartData = useMemo(() => {
    const efData = efficientFrontierPoints.map((point, index) => ({
      x: point.risk * 100, // Convert to percentage
      y: point.return * 100, // Convert to percentage
      id: `ef-${index}`,
      category: 'efficient-frontier',
      size: 4,
      originalPoint: point
    }));

    const portfolioPoints = [];

    if (currentPortfolio) {
      portfolioPoints.push({
        x: currentPortfolio.risk * 100,
        y: currentPortfolio.return * 100,
        id: 'current-portfolio',
        category: 'current-portfolio',
        name: currentPortfolio.name || 'Current Portfolio',
        size: 10,
        symbol: 'circle'
      });
    }

    if (optimizedPortfolio) {
      portfolioPoints.push({
        x: optimizedPortfolio.risk * 100,
        y: optimizedPortfolio.return * 100,
        id: 'optimized-portfolio',
        category: 'optimized-portfolio',
        name: optimizedPortfolio.name || 'Optimized Portfolio',
        size: 10,
        symbol: 'star'
      });
    }

    if (minimumVariancePortfolio) {
      portfolioPoints.push({
        x: minimumVariancePortfolio.risk * 100,
        y: minimumVariancePortfolio.return * 100,
        id: 'min-variance-portfolio',
        category: 'min-variance-portfolio',
        name: minimumVariancePortfolio.name || 'Minimum Variance',
        size: 10,
        symbol: 'triangle'
      });
    }

    if (maximumSharpePortfolio) {
      portfolioPoints.push({
        x: maximumSharpePortfolio.risk * 100,
        y: maximumSharpePortfolio.return * 100,
        id: 'max-sharpe-portfolio',
        category: 'max-sharpe-portfolio',
        name: maximumSharpePortfolio.name || 'Maximum Sharpe',
        size: 10,
        symbol: 'diamond'
      });
    }

    return [...efData, ...portfolioPoints];
  }, [
    efficientFrontierPoints,
    currentPortfolio,
    optimizedPortfolio,
    minimumVariancePortfolio,
    maximumSharpePortfolio
  ]);

  // Define series for the chart
  const series = [
    {
      key: 'efficient-frontier',
      name: 'Efficient Frontier',
      color: COLORS.ACCENT,
      showLine: true,
      tooltip: false
    },
    {
      key: 'current-portfolio',
      name: 'Current Portfolio',
      color: 'red',
      showLine: false
    },
    {
      key: 'optimized-portfolio',
      name: 'Optimized Portfolio',
      color: 'green',
      showLine: false
    },
    {
      key: 'min-variance-portfolio',
      name: 'Minimum Variance',
      color: 'purple',
      showLine: false
    },
    {
      key: 'max-sharpe-portfolio',
      name: 'Maximum Sharpe',
      color: 'gold',
      showLine: false
    }
  ];

  // Handler for point click events
  const handlePointClick = (point: any) => {
    if (onPointClick && point.originalPoint) {
      onPointClick(point.originalPoint);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  // No data state
  if (efficientFrontierPoints.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No efficient frontier data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Efficient Frontier</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          The efficient frontier represents the set of optimal portfolios that offer the highest expected return for a defined level of risk.
        </p>
      </div>

      <ScatterChart
        data={chartData}
        series={series}
        height={height}
        xAxisLabel="Risk (%)"
        yAxisLabel="Return (%)"
        showLegend={true}
        showGrid={true}
        onPointClick={handlePointClick}
      />

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {currentPortfolio && (
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm">Current Portfolio</span>
          </div>
        )}

        {optimizedPortfolio && (
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm">Optimized Portfolio</span>
          </div>
        )}

        {minimumVariancePortfolio && (
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
            <span className="text-sm">Minimum Variance</span>
          </div>
        )}

        {maximumSharpePortfolio && (
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-sm">Maximum Sharpe</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click on any point of the efficient frontier to see details for that portfolio allocation.
        </p>
      </div>
    </Card>
  );
};

export default EfficientFrontier;