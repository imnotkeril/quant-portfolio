/**
 * Comparison Components Export
 * Central export file for all comparison-related components
 */

// Main Components
export { ComparisonDashboard } from './ComparisonDashboard/ComparisonDashboard';
export { PortfolioSelector } from './PortfolioSelector/PortfolioSelector';
export { ComparisonTable } from './ComparisonTable/ComparisonTable';
export { ComparisonChart } from './ComparisonChart/ComparisonChart';
export { DifferentialAnalysis } from './DifferentialAnalysis/DifferentialAnalysis';

// Type exports
export type { default as ComparisonDashboardProps } from './ComparisonDashboard/ComparisonDashboard';
export type { default as PortfolioSelectorProps } from './PortfolioSelector/PortfolioSelector';
export type { default as ComparisonTableProps } from './ComparisonTable/ComparisonTable';
export type { default as ComparisonChartProps } from './ComparisonChart/ComparisonChart';
export type { default as DifferentialAnalysisProps } from './DifferentialAnalysis/DifferentialAnalysis';

// Re-export types for convenience
export type { Portfolio } from './PortfolioSelector/PortfolioSelector';
export type { ChartType, ChartMetric } from './ComparisonChart/ComparisonChart';