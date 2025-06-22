/**
 * Main App Component - ИСПРАВЛЕННАЯ ВЕРСИЯ
 * Root component that sets up providers and layout
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

// Layout components
import { Header } from './components/layout/Header/Header';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
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
            paddingTop: 'var(--header-height)', // ОТСТУП ОТ ФИКСИРОВАННОГО HEADER
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
            background: 'var(--card-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--border-radius-m)',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'var(--font-family)',
            zIndex: 'var(--z-index-toast)'
          },
          success: {
            iconTheme: {
              primary: 'var(--color-positive)',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid var(--color-positive)'
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--color-negative)',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid var(--color-negative)'
            }
          },
          loading: {
            iconTheme: {
              primary: 'var(--color-accent)',
              secondary: 'var(--color-background)',
            }
          }
        }}
        containerStyle={{
          top: 'calc(var(--header-height) + var(--spacing-m))', // ПОД ХЭДЕРОМ
          right: 'var(--spacing-m)',
          zIndex: 'var(--z-index-toast)'
        }}
      />
    </div>
  );
};

// Root App component
const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
        // You can send this to your error reporting service
        // logErrorToService(error, errorInfo);
      }}
      onReset={() => {
        // Clear any state that might have caused the error
        window.location.reload();
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <LayoutProvider>
              <NotificationProvider>
                <AppLayout />
              </NotificationProvider>
            </LayoutProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;