// Default values for the application
export const DEFAULTS = {
  // Default date ranges for historical data
  DATE_RANGES: {
    ONE_MONTH: { label: '1M', days: 30 },
    THREE_MONTHS: { label: '3M', days: 90 },
    SIX_MONTHS: { label: '6M', days: 180 },
    ONE_YEAR: { label: '1Y', days: 365 },
    THREE_YEARS: { label: '3Y', days: 1095 },
    FIVE_YEARS: { label: '5Y', days: 1825 },
    YTD: { label: 'YTD', days: 0 }, // Special case, calculated dynamically
    MAX: { label: 'MAX', days: 0 }, // Special case, no limit
  },

  // Default benchmark tickers
  BENCHMARKS: [
    { value: 'SPY', label: 'S&P 500 (SPY)' },
    { value: 'QQQ', label: 'NASDAQ 100 (QQQ)' },
    { value: 'DIA', label: 'Dow Jones (DIA)' },
    { value: 'IWM', label: 'Russell 2000 (IWM)' },
    { value: 'VTI', label: 'Total US Market (VTI)' },
    { value: 'ACWI', label: 'All World (ACWI)' },
    { value: 'EFA', label: 'EAFE (EFA)' },
    { value: 'AGG', label: 'US Aggregate Bond (AGG)' },
  ],

  // Default risk-free rate (annually)
  RISK_FREE_RATE: 0.03, // 3%

  // Default portfolio optimization settings
  OPTIMIZATION: {
    MIN_WEIGHT: 0.01, // 1%
    MAX_WEIGHT: 0.25, // 25%
    TARGET_RETURN: 0.10, // 10%
  },

  // Default Monte Carlo simulation settings
  MONTE_CARLO: {
    YEARS: 10,
    SIMULATIONS: 1000,
    INITIAL_INVESTMENT: 10000,
    ANNUAL_CONTRIBUTION: 0,
  },

  // Default stress test scenarios
  STRESS_TEST_SCENARIOS: [
    { id: 'financial_crisis_2008', name: 'Financial Crisis 2008' },
    { id: 'covid_2020', name: 'COVID-19 Pandemic (2020)' },
    { id: 'tech_bubble_2000', name: 'Dot-com Crash (2000-2002)' },
    { id: 'black_monday_1987', name: 'Black Monday (1987)' },
    { id: 'inflation_shock', name: 'Inflation Shock (2021-2022)' },
    { id: 'rate_hike_2018', name: 'Fed Rate Hike (2018)' },
    { id: 'moderate_recession', name: 'Moderate Recession' },
    { id: 'severe_recession', name: 'Severe Recession' },
  ],

  // Default portfolio templates
  PORTFOLIO_TEMPLATES: [
    {
      id: 'sp500_top10',
      name: 'S&P 500 Top 10',
      description: 'The 10 Largest Companies in the S&P 500 Index',
      assets: [
        { ticker: 'AAPL', weight: 0.20, sector: 'Technology' },
        { ticker: 'MSFT', weight: 0.18, sector: 'Technology' },
        { ticker: 'AMZN', weight: 0.12, sector: 'Consumer Discretionary' },
        { ticker: 'NVDA', weight: 0.10, sector: 'Technology' },
        { ticker: 'GOOGL', weight: 0.09, sector: 'Communication Services' },
        { ticker: 'META', weight: 0.08, sector: 'Communication Services' },
        { ticker: 'GOOG', weight: 0.07, sector: 'Communication Services' },
        { ticker: 'BRK.B', weight: 0.06, sector: 'Financials' },
        { ticker: 'TSLA', weight: 0.05, sector: 'Consumer Discretionary' },
        { ticker: 'UNH', weight: 0.05, sector: 'Healthcare' },
      ],
    },
    {
      id: 'classic_60_40',
      name: 'Classic 60/40',
      description: 'Classic allocation: 60% stocks, 40% bonds',
      assets: [
        { ticker: 'VOO', weight: 0.40, sector: 'Equities', asset_class: 'ETF' },
        { ticker: 'VEA', weight: 0.20, sector: 'Equities', asset_class: 'ETF' },
        { ticker: 'BND', weight: 0.30, sector: 'Fixed Income', asset_class: 'ETF' },
        { ticker: 'BNDX', weight: 0.10, sector: 'Fixed Income', asset_class: 'ETF' },
      ],
    },
    {
      id: 'equal_weight',
      name: 'Portfolio of constant weights',
      description: 'Even distribution between asset classes',
      assets: [
        { ticker: 'VTI', weight: 0.25, sector: 'Equities', asset_class: 'ETF' },
        { ticker: 'TLT', weight: 0.25, sector: 'Fixed Income', asset_class: 'ETF' },
        { ticker: 'GLD', weight: 0.25, sector: 'Commodities', asset_class: 'ETF' },
        { ticker: 'IEF', weight: 0.25, sector: 'Fixed Income', asset_class: 'ETF' },
      ],
    },
    {
      id: 'dividend_portfolio',
      name: 'Dividend portfolio',
      description: 'A portfolio focused on stable dividends',
      assets: [
        { ticker: 'VYM', weight: 0.20, sector: 'Equities', asset_class: 'ETF' },
        { ticker: 'SCHD', weight: 0.20, sector: 'Equities', asset_class: 'ETF' },
        { ticker: 'PG', weight: 0.10, sector: 'Consumer Staples' },
        { ticker: 'JNJ', weight: 0.10, sector: 'Healthcare' },
        { ticker: 'KO', weight: 0.10, sector: 'Consumer Staples' },
        { ticker: 'PEP', weight: 0.10, sector: 'Consumer Staples' },
        { ticker: 'MCD', weight: 0.10, sector: 'Consumer Discretionary' },
        { ticker: 'MMM', weight: 0.10, sector: 'Industrials' },
      ],
    },
  ],

  // Default pagination settings
  PAGINATION: {
    PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // Default table sorting
  TABLE_SORT: {
    COLUMN: 'name',
    DIRECTION: 'asc' as 'asc' | 'desc',
  },

  // Default chart settings
  CHART: {
    HEIGHT: 400,
    ANIMATION_DURATION: 500,
  },
};

export default DEFAULTS;