// src/components/common/Loader/Loader.tsx
import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.css';

export type LoaderSize = 'small' | 'default' | 'large';
export type LoaderType = 'spinner' | 'dots' | 'pulse' | 'bars';

interface LoaderProps {
  spinning?: boolean;
  size?: LoaderSize;
  type?: LoaderType;
  tip?: React.ReactNode;
  delay?: number;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  wrapperClassName?: string;
}

const SpinnerIcon: React.FC<{ size: LoaderSize }> = ({ size }) => (
  <svg
    className={classNames(styles.spinnerIcon, styles[size])}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
      className={styles.spinnerCircle}
    />
  </svg>
);

const DotsIcon: React.FC<{ size: LoaderSize }> = ({ size }) => (
  <div className={classNames(styles.dotsContainer, styles[size])}>
    <div className={classNames(styles.dot, styles.dot1)} />
    <div className={classNames(styles.dot, styles.dot2)} />
    <div className={classNames(styles.dot, styles.dot3)} />
  </div>
);

const PulseIcon: React.FC<{ size: LoaderSize }> = ({ size }) => (
  <div className={classNames(styles.pulseContainer, styles[size])}>
    <div className={styles.pulseCircle} />
  </div>
);

const BarsIcon: React.FC<{ size: LoaderSize }> = ({ size }) => (
  <div className={classNames(styles.barsContainer, styles[size])}>
    <div className={classNames(styles.bar, styles.bar1)} />
    <div className={classNames(styles.bar, styles.bar2)} />
    <div className={classNames(styles.bar, styles.bar3)} />
    <div className={classNames(styles.bar, styles.bar4)} />
  </div>
);

const LoaderIcon: React.FC<{ type: LoaderType; size: LoaderSize }> = ({ type, size }) => {
  switch (type) {
    case 'dots':
      return <DotsIcon size={size} />;
    case 'pulse':
      return <PulseIcon size={size} />;
    case 'bars':
      return <BarsIcon size={size} />;
    case 'spinner':
    default:
      return <SpinnerIcon size={size} />;
  }
};

export const Loader: React.FC<LoaderProps> = ({
  spinning = true,
  size = 'default',
  type = 'spinner',
  tip,
  delay = 0,
  indicator,
  children,
  className,
  style,
  wrapperClassName,
}) => {
  const [shouldShow, setShouldShow] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0 && spinning) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(spinning);
    }
  }, [spinning, delay]);

  const renderLoader = () => (
    <div
      className={classNames(
        styles.loader,
        styles[size],
        className
      )}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={tip ? String(tip) : 'Loading'}
    >
      <div className={styles.loaderContent}>
        {indicator || <LoaderIcon type={type} size={size} />}
        {tip && (
          <div className={styles.loaderTip}>
            {tip}
          </div>
        )}
      </div>
    </div>
  );

  // If no children, render just the loader
  if (!children) {
    return shouldShow && spinning ? renderLoader() : null;
  }

  // If has children, render as overlay
  return (
    <div
      className={classNames(
        styles.loaderWrapper,
        {
          [styles.spinning]: shouldShow && spinning,
        },
        wrapperClassName
      )}
    >
      {children}
      {shouldShow && spinning && (
        <div className={styles.loaderOverlay}>
          {renderLoader()}
        </div>
      )}
    </div>
  );
};