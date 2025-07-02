/**
 * Enhanced Portfolio Creation Component
 * Implements the new design with Basic/Advanced modes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Tooltip } from '../../components/common/Tooltip';
import { usePortfolios } from '../../hooks/usePortfolios';
import { AssetCreate, PortfolioCreate } from '../../types/portfolio';
import styles from './PortfolioCreation.module.css';

// Types
type CreationMode = 'basic' | 'advanced';
type CreationStep = 'mode' | 'basic_info' | 'assets' | 'advanced_setup' | 'constraints' | 'review';

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
  // Advanced mode fields
  maxPositionSize?: number;
  minPositionSize?: number;
  sectorLimits?: Record<string, number>;
  geographicConstraints?: string[];
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

interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  expectedReturn: string;
  assets: Array<{
    ticker: string;
    name: string;
    weight: number;
    sector: string;
    assetClass: string;
  }>;
}

// Portfolio Templates
const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'warren_buffett',
    name: 'Warren Buffett Style',
    description: 'Value investing approach with focus on large-cap stocks',
    riskLevel: 'Moderate',
    expectedReturn: '10-15% annually',
    assets: [
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 25, sector: 'Financial', assetClass: 'stocks' },
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
    description: 'Technology focused portfolio with FAANG+ stocks',
    riskLevel: 'High',
    expectedReturn: '15-25% annually',
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
    riskLevel: 'Moderate',
    expectedReturn: '12-18% annually',
    assets: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 12, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'MSFT', name: 'Microsoft', weight: 10, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'GOOGL', name: 'Alphabet', weight: 8, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 6, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'TSLA', name: 'Tesla', weight: 4, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'BRK.B', name: 'Berkshire Hathaway', weight: 3, sector: 'Financial', assetClass: 'stocks' },
      { ticker: 'META', name: 'Meta Platforms', weight: 3, sector: 'Technology', assetClass: 'stocks' },
      { ticker: 'UNH', name: 'UnitedHealth', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 3, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'NVDA', name: 'NVIDIA', weight: 3, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'dividend_aristocrats',
    name: 'Dividend Aristocrats',
    description: 'High-quality dividend paying stocks with 25+ years of increases',
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

// Portfolio types for advanced mode
const PORTFOLIO_TYPES = [
  { value: 'conservative', label: 'Conservative Growth' },
  { value: 'moderate', label: 'Moderate Growth' },
  { value: 'aggressive', label: 'Aggressive Growth' },
  { value: 'income', label: 'Income Focused' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'growth', label: 'Pure Growth' }
];

const RISK_TOLERANCE_OPTIONS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' }
];

const INVESTMENT_OBJECTIVES = [
  { value: 'growth', label: 'Growth' },
  { value: 'income', label: 'Income' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'capital_preservation', label: 'Capital Preservation' }
];

const REBALANCING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'never', label: 'Never' }
];

// Mock asset search function (should be replaced with real API)
const searchAssets = async (query: string): Promise<Array<{ticker: string, name: string, price: number, sector: string}>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockAssets = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: 175.23, sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', price: 378.85, sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 153.87, sector: 'Consumer Cyclical' },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: 243.92, sector: 'Consumer Cyclical' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 498.36, sector: 'Technology' },
    { ticker: 'META', name: 'Meta Platforms Inc.', price: 348.15, sector: 'Technology' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', price: 158.47, sector: 'Healthcare' },
    { ticker: 'PG', name: 'Procter & Gamble', price: 154.32, sector: 'Consumer Defensive' },
    { ticker: 'KO', name: 'Coca-Cola Co.', price: 62.18, sector: 'Consumer Defensive' }
  ];

  return mockAssets.filter(asset =>
    asset.ticker.toLowerCase().includes(query.toLowerCase()) ||
    asset.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Mode Selection Component
const ModeSelection: React.FC<{
  onModeSelect: (mode: CreationMode) => void;
}> = ({ onModeSelect }) => {
  return (
    <div className={styles.modeSelection}>
      <div className={styles.modeContainer}>
        <h1 className={styles.title}>Create New Portfolio</h1>
        <p className={styles.subtitle}>Choose your preferred creation method:</p>

        <div className={styles.modeOptions}>
          <Card className={classNames(styles.modeCard, styles.basicMode)}>
            <div className={styles.modeIcon}>
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className={styles.modeTitle}>Basic Mode</h3>
            <ul className={styles.modeFeatures}>
              <li>✅ Quick setup</li>
              <li>✅ Smart defaults</li>
              <li>✅ Ready templates</li>
            </ul>
            <Button
              onClick={() => onModeSelect('basic')}
              className={styles.modeButton}
              variant="primary"
            >
              Start Basic →
            </Button>
          </Card>

          <Card className={classNames(styles.modeCard, styles.advancedMode)}>
            <div className={styles.modeIcon}>
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className={styles.modeTitle}>Advanced Mode</h3>
            <ul className={styles.modeFeatures}>
              <li>⚙️ Full control</li>
              <li>⚙️ All options</li>
              <li>⚙️ Advanced setup</li>
            </ul>
            <Button
              onClick={() => onModeSelect('advanced')}
              className={styles.modeButton}
              variant="primary"
            >
              Advanced →
            </Button>
          </Card>
        </div>

        <div className={styles.tip}>
          💡 Tip: Start with Basic Mode, upgrade later if needed
        </div>
      </div>
    </div>
  );
};

// Basic Info Step Component
const BasicInfoStep: React.FC<{
  formData: PortfolioFormData;
  onChange: (field: keyof PortfolioFormData, value: any) => void;
  errors: Record<string, string>;
  mode: CreationMode;
}> = ({ formData, onChange, errors, mode }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>{mode === 'basic' ? '📋 Step 1: Portfolio Basics' : '⚙️ Professional Portfolio Setup'}</h2>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <Input
            label="Portfolio Name"
            value={formData.name}
            onChange={(value) => onChange('name', value)}
            error={errors.name}
            placeholder={mode === 'basic' ? 'My Investment Portfolio' : 'Tech Growth Portfolio Q4 2025'}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Description"
            value={formData.description}
            onChange={(value) => onChange('description', value)}
            error={errors.description}
            placeholder={mode === 'basic' ? 'Long-term growth portfolio focused on tech stocks' : 'High-growth technology portfolio targeting 15% annual returns'}
            multiline
            rows={3}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <Input
              label="Starting Amount"
              type="number"
              value={formData.startingAmount}
              onChange={(value) => onChange('startingAmount', Number(value))}
              error={errors.startingAmount}
              placeholder="100000"
              prefix="$"
              required
            />
          </div>

          {mode === 'advanced' && (
            <div className={styles.formGroup}>
              <Select
                label="Portfolio Type"
                value={formData.portfolioType || ''}
                onChange={(value) => onChange('portfolioType', value)}
                options={PORTFOLIO_TYPES}
                placeholder="Select type"
              />
            </div>
          )}
        </div>

        {mode === 'advanced' && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Select
                  label="Risk Tolerance"
                  value={formData.riskTolerance || ''}
                  onChange={(value) => onChange('riskTolerance', value)}
                  options={RISK_TOLERANCE_OPTIONS}
                  placeholder="Select risk level"
                />
              </div>

              <div className={styles.formGroup}>
                <Select
                  label="Investment Objective"
                  value={formData.investmentObjective || ''}
                  onChange={(value) => onChange('investmentObjective', value)}
                  options={INVESTMENT_OBJECTIVES}
                  placeholder="Select objective"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Select
                  label="Rebalancing"
                  value={formData.rebalancing || ''}
                  onChange={(value) => onChange('rebalancing', value)}
                  options={REBALANCING_OPTIONS}
                  placeholder="Select frequency"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Tags (comma separated)"
                value={formData.tags?.join(', ') || ''}
                onChange={(value) => onChange('tags', value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="tech, growth, aggressive, high-risk"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Quick Asset Add Component
const QuickAssetAdd: React.FC<{
  onAdd: (asset: AssetFormData) => void;
  onCancel: () => void;
  existingAssets: AssetFormData[];
  startingAmount: number;
}> = ({ onAdd, onCancel, existingAssets, startingAmount }) => {
  const [ticker, setTicker] = useState('');
  const [weight, setWeight] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ticker: string, name: string, price: number, sector: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ticker: string, name: string, price: number, sector: string} | null>(null);

  const remainingWeight = 100 - existingAssets.reduce((sum, asset) => sum + asset.weight, 0);

  const handleTickerChange = async (value: string) => {
    setTicker(value);
    setSelectedAsset(null);

    if (value.length >= 1) {
      setLoading(true);
      try {
        const results = await searchAssets(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Error searching assets:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleAssetSelect = (asset: {ticker: string, name: string, price: number, sector: string}) => {
    setTicker(asset.ticker);
    setSelectedAsset(asset);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (!ticker || !weight) return;

    const weightNum = Number(weight);
    if (weightNum <= 0 || weightNum > remainingWeight) return;

    const asset: AssetFormData = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      name: selectedAsset?.name || `${ticker.toUpperCase()} Asset`,
      weight: weightNum,
      sector: selectedAsset?.sector,
      currentPrice: selectedAsset?.price
    };

    onAdd(asset);
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="🚀 Quick Add Asset">
      <div className={styles.quickAssetForm}>
        <div className={styles.formGroup}>
          <label>Ticker Symbol *</label>
          <div className={styles.assetSearchContainer}>
            <Input
              value={ticker}
              onChange={handleTickerChange}
              placeholder="AAPL"
              className={styles.tickerInput}
            />
            {loading && <div className={styles.searchLoader}>Searching...</div>}
            {suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((asset) => (
                  <div
                    key={asset.ticker}
                    className={styles.suggestion}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <div className={styles.suggestionMain}>
                      <strong>{asset.ticker}</strong> - ${asset.price.toFixed(2)}
                    </div>
                    <div className={styles.suggestionMeta}>
                      {asset.name} • {asset.sector}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedAsset && (
            <div className={styles.selectedAsset}>
              💡 {selectedAsset.name} - ${selectedAsset.price.toFixed(2)}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Weight (%) *</label>
          <Input
            type="number"
            value={weight}
            onChange={setWeight}
            placeholder="15"
            max={remainingWeight}
            min={1}
          />
          <div className={styles.remainingWeight}>
            💡 Remaining: {remainingWeight.toFixed(1)}%
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={!ticker || !weight || Number(weight) <= 0 || Number(weight) > remainingWeight}
          >
            Add Asset ✅
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Portfolio Templates Component
const PortfolioTemplatesModal: React.FC<{
  onSelect: (templateId: string) => void;
  onCancel: () => void;
}> = ({ onSelect, onCancel }) => {
  return (
    <Modal isOpen={true} onClose={onCancel} title="📋 Portfolio Templates" size="large">
      <div className={styles.templatesContainer}>
        {PORTFOLIO_TEMPLATES.map((template) => (
          <Card key={template.id} className={styles.templateCard}>
            <div className={styles.templateHeader}>
              <h3>{template.name}</h3>
              <div className={styles.templateMeta}>
                <Badge variant="secondary">{template.riskLevel}</Badge>
                <span className={styles.expectedReturn}>{template.expectedReturn}</span>
              </div>
            </div>
            <p className={styles.templateDescription}>{template.description}</p>
            <div className={styles.templateAssets}>
              {template.assets.map((asset, index) => (
                <span key={index} className={styles.assetTag}>
                  {asset.ticker} {asset.weight}%
                </span>
              ))}
            </div>
            <Button
              onClick={() => onSelect(template.id)}
              variant="primary"
              className={styles.useTemplateButton}
            >
              Use Template →
            </Button>
          </Card>
        ))}
      </div>
    </Modal>
  );
};

// Assets Step Component
const AssetsStep: React.FC<{
  formData: PortfolioFormData;
  onChange: (field: keyof PortfolioFormData, value: any) => void;
  mode: CreationMode;
}> = ({ formData, onChange, mode }) => {
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleAssetAdd = (asset: AssetFormData) => {
    onChange('assets', [...formData.assets, asset]);
    setShowAssetForm(false);
  };

  const handleAssetDelete = (assetId: string) => {
    onChange('assets', formData.assets.filter(a => a.id !== assetId));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = PORTFOLIO_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templateAssets = template.assets.map((asset, index) => ({
        id: `template_${index}`,
        ticker: asset.ticker,
        name: asset.name,
        weight: asset.weight,
        sector: asset.sector,
        assetClass: asset.assetClass,
        currentPrice: Math.random() * 300 + 50 // Mock price
      }));

      onChange('name', template.name);
      onChange('description', template.description);
      onChange('assets', templateAssets);
      setShowTemplates(false);
    }
  };

  const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
  const remainingWeight = 100 - totalWeight;

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>📊 Step 2: Portfolio Assets</h2>
      </div>

      <div className={styles.addAssetsSection}>
        <div className={styles.addAssetsTabs}>
          <div className={styles.tabGroup}>
            <h3>🎯 Quick Add</h3>
            <Button
              onClick={() => setShowAssetForm(true)}
              variant="primary"
              className={styles.addButton}
            >
              + Add Asset
            </Button>
          </div>

          <div className={styles.tabGroup}>
            <h3>📋 Templates</h3>
            <Button
              onClick={() => setShowTemplates(true)}
              variant="secondary"
              className={styles.templatesButton}
            >
              Use Template
            </Button>
          </div>

          <div className={styles.tabGroup}>
            <h3>📁 Import</h3>
            <div className={styles.importButtons}>
              <Button
                onClick={() => setShowImport(true)}
                variant="secondary"
                size="sm"
              >
                From CSV
              </Button>
              <Button
                onClick={() => setShowImport(true)}
                variant="secondary"
                size="sm"
              >
                From Text
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.currentPortfolio}>
        <h3>📈 Current Portfolio:</h3>

        {formData.assets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No assets added yet. Use the options above to add assets to your portfolio.</p>
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
                  <div className={styles.ticker}>{asset.ticker}</div>
                  <div className={styles.name}>{asset.name}</div>
                  <div className={styles.weight}>{asset.weight}%</div>
                  <div className={styles.amount}>
                    ${((formData.startingAmount * asset.weight) / 100).toLocaleString()}
                  </div>
                  <div className={styles.actions}>
                    <Button
                      onClick={() => handleAssetDelete(asset.id)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              <div className={styles.totalRow}>
                <div></div>
                <div><strong>Total</strong></div>
                <div><strong>{totalWeight}%</strong></div>
                <div><strong>${formData.startingAmount.toLocaleString()}</strong></div>
                <div></div>
              </div>
            </div>

            {Math.abs(totalWeight - 100) > 0.01 && (
              <div className={styles.weightWarning}>
                ⚠️ Total weight is {totalWeight.toFixed(1)}%. It should equal 100%.
              </div>
            )}
          </>
        )}
      </div>

      {showAssetForm && (
        <QuickAssetAdd
          onAdd={handleAssetAdd}
          onCancel={() => setShowAssetForm(false)}
          existingAssets={formData.assets}
          startingAmount={formData.startingAmount}
        />
      )}

      {showTemplates && (
        <PortfolioTemplatesModal
          onSelect={handleTemplateSelect}
          onCancel={() => setShowTemplates(false)}
        />
      )}

      {showImport && (
        <Modal isOpen={true} onClose={() => setShowImport(false)} title="📁 Import Assets">
          <div className={styles.importPlaceholder}>
            <p>Import functionality will be implemented here</p>
            <p>Support for CSV files and text paste</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Advanced Constraints Step Component
const AdvancedConstraintsStep: React.FC<{
  formData: PortfolioFormData;
  onChange: (field: keyof PortfolioFormData, value: any) => void;
}> = ({ formData, onChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>📊 Investment Strategy & Constraints</h2>
      </div>

      <div className={styles.constraintsGrid}>
        <div className={styles.constraintSection}>
          <h3>Position Limits</h3>
          <div className={styles.limitInputs}>
            <Input
              label="Max per asset (%)"
              type="number"
              value={formData.maxPositionSize || 25}
              onChange={(value) => onChange('maxPositionSize', Number(value))}
              placeholder="25"
            />
            <Input
              label="Min per asset (%)"
              type="number"
              value={formData.minPositionSize || 1}
              onChange={(value) => onChange('minPositionSize', Number(value))}
              placeholder="1"
            />
          </div>
        </div>

        <div className={styles.constraintSection}>
          <h3>Sector Allocation Limits</h3>
          <div className={styles.sectorLimits}>
            <div className={styles.sectorGrid}>
              <div>Technology: Max 40%</div>
              <div>Healthcare: Max 20%</div>
              <div>Finance: Max 15%</div>
              <div>Energy: Max 10%</div>
            </div>
          </div>
        </div>

        <div className={styles.constraintSection}>
          <h3>Geographic Constraints</h3>
          <div className={styles.geographicOptions}>
            <label>
              <input type="checkbox" defaultChecked />
              ☑️ US Markets
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              ☑️ European Markets
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              ☑️ Asian Markets
            </label>
            <label>
              <input type="checkbox" />
              ☐ Emerging Markets
            </label>
          </div>
        </div>

        <div className={styles.constraintSection}>
          <h3>Advanced Options</h3>
          <div className={styles.advancedOptions}>
            <label>
              <input
                type="checkbox"
                checked={formData.enableTaxOptimization || false}
                onChange={(e) => onChange('enableTaxOptimization', e.target.checked)}
              />
              ☑️ Enable tax-loss harvesting
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.enableESG || false}
                onChange={(e) => onChange('enableESG', e.target.checked)}
              />
              ☑️ ESG screening (exclude tobacco, weapons)
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.enableCurrencyHedging || false}
                onChange={(e) => onChange('enableCurrencyHedging', e.target.checked)}
              />
              ☐ Currency hedging for international positions
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep: React.FC<{
  formData: PortfolioFormData;
  mode: CreationMode;
}> = ({ formData, mode }) => {
  const totalWeight = formData.assets.reduce((sum, asset) => sum + asset.weight, 0);
  const hasConstraintWarnings = mode === 'advanced' && formData.assets.length > 0;
  const techWeight = formData.assets
    .filter(asset => asset.sector === 'Technology')
    .reduce((sum, asset) => sum + asset.weight, 0);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>📋 Review & Create Portfolio</h2>
      </div>

      <div className={styles.reviewGrid}>
        <Card className={styles.reviewCard}>
          <h3>Portfolio Details</h3>
          <div className={styles.reviewDetails}>
            <div><strong>Name:</strong> {formData.name}</div>
            <div><strong>Description:</strong> {formData.description}</div>
            <div><strong>Starting Amount:</strong> ${formData.startingAmount.toLocaleString()}</div>
            {mode === 'advanced' && (
              <>
                <div><strong>Type:</strong> {formData.portfolioType}</div>
                <div><strong>Risk Tolerance:</strong> {formData.riskTolerance}</div>
                <div><strong>Rebalancing:</strong> {formData.rebalancing}</div>
              </>
            )}
          </div>
        </Card>

        <Card className={styles.reviewCard}>
          <h3>Asset Allocation</h3>
          <div className={styles.assetReview}>
            {formData.assets.map((asset) => (
              <div key={asset.id} className={styles.assetReviewItem}>
                <span>{asset.ticker}</span>
                <span>{asset.weight}%</span>
                <span>${((formData.startingAmount * asset.weight) / 100).toLocaleString()}</span>
              </div>
            ))}
            <div className={styles.totalLine}>
              <span><strong>Total</strong></span>
              <span><strong>{totalWeight}%</strong></span>
              <span><strong>${formData.startingAmount.toLocaleString()}</strong></span>
            </div>
          </div>
        </Card>

        {hasConstraintWarnings && techWeight > 40 && (
          <Card className={styles.warningCard}>
            <h3>⚠️ Constraint Warnings</h3>
            <ul>
              <li>Tech sector exceeds 40% limit (currently {techWeight.toFixed(1)}%)</li>
              <li>Consider adding more diversification</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

// Main Portfolio Creation Component
const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio, loading } = usePortfolios();

  const [mode, setMode] = useState<CreationMode | null>(null);
  const [currentStep, setCurrentStep] = useState<CreationStep>('mode');
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    startingAmount: 100000,
    assets: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PortfolioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    setCurrentStep('basic_info');
  };

  const validateStep = (step: CreationStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic_info':
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

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepFlow = mode === 'basic'
      ? ['mode', 'basic_info', 'assets', 'review']
      : ['mode', 'basic_info', 'constraints', 'assets', 'review'];

    const currentIndex = stepFlow.indexOf(currentStep);
    if (currentIndex < stepFlow.length - 1) {
      setCurrentStep(stepFlow[currentIndex + 1] as CreationStep);
    }
  };

  const handleBack = () => {
    const stepFlow = mode === 'basic'
      ? ['mode', 'basic_info', 'assets', 'review']
      : ['mode', 'basic_info', 'constraints', 'assets', 'review'];

    const currentIndex = stepFlow.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepFlow[currentIndex - 1] as CreationStep);
    }
  };

  const handleCreate = async () => {
    if (!validateStep('assets')) return;

    try {
      const portfolioData: PortfolioCreate = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags || [],
        assets: formData.assets.map(asset => ({
          ticker: asset.ticker,
          name: asset.name,
          weight: asset.weight,
          sector: asset.sector,
          assetClass: asset.assetClass || 'stocks',
          quantity: 0,
          purchasePrice: asset.currentPrice || 0,
          currentPrice: asset.currentPrice || 0,
          purchaseDate: new Date().toISOString().split('T')[0],
          currency: 'USD',
          country: 'United States',
          exchange: 'NASDAQ'
        }))
      };

      await createPortfolio(portfolioData);
      navigate('/portfolios');
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic_info':
        return formData.name.trim() && formData.startingAmount > 0;
      case 'assets':
        return formData.assets.length > 0 &&
               Math.abs(formData.assets.reduce((sum, asset) => sum + asset.weight, 0) - 100) < 0.01;
      default:
        return true;
    }
  };

  return (
    <div className={styles.portfolioCreation}>
      {currentStep === 'mode' && (
        <ModeSelection onModeSelect={handleModeSelect} />
      )}

      {currentStep === 'basic_info' && mode && (
        <BasicInfoStep
          formData={formData}
          onChange={handleInputChange}
          errors={errors}
          mode={mode}
        />
      )}

      {currentStep === 'constraints' && mode === 'advanced' && (
        <AdvancedConstraintsStep
          formData={formData}
          onChange={handleInputChange}
        />
      )}

      {currentStep === 'assets' && mode && (
        <AssetsStep
          formData={formData}
          onChange={handleInputChange}
          mode={mode}
        />
      )}

      {currentStep === 'review' && mode && (
        <ReviewStep
          formData={formData}
          mode={mode}
        />
      )}

      {currentStep !== 'mode' && (
        <div className={styles.stepNavigation}>
          <Button
            onClick={handleBack}
            variant="secondary"
            disabled={loading}
          >
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleCreate}
              variant="primary"
              loading={loading}
              disabled={!canProceed()}
            >
              Create Portfolio ✅
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
              disabled={!canProceed()}
            >
              Next: {currentStep === 'basic_info' ? (mode === 'basic' ? 'Add Assets' : 'Strategy') :
                     currentStep === 'constraints' ? 'Add Assets' :
                     currentStep === 'assets' ? 'Review' : 'Continue'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioCreation;