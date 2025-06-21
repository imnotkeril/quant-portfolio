/**
 * ComparisonDashboard Component
 * Main dashboard for portfolio comparison with multiple views
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import Tabs from '../../common/Tabs/Tabs';
import { PortfolioSelector } from '../PortfolioSelector/PortfolioSelector';
import { ComparisonTable } from '../ComparisonTable/ComparisonTable';
import { ComparisonChart } from '../ComparisonChart/ComparisonChart';
import { DifferentialAnalysis } from '../DifferentialAnalysis/DifferentialAnalysis';
import { LineChart } from '../../charts/LineChart/LineChart';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import { COLORS } from '../../../constants/colors';
import {
  selectSelectedPortfolios,
  selectBenchmarkPortfolio,
  selectViewMode,
  selectDisplayMode,
  selectActiveComparisonData,
  selectCanRunComparison,
  selectAnyComparisonLoading,
  selectComparisonValidation,
} from '../../../store/comparison/selectors';
import {
  setSelectedPortfolios,
  setBenchmarkPortfolio,
  setViewMode,
  setDisplayMode,
  comparePortfolios,
} from '../../../store/comparison/actions';
import { ComparisonViewMode, ComparisonDisplayMode } from '../../../store/comparison/types';
import styles from './ComparisonDashboard.module.css';

interface ComparisonDashboardProps {
  className?: string;
  'data-testid'?: string;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();

  // Redux state
  const selectedPortfolios = useSelector(selectSelectedPortfolios);
  const benchmarkPortfolio = useSelector(selectBenchmarkPortfolio);
  const viewMode = useSelector(selectViewMode);
  const displayMode = useSelector(selectDisplayMode);
  const comparisonData = useSelector(selectActiveComparisonData);
  const canRunComparison = useSelector(selectCanRunComparison);
  const isLoading = useSelector(selectAnyComparisonLoading);
  const validation = useSelector(selectComparisonValidation);

  // Local state
  const [selectedTab, setSelectedTab] = useState('overview');

  // View mode options
  const viewModeOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'side_by_side', label: 'Side by Side' },
    { value: 'matrix', label: 'Matrix' },
    { value: 'charts', label: 'Charts' },
  ];

  // Display mode options
  const displayModeOptions = [
    { value: 'absolute', label: 'Absolute Values' },
    { value: 'relative', label: 'Relative (%)' },
    { value: 'percentage', label: 'Percentage Change' },
    { value: 'normalized', label: 'Normalized' },
  ];

  // Tab configuration
  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'performance', label: 'Performance', icon: '📈' },
    { key: 'risk', label: 'Risk Analysis', icon: '⚠️' },
    { key: 'composition', label: 'Composition', icon: '🥧' },
    { key: 'scenarios', label: 'Scenarios', icon: '🎭' },
    { key: 'differential', label: 'Differential', icon: '📉' },
  ];

  // Handle portfolio selection
  const handlePortfolioSelection = (portfolioIds: string[]) => {
    dispatch(setSelectedPortfolios(portfolioIds));
  };

  // Handle benchmark selection
  const handleBenchmarkSelection = (portfolioId: string | null) => {
    dispatch(setBenchmarkPortfolio(portfolioId));
  };

  // Handle view mode change
  const handleViewModeChange = (newViewMode: ComparisonViewMode) => {
    dispatch(setViewMode(newViewMode));
  };

  // Handle display mode change
  const handleDisplayModeChange = (newDisplayMode: ComparisonDisplayMode) => {
    dispatch(setDisplayMode(newDisplayMode));
  };

  // Run comparison
  const handleRunComparison = () => {
    if (!canRunComparison) return;

    const comparisonId = `comparison_${selectedPortfolios.join('_')}_${Date.now()}`;

    dispatch(comparePortfolios({
      request: {
        portfolio1: { id: selectedPortfolios[0] },
        portfolio2: { id: selectedPortfolios[1] },
        benchmark: benchmarkPortfolio || undefined,
      },
      comparisonId,
    }));
  };

  // Clear comparison
  const handleClearComparison = () => {
    dispatch(setSelectedPortfolios([]));
    dispatch(setBenchmarkPortfolio(null));
  };

  // Export comparison
  const handleExportComparison = () => {
    if (!comparisonData) return;

    const exportData = {
      ...comparisonData,
      exportedAt: new Date().toISOString(),
      portfolios: selectedPortfolios,
      benchmark: benchmarkPortfolio,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_comparison_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render comparison content based on selected tab
  const renderComparisonContent = () => {
    if (!comparisonData) {
      return (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>No Comparison Data</h3>
            <p>Select portfolios and run a comparison to see results</p>
          </div>
        </Card>
      );
    }

    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'performance':
        return renderPerformanceTab();
      case 'risk':
        return renderRiskTab();
      case 'composition':
        return renderCompositionTab();
      case 'scenarios':
        return renderScenariosTab();
      case 'differential':
        return renderDifferentialTab();
      default:
        return null;
    }
  };

  // Render overview tab
  const renderOverviewTab = () => {
    const { comparison } = comparisonData!;

    return (
      <div className={styles.overviewContent}>
        <div className={styles.metricsGrid}>
          <Card title="Performance Summary" size="small">
            <ComparisonTable
              data={comparison?.performanceComparison?.returnMetrics || {}}
              displayMode={displayMode}
              compact
            />
          </Card>

          <Card title="Risk Summary" size="small">
            <ComparisonTable
              data={comparison?.riskComparison?.volatility || {}}
              displayMode={displayMode}
              compact
            />
          </Card>

          <Card title="Composition Overlap" size="small">
            <div className={styles.compositionOverview}>
              <div className={styles.overlapMetric}>
                <span className={styles.metricLabel}>Common Assets:</span>
                <span className={styles.metricValue}>
                  {comparison?.compositionComparison?.commonAssets?.length || 0}
                </span>
              </div>
              <div className={styles.overlapMetric}>
                <span className={styles.metricLabel}>Concentration Diff:</span>
                <span className={styles.metricValue}>
                  {(comparison?.compositionComparison?.concentrationDifference || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Performance Comparison Chart" className={styles.chartCard}>
          <ComparisonChart
            data={Array.isArray(comparison?.performanceComparison?.cumulativeReturns) ?
              comparison.performanceComparison.cumulativeReturns :
              []}
            portfolios={selectedPortfolios}
            height={300}
          />
        </Card>
      </div>
    );
  };

  // Render performance tab
  const renderPerformanceTab = () => {
    const { performance } = comparisonData!;

    return (
      <div className={styles.performanceContent}>
        <div className={styles.performanceGrid}>
          <Card title="Return Metrics" className={styles.metricsCard}>
            <ComparisonTable
              data={performance?.performanceComparison?.returnMetrics ?
                Object.keys(performance.performanceComparison.returnMetrics).reduce((acc, key) => {
                  const value = performance.performanceComparison.returnMetrics[key];
                  acc[key] = { value: typeof value === 'number' ? value : 0 };
                  return acc;
                }, {} as Record<string, Record<string, number>>) :
                {}}
              displayMode={displayMode}
            />
          </Card>

          <Card title="Period Returns" className={styles.metricsCard}>
            <ComparisonTable
              data={performance?.performanceComparison?.periodReturns ?
                Object.keys(performance.performanceComparison.periodReturns).reduce((acc, key) => {
                  const value = performance.performanceComparison.periodReturns[key];
                  acc[key] = { value: typeof value === 'number' ? value : 0 };
                  return acc;
                }, {} as Record<string, Record<string, number>>) :
                {}}
              displayMode={displayMode}
            />
          </Card>
        </div>

        {performance?.performanceComparison?.cumulativeReturns && Array.isArray(performance.performanceComparison.cumulativeReturns) && (
          <Card title="Cumulative Returns" className={styles.chartCard}>
            <LineChart
              data={performance.performanceComparison.cumulativeReturns}
              series={selectedPortfolios.map((id, index) => ({
                key: id,
                name: `Portfolio ${index + 1}`,
                color: index === 0 ? COLORS.ACCENT : COLORS.NEUTRAL_1,
              }))}
              height={400}
            />
          </Card>
        )}
      </div>
    );
  };

  // Render risk tab
  const renderRiskTab = () => {
    const { risk } = comparisonData!;

    return (
      <div className={styles.riskContent}>
        <div className={styles.riskGrid}>
          <Card title="Risk Metrics" className={styles.metricsCard}>
            <ComparisonTable
              data={risk?.riskComparison?.ratioMetrics ?
                Object.keys(risk.riskComparison.ratioMetrics).reduce((acc, key) => {
                  const value = risk.riskComparison.ratioMetrics[key];
                  acc[key] = { value: typeof value === 'number' ? value : 0 };
                  return acc;
                }, {} as Record<string, Record<string, number>>) :
                {}}
              displayMode={displayMode}
            />
          </Card>

          <Card title="Drawdown Analysis" className={styles.metricsCard}>
            <ComparisonTable
              data={risk?.riskComparison?.drawdownMetrics ?
                Object.keys(risk.riskComparison.drawdownMetrics).reduce((acc, key) => {
                  const value = risk.riskComparison.drawdownMetrics[key];
                  acc[key] = { value: typeof value === 'number' ? value : 0 };
                  return acc;
                }, {} as Record<string, Record<string, number>>) :
                {}}
              displayMode={displayMode}
            />
          </Card>

          <Card title="VaR Analysis" className={styles.metricsCard}>
            <ComparisonTable
              data={risk?.riskComparison?.varMetrics ?
                Object.keys(risk.riskComparison.varMetrics).reduce((acc, key) => {
                  const value = risk.riskComparison.varMetrics[key];
                  acc[key] = { value: typeof value === 'number' ? value : 0 };
                  return acc;
                }, {} as Record<string, Record<string, number>>) :
                {}}
              displayMode={displayMode}
            />
          </Card>
        </div>
      </div>
    );
  };

  // Render composition tab
  const renderCompositionTab = () => {
    const { composition } = comparisonData!;

    return (
      <div className={styles.compositionContent}>
        <div className={styles.compositionGrid}>
          <Card title="Asset Overlap" className={styles.overlapCard}>
            <div className={styles.overlapAnalysis}>
              <div className={styles.overlapSection}>
                <h4>Common Assets ({composition?.compositionComparison?.commonAssets?.length || 0})</h4>
                <div className={styles.assetList}>
                  {composition?.compositionComparison?.commonAssets?.map((asset) => (
                    <span key={asset} className={styles.assetTag}>{asset}</span>
                  ))}
                </div>
              </div>

              <div className={styles.overlapSection}>
                <h4>Unique to Portfolio 1 ({composition?.compositionComparison?.onlyInFirst?.length || 0})</h4>
                <div className={styles.assetList}>
                  {composition?.compositionComparison?.onlyInFirst?.map((asset) => (
                    <span key={asset} className={styles.assetTag}>{asset}</span>
                  ))}
                </div>
              </div>

              <div className={styles.overlapSection}>
                <h4>Unique to Portfolio 2 ({composition?.compositionComparison?.onlyInSecond?.length || 0})</h4>
                <div className={styles.assetList}>
                  {composition?.compositionComparison?.onlyInSecond?.map((asset) => (
                    <span key={asset} className={styles.assetTag}>{asset}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Weight Differences" className={styles.weightsCard}>
            {composition?.compositionComparison?.weightDifferences && (
              <HeatmapChart
                data={Object.entries(composition.compositionComparison.weightDifferences).map(([asset, diff]) => ({
                  x: asset,
                  y: 'Weight Difference',
                  value: diff,
                }))}
                height={200}
                colorScale="correlation"
              />
            )}
          </Card>
        </div>
      </div>
    );
  };

  // Render scenarios tab
  const renderScenariosTab = () => {
    const { scenario } = comparisonData!;

    return (
      <div className={styles.scenariosContent}>
        <Card title="Scenario Analysis" className={styles.scenarioCard}>
          {scenario?.scenarioComparison && (
            <div className={styles.scenarioResults}>
              {Object.entries(scenario.scenarioComparison).map(([scenarioName, comparison]) => (
                <div key={scenarioName} className={styles.scenarioItem}>
                  <h4>{scenarioName}</h4>
                  <div className={styles.scenarioMetrics}>
                    <div className={styles.portfolioResult}>
                      <span>Portfolio 1:</span>
                      <span className={comparison.portfolio1Result.impactPercentage >= 0 ? styles.positive : styles.negative}>
                        {comparison.portfolio1Result.impactPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className={styles.portfolioResult}>
                      <span>Portfolio 2:</span>
                      <span className={comparison.portfolio2Result.impactPercentage >= 0 ? styles.positive : styles.negative}>
                        {comparison.portfolio2Result.impactPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className={styles.resilience}>
                      <span>Relative Resilience:</span>
                      <span>{comparison.relativeResilience.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Render differential tab
  const renderDifferentialTab = () => {
    const { differential } = comparisonData!;

    return (
      <div className={styles.differentialContent}>
        <Card title="Differential Analysis">
          <DifferentialAnalysis
            data={differential?.differentialReturns || {}}
            statistics={differential?.statistics || {}}
            portfolios={selectedPortfolios}
          />
        </Card>
      </div>
    );
  };

  const containerClasses = classNames(
    styles.container,
    className
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Portfolio Comparison</h1>
          <p className={styles.subtitle}>
            Compare portfolio performance, risk, and composition side by side
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleClearComparison}
            disabled={selectedPortfolios.length === 0}
          >
            Clear
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportComparison}
            disabled={!comparisonData}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Selection Panel */}
      <Card className={styles.selectionPanel}>
        <div className={styles.selectionContent}>
          <div className={styles.portfolioSelection}>
            <PortfolioSelector
              selectedPortfolios={selectedPortfolios}
              onSelectionChange={handlePortfolioSelection}
              maxSelection={10}
              minSelection={2}
            />
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>View Mode:</label>
              <Select
                value={viewMode}
                onChange={(value) => handleViewModeChange(value as ComparisonViewMode)}
                options={viewModeOptions}
                size="small"
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Display:</label>
              <Select
                value={displayMode}
                onChange={(value) => handleDisplayModeChange(value as ComparisonDisplayMode)}
                options={displayModeOptions}
                size="small"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleRunComparison}
              disabled={!canRunComparison}
              loading={isLoading}
            >
              {isLoading ? 'Comparing...' : 'Run Comparison'}
            </Button>
          </div>
        </div>

        {/* Validation Messages */}
        {!validation.isValid && (
          <div className={styles.validationMessages}>
            {validation.errors.map((error, index) => (
              <div key={index} className={styles.errorMessage}>
                {error}
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className={styles.validationMessages}>
            {validation.warnings.map((warning, index) => (
              <div key={index} className={styles.warningMessage}>
                {warning}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Content Tabs */}
      <Card className={styles.contentPanel}>
        <Tabs
          items={tabs}
          activeKey={selectedTab}
          onChange={setSelectedTab}
        />

        <div className={styles.tabContent}>
          {renderComparisonContent()}
        </div>
      </Card>
    </div>
  );
};

export default ComparisonDashboard;