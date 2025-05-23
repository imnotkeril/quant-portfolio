/**
 * PageContainer Component
 * Main container for page content with consistent layout
 */
import React from 'react';
import classNames from 'classnames';
import { useLayout } from '../../../contexts/LayoutContext';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
  fluid?: boolean;
  noPadding?: boolean;
  noScroll?: boolean;
  'data-testid'?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
  fluid = false,
  noPadding = false,
  noScroll = false,
  'data-testid': testId,
}) => {
  const { isFullScreen, isMobile } = useLayout();

  const containerClasses = classNames(
    styles.container,
    {
      [styles.fluid]: fluid,
      [styles.noPadding]: noPadding,
      [styles.noScroll]: noScroll,
      [styles.fullScreen]: isFullScreen,
      [styles.mobile]: isMobile,
    },
    className
  );

  const hasHeader = title || subtitle || actions || breadcrumb;

  return (
    <div className={containerClasses} data-testid={testId}>
      {hasHeader && (
        <div className={styles.header}>
          {breadcrumb && (
            <div className={styles.breadcrumb}>
              {breadcrumb}
            </div>
          )}

          <div className={styles.titleSection}>
            <div className={styles.titleContent}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {actions && (
              <div className={styles.actions}>
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;