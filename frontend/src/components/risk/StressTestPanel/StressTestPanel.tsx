/**
 * StressTestPanel Component
 * Stress testing analysis and scenario selection
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { Input } from '../../common/Input/Input';
import { Table } from '../../common/Table/Table';
import { BarChart } from '../../charts/BarChart/BarChart';
import { COLORS } from '../../../constants/colors';
import { StressTestResponse } from '../../../types/risk';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import styles from './StressTestPanel.module.css';

interface StressTestResult extends StressTestResponse {
  id: string;
}

interface StressTestPanelProps {
  results: StressTestResult[];
  availableScenarios?: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  portfolioValue?: number;
  loading?: boolean;
  error?: string;
  onRunStressTest?: (scenario: string) => void;
  onRunCustomStressTest?: (shocks: Record<string, number>) => void;
  className?: string;
  'data-testid'?: string;
}

export const StressTestPanel: React.FC<StressTestPanelProps> = ({
  results,
  availableScenarios = [],
  portfolioValue = 100000,
  loading = false,
  error,
  onRunStressTest,
  onRunCustomStressTest,
  className,
  'data-testid': testId,
}) => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customShocks, setCustomShocks] = useState<Record<string, number>>({});
  const [showCustom, setShowCustom] = useState(false);

  const handleRunScenario = () => {
    if (selectedScenario) {
      onRunStressTest?.(selectedScenario);
    }
  };

  const handleRunCustom = () => {
    if (Object.keys(customShocks).length > 0) {
      onRunCustomStressTest?.(customShocks);
    }
  };

  const addCustomShock = () => {
    const newKey = `Asset_${Object.keys(customShocks).length + 1}`;
    setCustomShocks(prev => ({ ...prev, [newKey]: -0.1 }));
  };

  const updateCustomShock = (key: string, value: number) => {
    setCustomShocks(prev => ({ ...prev, [key]: value / 100 }));
  };

  const removeCustomShock = (key: string) => {
    setCustomShocks(prev => {
      const newShocks = { ...prev };
      delete newShocks[key];
      return newShocks;
    });
  };

  // Prepare chart data
  const chartData = results.map(result => ({
    name: result.scenarioName || result.scenario || 'Unknown',
    loss: Math.abs(result.portfolioLoss),
    afterShock: result.portfolioAfterShock,
  }));

  const chartSeries = [
    {
      key: 'loss',
      name: 'Portfolio Loss',
      color: COLORS.NEGATIVE,
    },
  ];

  // Table columns
  const columns = [
    {
      key: 'scenario',
      title: 'Scenario',
      dataIndex: 'scenarioName' as keyof StressTestResult,
      render: (value: string, record: StressTestResult) => (
        <div className={styles.scenarioCell}>
          <span className={styles.scenarioName}>
            {value || record.scenario || 'Unknown'}
          </span>
          {record.scenarioDescription && (
            <span className={styles.scenarioDescription}>
              {record.scenarioDescription}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'shock',
      title: 'Shock',
      dataIndex: 'shockPercentage' as keyof StressTestResult,
      render: (value: number) => (
        <span className={styles.shockValue}>
          {formatPercentage(value)}
        </span>
      ),
      align: 'center' as const,
    },
    {
      key: 'loss',
      title: 'Portfolio Loss',
      dataIndex: 'portfolioLoss' as keyof StressTestResult,
      render: (value: number) => (
        <span className={styles.lossValue}>
          {formatCurrency(Math.abs(value))}
        </span>
      ),
      align: 'right' as const,
    },
    {
      key: 'afterShock',
      title: 'Value After Shock',
      dataIndex: 'portfolioAfterShock' as keyof StressTestResult,
      render: (value: number) => (
        <span className={styles.afterShockValue}>
          {formatCurrency(value)}
        </span>
      ),
      align: 'right' as const,
    },
    {
      key: 'recovery',
      title: 'Recovery Time',
      render: (_: any, record: StressTestResult) => (
        <span className={styles.recoveryValue}>
          {record.recoveryDays ? `${record.recoveryDays} days` :
           record.recoveryMonths ? `${record.recoveryMonths.toFixed(1)} months` : 'N/A'}
        </span>
      ),
      align: 'center' as const,
    },
  ];

  return (
    <Card
      title="Stress Testing"
      loading={loading}
      className={classNames(styles.container, className)}
      data-testid={testId}
    >
      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.scenarioControls}>
            <h4 className={styles.controlsTitle}>Historical Scenarios</h4>
            <div className={styles.scenarioSelection}>
              <Select
                value={selectedScenario}
                onChange={(value) => {
                  const scenario = Array.isArray(value) ? value[0]?.toString() : value.toString();
                  setSelectedScenario(scenario);
                }}
                options={availableScenarios}
                placeholder="Select stress test scenario"
                fullWidth
              />
              <Button
                onClick={handleRunScenario}
                disabled={!selectedScenario || loading}
                loading={loading}
              >
                Run Test
              </Button>
            </div>
          </div>

          <div className={styles.customControls}>
            <div className={styles.customHeader}>
              <h4 className={styles.controlsTitle}>Custom Scenario</h4>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowCustom(!showCustom)}
              >
                {showCustom ? 'Hide' : 'Show'} Custom
              </Button>
            </div>

            {showCustom && (
              <div className={styles.customShocks}>
                <div className={styles.shocksHeader}>
                  <span>Asset Shocks (% change)</span>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={addCustomShock}
                  >
                    Add Asset
                  </Button>
                </div>

                <div className={styles.shocksList}>
                  {Object.entries(customShocks).map(([key, value]) => (
                    <div key={key} className={styles.shockItem}>
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newShocks = { ...customShocks };
                          delete newShocks[key];
                          newShocks[e.target.value] = value;
                          setCustomShocks(newShocks);
                        }}
                        placeholder="Asset name"
                        className={styles.assetInput}
                      />
                      <Input
                        type="number"
                        value={(value * 100).toString()}
                        onChange={(e) => updateCustomShock(key, parseFloat(e.target.value) || 0)}
                        placeholder="% change"
                        step={0.1}
                        className={styles.shockInput}
                      />
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => removeCustomShock(key)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                {Object.keys(customShocks).length > 0 && (
                  <Button
                    onClick={handleRunCustom}
                    disabled={loading}
                    loading={loading}
                    className={styles.runCustomButton}
                  >
                    Run Custom Test
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span>Error running stress test: {error}</span>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <>
            {/* Summary Chart */}
            <div className={styles.chartSection}>
              <h4 className={styles.sectionTitle}>Stress Test Results</h4>
              <BarChart
                data={chartData}
                series={chartSeries}
                height={250}
                layout="horizontal"
                showGrid
                showLegend={false}
                yAxisFormatter={(value) => value}
                xAxisFormatter={(value) => formatCurrency(value)}
                tooltipFormatter={(value, name) => [formatCurrency(value), 'Portfolio Loss']}
              />
            </div>

            {/* Results Table */}
            <div className={styles.tableSection}>
              <h4 className={styles.sectionTitle}>Detailed Results</h4>
              <Table
                data={results}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </div>

            {/* Summary Statistics */}
            <div className={styles.summarySection}>
              <h4 className={styles.sectionTitle}>Summary Statistics</h4>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Worst Case Loss</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(Math.max(...results.map(r => Math.abs(r.portfolioLoss))))}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Average Loss</span>
                  <span className={styles.summaryValue}>
                    {formatCurrency(
                      results.reduce((sum, r) => sum + Math.abs(r.portfolioLoss), 0) / results.length
                    )}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Scenarios Tested</span>
                  <span className={styles.summaryValue}>
                    {results.length}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Avg Recovery Time</span>
                  <span className={styles.summaryValue}>
                    {results.filter(r => r.recoveryDays).length > 0
                      ? `${Math.round(
                          results
                            .filter(r => r.recoveryDays)
                            .reduce((sum, r) => sum + (r.recoveryDays || 0), 0) /
                          results.filter(r => r.recoveryDays).length
                        )} days`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && results.length === 0 && (
          <div className={styles.empty}>
            Select a scenario and run stress test to see results
          </div>
        )}
      </div>
    </Card>
  );
};

export default StressTestPanel;