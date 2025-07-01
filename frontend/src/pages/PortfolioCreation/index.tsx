import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { AssetTable } from '../../components/portfolio/AssetTable';
import { usePortfolios } from '../../hooks/usePortfolios';
import { ROUTES } from '../../constants/routes';
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

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  assets: Asset[];
}

// Portfolio Templates
const PORTFOLIO_TEMPLATES = [
  {
    id: 'warren_buffett',
    name: 'Warren Buffett Style',
    description: 'Value investing approach with focus on quality companies',
    icon: '📈',
    riskLevel: 'Medium',
    expectedReturn: '12-15% annually',
    assets: [
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 25, sector: 'Conglomerate', assetClass: 'stocks' },
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 10, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 10, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'BAC', name: 'Bank of America', weight: 10, sector: 'Financial', assetClass: 'stocks' },
      { ticker: 'KHC', name: 'Kraft Heinz', weight: 5, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 5, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'tech_giants',
    name: 'Tech Giants',
    description: 'Growth portfolio focused on major technology companies',
    icon: '💻',
    riskLevel: 'High',
    expectedReturn: '15-20% annually',
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 25, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 20, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet', weight: 15, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 15, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta Platforms', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'NVDA', name: 'NVIDIA', weight: 5, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'sp500_top10',
    name: 'S&P 500 Top 10',
    description: 'Top 10 companies by market cap in S&P 500',
    icon: '🏆',
    riskLevel: 'Medium',
    expectedReturn: '11-14% annually',
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 12, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet', weight: 8, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 6, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 4, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 3, sector: 'Conglomerate', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta Platforms', weight: 3, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'UNH', name: 'UnitedHealth', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'NVDA', name: 'NVIDIA', weight: 3, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'dividend_aristocrats',
    name: 'Dividend Aristocrats',
    description: 'Companies with 25+ years of consecutive dividend increases',
    icon: '💰',
    riskLevel: 'Low',
    expectedReturn: '8-12% annually',
    assets: [
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 15, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 15, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 12, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'PEP', name: 'PepsiCo', weight: 12, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'WMT', name: 'Walmart', weight: 10, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'MCD', name: 'McDonald\'s', weight: 8, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'HD', name: 'Home Depot', weight: 8, sector: 'Consumer', assetClass: 'stocks' },
      { ticker: 'MMM', name: '3M Company', weight: 7, sector: 'Industrial', assetClass: 'stocks' },
      { ticker: 'CVX', name: 'Chevron', weight: 7, sector: 'Energy', assetClass: 'stocks' },
      { ticker: 'CAT', name: 'Caterpillar', weight: 6, sector: 'Industrial', assetClass: 'stocks' }
    ]
  }
];

const templateToFormData = (template: any, startingAmount: number) => ({
  name: template.name,
  description: template.description,
  startingAmount,
  assets: template.assets.map((asset: any, index: number) => ({
    id: `template_${index}`,
    ticker: asset.ticker,
    name: asset.name,
    weight: asset.weight,
    quantity: Math.floor((startingAmount * asset.weight / 100) / 100), // Simplified calculation
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

// Step configurations
const CREATION_STEPS: CreationStepConfig[] = [
  { id: 'basic', title: 'Basic Info', description: 'Portfolio details' },
  { id: 'assets', title: 'Assets', description: 'Add holdings' },
  { id: 'review', title: 'Review', description: 'Create portfolio' }
];

interface CreationStepConfig {
  id: CreationStep;
  title: string;
  description: string;
}

// Simple Asset Form Component
const SimpleAssetForm: React.FC<{
  onSubmit: (asset: Asset) => void;
  onCancel: () => void;
  existingAssets: Asset[];
  loading?: boolean;
}> = ({ onSubmit, onCancel, existingAssets, loading = false }) => {
  const [ticker, setTicker] = useState('');
  const [weight, setWeight] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const remainingWeight = 100 - existingAssets.reduce((sum, asset) => sum + asset.weight, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required';
    }

    if (weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    if (weight > remainingWeight) {
      newErrors.weight = `Weight cannot exceed ${remainingWeight}%`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(),
      weight,
      quantity: 0,
      purchasePrice: 100,
      currentPrice: 100,
      purchaseDate: new Date().toISOString().split('T')[0],
      sector: 'Technology',
      industry: '',
      assetClass: 'stocks',
      currency: 'USD',
      country: 'United States',
      exchange: 'NASDAQ'
    };

    onSubmit(asset);
    setTicker('');
    setWeight(0);
    setErrors({});
  };

  return (
    <div className={styles.assetFormOverlay}>
      <div className={styles.assetFormModal}>
        <div className={styles.assetFormHeader}>
          <h3>🚀 Quick Add Asset</h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.assetForm}>
          <div className={styles.formGroup}>
            <Input
              label="Ticker Symbol *"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="AAPL"
              error={errors.ticker}
              disabled={loading}
            />
            {ticker && (
              <div className={styles.tickerHint}>
                💡 {ticker.toUpperCase()} - $150.25
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <Input
              label="Weight (%) *"
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="15"
              error={errors.weight}
              disabled={loading}
            />
            <div className={styles.remainingHint}>
              💡 Remaining: {remainingWeight}%
            </div>
          </div>

          <div className={styles.formActions}>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Asset'} ✅
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Portfolio Creation Component
const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio, creating } = usePortfolios();

  // State
  const [mode, setMode] = useState<CreationMode | null>(null);
  const [currentStep, setCurrentStep] = useState<CreationStep>('mode');
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    startingAmount: 100000,
    assets: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Handlers
  const handleInputChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    setCurrentStep('basic');
  };

  const handleAssetAdd = (asset: Asset) => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, asset]
    }));
    setShowAssetForm(false);
  };

  const handleAssetDelete = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== assetId)
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = PORTFOLIO_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templateData = templateToFormData(template, formData.startingAmount);
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
        if (formData.startingAmount <= 0) {
          newErrors.startingAmount = 'Starting amount must be greater than 0';
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
      const portfolioData = {
        name: formData.name,
        description: formData.description,
        type: 'CUSTOM',
        currency: 'USD',
        initialCash: formData.startingAmount,
        assets: formData.assets,
        riskTolerance: 'MODERATE',
        investmentObjective: 'GROWTH',
        tags: []
      };

      const portfolio = await createPortfolio(portfolioData);
      if (portfolio) {
        navigate(ROUTES.PORTFOLIO.LIST);
      } else {
        setErrors({ submit: 'Failed to create portfolio. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setErrors({ submit: 'An error occurred while creating the portfolio.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'mode':
        return (
          <div className={styles.modeSelection}>
            <div className={styles.modeSelectionHeader}>
              <h1>Create New Portfolio</h1>
              <p>Choose your preferred creation method:</p>
            </div>

            <div className={styles.modeCards}>
              <div
                className={`${styles.modeCard} ${styles.easyMode}`}
                onClick={() => handleModeSelect('easy')}
              >
                <div className={styles.modeIcon}>🟢</div>
                <div className={styles.modeContent}>
                  <h3>Easy Mode</h3>
                  <div className={styles.modeFeatures}>
                    <div className={styles.feature}>✅ Quick setup</div>
                    <div className={styles.feature}>✅ Smart defaults</div>
                    <div className={styles.feature}>✅ Ready templates</div>
                  </div>
                  <Button variant="primary" className={styles.modeButton}>
                    Start Easy ➡️
                  </Button>
                </div>
              </div>

              <div
                className={`${styles.modeCard} ${styles.proMode}`}
                onClick={() => handleModeSelect('professional')}
              >
                <div className={styles.modeIcon}>🔵</div>
                <div className={styles.modeContent}>
                  <h3>Professional Mode</h3>
                  <div className={styles.modeFeatures}>
                    <div className={styles.feature}>⚙️ Full control</div>
                    <div className={styles.feature}>⚙️ All options</div>
                    <div className={styles.feature}>⚙️ Advanced setup</div>
                  </div>
                  <Button variant="primary" className={styles.modeButton}>
                    Advanced ➡️
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.modeTip}>
              💡 Tip: Start with Easy Mode, upgrade later if needed
            </div>
          </div>
        );

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
                label="Portfolio Name *"
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
                placeholder="Long-term growth portfolio focused on tech stocks"
                className={styles.fullWidth}
              />

              <Input
                label="Starting Amount *"
                type="number"
                value={formData.startingAmount}
                onChange={(e) => handleInputChange('startingAmount', Number(e.target.value))}
                placeholder="100000"
                error={errors.startingAmount}
                required
              />
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.stepContent}>
            <div className={styles.assetsHeader}>
              <div>
                <h3 className={styles.stepTitle}>📊 Portfolio Assets</h3>
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
                    📋 Use Template
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
              <div className={styles.assetsTable}>
                <div className={styles.tableHeader}>
                  <div>Symbol</div>
                  <div>Name</div>
                  <div>Weight</div>
                  <div>Amount</div>
                  <div>Actions</div>
                </div>
                {formData.assets.map((asset) => (
                  <div key={asset.id} className={styles.tableRow}>
                    <div className={styles.assetSymbol}>{asset.ticker}</div>
                    <div className={styles.assetName}>{asset.name}</div>
                    <div className={styles.assetWeight}>{asset.weight}%</div>
                    <div className={styles.assetAmount}>
                      ${Math.round(formData.startingAmount * asset.weight / 100).toLocaleString()}
                    </div>
                    <div className={styles.assetActions}>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleAssetDelete(asset.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                <div className={styles.tableFooter}>
                  <div></div>
                  <div></div>
                  <div className={styles.totalWeight}>
                    {formData.assets.reduce((sum, asset) => sum + asset.weight, 0)}%
                  </div>
                  <div className={styles.totalAmount}>
                    ${formData.startingAmount.toLocaleString()}
                  </div>
                  <div></div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyAssets}>
                <p>No assets added yet. Add your first asset to get started!</p>
              </div>
            )}
          </div>
        );

      case 'review':
        const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);

        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>📋 Review Portfolio</h3>
            <p className={styles.stepDescription}>
              Review your portfolio details before creating
            </p>

            <div className={styles.reviewSections}>
              <div className={styles.reviewSection}>
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
                  <span>${formData.startingAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h4>Asset Allocation ({formData.assets.length} assets)</h4>
                {formData.assets.map((asset) => (
                  <div key={asset.id} className={styles.reviewItem}>
                    <span>{asset.ticker}</span>
                    <span>{asset.weight}% (${Math.round(formData.startingAmount * asset.weight / 100).toLocaleString()})</span>
                  </div>
                ))}
                <div className={styles.reviewItem}>
                  <span><strong>Total:</strong></span>
                  <span><strong>{totalWeight}%</strong></span>
                </div>
              </div>
            </div>

            {Math.abs(totalWeight - 100) > 0.01 && (
              <div className={styles.warning}>
                ⚠️ Portfolio weights don't add up to 100%. Please adjust your allocations.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="text"
          onClick={() => navigate(ROUTES.PORTFOLIO.LIST)}
          className={styles.backButton}
        >
          ← Back to Portfolios
        </Button>

        <div className={styles.headerContent}>
          <h1>Create Portfolio</h1>
          {mode && <p>{mode === 'easy' ? 'Easy Mode' : 'Professional Mode'}</p>}
        </div>
      </div>

      {currentStep !== 'mode' && (
        <div className={styles.stepIndicator}>
          {CREATION_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.stepItem} ${
                currentStep === step.id ? styles.active : ''
              } ${
                CREATION_STEPS.findIndex(s => s.id === currentStep) > index ? styles.completed : ''
              }`}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepInfo}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className={styles.mainCard}>
        {renderStepContent()}

        {currentStep !== 'mode' && (
          <div className={styles.formActions}>
            <Button variant="outline" onClick={handlePrevious}>
              {currentStep === 'basic' ? 'Previous' : 'Back'}
            </Button>

            {currentStep === 'review' ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isCreating || Math.abs(formData.assets.reduce((sum, asset) => sum + asset.weight, 0) - 100) > 0.01}
              >
                {isCreating ? 'Creating...' : 'Create Portfolio'} ✅
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                Next: {currentStep === 'basic' ? 'Add Assets' : 'Review'}
              </Button>
            )}
          </div>
        )}

        {errors.submit && (
          <div className={styles.error}>
            {errors.submit}
          </div>
        )}
      </Card>

      {/* Asset Form Modal */}
      {showAssetForm && (
        <SimpleAssetForm
          onSubmit={handleAssetAdd}
          onCancel={() => setShowAssetForm(false)}
          existingAssets={formData.assets}
          loading={creating}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className={styles.templatesModal}>
          <Card className={styles.templatesCard}>
            <div className={styles.templatesHeader}>
              <h2>📋 Portfolio Templates</h2>
              <Button
                variant="text"
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
                        <span className={styles.templateRisk}>Risk: {template.riskLevel}</span>
                        <span className={styles.templateReturn}>{template.expectedReturn}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    Use Template ➡️
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PortfolioCreation;