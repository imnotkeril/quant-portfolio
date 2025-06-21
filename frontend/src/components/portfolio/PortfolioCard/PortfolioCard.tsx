/**
 * PortfolioCard Component
 * Card component for displaying portfolio summary information
 */
import React from 'react';
import classNames from 'classnames';
import Card from '../../common/Card';
import { Button } from '../../common/Button';
import Badge from '../../common/Badge';
import { PortfolioListItem } from '../../../types/portfolio';
import { formatDate, formatNumber } from '../../../utils/formatters';
import styles from './PortfolioCard.module.css';

interface PortfolioCardProps {
  portfolio: PortfolioListItem;
  selected?: boolean;
  onClick?: () => void;
  onAnalyze?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  selected = false,
  onClick,
  onAnalyze,
  onEdit,
  onDelete,
  className,
  'data-testid': testId,
}) => {
  const handleCardClick = (event: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  const handleAnalyze = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAnalyze?.();
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.();
  };

  const cardClasses = classNames(
    styles.card,
    {
      [styles.selected]: selected,
      [styles.clickable]: !!onClick,
    },
    className
  );

  return (
    <Card
      className={cardClasses}
      onClick={handleCardClick}
      hoverable={!!onClick}
      data-testid={testId}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{portfolio.name}</h3>
          {portfolio.description && (
            <p className={styles.description}>{portfolio.description}</p>
          )}
        </div>

        <div className={styles.actions}>
          {onAnalyze && (
            <Button
              variant="primary"
              size="small"
              onClick={handleAnalyze}
              aria-label={`Analyze ${portfolio.name}`}
            >
              Analyze
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="small"
              onClick={handleEdit}
              aria-label={`Edit ${portfolio.name}`}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
              aria-label={`Delete ${portfolio.name}`}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Assets</span>
            <span className={styles.statValue}>{formatNumber(portfolio.assetCount)}</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statLabel}>Last Updated</span>
            <span className={styles.statValue}>
              {formatDate(portfolio.lastUpdated, 'relative')}
            </span>
          </div>
        </div>

        {portfolio.tags.length > 0 && (
          <div className={styles.tags}>
            {portfolio.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                size="small"
                className={styles.tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PortfolioCard;