/**
 * Sidebar Component
 * Application sidebar navigation with menu items
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useLayout } from '../../../contexts/LayoutContext';
import { NAVIGATION_ITEMS } from '../../../constants/routes';
import { Button } from '../../common/Button/Button';
import { Badge } from '../../common/Badge/Badge';
import styles from './Sidebar.module.css';

interface SidebarProps {
  className?: string;
  'data-testid'?: string;
}

interface NavigationItemProps {
  item: any;
  level?: number;
  collapsed?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  level = 0,
  collapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === item.path;
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some((child: any) =>
    location.pathname.startsWith(child.path)
  );

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(item.path);
    }
  };

  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        </svg>
      ),
      portfolio: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      analytics: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
      ),
      optimization: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      risk: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4"/>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      scenarios: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
      ),
      historical: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      comparison: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11H1v10h8V11z"/>
          <path d="M23 11h-8v10h8V11z"/>
          <path d="M12 3H4v6h8V3z"/>
        </svg>
      ),
      reports: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      ),
    };

    return iconMap[iconName] || (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    );
  };

  const itemClasses = classNames(
    styles.navItem,
    {
      [styles.active]: isActive,
      [styles.childActive]: isChildActive && !isActive,
      [styles.hasChildren]: hasChildren,
      [styles.expanded]: isExpanded,
      [styles.collapsed]: collapsed,
    }
  );

  return (
    <div className={itemClasses}>
      <Button
        variant="text"
        className={styles.navButton}
        onClick={handleClick}
        fullWidth
      >
        <div className={styles.navButtonContent}>
          <div className={styles.navIcon}>
            {renderIcon(item.icon)}
          </div>

          {!collapsed && (
            <>
              <span className={styles.navLabel}>{item.label}</span>

              {hasChildren && (
                <div className={classNames(styles.expandIcon, {
                  [styles.rotated]: isExpanded
                })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              )}

              {item.badge && (
                <Badge count={item.badge} size="small" />
              )}
            </>
          )}
        </div>
      </Button>

      {hasChildren && !collapsed && isExpanded && (
        <div className={styles.subMenu}>
          {item.children.map((child: any) => (
            <NavigationItem
              key={child.path}
              item={child}
              level={level + 1}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  'data-testid': testId,
}) => {
  const { sidebarState, isFullScreen, isMobile } = useLayout();

  const sidebarClasses = classNames(
    styles.sidebar,
    {
      [styles.collapsed]: sidebarState === 'collapsed',
      [styles.hidden]: sidebarState === 'hidden',
      [styles.fullScreen]: isFullScreen,
      [styles.mobile]: isMobile,
    },
    className
  );

  const isCollapsed = sidebarState === 'collapsed';

  return (
    <aside className={sidebarClasses} data-testid={testId}>
      <div className={styles.sidebarContent}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>

          {!isCollapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>Wild Market</span>
              <span className={styles.brandSub}>Capital</span>
            </div>
          )}
        </div>

        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItem
                key={item.path}
                item={item}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        <div className={styles.footer}>
          {!isCollapsed && (
            <div className={styles.footerContent}>
              <div className={styles.version}>
                <span>Version 1.0.0</span>
              </div>
              <div className={styles.status}>
                <Badge status="success" text="Online" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;