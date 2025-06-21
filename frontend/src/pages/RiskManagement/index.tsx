/**
 * Risk Management Page
 * Comprehensive risk analysis and management tools
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { Input } from '../../components/common/Input/Input';
import { RiskMetricsPanel } from '../../components/risk/RiskMetricsPanel/RiskMetricsPanel';
import { DrawdownChart } from '../../components/risk/DrawdownChart/DrawdownChart';
import { VaRAnalysis } from '../../components/risk/VaRAnalysis/VaRAnalysis';
import { StressTestPanel } from '../../components/risk/StressTestPanel/StressTestPanel';
import { CorrelationMatrix } from '../../components/risk/CorrelationMatrix/CorrelationMatrix';
import { MonteCarloChart } from '../../components/risk/MonteCarloChart/MonteCarloChart';
import { MetricsTable } from '../../components/analytics/MetricsTable/MetricsTable';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart/HeatmapChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useRisk } from '../../hooks/useRisk';
import {
  selectPortfolios,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectRiskMetrics,
  selectVaRData,
  selectDrawdowns,
  selectCorrelationMatrix,
  selectStressTestResults,
  selectMonteCarloResults,
  selectRiskLoading
} from '../../store/risk/selectors';
import { formatPercentage, formatNumber, formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './RiskManagement.module.css';

interface RiskTab {
  id: string;
  title: string;
  component: React.ReactNode;
}

const RiskManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const risk = useRisk();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const riskMetrics = useSelector(selectRiskMetrics);
  const varData = useSelector(selectVaRData);
  const drawdowns = useSelector(selectDrawdowns);
  const correlationMatrix = useSelector(selectCorrelationMatrix);
  const stressTestResults = useSelector(selectStressTestResults);
  const monteCarloResults = useSelector(selectMonteCarloResults);
  const riskLoading = useSelector(selectRiskLoading);

  // Local state
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [timeframe, setTimeframe] = useState('1Y');
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [activeTab, setActiveTab] = useState('overview');
  const [riskParameters, setRiskParameters] = useState({
    lookbackPeriod: 252,
    monteCarloSimulations: 10000,
    stressScenarios: ['market_crash', 'interest_rate_shock', 'inflation_spike'],
  });

  // Load portfolios on mount
  useEffect(() => {
    portfolios.loadPortfolios();
  }, []);

  // Auto-select first portfolio
  useEffect(() => {
    if (portfoliosList.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfoliosList[0].id);
    }
  }, [portfoliosList, selectedPortfolio]);

  // Load risk data when portfolio or parameters change
  useEffect(() => {
    if (selectedPortfolio) {
      const { startDate, endDate } = getDateRange(timeframe);

      // Load comprehensive risk analysis
      risk.calculateRiskMetrics({
        portfolioId: selectedPortfolio,
        startDate,
        endDate,
        confidenceLevel,
        lookbackPeriod: riskParameters.lookbackPeriod,
      });

      risk.calculateVaR({
        portfolioId: selectedPortfolio,
        confidenceLevel,
        method: 'historical',
        lookbackPeriod: riskParameters.lookbackPeriod,
      });

      risk.calculateStressTest({
        portfolioId: selectedPortfolio,
        scenarios: riskParameters.stressScenarios,
      });

      risk.runMonteCarloSimulation({
        portfolioId: selectedPortfolio,
        simulations: riskParameters.monteCarloSimulations,
        timeHorizon: 252, // 1 year
      });
    }
  }, [selectedPortfolio, timeframe, confidenceLevel, riskParameters]);

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

  const confidenceLevelOptions = [
    { value: 0.90, label: '90%' },
    { value: 0.95, label: '95%' },
    { value: 0.99, label: '99%' },
  ];

  // Overview Tab
  const OverviewTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.overviewGrid}>
        {/* Key risk metrics */}
        <Card className={styles.metricsCard}>
          <h3 className={styles.cardTitle}>Key Risk Metrics</h3>
          {riskMetrics ? (
            <div className={styles.riskMetricsGrid}>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatPercentage(riskMetrics.var95)}
                </div>
                <div className={styles.metricLabel}>VaR (95%)</div>
              </div>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatPercentage(riskMetrics.maxDrawdown)}
                </div>
                <div className={styles.metricLabel}>Max Drawdown</div>
              </div>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatPercentage(riskMetrics.volatility)}
                </div>
                <div className={styles.metricLabel}>Volatility</div>
              </div>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatNumber(riskMetrics.beta, 2)}
                </div>
                <div className={styles.metricLabel}>Beta</div>
              </div>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatNumber(riskMetrics.sharpeRatio, 2)}
                </div>
                <div className={styles.metricLabel}>Sharpe Ratio</div>
              </div>
              <div className={styles.riskMetric}>
                <div className={styles.metricValue}>
                  {formatNumber(riskMetrics.sortinoRatio, 2)}
                </div>
                <div className={styles.metricLabel}>Sortino Ratio</div>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading risk metrics...</div>
          )}
        </Card>

        {/* VaR breakdown */}
        <Card className={styles.varCard}>
          <h3 className={styles.cardTitle}>Value at Risk Analysis</h3>
          {varData ? (
            <VaRAnalysis
              varData={varData}
              confidenceLevel={confidenceLevel}
              portfolioValue={100000} // This should come from portfolio data
            />
          ) : (
            <div className={styles.loading}>Loading VaR data...</div>
          )}
        </Card>

        {/* Drawdown chart */}
        <Card className={styles.drawdownCard}>
          <h3 className={styles.cardTitle}>Drawdown Analysis</h3>
          {drawdowns && drawdowns.length > 0 ? (
            <DrawdownChart
              drawdownData={drawdowns}
              height={300}
            />
          ) : (
            <div className={styles.loading}>Loading drawdown data...</div>
          )}
        </Card>

        {/* Risk summary table */}
        <Card className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Risk Summary</h3>
          {riskMetrics ? (
            <MetricsTable
              metrics={[
                { label: 'Value at Risk (95%)', value: riskMetrics.var95, type: 'percentage' },
                { label: 'Conditional VaR', value: riskMetrics.cvar95, type: 'percentage' },
                { label: 'Maximum Drawdown', value: riskMetrics.maxDrawdown, type: 'percentage' },
                { label: 'Average Drawdown', value: riskMetrics.avgDrawdown, type: 'percentage' },
                { label: 'Volatility (Ann.)', value: riskMetrics.volatility, type: 'percentage' },
                { label: 'Downside Deviation', value: riskMetrics.downsideDeviation, type: 'percentage' },
                { label: 'Beta', value: riskMetrics.beta, type: 'number' },
                { label: 'Tracking Error', value: riskMetrics.trackingError, type: 'percentage' },
              ]}
            />
          ) : (
            <div className={styles.loading}>Loading risk summary...</div>
          )}
        </Card>
      </div>
    </div>
  );

  // VaR Analysis Tab
  const VaRAnalysisTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.varGrid}>
        <Card className={styles.varMainCard}>
          <h3 className={styles.cardTitle}>Value at Risk Analysis</h3>
          <div className={styles.varControls}>
            <Select
              label="Confidence Level"
              value={confidenceLevel}
              onChange={setConfidenceLevel}
              options={confidenceLevelOptions}
              size="small"
            />
            <Input
              label="Lookback Period (days)"
              type="number"
              value={riskParameters.lookbackPeriod}
              onChange={(value) => setRiskParameters(prev => ({
                ...prev,
                lookbackPeriod: Number(value)
              }))}
              min={30}
              max={1000}
              size="small"
            />
          </div>
          {varData ? (
            <VaRAnalysis
              varData={varData}
              confidenceLevel={confidenceLevel}
              portfolioValue={100000}
              showDetails
            />
          ) : (
            <div className={styles.loading}>Loading VaR analysis...</div>
          )}
        </Card>

        <Card className={styles.varHistoryCard}>
          <h3 className={styles.cardTitle}>VaR History</h3>
          {varData?.history && varData.history.length > 0 ? (
            <LineChart
              data={varData.history.map(point => ({
                date: point.date,
                var: point.var * 100,
                actualReturn: point.actualReturn * 100,
              }))}
              xAxisKey="date"
              lines={[
                { key: 'var', name: `VaR (${(confidenceLevel * 100).toFixed(0)}%)`, color: '#dc2626' },
                { key: 'actualReturn', name: 'Actual Return', color: '#2563eb' },
              ]}
              height={350}
              formatY={(value) => `${value.toFixed(2)}%`}
            />
          ) : (
            <div className={styles.loading}>Loading VaR history...</div>
          )}
        </Card>
      </div>
    </div>
  );

  // Stress Testing Tab
  const StressTestingTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.stressTestCard}>
        <h3 className={styles.cardTitle}>Stress Testing</h3>
        {stressTestResults ? (
          <StressTestPanel
            stressTestResults={stressTestResults}
            onRunStressTest={(scenarios) => {
              risk.calculateStressTest({
                portfolioId: selectedPortfolio,
                scenarios,
              });
            }}
          />
        ) : (
          <div className={styles.loading}>Loading stress test results...</div>
        )}
      </Card>
    </div>
  );

  // Correlation Analysis Tab
  const CorrelationAnalysisTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.correlationGrid}>
        <Card className={styles.correlationMatrixCard}>
          <h3 className={styles.cardTitle}>Asset Correlation Matrix</h3>
          {correlationMatrix ? (
            <CorrelationMatrix
              correlationData={correlationMatrix}
              height={400}
            />
          ) : (
            <div className={styles.loading}>Loading correlation matrix...</div>
          )}
        </Card>

        <Card className={styles.correlationInsightsCard}>
          <h3 className={styles.cardTitle}>Correlation Insights</h3>
          {correlationMatrix ? (
            <div className={styles.correlationInsights}>
              <div className={styles.insight}>
                <h4>Highest Correlations</h4>
                <div className={styles.correlationList}>
                  {/* This would be calculated from correlation matrix */}
                  <div className={styles.correlationItem}>
                    <span>AAPL - MSFT</span>
                    <span className={styles.correlationValue}>0.85</span>
                  </div>
                  <div className={styles.correlationItem}>
                    <span>SPY - QQQ</span>
                    <span className={styles.correlationValue}>0.82</span>
                  </div>
                </div>
              </div>

              <div className={styles.insight}>
                <h4>Diversification Opportunities</h4>
                <div className={styles.correlationList}>
                  <div className={styles.correlationItem}>
                    <span>AAPL - GLD</span>
                    <span className={styles.correlationValue}>-0.12</span>
                  </div>
                  <div className={styles.correlationItem}>
                    <span>SPY - TLT</span>
                    <span className={styles.correlationValue}>-0.25</span>
                  </div>
                </div>
              </div>

              <div className={styles.riskWarning}>
                <h4>⚠️ Risk Concentration</h4>
                <p>High correlation between AAPL and MSFT suggests concentration risk in technology sector.</p>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading correlation insights...</div>
          )}
        </Card>
      </div>
    </div>
  );

  // Monte Carlo Tab
  const MonteCarloTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.monteCarloGrid}>
        <Card className={styles.monteCarloControlsCard}>
          <h3 className={styles.cardTitle}>Monte Carlo Simulation</h3>
          <div className={styles.monteCarloControls}>
            <Input
              label="Number of Simulations"
              type="number"
              value={riskParameters.monteCarloSimulations}
              onChange={(value) => setRiskParameters(prev => ({
                ...prev,
                monteCarloSimulations: Number(value)
              }))}
              min={1000}
              max={100000}
              step={1000}
            />
            <Button
              onClick={() => {
                if (selectedPortfolio) {
                  risk.runMonteCarloSimulation({
                    portfolioId: selectedPortfolio,
                    simulations: riskParameters.monteCarloSimulations,
                    timeHorizon: 252,
                  });
                }
              }}
              variant="primary"
              loading={riskLoading}
            >
              Run Simulation
            </Button>
          </div>

          {monteCarloResults ? (
            <div className={styles.monteCarloSummary}>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Expected Return</span>
                <span className={styles.summaryValue}>
                  {formatPercentage(monteCarloResults.expectedReturn)}
                </span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>95% VaR</span>
                <span className={styles.summaryValue}>
                  {formatPercentage(monteCarloResults.var95)}
                </span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Probability of Loss</span>
                <span className={styles.summaryValue}>
                  {formatPercentage(monteCarloResults.probabilityOfLoss)}
                </span>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className={styles.monteCarloChartCard}>
          <h3 className={styles.cardTitle}>Return Distribution</h3>
          {monteCarloResults ? (
            <MonteCarloChart
              monteCarloData={monteCarloResults}
              height={400}
            />
          ) : (
            <div className={styles.loading}>Loading Monte Carlo results...</div>
          )}
        </Card>
      </div>
    </div>
  );

  const tabs: RiskTab[] = [
    { id: 'overview', title: 'Overview', component: <OverviewTab /> },
    { id: 'var', title: 'VaR Analysis', component: <VaRAnalysisTab /> },
    { id: 'stress', title: 'Stress Testing', component: <StressTestingTab /> },
    { id: 'correlation', title: 'Correlation', component: <CorrelationAnalysisTab /> },
    { id: 'montecarlo', title: 'Monte Carlo', component: <MonteCarloTab /> },
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
          <h1 className={styles.title}>Risk Management</h1>
          <p className={styles.subtitle}>
            Comprehensive risk analysis and management tools for your portfolios
          </p>
        </div>

        {/* Controls */}
        <Card className={styles.controlsCard}>
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <Select
                label="Portfolio"
                value={selectedPortfolio}
                onChange={setSelectedPortfolio}
                options={portfolioOptions}
                placeholder="Select portfolio"
              />
              <Select
                label="Timeframe"
                value={timeframe}
                onChange={setTimeframe}
                options={timeframeOptions}
              />
            </div>
            <div className={styles.controlsRight}>
              <Button
                onClick={() => navigate(ROUTES.SCENARIOS.ROOT)}
                variant="secondary"
              >
                Scenario Analysis
              </Button>
              <Button
                onClick={() => navigate(ROUTES.OPTIMIZATION.ROOT.replace(':id', selectedPortfolio))}
                variant="primary"
                disabled={!selectedPortfolio}
              >
                Optimize Portfolio
              </Button>
            </div>
          </div>
        </Card>

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
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </PageContainer>
  );
};

export default RiskManagement;