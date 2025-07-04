/**
 * Portfolio Creation Component - Correct implementation
 * File: frontend/src/pages/PortfolioCreation/index.tsx
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { usePortfolios } from '../../hooks/usePortfolios';
import { AssetCreate, PortfolioCreate } from '../../types/portfolio';
import { AssetForm } from '../../components/portfolio/AssetForm/AssetForm';
import styles from './PortfolioCreation.module.css';

// Types
type CreationMode = 'basic' | 'advanced';
type CreationStep = 'mode' | 'basic_info' | 'assets' | 'constraints';

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  portfolioType?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  rebalancing?: string;
  tags?: string[];
  assets: AssetFormData[];
  maxPositionSize?: number;
  minPositionSize?: number;
  enableTaxOptimization?: boolean;
  enableESG?: boolean;
  enableCurrencyHedging?: boolean;
}

interface AssetFormData {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  sector?: string;
  assetClass?: string;
  currentPrice?: number;
}

// MAIN COMPONENT
const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio, loading: isLoading } = usePortfolios();

  const [mode, setMode] = useState<CreationMode | null>(null);
  const [step, setStep] = useState<CreationStep>('mode');
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    startingAmount: 100000,
    assets: []
  });

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    setStep('basic_info');
  };

  const handleFormChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    }

    if (!formData.startingAmount || formData.startingAmount <= 0) {
      newErrors.startingAmount = 'Starting amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'basic_info' && !validateBasicInfo()) {
      return;
    }

    if (step === 'basic_info') {
      setStep('assets');
    } else if (step === 'assets') {
      if (mode === 'advanced') {
        setStep('constraints');
      } else {
        handleCreatePortfolio();
      }
    } else if (step === 'constraints') {
      handleCreatePortfolio();
    }
  };

  const handleBack = () => {
    if (step === 'basic_info') {
      setStep('mode');
      setMode(null);
    } else if (step === 'assets') {
      setStep('basic_info');
    } else if (step === 'constraints') {
      setStep('assets');
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      const portfolioData: PortfolioCreate = {
        name: formData.name,
        description: formData.description,
        assets: formData.assets.map(asset => ({
          ticker: asset.ticker,
          name: asset.name,
          weight: asset.weight / 100 // Convert percentage to decimal
        })) as AssetCreate[]
      };

      console.log('Creating portfolio:', portfolioData);
      const newPortfolio = await createPortfolio(portfolioData);

      if (newPortfolio) {
        console.log('Portfolio created successfully:', newPortfolio);
        navigate('/portfolios');
      } else {
        console.error('Portfolio creation returned null');
        alert('Failed to create portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert(`Failed to create portfolio: ${error.message}`);
    }
  };

  // ✅ UNIFIED: Single handler for asset operations
  const handleAssetAdd = (asset: AssetCreate) => {
    const newAsset: AssetFormData = {
      id: crypto.randomUUID(),
      ticker: asset.ticker,
      name: asset.name || `${asset.ticker} Asset`,
      weight: asset.weight || 0,
      sector: asset.sector || 'Unknown',
      assetClass: asset.assetClass || 'stocks',
      currentPrice: asset.currentPrice || 0
    };

    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, newAsset]
    }));

    setShowAssetForm(false);
  };

  const handleAssetDelete = (assetId: string) => {
    handleFormChange('assets', formData.assets.filter(a => a.id !== assetId));
  };

  const getExistingTickers = (): string[] => {
    return formData.assets.map(asset => asset.ticker.toUpperCase());
  };

  // Mode Selection Step
  if (step === 'mode') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create New Portfolio</h1>
            <p className={styles.subtitle}>Choose your preferred creation method:</p>
          </div>

          <div className={styles.modeSelection}>
            <Card
              className={classNames(styles.modeCard, styles.basicMode)}
              onClick={() => handleModeSelect('basic')}
            >
              <div className={styles.modeIcon}>🟢</div>
              <h3 className={styles.modeTitle}>Easy Mode</h3>
              <div className={styles.modeFeatures}>
                <div className={styles.feature}>
                  <span>✅</span><span>Quick setup</span>
                </div>
                <div className={styles.feature}>
                  <span>✅</span><span>Smart defaults</span>
                </div>
                <div className={styles.feature}>
                  <span>✅</span><span>Ready templates</span>
                </div>
              </div>
              <Button variant="primary" className={styles.modeButton}>
                Start Easy ➡️
              </Button>
            </Card>

            <Card
              className={classNames(styles.modeCard, styles.advancedMode)}
              onClick={() => handleModeSelect('advanced')}
            >
              <div className={styles.modeIcon}>🔵</div>
              <h3 className={styles.modeTitle}>Professional Mode</h3>
              <div className={styles.modeFeatures}>
                <div className={styles.feature}>
                  <span>⚙️</span><span>Full control</span>
                </div>
                <div className={styles.feature}>
                  <span>⚙️</span><span>All options</span>
                </div>
                <div className={styles.feature}>
                  <span>⚙️</span><span>Advanced setup</span>
                </div>
              </div>
              <Button variant="primary" className={styles.modeButton}>
                Advanced ➡️
              </Button>
            </Card>
          </div>

          <div className={styles.tip}>
            💡 Tip: Start with Easy Mode, upgrade later if needed
          </div>
        </div>
      </div>
    );
  }

  // Basic Info Step
  if (step === 'basic_info') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>
              📋 Step 1: Portfolio Basics
            </h2>
          </div>

          <Card className={styles.formCard}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Portfolio Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="My Investment Portfolio"
                error={errors.name}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description (optional)</label>
              <Input
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Long-term growth portfolio focused on tech stocks"
                multiline
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Starting Amount *</label>
              <Input
                type="number"
                value={formData.startingAmount}
                onChange={(e) => handleFormChange('startingAmount', Number(e.target.value))}
                placeholder="100000"
                error={errors.startingAmount}
              />
            </div>

            {/* ✅ Professional Mode: Additional fields */}
            {mode === 'advanced' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Portfolio Type</label>
                  <Select
                    value={formData.portfolioType || ''}
                    onChange={(value) => handleFormChange('portfolioType', value)}
                    options={[
                      { value: 'aggressive_growth', label: 'Aggressive Growth' },
                      { value: 'growth', label: 'Growth' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'conservative', label: 'Conservative' },
                      { value: 'income', label: 'Income' }
                    ]}
                    placeholder="Select portfolio type"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Risk Tolerance</label>
                    <Select
                      value={formData.riskTolerance || ''}
                      onChange={(value) => handleFormChange('riskTolerance', value)}
                      options={[
                        { value: 'conservative', label: 'Conservative' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'aggressive', label: 'Aggressive' }
                      ]}
                      placeholder="Select risk tolerance"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Investment Objective</label>
                    <Select
                      value={formData.investmentObjective || ''}
                      onChange={(value) => handleFormChange('investmentObjective', value)}
                      options={[
                        { value: 'growth', label: 'Growth' },
                        { value: 'income', label: 'Income' },
                        { value: 'preservation', label: 'Capital Preservation' },
                        { value: 'speculation', label: 'Speculation' }
                      ]}
                      placeholder="Select objective"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Rebalancing Frequency</label>
                  <Select
                    value={formData.rebalancing || ''}
                    onChange={(value) => handleFormChange('rebalancing', value)}
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'quarterly', label: 'Quarterly' },
                      { value: 'semi_annual', label: 'Semi-Annual' },
                      { value: 'annual', label: 'Annual' },
                      { value: 'manual', label: 'Manual' }
                    ]}
                    placeholder="Select rebalancing frequency"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tags (comma separated)</label>
                  <Input
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => handleFormChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    placeholder="tech, growth, aggressive, high-risk"
                  />
                </div>
              </>
            )}
          </Card>

          <div className={styles.stepActions}>
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Next: Add Assets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Assets Step
  if (step === 'assets') {
    const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
    const remainingWeight = 100 - totalWeight;

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>
              📊 Step 2: Portfolio Assets
            </h2>
          </div>

          <Card className={styles.assetsCard}>
            {/* ✅ UNIFIED: Single Add Assets button instead of separate modals */}
            <div className={styles.addAssetsSection}>
              <Button
                variant="primary"
                onClick={() => setShowAssetForm(true)}
                className={styles.addAssetsButton}
                disabled={remainingWeight <= 0}
              >
                {remainingWeight <= 0 ? '📊 Portfolio Complete (100%)' : '📊 Add Assets'}
              </Button>
              {remainingWeight > 0 && (
                <p className={styles.addAssetsHint}>
                  Add assets using manual entry, templates, or import. Remaining: {remainingWeight.toFixed(1)}%
                </p>
              )}
            </div>

            {/* Current Portfolio Display */}
            <div className={styles.currentPortfolio}>
              <h3>📈 Current Portfolio:</h3>

              {formData.assets.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <h4>No assets added yet</h4>
                  <p>Click "Add Assets" to start building your portfolio with templates, import, or manual entry.</p>
                </div>
              ) : (
                <>
                  <div className={styles.portfolioTable}>
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
                          ${((asset.weight / 100) * formData.startingAmount).toLocaleString()}
                        </div>
                        <div className={styles.assetActions}>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleAssetDelete(asset.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className={classNames(styles.tableRow, styles.totalRow)}>
                      <div></div>
                      <div><strong>Total</strong></div>
                      <div className={styles.totalWeight}>
                        <strong>{totalWeight}%</strong>
                      </div>
                      <div className={styles.totalAmount}>
                        <strong>${formData.startingAmount.toLocaleString()}</strong>
                      </div>
                      <div></div>
                    </div>
                  </div>

                  {/* Weight Status */}
                  {totalWeight !== 100 && (
                    <div className={classNames(styles.weightWarning, {
                      [styles.overWeight]: totalWeight > 100,
                      [styles.underWeight]: totalWeight < 100
                    })}>
                      {totalWeight > 100
                        ? `⚠️ Portfolio is over-weighted by ${totalWeight - 100}%`
                        : `💡 Remaining weight to allocate: ${remainingWeight}%`
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          <div className={styles.stepActions}>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={formData.assets.length === 0 || totalWeight !== 100 || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Creating...' : (mode === 'basic' ? 'Create Portfolio ✅' : 'Next: Strategy')}
            </Button>
          </div>
        </div>

        {/* ✅ UNIFIED: Single AssetForm with tabs instead of multiple modals */}
        {showAssetForm && (
          <Modal
            open={true}
            onClose={() => setShowAssetForm(false)}
            title="Add Assets"
            size="large"
          >
            <AssetForm
              mode={mode === 'basic' ? 'easy' : 'professional'}
              onSubmit={handleAssetAdd}
              onCancel={() => setShowAssetForm(false)}
              remainingWeight={remainingWeight}
              existingTickers={getExistingTickers()}
              showTemplates={true}
              showImport={true}
              loading={isLoading}
            />
          </Modal>
        )}
      </div>
    );
  }

  // Advanced Constraints Step (только для Professional режима)
  if (step === 'constraints' && mode === 'advanced') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>
              📊 Investment Strategy & Constraints
            </h2>
          </div>

          <Card className={styles.constraintsCard}>
            <div className={styles.constraintsSection}>
              <h3>Position Limits</h3>
              <div className={styles.limitsRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Max per asset:</label>
                  <Input
                    type="number"
                    value={formData.maxPositionSize || 25}
                    onChange={(e) => handleFormChange('maxPositionSize', Number(e.target.value))}
                    placeholder="25"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Min per asset:</label>
                  <Input
                    type="number"
                    value={formData.minPositionSize || 1}
                    onChange={(e) => handleFormChange('minPositionSize', Number(e.target.value))}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            <div className={styles.constraintsSection}>
              <h3>Sector Allocation Limits</h3>
              <div className={styles.limitsGrid}>
                <div className={styles.limitItem}>
                  <label>Technology: Max 40%</label>
                </div>
                <div className={styles.limitItem}>
                  <label>Healthcare: Max 20%</label>
                </div>
                <div className={styles.limitItem}>
                  <label>Finance: Max 15%</label>
                </div>
                <div className={styles.limitItem}>
                  <label>Energy: Max 10%</label>
                </div>
              </div>
            </div>

            <div className={styles.constraintsSection}>
              <h3>Geographic Constraints</h3>
              <div className={styles.checkboxGrid}>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" defaultChecked />
                  <span>☑️ US Markets</span>
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" defaultChecked />
                  <span>☑️ European Markets</span>
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" defaultChecked />
                  <span>☑️ Asian Markets</span>
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" />
                  <span>☐ Emerging Markets</span>
                </label>
              </div>
            </div>

            <div className={styles.constraintsSection}>
              <h3>Advanced Options</h3>
              <div className={styles.checkboxGrid}>
                <label className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.enableTaxOptimization || false}
                    onChange={(e) => handleFormChange('enableTaxOptimization', e.target.checked)}
                  />
                  <span>☑️ Enable tax-loss harvesting</span>
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.enableESG || false}
                    onChange={(e) => handleFormChange('enableESG', e.target.checked)}
                  />
                  <span>☑️ ESG screening (exclude tobacco, weapons)</span>
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.enableCurrencyHedging || false}
                    onChange={(e) => handleFormChange('enableCurrencyHedging', e.target.checked)}
                  />
                  <span>☐ Currency hedging for international positions</span>
                </label>
              </div>
            </div>
          </Card>

          <div className={styles.stepActions}>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} loading={isLoading}>
              {isLoading ? 'Creating...' : 'Create Portfolio ✅'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PortfolioCreation;