/**
 * AssetImport Component - FIXED
 * Import assets from CSV file or text paste with proper method selection
 */
import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Modal } from '../../common/Modal/Modal';
import { Badge } from '../../common/Badge/Badge';
import { AssetCreate } from '../../../types/portfolio';
import styles from './AssetImport.module.css';

interface AssetImportProps {
  onImport: (assets: AssetCreate[]) => void;
  onCancel?: () => void;
  existingTickers?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface ParsedAsset {
  ticker: string;
  weight?: number;
  name?: string;
  sector?: string;
  assetClass?: string;
  isValid: boolean;
  errors: string[];
}

export const AssetImport: React.FC<AssetImportProps> = ({
  onImport,
  onCancel,
  existingTickers = [],
  isOpen = true,
  onClose,
  className
}) => {
  const [importText, setImportText] = useState('');
  const [parsedAssets, setParsedAssets] = useState<ParsedAsset[]>([]);
  const [importMethod, setImportMethod] = useState<'csv' | 'text'>('text');
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV parsing function
  const parseCSV = (csvText: string): ParsedAsset[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    // Try to detect headers
    const firstLine = lines[0].toLowerCase();
    const hasHeaders = firstLine.includes('ticker') || firstLine.includes('symbol') || firstLine.includes('weight');

    const dataLines = hasHeaders ? lines.slice(1) : lines;
    const parsed: ParsedAsset[] = [];

    dataLines.forEach((line, index) => {
      const cells = line.split(',').map(cell => cell.trim().replace(/['"]/g, ''));

      if (cells.length < 1 || !cells[0]) return;

      const asset: ParsedAsset = {
        ticker: cells[0].toUpperCase(),
        weight: cells[1] ? parseFloat(cells[1]) : undefined,
        name: cells[2] || undefined,
        sector: cells[3] || undefined,
        assetClass: cells[4] || 'stocks',
        isValid: true,
        errors: []
      };

      // Validation
      if (!asset.ticker || asset.ticker.length < 1) {
        asset.isValid = false;
        asset.errors.push('Invalid ticker');
      }

      if (existingTickers.includes(asset.ticker)) {
        asset.isValid = false;
        asset.errors.push('Already in portfolio');
      }

      if (asset.weight !== undefined && (asset.weight <= 0 || asset.weight > 100)) {
        asset.isValid = false;
        asset.errors.push('Invalid weight (must be 1-100%)');
      }

      parsed.push(asset);
    });

    return parsed;
  };

  // ✅ FIXED: Text parsing function to support single line with multiple assets
  const parseText = (text: string): ParsedAsset[] => {
    const parsed: ParsedAsset[] = [];

    // Support both line format and single line format
    let items: string[] = [];

    // Check if it's a single line with multiple assets
    if (text.includes('\n')) {
      // Multi-line format: each asset on separate line
      items = text.trim().split('\n').filter(line => line.trim());
    } else {
      // Single line format: split by ticker pattern
      // Match patterns like "MSFT 20%" or "GOOGL 15%"
      const matches = text.match(/([A-Z0-9.]+\s+\d+(?:\.\d+)?%?)/g);
      if (matches && matches.length > 1) {
        items = matches;
      } else {
        // Fallback: treat as single item
        items = [text.trim()];
      }
    }

    items.forEach(item => {
      item = item.trim();
      if (!item) return;

      let ticker = '';
      let weight: number | undefined;

      // Try different formats:
      // 1. "AAPL 25%" or "AAPL 25"
      // 2. "AAPL: 25%"
      // 3. "AAPL - 25%"
      // 4. Just "AAPL"

      // Format: AAPL 25% or AAPL: 25%
      const match1 = item.match(/^([A-Z0-9.]+)[\s:-]+(\d+(?:\.\d+)?)%?/i);
      if (match1) {
        ticker = match1[1].toUpperCase();
        weight = parseFloat(match1[2]);
      } else {
        // Just ticker
        const match2 = item.match(/^([A-Z0-9.]+)/i);
        if (match2) {
          ticker = match2[1].toUpperCase();
        }
      }

      if (!ticker) return;

      const asset: ParsedAsset = {
        ticker,
        weight,
        assetClass: 'stocks',
        isValid: true,
        errors: []
      };

      // Validation
      if (existingTickers.includes(ticker)) {
        asset.isValid = false;
        asset.errors.push('Already in portfolio');
      }

      if (weight !== undefined && (weight <= 0 || weight > 100)) {
        asset.isValid = false;
        asset.errors.push('Invalid weight');
      }

      parsed.push(asset);
    });

    return parsed;
  };

  // Handle text change
  const handleTextChange = (value: string) => {
    setImportText(value);
    setErrors([]);

    if (!value.trim()) {
      setParsedAssets([]);
      return;
    }

    try {
      const parsed = importMethod === 'csv' ? parseCSV(value) : parseText(value);
      setParsedAssets(parsed);

      // Check for issues
      const newErrors: string[] = [];
      const invalidAssets = parsed.filter(a => !a.isValid);
      if (invalidAssets.length > 0) {
        newErrors.push(`${invalidAssets.length} assets have validation errors`);
      }

      const totalWeight = parsed
        .filter(a => a.isValid && a.weight !== undefined)
        .reduce((sum, a) => sum + (a.weight || 0), 0);

      if (totalWeight > 100) {
        newErrors.push(`Total weight exceeds 100% (${totalWeight.toFixed(1)}%)`);
      }

      setErrors(newErrors);
    } catch (error) {
      setErrors(['Failed to parse data. Please check format.']);
      setParsedAssets([]);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportMethod('csv');
      setImportText(content);
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  // Handle import
  const handleImport = () => {
    const validAssets = parsedAssets.filter(a => a.isValid);

    if (validAssets.length === 0) {
      setErrors(['No valid assets to import']);
      return;
    }

    const assetsToImport: AssetCreate[] = validAssets.map(asset => ({
      ticker: asset.ticker,
      name: asset.name || `${asset.ticker} Asset`,
      weight: asset.weight || 0,
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      assetClass: asset.assetClass || 'stocks',
      currency: 'USD',
      sector: asset.sector || '',
      industry: '',
      country: 'United States',
      exchange: 'NASDAQ'
    }));

    onImport(assetsToImport);
  };

  // Example formats
  const exampleCSV = `ticker,weight,name
AAPL,25,Apple Inc.
MSFT,20,Microsoft Corp.
GOOGL,15,Alphabet Inc.`;

  const exampleText = `AAPL 25%
MSFT 20%
GOOGL 15%
AMZN 10%`;

  const validAssets = parsedAssets.filter(a => a.isValid);
  const invalidAssets = parsedAssets.filter(a => !a.isValid);

  const content = (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <h2>Import Assets</h2>
        <p>Import multiple assets from CSV file or text paste</p>
      </div>

      <div className={styles.methodSelector}>
        <div className={styles.methodButtons}>
          <Button
            variant={importMethod === 'text' ? 'primary' : 'secondary'}
            onClick={() => setImportMethod('text')}
            size="small"
          >
            📝 Text Import
          </Button>
          <Button
            variant={importMethod === 'csv' ? 'primary' : 'secondary'}
            onClick={() => setImportMethod('csv')}
            size="small"
          >
            📊 CSV Import
          </Button>
        </div>
      </div>

      <div className={styles.importArea}>
        {/* CSV File Upload Section */}
        {importMethod === 'csv' && (
          <div className={styles.fileUpload}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className={styles.uploadButton}
            >
              📁 Choose CSV File
            </Button>
            <p className={styles.uploadText}>
              Or paste CSV data below
            </p>
          </div>
        )}

        {/* Text Area for Both Methods */}
        <div className={styles.textArea}>
          <Input
            label={importMethod === 'csv' ? 'CSV Data' : 'Asset List'}
            value={importText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={importMethod === 'csv' ? 'Paste CSV data here...' : 'Paste asset list here...'}
            multiline
            rows={8}
            className={styles.importInput}
          />
        </div>

        {/* Example Format */}
        <div className={styles.example}>
          <h4>Example Format:</h4>
          <pre className={styles.exampleText}>
            {importMethod === 'csv' ? exampleCSV : exampleText}
          </pre>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className={styles.errors}>
          {errors.map((error, index) => (
            <div key={index} className={styles.error}>
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {/* Assets Preview */}
      {parsedAssets.length > 0 && (
        <div className={styles.preview}>
          <h3>Preview ({parsedAssets.length} assets)</h3>

          {validAssets.length > 0 && (
            <div className={styles.validAssets}>
              <h4 className={styles.validTitle}>✅ Valid Assets ({validAssets.length})</h4>
              <div className={styles.assetsList}>
                {validAssets.map((asset, index) => (
                  <div key={index} className={styles.assetItem}>
                    <span className={styles.assetTicker}>{asset.ticker}</span>
                    {asset.weight && (
                      <span className={styles.assetWeight}>{asset.weight}%</span>
                    )}
                    {asset.name && (
                      <span className={styles.assetName}>{asset.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {invalidAssets.length > 0 && (
            <div className={styles.invalidAssets}>
              <h4 className={styles.invalidTitle}>❌ Invalid Assets ({invalidAssets.length})</h4>
              <div className={styles.assetsList}>
                {invalidAssets.map((asset, index) => (
                  <div key={index} className={styles.assetItem}>
                    <span className={styles.assetTicker}>{asset.ticker}</span>
                    <div className={styles.assetErrors}>
                      {asset.errors.map((error, i) => (
                        <Badge key={i} variant="error" size="small">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          onClick={onCancel || onClose}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="primary"
          disabled={validAssets.length === 0}
        >
          Import {validAssets.length} Assets
        </Button>
      </div>
    </div>
  );

  // Don't render Modal if used as standalone component
  if (!isOpen) {
    return content;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title="Import Assets"
      size="large"
    >
      {content}
    </Modal>
  );
};

export default AssetImport;