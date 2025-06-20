/**
 * Portfolio Optimization Page
 * Advanced portfolio optimization with multiple methods and constraints
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { SplitPane } from '../../components/layout/SplitPane/SplitPane';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { Input } from '../../components/common/Input/Input';
import { PortfolioHeader } from '../../components/portfolio/PortfolioHeader/PortfolioHeader';
import { EfficientFrontier } from '../../components/optimization/EfficientFrontier/EfficientFrontier';
import { WeightsTable } from '../../components/optimization/WeightsTable/WeightsTable';
import { OptimizationResults } from '../../components/optimization/OptimizationResults/OptimizationResults';
import { ScatterChart } from '../../components/charts/ScatterChart/ScatterChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useOptimization } from '../../hooks/useOptimization';
import {
  selectPortfolioById,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectCurrentOptimization,
  selectCurrentEfficientFrontier,
  selectIsOptimizing,
  selectOptimizationError,
  selectSelectedMethod
} from '../../store/optimization/selectors';
import {
  setSelectedMethod,
  setConstraints
} from '../../store/optimization/reducer';
import {
  OptimizationMethod,
  OptimizationConstraints,
  OptimizationRequest
} from '../../types/optimization';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './PortfolioOptimization.module.css';

const PortfolioOptimization: React.FC = () => {
  const { id: portfolioId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const optimization = useOptimization();

  // Selectors
  const portfolio = useSelector(selectPortfolioById(portfolioId || ''));
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const currentOptimization = useSelector(selectCurrentOptimization);
  const efficientFrontier = useSelector(selectCurrentEfficientFrontier);
  const isOptimizing = useSelector(selectIsOptimizing);
  const optimizationError = useSelector(selectOptimizationError);
  const selectedMethod = useSelector(selectSelectedMethod);

  // Local state
  const [constraints, setConstraintsState] = useState<OptimizationConstraints>({
    minWeight: 0.0,
    maxWeight: 1.0,
    riskFreeRate: 0.02,
  });
  const [customConstraints, setCustomConstraints] = useState<Record<string, { min: number; max: number }>>({});
  const [optimizationPeriod, setOptimizationPeriod] = useState('1Y');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load portfolio
  useEffect(() => {
    if (portfolioId) {
      portfolios.loadPortfolio(portfolioId);
    }
  }, [portfolioId]);

  // Optimization methods
  const optimizationMethods = optimization.getOptimizationMethods();

  // Period options
  const periodOptions = [
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '3Y', label: '3 Years' },
    { value: '5Y', label: '5 Years' },
  ];

  const handleOptimize = async () => {
    if (!portfolio || !portfolioId) return;

    const request: OptimizationRequest = {
      portfolioId,
      assets: portfolio.assets.map(asset => ({
        symbol: asset.symbol,
        currentWeight: asset.weight / 100,
      })),
      period: optimizationPeriod,
      constraints: {
        ...constraints,
        customConstraints,
      },
      riskFreeRate: constraints.riskFreeRate,
    };

    await optimization.optimizePortfolio(selectedMethod, request);
  };

  const handleCalculateEfficientFrontier = async () => {
    if (!portfolio || !portfolioId) return;

    const request = {
      portfolioId,
      assets: portfolio.assets.map(asset => ({
        symbol: asset.symbol,
        currentWeight: asset.weight / 100,
      })),
      period: optimizationPeriod,
      constraints: {
        ...constraints,
        customConstraints,
      },
      numPoints: 50,
    };

    await optimization.calculateEfficientFrontier(request);
  };

  const handleConstraintChange = (field: keyof OptimizationConstraints, value: number) => {
    const newConstraints = { ...constraints, [field]: value };
    setConstraintsState(newConstraints);
    dispatch(setConstraints(newConstraints));
  };

  const handleCustomConstraintChange = (symbol: string, type: 'min' | 'max', value: number) => {
    setCustomConstraints(prev => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [type]: value,
      },
    }));
  };

  const handleApplyOptimization = () => {
    if (!currentOptimization || !portfolioId) return;

    // Navigate to apply optimization results
    navigate(ROUTES.PORTFOLIO.EDIT.replace(':id', portfolioId), {
      state: { optimizationResult: currentOptimization },
    });
  };

  // Optimization Panel
  const OptimizationPanel = () => (
    <div className={styles.optimizationPanel}>
      <Card className={styles.controlsCard}>
        <h3 className={styles.cardTitle}>Optimization Settings</h3>

        <div className={styles.settingsGrid}>
          <div className={styles.setting}>
            <Select
              label="Optimization Method"
              value={selectedMethod}
              onChange={(value) => dispatch(setSelectedMethod(value as OptimizationMethod))}
              options={optimizationMethods}
            />
          </div>

          <div className={styles.setting}>
            <Select
              label="Time Period"
              value={optimizationPeriod}
              onChange={setOptimizationPeriod}
              options={periodOptions}
            />
          </div>

          <div className={styles.setting}>
            <Input
              label="Risk-Free Rate (%)"
              type="number"
              value={constraints.riskFreeRate * 100}
              onChange={(value) => handleConstraintChange('riskFreeRate', Number(value) / 100)}
              min={0}
              max={10}
              step={0.1}
            />
          </div>

          <div className={styles.setting}>
            <Input
              label="Min Weight (%)"
              type="number"
              value={constraints.minWeight * 100}
              onChange={(value) => handleConstraintChange('minWeight', Number(value) / 100)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>

          <div className={styles.setting}>
            <Input
              label="Max Weight (%)"
              type="number"
              value={constraints.maxWeight * 100}
              onChange={(value) => handleConstraintChange('maxWeight', Number(value) / 100)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
        </div>

        <div className={styles.advancedToggle}>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="small"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>
        </div>

        {showAdvanced && (
          <div className={styles.advancedSettings}>
            <h4 className={styles.sectionTitle}>Asset-Specific Constraints</h4>
            {portfolio?.assets && (
              <div className={styles.assetConstraints}>
                {portfolio.assets.map((asset) => (
                  <div key={asset.symbol} className={styles.assetConstraint}>
                    <span className={styles.assetSymbol}>{asset.symbol}</span>
                    <div className={styles.constraintInputs}>
                      <Input
                        label="Min %"
                        type="number"
                        value={customConstraints[asset.symbol]?.min || 0}
                        onChange={(value) => handleCustomConstraintChange(asset.symbol, 'min', Number(value))}
                        min={0}
                        max={100}
                        step={0.1}
                        size="small"
                      />
                      <Input
                        label="Max %"
                        type="number"
                        value={customConstraints[asset.symbol]?.max || 100}
                        onChange={(value) => handleCustomConstraintChange(asset.symbol, 'max', Number(value))}
                        min={0}
                        max={100}
                        step={0.1}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.optimizationActions}>
          <Button
            onClick={handleOptimize}
            variant="primary"
            loading={isOptimizing}
            disabled={isOptimizing || !portfolio}
            size="large"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Portfolio'}
          </Button>

          <Button
            onClick={handleCalculateEfficientFrontier}
            variant="secondary"
            disabled={isOptimizing || !portfolio}
          >
            Calculate Efficient Frontier
          </Button>
        </div>

        {optimizationError && (
          <div className={styles.error}>
            {optimizationError}
          </div>
        )}
      </Card>

      {/* Method description */}
      <Card className={styles.methodCard}>
        <h3 className={styles.cardTitle}>Method Description</h3>
        <div className={styles.methodDescription}>
          {selectedMethod === 'markowitz' && (
            <div>
              <h4>Markowitz Mean-Variance Optimization</h4>
              <p>
                Classic portfolio optimization that maximizes expected return for a given level of risk,
                or minimizes risk for a given level of expected return. Based on Modern Portfolio Theory.
              </p>
              <ul>
                <li>Considers expected returns and covariances</li>
                <li>Assumes normal distribution of returns</li>
                <li>Requires historical data for estimation</li>
              </ul>
            </div>
          )}

          {selectedMethod === 'risk_parity' && (
            <div>
              <h4>Risk Parity Optimization</h4>
              <p>
                Allocates portfolio weights so that each asset contributes equally to the portfolio's total risk.
                Focuses on risk diversification rather than capital diversification.
              </p>
              <ul>
                <li>Equal risk contribution from each asset</li>
                <li>Less sensitive to expected return estimates</li>
                <li>Tends to be more stable over time</li>
              </ul>
            </div>
          )}

          {selectedMethod === 'minimum_variance' && (
            <div>
              <h4>Minimum Variance Optimization</h4>
              <p>
                Finds the portfolio with the lowest possible variance (risk) regardless of expected returns.
                Conservative approach focused purely on risk minimization.
              </p>
              <ul>
                <li>Minimizes portfolio volatility</li>
                <li>Ignores expected returns</li>
                <li>Good for risk-averse investors</li>
              </ul>
            </div>
          )}

          {selectedMethod === 'maximum_sharpe' && (
            <div>
              <h4>Maximum Sharpe Ratio Optimization</h4>
              <p>
                Maximizes the Sharpe ratio, which measures risk-adjusted returns.
                Finds the portfolio with the best return per unit of risk.
              </p>
              <ul>
                <li>Optimizes risk-adjusted returns</li>
                <li>Considers both return and risk</li>
                <li>Popular for balanced portfolios</li>
              </ul>
            </div>
          )}

          {selectedMethod === 'equal_weight' && (
            <div>
              <h4>Equal Weight Portfolio</h4>
              <p>
                Simple strategy that allocates equal weights to all assets.
                Provides a naive diversification baseline for comparison.
              </p>
              <ul>
                <li>1/N allocation to each asset</li>
                <li>Simple and transparent</li>
                <li>Good benchmark for other strategies</li>
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Results Panel
  const ResultsPanel = () => (
    <div className={styles.resultsPanel}>
      {currentOptimization ? (
        <>
          <OptimizationResults
            result={currentOptimization}
            originalPortfolio={portfolio}
            onApply={handleApplyOptimization}
          />

          <Card className={styles.weightsCard}>
            <h3 className={styles.cardTitle}>Optimized Weights</h3>
            <WeightsTable
              currentWeights={portfolio?.assets || []}
              optimizedWeights={currentOptimization.weights}
              showComparison
            />
          </Card>
        </>
      ) : (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>📊</div>
          <h3>No Optimization Results</h3>
          <p>Run an optimization to see results here</p>
        </div>
      )}
    </div>
  );

  // Efficient Frontier Panel
  const EfficientFrontierPanel = () => (
    <div className={styles.frontierPanel}>
      {efficientFrontier ? (
        <Card className={styles.frontierCard}>
          <h3 className={styles.cardTitle}>Efficient Frontier</h3>
          <EfficientFrontier
            frontierData={efficientFrontier}
            currentPortfolio={portfolio}
            optimizedPortfolio={currentOptimization}
            height={500}
          />
        </Card>
      ) : (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>📈</div>
          <h3>No Efficient Frontier</h3>
          <p>Calculate the efficient frontier to see the risk-return trade-off</p>
        </div>
      )}
    </div>
  );

  if (portfoliosLoading) {
    return (
      <PageContainer>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading portfolio...</p>
        </div>
      </PageContainer>
    );
  }

  if (!portfolio && !portfoliosLoading) {
    return (
      <PageContainer>
        <div className={styles.notFound}>
          <h2>Portfolio Not Found</h2>
          <p>The requested portfolio could not be found.</p>
          <Button onClick={() => navigate(ROUTES.HOME)} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        {portfolio && (
          <PortfolioHeader
            portfolio={portfolio}
            onEdit={() => navigate(ROUTES.PORTFOLIO.EDIT.replace(':id', portfolioId || ''))}
            showOptimizationActions={false}
          />
        )}

        {/* Main content with split panes */}
        <div className={styles.content}>
          <SplitPane
            direction="horizontal"
            defaultSize={400}
            minSize={350}
            maxSize={600}
          >
            {/* Left panel - Optimization controls */}
            <OptimizationPanel />

            {/* Right panel - Results */}
            <SplitPane
              direction="vertical"
              defaultSize="50%"
              minSize={300}
            >
              {/* Top - Results */}
              <ResultsPanel />

              {/* Bottom - Efficient Frontier */}
              <EfficientFrontierPanel />
            </SplitPane>
          </SplitPane>
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioOptimization;