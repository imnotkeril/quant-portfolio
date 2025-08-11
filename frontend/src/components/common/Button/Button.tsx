/**
 * Button Component - FIXED VERSION with forwardRef
 * Universal button component with support for refs
 * File: frontend/src/components/common/Button/Button.tsx
 */
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  id?: string;
  name?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// LoadingSpinner component for loading state
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      className={styles.spinner}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="32"
      />
    </svg>
  );
};

// Button component with forwardRef
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'start',
  onClick,
  children,
  className,
  type = 'button',
  ariaLabel,
  id,
  name,
  tabIndex,
  autoFocus,
  style,
  'data-testid': dataTestId,
}, ref) => {
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <span className={styles.loadingContent}>
          <LoadingSpinner size={size} />
          {children && <span className={styles.loadingText}>{children}</span>}
        </span>
      );
    }

    if (icon && children) {
      return iconPosition === 'start' ? (
        <>
          <span className={styles.buttonIcon}>{icon}</span>
          <span className={styles.buttonText}>{children}</span>
        </>
      ) : (
        <>
          <span className={styles.buttonText}>{children}</span>
          <span className={styles.buttonIcon}>{icon}</span>
        </>
      );
    }

    if (icon && !children) {
      return <span className={styles.buttonIcon}>{icon}</span>;
    }

    return <span className={styles.buttonText}>{children}</span>;
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
          [styles.loading]: loading,
          [styles.disabled]: isDisabled,
          [styles.iconOnly]: icon && !children,
        },
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={isDisabled}
      data-testid={dataTestId}
      id={id}
      name={name}
      tabIndex={isDisabled ? -1 : tabIndex}
      autoFocus={autoFocus}
      style={style}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;