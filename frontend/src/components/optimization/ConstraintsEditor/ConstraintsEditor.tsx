/**
 * ConstraintsEditor Component
 * Visual editor for portfolio optimization constraints
 */
import React, { useState, useEffect } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Table, TableColumn } from '../../common/Table/Table';
import { Badge } from '../../common/Badge/Badge';
import { Modal } from '../../common/Modal/Modal';
import { formatPercentage } from '../../../utils/formatters';
import styles from './ConstraintsEditor.module.css';

export interface Constraint {
  id: string;
  type: 'weight' | 'sector' | 'asset_class' | 'geographic' | 'esg' | 'custom';
  target: string; // ticker, sector name, etc.
  operator: 'min' | 'max' | 'equal' | 'between';
  value: number;
  maxValue?: number; // for 'between' operator
  enabled: boolean;
  description?: string;
}

export interface ConstraintGroup {
  id: string;
  name: string;
  constraints: Constraint[];
  enabled: boolean;
}

interface ConstraintsEditorProps {
  constraints: Constraint[];
  constraintGroups?: ConstraintGroup[];
  availableAssets?: string[];
  availableSectors?: string[];
  onConstraintsChange?: (constraints: Constraint[]) => void;
  onGroupsChange?: (groups: ConstraintGroup[]) => void;
  className?: string;
}

export const ConstraintsEditor: React.FC<ConstraintsEditorProps> = ({
  constraints,
  constraintGroups = [],
  availableAssets = [],
  availableSectors = [],
  onConstraintsChange,
  onGroupsChange,
  className,
}) => {
  const [editingConstraints, setEditingConstraints] = useState<Constraint[]>(constraints);
  const [editingGroups, setEditingGroups] = useState<ConstraintGroup[]>(constraintGroups);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newConstraint, setNewConstraint] = useState<Partial<Constraint>>({
    type: 'weight',
    operator: 'max',
    value: 0.1,
    enabled: true,
  });
  const [newGroupName, setNewGroupName] = useState('');

  // Update internal state when props change
  useEffect(() => {
    setEditingConstraints(constraints);
  }, [constraints]);

  useEffect(() => {
    setEditingGroups(constraintGroups);
  }, [constraintGroups]);

  // Constraint types configuration
  const constraintTypes = [
    { value: 'weight', label: 'Asset Weight', description: 'Individual asset weight limits' },
    { value: 'sector', label: 'Sector Weight', description: 'Sector allocation limits' },
    { value: 'asset_class', label: 'Asset Class', description: 'Asset class allocation limits' },
    { value: 'geographic', label: 'Geographic', description: 'Geographic region limits' },
    { value: 'esg', label: 'ESG Score', description: 'ESG criteria constraints' },
    { value: 'custom', label: 'Custom', description: 'Custom constraint formula' },
  ];

  const operatorTypes = [
    { value: 'min', label: 'Minimum (≥)' },
    { value: 'max', label: 'Maximum (≤)' },
    { value: 'equal', label: 'Equal (=)' },
    { value: 'between', label: 'Between' },
  ];

  // Handle constraint changes
  const handleConstraintChange = (id: string, field: keyof Constraint, value: any) => {
    const updatedConstraints = editingConstraints.map(constraint =>
      constraint.id === id ? { ...constraint, [field]: value } : constraint
    );

    setEditingConstraints(updatedConstraints);
    onConstraintsChange?.(updatedConstraints);
  };

  // Add new constraint
  const handleAddConstraint = () => {
    if (!newConstraint.target || newConstraint.value === undefined) {
      return;
    }

    const constraint: Constraint = {
      id: `constraint-${Date.now()}`,
      type: newConstraint.type || 'weight',
      target: newConstraint.target,
      operator: newConstraint.operator || 'max',
      value: newConstraint.value,
      maxValue: newConstraint.maxValue,
      enabled: newConstraint.enabled ?? true,
      description: generateConstraintDescription(newConstraint as Constraint),
    };

    const updatedConstraints = [...editingConstraints, constraint];
    setEditingConstraints(updatedConstraints);
    onConstraintsChange?.(updatedConstraints);

    // Reset form
    setNewConstraint({
      type: 'weight',
      operator: 'max',
      value: 0.1,
      enabled: true,
    });
    setShowAddModal(false);
  };

  // Remove constraint
  const handleRemoveConstraint = (id: string) => {
    const updatedConstraints = editingConstraints.filter(c => c.id !== id);
    setEditingConstraints(updatedConstraints);
    onConstraintsChange?.(updatedConstraints);
  };

  // Add constraint group
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const group: ConstraintGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      constraints: [],
      enabled: true,
    };

    const updatedGroups = [...editingGroups, group];
    setEditingGroups(updatedGroups);
    onGroupsChange?.(updatedGroups);

    setNewGroupName('');
    setShowGroupModal(false);
  };

  // Toggle group enabled state
  const handleToggleGroup = (groupId: string) => {
    const updatedGroups = editingGroups.map(group =>
      group.id === groupId ? { ...group, enabled: !group.enabled } : group
    );
    setEditingGroups(updatedGroups);
    onGroupsChange?.(updatedGroups);
  };

  // Get target options based on constraint type
  const getTargetOptions = (type: string) => {
    switch (type) {
      case 'weight':
        return availableAssets.map(asset => ({ value: asset, label: asset }));
      case 'sector':
        return availableSectors.map(sector => ({ value: sector, label: sector }));
      case 'asset_class':
        return [
          { value: 'stocks', label: 'Stocks' },
          { value: 'bonds', label: 'Bonds' },
          { value: 'commodities', label: 'Commodities' },
          { value: 'real_estate', label: 'Real Estate' },
          { value: 'cash', label: 'Cash' },
        ];
      case 'geographic':
        return [
          { value: 'us', label: 'United States' },
          { value: 'europe', label: 'Europe' },
          { value: 'asia', label: 'Asia' },
          { value: 'emerging', label: 'Emerging Markets' },
          { value: 'developed', label: 'Developed Markets' },
        ];
      case 'esg':
        return [
          { value: 'overall', label: 'Overall ESG Score' },
          { value: 'environmental', label: 'Environmental Score' },
          { value: 'social', label: 'Social Score' },
          { value: 'governance', label: 'Governance Score' },
        ];
      default:
        return [];
    }
  };

  // Table columns for constraints
  const constraintColumns: TableColumn<Constraint>[] = [
    {
      key: 'enabled',
      title: 'Status',
      width: '80px',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={record.enabled}
          onChange={(e) => handleConstraintChange(record.id, 'enabled', e.target.checked)}
          className={styles.enabledCheckbox}
        />
      ),
    },
    {
      key: 'type',
      title: 'Type',
      width: '120px',
      render: (value) => (
        <Badge variant="outline" size="small">
          {constraintTypes.find(t => t.value === value)?.label || value}
        </Badge>
      ),
    },
    {
      key: 'target',
      title: 'Target',
      width: '150px',
      render: (value) => (
        <span className={styles.targetValue}>{value}</span>
      ),
    },
    {
      key: 'constraint',
      title: 'Constraint',
      width: '200px',
      render: (_, record) => (
        <span className={styles.constraintText}>
          {formatConstraintText(record)}
        </span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <span className={styles.description}>{value}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_, record) => (
        <div className={styles.actions}>
          <Button
            variant="text"
            size="small"
            onClick={() => handleRemoveConstraint(record.id)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3>Optimization Constraints</h3>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowGroupModal(true)}
          >
            Add Group
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowAddModal(true)}
          >
            Add Constraint
          </Button>
        </div>
      </div>

      <div className={styles.content}>
          {/* Constraint Groups */}
          {editingGroups.length > 0 && (
            <div className={styles.groupsSection}>
              <h4>Constraint Groups</h4>
              <div className={styles.groupsList}>
                {editingGroups.map(group => (
                  <div key={group.id} className={styles.groupItem}>
                    <div className={styles.groupHeader}>
                      <span className={styles.groupName}>{group.name}</span>
                      <div className={styles.groupActions}>
                        <label className={styles.groupToggle}>
                          <input
                            type="checkbox"
                            checked={group.enabled}
                            onChange={() => handleToggleGroup(group.id)}
                          />
                          <span>Enabled</span>
                        </label>
                      </div>
                    </div>
                    <div className={styles.groupConstraints}>
                      {group.constraints.length} constraints
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints Table */}
          <div className={styles.constraintsSection}>
            <h4>Individual Constraints ({editingConstraints.length})</h4>

            {editingConstraints.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No constraints defined.</p>
                <p>Add constraints to control portfolio optimization.</p>
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add First Constraint
                </Button>
              </div>
            ) : (
              <Table
                columns={constraintColumns}
                data={editingConstraints}
                rowKey="id"
                size="small"
                bordered
                pagination={false}
              />
            )}
          </div>

          {/* Summary */}
          {editingConstraints.length > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Constraints:</span>
                  <span className={styles.statValue}>{editingConstraints.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Enabled:</span>
                  <span className={styles.statValue}>
                    {editingConstraints.filter(c => c.enabled).length}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Weight Constraints:</span>
                  <span className={styles.statValue}>
                    {editingConstraints.filter(c => c.type === 'weight').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Add Constraint Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Constraint"
        size="medium"
      >
        <div className={styles.addConstraintModal}>
          <div className={styles.modalRow}>
            <label className={styles.label}>Constraint Type</label>
            <select
              value={newConstraint.type}
              onChange={(e) => setNewConstraint({ ...newConstraint, type: e.target.value as any })}
              className={styles.select}
              required
            >
              {constraintTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalRow}>
            <label className={styles.label}>Target</label>
            <select
              value={newConstraint.target || ''}
              onChange={(e) => setNewConstraint({ ...newConstraint, target: e.target.value })}
              className={styles.select}
              required
            >
              <option value="">Select target...</option>
              {getTargetOptions(newConstraint.type || 'weight').map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalRow}>
            <label className={styles.label}>Operator</label>
            <select
              value={newConstraint.operator}
              onChange={(e) => setNewConstraint({ ...newConstraint, operator: e.target.value as any })}
              className={styles.select}
              required
            >
              {operatorTypes.map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalRow}>
            {newConstraint.operator === 'between' ? (
              <div className={styles.betweenInputs}>
                <Input
                  label="Minimum Value"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={newConstraint.value?.toString() || ''}
                  onChange={(e) => setNewConstraint({
                    ...newConstraint,
                    value: parseFloat(e.target.value) || 0
                  })}
                  required
                />
                <Input
                  label="Maximum Value"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={newConstraint.maxValue?.toString() || ''}
                  onChange={(e) => setNewConstraint({
                    ...newConstraint,
                    maxValue: parseFloat(e.target.value) || 0
                  })}
                  required
                />
              </div>
            ) : (
              <Input
                label="Value"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={newConstraint.value?.toString() || ''}
                onChange={(e) => setNewConstraint({
                  ...newConstraint,
                  value: parseFloat(e.target.value) || 0
                })}
                helperText={newConstraint.type === 'weight' ? 'Enter as decimal (e.g., 0.1 for 10%)' : ''}
                required
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddConstraint}
              disabled={!newConstraint.target || newConstraint.value === undefined}
              fullWidth
            >
              Add Constraint
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Add Constraint Group"
        size="small"
      >
        <div className={styles.addGroupModal}>
          <Input
            label="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name..."
            required
            autoFocus
          />

          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setShowGroupModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddGroup}
              disabled={!newGroupName.trim()}
              fullWidth
            >
              Create Group
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

// Helper functions
function generateConstraintDescription(constraint: Constraint): string {
  const target = constraint.target;
  const operator = constraint.operator;
  const value = formatPercentage(constraint.value, 1);
  const maxValue = constraint.maxValue ? formatPercentage(constraint.maxValue, 1) : '';

  switch (operator) {
    case 'min':
      return `${target} weight must be at least ${value}`;
    case 'max':
      return `${target} weight must not exceed ${value}`;
    case 'equal':
      return `${target} weight must equal ${value}`;
    case 'between':
      return `${target} weight must be between ${value} and ${maxValue}`;
    default:
      return `${target} constraint`;
  }
}

function formatConstraintText(constraint: Constraint): string {
  const operator = constraint.operator;
  const value = formatPercentage(constraint.value, 1);
  const maxValue = constraint.maxValue ? formatPercentage(constraint.maxValue, 1) : '';

  switch (operator) {
    case 'min':
      return `≥ ${value}`;
    case 'max':
      return `≤ ${value}`;
    case 'equal':
      return `= ${value}`;
    case 'between':
      return `${value} - ${maxValue}`;
    default:
      return value;
  }
}