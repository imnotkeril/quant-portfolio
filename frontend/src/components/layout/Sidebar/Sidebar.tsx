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
      chart: ( // ДОБАВЛЕНО: иконка для Portfolio Analysis
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
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

  return (
    <div className={styles.navItem}>
      <button
        className={classNames(
          styles.navButton,
          {
            [styles.active]: isActive,
            [styles.childActive]: isChildActive && !isActive,
            [styles.collapsed]: collapsed,
          }
        )}
        onClick={handleClick}
        title={collapsed ? item.label : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
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
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              )}
              {item.badge && (
                <Badge variant="accent" size="small">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </button>

      {/* Submenu */}
      {hasChildren && isExpanded && !collapsed && (
        <div className={styles.subMenu}>
          {item.children.map((child: any, index: number) => (
            <NavigationItem
              key={`${child.path}-${index}`}
              item={child}
              level={level + 1}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ className, 'data-testid': testId }) => {
  const { sidebarState, collapseSidebar } = useLayout();
  const location = useLocation();

  // Handle mobile click outside
  const handleBackdropClick = () => {
    if (window.innerWidth <= 768) {
      collapseSidebar();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarState === 'expanded' && window.innerWidth <= 768 && (
        <div
          className={styles.backdrop}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      <aside
        className={classNames(
          styles.sidebar,
          {
            [styles.collapsed]: sidebarState === 'collapsed',
            [styles.hidden]: sidebarState === 'hidden',
          },
          className
        )}
        data-testid={testId}
      >
        {/* Header - УБРАНА КНОПКА TOGGLE */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>

            {sidebarState !== 'collapsed' && (
              <div className={styles.brandText}>
                <div className={styles.brandName}>Wild Market</div>
                <div className={styles.brandSub}>Capital</div>
              </div>
            )}
          </div>
          {/* КНОПКА TOGGLE УДАЛЕНА - ОСТАЕТСЯ ТОЛЬКО В ХЕДЕРЕ */}
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            {NAVIGATION_ITEMS.map((item, index) => (
              <NavigationItem
                key={`${item.path}-${index}`}
                item={item}
                collapsed={sidebarState === 'collapsed'}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            {sidebarState !== 'collapsed' && (
              <div className={styles.version}>v1.0.0</div>
            )}
            <div className={styles.status}>
              <Badge variant="success" size="small">
                Online
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;