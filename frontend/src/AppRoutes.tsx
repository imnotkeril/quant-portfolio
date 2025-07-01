import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes';

// Page components
import Dashboard from './pages/Dashboard';
import PortfolioCreation from './pages/PortfolioCreation';
import PortfolioAnalysis from './pages/PortfolioAnalysis';
import PortfolioOptimization from './pages/PortfolioOptimization';
import RiskManagement from './pages/RiskManagement';
import ScenarioAnalysis from './pages/ScenarioAnalysis';
import HistoricalAnalogies from './pages/HistoricalAnalogies';
import PortfolioComparison from './pages/PortfolioComparison';
import ReportGeneration from './pages/ReportGeneration';

// NEW: Import new components (lazy loaded)
const PortfolioModeSelector = React.lazy(() => import('./pages/PortfolioCreation/PortfolioModeSelector'));

// Loading component
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #2A2E39',
      borderTop: '3px solid #BF9FFB',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#9CA3AF' }}>Loading...</p>
  </div>
);

// Page Container component
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    padding: '24px',
    background: '#0D1015',
    minHeight: '100vh'
  }}>
    {children}
  </div>
);

// Coming Soon placeholder component
const ComingSoon: React.FC<{ pageName: string }> = ({ pageName }) => (
  <PageContainer>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#BF9FFB' }}>
        {pageName}
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>
        Coming Soon...
      </p>
    </div>
  </PageContainer>
);

const AppRoutes: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dashboard - Home */}
        <Route path={ROUTES.HOME} element={<Dashboard />} />
        <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />

        {/* Portfolio Routes */}
        <Route path={ROUTES.PORTFOLIO.ROOT} element={<Navigate to={ROUTES.PORTFOLIO.LIST} replace />} />
        <Route path={ROUTES.PORTFOLIO.LIST} element={<Dashboard />} /> {/* Reuse dashboard for now */}
        <Route path={ROUTES.PORTFOLIO.CREATE} element={<PortfolioCreation />} />

        {/* NEW: Portfolio Creation Mode Selector */}
        <Route path="/portfolios/create/mode" element={<PortfolioModeSelector />} />

        <Route path={ROUTES.PORTFOLIO.ANALYSIS_ROOT} element={<PortfolioAnalysis />} /> {/* ДОБАВЛЕНО: роут для выбора портфеля для анализа */}
        <Route path={ROUTES.PORTFOLIO.ANALYSIS} element={<PortfolioAnalysis />} />
        <Route path={ROUTES.PORTFOLIO.EDIT} element={<PortfolioCreation />} />

        {/* Analytics Routes */}
        <Route path={ROUTES.ANALYTICS.ROOT} element={<PortfolioAnalysis />} />
        <Route path={ROUTES.ANALYTICS.PERFORMANCE} element={<PortfolioAnalysis />} />
        <Route path={ROUTES.ANALYTICS.ATTRIBUTION} element={<PortfolioAnalysis />} />

        {/* Optimization Routes */}
        <Route path={ROUTES.OPTIMIZATION.ROOT} element={<PortfolioOptimization />} />
        <Route path={ROUTES.OPTIMIZATION.ADVANCED} element={<PortfolioOptimization />} />
        <Route path={ROUTES.OPTIMIZATION.COMPARISON} element={<PortfolioOptimization />} />

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
    </>
  );
};

export default AppRoutes;