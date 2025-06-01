/**
 * HistoricalContext Component
 * Displays detailed historical context for a specific scenario
 */
import React from 'react';
import { Card } from '../../common/Card/Card';
import { Badge } from '../../common/Badge/Badge';
import { Button } from '../../common/Button/Button';
import { HistoricalContext as HistoricalContextType } from '../../../types/historical';
import styles from './HistoricalContext.module.css';

interface HistoricalContextProps {
  context: HistoricalContextType;
  loading?: boolean;
  onClose?: () => void;
  onExploreMore?: (scenario: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const HistoricalContext: React.FC<HistoricalContextProps> = ({
  context,
  loading = false,
  onClose,
  onExploreMore,
  className,
  'data-testid': testId,
}) => {
  const handleExploreMore = () => {
    onExploreMore?.(context.name);
  };

  if (loading) {
    return (
      <Card className={`${styles.container} ${className || ''}`} loading>
        Loading historical context...
      </Card>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      <Card
        title={context.name}
        extra={
          <div className={styles.headerActions}>
            <Badge>{context.period}</Badge>
            {onClose && (
              <Button
                variant="outline"
                size="small"
                onClick={onClose}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                }
              >
              </Button>
            )}
          </div>
        }
      >
        <div className={styles.content}>
          {/* Trigger Events */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Trigger Events</h4>
            <div className={styles.eventsList}>
              {context.triggerEvents.map((event, index) => (
                <div key={index} className={styles.eventItem}>
                  <div className={styles.eventMarker} />
                  <span className={styles.eventText}>{event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Key Indicators</h4>
            <div className={styles.indicatorsList}>
              {context.keyIndicators.map((indicator, index) => (
                <div key={index} className={styles.indicatorItem}>
                  <div className={styles.indicatorHeader}>
                    <span className={styles.indicatorName}>{indicator.name}</span>
                    <div className={styles.indicatorValues}>
                      <span className={styles.actualValue}>{indicator.value}</span>
                      <span className={styles.normalValue}>Normal: {indicator.normal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Impact */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Market Impact</h4>
            <div className={styles.impactGrid}>
              {Object.entries(context.marketImpact).map(([sector, impact]) => (
                <div key={sector} className={styles.impactItem}>
                  <span className={styles.impactSector}>{sector}</span>
                  <span className={`${styles.impactValue} ${impact.startsWith('-') ? styles.negative : styles.positive}`}>
                    {impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Response */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Policy Response</h4>
            <div className={styles.responseList}>
              {context.policyResponse.map((response, index) => (
                <div key={index} className={styles.responseItem}>
                  <div className={styles.responseMarker} />
                  <span className={styles.responseText}>{response}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lessons Learned */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Lessons Learned</h4>
            <div className={styles.lessonsList}>
              {context.lessonsLearned.map((lesson, index) => (
                <div key={index} className={styles.lessonItem}>
                  <div className={styles.lessonIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  </div>
                  <span className={styles.lessonText}>{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Early Warning Signs */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Early Warning Signs</h4>
            <div className={styles.warningsList}>
              {context.earlyWarningSigns.map((warning, index) => (
                <div key={index} className={styles.warningItem}>
                  <div className={styles.warningIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <span className={styles.warningText}>{warning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Performance */}
          <div className={styles.assetPerformanceGrid}>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Most Resilient Assets</h4>
              <div className={styles.assetsList}>
                {context.mostResilientAssets.map((asset, index) => (
                  <Badge key={index} status="success" text={asset} className={styles.assetBadge} />
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Most Affected Assets</h4>
              <div className={styles.assetsList}>
                {context.mostAffectedAssets.map((asset, index) => (
                  <Badge key={index} status="error" text={asset} className={styles.assetBadge} />
                ))}
              </div>
            </div>
          </div>

          {/* Current Parallels */}
          {context.currentParallels && context.currentParallels.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Current Parallels</h4>
              <div className={styles.parallelsList}>
                {context.currentParallels.map((parallel, index) => (
                  <div key={index} className={styles.parallelItem}>
                    <div className={styles.parallelIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className={styles.parallelText}>{parallel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {onExploreMore && (
              <Button onClick={handleExploreMore}>
                Explore More Scenarios
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HistoricalContext;