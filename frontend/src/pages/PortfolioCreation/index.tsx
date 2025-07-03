/**
 * Portfolio Creation Component - Fixed according to design guidelines
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
import { useAssets } from '../../hooks/useAssets';
import { AssetCreate, PortfolioCreate } from '../../types/portfolio';
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

// Portfolio Templates exactly as in design
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
      { ticker: 'KO', name: 'Coca-Cola', weight: 15, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 10, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 10, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'BAC', name: 'Bank of America', weight: 10, sector: 'Financial', assetClass: 'stocks' },
      { ticker: 'KHC', name: 'Kraft Heinz', weight: 5, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'AMZN', name: 'Amazon', weight: 5, sector: 'Technology', assetClass: 'stocks' }
    ]
  },
  {
    id: 'tech_giants',
    name: 'Tech Giants',
    description: 'High-growth technology companies',
    riskLevel: 'Aggressive',
    expectedReturn: '12-18% annually',
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
    expectedReturn: '8-12% annually',
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
    description: 'Companies with 25+ years of dividend increases',
    riskLevel: 'Conservative',
    expectedReturn: '6-10% annually',
    assets: [
      { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 15, sector: 'Healthcare', assetClass: 'stocks' },
      { ticker: 'PG', name: 'Procter & Gamble', weight: 15, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 12, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'PEP', name: 'PepsiCo', weight: 12, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'WMT', name: 'Walmart', weight: 10, sector: 'Consumer Staples', assetClass: 'stocks' },
      { ticker: 'MCD', name: 'McDonald\'s', weight: 8, sector: 'Consumer Discretionary', assetClass: 'stocks' },
      { ticker: 'HD', name: 'Home Depot', weight: 8, sector: 'Consumer Discretionary', assetClass: 'stocks' },
      { ticker: 'MMM', name: '3M Company', weight: 7, sector: 'Industrial', assetClass: 'stocks' },
      { ticker: 'CVX', name: 'Chevron', weight: 7, sector: 'Energy', assetClass: 'stocks' },
      { ticker: 'CAT', name: 'Caterpillar', weight: 6, sector: 'Industrial', assetClass: 'stocks' }
    ]
  }
];

// Quick Add Asset Modal Component with REAL API
const QuickAddAssetModal: React.FC<{
  onAdd: (asset: AssetFormData) => void;
  onCancel: () => void;
  remainingWeight: number;
  existingTickers: string[];
}> = ({ onAdd, onCancel, remainingWeight, existingTickers }) => {
  const [ticker, setTicker] = useState('');
  const [weight, setWeight] = useState(Math.min(remainingWeight, 15));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // REAL API integration
  const { searchAssets, searchResults, searchLoading, getAssetInfo, searchError } = useAssets();

  const handleTickerChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setTicker(upperValue);
    setSelectedAsset(null);

    if (upperValue.length >= 1) {
      setShowSuggestions(true);
      // REAL API call
      searchAssets(upperValue, 10);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    setTicker(suggestion.ticker);
    setShowSuggestions(false);

    // Get detailed asset info from API
    const assetInfo = await getAssetInfo(suggestion.ticker);
    setSelectedAsset(assetInfo || suggestion);
  };

  const handleAdd = () => {
    // Validation
    if (!ticker.trim()) {
      alert('Please enter a ticker symbol');
      return;
    }

    if (existingTickers.includes(ticker)) {
      alert('This asset is already in your portfolio');
      return;
    }

    if (weight <= 0) {
      alert('Weight must be greater than 0');
      return;
    }

    if (weight > remainingWeight) {
      alert(`Weight cannot exceed remaining weight of ${remainingWeight}%`);
      return;
    }

    const asset: AssetFormData = {
      id: `asset-${Date.now()}`,
      ticker,
      name: selectedAsset?.name || `${ticker} Company`,
      weight,
      sector: selectedAsset?.sector || 'Unknown',
      assetClass: selectedAsset?.assetClass || 'stocks',
      currentPrice: selectedAsset?.currentPrice || selectedAsset?.price
    };
    onAdd(asset);
  };

  return (
    <Modal open={true} onClose={onCancel} title="🚀 Quick Add Asset">
      <div className={styles.quickAddForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Ticker Symbol *</label>
          <div className={styles.tickerInputGroup}>
            <Input
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              placeholder="AAPL"
            />
            {searchLoading && <div className={styles.loading}>🔍</div>}
          </div>

          {/* Search suggestions */}
          {showSuggestions && searchResults.length > 0 && (
            <div className={styles.suggestions}>
              {searchResults.slice(0, 5).map((suggestion) => (
                <div
                  key={suggestion.ticker}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className={styles.suggestionTicker}>{suggestion.ticker}</div>
                  <div className={styles.suggestionName}>{suggestion.name}</div>
                  {suggestion.sector && <div className={styles.suggestionSector}>{suggestion.sector}</div>}
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {showSuggestions && searchResults.length === 0 && ticker.length > 0 && !searchLoading && (
            <div className={styles.noResults}>
              No assets found for "{ticker}"
            </div>
          )}

          {/* Search error */}
          {searchError && (
            <div className={styles.searchError}>
              Search error: {searchError}
            </div>
          )}

          {selectedAsset && (
            <div className={styles.assetInfo}>
              💡 {selectedAsset.name} - ${selectedAsset.currentPrice || selectedAsset.price || 'N/A'} - {selectedAsset.sector}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Weight (%) *</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            max={remainingWeight}
            min={0.1}
            step={0.1}
          />
          <div className={styles.remainingInfo}>
            💡 Remaining: {remainingWeight.toFixed(1)}%
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
          >
            Add Asset ✅
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Portfolio Templates Modal Component - MOVED BEFORE MAIN COMPONENT
const PortfolioTemplatesModal: React.FC<{
  onSelect: (templateId: string) => void;
  onCancel: () => void;
}> = ({ onSelect, onCancel }) => {
  return (
    <Modal open={true} onClose={onCancel} title="📋 Portfolio Templates">
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
              {template.assets.slice(0, 5).map((asset, index) => (
                <span key={index} className={styles.assetTag}>
                  {asset.ticker} {asset.weight}%
                </span>
              ))}
              {template.assets.length > 5 && (
                <span className={styles.assetTag}>
                  +{template.assets.length - 5} more
                </span>
              )}
            </div>
            <Button
              onClick={() => onSelect(template.id)}
              variant="primary"
              className={styles.useTemplateButton}
            >
              Use Template ➡️
            </Button>
          </Card>
        ))}

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary">
            Custom Mix
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// CSV Import Modal - REAL implementation
const CSVImportModal: React.FC<{
  onImport: (assets: AssetFormData[]) => void;
  onCancel: () => void;
}> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setErrors([]);

        // Read file content
        const reader = new FileReader();
        reader.onload = (event) => {
          setCsvText(event.target?.result as string || '');
        };
        reader.readAsText(selectedFile);
      } else {
        setErrors(['Please select a valid CSV file']);
      }
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setErrors(['Please provide CSV data']);
      return;
    }

    setImporting(true);
    setErrors([]);

    try {
      // REAL CSV parsing using import service
      const { importService } = await import('../../services/portfolio/importService');
      const result = importService.parseCSV(csvText, {
        hasHeaders: true,
        validateWeights: true,
        normalizeWeights: true,
      });

      if (result.isValid) {
        const assets: AssetFormData[] = result.assets.map((asset, index) => ({
          id: `csv-${index}`,
          ticker: asset.ticker,
          name: asset.name || asset.ticker,
          weight: asset.weight || 0,
          sector: asset.sector,
          assetClass: asset.assetClass || 'stocks',
          currentPrice: asset.currentPrice
        }));

        onImport(assets);
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('CSV import error:', error);
      setErrors(['Failed to parse CSV file']);
    } finally {
      setImporting(false);
    }
  };

  const sampleCSV = `Ticker,Name,Weight
AAPL,Apple Inc,25
MSFT,Microsoft,20
GOOGL,Alphabet,15`;

  return (
    <Modal open={true} onClose={onCancel} title="📁 Import from CSV">
      <div className={styles.importModal}>
        <div className={styles.formGroup}>
          <label className={styles.label}>CSV Data</label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={sampleCSV}
            rows={8}
            className={styles.textInput}
          />
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport}>
            Import CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Text Import Modal - Simple version
const TextImportModal: React.FC<{
  onImport: (assets: AssetFormData[]) => void;
  onCancel: () => void;
}> = ({ onImport, onCancel }) => {
  const [text, setText] = useState('');

  const handleImport = () => {
    // Simple text parsing
    const lines = text.split('\n').filter(line => line.trim());
    const assets: AssetFormData[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/([A-Z0-9.]+)\s+(\d+(?:\.\d+)?)%?/i);
      if (match) {
        const [, ticker, weight] = match;
        assets.push({
          id: `text-${index}`,
          ticker: ticker.toUpperCase(),
          name: `${ticker} Company`,
          weight: parseFloat(weight),
          sector: 'Unknown',
          assetClass: 'stocks'
        });
      }
    });

    if (assets.length > 0) {
      onImport(assets);
    } else {
      alert('No valid assets found in text');
    }
  };

  return (
    <Modal open={true} onClose={onCancel} title="📝 Import from Text">
      <div className={styles.importModal}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Asset List</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="AAPL 25%&#10;MSFT 20%&#10;GOOGL 15%"
            rows={8}
            className={styles.textInput}
          />
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport}>
            Import Text
          </Button>
        </div>
      </div>
    </Modal>
  );
};

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
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
        // Try different navigation approaches
        try {
          navigate('/portfolios');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback navigation
          window.location.href = '/portfolios';
        }
      } else {
        console.error('Portfolio creation returned null');
        alert('Failed to create portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert(`Failed to create portfolio: ${error.message}`);
    }
  };

  const handleAssetAdd = (asset: AssetFormData) => {
    handleFormChange('assets', [...formData.assets, asset]);
    setShowAssetForm(false);
  };

  const handleAssetDelete = (assetId: string) => {
    handleFormChange('assets', formData.assets.filter(a => a.id !== assetId));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = PORTFOLIO_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templateAssets: AssetFormData[] = template.assets.map((asset, index) => ({
        id: `template-${index}`,
        ticker: asset.ticker,
        name: asset.name,
        weight: asset.weight,
        sector: asset.sector,
        assetClass: asset.assetClass
      }));

      handleFormChange('assets', templateAssets);
      setShowTemplates(false);
    }
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
              <div className={styles.modeIcon}>
                🟢
              </div>
              <h3 className={styles.modeTitle}>Basic Mode</h3>
              <div className={styles.modeFeatures}>
                <div className={styles.feature}>
                  <span>✅</span>
                  <span>Quick setup</span>
                </div>
                <div className={styles.feature}>
                  <span>✅</span>
                  <span>Smart defaults</span>
                </div>
                <div className={styles.feature}>
                  <span>✅</span>
                  <span>Ready templates</span>
                </div>
              </div>
              <Button variant="primary" className={styles.modeButton}>
                Start Basic ➡️
              </Button>
            </Card>

            <Card
              className={classNames(styles.modeCard, styles.advancedMode)}
              onClick={() => handleModeSelect('advanced')}
            >
              <div className={styles.modeIcon}>
                🔵
              </div>
              <h3 className={styles.modeTitle}>Professional Mode</h3>
              <div className={styles.modeFeatures}>
                <div className={styles.feature}>
                  <span>⚙️</span>
                  <span>Full control</span>
                </div>
                <div className={styles.feature}>
                  <span>⚙️</span>
                  <span>All options</span>
                </div>
                <div className={styles.feature}>
                  <span>⚙️</span>
                  <span>Advanced setup</span>
                </div>
              </div>
              <Button variant="primary" className={styles.modeButton}>
                Advanced ➡️
              </Button>
            </Card>
          </div>

          <div className={styles.tip}>
            💡 Tip: Start with Basic Mode, upgrade later if needed
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
              <label className={styles.label}>
                Portfolio Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="My Investment Portfolio"
                error={errors.name}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Description (optional)
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Long-term growth portfolio focused on tech stocks"
                multiline
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Starting Amount *
              </label>
              <Input
                type="number"
                value={formData.startingAmount}
                onChange={(e) => handleFormChange('startingAmount', Number(e.target.value))}
                placeholder="100000"
                error={errors.startingAmount}
              />
            </div>

            {mode === 'advanced' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Portfolio Type
                  </label>
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
                    <label className={styles.label}>
                      Risk Tolerance
                    </label>
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
                    <label className={styles.label}>
                      Investment Objective
                    </label>
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
                  <label className={styles.label}>
                    Rebalancing Frequency
                  </label>
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
                  <label className={styles.label}>
                    Tags (comma separated)
                  </label>
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
            <div className={styles.addAssetsSection}>
              <div className={styles.addMethodTabs}>
                <div className={styles.tabGroup}>
                  <h3>🎯 Quick Add</h3>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setShowAssetForm(true)}
                  >
                    + Add
                  </Button>
                </div>

                <div className={styles.tabGroup}>
                  <h3>📋 Templates</h3>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setShowTemplates(true)}
                  >
                    Use Template
                  </Button>
                </div>

                <div className={styles.tabGroup}>
                  <h3>📁 Import</h3>
                  <div className={styles.importButtons}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowCSVImport(true)}
                    >
                      From CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowTextImport(true)}
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
                      <div></div>
                      <div className={styles.totalWeight}>
                        {totalWeight}%
                      </div>
                      <div className={styles.totalAmount}>
                        ${formData.startingAmount.toLocaleString()}
                      </div>
                      <div></div>
                    </div>
                  </div>

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

        {/* Modal Components */}
        {showAssetForm && (
          <QuickAddAssetModal
            onAdd={handleAssetAdd}
            onCancel={() => setShowAssetForm(false)}
            remainingWeight={remainingWeight}
            existingTickers={getExistingTickers()}
          />
        )}

        {showTemplates && (
          <PortfolioTemplatesModal
            onSelect={handleTemplateSelect}
            onCancel={() => setShowTemplates(false)}
          />
        )}

        {showCSVImport && (
          <CSVImportModal
            onImport={(assets) => {
              handleFormChange('assets', assets);
              setShowCSVImport(false);
            }}
            onCancel={() => setShowCSVImport(false)}
          />
        )}

        {showTextImport && (
          <TextImportModal
            onImport={(assets) => {
              handleFormChange('assets', assets);
              setShowTextImport(false);
            }}
            onCancel={() => setShowTextImport(false)}
          />
        )}
      </div>
    );
  }

  // Advanced Constraints Step
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
            <Button variant="primary" onClick={handleNext}>
              Create Portfolio ✅
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PortfolioCreation;