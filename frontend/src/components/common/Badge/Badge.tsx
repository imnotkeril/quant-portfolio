// src/components/common/Badge/Badge.tsx
import React from 'react';
import classNames from 'classnames';
import styles from './Badge.module.css';

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
export type BadgeSize = 'default' | 'small';

interface BadgeProps {
  count?: React.ReactNode;
  showZero?: boolean;
  overflowCount?: number;
  dot?: boolean;
  status?: BadgeStatus;
  text?: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  size?: BadgeSize;
  offset?: [number, number];
  title?: string;
}

const getDisplayCount = (count: React.ReactNode, overflowCount: number): React.ReactNode => {
  if (typeof count === 'number') {
    if (count > overflowCount) {
      return `${overflowCount}+`;
    }
    return count;
  }
  return count;
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  showZero = false,
  overflowCount = 99,
  dot = false,
  status,
  text,
  color,
  children,
  className,
  style,
  size = 'default',
  offset,
  title,
}) => {
  const hasChildren = !!children;
  const isEmpty =
    (!count && count !== 0) ||
    (count === 0 && !showZero) ||
    (Array.isArray(count) && count.length === 0);

  const displayCount = getDisplayCount(count, overflowCount);
  const isDot = dot || (!count && count !== 0);

  // Status badge (without children)
  if (status && !hasChildren) {
    return (
      <span
        className={classNames(
          styles.badgeStatus,
          styles[status],
          styles[size],
          className
        )}
        style={color ? { backgroundColor: color, ...style } : style}
        title={title}
      >
        {text && <span className={styles.badgeStatusText}>{text}</span>}
      </span>
    );
  }

  // Badge with children (positioned badge)
  if (hasChildren) {
    return (
      <span
        className={classNames(styles.badgeWrapper, className)}
        style={style}
      >
        {children}
        {(!isEmpty || showZero || dot) && (
          <span
            className={classNames(
              styles.badge,
              styles[size],
              {
                [styles.dot]: isDot,
                [styles.multiple]: String(displayCount).length > 1,
                [styles.statusBadge]: !!status,
                [styles[status || 'default']]: true,
              }
            )}
            style={{
              ...(color ? { backgroundColor: color, borderColor: color } : {}),
              ...(offset ? {
                marginTop: offset[1],
                marginRight: -offset[0],
              } : {}),
            }}
            title={title || (typeof count === 'number' ? count.toString() : undefined)}
          >
            {!isDot && displayCount}
          </span>
        )}
      </span>
    );
  }

  // Standalone badge (without children)
  if (!isEmpty || showZero) {
    return (
      <span
        className={classNames(
          styles.badgeStandalone,
          styles[size],
          {
            [styles.dot]: isDot,
            [styles.multiple]: String(displayCount).length > 1,
            [styles.statusBadge]: !!status,
            [styles[status || 'default']]: true,
          },
          className
        )}
        style={color ? { backgroundColor: color, borderColor: color, ...style } : style}
        title={title || (typeof count === 'number' ? count.toString() : undefined)}
      >
        {!isDot && displayCount}
      </span>
    );
  }

  // Return children only if badge is empty
  return hasChildren ? <span className={className} style={style}>{children}</span> : null;
};
export default Badge;