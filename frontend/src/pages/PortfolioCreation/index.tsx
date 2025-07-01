/**
 * Portfolio Creation Page
 * Multi-step wizard with Easy and Professional modes
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer/PageContainer';
import Card from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Select } from '../../components/common/Select/Select';
import { AssetForm } from '../../components/portfolio/AssetForm/AssetForm';
import { AssetTable } from '../../components/portfolio/AssetTable/AssetTable';
import PortfolioModeSelector from './PortfolioModeSelector';
import { usePortfolios } from '../../hooks/usePortfolios';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
// Built-in templates to avoid import issues
const PORTFOLIO_TEMPLATES = [
  {
    id: 'warren_buffett',
    name: 'Warren Buffett Style',
    description: 'Value investing approach with quality companies',
    icon: '🎯',
    riskLevel: 'medium',
    expectedReturn: '8-12% annually',
    assets: [
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 25, sector: 'Financial', assetClass: 'stocks' },
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 15, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'BAC', name: 'Bank of America', weight: 10, sector: 'Financial', assetClass: 'stocks' }
    ]
  },
  {
    id: 'tech_giants',
    name: 'Tech Giants',
    description: 'Growth portfolio with leading tech companies',
    icon: '🚀',
    riskLevel: 'high',
    expectedReturn: '12-18% annually',
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 25, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 15, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta', weight: 10, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'balanced_global',
    name: 'Balanced Global',
    description: 'Diversified mix of stocks and bonds',
    icon: '🌍',
    riskLevel: 'medium',
    expectedReturn: '7-11% annually',
    assets: [
      { ticker: 'VTI', name: 'Total Stock Market', weight: 40, sector: 'Diversified', assetClass: 'etf' },
      { ticker: 'VXUS', name: 'International Stocks', weight: 20, sector: 'Diversified', assetClass: 'etf' },
      { ticker: 'BND', name: 'Total Bond Market', weight: 30, sector: 'Fixed Income', assetClass: 'bonds' },
      { ticker: 'VNQ', name: 'Real Estate', weight: 10, sector: 'Real Estate', assetClass: 'etf' }
    ]
  },
  {
    id: 'dividend_focus',
    name: 'Dividend Focus',
    description: 'Income-generating dividend stocks',
    icon: '💰',
    riskLevel: 'low',
    expectedReturn: '6-10% annually',
    assets: [
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 20, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 20, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'PEP', name: 'PepsiCo', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'WMT', name: 'Walmart', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'HD', name: 'Home Depot', weight: 15, sector: 'Consumer', assetClass: 'stocks' }
    ]
  },
  {
    id: 'sp500_simple',
    name: 'S&P 500 Simple',
    description: 'Simple S&P 500 index fund approach',
    icon: '📊',
    riskLevel: 'medium',
    expectedReturn: '10-14% annually',
    assets: [
      { ticker: 'SPY', name: 'SPDR S&P 500 ETF', weight: 70, sector: 'Diversified', assetClass: 'etf' },
      { ticker: 'QQQ', name: 'Invesco QQQ', weight: 20, sector: 'Technology', assetClass: 'etf' },
      { ticker: 'BND', name: 'Vanguard Bond ETF', weight: 10, sector: 'Fixed Income', assetClass: 'bonds' }
    ]
  }
];

const templateToFormData = (template: any) => ({
  name: template.name,
  description: template.description,
  assets: template.assets.map((asset: any, index: number) => ({
    id: `template_${index}`,
    ticker: asset.ticker,
    name: asset.name,
    weight: asset.weight,
    quantity: 0,
    purchasePrice: 100,
    currentPrice: 100,
    purchaseDate: new Date().toISOString().split('T')[0],
    sector: asset.sector,
    industry: '',
    assetClass: asset.assetClass,
    currency: 'USD',
    country: 'United States',
    exchange: 'NASDAQ'
  }))
});
import styles from './PortfolioCreation.module.css';

type CreationMode = 'easy' | 'professional';
type CreationStep = 'mode' | 'basic' | 'assets' | 'review';

interface Asset {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  sector: string;
  industry: string;
  assetClass: string;
  currency: string;
  country: string;
  exchange: string;
}

interface PortfolioCreateRequest {
  name: string;
  description: string;
  assets: Asset[];
}

interface CreationStepConfig {
  id: CreationStep;
  title: string;
  description: string;
}

// Simple Asset Form for Easy Mode
const SimpleAssetForm: React.FC<{
  onSubmit: (asset: Asset) => void;
  onCancel: () => void;
  existingAssets: Asset[];
}> = ({ onSubmit, onCancel, existingAssets }) => {
  const [ticker, setTicker] = useState('');
  const [weight, setWeight] = useState(0);
  const [loading, setLoading] = useState(false);

  const remainingWeight = 100 - existingAssets.reduce((sum, asset) => sum + asset.weight, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || weight <= 0) return;

    setLoading(true);

    // Create simplified asset
    const asset: Asset = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(), // Simplified - in real app would fetch from API
      weight,
      quantity: 0,
      purchasePrice: 100, // Default
      currentPrice: 100, // Default
      purchaseDate: new Date().toISOString().split('T')[0],
      sector: 'Technology', // Default
      industry: '',
      assetClass: 'stocks',
      currency: 'USD',
      country: 'United States',
      exchange: 'NASDAQ'
    };

    setTimeout(() => {
      onSubmit(asset);
      setLoading(false);
    }, 500);
  };

  return (
    <div className={styles.simpleAssetForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <Input
            label="Ticker Symbol"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="AAPL"
            required
          />

          <Input
            label="Weight (%)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            placeholder="10"
            max={remainingWeight}
            required
          />
        </div>

        <div className={styles.remainingWeight}>
          Remaining: {remainingWeight.toFixed(1)}%
        </div>

        <div className={styles.quickWeights}>
          {[5, 10, 15, 20, 25].map(w => (
            <Button
              key={w}
              type="button"
              variant="outline"
              size="small"
              onClick={() => setWeight(Math.min(w, remainingWeight))}
              disabled={w > remainingWeight}
            >
              {w}%
            </Button>
          ))}
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Add Asset
          </Button>
        </div>
      </form>
    </div>
  );
};

const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPortfolio } = usePortfolios();

  // Get mode from URL params
  const initialMode = searchParams.get('mode') as CreationMode || null;

  // State management
  const [mode, setMode] = useState<CreationMode | null>(initialMode);
  const [currentStep, setCurrentStep] = useState<CreationStep>(initialMode ? 'basic' : 'mode');
  const [showTemplates, setShowTemplates] = useState(false);

  const [formData, setFormData] = useState<PortfolioCreateRequest>({
    name: '',
    description: '',
    assets: []
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
  const handleTemplateSelect = (templateId: string) => {
    const template = PORTFOLIO_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templateData = templateToFormData(template, 100000);
      setFormData(prev => ({
        ...prev,
        name: templateData.name,
        description: templateData.description,
        assets: templateData.assets
      }));
      setShowTemplates(false);
      setCurrentStep('review');
    }
  };

  // Validation
  const validateStep = (step: CreationStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = 'Portfolio name is required';
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: CreationStep[] = ['basic', 'assets', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const stepOrder: CreationStep[] = ['basic', 'assets', 'review'];
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
      console.log('Creating portfolio with data:', formData);

      // Transform data for createPortfolio
      const portfolioData = {
        name: formData.name,
        description: formData.description,
        type: 'CUSTOM',
        currency: 'USD',
        initialCash: 100000,
        assets: formData.assets,
        riskTolerance: 'MODERATE',
        investmentObjective: 'GROWTH',
        tags: []
      };

      const portfolio = await createPortfolio(portfolioData);
      if (portfolio) {
        console.log('Portfolio created successfully:', portfolio);
        navigate(ROUTES.PORTFOLIO.LIST);
      } else {
        setErrors({ submit: 'Failed to create portfolio. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      setErrors({ submit: 'Failed to create portfolio. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Render mode selector
  if (currentStep === 'mode') {
    return <PortfolioModeSelector onModeSelect={handleModeSelect} />;
  }

  // Render templates modal
  if (showTemplates) {
    return (
      <PageContainer>
        <div className={styles.templatesModal}>
          <Card className={styles.templatesCard}>
            <div className={styles.templatesHeader}>
              <h2>Choose a Portfolio Template</h2>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowTemplates(false)}
              >
                ✕
              </Button>
            </div>

            <div className={styles.templatesList}>
              {PORTFOLIO_TEMPLATES.map((template) => (
                <div key={template.id} className={styles.templateItem}>
                  <div className={styles.templateInfo}>
                    <div className={styles.templateIcon}>{template.icon}</div>
                    <div>
                      <h3>{template.name}</h3>
                      <p>{template.description}</p>
                      <div className={styles.templateMeta}>
                        <span className={styles.templateRisk}>
                          {template.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className={styles.templateReturn}>
                          {template.expectedReturn}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Get step configuration
  const getStepConfig = (): CreationStepConfig[] => {
    return [
      { id: 'basic', title: 'Basic Info', description: 'Portfolio details' },
      { id: 'assets', title: 'Assets', description: 'Add holdings' },
      { id: 'review', title: 'Review', description: 'Create portfolio' }
    ];
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
              {mode === 'easy' ? '⚡ Easy Setup' : '⚙️ Professional Setup'}
            </h3>
            <p className={styles.stepDescription}>
              {mode === 'easy'
                ? 'Enter basic information for your portfolio. We\'ll handle the complexity!'
                : 'Configure detailed portfolio settings and investment strategy.'
              }
            </p>

            <div className={styles.formGrid}>
              <Input
                label="Portfolio Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Investment Portfolio"
                error={errors.name}
                required
              />

              <Input
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Long-term growth portfolio focused on..."
                className={styles.fullWidth}
              />
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.stepContent}>
            <div className={styles.assetsHeader}>
              <div>
                <h3 className={styles.stepTitle}>Portfolio Assets</h3>
                <p className={styles.stepDescription}>
                  Add assets to your portfolio with target allocations
                </p>
              </div>

              <div className={styles.assetActions}>
                {mode === 'easy' && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowTemplates(true)}
                  >
                    📊 Use Template
                  </Button>
                )}

                <Button
                  variant="primary"
                  onClick={() => setShowAssetForm(true)}
                >
                  ➕ Add Asset
                </Button>
              </div>
            </div>

            {errors.assets && (
              <div className={styles.error}>
                {errors.assets}
              </div>
            )}

            {formData.assets.length > 0 ? (
              <>
                <AssetTable
                  assets={formData.assets}
                  onEdit={handleAssetEdit}
                  onDelete={handleAssetDelete}
                  showActions
                />

                <div className={styles.allocationSummary}>
                  <span>Total Allocation: </span>
                  <span className={styles.totalWeight}>
                    {formatPercentage(formData.assets.reduce((sum, asset) => sum + asset.weight, 0) / 100)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyAssets}>
                <div className={styles.emptyIcon}>📊</div>
                <h4>No assets added yet</h4>
                <p>Start building your portfolio by adding assets or using a template</p>

                {mode === 'easy' && (
                  <div className={styles.quickActions}>
                    <Button
                      variant="primary"
                      onClick={() => setShowTemplates(true)}
                    >
                      🚀 Quick Start with Template
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowAssetForm(true)}
                    >
                      ➕ Add Asset Manually
                    </Button>
                  </div>
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
              Review your portfolio configuration and create your portfolio
            </p>

            <div className={styles.reviewSummary}>
              <Card className={styles.summaryCard}>
                <h4>Portfolio Summary</h4>
                <div className={styles.summaryItem}>
                  <span>Name:</span>
                  <span>{formData.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Description:</span>
                  <span>{formData.description || 'No description'}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Assets:</span>
                  <span>{formData.assets.length} assets</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Total Allocation:</span>
                  <span>{formatPercentage(formData.assets.reduce((sum, asset) => sum + asset.weight, 0) / 100)}</span>
                </div>
              </Card>

              {formData.assets.length > 0 && (
                <Card className={styles.assetsCard}>
                  <h4>Asset Allocation</h4>
                  <div className={styles.assetsList}>
                    {formData.assets.map((asset) => (
                      <div key={asset.id} className={styles.assetItem}>
                        <div className={styles.assetInfo}>
                          <span className={styles.assetTicker}>{asset.ticker}</span>
                          <span className={styles.assetName}>{asset.name}</span>
                        </div>
                        <span className={styles.assetWeight}>
                          {formatPercentage(asset.weight / 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
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
          <div className={styles.headerContent}>
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate(ROUTES.PORTFOLIO.LIST)}
            >
              ← Back to Portfolios
            </Button>

            <div className={styles.headerTitle}>
              <h1>Create Portfolio</h1>
              <p>{mode === 'easy' ? 'Easy Mode' : 'Professional Mode'}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.stepItem} ${
                  index === currentStepIndex ? styles.active :
                  index < currentStepIndex ? styles.completed : ''
                }`}
              >
                <div className={styles.stepNumber}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepDescription}>{step.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card className={styles.mainCard}>
          {renderStepContent()}

          {/* Navigation */}
          <div className={styles.navigation}>
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={isCreating}
            >
              Previous
            </Button>

            <div className={styles.navigationRight}>
              {currentStep === 'review' ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={isCreating}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Portfolio'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isCreating}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Asset Form Modal */}
        {showAssetForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingAsset ? 'Edit Asset' : 'Add Asset'}</h3>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              {mode === 'easy' ? (
                <SimpleAssetForm
                  onSubmit={editingAsset ? handleAssetUpdate : handleAssetAdd}
                  onCancel={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                  existingAssets={formData.assets}
                />
              ) : (
                <AssetForm
                  asset={editingAsset}
                  onSubmit={editingAsset ? handleAssetUpdate : handleAssetAdd}
                  onCancel={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                  existingTickers={formData.assets.map(a => a.ticker)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default PortfolioCreation;