/**
 * CreationStepConstraints Component
 * Constraints and advanced settings step for Professional mode portfolio creation
 */
import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card/Card';
import { Input } from '../../../components/common/Input/Input';
import { Button } from '../../../components/common/Button/Button';
import { Checkbox } from '../../../components/common/Checkbox/Checkbox';
import styles from '../PortfolioCreation.module.css';

interface ConstraintsData {
  // Position Limits
  maxPositionSize: number;
  minPositionSize: number;

  // Sector Allocation Limits
  sectorLimits: Record<string, number>;

  // Geographic Constraints
  allowedRegions: string[];

  // Advanced Options
  enableTaxOptimization: boolean;
  enableESG: boolean;
  enableCurrencyHedging: boolean;
}

interface CreationStepConstraintsProps {
  formData: any;
  onNext: (constraints: ConstraintsData) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepConstraints: React.FC<CreationStepConstraintsProps> = ({
  formData,
  onNext,
  onBack,
  loading = false,
  error = null,
}) => {
  const [constraints, setConstraints] = useState<ConstraintsData>({
    maxPositionSize: 25,
    minPositionSize: 1,
    sectorLimits: {
      Technology: 40,
      Healthcare: 20,
      Finance: 15,
      Energy: 10,
      'Consumer Discretionary': 15,
      'Consumer Staples': 10,
      Industrials: 15,
      Materials: 10,
      Utilities: 8,
      'Real Estate': 8,
      Telecommunications: 8,
    },
    allowedRegions: ['US', 'Europe', 'Asia'],
    enableTaxOptimization: true,
    enableESG: false,
    enableCurrencyHedging: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handlePositionLimitChange = (field: 'maxPositionSize' | 'minPositionSize', value: string) => {
    const numValue = parseFloat(value) || 0;
    setConstraints(prev => ({
      ...prev,
      [field]: numValue,
    }));

    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSectorLimitChange = (sector: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setConstraints(prev => ({
      ...prev,
      sectorLimits: {
        ...prev.sectorLimits,
        [sector]: numValue,
      },
    }));
  };

  const handleRegionToggle = (region: string, checked: boolean) => {
    setConstraints(prev => ({
      ...prev,
      allowedRegions: checked
        ? [...prev.allowedRegions, region]
        : prev.allowedRegions.filter(r => r !== region),
    }));
  };

  const handleAdvancedOptionToggle = (
    option: 'enableTaxOptimization' | 'enableESG' | 'enableCurrencyHedging',
    checked: boolean
  ) => {
    setConstraints(prev => ({
      ...prev,
      [option]: checked,
    }));
  };

  const validateConstraints = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate position limits
    if (constraints.maxPositionSize <= 0 || constraints.maxPositionSize > 100) {
      errors.maxPositionSize = 'Max position size must be between 1% and 100%';
    }

    if (constraints.minPositionSize <= 0 || constraints.minPositionSize > 100) {
      errors.minPositionSize = 'Min position size must be between 1% and 100%';
    }

    if (constraints.maxPositionSize <= constraints.minPositionSize) {
      errors.maxPositionSize = 'Max position size must be greater than min position size';
    }

    // Validate that at least one region is selected
    if (constraints.allowedRegions.length === 0) {
      errors.regions = 'At least one geographic region must be selected';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateConstraints()) {
      onNext(constraints);
    }
  };

  const availableRegions = [
    { key: 'US', label: 'US Markets' },
    { key: 'Europe', label: 'European Markets' },
    { key: 'Asia', label: 'Asian Markets' },
    { key: 'Emerging', label: 'Emerging Markets' },
  ];

  const mainSectors = [
    'Technology',
    'Healthcare',
    'Finance',
    'Energy',
    'Consumer Discretionary',
    'Consumer Staples',
  ];

  const otherSectors = [
    'Industrials',
    'Materials',
    'Utilities',
    'Real Estate',
    'Telecommunications',
  ];

  return (
    <div className={styles.stepContainer}>
      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>📊 Investment Strategy & Constraints</h2>
          <p className={styles.stepDescription}>
            Set position limits, sector allocations, and advanced portfolio settings
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.constraintsForm}>
          {/* Position Limits */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Position Limits</h3>
            <div className={styles.positionLimits}>
              <Input
                type="number"
                label="Max per asset (%)"
                placeholder="25"
                value={constraints.maxPositionSize.toString()}
                onChange={(e) => handlePositionLimitChange('maxPositionSize', e.target.value)}
                error={validationErrors.maxPositionSize}
                min="1"
                max="100"
                step="0.1"
                disabled={loading}
              />
              <Input
                type="number"
                label="Min per asset (%)"
                placeholder="1"
                value={constraints.minPositionSize.toString()}
                onChange={(e) => handlePositionLimitChange('minPositionSize', e.target.value)}
                error={validationErrors.minPositionSize}
                min="0.1"
                max="100"
                step="0.1"
                disabled={loading}
              />
            </div>
          </div>

          {/* Sector Allocation Limits */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sector Allocation Limits</h3>
            <p className={styles.sectionDescription}>
              Set maximum allocation percentages for each sector
            </p>

            <div className={styles.sectorLimits}>
              <div className={styles.sectorColumn}>
                <h4 className={styles.columnTitle}>Main Sectors</h4>
                {mainSectors.map(sector => (
                  <div key={sector} className={styles.sectorLimit}>
                    <label className={styles.sectorLabel}>{sector}:</label>
                    <Input
                      type="number"
                      placeholder="40"
                      value={constraints.sectorLimits[sector]?.toString() || ''}
                      onChange={(e) => handleSectorLimitChange(sector, e.target.value)}
                      min="0"
                      max="100"
                      step="1"
                      disabled={loading}
                      className={styles.sectorInput}
                    />
                    <span className={styles.percentSign}>%</span>
                  </div>
                ))}
              </div>

              <div className={styles.sectorColumn}>
                <h4 className={styles.columnTitle}>Other Sectors</h4>
                {otherSectors.map(sector => (
                  <div key={sector} className={styles.sectorLimit}>
                    <label className={styles.sectorLabel}>{sector}:</label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={constraints.sectorLimits[sector]?.toString() || ''}
                      onChange={(e) => handleSectorLimitChange(sector, e.target.value)}
                      min="0"
                      max="100"
                      step="1"
                      disabled={loading}
                      className={styles.sectorInput}
                    />
                    <span className={styles.percentSign}>%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic Constraints */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Geographic Constraints</h3>
            <p className={styles.sectionDescription}>
              Select which geographic markets to include in the portfolio
            </p>

            {validationErrors.regions && (
              <div className={styles.fieldError}>{validationErrors.regions}</div>
            )}

            <div className={styles.regionConstraints}>
              {availableRegions.map(region => (
                <Checkbox
                  key={region.key}
                  label={region.label}
                  checked={constraints.allowedRegions.includes(region.key)}
                  onChange={(checked) => handleRegionToggle(region.key, checked)}
                  disabled={loading}
                  className={styles.regionCheckbox}
                />
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Advanced Options</h3>
            <p className={styles.sectionDescription}>
              Enable additional portfolio management features
            </p>

            <div className={styles.advancedOptions}>
              <Checkbox
                label="Enable tax-loss harvesting"
                checked={constraints.enableTaxOptimization}
                onChange={(checked) => handleAdvancedOptionToggle('enableTaxOptimization', checked)}
                disabled={loading}
                helperText="Automatically realize losses to offset gains for tax efficiency"
              />

              <Checkbox
                label="ESG screening (exclude tobacco, weapons)"
                checked={constraints.enableESG}
                onChange={(checked) => handleAdvancedOptionToggle('enableESG', checked)}
                disabled={loading}
                helperText="Apply environmental, social, and governance criteria to investment selection"
              />

              <Checkbox
                label="Currency hedging for international positions"
                checked={constraints.enableCurrencyHedging}
                onChange={(checked) => handleAdvancedOptionToggle('enableCurrencyHedging', checked)}
                disabled={loading}
                helperText="Reduce currency risk for non-USD denominated assets"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Next: Add Assets
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};