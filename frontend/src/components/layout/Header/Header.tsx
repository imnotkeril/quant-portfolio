/**
 * Header Component
 * Application header with navigation and user controls
 */
import React from 'react';
import classNames from 'classnames';
import { useLayout } from '../../../contexts/LayoutContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../common/Button/Button';
import { Dropdown } from '../../common/Dropdown/Dropdown';
import { Badge } from '../../common/Badge/Badge';
import styles from './Header.module.css';

interface HeaderProps {
  className?: string;
  'data-testid'?: string;
}

export const Header: React.FC<HeaderProps> = ({
  className,
  'data-testid': testId,
}) => {
  const {
    sidebarState,
    toggleSidebar,
    isFullScreen,
    toggleFullScreen,
    isMobile,
    rightPanelOpen,
    toggleRightPanel,
  } = useLayout();

  const { mode, toggleMode } = useTheme();

  const headerClasses = classNames(
    styles.header,
    {
      [styles.collapsed]: sidebarState === 'collapsed',
      [styles.hidden]: sidebarState === 'hidden',
      [styles.fullScreen]: isFullScreen,
      [styles.mobile]: isMobile,
    },
    className
  );

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      onClick: () => console.log('Profile clicked'),
    },
    {
      key: 'preferences',
      label: 'Preferences',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      ),
      onClick: () => console.log('Preferences clicked'),
    },
    {
      key: 'divider1',
      label: '',
      divider: true,
    },
    {
      key: 'logout',
      label: 'Sign Out',
      danger: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      onClick: () => console.log('Logout clicked'),
    },
  ];

  return (
    <header className={headerClasses} data-testid={testId}>
      <div className={styles.left}>
        <Button
          variant="text"
          size="medium"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={styles.menuButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </Button>

        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span className={styles.logoText}>Wild Market Capital</span>
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.search}>
          <div className={styles.searchInput}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search portfolios, assets..."
              className={styles.searchField}
            />
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.controls}>
          <Button
            variant="text"
            size="medium"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            className={styles.controlButton}
          >
            {mode === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </Button>

          <Button
            variant="text"
            size="medium"
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className={styles.controlButton}
          >
            {isFullScreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
                <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            )}
          </Button>

          <Badge count={3}>
            <Button
              variant="text"
              size="medium"
              aria-label="Notifications"
              className={styles.controlButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </Button>
          </Badge>

          <Button
            variant="text"
            size="medium"
            onClick={toggleRightPanel}
            aria-label="Toggle right panel"
            className={classNames(styles.controlButton, {
              [styles.active]: rightPanelOpen,
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="15" y1="9" x2="21" y2="9"/>
              <line x1="15" y1="15" x2="21" y2="15"/>
              <line x1="3" y1="9" x2="9" y2="9"/>
              <line x1="3" y1="15" x2="9" y2="15"/>
            </svg>
          </Button>
        </div>

        <div className={styles.userSection}>
          <Dropdown
            menu={userMenuItems}
            placement="bottom-end"
            trigger="click"
          >
            <Button
              variant="text"
              size="medium"
              className={styles.userButton}
            >
              <div className={styles.userAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className={styles.userName}>User</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;