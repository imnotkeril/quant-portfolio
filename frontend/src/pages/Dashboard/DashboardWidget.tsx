/**
 * DashboardWidget Component
 * Reusable widget for dashboard metrics and charts
 */
import React from 'react';
import classNames from 'classnames';
import Card from '../../components/common/Card/Card';
import styles from './styles.module.css';

interface DashboardWidgetProps {
  title: string;
  type: 'chart' | 'metrics' | 'pie' | 'number' | 'trend';
  data?: any;
  value?: string | number;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  type,
  data,
  value,
  change,
  positive,
  icon,
  actions,
  loading = false,
  className,
  onClick,
}) => {
  const widgetClasses = classNames(
    styles.widget,
    styles[`widget${type.charAt(0).toUpperCase() + type.slice(1)}`],
    {
      [styles.clickable]: !!onClick,
      [styles.loading]: loading,
    },
    className
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.widgetLoading}>
          <div className={styles.loadingSpinner} />
          <span>Loading...</span>
        </div>
      );
    }

    switch (type) {
      case 'number':
        return (
          <div className={styles.numberContent}>
            <div className={styles.numberValue}>
              {value}
            </div>
            {change && (
              <div className={classNames(styles.numberChange, {
                [styles.positive]: positive,
                [styles.negative]: !positive,
              })}>
                {positive ? '↑' : '↓'} {change}
              </div>
            )}
          </div>
        );

      case 'trend':
        return (
          <div className={styles.trendContent}>
            <div className={styles.trendValue}>
              {value}
            </div>
            <div className={styles.trendChart}>
              {/* Simple trend line - in real implementation would use chart library */}
              <svg width="100%" height="40" viewBox="0 0 100 40">
                <polyline
                  points="0,30 20,25 40,15 60,20 80,10 100,5"
                  fill="none"
                  stroke={positive ? '#74F174' : '#FAA1A4'}
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className={styles.metricsContent}>
            {Array.isArray(data) ? data.map((metric, index) => (
              <div key={index} className={styles.metricRow}>
                <span className={styles.metricName}>{metric.name}</span>
                <div className={styles.metricValue}>
                  <span>{metric.value}</span>
                  {metric.change && (
                    <span className={classNames(styles.metricChange, {
                      [styles.positive]: metric.positive,
                      [styles.negative]: !metric.positive,
                    })}>
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className={styles.noData}>No metrics data</div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className={styles.chartContent}>
            {Array.isArray(data) && data.length > 0 ? (
              <div className={styles.simpleChart}>
                {/* Simple chart visualization - in real implementation would use recharts */}
                <svg width="100%" height="120" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#BF9FFB" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#BF9FFB" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  {data.map((point, index) => {
                    const x = (index / (data.length - 1)) * 280 + 10;
                    const y = 110 - ((point.portfolio - 100000) / 20000) * 80;
                    const nextPoint = data[index + 1];
                    if (nextPoint) {
                      const nextX = ((index + 1) / (data.length - 1)) * 280 + 10;
                      const nextY = 110 - ((nextPoint.portfolio - 100000) / 20000) * 80;
                      return (
                        <line
                          key={index}
                          x1={x}
                          y1={y}
                          x2={nextX}
                          y2={nextY}
                          stroke="#BF9FFB"
                          strokeWidth="2"
                        />
                      );
                    }
                    return null;
                  })}
                </svg>
              </div>
            ) : (
              <div className={styles.noData}>No chart data</div>
            )}
          </div>
        );

      case 'pie':
        return (
          <div className={styles.pieContent}>
            {Array.isArray(data) && data.length > 0 ? (
              <>
                <div className={styles.pieChart}>
                  {/* Simple pie chart - in real implementation would use recharts */}
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#2A2E39"
                      strokeWidth="20"
                    />
                    {data.reduce((acc, segment, index) => {
                      const startAngle = acc.angle;
                      const endAngle = startAngle + (segment.value / 100) * 360;
                      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                      const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                      const largeArc = segment.value > 50 ? 1 : 0;

                      acc.elements.push(
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                        />
                      );
                      acc.angle = endAngle;
                      return acc;
                    }, { angle: 0, elements: [] }).elements}
                  </svg>
                </div>
                <div className={styles.pieLegend}>
                  {data.map((segment, index) => (
                    <div key={index} className={styles.legendItem}>
                      <div
                        className={styles.legendColor}
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className={styles.legendLabel}>
                        {segment.name}: {segment.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noData}>No pie chart data</div>
            )}
          </div>
        );

      default:
        return (
          <div className={styles.defaultContent}>
            {data ? JSON.stringify(data) : 'No data'}
          </div>
        );
    }
  };

  return (
    <Card
      className={widgetClasses}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          {icon && <span className={styles.widgetIcon}>{icon}</span>}
          <span>{title}</span>
        </div>
        {actions && (
          <div className={styles.widgetActions}>
            {actions}
          </div>
        )}
      </div>
      <div className={styles.widgetContent}>
        {renderContent()}
      </div>
    </Card>
  );
};