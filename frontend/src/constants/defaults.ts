/**
 * Default values and configuration settings used throughout the application
 */

// Default date ranges for analytics
export const DATE_RANGES = {
  ONE_WEEK: '1w',
  ONE_MONTH: '1m',
  THREE_MONTHS: '3m',
  SIX_MONTHS: '6m',
  ONE_YEAR: '1y',
  THREE_YEARS: '3y',
  FIVE_YEARS: '5y',
  TEN_YEARS: '10y',
  YEAR_TO_DATE: 'ytd',
  MAX: 'max',
};

// Default date format
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

// Default display date format
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';

// Default time intervals for data fetching
export const TIME_INTERVALS = {
  ONE_DAY: '1d',
  ONE_WEEK: '1wk',
  ONE_MONTH: '1mo',
};

// Default benchmark ticker
export const DEFAULT_BENCHMARK = 'SPY';

// Default risk-free rate (%)
export const DEFAULT_RISK_FREE_RATE = 2.0;

// Default portfolio settings
export const DEFAULT_PORTFOLIO_SETTINGS = {
  name: 'New Portfolio',
  description: '',
  tags: [],
};

// Default analytics settings
export const DEFAULT_ANALYTICS_SETTINGS = {
  dateRange: DATE_RANGES.ONE_YEAR,
  interval: TIME_INTERVALS.ONE_DAY,
  benchmark: DEFAULT_BENCHMARK,
  riskFreeRate: DEFAULT_RISK_FREE_RATE,
  includeDividends: true,
};

// Default optimization settings
export const DEFAULT_OPTIMIZATION_SETTINGS = {
  method: 'markowitz',
  riskFreeRate: DEFAULT_RISK_FREE_RATE,
  minWeight: 0.0,
  maxWeight: 1.0,
  targetReturn: null,
  targetRisk: null,
};

// Default risk management settings
export const DEFAULT_RISK_SETTINGS = {
  confidenceLevel: 0.95,
  timeHorizon: 1,
  simulationMethod: 'historical',
  simulations: 1000,
};

// Default pagination settings
export const DEFAULT_PAGINATION = {
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};

// Default chart colors for different assets/series
export const DEFAULT_CHART_COLORS = [
  '#BF9FFB', // Accent
  '#90BFF9', // Neutral 1
  '#FFF59D', // Neutral 2
  '#74F174', // Positive
  '#FAA1A4', // Negative
  '#D1D4DC', // Neutral Gray
  '#A880FA', // Active
  '#D3BFFC', // Hover
];

// Default chart settings
export const DEFAULT_CHART_SETTINGS = {
  height: 400,
  margin: { top: 10, right: 30, bottom: 30, left: 30 },
  animations: true,
  showGrid: true,
  showLegend: true,
  responsiveWidth: true,
};

// Default locale for number formatting
export const DEFAULT_NUMBER_LOCALE = 'en-US';

// Default number formatting options
export const DEFAULT_NUMBER_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// Default percentage formatting options
export const DEFAULT_PERCENTAGE_FORMAT = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// Default currency formatting options
export const DEFAULT_CURRENCY_FORMAT = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// Default table settings
export const DEFAULT_TABLE_SETTINGS = {
  pageSize: DEFAULT_PAGINATION.pageSize,
  showPagination: true,
  sortable: true,
  resizable: true,
  filterable: true,
};

// Default Monte Carlo simulation settings
export const DEFAULT_MONTE_CARLO_SETTINGS = {
  initialValue: 10000,
  years: 10,
  simulations: 1000,
  annualContribution: 0,
};

// Export all defaults as a single object
export default {
  DATE_RANGES,
  DEFAULT_DATE_FORMAT,
  DISPLAY_DATE_FORMAT,
  TIME_INTERVALS,
  DEFAULT_BENCHMARK,
  DEFAULT_RISK_FREE_RATE,
  DEFAULT_PORTFOLIO_SETTINGS,
  DEFAULT_ANALYTICS_SETTINGS,
  DEFAULT_OPTIMIZATION_SETTINGS,
  DEFAULT_RISK_SETTINGS,
  DEFAULT_PAGINATION,
  DEFAULT_CHART_COLORS,
  DEFAULT_CHART_SETTINGS,
  DEFAULT_NUMBER_LOCALE,
  DEFAULT_NUMBER_FORMAT,
  DEFAULT_PERCENTAGE_FORMAT,
  DEFAULT_CURRENCY_FORMAT,
  DEFAULT_TABLE_SETTINGS,
  DEFAULT_MONTE_CARLO_SETTINGS,
};