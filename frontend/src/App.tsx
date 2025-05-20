import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import PortfolioCreation from './pages/PortfolioCreation';
import PortfolioAnalysis from './pages/PortfolioAnalysis';
import PortfolioOptimization from './pages/PortfolioOptimization';
import RiskManagement from './pages/RiskManagement';
import ScenarioAnalysis from './pages/ScenarioAnalysis';
import HistoricalAnalogies from './pages/HistoricalAnalogies';
import PortfolioComparison from './pages/PortfolioComparison';
import ReportGeneration from './pages/ReportGeneration';
import NotFound from './pages/NotFound';
import Login from './pages/Login';

// Context & Providers
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

const App = () => {
  const { isAuthenticated, checkAuth } = useAuth();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <NotificationProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio">
            <Route path="create" element={<PortfolioCreation />} />
            <Route path="analyze/:id" element={<PortfolioAnalysis />} />
            <Route path="optimize/:id" element={<PortfolioOptimization />} />
          </Route>
          <Route path="/risk/:id" element={<RiskManagement />} />
          <Route path="/scenarios" element={<ScenarioAnalysis />} />
          <Route path="/historical-analogies" element={<HistoricalAnalogies />} />
          <Route path="/compare" element={<PortfolioComparison />} />
          <Route path="/reports" element={<ReportGeneration />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;