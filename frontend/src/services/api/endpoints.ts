// API endpoints definitions
const endpoints = {
  // Portfolio endpoints
  portfolios: {
    list: '/portfolios',
    create: '/portfolios',
    details: (id: string) => `/portfolios/${id}`,
    update: (id: string) => `/portfolios/${id}`,
    delete: (id: string) => `/portfolios/${id}`,
    updatePrices: (id: string) => `/portfolios/${id}/update-prices`,
    fromText: '/portfolios/from-text',
    importCsv: '/portfolios/import-csv',
    exportCsv: (id: string) => `/portfolios/${id}/export-csv`,
  },

  // Analytics endpoints
  analytics: {
    performance: '/analytics/performance',
    risk: '/analytics/risk',
    returns: '/analytics/returns',
    cumulativeReturns: '/analytics/cumulative-returns',
    drawdowns: '/analytics/drawdowns',
    compare: '/analytics/compare',
  },

  // Enhanced analytics endpoints
  enhancedAnalytics: {
    rollingMetrics: '/enhanced-analytics/rolling-metrics',
    confidenceIntervals: '/enhanced-analytics/confidence-intervals',
    tailRisk: '/enhanced-analytics/tail-risk',
    seasonalPatterns: '/enhanced-analytics/seasonal-patterns',
    statistics: '/enhanced-analytics/statistics',
  },

  // Optimization endpoints
  optimization: {
    optimize: '/optimization',
    efficientFrontier: '/optimization/efficient-frontier',
    markowitz: '/optimization/markowitz',
    riskParity: '/optimization/risk-parity',
    minimumVariance: '/optimization/minimum-variance',
    maximumSharpe: '/optimization/maximum-sharpe',
    equalWeight: '/optimization/equal-weight',
  },

  // Advanced optimization endpoints
  advancedOptimization: {
    robust: '/advanced-optimization/robust',
    costAware: '/advanced-optimization/cost-aware',
    conditional: '/advanced-optimization/conditional',
    esg: '/advanced-optimization/esg',
    hierarchical: '/advanced-optimization/hierarchical',
  },

  // Risk management endpoints
  risk: {
    var: '/risk/var',
    cvar: '/risk/cvar',
    stressTest: '/risk/stress-test',
    customStressTest: '/risk/custom-stress-test',
    monteCarlo: '/risk/monte-carlo',
    drawdowns: '/risk/drawdowns',
    advancedMonteCarlo: '/risk/advanced-monte-carlo',
  },

  // Scenario endpoints
  scenarios: {
    list: '/scenarios',
    simulate: '/scenarios/simulate',
    impact: '/scenarios/impact',
  },

  // Historical analysis endpoints
  historical: {
    list: '/historical',
    context: '/historical/context',
    analogies: '/historical/analogies',
  },

  // Comparison endpoints
  comparison: {
    portfolios: '/comparison/portfolios',
    benchmark: '/comparison/benchmark',
    performance: '/comparison/performance',
    risk: '/comparison/risk',
    holdings: '/comparison/holdings',
  },

  // Report generation endpoints
  reports: {
    generate: '/reports/generate',
    compare: '/reports/compare',
    schedule: '/reports/schedule',
    scheduled: '/reports/scheduled',
    cancelScheduled: (id: string) => `/reports/scheduled/${id}`,
    history: '/reports/history',
    templates: '/reports/templates',
    download: (id: string) => `/reports/download/${id}`,
  },

  // Market data endpoints
  marketData: {
    prices: '/market-data/prices',
    search: '/market-data/search',
    sectors: '/market-data/sectors',
    indicators: '/market-data/indicators',
    fundamentals: '/market-data/fundamentals',
  },
};

export default endpoints;