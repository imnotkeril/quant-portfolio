// frontend/src/components/common/Button/Button.tsx
import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  'aria-label'?: string;
  'data-testid'?: string;
  id?: string;
  name?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSize = size === 'small' ? '12px' : size === 'large' ? '18px' : '14px';

  return (
    <div
      className={styles.spinner}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `2px solid transparent`,
        borderTop: `2px solid currentColor`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  className,
  type = 'button',
  icon,
  iconPosition = 'start',
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  id,
  name,
  tabIndex,
  autoFocus,
  style,
}) => {
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
};

export default Button;