/**
 * Portfolio Comparison Page
 * Side-by-side portfolio analysis and comparison
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { ComparisonDashboard } from '../../components/comparison/ComparisonDashboard/ComparisonDashboard';
import { PortfolioSelector } from '../../components/comparison/PortfolioSelector/PortfolioSelector';
import { ComparisonTable } from '../../components/comparison/ComparisonTable/ComparisonTable';
import { ComparisonChart } from '../../components/comparison/ComparisonChart/ComparisonChart';
import { DifferentialAnalysis } from '../../components/comparison/DifferentialAnalysis/DifferentialAnalysis';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { BarChart } from '../../components/charts/BarChart/BarChart';
import { ScatterChart } from '../../components/charts/ScatterChart/ScatterChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import {
  selectPortfolios,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectComparisonResults,
  selectComparisonLoading,
  selectComparisonError
} from '../../store/comparison/selectors';
import { formatPercentage, formatNumber, formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './PortfolioComparison.module.css';

interface ComparisonTab {
  id: string;
  title: string;
  component: React.ReactNode;
}

const PortfolioComparison: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const comparison = useComparison();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const comparisonResults = useSelector(selectComparisonResults);
  const comparisonLoading = useSelector(selectComparisonLoading);
  const comparisonError = useSelector(selectComparisonError);

  // Local state
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1Y');
  const [benchmark, setBenchmark] = useState('SPY');
  const [comparisonMetrics, setComparisonMetrics] = useState([
    'totalReturn',
    'volatility',
    'sharpeRatio',
    'maxDrawdown',
  ]);

  // Load portfolios
  useEffect(() => {
    portfolios.loadPortfolios();
  }, []);

  // Auto-select first two portfolios
  useEffect(() => {
    if (portfoliosList.length >= 2 && selectedPortfolios.length === 0) {
      setSelectedPortfolios([portfoliosList[0].id, portfoliosList[1].id]);
    }
  }, [portfoliosList, selectedPortfolios]);

  // Load comparison data when selection changes
  useEffect(() => {
    if (selectedPortfolios.length >= 2) {
      const { startDate, endDate } = getDateRange(timeframe);

      comparison.comparePortfolios({
        portfolioIds: selectedPortfolios,
        startDate,
        endDate,
        benchmark,
        metrics: comparisonMetrics,
      });
    }
  }, [selectedPortfolios, timeframe, benchmark, comparisonMetrics]);

  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '6M':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1Y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case '2Y':
        start.setFullYear(start.getFullYear() - 2);
        break;
      case '5Y':
        start.setFullYear(start.getFullYear() - 5);
        break;
      default:
        start.setFullYear(start.getFullYear() - 1);
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  // Options
  const portfolioOptions = portfoliosList.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const timeframeOptions = [
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' },
  ];

  const benchmarkOptions = [
    { value: 'SPY', label: 'S&P 500 (SPY)' },
    { value: 'QQQ', label: 'NASDAQ-100 (QQQ)' },
    { value: 'IWM', label: 'Russell 2000 (IWM)' },
    { value: 'VTI', label: 'Total Stock Market (VTI)' },
    { value: 'VXUS', label: 'International Stocks (VXUS)' },
  ];

  const metricOptions = [
    { value: 'totalReturn', label: 'Total Return' },
    { value: 'annualizedReturn', label: 'Annualized Return' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'sharpeRatio', label: 'Sharpe Ratio' },
    { value: 'sortinoRatio', label: 'Sortino Ratio' },
    { value: 'maxDrawdown', label: 'Max Drawdown' },
    { value: 'beta', label: 'Beta' },
    { value: 'alpha', label: 'Alpha' },
  ];

  const handlePortfolioSelect = (portfolioIds: string[]) => {
    setSelectedPortfolios(portfolioIds);
  };

  const handleAddPortfolio = () => {
    if (selectedPortfolios.length < 5) {
      const availablePortfolios = portfoliosList.filter(
        p => !selectedPortfolios.includes(p.id)
      );
      if (availablePortfolios.length > 0) {
        setSelectedPortfolios([...selectedPortfolios, availablePortfolios[0].id]);
      }
    }
  };

  const handleRemovePortfolio = (portfolioId: string) => {
    setSelectedPortfolios(selectedPortfolios.filter(id => id !== portfolioId));
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className={styles.tabContent}>
      {comparisonResults ? (
        <div className={styles.overviewGrid}>
          {/* Performance Summary */}
          <Card className={styles.summaryCard}>
            <h3 className={styles.cardTitle}>Performance Summary</h3>
            <ComparisonTable
              portfolios={selectedPortfolios.map(id =>
                portfoliosList.find(p => p.id === id)!
              )}
              comparisonData={comparisonResults.performanceComparison}
              metrics={comparisonMetrics}
              timeframe={timeframe}
            />
          </Card>

          {/* Performance Chart */}
          <Card className={styles.chartCard}>
            <h3 className={styles.cardTitle}>Cumulative Returns Comparison</h3>
            {comparisonResults.performanceChart && (
              <LineChart
                data={comparisonResults.performanceChart}
                xAxisKey="date"
                lines={selectedPortfolios.map((id, index) => {
                  const portfolio = portfoliosList.find(p => p.id === id);
                  return {
                    key: id,
                    name: portfolio?.name || `Portfolio ${index + 1}`,
                    color: getPortfolioColor(index),
                  };
                })}
                height={350}
                formatY={(value) => `${value.toFixed(1)}%`}
              />
            )}
          </Card>

          {/* Risk-Return Scatter */}
          <Card className={styles.scatterCard}>
            <h3 className={styles.cardTitle}>Risk-Return Analysis</h3>
            {comparisonResults.riskReturnData && (
              <ScatterChart
                data={comparisonResults.riskReturnData.map((point, index) => ({
                  ...point,
                  color: getPortfolioColor(index),
                  name: portfoliosList.find(p => p.id === selectedPortfolios[index])?.name || `Portfolio ${index + 1}`,
                }))}
                xAxisKey="risk"
                yAxisKey="return"
                height={300}
                xAxisLabel="Risk (Volatility %)"
                yAxisLabel="Return %"
                formatX={(value) => `${value.toFixed(1)}%`}
                formatY={(value) => `${value.toFixed(1)}%`}
              />
            )}
          </Card>

          {/* Key Insights */}
          <Card className={styles.insightsCard}>
            <h3 className={styles.cardTitle}>Key Insights</h3>
            {comparisonResults.insights && (
              <div className={styles.insightsList}>
                {comparisonResults.insights.map((insight, index) => (
                  <div key={index} className={styles.insight}>
                    <div className={styles.insightIcon}>💡</div>
                    <div className={styles.insightText}>{insight}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className={styles.noComparison}>
          <div className={styles.noComparisonIcon}>⚖️</div>
          <h3>No Comparison Data</h3>
          <p>Select at least two portfolios to compare</p>
        </div>
      )}
    </div>
  );

  // Performance Tab
  const PerformanceTab = () => (
    <div className={styles.tabContent}>
      {comparisonResults && (
        <ComparisonDashboard
          portfolios={selectedPortfolios.map(id =>
            portfoliosList.find(p => p.id === id)!
          )}
          comparisonData={comparisonResults}
          timeframe={timeframe}
        />
      )}
    </div>
  );

  // Differential Analysis Tab
  const DifferentialTab = () => (
    <div className={styles.tabContent}>
      {comparisonResults && selectedPortfolios.length === 2 ? (
        <DifferentialAnalysis
          portfolio1={portfoliosList.find(p => p.id === selectedPortfolios[0])!}
          portfolio2={portfoliosList.find(p => p.id === selectedPortfolios[1])!}
          differentialData={comparisonResults.differentialAnalysis}
        />
      ) : (
        <div className={styles.noDifferential}>
          <div className={styles.noDifferentialIcon}>📊</div>
          <h3>Differential Analysis</h3>
          <p>Select exactly two portfolios for differential analysis</p>
        </div>
      )}
    </div>
  );

  const getPortfolioColor = (index: number) => {
    const colors = [
      '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'
    ];
    return colors[index % colors.length];
  };

  const tabs: ComparisonTab[] = [
    { id: 'overview', title: 'Overview', component: <OverviewTab /> },
    { id: 'performance', title: 'Performance', component: <PerformanceTab /> },
    { id: 'differential', title: 'Differential', component: <DifferentialTab /> },
  ];

  if (portfoliosLoading) {
    return (
      <PageContainer>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading portfolios...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Portfolio Comparison</h1>
          <p className={styles.subtitle}>
            Compare performance, risk, and characteristics across multiple portfolios
          </p>
        </div>

        {/* Controls */}
        <Card className={styles.controlsCard}>
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <div className={styles.portfolioSelection}>
                <label className={styles.controlLabel}>Selected Portfolios ({selectedPortfolios.length})</label>
                <PortfolioSelector
                  portfolios={portfoliosList}
                  selectedIds={selectedPortfolios}
                  onSelectionChange={handlePortfolioSelect}
                  maxSelection={5}
                />
              </div>

              <Select
                label="Timeframe"
                value={timeframe}
                onChange={setTimeframe}
                options={timeframeOptions}
                size="small"
              />

              <Select
                label="Benchmark"
                value={benchmark}
                onChange={setBenchmark}
                options={benchmarkOptions}
                size="small"
              />
            </div>

            <div className={styles.controlsRight}>
              <Button
                onClick={() => navigate(ROUTES.OPTIMIZATION.ROOT)}
                variant="secondary"
                disabled={selectedPortfolios.length === 0}
              >
                Optimize Selected
              </Button>
              <Button
                onClick={() => navigate(ROUTES.REPORTS.GENERATE)}
                variant="primary"
                disabled={selectedPortfolios.length < 2}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Portfolio Cards */}
        {selectedPortfolios.length > 0 && (
          <Card className={styles.portfolioCardsContainer}>
            <div className={styles.portfolioCards}>
              {selectedPortfolios.map((portfolioId, index) => {
                const portfolio = portfoliosList.find(p => p.id === portfolioId);
                return (
                  <div key={portfolioId} className={styles.portfolioCard}>
                    <div
                      className={styles.portfolioColorBar}
                      style={{ backgroundColor: getPortfolioColor(index) }}
                    />
                    <div className={styles.portfolioInfo}>
                      <h4 className={styles.portfolioName}>{portfolio?.name}</h4>
                      <p className={styles.portfolioDescription}>
                        {portfolio?.description}
                      </p>
                      <div className={styles.portfolioMetrics}>
                        <span>Assets: {portfolio?.assets?.length || 0}</span>
                        <span>Value: {formatCurrency(portfolio?.totalValue || 0)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemovePortfolio(portfolioId)}
                      variant="ghost"
                      size="small"
                      className={styles.removeButton}
                    >
                      ✕
                    </Button>
                  </div>
                );
              })}

              {selectedPortfolios.length < 5 && (
                <button
                  className={styles.addPortfolioCard}
                  onClick={handleAddPortfolio}
                >
                  <div className={styles.addIcon}>+</div>
                  <span>Add Portfolio</span>
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Card className={styles.tabsCard}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className={styles.content}>
          {comparisonLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Comparing portfolios...</p>
            </div>
          ) : comparisonError ? (
            <div className={styles.error}>
              <h3>Comparison Error</h3>
              <p>{comparisonError}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Retry
              </Button>
            </div>
          ) : (
            tabs.find(tab => tab.id === activeTab)?.component
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioComparison;