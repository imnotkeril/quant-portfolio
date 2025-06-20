/**
 * Historical Analogies Page
 * Pattern recognition and historical market context analysis
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { Input } from '../../components/common/Input/Input';
import { HistoricalContext } from '../../components/historical/HistoricalContext/HistoricalContext';
import { HistoricalAnalogies } from '../../components/historical/HistoricalAnalogies/HistoricalAnalogies';
import { TimelineView } from '../../components/historical/TimelineView/TimelineView';
import { LineChart } from '../../components/charts/LineChart/LineChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart/HeatmapChart';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useHistorical } from '../../hooks/useHistorical';
import {
  selectPortfolios,
  selectPortfoliosLoading
} from '../../store/portfolio/selectors';
import {
  selectHistoricalAnalogies,
  selectHistoricalContext,
  selectPatternMatches,
  selectHistoricalLoading
} from '../../store/historical/selectors';
import { formatPercentage, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import styles from './HistoricalAnalogies.module.css';

interface HistoricalTab {
  id: string;
  title: string;
  component: React.ReactNode;
}

const HistoricalAnalogiesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hooks
  const portfolios = usePortfolios();
  const historical = useHistorical();

  // Selectors
  const portfoliosList = useSelector(selectPortfolios);
  const portfoliosLoading = useSelector(selectPortfoliosLoading);
  const historicalAnalogies = useSelector(selectHistoricalAnalogies);
  const historicalContext = useSelector(selectHistoricalContext);
  const patternMatches = useSelector(selectPatternMatches);
  const historicalLoading = useSelector(selectHistoricalLoading);

  // Local state
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [activeTab, setActiveTab] = useState('analogies');
  const [searchPeriod, setSearchPeriod] = useState('1Y');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);
  const [selectedPattern, setSelectedPattern] = useState<string>('');

  // Load data
  useEffect(() => {
    portfolios.loadPortfolios();
  }, []);

  // Auto-select first portfolio
  useEffect(() => {
    if (portfoliosList.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfoliosList[0].id);
    }
  }, [portfoliosList, selectedPortfolio]);

  // Load historical data when portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      historical.findHistoricalAnalogies({
        portfolioId: selectedPortfolio,
        period: searchPeriod,
        similarityThreshold,
      });

      historical.loadHistoricalContext({
        portfolioId: selectedPortfolio,
        period: searchPeriod,
      });
    }
  }, [selectedPortfolio, searchPeriod, similarityThreshold]);

  // Portfolio options
  const portfolioOptions = portfoliosList.map(p => ({
    value: p.id,
    label: p.name,
  }));

  // Time period options
  const periodOptions = [
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' },
    { value: '10Y', label: '10 Years' },
  ];

  // Historical market events for context
  const historicalEvents = [
    {
      id: 'black_monday_1987',
      name: 'Black Monday 1987',
      date: '1987-10-19',
      description: 'Stock market crash with 22% single-day decline',
      similarity: 0.85,
      impact: -22.6,
    },
    {
      id: 'dot_com_crash_2000',
      name: 'Dot-com Crash 2000-2002',
      date: '2000-03-10',
      description: 'Technology bubble burst and market correction',
      similarity: 0.78,
      impact: -78.0,
    },
    {
      id: 'financial_crisis_2008',
      name: 'Financial Crisis 2008',
      date: '2008-09-15',
      description: 'Global financial crisis and banking sector collapse',
      similarity: 0.92,
      impact: -57.0,
    },
    {
      id: 'covid_crash_2020',
      name: 'COVID-19 Crash 2020',
      date: '2020-02-19',
      description: 'Pandemic-induced market crash and recovery',
      similarity: 0.73,
      impact: -34.0,
    },
  ];

  const handleSearchAnalogies = () => {
    if (!selectedPortfolio) return;

    historical.findHistoricalAnalogies({
      portfolioId: selectedPortfolio,
      period: searchPeriod,
      similarityThreshold,
    });
  };

  const handlePatternAnalysis = (eventId: string) => {
    setSelectedPattern(eventId);
    if (selectedPortfolio) {
      historical.analyzePattern({
        portfolioId: selectedPortfolio,
        historicalEventId: eventId,
      });
    }
  };

  // Analogies Tab
  const AnalogiesTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.analogiesGrid}>
        {/* Search Controls */}
        <Card className={styles.searchCard}>
          <h3 className={styles.cardTitle}>Find Historical Analogies</h3>

          <div className={styles.searchControls}>
            <Select
              label="Analysis Period"
              value={searchPeriod}
              onChange={setSearchPeriod}
              options={periodOptions}
            />

            <div className={styles.similarityControl}>
              <label className={styles.controlLabel}>
                Similarity Threshold: {(similarityThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <Button
              onClick={handleSearchAnalogies}
              variant="primary"
              loading={historicalLoading}
              disabled={!selectedPortfolio}
            >
              {historicalLoading ? 'Searching...' : 'Find Analogies'}
            </Button>
          </div>

          <div className={styles.searchTips}>
            <h4>Search Tips</h4>
            <ul>
              <li>Higher threshold finds more exact matches</li>
              <li>Lower threshold includes broader patterns</li>
              <li>Longer periods provide more context</li>
            </ul>
          </div>
        </Card>

        {/* Results */}
        <Card className={styles.resultsCard}>
          <h3 className={styles.cardTitle}>Historical Matches</h3>

          {historicalAnalogies && historicalAnalogies.length > 0 ? (
            <div className={styles.analogiesList}>
              {historicalAnalogies.map((analogy, index) => (
                <div key={index} className={styles.analogyItem}>
                  <div className={styles.analogyHeader}>
                    <div className={styles.analogyName}>{analogy.eventName}</div>
                    <div className={styles.analogySimilarity}>
                      {formatPercentage(analogy.similarity)} match
                    </div>
                  </div>

                  <div className={styles.analogyDetails}>
                    <div className={styles.analogyDate}>
                      {formatDate(analogy.date)}
                    </div>
                    <div className={styles.analogyDescription}>
                      {analogy.description}
                    </div>
                  </div>

                  <div className={styles.analogyMetrics}>
                    <span className={styles.metricLabel}>Impact:</span>
                    <span className={`${styles.metricValue} ${
                      analogy.impact >= 0 ? styles.positive : styles.negative
                    }`}>
                      {formatPercentage(analogy.impact)}
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePatternAnalysis(analogy.eventId)}
                    variant="ghost"
                    size="small"
                  >
                    Analyze Pattern
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <p>No historical analogies found</p>
              <p className={styles.noResultsHint}>
                Try adjusting the similarity threshold or time period
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // Context Tab
  const ContextTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.contextGrid}>
        {/* Historical Timeline */}
        <Card className={styles.timelineCard}>
          <h3 className={styles.cardTitle}>Historical Timeline</h3>
          {historicalEvents && (
            <TimelineView
              events={historicalEvents}
              selectedEvent={selectedPattern}
              onEventSelect={setSelectedPattern}
            />
          )}
        </Card>

        {/* Context Analysis */}
        <Card className={styles.contextCard}>
          <h3 className={styles.cardTitle}>Market Context</h3>
          {historicalContext ? (
            <HistoricalContext
              contextData={historicalContext}
              currentPeriod={searchPeriod}
            />
          ) : (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading historical context...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // Patterns Tab
  const PatternsTab = () => (
    <div className={styles.tabContent}>
      <Card className={styles.patternsCard}>
        <h3 className={styles.cardTitle}>Pattern Analysis</h3>

        {selectedPattern && patternMatches ? (
          <div className={styles.patternAnalysis}>
            <div className={styles.patternHeader}>
              <h4>
                {historicalEvents.find(e => e.id === selectedPattern)?.name}
              </h4>
              <p>
                {historicalEvents.find(e => e.id === selectedPattern)?.description}
              </p>
            </div>

            <div className={styles.patternCharts}>
              <div className={styles.chartSection}>
                <h5>Price Movement Comparison</h5>
                <LineChart
                  data={patternMatches.priceComparison || []}
                  xAxisKey="days"
                  lines={[
                    { key: 'historical', name: 'Historical Event', color: '#dc2626' },
                    { key: 'current', name: 'Current Period', color: '#2563eb' },
                  ]}
                  height={300}
                  formatY={(value) => `${value.toFixed(1)}%`}
                />
              </div>

              <div className={styles.chartSection}>
                <h5>Correlation Heatmap</h5>
                <HeatmapChart
                  data={patternMatches.correlationMatrix || []}
                  height={250}
                />
              </div>
            </div>

            <div className={styles.patternInsights}>
              <h5>Key Insights</h5>
              <div className={styles.insightsList}>
                {patternMatches.insights?.map((insight, index) => (
                  <div key={index} className={styles.insight}>
                    <div className={styles.insightIcon}>💡</div>
                    <div className={styles.insightText}>{insight}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noPattern}>
            <div className={styles.noPatternIcon}>📊</div>
            <h4>No Pattern Selected</h4>
            <p>Select a historical event from the analogies or timeline to analyze patterns</p>
          </div>
        )}
      </Card>
    </div>
  );

  const tabs: HistoricalTab[] = [
    { id: 'analogies', title: 'Find Analogies', component: <AnalogiesTab /> },
    { id: 'context', title: 'Historical Context', component: <ContextTab /> },
    { id: 'patterns', title: 'Pattern Analysis', component: <PatternsTab /> },
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
          <h1 className={styles.title}>Historical Analogies</h1>
          <p className={styles.subtitle}>
            Discover patterns and learn from historical market events
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
                onClick={() => navigate(ROUTES.SCENARIOS.ROOT)}
                variant="secondary"
              >
                Scenario Analysis
              </Button>
              <Button
                onClick={() => navigate(ROUTES.RISK.ROOT)}
                variant="secondary"
              >
                Risk Analysis
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

export default HistoricalAnalogiesPage;