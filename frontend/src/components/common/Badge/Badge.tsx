import React from 'react';
import classNames from 'classnames';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  rounded?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
  'data-testid'?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'medium',
  className,
  onClick,
  disabled = false,
  rounded = false,
  dot = false,
  icon,
  'data-testid': testId,
}) => {
  const badgeClasses = classNames(
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    {
      [styles.clickable]: !!onClick && !disabled,
      [styles.disabled]: disabled,
      [styles.rounded]: rounded,
      [styles.dot]: dot,
      [styles.withIcon]: !!icon,
    },
    className
  );

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <span
      className={badgeClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      data-testid={testId}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {!dot && (
        <span className={styles.content}>
          {children}
        </span>
      )}
    </span>
  );
};

export default Badge;