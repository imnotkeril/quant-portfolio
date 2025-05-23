/**
 * ChartContainer Component
 * Universal container for all chart components with common features
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Dropdown } from '../../common/Dropdown/Dropdown';
import { Loader } from '../../common/Loader/Loader';
import styles from './ChartContainer.module.css';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: number | string;
  actions?: React.ReactNode;
  exportOptions?: {
    onExportPNG?: () => void;
    onExportSVG?: () => void;
    onExportData?: () => void;
  };
  refreshAction?: () => void;
  fullscreenEnabled?: boolean;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  'data-testid'?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error,
  className,
  height = 400,
  actions,
  exportOptions,
  refreshAction,
  fullscreenEnabled = false,
  onFullscreenToggle,
  'data-testid': testId,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenToggle?.(newFullscreenState);
  };

  const exportMenuItems = [];
  if (exportOptions?.onExportPNG) {
    exportMenuItems.push({
      key: 'png',
      label: 'Export as PNG',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      ),
      onClick: exportOptions.onExportPNG,
    });
  }

  if (exportOptions?.onExportSVG) {
    exportMenuItems.push({
      key: 'svg',
      label: 'Export as SVG',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      ),
      onClick: exportOptions.onExportSVG,
    });
  }

  if (exportOptions?.onExportData) {
    exportMenuItems.push({
      key: 'data',
      label: 'Export Data',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      onClick: exportOptions.onExportData,
    });
  }

  const containerClasses = classNames(
    styles.container,
    {
      [styles.fullscreen]: isFullscreen,
      [styles.loading]: loading,
      [styles.error]: !!error,
    },
    className
  );

  const contentHeight = typeof height === 'number' ? `${height}px` : height;

  const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );

  const ExportIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  const FullscreenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  );

  const ExitFullscreenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
    </svg>
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      {(title || subtitle || actions || exportMenuItems.length > 0 || refreshAction || fullscreenEnabled) && (
        <div className={styles.header}>
          <div className={styles.titleSection}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.actionSection}>
            {actions}

            {refreshAction && (
              <Button
                variant="outline"
                size="small"
                onClick={refreshAction}
                icon={<RefreshIcon />}
                aria-label="Refresh chart"
              >
                {null}
              </Button>
            )}

            {exportMenuItems.length > 0 && (
              <Dropdown
                menu={exportMenuItems}
                placement="bottom-end"
                trigger="click"
              >
                <Button
                  variant="outline"
                  size="small"
                  icon={<ExportIcon />}
                  aria-label="Export chart"
                >
                  {null}
                </Button>
              </Dropdown>
            )}

            {fullscreenEnabled && (
              <Button
                variant="outline"
                size="small"
                onClick={handleFullscreenToggle}
                icon={isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {null}
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        className={styles.content}
        style={{ height: isFullscreen ? '100%' : contentHeight }}
      >
        {loading && (
          <div className={styles.loadingOverlay}>
            <Loader type="spinner" size="large" text="Loading chart..." />
          </div>
        )}

        {error && (
          <div className={styles.errorOverlay}>
            <div className={styles.errorContent}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
};

export default ChartContainer;