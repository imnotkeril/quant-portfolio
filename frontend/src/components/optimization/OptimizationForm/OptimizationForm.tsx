/**
 * OptimizationForm Component
 * Form for configuring portfolio optimization parameters
 */
import React, { useState, useEffect } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Modal } from '../../common/Modal/Modal';
import { useOptimization } from '../../../hooks/useOptimization';
import {
  OptimizationRequest,
  OptimizationMethod,
  MarkowitzRequest,
  RiskParityRequest
} from '../../../types/optimization';
import styles from './OptimizationForm.module.css';

interface OptimizationFormProps {
  portfolioId?: string;
  tickers?: string[];
  onOptimizationSuccess?: (result: any) => void;
  onClose?: () => void;
  className?: string;
}

export const OptimizationForm: React.FC<OptimizationFormProps> = ({
  portfolioId,
  tickers = [],
  onOptimizationSuccess,
  onClose,
  className,
}) => {
  const {
    optimizePortfolio,
    optimizeMarkowitz,
    optimizeRiskParity,
    optimizeMinimumVariance,
    optimizeMaximumSharpe,
    optimizeEqualWeight,
    getOptimizationMethods,
    validateOptimizationRequest: validateRequest,
    optimizing,
    error,
    clearError,
  } = useOptimization();

  // Form state
  const [method, setMethod] = useState<OptimizationMethod>('markowitz');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    riskFreeRate: 0.02,
    minWeight: 0.0,
    maxWeight: 1.0,
    targetReturn: '',
    targetRisk: '',
    // Risk Parity specific
    riskBudget: {} as Record<string, number>,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Available optimization methods
  const optimizationMethods = getOptimizationMethods();

  // Initialize form data
  useEffect(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      startDate,
      endDate,
    }));
  }, []);

  // Handle method change
  const handleMethodChange = (newMethod: OptimizationMethod) => {
    setMethod(newMethod);
    clearError();
    setFormErrors({});
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Basic validation
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (formData.riskFreeRate < -0.1 || formData.riskFreeRate > 0.2) {
      errors.riskFreeRate = 'Risk-free rate must be between -10% and 20%';
    }

    if (formData.minWeight < 0 || formData.minWeight > 1) {
      errors.minWeight = 'Minimum weight must be between 0 and 1';
    }

    if (formData.maxWeight < 0 || formData.maxWeight > 1) {
      errors.maxWeight = 'Maximum weight must be between 0 and 1';
    }

    if (formData.minWeight > formData.maxWeight) {
      errors.maxWeight = 'Maximum weight must be greater than minimum weight';
    }

    // Method-specific validation
    if (method === 'markowitz') {
      if (formData.targetReturn && (parseFloat(formData.targetReturn) < -0.5 || parseFloat(formData.targetReturn) > 1)) {
        errors.targetReturn = 'Target return must be between -50% and 100%';
      }

      if (formData.targetRisk && (parseFloat(formData.targetRisk) < 0 || parseFloat(formData.targetRisk) > 1)) {
        errors.targetRisk = 'Target risk must be between 0% and 100%';
      }
    }

    if (method === 'risk_parity' && Object.keys(formData.riskBudget).length > 0) {
      const totalBudget = Object.values(formData.riskBudget).reduce((sum, budget) => sum + budget, 0);
      if (Math.abs(totalBudget - 1.0) > 0.001) {
        errors.riskBudget = 'Risk budget must sum to 100%';
      }
    }

    // Portfolio/tickers validation
    if (!portfolioId && tickers.length < 2) {
      errors.tickers = 'At least 2 assets are required for optimization';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Build optimization request
      const request: OptimizationRequest = {
        portfolioId,
        tickers: tickers.length > 0 ? tickers : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        riskFreeRate: formData.riskFreeRate,
        minWeight: formData.minWeight,
        maxWeight: formData.maxWeight,
      };

      // Add method-specific parameters
      if (method === 'markowitz') {
        const markowitzRequest: MarkowitzRequest = {
          ...request,
          targetReturn: formData.targetReturn ? parseFloat(formData.targetReturn) : undefined,
          targetRisk: formData.targetRisk ? parseFloat(formData.targetRisk) : undefined,
        };

        const result = await optimizeMarkowitz(markowitzRequest);
        if (result) {
          onOptimizationSuccess?.(result);
        }
      } else if (method === 'risk_parity') {
        const riskParityRequest: RiskParityRequest = {
          ...request,
          riskBudget: Object.keys(formData.riskBudget).length > 0 ? formData.riskBudget : undefined,
        };

        const result = await optimizeRiskParity(riskParityRequest);
        if (result) {
          onOptimizationSuccess?.(result);
        }
      } else {
        // Use generic optimization for other methods
        const result = await optimizePortfolio(method, request);
        if (result) {
          onOptimizationSuccess?.(result);
        }
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  // Render method selector
  const renderMethodSelector = () => (
    <div className={styles.methodSection}>
      <label className={styles.label}>Optimization Method</label>
      <select
        value={method}
        onChange={(e) => handleMethodChange(e.target.value as OptimizationMethod)}
        className={styles.methodSelect}
      >
        {optimizationMethods.map(m => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* Method description */}
      <div className={styles.methodDescription}>
        {optimizationMethods.find(m => m.value === method)?.description}
      </div>
    </div>
  );

  // Render risk budget inputs for risk parity
  const renderRiskBudgetInputs = () => {
    if (method !== 'risk_parity') return null;

    return (
      <div className={styles.riskBudgetSection}>
        <h4 className={styles.sectionTitle}>Risk Budget (Optional)</h4>
        <p className={styles.sectionDescription}>
          Specify custom risk allocation for each asset. If not specified, equal risk contribution will be used.
        </p>

        {tickers.map((ticker, index) => (
          <div key={ticker} className={styles.riskBudgetInput}>
            <Input
              label={`${ticker} Risk Budget`}
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={formData.riskBudget[ticker]?.toString() || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                handleFieldChange('riskBudget', {
                  ...formData.riskBudget,
                  [ticker]: value,
                });
              }}
              placeholder={`e.g., ${(1 / tickers.length).toFixed(3)}`}
              helperText="Percentage of total risk (0.0 - 1.0)"
            />
          </div>
        ))}

        {Object.keys(formData.riskBudget).length > 0 && (
          <div className={styles.riskBudgetSummary}>
            <p>
              Total: {Object.values(formData.riskBudget).reduce((sum, budget) => sum + budget, 0).toFixed(3)}
              <span className={styles.targetText}> (Target: 1.000)</span>
            </p>
          </div>
        )}

        {formErrors.riskBudget && (
          <div className={styles.errorText}>{formErrors.riskBudget}</div>
        )}
      </div>
    );
  };

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3>Portfolio Optimization</h3>
        {onClose && (
          <Button variant="text" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Optimization Method */}
          {renderMethodSelector()}

          {/* Date Range */}
          <div className={styles.dateSection}>
            <div className={styles.dateRow}>
              <Input
                label="Start Date"
                type="text"
                value={formData.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                error={formErrors.startDate}
                required
                className={styles.dateInput}
              />

              <Input
                label="End Date"
                type="text"
                value={formData.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                error={formErrors.endDate}
                required
                className={styles.dateInput}
              />
            </div>
          </div>

          {/* Basic Parameters */}
          <div className={styles.parametersSection}>
            <Input
              label="Risk-Free Rate"
              type="number"
              min={-0.1}
              max={0.2}
              step={0.001}
              value={formData.riskFreeRate.toString()}
              onChange={(e) => handleFieldChange('riskFreeRate', parseFloat(e.target.value) || 0)}
              error={formErrors.riskFreeRate}
              helperText="Annual risk-free rate (e.g., 0.02 for 2%)"
            />

            <div className={styles.weightsRow}>
              <Input
                label="Minimum Weight"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={formData.minWeight.toString()}
                onChange={(e) => handleFieldChange('minWeight', parseFloat(e.target.value) || 0)}
                error={formErrors.minWeight}
                helperText="Minimum allocation per asset"
              />

              <Input
                label="Maximum Weight"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={formData.maxWeight.toString()}
                onChange={(e) => handleFieldChange('maxWeight', parseFloat(e.target.value) || 0)}
                error={formErrors.maxWeight}
                helperText="Maximum allocation per asset"
              />
            </div>
          </div>

          {/* Method-specific parameters */}
          {method === 'markowitz' && (
            <div className={styles.markowitzSection}>
              <h4 className={styles.sectionTitle}>Markowitz Parameters (Optional)</h4>

              <div className={styles.targetsRow}>
                <Input
                  label="Target Return"
                  type="number"
                  min={-0.5}
                  max={1}
                  step={0.01}
                  value={formData.targetReturn}
                  onChange={(e) => handleFieldChange('targetReturn', e.target.value)}
                  error={formErrors.targetReturn}
                  helperText="Expected annual return (e.g., 0.08 for 8%)"
                  placeholder="Leave empty for unconstrained"
                />

                <Input
                  label="Target Risk"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={formData.targetRisk}
                  onChange={(e) => handleFieldChange('targetRisk', e.target.value)}
                  error={formErrors.targetRisk}
                  helperText="Expected annual volatility (e.g., 0.15 for 15%)"
                  placeholder="Leave empty for unconstrained"
                />
              </div>
            </div>
          )}

          {renderRiskBudgetInputs()}

          {/* Portfolio/Tickers Info */}
          {portfolioId ? (
            <div className={styles.portfolioInfo}>
              <p><strong>Portfolio ID:</strong> {portfolioId}</p>
            </div>
          ) : tickers.length > 0 ? (
            <div className={styles.tickersInfo}>
              <p><strong>Assets ({tickers.length}):</strong></p>
              <div className={styles.tickersList}>
                {tickers.map(ticker => (
                  <span key={ticker} className={styles.tickerTag}>{ticker}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.errorText}>
              {formErrors.tickers || 'No portfolio or assets specified'}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className={styles.errorAlert}>
              <p><strong>Optimization Error:</strong></p>
              <p>{typeof error === 'string' ? error : (error as any)?.message || 'Unknown error'}</p>
              <Button variant="text" size="small" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            <Button
              type="submit"
              variant="primary"
              loading={optimizing}
              disabled={optimizing || (!portfolioId && tickers.length === 0)}
              fullWidth
            >
              {optimizing ? 'Optimizing...' : 'Optimize Portfolio'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(true)}
              disabled={optimizing}
            >
              Advanced Options
            </Button>
          </div>
        </form>
      </div>

      {/* Advanced Options Modal */}
      <Modal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        title="Advanced Optimization Options"
        size="large"
      >
        <div className={styles.advancedOptions}>
          <p>Advanced optimization features will be implemented here:</p>
          <ul>
            <li>Transaction costs consideration</li>
            <li>ESG scoring constraints</li>
            <li>Scenario-based optimization</li>
            <li>Robust optimization parameters</li>
            <li>Custom objective functions</li>
          </ul>

          <div className={styles.comingSoon}>
            <p>Coming soon in future updates!</p>
          </div>
        </div>
      </Modal>
    </Card>
  );
};