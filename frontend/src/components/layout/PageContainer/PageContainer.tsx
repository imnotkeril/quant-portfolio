// PageContainer Component - Unified page structure
import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  fullHeight?: boolean;
  scrollable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  'data-testid'?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  title,
  subtitle,
  actions,
  fullHeight = true,
  scrollable = true,
  padding = 'medium',
  'data-testid': testId,
}) => {
  const containerClasses = classNames(
    styles.container,
    {
      [styles.fullHeight]: fullHeight,
      [styles.scrollable]: scrollable,
      [styles.paddingNone]: padding === 'none',
      [styles.paddingSmall]: padding === 'small',
      [styles.paddingMedium]: padding === 'medium',
      [styles.paddingLarge]: padding === 'large',
    },
    className
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      {(title || subtitle || actions) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {(title || subtitle) && (
              <div className={styles.headerText}>
                {title && <h1 className={styles.title}>{title}</h1>}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
            )}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        </div>
      )}

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};