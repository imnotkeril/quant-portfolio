/**
 * Portfolio Creation Component - Updated with Easy/Professional modes
 * File: frontend/src/pages/PortfolioCreation/index.tsx
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { usePortfolios } from '../../hooks/usePortfolios';
import { PortfolioCreate, AssetCreate } from '../../types/portfolio';
import { CreationStepBasic } from './steps/CreationStepBasic';
import { CreationStepAssets } from './steps/CreationStepAssets';
import { CreationStepConstraints } from './steps/CreationStepConstraints';
import { CreationStepReview } from './steps/CreationStepReview';
import styles from './PortfolioCreation.module.css';

// Types
type CreationMode = 'easy' | 'professional';
type CreationStep = 'mode' | 'basic' | 'assets' | 'constraints' | 'review';

interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

interface ConstraintsData {
  maxPositionSize: number;
  minPositionSize: number;
  sectorLimits: Record<string, number>;
  allowedRegions: string[];
  enableTaxOptimization: boolean;
  enableESG: boolean;
  enableCurrencyHedging: boolean;
}

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  portfolioType?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  rebalancingFrequency?: string;
  tags?: string[];
  assets: AssetFormData[];
  constraints?: ConstraintsData;
}

const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio, loading, error } = usePortfolios();

  // State management
  const [mode, setMode] = useState<CreationMode | null>(null);
  const [step, setStep] = useState<CreationStep>('mode');
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    startingAmount: 100000,
    assets: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step navigation
  const getNextStep = (currentStep: CreationStep, currentMode: CreationMode): CreationStep => {
    switch (currentStep) {
      case 'mode':
        return 'basic';
      case 'basic':
        return 'assets';
      case 'assets':
        return currentMode === 'professional' ? 'constraints' : 'review';
      case 'constraints':
        return 'review';
      default:
        return 'review';
    }
  };

  const getPrevStep = (currentStep: CreationStep, currentMode: CreationMode): CreationStep => {
    switch (currentStep) {
      case 'basic':
        return 'mode';
      case 'assets':
        return 'basic';
      case 'constraints':
        return 'assets';
      case 'review':
        return currentMode === 'professional' ? 'constraints' : 'assets';
      default:
        return 'mode';
    }
  };

  // Handlers
  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    setStep('basic');
    setErrors({});
  };

  const handleBasicNext = (data: Partial<PortfolioFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(getNextStep('basic', mode!));
    setErrors({});
  };

  const handleAssetsNext = (assets: AssetFormData[]) => {
    setFormData(prev => ({ ...prev, assets }));
    setStep(getNextStep('assets', mode!));
    setErrors({});
  };

  const handleConstraintsNext = (constraints: ConstraintsData) => {
    setFormData(prev => ({ ...prev, constraints }));
    setStep(getNextStep('constraints', mode!));
    setErrors({});
  };

  const handleBack = () => {
    const prevStep = getPrevStep(step, mode!);
    if (prevStep === 'mode') {
      setMode(null);
      setStep('mode');
    } else {
      setStep(prevStep);
    }
    setErrors({});
  };

  const handleCreatePortfolio = async () => {
    try {
      setErrors({});

      // Prepare portfolio data for API
      const portfolioData: PortfolioCreate = {
        name: formData.name,
        description: formData.description,
        assets: formData.assets.map(asset => ({
          ticker: asset.ticker,
          name: asset.name,
          weight: asset.weight / 100, // Convert percentage to decimal
          quantity: asset.quantity,
          purchasePrice: asset.purchasePrice,
          purchaseDate: asset.purchaseDate,
          sector: asset.sector,
          assetClass: asset.assetClass,
        })) as AssetCreate[],
      };

      console.log('Creating portfolio:', portfolioData);
      const newPortfolio = await createPortfolio(portfolioData);

      if (newPortfolio) {
        console.log('Portfolio created successfully:', newPortfolio);
        navigate('/portfolios', {
          state: {
            message: `Portfolio "${formData.name}" created successfully!`,
            portfolioId: newPortfolio.id
          }
        });
      }
    } catch (err) {
      console.error('Portfolio creation error:', err);
      setErrors({
        general: 'Failed to create portfolio. Please check your data and try again.'
      });
    }
  };

  // Mode Selection UI
  const renderModeSelection = () => (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Portfolio</h1>
          <p className={styles.subtitle}>
            Choose your preferred creation method to get started
          </p>
        </div>

        <div className={styles.modeSelection}>
          {/* Easy Mode Card */}
          <Card className={`${styles.modeCard} ${styles.basicMode}`}>
            <div className={styles.modeIcon}>⚡</div>
            <h2 className={styles.modeTitle}>Easy Mode</h2>
            <div className={styles.modeFeatures}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Quick setup with smart defaults
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Ready-made templates
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Perfect for beginners
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                2-3 steps to completion
              </div>
            </div>
            <Button
              onClick={() => handleModeSelect('easy')}
              className={styles.modeButton}
              size="large"
            >
              Start Easy Mode
            </Button>
          </Card>

          {/* Professional Mode Card */}
          <Card className={`${styles.modeCard} ${styles.advancedMode}`}>
            <div className={styles.modeIcon}>⚙️</div>
            <h2 className={styles.modeTitle}>Professional Mode</h2>
            <div className={styles.modeFeatures}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Full control over settings
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Advanced constraints
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Professional features
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Detailed configuration
              </div>
            </div>
            <Button
              onClick={() => handleModeSelect('professional')}
              className={styles.modeButton}
              size="large"
            >
              Start Professional Mode
            </Button>
          </Card>
        </div>

        <div className={styles.tip}>
          💡 You can always upgrade from Easy to Professional mode later
        </div>
      </div>
    </div>
  );

  // Step Components Rendering
  const renderStepContent = () => {
    if (!mode) return null;

    switch (step) {
      case 'basic':
        return (
          <CreationStepBasic
            mode={mode}
            formData={formData}
            onNext={handleBasicNext}
            onBack={handleBack}
            errors={errors}
            loading={loading}
          />
        );

      case 'assets':
        return (
          <CreationStepAssets
            mode={mode}
            formData={formData}
            onNext={handleAssetsNext}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        );

      case 'constraints':
        return mode === 'professional' ? (
          <CreationStepConstraints
            formData={formData}
            onNext={handleConstraintsNext}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        ) : null;

      case 'review':
        return (
          <CreationStepReview
            mode={mode}
            formData={formData}
            onCreate={handleCreatePortfolio}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  // Main render
  if (step === 'mode') {
    return renderModeSelection();
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default PortfolioCreation;