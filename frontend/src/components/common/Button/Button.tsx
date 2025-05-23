/**
 * Button Component
 * Universal button component with multiple variants and sizes
 */
import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'success' | 'danger' | 'neutral';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
  'data-testid'?: string;
}

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
  iconPosition = 'left',
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: loading,
      [styles.disabled]: disabled,
      [styles.hasIcon]: !!icon,
      [styles.iconOnly]: !!icon && !children,
      [styles.iconLeft]: !!icon && iconPosition === 'left',
      [styles.iconRight]: !!icon && iconPosition === 'right',
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {loading && <div className={styles.spinner} />}

      {!loading && (
        <>
          {icon && iconPosition === 'left' && (
            <span className={styles.iconLeft}>{icon}</span>
          )}

          {children && <span className={styles.content}>{children}</span>}

          {icon && iconPosition === 'right' && (
            <span className={styles.iconRight}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;