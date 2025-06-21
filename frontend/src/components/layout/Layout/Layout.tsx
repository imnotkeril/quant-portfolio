// src/components/layout/Layout/Layout.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: '📊'
  },
  {
    id: 'portfolios',
    label: 'Portfolios',
    path: '/portfolios',
    icon: '📈'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: '📊'
  },
  {
    id: 'optimization',
    label: 'Optimization',
    path: '/optimization',
    icon: '⚡'
  },
  {
    id: 'risk',
    label: 'Risk Management',
    path: '/risk',
    icon: '🛡️'
  },
  {
    id: 'scenarios',
    label: 'Scenario Analysis',
    path: '/scenarios',
    icon: '🎯'
  },
  {
    id: 'historical',
    label: 'Historical Analogies',
    path: '/historical',
    icon: '📚'
  },
  {
    id: 'comparison',
    label: 'Portfolio Comparison',
    path: '/comparison',
    icon: '⚖️'
  },
  {
    id: 'reports',
    label: 'Report Generation',
    path: '/reports',
    icon: '📄'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: '⚙️'
  }
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🌟</div>
            {!isSidebarCollapsed && (
              <div className={styles.logoText}>
                <div className={styles.brandName}>Wild Market</div>
                <div className={styles.brandSub}>Capital</div>
              </div>
            )}
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {navigationItems.map((item) => (
              <li key={item.id} className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                  {isActive(item.path) && <div className={styles.activeIndicator} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          {!isSidebarCollapsed && (
            <div className={styles.version}>
              Version 1.0.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                {navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search portfolios, assets..."
                  className={styles.searchInput}
                />
                <button className={styles.searchButton}>🔍</button>
              </div>
              <div className={styles.userMenu}>
                <button className={styles.userButton}>
                  <span className={styles.userAvatar}>👤</span>
                  <span className={styles.userName}>User</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;