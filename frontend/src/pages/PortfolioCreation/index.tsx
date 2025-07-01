/**
 * Portfolio Creation Page
 * Multi-step wizard with Easy and Professional modes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Select } from '../../components/common/Select/Select';
import { AssetForm } from '../../components/portfolio/AssetForm/AssetForm';
import { AssetTable } from '../../components/portfolio/AssetTable/AssetTable';
import PortfolioTemplates from '../../components/portfolio/PortfolioTemplates/PortfolioTemplates';
import PortfolioModeSelector from './PortfolioModeSelector';
import { usePortfolios } from '../../hooks/usePortfolios';
import { PortfolioCreateRequest, Asset, PortfolioType } from '../../types/portfolio';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import styles from './PortfolioCreation.module.css';

type CreationMode = 'easy' | 'professional';
type CreationStep = 'mode' | 'basic' | 'assets' | 'templates' | 'strategy' | 'review';

interface CreationStepConfig {
  id: CreationStep;
  title: string;
  description: string;
}

const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const portfolios = usePortfolios();
  const [searchParams] = useSearchParams();

  // Get mode from URL params
  const initialMode = searchParams.get('mode') as CreationMode || null;

  // State management
  const [mode, setMode] = useState<CreationMode | null>(initialMode);
  const [currentStep, setCurrentStep] = useState<CreationStep>(initialMode ? 'basic' : 'mode');
  const [showTemplates, setShowTemplates] = useState(false);

  const [formData, setFormData] = useState<PortfolioCreateRequest>({
    name: '',
    description: '',
    type: 'CUSTOM',
    currency: 'USD',
    initialCash: 100000,
    assets: [],
    riskTolerance: 'MODERATE',
    investmentObjective: 'GROWTH',
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Mode selection
  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    setCurrentStep('basic');
    // Update URL without page reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('mode', selectedMode);
    window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
  };

  // Form handlers
  const handleInputChange = (field: keyof PortfolioCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAssetAdd = (asset: Asset) => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, { ...asset, id: Date.now().toString() }]
    }));
    setShowAssetForm(false);
  };

  const handleAssetEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleAssetUpdate = (updatedAsset: Asset) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === updatedAsset.id ? updatedAsset : a)
    }));
    setEditingAsset(null);
    setShowAssetForm(false);
  };

  const handleAssetDelete = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== assetId)
    }));
  };

  // Template selection
  const handleTemplateSelect = (templateData: any) => {
    setFormData(prev => ({
      ...prev,
      ...templateData
    }));
    setShowTemplates(false);
    setCurrentStep('review');
  };

  // Validation
  const validateStep = (step: CreationStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = 'Portfolio name is required';
        }
        if (mode === 'easy' && formData.initialCash <= 0) {
          newErrors.initialCash = 'Initial cash must be greater than 0';
        }
        break;

      case 'assets':
        if (formData.assets.length === 0) {
          newErrors.assets = 'At least one asset is required';
        }
        const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
        if (Math.abs(totalWeight - 100) > 0.01) {
          newErrors.assets = 'Total asset weights must equal 100%';
        }
        break;

      case 'strategy':
        // Professional mode strategy validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: CreationStep[] = mode === 'easy'
      ? ['basic', 'assets', 'review']
      : ['basic', 'strategy', 'assets', 'review'];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const stepOrder: CreationStep[] = mode === 'easy'
      ? ['basic', 'assets', 'review']
      : ['basic', 'strategy', 'assets', 'review'];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    } else {
      setCurrentStep('mode');
      setMode(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsCreating(true);
    try {
      const portfolio = await portfolios.createPortfolio(formData);
      if (portfolio) {
        navigate(ROUTES.PORTFOLIO.ANALYSIS.replace(':id', portfolio.id));
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      setErrors({ submit: 'Failed to create portfolio. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Portfolio type options for Professional mode
  const portfolioTypeOptions = [
    { value: 'CUSTOM', label: 'Custom Portfolio' },
    { value: 'EQUITY', label: 'Equity Focus' },
    { value: 'FIXED_INCOME', label: 'Fixed Income' },
    { value: 'BALANCED', label: 'Balanced Portfolio' },
    { value: 'AGGRESSIVE_GROWTH', label: 'Aggressive Growth' },
    { value: 'CONSERVATIVE', label: 'Conservative' },
  ];

  const riskToleranceOptions = [
    { value: 'CONSERVATIVE', label: 'Conservative' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'AGGRESSIVE', label: 'Aggressive' },
  ];

  const investmentObjectiveOptions = [
    { value: 'GROWTH', label: 'Growth' },
    { value: 'INCOME', label: 'Income' },
    { value: 'BALANCED', label: 'Balanced' },
    { value: 'CAPITAL_PRESERVATION', label: 'Capital Preservation' },
  ];

  // Render mode selector
  if (currentStep === 'mode') {
    return <PortfolioModeSelector onModeSelect={handleModeSelect} />;
  }

  // Render templates modal
  if (showTemplates) {
    return (
      <PortfolioTemplates
        onSelectTemplate={handleTemplateSelect}
        onCancel={() => setShowTemplates(false)}
        initialCash={formData.initialCash}
        showAsModal={true}
        isOpen={true}
        onClose={() => setShowTemplates(false)}
      />
    );
  }

  // Get step configuration
  const getStepConfig = (): CreationStepConfig[] => {
    if (mode === 'easy') {
      return [
        { id: 'basic', title: 'Basic Info', description: 'Portfolio details' },
        { id: 'assets', title: 'Assets', description: 'Add holdings' },
        { id: 'review', title: 'Review', description: 'Create portfolio' }
      ];
    } else {
      return [
        { id: 'basic', title: 'Basic Info', description: 'Portfolio details' },
        { id: 'strategy', title: 'Strategy', description: 'Investment approach' },
        { id: 'assets', title: 'Assets', description: 'Portfolio holdings' },
        { id: 'review', title: 'Review', description: 'Final review' }
      ];
    }
  };

  const steps = getStepConfig();
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              {mode === 'easy' ? '🟢 Easy Setup' : '🔵 Professional Setup'}
            </h3>
            <p className={styles.stepDescription}>
              {mode === 'easy'
                ? 'Quick setup with just the essentials'
                : 'Detailed configuration with all options'
              }
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <Input
                  label="Portfolio Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter portfolio name"
                  error={errors.name}
                />
              </div>

              {mode === 'professional' && (
                <div className={styles.formField}>
                  <Select
                    label="Portfolio Type"
                    value={formData.type}
                    onChange={(value) => handleInputChange('type', value as PortfolioType)}
                    options={portfolioTypeOptions}
                  />
                </div>
              )}

              <div className={styles.formFieldFull}>
                <Input
                  label={mode === 'easy' ? 'Description (optional)' : 'Description *'}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your portfolio objectives and strategy"
                  multiline
                  rows={3}
                  error={errors.description}
                />
              </div>

              <div className={styles.formField}>
                <Input
                  label="Starting Amount *"
                  type="number"
                  value={formData.initialCash}
                  onChange={(e) => handleInputChange('initialCash', Number(e.target.value))}
                  placeholder="100000"
                  min={0}
                  step={1000}
                  error={errors.initialCash}
                />
              </div>
            </div>
          </div>
        );

      case 'strategy':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Investment Strategy</h3>
            <p className={styles.stepDescription}>
              Define your investment approach and risk preferences
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <Select
                  label="Risk Tolerance"
                  value={formData.riskTolerance}
                  onChange={(value) => handleInputChange('riskTolerance', value)}
                  options={riskToleranceOptions}
                />
              </div>

              <div className={styles.formField}>
                <Select
                  label="Investment Objective"
                  value={formData.investmentObjective}
                  onChange={(value) => handleInputChange('investmentObjective', value)}
                  options={investmentObjectiveOptions}
                />
              </div>
            </div>

            <Card className={styles.strategyInfo}>
              <h4>Strategy Guidelines</h4>
              <div className={styles.guidelines}>
                <div className={styles.guideline}>
                  <strong>Conservative:</strong> Focus on capital preservation with lower volatility
                </div>
                <div className={styles.guideline}>
                  <strong>Moderate:</strong> Balanced approach between growth and stability
                </div>
                <div className={styles.guideline}>
                  <strong>Aggressive:</strong> Higher growth potential with increased risk
                </div>
              </div>
            </Card>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Portfolio Assets</h3>
            <p className={styles.stepDescription}>
              Add assets to your portfolio with target allocations
            </p>

            <div className={styles.assetsHeader}>
              <div className={styles.assetsActions}>
                <Button
                  onClick={() => setShowAssetForm(true)}
                  variant="primary"
                  disabled={showAssetForm}
                >
                  Add Asset
                </Button>

                {mode === 'easy' && (
                  <Button
                    onClick={() => setShowTemplates(true)}
                    variant="secondary"
                  >
                    📋 Use Template
                  </Button>
                )}
              </div>

              {formData.assets.length > 0 && (
                <div className={styles.allocationSummary}>
                  Total: {formatPercentage(
                    formData.assets.reduce((sum, asset) => sum + asset.weight, 0) / 100
                  )}
                </div>
              )}
            </div>

            {errors.assets && (
              <div className={styles.error}>
                {errors.assets}
              </div>
            )}

            {showAssetForm && (
              <Card className={styles.assetFormCard}>
                <AssetForm
                  asset={editingAsset}
                  onSubmit={editingAsset ? handleAssetUpdate : handleAssetAdd}
                  onCancel={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                />
              </Card>
            )}

            {formData.assets.length > 0 ? (
              <AssetTable
                assets={formData.assets}
                onEdit={handleAssetEdit}
                onDelete={handleAssetDelete}
                showActions
              />
            ) : (
              <div className={styles.emptyAssets}>
                <div className={styles.emptyIcon}>📊</div>
                <p>No assets added yet</p>
                <p className={styles.emptyDescription}>
                  {mode === 'easy'
                    ? 'Add assets manually or use a template to get started'
                    : 'Add stocks, bonds, ETFs, or other assets to build your portfolio'
                  }
                </p>
                {mode === 'easy' && (
                  <Button
                    onClick={() => setShowTemplates(true)}
                    variant="primary"
                    className={styles.templatesButton}
                  >
                    Browse Templates 📋
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Review & Create</h3>
            <p className={styles.stepDescription}>
              Review your portfolio details before creating
            </p>

            <div className={styles.reviewSections}>
              <Card className={styles.reviewCard}>
                <h4>Portfolio Details</h4>
                <div className={styles.reviewItem}>
                  <span>Name:</span>
                  <span>{formData.name}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span>Description:</span>
                  <span>{formData.description || 'No description'}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span>Starting Amount:</span>
                  <span>{formatCurrency(formData.initialCash)}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span>Mode:</span>
                  <span>{mode === 'easy' ? 'Easy Mode' : 'Professional Mode'}</span>
                </div>
              </Card>

              <Card className={styles.reviewCard}>
                <h4>Assets ({formData.assets.length})</h4>
                {formData.assets.map((asset, index) => (
                  <div key={asset.id} className={styles.reviewAsset}>
                    <span className={styles.assetSymbol}>{asset.ticker}</span>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetWeight}>
                      {formatPercentage(asset.weight / 100)}
                    </span>
                  </div>
                ))}
                <div className={styles.totalWeight}>
                  Total: {formatPercentage(
                    formData.assets.reduce((sum, asset) => sum + asset.weight, 0) / 100
                  )}
                </div>
              </Card>
            </div>

            {errors.submit && (
              <div className={styles.error}>
                {errors.submit}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Create Portfolio - {mode === 'easy' ? 'Easy Mode 🟢' : 'Professional Mode 🔵'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'easy'
              ? 'Quick and simple portfolio creation'
              : 'Advanced portfolio setup with full control'
            }
          </p>
        </div>

        {/* Progress indicator */}
        <Card className={styles.progressCard}>
          <div className={styles.progressSteps}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${
                  index === currentStepIndex ? styles.active : ''
                } ${index < currentStepIndex ? styles.completed : ''}`}
              >
                <div className={styles.stepNumber}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDescription}>{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Main content */}
        <Card className={styles.mainCard}>
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className={styles.navigation}>
          <div className={styles.navLeft}>
            <Button
              onClick={() => navigate(ROUTES.PORTFOLIOS)}
              variant="ghost"
            >
              Cancel
            </Button>
            {currentStepIndex > 0 && (
              <Button onClick={handlePrevious} variant="secondary">
                Previous
              </Button>
            )}
          </div>

          <div className={styles.navRight}>
            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={handleNext} variant="primary">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="primary"
                loading={isCreating}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Portfolio'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PortfolioCreation;