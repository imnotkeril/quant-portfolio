/**
 * PortfolioModeSelector Component
 * Mode selection for portfolio creation (Easy vs Professional)
 */
import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import styles from './PortfolioModeSelector.module.css';

interface PortfolioModeSelectorProps {
  onModeSelect?: (mode: 'easy' | 'professional') => void;
}

const PortfolioModeSelector: React.FC<PortfolioModeSelectorProps> = ({
  onModeSelect
}) => {
  const handleModeSelect = (mode: 'easy' | 'professional') => {
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

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
          {/* Easy Mode Card */}
          <Card className={`${styles.modeCard} ${styles.easyMode}`}>
            <div className={styles.modeHeader}>
              <div className={styles.modeIcon}>⚡</div>
              <div>
                <h2 className={styles.modeTitle}>Easy Mode</h2>
                <p className={styles.modeDescription}>
                  Perfect for getting started quickly with smart defaults
                </p>
              </div>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.feature}>📋 Ready-made templates</div>
              <div className={styles.feature}>🔄 Smart auto-completion</div>
              <div className={styles.feature}>⚡ Instant portfolio creation</div>
              <div className={styles.feature}>👤 Perfect for beginners</div>
            </div>

            <div className={styles.modeStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>2-3</span>
                <span className={styles.statLabel}>Steps</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>5 min</span>
                <span className={styles.statLabel}>Setup</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => handleModeSelect('easy')}
              className={styles.selectButton}
            >
              Choose Easy Mode ⚡
            </Button>

            <div className={styles.tip}>
              💡 Recommended for first-time users
            </div>
          </Card>

          {/* Professional Mode Card */}
          <Card className={`${styles.modeCard} ${styles.proMode}`}>
            <div className={styles.modeHeader}>
              <div className={styles.modeIcon}>⚙️</div>
              <div>
                <h2 className={styles.modeTitle}>Professional Mode</h2>
                <p className={styles.modeDescription}>
                  Complete control over all portfolio parameters
                </p>
              </div>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.feature}>⚙️ Full control over settings</div>
              <div className={styles.feature}>📊 Advanced constraints</div>
              <div className={styles.feature}>🎯 Custom algorithms</div>
              <div className={styles.feature}>📈 Professional features</div>
            </div>

            <div className={styles.modeStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>4-5</span>
                <span className={styles.statLabel}>Steps</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>15+ min</span>
                <span className={styles.statLabel}>Setup</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => handleModeSelect('professional')}
              className={styles.selectButton}
            >
              Choose Professional Mode ⚙️
            </Button>

            <div className={styles.tip}>
              🎯 For experienced investors
            </div>
          </Card>
        </div>

        {/* Simplified Comparison */}
        <div className={styles.quickComparison}>
          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Templates:</span>
            <span className={styles.comparisonEasy}>5 Ready-made</span>
            <span className={styles.comparisonVs}>vs</span>
            <span className={styles.comparisonPro}>Custom + Templates</span>
          </div>
          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Setup:</span>
            <span className={styles.comparisonEasy}>Quick & Simple</span>
            <span className={styles.comparisonVs}>vs</span>
            <span className={styles.comparisonPro}>Detailed Control</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioModeSelector;