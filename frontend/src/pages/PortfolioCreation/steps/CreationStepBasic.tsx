/**
 * CreationStepBasic Component
 * Basic information step for portfolio creation (Easy/Professional modes)
 */
import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card/Card';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';
import { Badge } from '../../../components/common/Badge/Badge';
import styles from '../PortfolioCreation.module.css';

interface PortfolioFormData {
  name: string;
  description: string;
  startingAmount: number;
  portfolioType?: string;
  riskTolerance?: string;
  investmentObjective?: string;
  rebalancingFrequency?: string;
  tags?: string[];
}

interface CreationStepBasicProps {
  mode: 'easy' | 'professional';
  formData: PortfolioFormData;
  onNext: (data: Partial<PortfolioFormData>) => void;
  onBack: () => void;
  errors?: Record<string, string>;
  loading?: boolean;
}

export const CreationStepBasic: React.FC<CreationStepBasicProps> = ({
  mode,
  formData,
  onNext,
  onBack,
  errors = {},
  loading = false,
}) => {
  const [localFormData, setLocalFormData] = useState<PortfolioFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(errors);

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  useEffect(() => {
    setValidationErrors(errors);
  }, [errors]);

  const handleInputChange = (field: keyof PortfolioFormData, value: string | number | string[]) => {
    setLocalFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!localFormData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    } else if (localFormData.name.length < 2) {
      newErrors.name = 'Portfolio name must be at least 2 characters';
    } else if (localFormData.name.length > 100) {
      newErrors.name = 'Portfolio name must not exceed 100 characters';
    }

    if (!localFormData.startingAmount || localFormData.startingAmount <= 0) {
      newErrors.startingAmount = 'Starting amount must be greater than 0';
    } else if (localFormData.startingAmount > 100000000) {
      newErrors.startingAmount = 'Starting amount is too large';
    }

    // Optional fields validation
    if (localFormData.description && localFormData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    // Professional mode required fields
    if (mode === 'professional') {
      if (!localFormData.portfolioType) {
        newErrors.portfolioType = 'Portfolio type is required in professional mode';
      }
      if (!localFormData.riskTolerance) {
        newErrors.riskTolerance = 'Risk tolerance is required in professional mode';
      }
      if (!localFormData.investmentObjective) {
        newErrors.investmentObjective = 'Investment objective is required in professional mode';
      }
      if (!localFormData.rebalancingFrequency) {
        newErrors.rebalancingFrequency = 'Rebalancing frequency is required in professional mode';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      onNext(localFormData);
    }
  };

  // Options for professional mode
  const portfolioTypeOptions = [
    { value: 'growth', label: 'Growth' },
    { value: 'value', label: 'Value' },
    { value: 'dividend', label: 'Dividend Income' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'aggressive_growth', label: 'Aggressive Growth' },
    { value: 'conservative', label: 'Conservative' },
    { value: 'index', label: 'Index Following' },
  ];

  const riskToleranceOptions = [
    { value: 'very_low', label: 'Very Low' },
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' },
  ];

  const investmentObjectiveOptions = [
    { value: 'capital_appreciation', label: 'Capital Appreciation' },
    { value: 'income_generation', label: 'Income Generation' },
    { value: 'capital_preservation', label: 'Capital Preservation' },
    { value: 'speculation', label: 'Speculation' },
    { value: 'hedging', label: 'Hedging' },
  ];

  const rebalancingOptions = [
    { value: 'never', label: 'Never' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi_annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' },
    { value: 'threshold_based', label: 'Threshold Based' },
  ];

  const suggestedTags = [
    'Growth', 'Value', 'Dividend', 'Tech', 'Healthcare', 'Finance',
    'Conservative', 'Aggressive', 'International', 'ESG', 'Small Cap', 'Large Cap'
  ];

  const handleSuggestedTagClick = (tag: string) => {
    const currentTags = Array.isArray(localFormData.tags) ? localFormData.tags : [];
    if (!currentTags.includes(tag)) {
      handleInputChange('tags', [...currentTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(localFormData.tags) ? localFormData.tags : [];
    handleInputChange('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const isEasyMode = mode === 'easy';
  const stepTitle = isEasyMode ? '📋 Portfolio Basics' : '⚙️ Professional Portfolio Setup';
  const stepDescription = isEasyMode
    ? 'Let\'s start with the basic information for your portfolio'
    : 'Configure detailed portfolio settings and investment strategy';

  return (
    <div className={styles.stepContainer}>
      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>{stepTitle}</h2>
          <p className={styles.stepDescription}>{stepDescription}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.basicForm}>
          {/* Basic Information - Common for both modes */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>

            <Input
              label="Portfolio Name"
              placeholder="Enter a name for your portfolio"
              value={localFormData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={validationErrors.name}
              required
              fullWidth
              disabled={loading}
            />

            <Input
              label="Description"
              placeholder="Brief description of your investment strategy (optional)"
              value={localFormData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={validationErrors.description}
              fullWidth
              disabled={loading}
            />

            <Input
              type="number"
              label="Starting Amount"
              placeholder="100000"
              value={localFormData.startingAmount?.toString() || ''}
              onChange={(e) => handleInputChange('startingAmount', parseFloat(e.target.value) || 0)}
              error={validationErrors.startingAmount}
              required
              fullWidth
              disabled={loading}
              min="1"
              step="0.01"
            />
          </div>

          {/* Professional Mode Additional Fields */}
          {!isEasyMode && (
            <>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Portfolio Configuration</h3>

                <Select
                  label="Portfolio Type"
                  placeholder="Select portfolio type"
                  value={localFormData.portfolioType || ''}
                  onChange={(value) => handleInputChange('portfolioType', value)}
                  options={portfolioTypeOptions}
                  error={validationErrors.portfolioType}
                  required
                  fullWidth
                  disabled={loading}
                />

                <div className={styles.formRow}>
                  <Select
                    label="Risk Tolerance"
                    placeholder="Select risk level"
                    value={localFormData.riskTolerance || ''}
                    onChange={(value) => handleInputChange('riskTolerance', value)}
                    options={riskToleranceOptions}
                    error={validationErrors.riskTolerance}
                    required
                    fullWidth
                    disabled={loading}
                  />

                  <Select
                    label="Investment Objective"
                    placeholder="Select objective"
                    value={localFormData.investmentObjective || ''}
                    onChange={(value) => handleInputChange('investmentObjective', value)}
                    options={investmentObjectiveOptions}
                    error={validationErrors.investmentObjective}
                    required
                    fullWidth
                    disabled={loading}
                  />
                </div>

                <Select
                  label="Rebalancing Frequency"
                  placeholder="Select rebalancing frequency"
                  value={localFormData.rebalancingFrequency || ''}
                  onChange={(value) => handleInputChange('rebalancingFrequency', value)}
                  options={rebalancingOptions}
                  error={validationErrors.rebalancingFrequency}
                  required
                  fullWidth
                  disabled={loading}
                />
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Portfolio Tags</h3>
                <p className={styles.sectionDescription}>
                  Add tags to categorize and organize your portfolio
                </p>

                <Input
                  label="Tags (comma separated)"
                  placeholder="growth, tech, aggressive"
                  value={Array.isArray(localFormData.tags) ? localFormData.tags.join(', ') : ''}
                  onChange={handleTagsChange}
                  error={validationErrors.tags}
                  fullWidth
                  disabled={loading}
                />

                {/* Current Tags */}
                {localFormData.tags && localFormData.tags.length > 0 && (
                  <div className={styles.tagsContainer}>
                    <label className={styles.tagsLabel}>Current Tags:</label>
                    <div className={styles.tagsList}>
                      {localFormData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          onRemove={() => removeTag(tag)}
                          className={styles.tagBadge}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Tags */}
                <div className={styles.suggestedTags}>
                  <label className={styles.tagsLabel}>Suggested Tags:</label>
                  <div className={styles.tagsList}>
                    {suggestedTags
                      .filter(tag => !localFormData.tags?.includes(tag))
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          onClick={() => handleSuggestedTagClick(tag)}
                          className={styles.suggestedTag}
                        >
                          + {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}

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
              {isEasyMode ? 'Next: Add Assets' : 'Next: Add Assets'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};