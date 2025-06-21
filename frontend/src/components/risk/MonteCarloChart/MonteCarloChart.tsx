/**
 * MonteCarloChart Component
 * Monte Carlo simulation visualization and analysis
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import Card from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { LineChart } from '../../charts/LineChart/LineChart';
import { BarChart } from '../../charts/BarChart/BarChart';
import { ChartContainer } from '../../charts/ChartContainer/ChartContainer';
import { COLORS } from '../../../constants/colors';
import { MonteCarloResponse } from '../../../types/risk';
import { formatCurrency, formatPercentage, formatNumber } from '../../../utils/formatters';
import styles from './MonteCarloChart.module.css';

interface MonteCarloChartProps {
  data: MonteCarloResponse;
  loading?: boolean;
  error?: string;
  onRunSimulation?: (params: {
    initialValue: number;
    years: number;
    simulations: number;
    annualContribution: number;
  }) => void;
  className?: string;
  'data-testid'?: string;
}

export const MonteCarloChart: React.FC<MonteCarloChartProps> = ({
  data,
  loading = false,
  error,
  onRunSimulation,
  className,
  'data-testid': testId,
}) => {
  const [initialValue, setInitialValue] = useState(data.initialValue || 10000);
  const [years, setYears] = useState(data.years || 10);
  const [simulations, setSimulations] = useState(data.simulations || 1000);
  const [annualContribution, setAnnualContribution] = useState(data.annualContribution || 0);

  const handleRunSimulation = () => {
    onRunSimulation?.({
      initialValue,
      years,
      simulations,
      annualContribution,
    });
  };

  // Prepare percentiles chart data
  const percentilesData = React.useMemo(() => {
    if (!data.percentiles) return [];

    return Object.entries(data.percentiles).map(([key, value]) => ({
      name: key === 'mean' ? 'Mean' :
            key === 'median' ? 'Median' :
            key === 'min' ? 'Minimum' :
            key === 'max' ? 'Maximum' :
            key.replace('p', '') + '%',
      value: value,
      percentile: key,
    })).filter(item => item.percentile !== 'mean'); // Separate mean for better visualization
  }, [data.percentiles]);

  const percentilesSeries = [
    {
      key: 'value',
      name: 'Portfolio Value',
      color: COLORS.ACCENT,
    },
  ];

  // Prepare probability analysis data
  const probabilityData = React.useMemo(() => {
    if (!data.probabilities) return [];

    return Object.entries(data.probabilities).map(([key, value]) => ({
      name: key.replace('prob_reaching_', '').replace('_', ' ').toUpperCase(),
      probability: value,
    }));
  }, [data.probabilities]);

  const probabilitySeries = [
    {
      key: 'probability',
      name: 'Probability',
      color: COLORS.POSITIVE,
    },
  ];

  // Generate sample path data for visualization
  const generateSamplePaths = () => {
    if (!data.simulationDataSample) return [];

    const paths = data.simulationDataSample.slice(0, 10); // Show first 10 paths
    const timePoints = Array.from({ length: years + 1 }, (_, i) => i);

    return timePoints.map(year => {
      const point: any = { name: `Year ${year}` };
      paths.forEach((path, index) => {
        point[`path${index}`] = path[year] || initialValue;
      });
      return point;
    });
  };

  const samplePathData = generateSamplePaths();
  const pathSeries = Array.from({ length: 10 }, (_, i) => ({
    key: `path${i}`,
    name: `Path ${i + 1}`,
    color: `rgba(191, 159, 251, ${0.3 + (i * 0.07)})`,
    strokeWidth: 1,
  }));

  return (
    <Card
      title="Monte Carlo Simulation"
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Initial Value</label>
            <Input
              type="number"
              value={initialValue.toString()}
              onChange={(e) => setInitialValue(parseFloat(e.target.value) || 10000)}
              placeholder="Initial portfolio value"
              step={1000}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Time Horizon (Years)</label>
            <Input
              type="number"
              value={years.toString()}
              onChange={(e) => setYears(parseInt(e.target.value) || 10)}
              placeholder="Years"
              min={1}
              max={50}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Simulations</label>
            <Input
              type="number"
              value={simulations.toString()}
              onChange={(e) => setSimulations(parseInt(e.target.value) || 1000)}
              placeholder="Number of simulations"
              min={100}
              max={10000}
              step={100}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Annual Contribution</label>
            <Input
              type="number"
              value={annualContribution.toString()}
              onChange={(e) => setAnnualContribution(parseFloat(e.target.value) || 0)}
              placeholder="Annual contribution"
              step={500}
            />
          </div>

          <div className={styles.controlGroup}>
            <Button
              onClick={handleRunSimulation}
              disabled={loading}
              loading={loading}
            >
              Run Simulation
            </Button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span>Error running Monte Carlo simulation: {error}</span>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Summary Statistics */}
            <div className={styles.summarySection}>
              <h4 className={styles.sectionTitle}>Simulation Results</h4>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Initial Value</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(data.initialValue)}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Time Horizon</span>
                  <span className={styles.summaryValue}>
                    {data.years} years
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Simulations</span>
                  <span className={styles.summaryValue}>
                    {data.simulations.toLocaleString()}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Annual Contribution</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(data.annualContribution)}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Expected Return</span>
                  <span className={styles.summaryValue}>
                    {formatPercentage(data.annualMeanReturn)}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Volatility</span>
                  <span className={styles.summaryValue}>
                    {formatPercentage(data.annualVolatility)}
                  </span>
                </div>
              </div>
            </div>

            {/* Percentiles Chart */}
            {data.percentiles && (
              <div className={styles.chartSection}>
                <ChartContainer
                  title="Portfolio Value Distribution"
                  subtitle="Percentiles of final portfolio values"
                  height={300}
                >
                  <BarChart
                    data={percentilesData}
                    series={percentilesSeries}
                    height={250}
                    layout="horizontal"
                    showGrid
                    showLegend={false}
                    yAxisFormatter={(value) => value}
                    xAxisFormatter={(value) => formatCurrency(value)}
                    tooltipFormatter={(value, name) => [formatCurrency(value), 'Portfolio Value']}
                  />
                </ChartContainer>
              </div>
            )}

            {/* Sample Paths */}
            {samplePathData.length > 0 && (
              <div className={styles.chartSection}>
                <ChartContainer
                  title="Sample Simulation Paths"
                  subtitle="Representative portfolio growth trajectories"
                  height={400}
                >
                  <LineChart
                    data={samplePathData}
                    series={pathSeries}
                    height={350}
                    showGrid
                    showLegend={false}
                    yAxisFormatter={(value) => formatCurrency(value)}
                    tooltipFormatter={(value, name) => [formatCurrency(value), name]}
                  />
                </ChartContainer>
              </div>
            )}

            {/* Probability Analysis */}
            {data.probabilities && (
              <div className={styles.chartSection}>
                <ChartContainer
                  title="Probability Analysis"
                  subtitle="Likelihood of reaching return multiples"
                  height={250}
                >
                  <BarChart
                    data={probabilityData}
                    series={probabilitySeries}
                    height={200}
                    showGrid
                    showLegend={false}
                    yAxisFormatter={(value) => formatPercentage(value)}
                    tooltipFormatter={(value, name) => [formatPercentage(value), 'Probability']}
                  />
                </ChartContainer>
              </div>
            )}

            {/* Key Insights */}
            <div className={styles.insightsSection}>
              <h4 className={styles.sectionTitle}>Key Insights</h4>
              <div className={styles.insightsGrid}>
                <div className={styles.insightCard}>
                  <h5 className={styles.insightTitle}>Best Case Scenario</h5>
                  <div className={styles.insightValue}>
                    {data.percentiles?.max ? formatCurrency(data.percentiles.max) : 'N/A'}
                  </div>
                  <div className={styles.insightDescription}>
                    Maximum portfolio value achieved in simulations
                  </div>
                </div>

                <div className={styles.insightCard}>
                  <h5 className={styles.insightTitle}>Expected Outcome</h5>
                  <div className={styles.insightValue}>
                    {data.percentiles?.median ? formatCurrency(data.percentiles.median) : 'N/A'}
                  </div>
                  <div className={styles.insightDescription}>
                    Median portfolio value (50th percentile)
                  </div>
                </div>

                <div className={styles.insightCard}>
                  <h5 className={styles.insightTitle}>Worst Case Scenario</h5>
                  <div className={styles.insightValue}>
                    {data.percentiles?.min ? formatCurrency(data.percentiles.min) : 'N/A'}
                  </div>
                  <div className={styles.insightDescription}>
                    Minimum portfolio value in simulations
                  </div>
                </div>

                <div className={styles.insightCard}>
                  <h5 className={styles.insightTitle}>Success Rate</h5>
                  <div className={styles.insightValue}>
                    {data.simulationSummary?.successRate
                      ? formatPercentage(data.simulationSummary.successRate)
                      : 'N/A'}
                  </div>
                  <div className={styles.insightDescription}>
                    Probability of positive returns
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && !data && (
          <div className={styles.empty}>
            Configure parameters and run Monte Carlo simulation
          </div>
        )}
      </div>
    </Card>
  );
};

export default MonteCarloChart;