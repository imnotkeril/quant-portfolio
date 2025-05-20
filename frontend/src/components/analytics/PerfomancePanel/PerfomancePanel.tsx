import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/common/Card/Card';
import { MetricCard } from '../../../components/common/MetricCard/MetricCard';
import { LineChart } from '../../../components/charts/LineChart/LineChart';
import { MetricsTable } from '../MetricsTable/MetricsTable';
import { COLORS } from '../../../constants/colors';

interface PerformanceData {
  totalReturn: number;
  annualizedReturn: number;
  benchmarkReturn?: number;
  benchmarkAnnualizedReturn?: number;
  sharpeRatio: number;
  benchmarkSharpeRatio?: number;
  sortinoRatio: number;
  benchmarkSortinoRatio?: number;
  calmarRatio: number;
  benchmarkCalmarRatio?: number;
  alpha?: number;
  beta?: number;
  informationRatio?: number;
  trackingError?: number;
  successRate?: number;
  maxWinningStreak?: number;
  maxLosingStreak?: number;
  payoffRatio?: number;
  profitFactor?: number;
  timeSeriesData?: {
    dates: string[];
    portfolioValues: number[];
    benchmarkValues?: number[];
  };
  periodicReturns?: {
    period: string;
    portfolioReturn: number;
    benchmarkReturn?: number;
    difference?: number;
  }[];
}

interface PerformancePanelProps {
  portfolioId: string;
  timeRange?: string;
  benchmark?: string;
  isLoading?: boolean;
  performanceData?: PerformanceData;
  onTimeRangeChange?: (timeRange: string) => void;
  onBenchmarkChange?: (benchmark: string) => void;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({
  portfolioId,
  timeRange = '1Y',
  benchmark = 'SPY',
  isLoading = false,
  performanceData,
  onTimeRangeChange,
  onBenchmarkChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Function to determine delta color based on metric type
  const getDeltaColor = (metricName: string, portfolioValue: number, benchmarkValue: number): "normal" | "inverse" => {
    const difference = portfolioValue - benchmarkValue;

    // For these metrics, lower is better
    const lowerIsBetter = ['Volatility', 'Max Drawdown', 'VaR', 'CVaR', 'Down Capture'];

    if (lowerIsBetter.includes(metricName)) {
      return difference < 0 ? "normal" : "inverse";
    } else {
      return difference > 0 ? "normal" : "inverse";
    }
  };

  // Generate time series data for chart if available
  const renderPerformanceChart = () => {
    if (!performanceData?.timeSeriesData || performanceData.timeSeriesData.dates.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
        </div>
      );
    }

    const { dates, portfolioValues, benchmarkValues } = performanceData.timeSeriesData;

    const series = [
      {
        key: 'portfolio',
        name: 'Portfolio',
        color: COLORS.ACCENT,
      }
    ];

    if (benchmarkValues) {
      series.push({
        key: 'benchmark',
        name: benchmark,
        color: COLORS.NEUTRAL_1,
      });
    }

    const chartData = dates.map((date, index) => {
      const dataPoint: any = {
        date,
        portfolio: portfolioValues[index]
      };

      if (benchmarkValues) {
        dataPoint.benchmark = benchmarkValues[index];
      }

      return dataPoint;
    });

    return (
      <LineChart
        data={chartData}
        series={series}
        xAxisDataKey="date"
        height={350}
        showLegend={true}
        showGrid={true}
      />
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceData) return null;

    const {
      totalReturn,
      annualizedReturn,
      benchmarkReturn,
      benchmarkAnnualizedReturn,
      sharpeRatio,
      benchmarkSharpeRatio,
      sortinoRatio,
      benchmarkSortinoRatio,
      alpha,
      beta
    } = performanceData;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Return"
          value={`${(totalReturn * 100).toFixed(2)}%`}
          delta={benchmarkReturn !== undefined ? `${((totalReturn - benchmarkReturn) * 100).toFixed(2)}%` : undefined}
          deltaDirection={benchmarkReturn !== undefined ? getDeltaColor("Total Return", totalReturn, benchmarkReturn) : undefined}
          deltaLabel={benchmark}
        />

        <MetricCard
          title="Annual Return"
          value={`${(annualizedReturn * 100).toFixed(2)}%`}
          delta={benchmarkAnnualizedReturn !== undefined ? `${((annualizedReturn - benchmarkAnnualizedReturn) * 100).toFixed(2)}%` : undefined}
          deltaDirection={benchmarkAnnualizedReturn !== undefined ? getDeltaColor("Annual Return", annualizedReturn, benchmarkAnnualizedReturn) : undefined}
          deltaLabel={benchmark}
        />

        <MetricCard
          title="Sharpe Ratio"
          value={sharpeRatio.toFixed(2)}
          delta={benchmarkSharpeRatio !== undefined ? (sharpeRatio - benchmarkSharpeRatio).toFixed(2) : undefined}
          deltaDirection={benchmarkSharpeRatio !== undefined ? getDeltaColor("Sharpe Ratio", sharpeRatio, benchmarkSharpeRatio) : undefined}
          deltaLabel={benchmark}
        />

        <MetricCard
          title="Sortino Ratio"
          value={sortinoRatio.toFixed(2)}
          delta={benchmarkSortinoRatio !== undefined ? (sortinoRatio - benchmarkSortinoRatio).toFixed(2) : undefined}
          deltaDirection={benchmarkSortinoRatio !== undefined ? getDeltaColor("Sortino Ratio", sortinoRatio, benchmarkSortinoRatio) : undefined}
          deltaLabel={benchmark}
        />
      </div>
    );
  };

  const renderSecondaryMetrics = () => {
    if (!performanceData) return null;

    const {
      alpha,
      beta,
      informationRatio,
      successRate,
      payoffRatio,
      profitFactor
    } = performanceData;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {alpha !== undefined && (
          <MetricCard
            title="Alpha"
            value={`${(alpha * 100).toFixed(2)}%`}
            icon="trending-up"
            tooltip="Excess return over the benchmark"
          />
        )}

        {beta !== undefined && (
          <MetricCard
            title="Beta"
            value={beta.toFixed(2)}
            icon="activity"
            tooltip="Measure of volatility compared to the benchmark"
          />
        )}

        {informationRatio !== undefined && (
          <MetricCard
            title="Information Ratio"
            value={informationRatio.toFixed(2)}
            icon="bar-chart-2"
            tooltip="Excess return per unit of risk"
          />
        )}

        {successRate !== undefined && (
          <MetricCard
            title="Win Rate"
            value={`${(successRate * 100).toFixed(2)}%`}
            icon="percent"
            tooltip="Percentage of positive periods"
          />
        )}

        {payoffRatio !== undefined && (
          <MetricCard
            title="Payoff Ratio"
            value={payoffRatio.toFixed(2)}
            icon="divide-circle"
            tooltip="Average gain / Average loss"
          />
        )}

        {profitFactor !== undefined && (
          <MetricCard
            title="Profit Factor"
            value={profitFactor.toFixed(2)}
            icon="dollar-sign"
            tooltip="Gross profit / Gross loss"
          />
        )}
      </div>
    );
  };

  const renderPeriodicReturns = () => {
    if (!performanceData?.periodicReturns || performanceData.periodicReturns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No periodic return data available</p>
        </div>
      );
    }

    // Create metrics for the table
    const metrics = performanceData.periodicReturns.map(period => ({
      name: period.period,
      value: (period.portfolioReturn * 100).toFixed(2) + '%',
      benchmark: period.benchmarkReturn ? (period.benchmarkReturn * 100).toFixed(2) + '%' : undefined,
      difference: period.difference ? (period.difference * 100).toFixed(2) + '%' : undefined
    }));

    return <MetricsTable metrics={metrics} />;
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  // Render the component
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>

      {/* Time range and benchmark selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Range:</label>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm px-3 py-1"
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="3Y">3 Years</option>
            <option value="5Y">5 Years</option>
            <option value="MAX">Max</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Benchmark:</label>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm px-3 py-1"
            value={benchmark}
            onChange={(e) => onBenchmarkChange?.(e.target.value)}
          >
            <option value="SPY">S&P 500 (SPY)</option>
            <option value="QQQ">NASDAQ (QQQ)</option>
            <option value="DIA">Dow Jones (DIA)</option>
            <option value="IWM">Russell 2000 (IWM)</option>
            <option value="VTI">Total Market (VTI)</option>
          </select>
        </div>
      </div>

      {/* Performance metrics cards */}
      {renderPerformanceMetrics()}

      {/* Performance chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Performance Chart</h3>
        {renderPerformanceChart()}
      </div>

      {/* Secondary metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Additional Metrics</h3>
        {renderSecondaryMetrics()}
      </div>

      {/* Periodic returns */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Periodic Returns</h3>
        {renderPeriodicReturns()}
      </div>
    </Card>
  );
};

export default PerformancePanel;