/**
 * AnalysisPanel Component
 * Quick analysis insights panel
 */
import React from 'react';
import { Card } from '../../../components/common/Card/Card';
import { MetricsCard } from '../../../components/analytics/MetricsCard/MetricsCard';
import { Portfolio } from '../../../types/portfolio';
import { PerformanceMetricsResponse, RiskMetricsResponse } from '../../../types/analytics';
import styles from '../styles.module.css';

interface AnalysisPanelProps {
  portfolio: Portfolio;
  performanceMetrics?: PerformanceMetricsResponse | null;
  riskMetrics?: RiskMetricsResponse | null;
  loading?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  portfolio,
  performanceMetrics,
  riskMetrics,
  loading = false,
}) => {
  // Calculate portfolio health score
  const calculateHealthScore = (): number => {
    let score = 50; // Base score

    // Diversification factor
    const assetCount = portfolio.assets.length;
    if (assetCount >= 10) score += 20;
    else if (assetCount >= 5) score += 10;
    else score -= 10;

    // Performance factor
    if (performanceMetrics?.totalReturn) {
      if (performanceMetrics.totalReturn > 0.1) score += 15;
      else if (performanceMetrics.totalReturn > 0) score += 5;
      else score -= 15;
    }

    // Risk factor - get sharpe ratio from performance metrics
    const sharpeRatio = performanceMetrics?.ratioMetrics?.['sharpeRatio'] || performanceMetrics?.ratioMetrics?.['sharpe'];
    if (sharpeRatio) {
      if (sharpeRatio > 1.5) score += 15;
      else if (sharpeRatio > 1) score += 10;
      else if (sharpeRatio > 0.5) score += 5;
      else score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#74F174' };
    if (score >= 60) return { label: 'Good', color: '#90BFF9' };
    if (score >= 40) return { label: 'Fair', color: '#FFF59D' };
    return { label: 'Needs Attention', color: '#FAA1A4' };
  };

  const healthStatus = getHealthStatus(healthScore);

  // Get sharpe ratio for recommendations
  const sharpeRatio = performanceMetrics?.ratioMetrics?.['sharpeRatio'] || performanceMetrics?.ratioMetrics?.['sharpe'];

  // Key insights
  const insights = [
    {
      title: 'Portfolio Health',
      value: `${healthScore}/100`,
      subtitle: healthStatus.label,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      color: healthStatus.color,
      loading,
    },
    {
      title: 'Performance Rating',
      value: performanceMetrics?.totalReturn
        ? (performanceMetrics.totalReturn > 0.1 ? 'Strong' : performanceMetrics.totalReturn > 0 ? 'Positive' : 'Negative')
        : 'N/A',
      subtitle: performanceMetrics?.totalReturn
        ? `${(performanceMetrics.totalReturn * 100).toFixed(2)}% return`
        : 'Loading...',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
      loading,
    },
    {
      title: 'Risk Level',
      value: riskMetrics?.volatility
        ? (riskMetrics.volatility < 0.15 ? 'Low' : riskMetrics.volatility < 0.25 ? 'Medium' : 'High')
        : 'N/A',
      subtitle: riskMetrics?.volatility
        ? `${(riskMetrics.volatility * 100).toFixed(2)}% volatility`
        : 'Loading...',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
      loading,
    },
  ];

  return (
    <Card className={styles.analysisPanel}>
      <h3>Analysis Overview</h3>

      <div className={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <div key={index} className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <div className={styles.insightIcon} style={{ color: insight.color }}>
                {insight.icon}
              </div>
              <span className={styles.insightTitle}>{insight.title}</span>
            </div>

            <div className={styles.insightContent}>
              {insight.loading ? (
                <div className={styles.insightLoading}>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.insightValue}>{insight.value}</div>
                  <div className={styles.insightSubtitle}>{insight.subtitle}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recommendations}>
        <h4>Quick Recommendations</h4>
        <div className={styles.recommendationsList}>
          {healthScore < 60 && (
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>⚠️</div>
              <div className={styles.recommendationText}>
                <strong>Consider rebalancing:</strong> Your portfolio health score is below optimal levels.
              </div>
            </div>
          )}

          {portfolio.assets.length < 5 && (
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>📊</div>
              <div className={styles.recommendationText}>
                <strong>Improve diversification:</strong> Consider adding more assets to reduce concentration risk.
              </div>
            </div>
          )}

          {sharpeRatio && sharpeRatio < 1 && (
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>⚖️</div>
              <div className={styles.recommendationText}>
                <strong>Optimize risk-return:</strong> Your Sharpe ratio suggests room for improvement.
              </div>
            </div>
          )}

          {performanceMetrics?.totalReturn && performanceMetrics.totalReturn < 0 && (
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>📈</div>
              <div className={styles.recommendationText}>
                <strong>Review strategy:</strong> Consider analyzing underperforming assets.
              </div>
            </div>
          )}

          {/* Default recommendation if portfolio looks good */}
          {healthScore >= 80 && (
            <div className={styles.recommendation}>
              <div className={styles.recommendationIcon}>✅</div>
              <div className={styles.recommendationText}>
                <strong>Well balanced:</strong> Your portfolio shows strong fundamentals. Continue monitoring.
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};