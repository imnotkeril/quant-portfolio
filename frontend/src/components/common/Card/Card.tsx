/**
 * Card Component
 * Universal card container with header, body, and footer sections
 */
import React from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';

export type CardSize = 'small' | 'medium' | 'large';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  extra?: React.ReactNode;
  size?: CardSize;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  'data-testid'?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  extra,
  className,
}) => (
  <div className={classNames(styles.header, className)}>
    <div className={styles.headerContent}>
      {children}
    </div>
    {extra && (
      <div className={styles.headerExtra}>
        {extra}
      </div>
    )}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
}) => (
  <div className={classNames(styles.body, className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => (
  <div className={classNames(styles.footer, className)}>
    {children}
  </div>
);

export const Card: React.FC<CardProps> = ({
  children,
  title,
  extra,
  size = 'medium',
  bordered = true,
  hoverable = false,
  loading = false,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  onClick,
  'data-testid': testId,
}) => {
  const cardClasses = classNames(
    styles.card,
    styles[size],
    {
      [styles.bordered]: bordered,
      [styles.hoverable]: hoverable,
      [styles.clickable]: !!onClick,
      [styles.loading]: loading,
    },
    className
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    onClick?.(event);
  };

  const renderChildren = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Loading...</span>
        </div>
      );
    }

    // Check if children contains CardHeader/CardBody/CardFooter components
    const hasCardComponents = React.Children.toArray(children).some(child =>
      React.isValidElement(child) &&
      (child.type === CardHeader || child.type === CardBody || child.type === CardFooter)
    );

    if (hasCardComponents) {
      return children;
    }

    // If no card components, wrap in CardBody and add header if title provided
    return (
      <>
        {(title || extra) && (
          <CardHeader extra={extra} className={headerClassName}>
            {title}
          </CardHeader>
        )}
        <CardBody className={bodyClassName}>
          {children}
        </CardBody>
      </>
    );
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      data-testid={testId}
    >
      {renderChildren()}
    </div>
  );
};

// Add static properties for compound component pattern
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;