/**
 * VaRAnalysis Component
 * Value at Risk analysis and visualization
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Input } from '../../common/Input/Input';
import { BarChart } from '../../charts/BarChart/BarChart';
import { COLORS } from '../../../constants/colors';
import { VaRResponse } from '../../../types/risk';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import styles from './VaRAnalysis.module.css';

interface VaRAnalysisProps {
  data: VaRResponse;
  portfolioValue?: number;
  loading?: boolean;
  error?: string;
  onCalculate?: (params: {
    confidenceLevel: number;
    timeHorizon: number;
    method: 'historical' | 'parametric' | 'monte_carlo';
    simulations?: number;
  }) => void;
  className?: string;
  'data-testid'?: string;
}

export const VaRAnalysis: React.FC<VaRAnalysisProps> = ({
  data,
  portfolioValue = 100000,
  loading = false,
  error,
  onCalculate,
  className,
  'data-testid': testId,
}) => {
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [timeHorizon, setTimeHorizon] = useState(1);
  const [method, setMethod] = useState<'historical' | 'parametric' | 'monte_carlo'>('historical');
  const [simulations, setSimulations] = useState(1000);

  const confidenceLevelOptions = [
    { value: '0.90', label: '90%' },
    { value: '0.95', label: '95%' },
    { value: '0.99', label: '99%' },
    { value: '0.999', label: '99.9%' },
  ];

  const timeHorizonOptions = [
    { value: '1', label: '1 Day' },
    { value: '5', label: '5 Days' },
    { value: '10', label: '10 Days' },
    { value: '22', label: '1 Month' },
    { value: '66', label: '3 Months' },
    { value: '252', label: '1 Year' },
  ];

  const methodOptions = [
    { value: 'historical', label: 'Historical Simulation' },
    { value: 'parametric', label: 'Parametric (Normal)' },
    { value: 'monte_carlo', label: 'Monte Carlo' },
  ];

  const handleCalculate = () => {
    onCalculate?.({
      confidenceLevel,
      timeHorizon,
      method,
      simulations: method === 'monte_carlo' ? simulations : undefined,
    });
  };

  // Calculate VaR in currency terms
  const varAmount = data.var ? Math.abs(data.var * portfolioValue) : 0;
  const varPercentage = data.var ? Math.abs(data.var) : 0;

  // Prepare chart data for VaR visualization
  const chartData = [
    {
      name: 'Expected Value',
      value: portfolioValue,
      color: COLORS.POSITIVE,
    },
    {
      name: `VaR (${formatPercentage(data.confidenceLevel || 0.95)})`,
      value: varAmount,
      color: COLORS.NEGATIVE,
    },
  ];

  const chartSeries = [
    {
      key: 'value',
      name: 'Amount',
      color: COLORS.ACCENT,
    },
  ];

  return (
    <Card
      title="Value at Risk (VaR) Analysis"
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Confidence Level</label>
            <Select
              value={confidenceLevel.toString()}
              onChange={(value) => {
                const level = Array.isArray(value) ? parseFloat(value[0]?.toString() || '0.95') : parseFloat(value.toString());
                setConfidenceLevel(level);
              }}
              options={confidenceLevelOptions}
              placeholder="Select confidence level"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Time Horizon</label>
            <Select
              value={timeHorizon.toString()}
              onChange={(value) => {
                const horizon = Array.isArray(value) ? parseInt(value[0]?.toString() || '1') : parseInt(value.toString());
                setTimeHorizon(horizon);
              }}
              options={timeHorizonOptions}
              placeholder="Select time horizon"
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Method</label>
            <Select
              value={method}
              onChange={(value) => {
                const methodValue = Array.isArray(value) ? value[0]?.toString() : value.toString();
                setMethod(methodValue as typeof method);
              }}
              options={methodOptions}
              placeholder="Select method"
            />
          </div>

          {method === 'monte_carlo' && (
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
          )}

          <div className={styles.controlGroup}>
            <Button
              onClick={handleCalculate}
              disabled={loading}
              loading={loading}
            >
              Calculate VaR
            </Button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span>Error calculating VaR: {error}</span>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Results Summary */}
            <div className={styles.results}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h4 className={styles.resultTitle}>VaR Results</h4>
                  <span className={styles.resultMethod}>
                    Method: {data.method || method}
                  </span>
                </div>

                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Confidence Level</span>
                    <span className={styles.resultValue}>
                      {formatPercentage(data.confidenceLevel || confidenceLevel)}
                    </span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Time Horizon</span>
                    <span className={styles.resultValue}>
                      {data.timeHorizon || timeHorizon} day{(data.timeHorizon || timeHorizon) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>VaR (Percentage)</span>
                    <span className={classNames(styles.resultValue, styles.varValue)}>
                      {formatPercentage(varPercentage)}
                    </span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>VaR (Amount)</span>
                    <span className={classNames(styles.resultValue, styles.varValue)}>
                      {formatCurrency(varAmount)}
                    </span>
                  </div>

                  {data.simulations && (
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Simulations</span>
                      <span className={styles.resultValue}>
                        {data.simulations.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.interpretation}>
                  <p className={styles.interpretationText}>
                    With {formatPercentage(data.confidenceLevel || confidenceLevel)} confidence,
                    the portfolio will not lose more than{' '}
                    <strong>{formatCurrency(varAmount)}</strong> ({formatPercentage(varPercentage)})
                    over the next {data.timeHorizon || timeHorizon} day{(data.timeHorizon || timeHorizon) !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className={styles.visualization}>
              <h4 className={styles.chartTitle}>VaR Visualization</h4>
              <BarChart
                data={chartData}
                series={chartSeries}
                height={200}
                showGrid={false}
                showLegend={false}
                yAxisFormatter={(value) => formatCurrency(value)}
                tooltipFormatter={(value, name) => [formatCurrency(value), name]}
              />
            </div>

            {/* Risk Interpretation */}
            <div className={styles.riskInterpretation}>
              <h4 className={styles.interpretationTitle}>Risk Interpretation</h4>
              <div className={styles.interpretationGrid}>
                <div className={styles.interpretationItem}>
                  <span className={styles.interpretationLabel}>Risk Level</span>
                  <span className={classNames(
                    styles.interpretationValue,
                    varPercentage > 0.1 ? styles.highRisk :
                    varPercentage > 0.05 ? styles.mediumRisk : styles.lowRisk
                  )}>
                    {varPercentage > 0.1 ? 'High' :
                     varPercentage > 0.05 ? 'Medium' : 'Low'}
                  </span>
                </div>

                <div className={styles.interpretationItem}>
                  <span className={styles.interpretationLabel}>Daily Risk</span>
                  <span className={styles.interpretationValue}>
                    {formatPercentage(varPercentage / Math.sqrt(data.timeHorizon || timeHorizon))}
                  </span>
                </div>

                <div className={styles.interpretationItem}>
                  <span className={styles.interpretationLabel}>Annual Risk (Est.)</span>
                  <span className={styles.interpretationValue}>
                    {formatPercentage(varPercentage * Math.sqrt(252 / (data.timeHorizon || timeHorizon)))}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && !data && (
          <div className={styles.empty}>
            Click "Calculate VaR" to generate Value at Risk analysis
          </div>
        )}
      </div>
    </Card>
  );
};

export default VaRAnalysis;