/**
 * Application routes configuration
 */

export const ROUTES = {
  // Public routes
  HOME: '/',

  // Portfolio routes
  PORTFOLIO: {
    ROOT: '/portfolio',
    LIST: '/portfolio/list',
    CREATE: '/portfolio/create',
    DETAILS: '/portfolio/:id',
    EDIT: '/portfolio/:id/edit',
    ANALYZE: '/portfolio/:id/analyze',
    ANALYSIS: '/portfolio/:id/analysis',
    ANALYSIS_ROOT: '/portfolio/analysis', // ДОБАВЛЕНО: общий роут для выбора портфеля для анализа
    DETAILED_PATH: (id: string) => `/portfolio/${id}`,
    EDIT_PATH: (id: string) => `/portfolio/${id}/edit`,
    ANALYZE_PATH: (id: string) => `/portfolio/${id}/analyze`,
    ANALYSIS_PATH: (id: string) => `/portfolio/${id}/analysis`, // ДОБАВЛЕНО: путь для анализа конкретного портфеля
  },

  // Analytics routes
  ANALYTICS: {
    ROOT: '/analytics',
    PERFORMANCE: '/analytics/performance/:id',
    RISK: '/analytics/risk/:id',
    ENHANCED: '/analytics/enhanced/:id',
    ATTRIBUTION: '/analytics/attribution/:id', // ДОБАВЛЕНО: недостающий маршрут
    PERFORMANCE_PATH: (id: string) => `/analytics/performance/${id}`,
    RISK_PATH: (id: string) => `/analytics/risk/${id}`,
    ENHANCED_PATH: (id: string) => `/analytics/enhanced/${id}`,
  },

  // Optimization routes
  OPTIMIZATION: {
    ROOT: '/optimization',
    BASIC: '/optimization/basic/:id',
    ADVANCED: '/optimization/advanced/:id',
    EFFICIENT_FRONTIER: '/optimization/efficient-frontier/:id',
    COMPARISON: '/optimization/comparison', // ДОБАВЛЕНО: недостающий маршрут
    BASIC_PATH: (id: string) => `/optimization/basic/${id}`,
    ADVANCED_PATH: (id: string) => `/optimization/advanced/${id}`,
    EFFICIENT_FRONTIER_PATH: (id: string) => `/optimization/efficient-frontier/${id}`,
  },

  // Risk management routes
  RISK: {
    ROOT: '/risk',
    ASSESSMENT: '/risk/assessment/:id',
    STRESS_TEST: '/risk/stress-test/:id',
    MONTE_CARLO: '/risk/monte-carlo/:id',
    VAR: '/risk/var/:id', // ДОБАВЛЕНО: недостающий маршрут
    ASSESSMENT_PATH: (id: string) => `/risk/assessment/${id}`,
    STRESS_TEST_PATH: (id: string) => `/risk/stress-test/${id}`,
    MONTE_CARLO_PATH: (id: string) => `/risk/monte-carlo/${id}`,
  },

  // Scenario analysis routes
  SCENARIOS: {
    ROOT: '/scenarios',
    CREATE: '/scenarios/create',
    DETAILS: '/scenarios/:id',
    SIMULATION: '/scenarios/simulation/:id',
    HISTORICAL: '/scenarios/historical', // ДОБАВЛЕНО: недостающий маршрут
    DETAILS_PATH: (id: string) => `/scenarios/${id}`,
    SIMULATION_PATH: (id: string) => `/scenarios/simulation/${id}`,
  },

  // Historical analysis routes
  HISTORICAL: {
    ROOT: '/historical',
    ANALOGIES: '/historical/analogies',
    CONTEXT: '/historical/context/:id',
    CONTEXT_PATH: (id: string) => `/historical/context/${id}`,
  },

  // Portfolio comparison routes
  COMPARISON: {
    ROOT: '/comparison',
    CREATE: '/comparison/create',
    RESULTS: '/comparison/results',
    DETAILS: '/comparison/:id',
    PERFORMANCE: '/comparison/performance', // ДОБАВЛЕНО: недостающий маршрут
    RISK: '/comparison/risk', // ДОБАВЛЕНО: недостающий маршрут
    DETAILS_PATH: (id: string) => `/comparison/${id}`,
  },

  // Report generation routes
  REPORTS: {
    ROOT: '/reports',
    GENERATE: '/reports/generate',
    HISTORY: '/reports/history',
    SCHEDULED: '/reports/scheduled',
    TEMPLATES: '/reports/templates',
    DETAILS: '/reports/:id',
    DETAILS_PATH: (id: string) => `/reports/${id}`,
  },

  // Settings and user account routes
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    PREFERENCES: '/settings/preferences',
    API: '/settings/api',
  },

  // Error and utility routes
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
};

/**
 * Navigation configuration for main sidebar menu
 */
export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.HOME,
    icon: 'dashboard',
  },
  {
    label: 'Portfolios',
    path: ROUTES.PORTFOLIO.ROOT,
    icon: 'portfolio',
    children: [
      {
        label: 'All Portfolios',
        path: ROUTES.PORTFOLIO.LIST,
      },
      {
        label: 'Create Portfolio',
        path: ROUTES.PORTFOLIO.CREATE,
      },
    ],
  },
  {
    label: 'Portfolio Analysis', // ДОБАВЛЕНО: отдельная страница анализа портфелей
    path: ROUTES.PORTFOLIO.ANALYSIS_ROOT,
    icon: 'chart',
  },
  {
    label: 'Analytics',
    path: ROUTES.ANALYTICS.ROOT,
    icon: 'analytics',
  },
  {
    label: 'Optimization',
    path: ROUTES.OPTIMIZATION.ROOT,
    icon: 'optimization',
  },
  {
    label: 'Risk Management',
    path: ROUTES.RISK.ROOT,
    icon: 'risk',
  },
  {
    label: 'Scenarios',
    path: ROUTES.SCENARIOS.ROOT,
    icon: 'scenarios',
  },
  {
    label: 'Historical Analysis',
    path: ROUTES.HISTORICAL.ROOT,
    icon: 'historical',
  },
  {
    label: 'Comparison',
    path: ROUTES.COMPARISON.ROOT,
    icon: 'comparison',
  },
  {
    label: 'Reports',
    path: ROUTES.REPORTS.ROOT,
    icon: 'reports',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS.ROOT,
    icon: 'settings',
  },
];

export default ROUTES;