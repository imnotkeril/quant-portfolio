/**
 * PortfolioModeSelector Component
 * Mode selection for portfolio creation (Easy vs Professional)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { ROUTES } from '../../constants/routes';
import styles from './PortfolioModeSelector.module.css';

interface PortfolioModeSelectorProps {
  onModeSelect?: (mode: 'easy' | 'professional') => void;
}

export const PortfolioModeSelector: React.FC<PortfolioModeSelectorProps> = ({
  onModeSelect
}) => {
  const navigate = useNavigate();

  const handleModeSelect = (mode: 'easy' | 'professional') => {
    if (onModeSelect) {
      onModeSelect(mode);
    } else {
      // Navigate to creation page with mode parameter
      navigate(`${ROUTES.PORTFOLIO.CREATE}?mode=${mode}`);
    }
  };

  const easyModeFeatures = [
    '✅ Quick 2-step setup',
    '✅ Smart auto-completion',
    '✅ Ready-made templates',
    '✅ Instant portfolio creation',
    '✅ Perfect for beginners'
  ];

  const professionalModeFeatures = [
    '⚙️ Full control over all settings',
    '⚙️ Advanced constraints & limits',
    '⚙️ Custom optimization algorithms',
    '⚙️ Detailed analytics & backtesting',
    '⚙️ Professional-grade features'
  ];

  return (
    <PageContainer>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Portfolio</h1>
          <p className={styles.subtitle}>
            Choose your preferred creation method to get started
          </p>
        </div>

        <div className={styles.modeSelection}>
          <Card className={styles.modeCard}>
            <div className={styles.modeIcon}>🟢</div>
            <h2 className={styles.modeTitle}>Easy Mode</h2>
            <p className={styles.modeDescription}>
              Perfect for getting started quickly with smart defaults and guided setup
            </p>

            <div className={styles.featuresList}>
              {easyModeFeatures.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  {feature}
                </div>
              ))}
            </div>

            <div className={styles.modeStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>~3 min</span>
                <span className={styles.statLabel}>Setup time</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>5+ templates</span>
                <span className={styles.statLabel}>Ready portfolios</span>
              </div>
            </div>

            <Button
              onClick={() => handleModeSelect('easy')}
              variant="primary"
              size="large"
              className={styles.selectButton}
            >
              Start Easy Mode ➡️
            </Button>

            <div className={styles.tip}>
              💡 Recommended for first-time users
            </div>
          </Card>

          <Card className={styles.modeCard}>
            <div className={styles.modeIcon}>🔵</div>
            <h2 className={styles.modeTitle}>Professional Mode</h2>
            <p className={styles.modeDescription}>
              Advanced setup with full control over every aspect of your portfolio
            </p>

            <div className={styles.featuresList}>
              {professionalModeFeatures.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  {feature}
                </div>
              ))}
            </div>

            <div className={styles.modeStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>~10 min</span>
                <span className={styles.statLabel}>Setup time</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>5+ algorithms</span>
                <span className={styles.statLabel}>Optimization methods</span>
              </div>
            </div>

            <Button
              onClick={() => handleModeSelect('professional')}
              variant="primary"
              size="large"
              className={styles.selectButton}
            >
              Advanced Mode ➡️
            </Button>

            <div className={styles.tip}>
              🎯 For experienced investors
            </div>
          </Card>
        </div>

        <div className={styles.comparison}>
          <Card className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>Quick Comparison</h3>
            <div className={styles.comparisonTable}>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonFeature}>Setup complexity</div>
                <div className={styles.comparisonEasy}>Simple</div>
                <div className={styles.comparisonPro}>Advanced</div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonFeature}>Required fields</div>
                <div className={styles.comparisonEasy}>3-5 fields</div>
                <div className={styles.comparisonPro}>15+ fields</div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonFeature}>Optimization</div>
                <div className={styles.comparisonEasy}>Auto-optimization</div>
                <div className={styles.comparisonPro}>Manual control</div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonFeature}>Templates</div>
                <div className={styles.comparisonEasy}>✅ Included</div>
                <div className={styles.comparisonPro}>✅ Included</div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonFeature}>Constraints</div>
                <div className={styles.comparisonEasy}>Smart defaults</div>
                <div className={styles.comparisonPro}>Custom limits</div>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            💡 You can always upgrade from Easy Mode to Professional Mode later
          </p>
          <Button
            onClick={() => navigate(ROUTES.PORTFOLIOS)}
            variant="ghost"
          >
            ← Back to Portfolios
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioModeSelector;