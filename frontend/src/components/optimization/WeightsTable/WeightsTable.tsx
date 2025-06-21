/**
 * WeightsTable Component
 * Display and edit portfolio asset weights with validation and constraints
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableColumn } from '../../common/Table/Table';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Card } from '../../common/Card/Card';
import { Badge } from '../../common/Badge/Badge';
import { formatPercentage, formatCurrency } from '../../../utils/formatters';
import styles from './WeightsTable.module.css';

export interface WeightItem {
  ticker: string;
  name?: string;
  currentWeight: number;
  targetWeight: number;
  minWeight?: number;
  maxWeight?: number;
  constraint?: string;
  currentValue?: number;
  targetValue?: number;
  rebalanceAmount?: number;
}

interface WeightsTableProps {
  weights: WeightItem[];
  totalValue?: number;
  editable?: boolean;
  showConstraints?: boolean;
  showRebalancing?: boolean;
  onWeightsChange?: (weights: WeightItem[]) => void;
  onSave?: (weights: WeightItem[]) => void;
  onReset?: () => void;
  className?: string;
}

// Simple weight validation
const validateWeights = (weights: WeightItem[]) => {
  const errors: Record<string, string> = {};
  const totalWeight = weights.reduce((sum, item) => sum + item.targetWeight, 0);

  weights.forEach(item => {
    if (item.targetWeight < 0) {
      errors[item.ticker] = 'Weight cannot be negative';
    }
    if (item.targetWeight > 1) {
      errors[item.ticker] = 'Weight cannot exceed 100%';
    }
    if (item.minWeight !== undefined && item.targetWeight < item.minWeight) {
      errors[item.ticker] = `Weight below minimum (${formatPercentage(item.minWeight, 1)})`;
    }
    if (item.maxWeight !== undefined && item.targetWeight > item.maxWeight) {
      errors[item.ticker] = `Weight above maximum (${formatPercentage(item.maxWeight, 1)})`;
    }
  });

  if (Math.abs(totalWeight - 1) > 0.001) {
    errors.general = 'Total weights must sum to 100%';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const WeightsTable: React.FC<WeightsTableProps> = ({
  weights,
  totalValue = 100000,
  editable = false,
  showConstraints = false,
  showRebalancing = false,
  onWeightsChange,
  onSave,
  onReset,
  className,
}) => {
  const [editingWeights, setEditingWeights] = useState<WeightItem[]>(weights);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update editing weights when props change
  useEffect(() => {
    setEditingWeights(weights);
    setHasChanges(false);
  }, [weights]);

  // Calculate totals and validation
  const totals = useMemo(() => {
    const currentTotal = editingWeights.reduce((sum, item) => sum + item.currentWeight, 0);
    const targetTotal = editingWeights.reduce((sum, item) => sum + item.targetWeight, 0);
    const totalRebalance = editingWeights.reduce((sum, item) => sum + Math.abs(item.rebalanceAmount || 0), 0);

    return {
      current: currentTotal,
      target: targetTotal,
      rebalance: totalRebalance,
      currentValid: Math.abs(currentTotal - 1) < 0.001,
      targetValid: Math.abs(targetTotal - 1) < 0.001,
    };
  }, [editingWeights]);

  // Handle weight change
  const handleWeightChange = (ticker: string, newWeight: number) => {
    if (!editable) return;

    const weight = newWeight;
    const updatedWeights = editingWeights.map(item => {
      if (item.ticker === ticker) {
        const targetValue = weight * totalValue;
        const rebalanceAmount = targetValue - (item.currentValue || 0);

        return {
          ...item,
          targetWeight: weight,
          targetValue,
          rebalanceAmount,
        };
      }
      return item;
    });

    setEditingWeights(updatedWeights);
    setHasChanges(true);

    // Validate weights
    const validation = validateWeights(updatedWeights);
    setErrors(validation.errors);

    onWeightsChange?.(updatedWeights);
  };

  // Handle constraint application
  const applyConstraints = () => {
    const constrainedWeights = editingWeights.map(item => {
      let targetWeight = item.targetWeight;

      if (item.minWeight !== undefined) {
        targetWeight = Math.max(targetWeight, item.minWeight);
      }

      if (item.maxWeight !== undefined) {
        targetWeight = Math.min(targetWeight, item.maxWeight);
      }

      const targetValue = targetWeight * totalValue;
      const rebalanceAmount = targetValue - (item.currentValue || 0);

      return {
        ...item,
        targetWeight,
        targetValue,
        rebalanceAmount,
      };
    });

    setEditingWeights(constrainedWeights);
    setHasChanges(true);
    onWeightsChange?.(constrainedWeights);
  };

  // Normalize weights to sum to 1
  const normalizeWeights = () => {
    const totalWeight = editingWeights.reduce((sum, item) => sum + item.targetWeight, 0);

    if (totalWeight === 0) return;

    const normalizedWeights = editingWeights.map(item => {
      const normalizedWeight = item.targetWeight / totalWeight;
      const targetValue = normalizedWeight * totalValue;
      const rebalanceAmount = targetValue - (item.currentValue || 0);

      return {
        ...item,
        targetWeight: normalizedWeight,
        targetValue,
        rebalanceAmount,
      };
    });

    setEditingWeights(normalizedWeights);
    setHasChanges(true);
    onWeightsChange?.(normalizedWeights);
  };

  // Handle save
  const handleSave = () => {
    if (!totals.targetValid) {
      setErrors({ general: 'Target weights must sum to 100%' });
      return;
    }

    onSave?.(editingWeights);
    setHasChanges(false);
  };

  // Handle reset
  const handleReset = () => {
    setEditingWeights(weights);
    setErrors({});
    setHasChanges(false);
    onReset?.();
  };

  // Define table columns
  const columns: TableColumn<WeightItem>[] = [
    {
      key: 'ticker',
      title: 'Asset',
      width: '120px',
      render: (_, record) => (
        <div className={styles.assetCell}>
          <span className={styles.ticker}>{record.ticker}</span>
          {record.name && (
            <span className={styles.assetName}>{record.name}</span>
          )}
        </div>
      ),
    },
    {
      key: 'currentWeight',
      title: 'Current %',
      width: '100px',
      align: 'right',
      render: (value) => (
        <span className={styles.currentWeight}>
          {formatPercentage(value, 2)}
        </span>
      ),
    },
    {
      key: 'targetWeight',
      title: 'Target %',
      width: '120px',
      align: 'right',
      render: (value, record) => {
        if (!editable) {
          return (
            <span className={styles.targetWeight}>
              {formatPercentage(value, 2)}
            </span>
          );
        }

        return (
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={(value * 100).toFixed(2)}
            onChange={(e) => handleWeightChange(record.ticker, (parseFloat(e.target.value) || 0) / 100)}
            error={errors[record.ticker]}
            className={styles.weightInput}
          />
        );
      },
    },
  ];

  // Add constraint column if needed
  if (showConstraints) {
    columns.push({
      key: 'constraint',
      title: 'Constraints',
      width: '150px',
      render: (_, record) => (
        <div className={styles.constraintCell}>
          {record.minWeight !== undefined && (
            <Badge size="small">
              Min: {formatPercentage(record.minWeight, 1)}
            </Badge>
          )}
          {record.maxWeight !== undefined && (
            <Badge size="small">
              Max: {formatPercentage(record.maxWeight, 1)}
            </Badge>
          )}
          {record.constraint && (
            <Badge size="small">
              {record.constraint}
            </Badge>
          )}
        </div>
      ),
    });
  }

  // Add value columns if needed
  if (showRebalancing) {
    columns.push(
      {
        key: 'currentValue',
        title: 'Current Value',
        width: '120px',
        align: 'right',
        render: (value) => (
          <span className={styles.value}>
            {formatCurrency(value || 0, '0')}
          </span>
        ),
      },
      {
        key: 'targetValue',
        title: 'Target Value',
        width: '120px',
        align: 'right',
        render: (value) => (
          <span className={styles.value}>
            {formatCurrency(value || 0, '0')}
          </span>
        ),
      },
      {
        key: 'rebalanceAmount',
        title: 'Rebalance',
        width: '120px',
        align: 'right',
        render: (value) => {
          const amount = value || 0;
          return (
            <span
              className={`${styles.rebalanceAmount} ${
                amount > 0 ? styles.positive : amount < 0 ? styles.negative : styles.neutral
              }`}
            >
              {amount > 0 ? '+' : ''}{formatCurrency(amount, '0')}
            </span>
          );
        },
      }
    );
  }

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3>Portfolio Weights</h3>
        {editable && (
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="small"
              onClick={applyConstraints}
              disabled={!hasChanges}
            >
              Apply Constraints
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={normalizeWeights}
              disabled={!hasChanges}
            >
              Normalize
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={handleSave}
              disabled={!hasChanges || !totals.targetValid}
            >
              Save
            </Button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Summary Statistics */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Current Total:</span>
              <span className={`${styles.summaryValue} ${
                totals.currentValid ? styles.valid : styles.invalid
              }`}>
                {formatPercentage(totals.current, 2)}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Target Total:</span>
              <span className={`${styles.summaryValue} ${
                totals.targetValid ? styles.valid : styles.invalid
              }`}>
                {formatPercentage(totals.target, 2)}
              </span>
            </div>

            {showRebalancing && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Rebalance:</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(totals.rebalance, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Validation Messages */}
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}

          {!totals.targetValid && (
            <div className={styles.warningMessage}>
              Target weights must sum to 100%. Current sum: {formatPercentage(totals.target, 2)}
            </div>
          )}
        </div>

        {/* Weights Table */}
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={editingWeights}
            rowKey="ticker"
            size="small"
            bordered
            pagination={false}
            className={styles.weightsTable}
          />
        </div>

        {/* Action Buttons for Mobile */}
        {editable && (
          <div className={styles.mobileActions}>
            <Button
              variant="outline"
              size="small"
              onClick={applyConstraints}
              disabled={!hasChanges}
              fullWidth
            >
              Apply Constraints
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={normalizeWeights}
              disabled={!hasChanges}
              fullWidth
            >
              Normalize to 100%
            </Button>
            <div className={styles.mobileActionRow}>
              <Button
                variant="secondary"
                size="small"
                onClick={handleReset}
                disabled={!hasChanges}
                fullWidth
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSave}
                disabled={!hasChanges || !totals.targetValid}
                fullWidth
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {editable && (
          <div className={styles.helpText}>
            <p><strong>Tips:</strong></p>
            <ul>
              <li>Enter target weights as percentages (e.g., 25 for 25%)</li>
              <li>Use "Normalize" to automatically adjust weights to sum to 100%</li>
              <li>Use "Apply Constraints" to enforce min/max weight limits</li>
              <li>Weights must sum to exactly 100% before saving</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};