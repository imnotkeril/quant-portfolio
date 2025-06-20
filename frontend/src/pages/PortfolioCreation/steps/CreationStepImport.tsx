/**
 * CreationStepImport Component
 * Import portfolio from CSV or text description
 */
import React, { useState, useRef } from 'react';
import { Card } from '../../../components/common/Card/Card';
import { Button } from '../../../components/common/Button/Button';
import { Input } from '../../../components/common/Input/Input';
import { Tabs } from '../../../components/common/Tabs/Tabs';
import { TextPortfolioCreate } from '../../../types/portfolio';
import styles from '../styles.module.css';

interface CreationStepImportProps {
  onImport: (file: File, name?: string, description?: string) => void;
  onTextImport: (textData: TextPortfolioCreate) => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepImport: React.FC<CreationStepImportProps> = ({
  onImport,
  onTextImport,
  loading = false,
  error = null,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setValidationErrors(prev => ({ ...prev, file: '' }));

        // Auto-generate name from filename
        if (!portfolioName) {
          const nameFromFile = file.name.replace('.csv', '').replace(/[_-]/g, ' ');
          setPortfolioName(nameFromFile);
        }
      } else {
        setValidationErrors(prev => ({ ...prev, file: 'Please select a CSV file' }));
        setSelectedFile(null);
      }
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      setValidationErrors(prev => ({ ...prev, file: 'Please select a file' }));
      return;
    }

    if (!portfolioName.trim()) {
      setValidationErrors(prev => ({ ...prev, name: 'Portfolio name is required' }));
      return;
    }

    onImport(selectedFile, portfolioName.trim(), portfolioDescription.trim() || undefined);
  };

  const handleTextImport = () => {
    if (!textDescription.trim()) {
      setValidationErrors(prev => ({ ...prev, text: 'Please provide a portfolio description' }));
      return;
    }

    if (!portfolioName.trim()) {
      setValidationErrors(prev => ({ ...prev, name: 'Portfolio name is required' }));
      return;
    }

    onTextImport({
      name: portfolioName.trim(),
      description: portfolioDescription.trim() || undefined,
      text: textDescription.trim(),
    });
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const csvTemplate = `Ticker,Name,Weight,Quantity,Purchase Price,Purchase Date,Sector
AAPL,Apple Inc.,25.0,100,150.00,2024-01-15,Technology
MSFT,Microsoft Corp.,20.0,50,300.00,2024-01-15,Technology
GOOGL,Alphabet Inc.,15.0,25,140.00,2024-01-15,Technology
AMZN,Amazon.com Inc.,15.0,30,160.00,2024-01-15,Consumer Discretionary
TSLA,Tesla Inc.,10.0,40,200.00,2024-01-15,Consumer Discretionary
BRK.B,Berkshire Hathaway,10.0,200,350.00,2024-01-15,Financial Services
JNJ,Johnson & Johnson,5.0,60,170.00,2024-01-15,Healthcare`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importTabs = [
    {
      key: 'csv',
      label: 'CSV Import',
      children: (
        <div className={styles.importSection}>
          <div className={styles.importHeader}>
            <h3>Import from CSV File</h3>
            <p>Upload a CSV file with your portfolio holdings</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.importForm}>
            <Input
              label="Portfolio Name"
              placeholder="Enter a name for your portfolio"
              value={portfolioName}
              onChange={(e) => {
                setPortfolioName(e.target.value);
                setValidationErrors(prev => ({ ...prev, name: '' }));
              }}
              error={validationErrors.name}
              required
              fullWidth
              disabled={loading}
            />

            <Input
              label="Description (Optional)"
              placeholder="Brief description of your portfolio"
              value={portfolioDescription}
              onChange={(e) => setPortfolioDescription(e.target.value)}
              fullWidth
              disabled={loading}
            />

            <div className={styles.fileUploadSection}>
              <label className={styles.fileLabel}>CSV File</label>
              <div className={styles.fileUpload}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  disabled={loading}
                />
                <div className={styles.fileDropZone}>
                  {selectedFile ? (
                    <div className={styles.fileSelected}>
                      <div className={styles.fileInfo}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{selectedFile.name}</span>
                          <span className={styles.fileSize}>
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="text"
                        size="small"
                        onClick={clearFile}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.filePlaceholder}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      <p>Click to select a CSV file or drag and drop</p>
                      <span>Supports .csv files up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>
              {validationErrors.file && (
                <div className={styles.fieldError}>{validationErrors.file}</div>
              )}
            </div>

            <div className={styles.templateSection}>
              <h4>Need a template?</h4>
              <p>Download our CSV template to see the expected format</p>
              <Button
                variant="outline"
                size="small"
                onClick={downloadTemplate}
                disabled={loading}
              >
                Download Template
              </Button>
            </div>

            <div className={styles.csvFormatInfo}>
              <h4>CSV Format Requirements</h4>
              <ul>
                <li><strong>Ticker:</strong> Stock symbol (required)</li>
                <li><strong>Name:</strong> Company name (optional)</li>
                <li><strong>Weight:</strong> Percentage allocation (required)</li>
                <li><strong>Quantity:</strong> Number of shares (optional)</li>
                <li><strong>Purchase Price:</strong> Price per share (optional)</li>
                <li><strong>Purchase Date:</strong> Date in YYYY-MM-DD format (optional)</li>
                <li><strong>Sector:</strong> Industry sector (optional)</li>
              </ul>
            </div>

            <Button
              onClick={handleFileUpload}
              loading={loading}
              disabled={!selectedFile || !portfolioName.trim()}
              fullWidth
            >
              Import Portfolio
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'text',
      label: 'Text Description',
      children: (
        <div className={styles.importSection}>
          <div className={styles.importHeader}>
            <h3>Describe Your Portfolio</h3>
            <p>Describe your portfolio in natural language and let AI parse it</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.importForm}>
            <Input
              label="Portfolio Name"
              placeholder="Enter a name for your portfolio"
              value={portfolioName}
              onChange={(e) => {
                setPortfolioName(e.target.value);
                setValidationErrors(prev => ({ ...prev, name: '' }));
              }}
              error={validationErrors.name}
              required
              fullWidth
              disabled={loading}
            />

            <Input
              label="Description (Optional)"
              placeholder="Brief description of your investment strategy"
              value={portfolioDescription}
              onChange={(e) => setPortfolioDescription(e.target.value)}
              fullWidth
              disabled={loading}
            />

            <div className={styles.textAreaSection}>
              <label className={styles.textAreaLabel}>Portfolio Description</label>
              <textarea
                className={styles.textArea}
                placeholder="Example: 40% Apple stock, 30% Microsoft, 20% Google, 10% Tesla. Or: I want a tech-heavy portfolio with 50% large cap stocks, 30% growth stocks, and 20% bonds."
                value={textDescription}
                onChange={(e) => {
                  setTextDescription(e.target.value);
                  setValidationErrors(prev => ({ ...prev, text: '' }));
                }}
                disabled={loading}
                rows={6}
              />
              {validationErrors.text && (
                <div className={styles.fieldError}>{validationErrors.text}</div>
              )}
            </div>

            <div className={styles.textExamples}>
              <h4>Example Descriptions</h4>
              <div className={styles.examplesList}>
                <div className={styles.exampleItem}>
                  <strong>Specific Holdings:</strong>
                  <p>"40% Apple, 25% Microsoft, 20% Google, 10% Amazon, 5% Tesla"</p>
                </div>
                <div className={styles.exampleItem}>
                  <strong>Strategy-Based:</strong>
                  <p>"Conservative portfolio with 60% bonds, 30% blue-chip stocks, 10% REITs"</p>
                </div>
                <div className={styles.exampleItem}>
                  <strong>Sector-Based:</strong>
                  <p>"Tech-focused: 50% technology stocks, 30% growth companies, 20% cash"</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleTextImport}
              loading={loading}
              disabled={!textDescription.trim() || !portfolioName.trim()}
              fullWidth
            >
              Create Portfolio from Description
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.importContainer}>
      <Tabs
        items={importTabs}
        defaultActiveKey="csv"
        className={styles.importTabs}
      />
    </div>
  );
};