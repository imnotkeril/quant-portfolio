import React from 'react';
import { Metric } from '../../../types/analytics';
import Card from '../../common/Card/Card';
import { getColorByValue } from '../../../constants/colors';

interface MetricsTableProps {
  metrics: Metric[];
  benchmark?: string;
  loading?: boolean;
  className?: string;
  showBenchmark?: boolean;
  showDifference?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
  onClick?: (metric: Metric) => void;
}

export const MetricsTable: React.FC<MetricsTableProps> = ({
  metrics,
  benchmark,
  loading = false,
  className = '',
  showBenchmark = true,
  showDifference = true,
  title = 'Metrics',
  description,
  compact = false,
  onClick,
}) => {
  // Group metrics by category if provided
  const hasCategories = metrics.some(m => m.category);

  const groupedMetrics = hasCategories
    ? metrics.reduce<Record<string, Metric[]>>((groups, metric) => {
        const category = metric.category || 'Other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(metric);
        return groups;
      }, {})
    : { 'All Metrics': metrics };

  // Function to determine if delta is positive based on metric type
  const isDeltaPositive = (metric: Metric, delta: number): boolean => {
    // For some metrics, lower values are better
    const lowerIsBetter = [
      'Volatility', 'Max Drawdown', 'VaR', 'CVaR', 'Downside Risk',
      'Downside Deviation', 'Beta', 'Down Capture'
    ];

    if (lowerIsBetter.some(term =>
      metric.name.includes(term) ||
      (metric.description && metric.description.includes(term))
    )) {
      return delta < 0;
    }

    return delta > 0;
  };

  // Format a metric value based on its type
  const formatMetricValue = (metric: Metric): string => {
    const value = metric.value;

    if (typeof value !== 'number') {
      return String(value || 'N/A');
    }

    // If metric name or description contains terms indicating percentage
    const isPercentage = [
      'Return', 'Drawdown', 'Capture', 'Alpha', 'Risk', 'Deviation', 'Ratio', 'VaR', 'CVaR'
    ].some(term =>
      metric.name.includes(term) ||
      (metric.description && metric.description.includes(term))
    );

    if (isPercentage) {
      return `${(value * 100).toFixed(2)}%`;
    }

    // Format different types of metrics appropriately
    if (metric.name.includes('Ratio')) {
      return value.toFixed(2);
    }

    if (value >= 10000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    if (value >= 10) {
      return value.toFixed(1);
    }

    return value.toFixed(2);
  };

  // Calculate difference between portfolio and benchmark
  const calculateDifference = (metric: Metric): string | null => {
    if (!showDifference || !showBenchmark || !metric.benchmark_value) {
      return null;
    }

    const diff = metric.value - metric.benchmark_value;

    // Handle percentage metrics
    const isPercentage = [
      'Return', 'Drawdown', 'Capture', 'Alpha', 'Risk', 'Deviation', 'Ratio', 'VaR', 'CVaR'
    ].some(term =>
      metric.name.includes(term) ||
      (metric.description && metric.description.includes(term))
    );

    if (isPercentage) {
      return `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(2)}%`;
    }

    if (metric.name.includes('Ratio')) {
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;
    }

    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`;
  };

  if (loading) {
    return <Card loading loadingRows={6} title={title} />;
  }

  if (metrics.length === 0) {
    return (
      <Card className={className} title={title}>
        <div className="py-6 text-center text-neutral-gray">
          No metrics available
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} title={title} subtitle={description}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-divider">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-gray uppercase tracking-wider">
                Metric
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                Value
              </th>
              {showBenchmark && (
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                  {benchmark || 'Benchmark'}
                </th>
              )}
              {showBenchmark && showDifference && (
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-gray uppercase tracking-wider">
                  Difference
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-divider">
            {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
              <React.Fragment key={category}>
                {hasCategories && !compact && (
                  <tr className="bg-background bg-opacity-30">
                    <td
                      colSpan={showBenchmark ? (showDifference ? 4 : 3) : 2}
                      className="px-4 py-2 text-sm font-medium text-text-light"
                    >
                      {category}
                    </td>
                  </tr>
                )}
                {categoryMetrics.map((metric, index) => {
                  const difference = calculateDifference(metric);
                  const isPositive = difference ? isDeltaPositive(metric, metric.value - (metric.benchmark_value || 0)) : false;
                  const diffColor = isPositive ? 'text-positive' : 'text-negative';

                  return (
                    <tr
                      key={`${category}-${metric.name}-${index}`}
                      className={`${
                        onClick ? 'cursor-pointer hover:bg-background hover:bg-opacity-50' : ''
                      }`}
                      onClick={() => onClick && onClick(metric)}
                    >
                      <td className="px-4 py-2 text-sm text-text-light whitespace-nowrap">
                        <div className="flex items-center">
                          {metric.name}
                          {metric.description && !compact && (
                            <span className="ml-2 text-neutral-gray text-xs cursor-help" title={metric.description}>
                              ⓘ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-text-light text-right whitespace-nowrap">
                        {formatMetricValue(metric)}
                      </td>
                      {showBenchmark && (
                        <td className="px-4 py-2 text-sm text-neutral-gray text-right whitespace-nowrap">
                          {metric.benchmark_value !== undefined && metric.benchmark_value !== null
                            ? formatMetricValue({...metric, value: metric.benchmark_value})
                            : '—'}
                        </td>
                      )}
                      {showBenchmark && showDifference && (
                        <td className={`px-4 py-2 text-sm ${diffColor} text-right whitespace-nowrap`}>
                          {difference || '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MetricsTable;