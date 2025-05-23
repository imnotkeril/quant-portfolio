/**
 * Loader Component
 * Various loading indicators and spinners
 */
import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.css';

export type LoaderType = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
export type LoaderSize = 'small' | 'medium' | 'large';

interface LoaderProps {
  type?: LoaderType;
  size?: LoaderSize;
  color?: string;
  loading?: boolean;
  text?: React.ReactNode;
  tip?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  type = 'spinner',
  size = 'medium',
  color,
  loading = true,
  text,
  tip,
  children,
  overlay = false,
  className,
  style,
  'data-testid': testId,
}) => {
  if (!loading && !children) {
    return null;
  }

  const renderLoader = () => {
    const loaderClasses = classNames(
      styles.loader,
      styles[type],
      styles[size],
      className
    );

    const loaderStyle: React.CSSProperties = {
      ...style,
      ...(color && { color }),
    };

    switch (type) {
      case 'spinner':
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.spinner} />
          </div>
        );

      case 'dots':
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        );

      case 'pulse':
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.pulse} />
          </div>
        );

      case 'bars':
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        );

      case 'ring':
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.ring}>
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        );

      default:
        return (
          <div className={loaderClasses} style={loaderStyle}>
            <div className={styles.spinner} />
          </div>
        );
    }
  };

  const renderContent = () => {
    const loader = renderLoader();

    if (text || tip) {
      return (
        <div className={styles.loadingContainer}>
          {loader}
          {(text || tip) && (
            <div className={styles.loadingText}>
              {text || tip}
            </div>
          )}
        </div>
      );
    }

    return loader;
  };

  // Render overlay loader
  if (children) {
    const containerClasses = classNames(
      styles.container,
      {
        [styles.loading]: loading,
        [styles.overlay]: overlay,
      }
    );

    return (
      <div className={containerClasses} data-testid={testId}>
        {children}
        {loading && (
          <div className={styles.overlayMask}>
            {renderContent()}
          </div>
        )}
      </div>
    );
  }

  // Render standalone loader
  return (
    <div className={styles.standalone} data-testid={testId}>
      {renderContent()}
    </div>
  );
};

export default Loader;