/**
 * Badge Component
 * Small status descriptors for UI elements
 */
import React from 'react';
import classNames from 'classnames';
import styles from './Badge.module.css';

export type BadgeStatus = 'success' | 'processing' | 'error' | 'warning' | 'default';
export type BadgeSize = 'small' | 'default';

interface BadgeProps {
  children?: React.ReactNode;
  count?: React.ReactNode;
  dot?: boolean;
  showZero?: boolean;
  overflowCount?: number;
  offset?: [number, number];
  size?: BadgeSize;
  status?: BadgeStatus;
  color?: string;
  text?: React.ReactNode;
  title?: string;
  className?: string;
  'data-testid'?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  count,
  dot = false,
  showZero = false,
  overflowCount = 99,
  offset,
  size = 'default',
  status,
  color,
  text,
  title,
  className,
  'data-testid': testId,
}) => {
  // Determine if badge should be shown
  const shouldShowBadge = () => {
    if (dot) return true;
    if (count === undefined || count === null) return false;
    if (typeof count === 'number') {
      return count > 0 || (count === 0 && showZero);
    }
    return true;
  };

  // Format count display
  const getDisplayCount = () => {
    if (dot) return null;
    if (typeof count === 'number') {
      if (count === 0 && !showZero) return null;
      return count > overflowCount ? `${overflowCount}+` : count.toString();
    }
    return count;
  };

  // Get badge classes
  const getBadgeClasses = () => {
    return classNames(
      styles.badge,
      styles[size],
      {
        [styles.dot]: dot,
        [styles.standalone]: !children,
        [styles[`status${status?.charAt(0).toUpperCase()}${status?.slice(1)}`]]: status && !color,
      }
    );
  };

  // Get badge style
  const getBadgeStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (color) {
      style.backgroundColor = color;
      style.borderColor = color;
    }

    if (offset && children) {
      style.transform = `translate(${offset[0]}px, ${offset[1]}px)`;
    }

    return style;
  };

  const displayCount = getDisplayCount();
  const showBadge = shouldShowBadge();

  // Render standalone badge (without children)
  if (!children) {
    if (status && !count && !dot) {
      // Status badge with text
      return (
        <span
          className={classNames(
            styles.statusBadge,
            styles[`status${status.charAt(0).toUpperCase()}${status.slice(1)}`],
            className
          )}
          title={title}
          data-testid={testId}
        >
          <span className={styles.statusDot} />
          {text && <span className={styles.statusText}>{text}</span>}
        </span>
      );
    }

    // Count or dot badge without wrapper
    if (showBadge) {
      return (
        <span
          className={classNames(getBadgeClasses(), className)}
          style={getBadgeStyle()}
          title={title}
          data-testid={testId}
        >
          {!dot && displayCount}
        </span>
      );
    }

    return null;
  }

  // Render badge with children
  const containerClasses = classNames(
    styles.container,
    className
  );

  return (
    <span className={containerClasses} data-testid={testId}>
      {children}
      {showBadge && (
        <span
          className={getBadgeClasses()}
          style={getBadgeStyle()}
          title={title}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
};

export default Badge;