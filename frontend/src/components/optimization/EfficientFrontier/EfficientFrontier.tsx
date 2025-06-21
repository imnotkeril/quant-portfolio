/**
 * EfficientFrontier Component
 * Interactive visualization of the efficient frontier with key portfolio points
 */
import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { COLORS } from '../../../constants/colors';
import { EfficientFrontierResponse, EfficientFrontierPoint } from '../../../types/optimization';
import { formatPercentage } from '../../../utils/formatters';
import styles from './EfficientFrontier.module.css';

interface EfficientFrontierProps {
  data: EfficientFrontierResponse | null;
  currentPortfolio?: {
    risk: number;
    return: number;
    weights?: Record<string, number>;
  };
  onPointClick?: (point: EfficientFrontierPoint) => void;
  onPortfolioSelect?: (portfolio: any) => void;
  loading?: boolean;
  className?: string;
}

interface PortfolioPoint {
  name: string;
  risk: number;
  return: number;
  sharpe: number;
  weights?: Record<string, number>;
  color: string;
}

export const EfficientFrontier: React.FC<EfficientFrontierProps> = ({
  data,
  currentPortfolio,
  onPointClick,
  onPortfolioSelect,
  loading = false,
  className,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<EfficientFrontierPoint | null>(null);
  const [showWeights, setShowWeights] = useState(false);

  // Transform data for scatter chart
  const chartData = useMemo(() => {
    if (!data) return [];

    return data.efficientFrontier.map((point, index) => ({
      risk: point.risk * 100, // Convert to percentage
      return: point.return * 100, // Convert to percentage
      sharpe: point.sharpe || 0,
      weights: point.weights,
      index,
    }));
  }, [data]);

  // Key portfolio points
  const keyPortfolios = useMemo((): PortfolioPoint[] => {
    if (!data) return [];

    const portfolios: PortfolioPoint[] = [];

    // Minimum variance portfolio
    if (data.minVariancePortfolio) {
      portfolios.push({
        name: 'Min Variance',
        risk: data.minVariancePortfolio.expectedRisk * 100,
        return: data.minVariancePortfolio.expectedReturn * 100,
        sharpe: data.minVariancePortfolio.sharpeRatio || 0,
        weights: data.minVariancePortfolio.weights,
        color: COLORS.NEUTRAL_1,
      });
    }

    // Maximum Sharpe portfolio
    if (data.maxSharpePortfolio) {
      portfolios.push({
        name: 'Max Sharpe',
        risk: data.maxSharpePortfolio.expectedRisk * 100,
        return: data.maxSharpePortfolio.expectedReturn * 100,
        sharpe: data.maxSharpePortfolio.sharpeRatio || 0,
        weights: data.maxSharpePortfolio.weights,
        color: COLORS.POSITIVE,
      });
    }

    // Maximum return portfolio
    if (data.maxReturnPortfolio) {
      portfolios.push({
        name: 'Max Return',
        risk: data.maxReturnPortfolio.expectedRisk * 100,
        return: data.maxReturnPortfolio.expectedReturn * 100,
        sharpe: data.maxReturnPortfolio.sharpeRatio || 0,
        weights: data.maxReturnPortfolio.weights,
        color: COLORS.NEUTRAL_2,
      });
    }

    // Equal weight portfolio
    if (data.equalWeightPortfolio) {
      portfolios.push({
        name: 'Equal Weight',
        risk: data.equalWeightPortfolio.expectedRisk * 100,
        return: data.equalWeightPortfolio.expectedReturn * 100,
        sharpe: data.equalWeightPortfolio.sharpeRatio || 0,
        weights: data.equalWeightPortfolio.weights,
        color: COLORS.NEUTRAL_GRAY,
      });
    }

    // Current portfolio
    if (currentPortfolio) {
      portfolios.push({
        name: 'Current',
        risk: currentPortfolio.risk * 100,
        return: currentPortfolio.return * 100,
        sharpe: currentPortfolio.return / currentPortfolio.risk || 0,
        weights: currentPortfolio.weights,
        color: COLORS.NEGATIVE,
      });
    }

    return portfolios;
  }, [data, currentPortfolio]);

  // Handle point click on efficient frontier
  const handlePointClick = (event: any) => {
    if (event && event.activePayload && event.activePayload[0]) {
      const point = event.activePayload[0].payload;
      const frontierPoint: EfficientFrontierPoint = {
        risk: point.risk / 100,
        return: point.return / 100,
        sharpe: point.sharpe,
        weights: point.weights,
      };

      setSelectedPoint(frontierPoint);
      onPointClick?.(frontierPoint);
    }
  };

  // Handle key portfolio selection
  const handleKeyPortfolioClick = (portfolio: PortfolioPoint) => {
    const selectedPoint: EfficientFrontierPoint = {
      risk: portfolio.risk / 100,
      return: portfolio.return / 100,
      sharpe: portfolio.sharpe,
      weights: portfolio.weights,
    };

    setSelectedPoint(selectedPoint);
    onPortfolioSelect?.(portfolio);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTitle}>Portfolio Point</p>
          <p><strong>Risk:</strong> {formatPercentage(data.risk / 100, 2)}</p>
          <p><strong>Return:</strong> {formatPercentage(data.return / 100, 2)}</p>
          <p><strong>Sharpe:</strong> {data.sharpe.toFixed(3)}</p>
          <p className={styles.tooltipHint}>Click to view weights</p>
        </div>
      );
    }
    return null;
  };

  // Render weights table
  const renderWeightsTable = () => {
    if (!selectedPoint || !selectedPoint.weights) return null;

    const weights = Object.entries(selectedPoint.weights)
      .sort(([, a], [, b]) => b - a)
      .map(([ticker, weight]) => ({ ticker, weight }));

    return (
      <div className={styles.weightsTable}>
        <h4>Portfolio Weights</h4>
        <div className={styles.weightsGrid}>
          {weights.map(({ ticker, weight }) => (
            <div key={ticker} className={styles.weightRow}>
              <span className={styles.ticker}>{ticker}</span>
              <span className={styles.weight}>{formatPercentage(weight, 2)}</span>
              <div
                className={styles.weightBar}
                style={{ width: `${weight * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <h3>Efficient Frontier</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>Calculating efficient frontier...</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <h3>Efficient Frontier</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No efficient frontier data available.</p>
          <p>Run portfolio optimization to generate the efficient frontier.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3>Efficient Frontier</h3>
        <div className={styles.headerActions}>
          <Button
            variant={showWeights ? 'primary' : 'outline'}
            size="small"
            onClick={() => setShowWeights(!showWeights)}
            disabled={!selectedPoint}
          >
            {showWeights ? 'Hide Weights' : 'Show Weights'}
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.chartSection}>
          {/* Chart */}
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                onClick={handlePointClick}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.DIVIDER}
                  opacity={0.3}
                />

                <XAxis
                  type="number"
                  dataKey="risk"
                  name="Risk"
                  unit="%"
                  tick={{ fill: COLORS.TEXT_LIGHT, fontSize: 12 }}
                  axisLine={{ stroke: COLORS.DIVIDER }}
                  tickLine={{ stroke: COLORS.DIVIDER }}
                  label={{
                    value: 'Risk (Volatility %)',
                    position: 'insideBottom',
                    offset: -10,
                    style: { textAnchor: 'middle', fill: COLORS.TEXT_LIGHT }
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="return"
                  name="Return"
                  unit="%"
                  tick={{ fill: COLORS.TEXT_LIGHT, fontSize: 12 }}
                  axisLine={{ stroke: COLORS.DIVIDER }}
                  tickLine={{ stroke: COLORS.DIVIDER }}
                  label={{
                    value: 'Expected Return %',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: COLORS.TEXT_LIGHT }
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend />

                {/* Efficient frontier points */}
                <Scatter
                  name="Efficient Frontier"
                  data={chartData}
                  fill={COLORS.ACCENT}
                />

                {/* Key portfolios as separate scatter plots */}
                {keyPortfolios.map((portfolio) => (
                  <Scatter
                    key={portfolio.name}
                    name={portfolio.name}
                    data={[{
                      risk: portfolio.risk,
                      return: portfolio.return,
                      sharpe: portfolio.sharpe,
                      weights: portfolio.weights,
                    }]}
                    fill={portfolio.color}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend for key portfolios */}
          <div className={styles.legendContainer}>
            <h4>Key Portfolios</h4>
            <div className={styles.legendGrid}>
              {keyPortfolios.map((portfolio) => (
                <div
                  key={portfolio.name}
                  className={styles.legendItem}
                  onClick={() => handleKeyPortfolioClick(portfolio)}
                >
                  <div
                    className={styles.legendSymbol}
                    style={{ backgroundColor: portfolio.color }}
                  />
                  <div className={styles.legendInfo}>
                    <span className={styles.legendName}>{portfolio.name}</span>
                    <span className={styles.legendStats}>
                      {formatPercentage(portfolio.return / 100, 1)} / {formatPercentage(portfolio.risk / 100, 1)}
                    </span>
                    <span className={styles.legendSharpe}>
                      Sharpe: {portfolio.sharpe.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weights panel */}
        {showWeights && selectedPoint && (
          <div className={styles.weightsPanel}>
            {renderWeightsTable()}

            <div className={styles.selectedPointInfo}>
              <h4>Selected Point</h4>
              <div className={styles.pointStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Expected Return:</span>
                  <span className={styles.statValue}>
                    {formatPercentage(selectedPoint.return, 2)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Risk (Volatility):</span>
                  <span className={styles.statValue}>
                    {formatPercentage(selectedPoint.risk, 2)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Sharpe Ratio:</span>
                  <span className={styles.statValue}>
                    {selectedPoint.sharpe?.toFixed(3) || 'N/A'}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="small"
                onClick={() => onPortfolioSelect?.({
                  risk: selectedPoint.risk,
                  return: selectedPoint.return,
                  sharpe: selectedPoint.sharpe,
                  weights: selectedPoint.weights,
                })}
                fullWidth
              >
                Use This Portfolio
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};