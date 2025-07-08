/**
 * Portfolio Creation Component - Updated with proper redirect
 * File: frontend/src/pages/PortfolioCreation/index.tsx
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { CreationStepBasic } from './steps/CreationStepBasic';
import { CreationStepAssets } from './steps/CreationStepAssets';
import { CreationStepConstraints } from './steps/CreationStepConstraints';
import { CreationStepReview } from './steps/CreationStepReview';
import { usePortfolios } from '../../hooks/usePortfolios';
import { createPortfolio } from '../../store/portfolio/actions';
import { PortfolioCreate, AssetCreate } from '../../types/portfolio';
import { ROUTES } from '../../constants/routes';
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

interface ErrorsState {
  general?: string;
  step?: string;
  [key: string]: string | undefined;
}

const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { createPortfolio } = usePortfolios();

  // State
  const [mode, setMode] = useState<CreationMode | null>(null);
  const [step, setStep] = useState<CreationStep>('mode');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorsState>({});

  // Form data
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    startingAmount: 100000,
    tags: [],
    assets: [],
  });

  // Get next step logic
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
      setLoading(true);
      setErrors({});

      // Validate form data
      if (!formData.name.trim()) {
        setErrors({ general: 'Portfolio name is required' });
        setLoading(false);
        return;
      }

      if (!formData.assets || formData.assets.length === 0) {
        setErrors({ general: 'At least one asset is required' });
        setLoading(false);
        return;
      }

      // Prepare portfolio data for API
      const portfolioData: PortfolioCreate = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        tags: formData.tags || [],
        assets: formData.assets.map(asset => ({
          ticker: asset.ticker.toUpperCase(),
          name: asset.name,
          weight: asset.weight / 100, // Convert percentage to decimal
          purchasePrice: asset.purchasePrice,
          purchaseDate: asset.purchaseDate,
          sector: asset.sector,
          assetClass: asset.assetClass,
        })) as AssetCreate[],
        initialValue: formData.startingAmount,
      };

      console.log('Creating portfolio:', portfolioData);

      // Create portfolio using hook
      const newPortfolio = await createPortfolio(portfolioData);

      if (newPortfolio) {
        console.log('Portfolio created successfully:', newPortfolio);

        // Navigate to portfolio list with success message
        navigate(ROUTES.PORTFOLIO.LIST, {
          state: {
            message: `Portfolio "${formData.name}" created successfully!`,
            portfolioId: newPortfolio.id
          }
        });
      } else {
        setErrors({ general: 'Failed to create portfolio. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create portfolio. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mode Selection UI
  const renderModeSelection = () => (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Portfolio</h1>
          <p className={styles.subtitle}>
            Choose how you'd like to build your portfolio
          </p>
        </div>

        <div className={styles.modeSelection}>
          <Card className={classNames(styles.modeCard, styles.basicMode)}>
            <div className={styles.modeIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 className={styles.modeTitle}>Easy Mode</h3>
            <div className={styles.modeFeatures}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Quick setup
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Simple asset selection
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Automatic optimization
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Perfect for beginners
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

          <Card className={classNames(styles.modeCard, styles.advancedMode)}>
            <div className={styles.modeIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modeTitle}>Professional Mode</h3>
            <div className={styles.modeFeatures}>
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
                Risk management
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
            error={errors.general}
          />
        );

      case 'constraints':
        return mode === 'professional' ? (
          <CreationStepConstraints
            formData={formData}
            onNext={handleConstraintsNext}
            onBack={handleBack}
            loading={loading}
            error={errors.general}
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
            error={errors.general}
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