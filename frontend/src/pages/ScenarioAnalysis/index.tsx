/**
 * Scenario Analysis Page
 * Advanced scenario modeling and stress testing
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { Input } from '../../components/common/Input/Input';
import { ScenarioSelector } from '../../components/scenarios/ScenarioSelector/ScenarioSelector';
import { ScenarioImpact } from '../../components/scenarios/ScenarioImpact/ScenarioImpact';
import { ScenarioChain } from '../../components/scenarios/ScenarioChain/ScenarioChain';
import { ScenarioComparison } from '../../components/scenarios/ScenarioComparison/ScenarioComparison';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { BarChart } from '../../components/charts/BarChart/BarChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart/HeatmapChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useScenarios } from '../../hooks/useScenarios';
import {
  selectPortfolios,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectScenarios,
  selectScenarioResults,
  selectScenarioChains,
  selectScenariosLoading
} from '../../store/scenarios/selectors';
import { formatPercentage, formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './ScenarioAnalysis.module.css';

interface ScenarioTab {
  id: string;
  title: string;
  component: React.ReactNode;
}

const ScenarioAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const scenarios = useScenarios();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const scenariosList = useSelector(selectScenarios);
  const scenarioResults = useSelector(selectScenarioResults);
  const scenarioChains = useSelector(selectScenarioChains);
  const scenariosLoading = useSelector(selectScenariosLoading);

  // Local state
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [activeTab, setActiveTab] = useState('single');
  const [customScenario, setCustomScenario] = useState({
    name: '',
    description: '',
    factors: [
      { asset: 'SPY', impact: 0 },
      { asset: 'BND', impact: 0 },
      { asset: 'GLD', impact: 0 },
    ],
  });

  // Load data
  useEffect(() => {
    portfolios.loadPortfolios();
    scenarios.loadScenarios();
  }, []);

  // Auto-select first portfolio
  useEffect(() => {
    if (portfoliosList.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfoliosList[0].id);
    }
  }, [portfoliosList, selectedPortfolio]);

  // Portfolio and scenario options
  const portfolioOptions = portfoliosList.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const scenarioOptions = scenariosList.map(s => ({
    value: s.id,
    label: s.name,
  }));

  // Pre-defined scenarios
  const predefinedScenarios = [
    {
      id: 'market_crash',
      name: '2008-style Market Crash',
      description: 'Equity markets down 40%, credit spreads widen',
      factors: [
        { asset: 'Equities', impact: -40 },
        { asset: 'Corporate Bonds', impact: -15 },
        { asset: 'Government Bonds', impact: 5 },
        { asset: 'Commodities', impact: -25 },
      ],
    },
    {
      id: 'interest_rate_shock',
      name: 'Interest Rate Shock',
      description: 'Rapid increase in interest rates',
      factors: [
        { asset: 'Equities', impact: -20 },
        { asset: 'Bonds', impact: -12 },
        { asset: 'REITs', impact: -25 },
        { asset: 'Growth Stocks', impact: -30 },
      ],
    },
    {
      id: 'inflation_spike',
      name: 'Inflation Spike',
      description: 'Unexpected inflation surge',
      factors: [
        { asset: 'Fixed Income', impact: -15 },
        { asset: 'Commodities', impact: 25 },
        { asset: 'Real Estate', impact: 10 },
        { asset: 'Cash', impact: -5 },
      ],
    },
    {
      id: 'tech_bubble_burst',
      name: 'Tech Bubble Burst',
      description: 'Technology sector collapse',
      factors: [
        { asset: 'Technology', impact: -60 },
        { asset: 'Growth Stocks', impact: -35 },
        { asset: 'Value Stocks', impact: -10 },
        { asset: 'Bonds', impact: 8 },
      ],
    },
  ];

  const handleRunScenario = async (scenarioId: string) => {
    if (!selectedPortfolio) return;

    await scenarios.runScenario({
      portfolioId: selectedPortfolio,
      scenarioId,
    });
  };

  const handleCreateCustomScenario = async () => {
    if (!selectedPortfolio) return;

    await scenarios.createCustomScenario({
      portfolioId: selectedPortfolio,
      scenario: customScenario,
    });
  };

  const handleRunScenarioChain = async (chainScenarios: string[]) => {
    if (!selectedPortfolio) return;

    await scenarios.runScenarioChain({
      portfolioId: selectedPortfolio,
      scenarios: chainScenarios,
    });
  };

  // Single Scenario Tab
  const SingleScenarioTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.scenarioGrid}>
        {/* Scenario Selection */}
        <Card className={styles.scenarioSelectCard}>
          <h3 className={styles.cardTitle}>Select Scenario</h3>

          <div className={styles.scenarioOptions}>
            <div className={styles.predefinedScenarios}>
              <h4>Pre-defined Scenarios</h4>
              <div className={styles.scenarioList}>
                {predefinedScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`${styles.scenarioButton} ${
                      selectedScenario === scenario.id ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className={styles.scenarioName}>{scenario.name}</div>
                    <div className={styles.scenarioDescription}>
                      {scenario.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.customScenario}>
              <h4>Custom Scenario</h4>
              <div className={styles.customForm}>
                <Input
                  label="Scenario Name"
                  value={customScenario.name}
                  onChange={(value) => setCustomScenario(prev => ({
                    ...prev,
                    name: value
                  }))}
                  placeholder="Enter scenario name"
                />
                <Input
                  label="Description"
                  value={customScenario.description}
                  onChange={(value) => setCustomScenario(prev => ({
                    ...prev,
                    description: value
                  }))}
                  placeholder="Describe the scenario"
                  multiline
                  rows={2}
                />

                <div className={styles.factorsEditor}>
                  <h5>Impact Factors (%)</h5>
                  {customScenario.factors.map((factor, index) => (
                    <div key={index} className={styles.factorRow}>
                      <span className={styles.factorAsset}>{factor.asset}</span>
                      <Input
                        type="number"
                        value={factor.impact}
                        onChange={(value) => {
                          const newFactors = [...customScenario.factors];
                          newFactors[index].impact = Number(value);
                          setCustomScenario(prev => ({
                            ...prev,
                            factors: newFactors
                          }));
                        }}
                        min={-100}
                        max={100}
                        step={1}
                        size="small"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleCreateCustomScenario}
                  variant="secondary"
                  disabled={!customScenario.name || !selectedPortfolio}
                >
                  Create Custom Scenario
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.runScenarioActions}>
            <Button
              onClick={() => handleRunScenario(selectedScenario)}
              variant="primary"
              size="large"
              disabled={!selectedScenario || !selectedPortfolio || scenariosLoading}
              loading={scenariosLoading}
            >
              {scenariosLoading ? 'Running...' : 'Run Scenario'}
            </Button>
          </div>
        </Card>

        {/* Scenario Results */}
        <Card className={styles.resultsCard}>
          <h3 className={styles.cardTitle}>Scenario Impact</h3>
          {scenarioResults && selectedScenario ? (
            <ScenarioImpact
              scenarioResult={scenarioResults[selectedScenario]}
              portfolio={portfoliosList.find(p => p.id === selectedPortfolio)}
            />
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>📊</div>
              <p>Select and run a scenario to see results</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // Scenario Chain Tab
  const ScenarioChainTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.chainCard}>
        <h3 className={styles.cardTitle}>Scenario Chain Analysis</h3>
        <p className={styles.chainDescription}>
          Model sequential scenarios to understand cumulative impact
        </p>

        {scenarioChains && scenarioChains.length > 0 ? (
          <ScenarioChain
            scenarioChains={scenarioChains}
            onRunChain={handleRunScenarioChain}
          />
        ) : (
          <div className={styles.chainBuilder}>
            <div className={styles.chainSteps}>
              <h4>Build Scenario Chain</h4>
              <p>Create a sequence of events to model complex market conditions</p>

              <div className={styles.chainExample}>
                <div className={styles.exampleChain}>
                  <div className={styles.chainStep}>
                    <span className={styles.stepNumber}>1</span>
                    <span className={styles.stepName}>Market Crash</span>
                    <span className={styles.stepImpact}>-25%</span>
                  </div>
                  <div className={styles.chainArrow}>→</div>
                  <div className={styles.chainStep}>
                    <span className={styles.stepNumber}>2</span>
                    <span className={styles.stepName}>Recovery</span>
                    <span className={styles.stepImpact}>+15%</span>
                  </div>
                  <div className={styles.chainArrow}>→</div>
                  <div className={styles.chainStep}>
                    <span className={styles.stepNumber}>3</span>
                    <span className={styles.stepName}>Inflation</span>
                    <span className={styles.stepImpact}>-8%</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleRunScenarioChain(['market_crash', 'recovery', 'inflation'])}
                  variant="primary"
                  disabled={!selectedPortfolio}
                >
                  Run Example Chain
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // Comparison Tab
  const ComparisonTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.comparisonCard}>
        <h3 className={styles.cardTitle}>Portfolio Scenario Comparison</h3>
        {scenarioResults ? (
          <ScenarioComparison
            portfolios={portfoliosList}
            scenarioResults={scenarioResults}
            scenarios={predefinedScenarios}
          />
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>⚖️</div>
            <p>Run scenarios on multiple portfolios to compare results</p>
          </div>
        )}
      </Card>
    </div>
  );

  const tabs: ScenarioTab[] = [
    { id: 'single', title: 'Single Scenario', component: <SingleScenarioTab /> },
    { id: 'chain', title: 'Scenario Chains', component: <ScenarioChainTab /> },
    { id: 'comparison', title: 'Comparison', component: <ComparisonTab /> },
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
          <h1 className={styles.title}>Scenario Analysis</h1>
          <p className={styles.subtitle}>
            Model various market scenarios and assess their impact on your portfolios
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
            </div>
            <div className={styles.controlsRight}>
              <Button
                onClick={() => navigate(ROUTES.RISK.ROOT)}
                variant="secondary"
              >
                Risk Analysis
              </Button>
              <Button
                onClick={() => navigate(ROUTES.HISTORICAL.ROOT)}
                variant="secondary"
              >
                Historical Context
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

export default ScenarioAnalysis;