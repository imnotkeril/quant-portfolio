/**
 * DifferentialAnalysis Component
 * Advanced analysis of return differences between portfolios
 */
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import Tabs from '../../common/Tabs/Tabs';
import { LineChart } from '../../charts/LineChart/LineChart';
import { BarChart } from '../../charts/BarChart/BarChart';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatNumber } from '../../../utils/formatters';
import styles from './DifferentialAnalysis.module.css';

interface DifferentialAnalysisProps {
  data: Record<string, number>;
  statistics: Record<string, number>;
  portfolios: string[];
  className?: string;
  'data-testid'?: string;
}

interface StatisticalMetric {
  name: string;
  value: number;
  description: string;
  interpretation: string;
}

export const DifferentialAnalysis: React.FC<DifferentialAnalysisProps> = ({
  data,
  statistics,
  portfolios,
  className,
  'data-testid': testId,
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [showOutliers, setShowOutliers] = useState(true);

  // Period options for analysis
  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  // Tab configuration
  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'distribution', label: 'Distribution', icon: '📈' },
    { key: 'correlation', label: 'Correlation', icon: '🔗' },
    { key: 'periods', label: 'Time Periods', icon: '📅' },
    { key: 'outliers', label: 'Outliers', icon: '⚡' },
  ];

  // Generate mock data for demonstration
  const generateDifferentialData = useMemo(() => {
    const dataPoints = 250; // ~1 year of daily data
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i));

      // Generate differential returns with some persistence
      const baseReturn = (Math.random() - 0.5) * 0.02;
      const differential = baseReturn + (Math.random() - 0.5) * 0.01;

      data.push({
        name: date.toISOString().split('T')[0],
        date: date.toISOString(),
        differential: differential * 100, // Convert to percentage
        cumulative: data.length > 0 ?
          (data[data.length - 1] as any).cumulative + differential * 100 :
          differential * 100,
        portfolio1: baseReturn * 100,
        portfolio2: (baseReturn + differential) * 100,
      });
    }

    return data;
  }, []);

  // Calculate statistical metrics
  const statisticalMetrics: StatisticalMetric[] = useMemo(() => {
    const differentials = generateDifferentialData.map(d => d.differential);

    // Calculate various statistics
    const mean = differentials.reduce((sum, val) => sum + val, 0) / differentials.length;
    const variance = differentials.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / differentials.length;
    const stdDev = Math.sqrt(variance);
    const skewness = calculateSkewness(differentials);
    const kurtosis = calculateKurtosis(differentials);

    // Positive/negative periods
    const positivePeriods = differentials.filter(d => d > 0).length;
    const negativePeriods = differentials.filter(d => d < 0).length;
    const winRate = (positivePeriods / differentials.length) * 100;

    // Information ratio (simplified)
    const informationRatio = mean / stdDev;

    return [
      {
        name: 'Mean Differential',
        value: mean,
        description: 'Average daily differential return',
        interpretation: mean > 0 ? 'Portfolio 2 outperforms on average' : 'Portfolio 1 outperforms on average'
      },
      {
        name: 'Volatility',
        value: stdDev,
        description: 'Standard deviation of differential returns',
        interpretation: stdDev > 1 ? 'High volatility in relative performance' : 'Low volatility in relative performance'
      },
      {
        name: 'Win Rate',
        value: winRate,
        description: 'Percentage of periods where Portfolio 2 outperformed',
        interpretation: winRate > 50 ? 'Portfolio 2 wins more often' : 'Portfolio 1 wins more often'
      },
      {
        name: 'Information Ratio',
        value: informationRatio,
        description: 'Risk-adjusted excess return',
        interpretation: Math.abs(informationRatio) > 0.5 ? 'Strong risk-adjusted performance difference' : 'Weak risk-adjusted performance difference'
      },
      {
        name: 'Skewness',
        value: skewness,
        description: 'Asymmetry of return distribution',
        interpretation: skewness > 0 ? 'More extreme positive differentials' : 'More extreme negative differentials'
      },
      {
        name: 'Kurtosis',
        value: kurtosis,
        description: 'Tail heaviness of distribution',
        interpretation: kurtosis > 3 ? 'Fat tails - more extreme events' : 'Thin tails - fewer extreme events'
      }
    ];
  }, [generateDifferentialData]);

  // Calculate skewness
  const calculateSkewness = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / values.length;
    return skewness;
  };

  // Calculate kurtosis
  const calculateKurtosis = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / values.length;
    return kurtosis;
  };

  // Generate distribution data for histogram
  const generateDistributionData = () => {
    const differentials = generateDifferentialData.map(d => d.differential);
    const bins = 20;
    const min = Math.min(...differentials);
    const max = Math.max(...differentials);
    const binWidth = (max - min) / bins;

    const histogram = [];
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = differentials.filter(d => d >= binStart && d < binEnd).length;

      histogram.push({
        name: `${binStart.toFixed(2)}%`,
        count,
        range: `${binStart.toFixed(2)}% to ${binEnd.toFixed(2)}%`,
      });
    }

    return histogram;
  };

  // Generate correlation data
  const generateCorrelationData = () => {
    const data = [];
    const periods = ['1D', '1W', '1M', '3M', '6M', '1Y'];

    periods.forEach(period => {
      const correlation = 0.3 + (Math.random() - 0.5) * 0.6; // Mock correlation
      data.push({
        x: period,
        y: 'Correlation',
        value: correlation,
      });
    });

    return data;
  };

  // Detect outliers
  const detectOutliers = () => {
    const differentials = generateDifferentialData.map(d => d.differential);
    const mean = differentials.reduce((sum, val) => sum + val, 0) / differentials.length;
    const stdDev = Math.sqrt(differentials.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / differentials.length);

    const threshold = 2.5; // 2.5 standard deviations

    return generateDifferentialData.filter(d =>
      Math.abs(d.differential - mean) > threshold * stdDev
    ).map(d => ({
      ...d,
      severity: Math.abs(d.differential - mean) / stdDev,
    }));
  };

  // Export analysis
  const handleExport = () => {
    const exportData = {
      differentialReturns: generateDifferentialData,
      statistics: statisticalMetrics,
      distribution: generateDistributionData(),
      outliers: detectOutliers(),
      portfolios,
      analysisDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `differential_analysis_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render overview tab
  const renderOverviewTab = () => (
    <div className={styles.overviewContent}>
      <div className={styles.metricsGrid}>
        {statisticalMetrics.map((metric) => (
          <Card key={metric.name} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <h4 className={styles.metricName}>{metric.name}</h4>
              <span className={classNames(styles.metricValue, {
                [styles.positive]: metric.value > 0,
                [styles.negative]: metric.value < 0,
              })}>
                {metric.name.includes('Rate') ?
                  formatPercentage(metric.value / 100) :
                  formatNumber(metric.value, 3)
                }
              </span>
            </div>
            <p className={styles.metricDescription}>{metric.description}</p>
            <p className={styles.metricInterpretation}>{metric.interpretation}</p>
          </Card>
        ))}
      </div>

      <Card title="Cumulative Differential Returns" className={styles.chartCard}>
        <LineChart
          data={generateDifferentialData}
          series={[{
            key: 'cumulative',
            name: 'Cumulative Difference',
            color: COLORS.ACCENT,
          }]}
          height={300}
          yAxisFormatter={(value) => formatPercentage(value / 100)}
        />
      </Card>
    </div>
  );

  // Render distribution tab
  const renderDistributionTab = () => (
    <div className={styles.distributionContent}>
      <Card title="Return Distribution" className={styles.chartCard}>
        <BarChart
          data={generateDistributionData()}
          series={[{
            key: 'count',
            name: 'Frequency',
            color: COLORS.ACCENT,
          }]}
          height={300}
          layout="vertical"
        />
      </Card>

      <div className={styles.distributionStats}>
        <Card title="Distribution Statistics">
          <div className={styles.statsGrid}>
            {statisticalMetrics.slice(0, 4).map((metric) => (
              <div key={metric.name} className={styles.statItem}>
                <span className={styles.statLabel}>{metric.name}:</span>
                <span className={styles.statValue}>
                  {metric.name.includes('Rate') ?
                    formatPercentage(metric.value / 100) :
                    formatNumber(metric.value, 3)
                  }
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // Render correlation tab
  const renderCorrelationTab = () => (
    <div className={styles.correlationContent}>
      <Card title="Rolling Correlation" className={styles.chartCard}>
        <HeatmapChart
          data={generateCorrelationData()}
          height={200}
          colorScale="correlation"
          showLabels
        />
      </Card>

      <Card title="Correlation Analysis">
        <p className={styles.analysisText}>
          The correlation between the two portfolios varies over different time periods.
          Lower correlation indicates more diversification benefits from combining the portfolios.
        </p>
      </Card>
    </div>
  );

  // Render periods tab
  const renderPeriodsTab = () => (
    <div className={styles.periodsContent}>
      <Card title="Performance by Time Periods">
        <div className={styles.periodAnalysis}>
          <div className={styles.periodStats}>
            <div className={styles.periodStat}>
              <h4>Best Month</h4>
              <span className={styles.positive}>+3.2%</span>
            </div>
            <div className={styles.periodStat}>
              <h4>Worst Month</h4>
              <span className={styles.negative}>-2.8%</span>
            </div>
            <div className={styles.periodStat}>
              <h4>Best Quarter</h4>
              <span className={styles.positive}>+8.1%</span>
            </div>
            <div className={styles.periodStat}>
              <h4>Worst Quarter</h4>
              <span className={styles.negative}>-5.3%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render outliers tab
  const renderOutliersTab = () => {
    const outliers = detectOutliers();

    return (
      <div className={styles.outliersContent}>
        <Card title={`Outlier Events (${outliers.length} detected)`}>
          <div className={styles.outliersList}>
            {outliers.slice(0, 10).map((outlier, index) => (
              <div key={index} className={styles.outlierItem}>
                <div className={styles.outlierDate}>
                  {new Date(outlier.date).toLocaleDateString()}
                </div>
                <div className={classNames(styles.outlierValue, {
                  [styles.positive]: outlier.differential > 0,
                  [styles.negative]: outlier.differential < 0,
                })}>
                  {formatPercentage(outlier.differential / 100)}
                </div>
                <div className={styles.outlierSeverity}>
                  {outlier.severity.toFixed(1)}σ
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'distribution':
        return renderDistributionTab();
      case 'correlation':
        return renderCorrelationTab();
      case 'periods':
        return renderPeriodsTab();
      case 'outliers':
        return renderOutliersTab();
      default:
        return renderOverviewTab();
    }
  };

  const containerClasses = classNames(
    styles.container,
    className
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Differential Return Analysis</h3>
          <p className={styles.subtitle}>
            Analyzing return differences between {portfolios.length} portfolios
          </p>
        </div>

        <div className={styles.controls}>
          <Select
            value={selectedPeriod}
            onChange={(value) => setSelectedPeriod(String(value))}
            options={periodOptions}
            size="small"
          />

          <Button
            variant="outline"
            size="small"
            onClick={handleExport}
          >
            Export Analysis
          </Button>
        </div>
      </div>

      <Card className={styles.contentPanel}>
        <Tabs
          items={tabs}
          activeKey={selectedTab}
          onChange={setSelectedTab}
        />

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default DifferentialAnalysis;