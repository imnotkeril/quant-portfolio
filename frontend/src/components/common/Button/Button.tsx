// src/components/common/Button/Button.tsx - IMPROVED VERSION
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
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  href?: string;
  target?: string;
  download?: boolean;
  rel?: string;
  shape?: 'default' | 'circle' | 'round';
  ghost?: boolean;
  block?: boolean;
  danger?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  id?: string;
  name?: string;
  value?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <span className={classNames(styles.loadingIcon, styles[`loading-${size}`])}>
    <svg
      className={styles.spinner}
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
      >
        <animate
          attributeName="stroke-dasharray"
          dur="2s"
          values="0 31.416;15.708 15.708;0 31.416"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="2s"
          values="0;-15.708;-31.416"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </span>
);

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
  htmlType,
  icon,
  iconPosition = 'start',
  href,
  target,
  download,
  rel,
  shape = 'default',
  ghost = false,
  block = false,
  danger = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId,
  id,
  name,
  value,
  tabIndex,
  autoFocus,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onMouseEnter,
  onMouseLeave,
  style,
}) => {
  const isDisabled = disabled || loading;
  const buttonType = htmlType || type;

  // Use danger variant if danger prop is true
  const computedVariant = danger ? 'danger' : variant;

  const buttonProps = {
    type: buttonType,
    className: classNames(
      styles.button,
      styles[computedVariant],
      styles[size],
      styles[shape],
      {
        [styles.fullWidth]: fullWidth || block,
        [styles.loading]: loading,
        [styles.iconOnly]: icon && !children,
        [styles.ghost]: ghost,
        [styles.disabled]: isDisabled,
      },
      className
    ),
    disabled: isDisabled,
    onClick: isDisabled ? undefined : onClick,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-busy': loading,
    'aria-disabled': isDisabled,
    'data-testid': dataTestId,
    id,
    name,
    value,
    tabIndex: isDisabled ? -1 : tabIndex,
    autoFocus,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onMouseEnter,
    onMouseLeave,
    style,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner size={size} />
          {children && <span className={styles.loadingText}>{children}</span>}
        </>
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

  // Render as link if href is provided
  if (href && !isDisabled) {
    return (
      <a
        href={href}
        target={target}
        download={download}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        {...buttonProps}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Handle as click for links
          }
          onKeyDown?.(e as any);
        }}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button {...buttonProps}>
      {renderContent()}
    </button>
  );
};