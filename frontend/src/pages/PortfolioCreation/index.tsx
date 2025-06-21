/**
 * Portfolio Creation Page
 * Multi-step wizard for creating new investment portfolios
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { Select } from '../../components/common/Select/Select';
import { AssetForm } from '../../components/portfolio/AssetForm/AssetForm';
import { AssetTable } from '../../components/portfolio/AssetTable/AssetTable';
import { usePortfolios } from '../../hooks/usePortfolios';
import { PortfolioCreateRequest, Asset, PortfolioType } from '../../types/portfolio';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import styles from './PortfolioCreation.module.css';

interface CreationStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const portfolios = usePortfolios();

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PortfolioCreateRequest>({
    name: '',
    description: '',
    type: 'CUSTOM',
    currency: 'USD',
    initialCash: 100000,
    benchmarkSymbol: 'SPY',
    assets: [],
    riskTolerance: 'MODERATE',
    investmentObjective: 'GROWTH',
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);

  // Asset management
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleInputChange = (field: keyof PortfolioCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          newErrors.name = 'Portfolio name is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Portfolio description is required';
        }
        if (formData.initialCash <= 0) {
          newErrors.initialCash = 'Initial cash must be greater than 0';
        }
        break;

      case 1: // Investment Strategy
        // Strategy validation is optional for now
        break;

      case 2: // Assets
        if (formData.assets.length === 0) {
          newErrors.assets = 'At least one asset is required';
        }

        const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
        if (Math.abs(totalWeight - 100) > 0.01) {
          newErrors.assets = 'Total asset weights must equal 100%';
        }
        break;

      case 3: // Review
        // Final validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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

  const handleCancel = () => {
    navigate(ROUTES.HOME);
  };

  // Portfolio type options
  const portfolioTypeOptions = [
    { value: 'CUSTOM', label: 'Custom Portfolio' },
    { value: 'EQUITY', label: 'Equity Focus' },
    { value: 'FIXED_INCOME', label: 'Fixed Income' },
    { value: 'BALANCED', label: 'Balanced Portfolio' },
    { value: 'AGGRESSIVE_GROWTH', label: 'Aggressive Growth' },
    { value: 'CONSERVATIVE', label: 'Conservative' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
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

  // Step 1: Basic Information
  const BasicInformationStep = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Basic Information</h3>
      <p className={styles.stepDescription}>
        Start by providing basic details about your portfolio
      </p>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <Input
            label="Portfolio Name *"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="Enter portfolio name"
            error={errors.name}
          />
        </div>

        <div className={styles.formField}>
          <Select
            label="Portfolio Type"
            value={formData.type}
            onChange={(value) => handleInputChange('type', value as PortfolioType)}
            options={portfolioTypeOptions}
          />
        </div>

        <div className={styles.formFieldFull}>
          <Input
            label="Description *"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Describe your portfolio objectives and strategy"
            multiline
            rows={3}
            error={errors.description}
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Initial Cash *"
            type="number"
            value={formData.initialCash}
            onChange={(value) => handleInputChange('initialCash', Number(value))}
            placeholder="100000"
            min={0}
            step={1000}
            error={errors.initialCash}
          />
        </div>

        <div className={styles.formField}>
          <Select
            label="Base Currency"
            value={formData.currency}
            onChange={(value) => handleInputChange('currency', value)}
            options={currencyOptions}
          />
        </div>

        <div className={styles.formFieldFull}>
          <Input
            label="Benchmark Symbol"
            value={formData.benchmarkSymbol}
            onChange={(value) => handleInputChange('benchmarkSymbol', value)}
            placeholder="SPY"
            help="Symbol for benchmark comparison (e.g., SPY for S&P 500)"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Investment Strategy
  const InvestmentStrategyStep = () => (
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

      <div className={styles.strategyInfo}>
        <Card className={styles.infoCard}>
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
    </div>
  );

  // Step 3: Assets
  const AssetsStep = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Portfolio Assets</h3>
      <p className={styles.stepDescription}>
        Add assets to your portfolio with target allocations
      </p>

      <div className={styles.assetsHeader}>
        <Button
          onClick={() => setShowAssetForm(true)}
          variant="primary"
          disabled={showAssetForm}
        >
          Add Asset
        </Button>
        {formData.assets.length > 0 && (
          <div className={styles.allocationSummary}>
            Total Allocation: {formatPercentage(
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
            Add stocks, bonds, ETFs, or other assets to build your portfolio
          </p>
        </div>
      )}
    </div>
  );

  // Step 4: Review
  const ReviewStep = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Review & Create</h3>
      <p className={styles.stepDescription}>
        Review your portfolio details before creating
      </p>

      <div className={styles.reviewSections}>
        <Card className={styles.reviewCard}>
          <h4>Basic Information</h4>
          <div className={styles.reviewItem}>
            <span>Name:</span>
            <span>{formData.name}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Type:</span>
            <span>{portfolioTypeOptions.find(opt => opt.value === formData.type)?.label}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Description:</span>
            <span>{formData.description}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Initial Cash:</span>
            <span>{formatCurrency(formData.initialCash)} {formData.currency}</span>
          </div>
        </Card>

        <Card className={styles.reviewCard}>
          <h4>Investment Strategy</h4>
          <div className={styles.reviewItem}>
            <span>Risk Tolerance:</span>
            <span>{riskToleranceOptions.find(opt => opt.value === formData.riskTolerance)?.label}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Investment Objective:</span>
            <span>{investmentObjectiveOptions.find(opt => opt.value === formData.investmentObjective)?.label}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Benchmark:</span>
            <span>{formData.benchmarkSymbol}</span>
          </div>
        </Card>

        <Card className={styles.reviewCard}>
          <h4>Assets ({formData.assets.length})</h4>
          {formData.assets.map((asset, index) => (
            <div key={asset.id} className={styles.reviewAsset}>
              <span className={styles.assetSymbol}>{asset.symbol}</span>
              <span className={styles.assetName}>{asset.name}</span>
              <span className={styles.assetWeight}>{formatPercentage(asset.weight / 100)}</span>
            </div>
          ))}
          <div className={styles.totalWeight}>
            Total: {formatPercentage(formData.assets.reduce((sum, asset) => sum + asset.weight, 0) / 100)}
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

  const steps: CreationStep[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Portfolio details',
      component: <BasicInformationStep />,
    },
    {
      id: 'strategy',
      title: 'Strategy',
      description: 'Investment approach',
      component: <InvestmentStrategyStep />,
    },
    {
      id: 'assets',
      title: 'Assets',
      description: 'Portfolio holdings',
      component: <AssetsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Final review',
      component: <ReviewStep />,
    },
  ];

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Portfolio</h1>
          <p className={styles.subtitle}>
            Build a new investment portfolio with our step-by-step wizard
          </p>
        </div>

        {/* Progress indicator */}
        <Card className={styles.progressCard}>
          <div className={styles.progressSteps}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${
                  index === currentStep ? styles.active : ''
                } ${index < currentStep ? styles.completed : ''}`}
              >
                <div className={styles.stepNumber}>
                  {index < currentStep ? '✓' : index + 1}
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
          {steps[currentStep].component}
        </Card>

        {/* Navigation */}
        <div className={styles.navigation}>
          <div className={styles.navLeft}>
            <Button onClick={handleCancel} variant="ghost">
              Cancel
            </Button>
          </div>

          <div className={styles.navRight}>
            {currentStep > 0 && (
              <Button onClick={handlePrevious} variant="secondary">
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
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