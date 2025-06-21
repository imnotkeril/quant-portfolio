/**
 * HistoricalAnalogies Component
 * Displays historical analogies and their similarity scores
 */
import React, { useState } from 'react';
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';
import { Button } from '../../common/Button/Button';
import { Table, TableColumn } from '../../common/Table/Table';
import { BarChart } from '../../charts/BarChart/BarChart';
import { HistoricalAnalogy } from '../../../types/historical';
import { formatPercentage } from '../../../utils/formatters';
import styles from './HistoricalAnalogies.module.css';

interface HistoricalAnalogiesProps {
  analogies: HistoricalAnalogy[];
  currentRegime?: string;
  disclaimer?: string;
  loading?: boolean;
  onAnalogieSelect?: (analogy: HistoricalAnalogy) => void;
  onCompareAnalogies?: (analogies: HistoricalAnalogy[]) => void;
  onExploreOutcome?: (analogy: HistoricalAnalogy) => void;
  className?: string;
  'data-testid'?: string;
}

export const HistoricalAnalogies: React.FC<HistoricalAnalogiesProps> = ({
  analogies,
  currentRegime,
  disclaimer,
  loading = false,
  onAnalogieSelect,
  onCompareAnalogies,
  onExploreOutcome,
  className,
  'data-testid': testId,
}) => {
  const [selectedAnalogies, setSelectedAnalogies] = useState<HistoricalAnalogy[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [sortBy, setSortBy] = useState<'similarity' | 'period'>('similarity');

  const handleAnalogySelect = (analogy: HistoricalAnalogy) => {
    onAnalogieSelect?.(analogy);
  };

  const handleAnalogyToggle = (analogy: HistoricalAnalogy) => {
    const isSelected = selectedAnalogies.some(a => a.period === analogy.period);
    if (isSelected) {
      setSelectedAnalogies(prev => prev.filter(a => a.period !== analogy.period));
    } else {
      setSelectedAnalogies(prev => [...prev, analogy]);
    }
  };

  const handleCompareSelected = () => {
    if (selectedAnalogies.length >= 2) {
      onCompareAnalogies?.(selectedAnalogies);
    }
  };

  const handleExploreOutcome = (analogy: HistoricalAnalogy) => {
    onExploreOutcome?.(analogy);
  };

  const sortedAnalogies = [...analogies].sort((a, b) => {
    if (sortBy === 'similarity') {
      return b.similarity - a.similarity;
    }
    return a.period.localeCompare(b.period);
  });

  const chartData = sortedAnalogies.slice(0, 10).map(analogy => ({
    name: analogy.period,
    similarity: analogy.similarity * 100,
  }));

  const tableColumns: TableColumn<HistoricalAnalogy>[] = [
    {
      key: 'select',
      title: '',
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedAnalogies.some(a => a.period === record.period)}
          onChange={() => handleAnalogyToggle(record)}
        />
      ),
    },
    {
      key: 'period',
      title: 'Period',
      dataIndex: 'period',
      render: (value) => (
        <span className={styles.periodText}>{value}</span>
      ),
    },
    {
      key: 'event',
      title: 'Event',
      dataIndex: 'event',
      render: (value) => (
        <span className={styles.eventText}>{value}</span>
      ),
    },
    {
      key: 'similarity',
      title: 'Similarity',
      dataIndex: 'similarity',
      width: 120,
      align: 'center',
      render: (value) => (
        <div className={styles.similarityCell}>
          <div className={styles.similarityBar}>
            <div
              className={styles.similarityFill}
              style={{ width: `${value * 100}%` }}
            />
          </div>
          <span className={styles.similarityText}>
            {formatPercentage(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'outcome',
      title: 'Outcome',
      dataIndex: 'outcome',
      render: (value, record) => (
        <div className={styles.outcomeCell}>
          <span className={styles.outcomeText}>{value}</span>
          <Button
            variant="text"
            size="small"
            onClick={() => handleExploreOutcome(record)}
          >
            Explore
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card className={`${styles.container} ${className || ''}`} loading>
        Loading historical analogies...
      </Card>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      <Card
        title="Historical Analogies"
        extra={
          <div className={styles.headerActions}>
            {currentRegime && (
              <Badge status="processing" text={`Current Regime: ${currentRegime}`} />
            )}
            <div className={styles.viewToggle}>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('chart')}
              >
                Chart
              </Button>
            </div>
          </div>
        }
      >
        <div className={styles.content}>
          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.sortControls}>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'similarity' | 'period')}
                className={styles.sortSelect}
              >
                <option value="similarity">Similarity</option>
                <option value="period">Period</option>
              </select>
            </div>
            {selectedAnalogies.length >= 2 && (
              <Button
                variant="secondary"
                size="small"
                onClick={handleCompareSelected}
              >
                Compare Selected ({selectedAnalogies.length})
              </Button>
            )}
          </div>

          {/* Content */}
          {viewMode === 'table' ? (
            <div className={styles.tableContainer}>
              <Table
                columns={tableColumns}
                data={sortedAnalogies}
                rowKey="period"
                onRowClick={handleAnalogySelect}
                size="middle"
                pagination={{
                  pageSize: 10,
                  current: 1,
                  total: sortedAnalogies.length,
                  onChange: () => {},
                }}
              />
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <BarChart
                data={chartData}
                series={[
                  {
                    key: 'similarity',
                    name: 'Similarity Score (%)',
                    color: 'var(--color-accent)',
                  },
                ]}
                layout="horizontal"
                height={400}
                yAxisFormatter={(value) => value.toString()}
                tooltipFormatter={(value) => [`${value.toFixed(1)}%`, 'Similarity']}
              />
            </div>
          )}

          {/* Detailed View for Selected Analogy */}
          {selectedAnalogies.length === 1 && (
            <div className={styles.detailView}>
              <Card title={`${selectedAnalogies[0].event} (${selectedAnalogies[0].period})`}>
                <div className={styles.detailContent}>
                  <div className={styles.detailSection}>
                    <h4>Key Similarities</h4>
                    <ul className={styles.detailList}>
                      {selectedAnalogies[0].keySimilarities.map((similarity, index) => (
                        <li key={index} className={styles.similarityItem}>
                          <div className={styles.similarityIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 11l3 3L22 4"/>
                              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                          </div>
                          {similarity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Key Differences</h4>
                    <ul className={styles.detailList}>
                      {selectedAnalogies[0].keyDifferences.map((difference, index) => (
                        <li key={index} className={styles.differenceItem}>
                          <div className={styles.differenceIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </div>
                          {difference}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Lessons</h4>
                    <ul className={styles.detailList}>
                      {selectedAnalogies[0].lessons.map((lesson, index) => (
                        <li key={index} className={styles.lessonItem}>
                          <div className={styles.lessonIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                          </div>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Recommended Actions</h4>
                    <ul className={styles.detailList}>
                      {selectedAnalogies[0].recommendedActions.map((action, index) => (
                        <li key={index} className={styles.actionItem}>
                          <div className={styles.actionIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,11 12,14 22,4"/>
                              <path d="M21,12v7a2,2 0,0,1-2,2H5a2,2 0,0,1-2-2V5a2,2 0,0,1,2-2h11"/>
                            </svg>
                          </div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Disclaimer */}
          {disclaimer && (
            <div className={styles.disclaimer}>
              <div className={styles.disclaimerIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </div>
              <div className={styles.disclaimerContent}>
                <h4 className={styles.disclaimerTitle}>Important Notice</h4>
                <p className={styles.disclaimerText}>{disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HistoricalAnalogies;