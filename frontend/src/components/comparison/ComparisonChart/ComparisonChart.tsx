/**
 * ComparisonChart Component
 * Chart component for visualizing portfolio comparison data
 */
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { LineChart } from '../../charts/LineChart/LineChart';
import { BarChart } from '../../charts/BarChart/BarChart';
import { HeatmapChart } from '../../charts/HeatmapChart/HeatmapChart';
import { ChartContainer } from '../../charts/ChartContainer/ChartContainer';
import { Button } from '../../common/Button/Button';
import { Select } from '../../common/Select/Select';
import { COLORS } from '../../../constants/colors';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import { getChartColor } from '../../../utils/color';
import styles from './ComparisonChart.module.css';

export type ChartType = 'line' | 'bar' | 'heatmap' | 'area';
export type ChartMetric = 'cumulative_returns' | 'rolling_returns' | 'drawdown' | 'risk_metrics' | 'correlation';

interface ComparisonChartProps {
  data: any;
  portfolios: string[];
  chartType?: ChartType;
  metric?: ChartMetric;
  height?: number;
  showControls?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  portfolios,
  chartType = 'line',
  metric = 'cumulative_returns',
  height = 400,
  showControls = true,
  className,
  'data-testid': testId,
}) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(chartType);
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>(metric);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'area', label: 'Area Chart' },
  ];

  // Metric options
  const metricOptions = [
    { value: 'cumulative_returns', label: 'Cumulative Returns' },
    { value: 'rolling_returns', label: 'Rolling Returns' },
    { value: 'drawdown', label: 'Drawdown' },
    { value: 'risk_metrics', label: 'Risk Metrics' },
    { value: 'correlation', label: 'Correlation' },
  ];

  // Timeframe options
  const timeframeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '1Y', label: '1 Year' },
    { value: '6M', label: '6 Months' },
    { value: '3M', label: '3 Months' },
    { value: '1M', label: '1 Month' },
  ];

  // Process data based on selected metric
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      // Generate mock data for demonstration
      return generateMockData(selectedMetric, portfolios);
    }

    // Filter data by timeframe if needed
    let filteredData = data;
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (selectedTimeframe) {
        case '1Y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case '6M':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '3M':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '1M':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filteredData = data.filter(item =>
        item.date && new Date(item.date) >= cutoffDate
      );
    }

    return filteredData;
  }, [data, selectedMetric, selectedTimeframe, portfolios]);

  // Generate mock data for demonstration
  const generateMockData = (metricType: ChartMetric, portfolioList: string[]) => {
    const dataPoints = 50;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i));

      const point: any = {
        name: date.toISOString().split('T')[0],
        date: date.toISOString(),
      };

      portfolioList.forEach((portfolio, index) => {
        switch (metricType) {
          case 'cumulative_returns':
            point[portfolio] = Math.pow(1 + (Math.random() - 0.5) * 0.02, i) * 100;
            break;
          case 'rolling_returns':
            point[portfolio] = (Math.random() - 0.5) * 10;
            break;
          case 'drawdown':
            point[portfolio] = -Math.random() * 20;
            break;
          case 'risk_metrics':
            point[portfolio] = Math.random() * 25;
            break;
          case 'correlation':
            point[portfolio] = (Math.random() - 0.5) * 2;
            break;
        }
      });

      data.push(point);
    }

    return data;
  };

  // Generate series configuration for charts
  const generateSeries = () => {
    return portfolios.map((portfolio, index) => ({
      key: portfolio,
      name: `Portfolio ${index + 1}`,
      color: getChartColor(index),
      type: selectedChartType === 'area' ? 'monotone' as const : undefined,
    }));
  };

  // Format data for heatmap
  const formatHeatmapData = () => {
    if (selectedMetric !== 'correlation') return [];

    const heatmapData = [];
    for (let i = 0; i < portfolios.length; i++) {
      for (let j = 0; j < portfolios.length; j++) {
        heatmapData.push({
          x: `Portfolio ${i + 1}`,
          y: `Portfolio ${j + 1}`,
          value: i === j ? 1 : Math.random() * 0.8 + 0.1, // Mock correlation
        });
      }
    }
    return heatmapData;
  };

  // Format data for bar chart
  const formatBarData = () => {
    if (selectedMetric === 'risk_metrics') {
      return [
        {
          name: 'Volatility',
          ...portfolios.reduce((acc, portfolio, index) => ({
            ...acc,
            [portfolio]: Math.random() * 25 + 5
          }), {})
        },
        {
          name: 'Sharpe Ratio',
          ...portfolios.reduce((acc, portfolio, index) => ({
            ...acc,
            [portfolio]: Math.random() * 2 + 0.5
          }), {})
        },
        {
          name: 'Max Drawdown',
          ...portfolios.reduce((acc, portfolio, index) => ({
            ...acc,
            [portfolio]: -(Math.random() * 20 + 5)
          }), {})
        },
      ];
    }

    return processedData.slice(-10); // Last 10 data points for bar chart
  };

  // Get appropriate formatter for Y-axis
  const getYAxisFormatter = () => {
    switch (selectedMetric) {
      case 'cumulative_returns':
      case 'rolling_returns':
      case 'drawdown':
        return (value: number) => formatPercentage(value / 100);
      case 'correlation':
        return (value: number) => value.toFixed(2);
      default:
        return (value: number) => value.toFixed(1);
    }
  };

  // Export chart data
  const handleExport = () => {
    const exportData = {
      metric: selectedMetric,
      chartType: selectedChartType,
      timeframe: selectedTimeframe,
      portfolios,
      data: processedData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison_chart_${selectedMetric}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render appropriate chart based on type and metric
  const renderChart = () => {
    if (selectedChartType === 'heatmap' || selectedMetric === 'correlation') {
      return (
        <HeatmapChart
          data={formatHeatmapData()}
          height={height}
          colorScale="correlation"
          showLabels
          showTooltip
        />
      );
    }

    if (selectedChartType === 'bar' || selectedMetric === 'risk_metrics') {
      return (
        <BarChart
          data={formatBarData()}
          series={generateSeries()}
          layout="vertical"
          yAxisFormatter={getYAxisFormatter()}
          height={height}
          showGrid
          showLegend
        />
      );
    }

    // Default to line chart
    return (
      <LineChart
        data={processedData}
        series={generateSeries()}
        yAxisFormatter={getYAxisFormatter()}
        height={height}
        showGrid
        showLegend
      />
    );
  };

  const containerClasses = classNames(
    styles.container,
    className
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      <ChartContainer
        title={`Portfolio Comparison - ${metricOptions.find(opt => opt.value === selectedMetric)?.label}`}
        subtitle={`${chartTypeOptions.find(opt => opt.value === selectedChartType)?.label} view`}
        height={height}
        exportOptions={{
          onExportData: handleExport,
        }}
        actions={showControls ? (
          <div className={styles.chartControls}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Chart Type:</label>
              <Select
                value={selectedChartType}
                onChange={(value) => setSelectedChartType(value as ChartType)}
                options={chartTypeOptions}
                size="small"
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Metric:</label>
              <Select
                value={selectedMetric}
                onChange={(value) => setSelectedMetric(value as ChartMetric)}
                options={metricOptions}
                size="small"
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Timeframe:</label>
              <Select
                value={selectedTimeframe}
                onChange={(value) => setSelectedTimeframe(String(value))}
                options={timeframeOptions}
                size="small"
              />
            </div>
          </div>
        ) : undefined}
      >
        {renderChart()}
      </ChartContainer>

      {/* Chart Legend/Info */}
      <div className={styles.chartInfo}>
        <div className={styles.portfolioLegend}>
          {portfolios.map((portfolio, index) => (
            <div key={portfolio} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: getChartColor(index) }}
              />
              <span className={styles.legendLabel}>
                Portfolio {index + 1}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.chartMetrics}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Data Points:</span>
            <span className={styles.metricValue}>{processedData.length}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Timeframe:</span>
            <span className={styles.metricValue}>
              {timeframeOptions.find(opt => opt.value === selectedTimeframe)?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;