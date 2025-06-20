/**
 * Dashboard Page
 * Main dashboard with portfolio overview and key metrics
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { PortfolioCard } from '../../components/portfolio/PortfolioCard/PortfolioCard';
import { MetricsCard } from '../../components/analytics/MetricsCard/MetricsCard';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { PerformancePanel } from '../../components/analytics/PerformancePanel/PerformancePanel';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  selectPortfolios,
  selectPortfoliosLoading,
  selectSelectedPortfolioId
} from '../../store/portfolio/selectors';
import {
  selectPerformanceMetrics,
  selectCumulativeReturns
} from '../../store/analytics/selectors';
import { setSelectedPortfolio } from '../../store/portfolio/reducer';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hooks
  const portfolios = usePortfolios();
  const analytics = useAnalytics();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const selectedPortfolioId = useSelector(selectSelectedPortfolioId);
  const performanceMetrics = useSelector(selectPerformanceMetrics);
  const cumulativeReturns = useSelector(selectCumulativeReturns);

  // Local state
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [showWelcome, setShowWelcome] = useState(true);

  // Load portfolios on mount
  useEffect(() => {
    portfolios.loadPortfolios();
  }, []);

  // Auto-select first portfolio if none selected
  useEffect(() => {
    if (portfoliosList.length > 0 && !selectedPortfolioId) {
      dispatch(setSelectedPortfolio(portfoliosList[0].id));
    }
  }, [portfoliosList, selectedPortfolioId, dispatch]);

  // Load analytics for selected portfolio
  useEffect(() => {
    if (selectedPortfolioId) {
      const { startDate, endDate } = analytics.getDefaultDateRange(selectedTimeframe);
      analytics.calculatePerformanceMetrics({
        portfolioId: selectedPortfolioId,
        startDate,
        endDate,
      });
    }
  }, [selectedPortfolioId, selectedTimeframe, analytics]);

  const handleCreatePortfolio = () => {
    navigate(ROUTES.PORTFOLIO.CREATE);
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    dispatch(setSelectedPortfolio(portfolioId));
  };

  const handlePortfolioAnalyze = (portfolioId: string) => {
    navigate(ROUTES.PORTFOLIO.ANALYSIS.replace(':id', portfolioId));
  };

  const handleOptimizePortfolio = (portfolioId: string) => {
    navigate(ROUTES.OPTIMIZATION.ROOT.replace(':id', portfolioId));
  };

  const handleViewAllPortfolios = () => {
    navigate(ROUTES.PORTFOLIO.LIST);
  };

  const selectedPortfolio = portfoliosList.find(p => p.id === selectedPortfolioId);

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

  // Quick actions data
  const quickActions = [
    {
      title: 'Create Portfolio',
      description: 'Build a new investment portfolio',
      icon: 'plus',
      onClick: handleCreatePortfolio,
      variant: 'primary' as const,
    },
    {
      title: 'Analyze Performance',
      description: 'Deep dive into portfolio analytics',
      icon: 'analytics',
      onClick: () => selectedPortfolioId && handlePortfolioAnalyze(selectedPortfolioId),
      disabled: !selectedPortfolioId,
    },
    {
      title: 'Optimize Portfolio',
      description: 'Find optimal asset allocation',
      icon: 'optimization',
      onClick: () => selectedPortfolioId && handleOptimizePortfolio(selectedPortfolioId),
      disabled: !selectedPortfolioId,
    },
    {
      title: 'Risk Analysis',
      description: 'Assess portfolio risk metrics',
      icon: 'risk',
      onClick: () => navigate(ROUTES.RISK.ROOT),
    },
  ];

  // Market summary data (placeholder - would come from API)
  const marketSummary = [
    { name: 'S&P 500', value: 4456.67, change: 1.23, changePercent: 0.028 },
    { name: 'NASDAQ', value: 13845.12, change: -23.45, changePercent: -0.17 },
    { name: 'Dow Jones', value: 34789.45, change: 156.78, changePercent: 0.45 },
    { name: 'VIX', value: 18.45, change: -0.67, changePercent: -3.5 },
  ];

  if (portfoliosLoading) {
    return (
      <PageContainer>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Portfolio Dashboard</h1>
            <div className={styles.headerActions}>
              <Select
                value={selectedTimeframe}
                onChange={setSelectedTimeframe}
                options={timeframeOptions}
                className={styles.timeframeSelect}
              />
              <Button onClick={handleCreatePortfolio} variant="primary">
                Create Portfolio
              </Button>
            </div>
          </div>
        </div>

        {/* Welcome message for new users */}
        {showWelcome && portfoliosList.length === 0 && (
          <Card className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <h2>Welcome to Portfolio Management</h2>
              <p>
                Get started by creating your first investment portfolio.
                Analyze performance, optimize allocations, and manage risk with our comprehensive tools.
              </p>
              <div className={styles.welcomeActions}>
                <Button onClick={handleCreatePortfolio} variant="primary" size="large">
                  Create Your First Portfolio
                </Button>
                <Button
                  onClick={() => setShowWelcome(false)}
                  variant="secondary"
                  size="large"
                >
                  Explore Demo
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main content */}
        <div className={styles.content}>
          {/* Left column */}
          <div className={styles.leftColumn}>
            {/* Portfolios section */}
            <Card className={styles.portfoliosCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Your Portfolios</h2>
                <Button onClick={handleViewAllPortfolios} variant="ghost" size="small">
                  View All
                </Button>
              </div>

              {portfoliosList.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <p>No portfolios yet</p>
                  <Button onClick={handleCreatePortfolio} variant="primary" size="small">
                    Create Portfolio
                  </Button>
                </div>
              ) : (
                <div className={styles.portfoliosList}>
                  {portfoliosList.slice(0, 3).map((portfolio) => (
                    <PortfolioCard
                      key={portfolio.id}
                      portfolio={portfolio}
                      selected={portfolio.id === selectedPortfolioId}
                      onSelect={() => handlePortfolioSelect(portfolio.id)}
                      onAnalyze={() => handlePortfolioAnalyze(portfolio.id)}
                      compact
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Quick actions */}
            <Card className={styles.actionsCard}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={styles.actionButton}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    <div className={styles.actionIcon}>
                      {action.icon === 'plus' && '➕'}
                      {action.icon === 'analytics' && '📊'}
                      {action.icon === 'optimization' && '⚡'}
                      {action.icon === 'risk' && '🛡️'}
                    </div>
                    <div className={styles.actionContent}>
                      <h3 className={styles.actionTitle}>{action.title}</h3>
                      <p className={styles.actionDescription}>{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className={styles.rightColumn}>
            {/* Performance overview */}
            {selectedPortfolio && (
              <Card className={styles.performanceCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    Performance Overview - {selectedPortfolio.name}
                  </h2>
                </div>

                {performanceMetrics ? (
                  <div className={styles.metricsGrid}>
                    <MetricsCard
                      title="Total Return"
                      value={performanceMetrics.totalReturn}
                      type="percentage"
                      trend={performanceMetrics.totalReturn > 0 ? 'up' : 'down'}
                      precision={2}
                    />
                    <MetricsCard
                      title="Annualized Return"
                      value={performanceMetrics.annualizedReturn}
                      type="percentage"
                      trend={performanceMetrics.annualizedReturn > 0 ? 'up' : 'down'}
                      precision={2}
                    />
                    <MetricsCard
                      title="Volatility"
                      value={performanceMetrics.volatility}
                      type="percentage"
                      precision={2}
                    />
                    <MetricsCard
                      title="Sharpe Ratio"
                      value={performanceMetrics.sharpeRatio}
                      type="number"
                      precision={2}
                    />
                  </div>
                ) : (
                  <div className={styles.metricsLoading}>
                    Loading performance metrics...
                  </div>
                )}

                {/* Performance chart */}
                {cumulativeReturns && (
                  <div className={styles.chartContainer}>
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
                      ]}
                      height={300}
                      formatY={(value) => `${value.toFixed(1)}%`}
                    />
                  </div>
                )}
              </Card>
            )}

            {/* Market summary */}
            <Card className={styles.marketCard}>
              <h2 className={styles.cardTitle}>Market Summary</h2>
              <div className={styles.marketGrid}>
                {marketSummary.map((market, index) => (
                  <div key={index} className={styles.marketItem}>
                    <div className={styles.marketName}>{market.name}</div>
                    <div className={styles.marketValue}>
                      {formatCurrency(market.value)}
                    </div>
                    <div className={`${styles.marketChange} ${
                      market.change >= 0 ? styles.positive : styles.negative
                    }`}>
                      {market.change >= 0 ? '+' : ''}
                      {formatCurrency(market.change)} ({formatPercentage(market.changePercent)})
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;