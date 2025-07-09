/**
 * Portfolio Analysis Page
 * Comprehensive portfolio analysis with multiple panels and metrics
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { SplitPane } from '../../components/layout/SplitPane/SplitPane';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { PortfolioHeader } from '../../components/portfolio/PortfolioHeader/PortfolioHeader';
import { PortfolioSummary } from '../../components/portfolio/PortfolioSummary/PortfolioSummary';
import { PerformancePanel } from '../../components/analytics/PerformancePanel/PerformancePanel';
import { MetricsTable } from '../../components/analytics/MetricsTable/MetricsTable';
import { AssetTable } from '../../components/portfolio/AssetTable/AssetTable';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { PieChart } from '../../components/charts/PieChart/PieChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  selectPortfolioById,
  selectPortfoliosLoading,
  selectCurrentPortfolio
} from '../../store/portfolio/selectors';
import {
  selectPerformanceMetrics,
  selectRiskMetrics,
  selectCumulativeReturns,
  selectDrawdowns,
  selectReturns,
  selectSelectedBenchmark,
  selectSelectedTimeframe
} from '../../store/analytics/selectors';
import { setSelectedBenchmark, setSelectedTimeframe } from '../../store/analytics/reducer';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './PortfolioAnalysis.module.css';

// Простые компоненты для состояний
const LoadingSpinner: React.FC = () => (
  <PageContainer>
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Loading portfolio...</p>
    </div>
  </PageContainer>
);

const PortfolioNotFound: React.FC = () => {
  const navigate = useNavigate();
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
};

const PortfolioSelector: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <div className={styles.selector}>
        <h2>Select Portfolio</h2>
        <p>Please select a portfolio to analyze.</p>
        <Button onClick={() => navigate(ROUTES.PORTFOLIO.LIST)} variant="primary">
          View All Portfolios
        </Button>
      </div>
    </PageContainer>
  );
};

interface AnalysisPanel {
  id: string;
  title: string;
  component: React.ReactNode;
}

const PortfolioAnalysis: React.FC = () => {
  const { id: portfolioId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const analytics = useAnalytics();

  // Selectors
  const currentPortfolio = useSelector(selectCurrentPortfolio);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const performanceMetrics = useSelector(selectPerformanceMetrics);
  const riskMetrics = useSelector(selectRiskMetrics);
  const cumulativeReturns = useSelector(selectCumulativeReturns);
  const drawdowns = useSelector(selectDrawdowns);
  const returns = useSelector(selectReturns);
  const selectedBenchmark = useSelector(selectSelectedBenchmark);
  const selectedTimeframe = useSelector(selectSelectedTimeframe);

  // Local state
  const [activePanel, setActivePanel] = useState('overview');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Load portfolio and analytics data
  useEffect(() => {
    if (portfolios.portfolios.length === 0 && !portfoliosLoading) {
      portfolios.loadPortfolios();
    }
  }, [portfolios.portfolios.length, portfoliosLoading]);

  useEffect(() => {
    if (portfolioId) {
      portfolios.loadPortfolio(portfolioId);
    }
  }, [portfolioId, portfolios]);

  useEffect(() => {
    if (portfolioId) {
      const { startDate, endDate } = analytics.getDefaultDateRange(selectedTimeframe);

      // Load all analytics data
      analytics.calculatePerformanceMetrics({
        portfolioId,
        startDate,
        endDate,
        benchmark: selectedBenchmark || undefined,
      });

      analytics.calculateRiskMetrics({
        portfolioId,
        startDate,
        endDate,
        confidenceLevel: 0.95,
      });

      analytics.loadCumulativeReturns({
        portfolioId,
        startDate,
        endDate,
        benchmark: selectedBenchmark || undefined,
      });

      analytics.loadDrawdowns({
        portfolioId,
        startDate,
        endDate,
      });
    }
  }, [portfolioId, selectedTimeframe, selectedBenchmark, analytics]);

  // Handle navigation
  const handleOptimize = () => {
    if (portfolioId) {
      navigate(ROUTES.OPTIMIZATION.ROOT.replace(':id', portfolioId));
    }
  };

  const handleRiskAnalysis = () => {
    navigate(ROUTES.RISK.ROOT);
  };

  const handleComparison = () => {
    navigate(ROUTES.COMPARISON.ROOT);
  };

  const handleEdit = () => {
    if (portfolioId) {
      navigate(ROUTES.PORTFOLIO.EDIT.replace(':id', portfolioId));
    }
  };

  // Timeframe options
  const timeframeOptions = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' },
    { value: 'ALL', label: 'All Time' },
  ];

  // Benchmark options
  const benchmarkOptions = [
    { value: '', label: 'No Benchmark' },
    { value: 'SPY', label: 'S&P 500 (SPY)' },
    { value: 'QQQ', label: 'NASDAQ-100 (QQQ)' },
    { value: 'IWM', label: 'Russell 2000 (IWM)' },
    { value: 'VTI', label: 'Total Stock Market (VTI)' },
    { value: 'VXUS', label: 'International Stocks (VXUS)' },
    { value: 'BND', label: 'Total Bond Market (BND)' },
  ];

  // Проверки состояния ПОСЛЕ всех хуков
  if (!portfolioId) {
    return <PortfolioSelector />;
  }

  if (portfoliosLoading) {
    return <LoadingSpinner />;
  }

  if (!currentPortfolio && !portfoliosLoading) {
    return <PortfolioNotFound />;
  }

  // Overview Panel
  const OverviewPanel = () => (
    <div className={styles.panelContent}>
      <div className={styles.overviewGrid}>
        {/* Performance summary */}
        <Card className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Performance Summary</h3>
          {performanceMetrics ? (
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Total Return</span>
                <span className={`${styles.metricValue} ${
                  performanceMetrics.totalReturn >= 0 ? styles.positive : styles.negative
                }`}>
                  {formatPercentage(performanceMetrics.totalReturn)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Annualized Return</span>
                <span className={`${styles.metricValue} ${
                  performanceMetrics.annualizedReturn >= 0 ? styles.positive : styles.negative
                }`}>
                  {formatPercentage(performanceMetrics.annualizedReturn)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Volatility</span>
                <span className={styles.metricValue}>
                  {formatPercentage(performanceMetrics.volatility)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Sharpe Ratio</span>
                <span className={styles.metricValue}>
                  {formatNumber(performanceMetrics.sharpeRatio, 2)}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading performance data...</div>
          )}
        </Card>

        {/* Risk summary */}
        <Card className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Risk Summary</h3>
          {riskMetrics ? (
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>VaR (95%)</span>
                <span className={styles.metricValue}>
                  {formatPercentage(riskMetrics.var95)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Max Drawdown</span>
                <span className={styles.metricValue}>
                  {formatPercentage(riskMetrics.maxDrawdown)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Beta</span>
                <span className={styles.metricValue}>
                  {formatNumber(riskMetrics.beta, 2)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Tracking Error</span>
                <span className={styles.metricValue}>
                  {formatPercentage(riskMetrics.trackingError)}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading risk data...</div>
          )}
        </Card>

        {/* Portfolio composition */}
        <Card className={styles.compositionCard}>
          <h3 className={styles.cardTitle}>Portfolio Composition</h3>
          {currentPortfolio?.assets && currentPortfolio.assets.length > 0 ? (
            <PieChart
              data={currentPortfolio.assets.map(asset => ({
                name: asset.symbol,
                value: asset.weight,
                fullName: asset.name,
              }))}
              height={300}
              showLegend
              showLabels
            />
          ) : (
            <div className={styles.emptyState}>No assets data available</div>
          )}
        </Card>

        {/* Performance chart */}
        <Card className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Cumulative Returns</h3>
          {cumulativeReturns && cumulativeReturns.length > 0 ? (
            <LineChart
              data={cumulativeReturns.map(point => ({
                date: point.date,
                portfolio: point.cumulativeReturn * 100,
                benchmark: point.benchmarkCumulativeReturn ?
                  point.benchmarkCumulativeReturn * 100 : undefined,
              }))}
              xAxisKey="date"
              lines={[
                { key: 'portfolio', name: 'Portfolio', color: '#2563eb' },
                { key: 'benchmark', name: 'Benchmark', color: '#64748b' },
              ].filter(line => line.key === 'portfolio' || selectedBenchmark)}
              height={350}
              formatY={(value) => `${value.toFixed(1)}%`}
            />
          ) : (
            <div className={styles.loading}>Loading performance chart...</div>
          )}
        </Card>
      </div>
    </div>
  );

  // Performance Panel
  const PerformancePanelTab = () => (
    <div className={styles.panelContent}>
      <PerformancePanel
        portfolioId={portfolioId || ''}
        showAdvancedMetrics
        showChart
      />
    </div>
  );

  // Holdings Panel
  const HoldingsPanel = () => (
    <div className={styles.panelContent}>
      <Card>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Portfolio Holdings</h3>
          <Button onClick={handleEdit} variant="secondary" size="small">
            Edit Portfolio
          </Button>
        </div>
        {currentPortfolio?.assets && currentPortfolio.assets.length > 0 ? (
          <AssetTable
            assets={currentPortfolio.assets}
            showPerformance
            showMetrics
          />
        ) : (
          <div className={styles.emptyState}>
            <p>No holdings data available</p>
          </div>
        )}
      </Card>
    </div>
  );

  // Risk Panel
  const RiskPanel = () => (
    <div className={styles.panelContent}>
      <div className={styles.riskGrid}>
        {/* Risk metrics table */}
        <Card>
          <h3 className={styles.cardTitle}>Risk Metrics</h3>
          {riskMetrics ? (
            <MetricsTable
              metrics={[
                { label: 'Value at Risk (95%)', value: riskMetrics.var95, type: 'percentage' },
                { label: 'Conditional VaR (95%)', value: riskMetrics.cvar95, type: 'percentage' },
                { label: 'Maximum Drawdown', value: riskMetrics.maxDrawdown, type: 'percentage' },
                { label: 'Beta', value: riskMetrics.beta, type: 'number' },
                { label: 'Alpha', value: riskMetrics.alpha, type: 'percentage' },
                { label: 'Tracking Error', value: riskMetrics.trackingError, type: 'percentage' },
                { label: 'Information Ratio', value: riskMetrics.informationRatio, type: 'number' },
                { label: 'Sortino Ratio', value: riskMetrics.sortinoRatio, type: 'number' },
              ]}
            />
          ) : (
            <div className={styles.loading}>Loading risk metrics...</div>
          )}
        </Card>

        {/* Drawdown chart */}
        <Card>
          <h3 className={styles.cardTitle}>Drawdown Analysis</h3>
          {drawdowns && drawdowns.length > 0 ? (
            <LineChart
              data={drawdowns.map(point => ({
                date: point.date,
                drawdown: point.drawdown * 100,
              }))}
              xAxisKey="date"
              lines={[
                { key: 'drawdown', name: 'Drawdown', color: '#dc2626' },
              ]}
              height={300}
              formatY={(value) => `${value.toFixed(1)}%`}
              fillArea
            />
          ) : (
            <div className={styles.loading}>Loading drawdown data...</div>
          )}
        </Card>
      </div>
    </div>
  );

  const panels: AnalysisPanel[] = [
    {
      id: 'overview',
      title: 'Overview',
      component: <OverviewPanel />,
    },
    {
      id: 'performance',
      title: 'Performance',
      component: <PerformancePanelTab />,
    },
    {
      id: 'holdings',
      title: 'Holdings',
      component: <HoldingsPanel />,
    },
    {
      id: 'risk',
      title: 'Risk',
      component: <RiskPanel />,
    },
  ];

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        {currentPortfolio && (
          <PortfolioHeader
            portfolio={currentPortfolio}
            onOptimize={handleOptimize}
            onRiskAnalysis={handleRiskAnalysis}
            onComparison={handleComparison}
            onEdit={handleEdit}
          />
        )}

        {/* Controls */}
        <Card className={styles.controlsCard}>
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <Select
                label="Timeframe"
                value={selectedTimeframe}
                onChange={(value) => dispatch(setSelectedTimeframe(value))}
                options={timeframeOptions}
                size="small"
              />
              <Select
                label="Benchmark"
                value={selectedBenchmark || ''}
                onChange={(value) => dispatch(setSelectedBenchmark(value || null))}
                options={benchmarkOptions}
                size="small"
              />
            </div>

            <div className={styles.controlsRight}>
              <Button
                onClick={() => setIsFullScreen(!isFullScreen)}
                variant="ghost"
                size="small"
              >
                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tab navigation */}
        <Card className={styles.tabsCard}>
          <div className={styles.tabs}>
            {panels.map((panel) => (
              <button
                key={panel.id}
                className={`${styles.tab} ${activePanel === panel.id ? styles.active : ''}`}
                onClick={() => setActivePanel(panel.id)}
              >
                {panel.title}
              </button>
            ))}
          </div>
        </Card>

        {/* Main content */}
        <div className={`${styles.content} ${isFullScreen ? styles.fullscreen : ''}`}>
          {panels.find(panel => panel.id === activePanel)?.component}
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioAnalysis;