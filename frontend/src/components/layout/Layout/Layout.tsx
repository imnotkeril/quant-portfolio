// Layout Component with Sidebar Toggle - Layout.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed' | 'hidden'>('expanded');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const location = useLocation();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9"/>
          <rect x="14" y="3" width="7" height="5"/>
          <rect x="14" y="12" width="7" height="9"/>
          <rect x="3" y="16" width="7" height="5"/>
        </svg>
      ),
    },
    {
      id: 'portfolios',
      label: 'Portfolios',
      path: '/portfolios',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 21H4.5V4.5"/>
          <path d="M7 14l3.5-3.5L14 14l6-6"/>
        </svg>
      ),
    },
    {
      id: 'optimization',
      label: 'Optimization',
      path: '/optimization',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      ),
    },
    {
      id: 'risk',
      label: 'Risk Management',
      path: '/risk',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      path: '/scenarios',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
        </svg>
      ),
    },
    {
      id: 'historical',
      label: 'Historical Analysis',
      path: '/historical',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
    },
    {
      id: 'comparison',
      label: 'Comparison',
      path: '/comparison',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
  ];

  // Check if mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarState('hidden');
    } else {
      setSidebarState('expanded');
    }
  }, [isMobile]);

  // Sidebar toggle functions
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarState(sidebarState === 'hidden' ? 'expanded' : 'hidden');
    } else {
      setSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded');
    }
  };

  const collapseSidebar = () => {
    setSidebarState('collapsed');
  };

  const expandSidebar = () => {
    setSidebarState('expanded');
  };

  const hideSidebar = () => {
    setSidebarState('hidden');
  };

  // Check if current path is active
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Get current page title
  const getCurrentPageTitle = (): string => {
    const currentItem = navigationItems.find(item => isActive(item.path));
    return currentItem?.label || 'Dashboard';
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    // Navigation logic would go here
    // For now, just log the path
    console.log('Navigate to:', path);

    // Auto-hide sidebar on mobile after navigation
    if (isMobile) {
      setSidebarState('hidden');
    }
  };

  // CSS class names for dynamic styling
  const sidebarClasses = [
    styles.sidebar,
    sidebarState === 'collapsed' && styles.collapsed,
    sidebarState === 'hidden' && styles.hidden,
    isMobile && sidebarState === 'expanded' && styles.visible,
  ].filter(Boolean).join(' ');

  const mainClasses = [
    styles.main,
    sidebarState === 'collapsed' && styles.sidebarCollapsed,
    sidebarState === 'hidden' && styles.sidebarHidden,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <div className={styles.brandName}>Wild Market</div>
              <div className={styles.brandSub}>Capital</div>
            </div>
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title={sidebarState === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarState === 'expanded' ? '←' : '→'}
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
                  title={sidebarState === 'collapsed' ? item.label : ''}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive(item.path) && <div className={styles.activeIndicator} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={mainClasses}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              {isMobile && (
                <button
                  className={styles.toggleButton}
                  onClick={toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              )}
              <h1 className={styles.pageTitle}>{getCurrentPageTitle()}</h1>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search portfolios, assets..."
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.userButton}>
                <span className={styles.userAvatar}>U</span>
                <span className={styles.userName}>User</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobile && sidebarState === 'expanded' && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarState('hidden')}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
};

export default Layout;