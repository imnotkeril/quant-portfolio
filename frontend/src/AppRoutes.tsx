/**
 * Application Routes
 * Central routing configuration for the application
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageContainer } from './components/layout/PageContainer/PageContainer';
import { ROUTES } from './constants/routes';

// Import pages
import {
  Dashboard,
  PortfolioCreation,
  PortfolioAnalysis,
  PortfolioOptimization,
  RiskManagement,
  ScenarioAnalysis,
  HistoricalAnalogies,
  PortfolioComparison,
  ReportGeneration,
} from './pages';

// Error pages (to be implemented)
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

// Loading component
const PageLoader: React.FC = () => (
  <PageContainer>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: 'var(--color-text-secondary)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary-500)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p>Loading page...</p>
    </div>
  </PageContainer>
);

// Coming Soon component for unimplemented features
const ComingSoon: React.FC<{ pageName: string }> = ({ pageName }) => (
  <PageContainer>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center',
      color: 'var(--color-text-secondary)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem'
      }}>
        {pageName} Coming Soon
      </h2>
      <p style={{ marginBottom: '2rem' }}>
        This feature is currently under development and will be available soon.
      </p>
    </div>
  </PageContainer>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dashboard - Home */}
        <Route path={ROUTES.HOME} element={<Dashboard />} />
        <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />

        {/* Portfolio Routes */}
        <Route path={ROUTES.PORTFOLIO.ROOT} element={<Navigate to={ROUTES.PORTFOLIO.LIST} replace />} />
        <Route path={ROUTES.PORTFOLIO.LIST} element={<Dashboard />} /> {/* Reuse dashboard for now */}
        <Route path={ROUTES.PORTFOLIO.CREATE} element={<PortfolioCreation />} />
        <Route path={ROUTES.PORTFOLIO.ANALYSIS} element={<PortfolioAnalysis />} />
        <Route path={ROUTES.PORTFOLIO.EDIT} element={<ComingSoon pageName="Portfolio Edit" />} />

        {/* Analytics Routes */}
        <Route path={ROUTES.ANALYTICS.ROOT} element={<PortfolioAnalysis />} />
        <Route path={ROUTES.ANALYTICS.PERFORMANCE} element={<ComingSoon pageName="Performance Analytics" />} />
        <Route path={ROUTES.ANALYTICS.ATTRIBUTION} element={<ComingSoon pageName="Attribution Analysis" />} />

        {/* Optimization Routes */}
        <Route path={ROUTES.OPTIMIZATION.ROOT} element={<PortfolioOptimization />} />
        <Route path={ROUTES.OPTIMIZATION.ADVANCED} element={<ComingSoon pageName="Advanced Optimization" />} />
        <Route path={ROUTES.OPTIMIZATION.COMPARISON} element={<ComingSoon pageName="Optimization Comparison" />} />

        {/* Risk Management Routes */}
        <Route path={ROUTES.RISK.ROOT} element={<RiskManagement />} />
        <Route path={ROUTES.RISK.VAR} element={<RiskManagement />} />
        <Route path={ROUTES.RISK.STRESS_TEST} element={<RiskManagement />} />
        <Route path={ROUTES.RISK.MONTE_CARLO} element={<RiskManagement />} />

        {/* Scenario Analysis Routes */}
        <Route path={ROUTES.SCENARIOS.ROOT} element={<ScenarioAnalysis />} />
        <Route path={ROUTES.SCENARIOS.CREATE} element={<ScenarioAnalysis />} />
        <Route path={ROUTES.SCENARIOS.HISTORICAL} element={<ScenarioAnalysis />} />

        {/* Historical Analysis Routes */}
        <Route path={ROUTES.HISTORICAL.ROOT} element={<HistoricalAnalogies />} />
        <Route path={ROUTES.HISTORICAL.ANALOGIES} element={<HistoricalAnalogies />} />
        <Route path={ROUTES.HISTORICAL.CONTEXT} element={<HistoricalAnalogies />} />

        {/* Comparison Routes */}
        <Route path={ROUTES.COMPARISON.ROOT} element={<PortfolioComparison />} />
        <Route path={ROUTES.COMPARISON.PERFORMANCE} element={<PortfolioComparison />} />
        <Route path={ROUTES.COMPARISON.RISK} element={<PortfolioComparison />} />

        {/* Reports Routes */}
        <Route path={ROUTES.REPORTS.ROOT} element={<ReportGeneration />} />
        <Route path={ROUTES.REPORTS.GENERATE} element={<ReportGeneration />} />
        <Route path={ROUTES.REPORTS.HISTORY} element={<ReportGeneration />} />
        <Route path={ROUTES.REPORTS.SCHEDULED} element={<ReportGeneration />} />

        {/* Settings Routes */}
        <Route path={ROUTES.SETTINGS.ROOT} element={<ComingSoon pageName="Settings" />} />
        <Route path={ROUTES.SETTINGS.PROFILE} element={<ComingSoon pageName="Profile Settings" />} />
        <Route path={ROUTES.SETTINGS.PREFERENCES} element={<ComingSoon pageName="Preferences" />} />
        <Route path={ROUTES.SETTINGS.API} element={<ComingSoon pageName="API Settings" />} />

        {/* Error Routes */}
        <Route path={ROUTES.NOT_FOUND} element={<ComingSoon pageName="404 Page" />} />
        <Route path={ROUTES.SERVER_ERROR} element={<ComingSoon pageName="500 Page" />} />

        {/* Catch all - 404 */}
        <Route path="*" element={<ComingSoon pageName="Page Not Found" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;