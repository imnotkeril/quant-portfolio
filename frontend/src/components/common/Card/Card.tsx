import React from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';

// Base Card Props
export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  loading?: boolean;
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

// Card Header Props
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

// Card Body Props
export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  maxHeight?: string | number;
}

// Card Footer Props
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

// Card Header Component
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  actions,
  avatar,
  title,
  subtitle,
}) => {
  return (
    <div className={classNames(styles.cardHeader, className)}>
      {avatar && <div className={styles.headerAvatar}>{avatar}</div>}

      <div className={styles.headerContent}>
        {title && <h3 className={styles.headerTitle}>{title}</h3>}
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
        {!title && !subtitle && children}
      </div>

      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
};

// Card Body Component
const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
  scrollable = false,
  maxHeight,
}) => {
  const bodyStyles = {
    ...(maxHeight && { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }),
  };

  return (
    <div
      className={classNames(
        styles.cardBody,
        {
          [styles.scrollable]: scrollable,
        },
        className
      )}
      style={bodyStyles}
    >
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  align = 'left',
}) => {
  return (
    <div
      className={classNames(
        styles.cardFooter,
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </div>
  );
};

// Main Card Component
const Card: React.FC<CardProps> = ({
  children,
  className,
  size = 'medium',
  variant = 'default',
  padding = 'medium',
  loading = false,
  hover = false,
  onClick,
  'data-testid': testId,
}) => {
  const cardClasses = classNames(
    styles.card,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    styles[`padding-${padding}`],
    {
      [styles.loading]: loading,
      [styles.hover]: hover,
      [styles.clickable]: !!onClick,
    },
    className
  );

  if (loading) {
    return (
      <div className={cardClasses} data-testid={testId}>
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-testid={testId}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

// Define the compound component interface
interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
}

// Create the compound component
const CardWithSubComponents = Card as CardComponent;
CardWithSubComponents.Header = CardHeader;
CardWithSubComponents.Body = CardBody;
CardWithSubComponents.Footer = CardFooter;

export { CardHeader, CardBody, CardFooter };
export default CardWithSubComponents;