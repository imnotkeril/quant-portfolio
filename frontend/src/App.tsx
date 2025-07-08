/**
 * Main App Component - ИСПРАВЛЕННАЯ ВЕРСИЯ
 * Root component that sets up providers and layout
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

// Layout components - ИСПРАВЛЕННЫЕ ИМПОРТЫ
import { Header } from './components/layout/Header/Header';
import Sidebar from './components/layout/Sidebar/Sidebar'; // ИЗМЕНЕНО: default import
import { Footer } from './components/layout/Footer/Footer';

// Context providers
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider, useLayout } from './contexts/LayoutContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Routes
import AppRoutes from './AppRoutes';

// Store
import { store } from './store';

// Global styles
import './assets/styles/global.css';
import './assets/styles/variables.css';
import './assets/styles/reset.css';

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  console.error('Application error:', error);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text-primary)',
      zIndex: 'var(--z-index-max)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '1rem',
        color: 'var(--color-negative)'
      }}>
        Something went wrong
      </h1>
      <p style={{
        marginBottom: '2rem',
        color: 'var(--color-text-secondary)',
        maxWidth: '600px',
        lineHeight: 1.6
      }}>
        We encountered an unexpected error. This has been logged and our team will investigate.
      </p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text-dark)',
          border: 'none',
          borderRadius: 'var(--border-radius-m)',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 500,
          transition: 'all var(--transition-fast)'
        }}
      >
        Try again
      </button>
    </div>
  );
};

// Main layout component that uses the layout context
const AppLayout: React.FC = () => {
  const { sidebarState } = useLayout();

  const layoutClasses = [
    sidebarState === 'collapsed' && 'collapsed',
    sidebarState === 'hidden' && 'sidebarHidden'
  ].filter(Boolean).join(' ');

  return (
    <div
      className="layout-container"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background)',
        position: 'relative'
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`main-content ${layoutClasses}`}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: sidebarState === 'hidden' ? '0' :
                     sidebarState === 'collapsed' ? 'var(--sidebar-width-collapsed)' :
                     'var(--sidebar-width)',
          transition: 'margin-left var(--transition-medium)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 'var(--z-index-content)'
        }}
      >
        {/* Header - ALWAYS VISIBLE */}
        <Header />

        {/* Page Content with Footer */}
        <div
          className="page-content"
          style={{
            flex: 1,
            overflow: 'auto',
            paddingTop: 'calc(var(--header-height) + var(--spacing-m))', // ✅ Как везде
            backgroundColor: 'var(--color-background)',
            minHeight: 'calc(100vh - var(--header-height))', // МИНИМУМ ПОЛНАЯ ВЫСОТА
            position: 'relative',
            zIndex: 'var(--z-index-base)'
          }}
        >
          {/* КОНТЕНТ СТРАНИЦ */}
          <AppRoutes />

          {/* Footer в конце контента */}
          <Footer />
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--border-radius-m)',
            boxShadow: 'var(--shadow-large)'
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-text-dark)'
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-text-dark)'
            }
          }
        }}
      />
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error boundary caught an error:', error, errorInfo);
        // Here you could send error to logging service
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <NotificationProvider>
              <LayoutProvider>
                <AppLayout />
              </LayoutProvider>
            </NotificationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;