// Routes configuration for the application
export const ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Dashboard
  DASHBOARD: '/',

  // Portfolio management
  PORTFOLIO: {
    ROOT: '/portfolio',
    LIST: '/portfolio/list',
    CREATE: '/portfolio/create',
    IMPORT: '/portfolio/import',
    TEMPLATES: '/portfolio/templates',
    DETAILS: (id: string) => `/portfolio/${id}`,
    EDIT: (id: string) => `/portfolio/${id}/edit`,
    DUPLICATE: (id: string) => `/portfolio/${id}/duplicate`,
    DELETE: (id: string) => `/portfolio/${id}/delete`,
    EXPORT: (id: string) => `/portfolio/${id}/export`,
  },

  // Portfolio analysis
  ANALYSIS: {
    ROOT: '/analysis',
    PERFORMANCE: (id: string) => `/analysis/${id}/performance`,
    RISK: (id: string) => `/analysis/${id}/risk`,
    ASSETS: (id: string) => `/analysis/${id}/assets`,
    CORRELATIONS: (id: string) => `/analysis/${id}/correlations`,
    STRESS_TESTING: (id: string) => `/analysis/${id}/stress-testing`,
    ROLLING_METRICS: (id: string) => `/analysis/${id}/rolling-metrics`,
    ADVANCED: (id: string) => `/analysis/${id}/advanced`,
  },

  // Portfolio optimization
  OPTIMIZATION: {
    ROOT: '/optimization',
    EXISTING: '/optimization/existing',
    NEW: '/optimization/new',
    TACTICAL: '/optimization/tactical',
    MONTE_CARLO: '/optimization/monte-carlo',
  },

  // Scenario analysis
  SCENARIOS: {
    ROOT: '/scenarios',
    LIST: '/scenarios/list',
    CREATE: '/scenarios/create',
    DETAILS: (id: string) => `/scenarios/${id}`,
    SIMULATE: (id: string) => `/scenarios/${id}/simulate`,
  },

  // Historical analysis
  HISTORICAL: {
    ROOT: '/historical',
    CONTEXT: '/historical/context',
    ANALOGIES: '/historical/analogies',
    CRISIS: '/historical/crisis',
  },

  // Portfolio comparison
  COMPARISON: {
    ROOT: '/comparison',
    SELECT: '/comparison/select',
    RESULT: '/comparison/result',
  },

  // Reports
  REPORTS: {
    ROOT: '/reports',
    LIST: '/reports/list',
    CREATE: '/reports/create',
    TEMPLATES: '/reports/templates',
    SCHEDULED: '/reports/scheduled',
    VIEW: (id: string) => `/reports/${id}`,
  },

  // Settings
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    APPEARANCE: '/settings/appearance',
    PREFERENCES: '/settings/preferences',
    API: '/settings/api',
    NOTIFICATIONS: '/settings/notifications',
  },

  // Market data
  MARKET_DATA: {
    ROOT: '/market-data',
    SEARCH: '/market-data/search',
    DETAILS: (ticker: string) => `/market-data/${ticker}`,
  },

  // Errors and utility pages
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    SERVER_ERROR: '/500',
  },
};

export interface BreadcrumbItem {
  title: string;
  path: string;
  isActive?: boolean;
}

// Helper function to generate breadcrumbs for routes
export const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', path: ROUTES.DASHBOARD }
  ];

  const pathSegments = path.split('/').filter(Boolean);

  // Build the breadcrumb paths based on route segments
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Handle dynamic routes with IDs
    const isIdSegment = segment.length > 8 && /^[a-zA-Z0-9-]+$/.test(segment);

    // Map segment to title
    let title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    // Special handling for known routes
    if (segment === 'portfolio' && index === 0) {
      title = 'Portfolios';
    } else if (segment === 'analysis' && index === 0) {
      title = 'Analysis';
    } else if (segment === 'optimization' && index === 0) {
      title = 'Optimization';
    } else if (segment === 'reports' && index === 0) {
      title = 'Reports';
    } else if (segment === 'settings' && index === 0) {
      title = 'Settings';
    } else if (isIdSegment) {
      title = 'Details';
    }

    // Add to breadcrumbs
    breadcrumbs.push({
      title,
      path: currentPath,
      isActive: index === pathSegments.length - 1
    });
  });

  return breadcrumbs;
};

export default ROUTES;