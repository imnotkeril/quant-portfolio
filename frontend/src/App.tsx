/**
 * Main App Component
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
import { LayoutProvider } from './contexts/LayoutContext';
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
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '1rem',
        color: 'var(--color-error-600)'
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
      <details style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--color-background-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        maxWidth: '600px',
        textAlign: 'left'
      }}>
        <summary style={{
          cursor: 'pointer',
          fontWeight: 500,
          marginBottom: '0.5rem'
        }}>
          Error Details
        </summary>
        <pre style={{
          fontSize: '0.875rem',
          color: 'var(--color-error-600)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-primary-500)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
        }}
      >
        Try Again
      </button>
    </div>
  );
};

// Main App Layout
const AppLayout: React.FC = () => {
  return (
    <LayoutProvider>
      <div className="app-container">
        <Sidebar />
        <div className="app-main">
          <Header />
          <main className="app-content">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </div>
    </LayoutProvider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('App Error:', error, errorInfo);

        // You can integrate with error monitoring services here
        // e.g., Sentry, LogRocket, Bugsnag
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry.captureException(error);
        }
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <NotificationProvider>
              <AppLayout />

              {/* Global toast notifications */}
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Default options for all toasts
                  className: '',
                  duration: 4000,
                  style: {
                    background: 'var(--color-background-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  },
                  // Default options for specific types
                  success: {
                    iconTheme: {
                      primary: 'var(--color-success-500)',
                      secondary: 'white',
                    },
                    style: {
                      border: '1px solid var(--color-success-200)',
                      backgroundColor: 'var(--color-success-50)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--color-error-500)',
                      secondary: 'white',
                    },
                    style: {
                      border: '1px solid var(--color-error-200)',
                      backgroundColor: 'var(--color-error-50)',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: 'var(--color-primary-500)',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </NotificationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;