/**
 * CreationStepBasic Component
 * Basic information step for portfolio creation
 */
import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card/Card';
import { Input } from '../../../components/common/Input/Input';
import { Button } from '../../../components/common/Button/Button';
import { validatePortfolio } from '../../../utils/validators';
import styles from '../styles.module.css';

interface CreationStepBasicProps {
  initialData: {
    name: string;
    description: string;
    tags: string[];
  };
  onComplete: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const CreationStepBasic: React.FC<CreationStepBasicProps> = ({
  initialData,
  onComplete,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

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
    setFormData(prev => ({ ...prev, tags }));

    // Clear validation error for tags field
    if (validationErrors.tags) {
      setValidationErrors(prev => {
        const { tags: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Portfolio name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Portfolio name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Portfolio name must not exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onComplete(formData);
  };

  const suggestedTags = [
    'Growth', 'Value', 'Dividend', 'Tech', 'Healthcare', 'Finance',
    'Conservative', 'Aggressive', 'International', 'ESG', 'Small Cap', 'Large Cap'
  ];

  const handleSuggestedTagClick = (tag: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  return (
    <Card className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <h2>Basic Information</h2>
        <p>Provide basic details about your portfolio</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.stepForm}>
        <div className={styles.formSection}>
          <Input
            label="Portfolio Name"
            placeholder="Enter a descriptive name for your portfolio"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={validationErrors.name}
            required
            fullWidth
            disabled={loading}
          />

          <Input
            label="Description"
            placeholder="Optional description of your investment strategy or goals"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={validationErrors.description}
            fullWidth
            disabled={loading}
            helperText="Describe your investment strategy, goals, or any other relevant information"
          />

          <div className={styles.tagsSection}>
            <Input
              label="Tags"
              placeholder="Enter tags separated by commas (e.g., Growth, Tech, Conservative)"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={handleTagsChange}
              fullWidth
              disabled={loading}
              helperText="Tags help organize and categorize your portfolios"
            />

            {suggestedTags.length > 0 && (
              <div className={styles.suggestedTags}>
                <label className={styles.suggestedLabel}>Suggested tags:</label>
                <div className={styles.tagsList}>
                  {suggestedTags.map((tag) => {
                    const isSelected = Array.isArray(formData.tags) && formData.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.tagButton} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleSuggestedTagClick(tag)}
                        disabled={loading}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.stepActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.name.trim()}
          >
            Continue to Assets
          </Button>
        </div>
      </form>
    </Card>
  );
};