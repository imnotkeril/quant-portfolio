/**
 * ScenarioChain Component
 * Allows creation and visualization of scenario chains
 */
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Card } from '../../common/Card/Card';
import { Modal } from '../../common/Modal/Modal';
import { Table, TableColumn } from '../../common/Table/Table';
import {
  createChain,
  modifyChain,
  deleteChain
} from '../../../store/scenarios/actions';
import {
  setSelectedChain
} from '../../../store/scenarios/reducer';
import {
  selectScenarioChains,
  selectSelectedChain,
  selectChainManagementLoading,
  selectChainManagementError,
  selectAvailableScenarios
} from '../../../store/scenarios/selectors';
import { ScenarioChainRequest, ScenarioEvent } from '../../../types/scenarios';
import { formatPercentage } from '../../../utils/formatters';
import styles from './ScenarioChain.module.css';

interface ScenarioChainProps {
  className?: string;
  'data-testid'?: string;
}

interface ChainFormData {
  name: string;
  description: string;
  initialImpact: Record<string, number>;
  leadsTo: ScenarioEvent[];
}

export const ScenarioChain: React.FC<ScenarioChainProps> = ({
  className,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const scenarioChains = useSelector(selectScenarioChains);
  const selectedChain = useSelector(selectSelectedChain);
  const availableScenarios = useSelector(selectAvailableScenarios);
  const loading = useSelector(selectChainManagementLoading);
  const error = useSelector(selectChainManagementError);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChain, setEditingChain] = useState<string | null>(null);

  const [formData, setFormData] = useState<ChainFormData>({
    name: '',
    description: '',
    initialImpact: {},
    leadsTo: [],
  });

  const chains = Object.entries(scenarioChains).map(([chainName, data]) => ({
    chainName,
    ...data.scenarioChain,
  }));

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      initialImpact: {},
      leadsTo: [],
    });
  }, []);

  // Handle create chain
  const handleCreateChain = () => {
    if (!formData.name.trim()) return;

    const request: ScenarioChainRequest = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      initialImpact: formData.initialImpact,
      leadsTo: formData.leadsTo,
    };

    dispatch(createChain({ request }) as any);
    setShowCreateModal(false);
    resetForm();
  };

  // Handle edit chain
  const handleEditChain = (chainName: string) => {
    const chainData = scenarioChains[chainName]?.scenarioChain;
    if (!chainData) return;

    setFormData({
      name: chainData.name,
      description: chainData.description || '',
      initialImpact: chainData.initialImpact,
      leadsTo: chainData.leadsTo,
    });
    setEditingChain(chainName);
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingChain || !formData.name.trim()) return;

    dispatch(modifyChain({
      request: {
        name: editingChain,
        initialImpact: formData.initialImpact,
        leadsTo: formData.leadsTo,
      }
    }) as any);
    setShowEditModal(false);
    setEditingChain(null);
    resetForm();
  };

  // Handle delete chain
  const handleDeleteChain = (chainName: string) => {
    if (window.confirm(`Are you sure you want to delete the chain "${chainName}"?`)) {
      dispatch(deleteChain({ name: chainName }) as any);
    }
  };

  // Handle select chain
  const handleSelectChain = (chainName: string) => {
    dispatch(setSelectedChain(selectedChain === chainName ? null : chainName));
  };

  // Add scenario event to chain
  const addScenarioEvent = () => {
    setFormData(prev => ({
      ...prev,
      leadsTo: [
        ...prev.leadsTo,
        {
          scenario: '',
          probability: 0.5,
          delay: 1,
          magnitudeModifier: 1.0,
        }
      ]
    }));
  };

  // Update scenario event
  const updateScenarioEvent = (index: number, updates: Partial<ScenarioEvent>) => {
    setFormData(prev => ({
      ...prev,
      leadsTo: prev.leadsTo.map((event, i) =>
        i === index ? { ...event, ...updates } : event
      )
    }));
  };

  // Remove scenario event
  const removeScenarioEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      leadsTo: prev.leadsTo.filter((_, i) => i !== index)
    }));
  };

  // Table columns for chains
  const tableColumns: TableColumn[] = [
    {
      key: 'chainName',
      title: 'Chain Name',
      dataIndex: 'chainName',
      render: (value: string) => (
        <div className={styles.chainName}>
          {value}
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      render: (value: string) => (
        <div className={styles.chainDescription}>
          {value || 'No description'}
        </div>
      ),
    },
    {
      key: 'complexity',
      title: 'Complexity',
      render: (_, record: any) => (
        <div className={styles.complexity}>
          {record.leadsTo?.length || 0} scenarios
        </div>
      ),
    },
    {
      key: 'initialImpact',
      title: 'Initial Impact',
      render: (_, record: any) => {
        const impacts = Object.values(record.initialImpact || {}) as number[];
        const avgImpact = impacts.length > 0
          ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length
          : 0;

        return (
          <div className={classNames(
            styles.impactValue,
            {
              [styles.positive]: avgImpact >= 0,
              [styles.negative]: avgImpact < 0,
            }
          )}>
            {formatPercentage(avgImpact)}
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: any) => (
        <div className={styles.chainActions}>
          <Button
            variant="text"
            size="small"
            onClick={() => handleEditChain(record.chainName)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            }
          >
            {null}
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={() => handleDeleteChain(record.chainName)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              </svg>
            }
          >
            {null}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={classNames(styles.container, className)} data-testid={testId}>
      {/* Header */}
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Scenario Chains</h2>
            <p className={styles.subtitle}>
              Create and manage complex scenario chains with interconnected events
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Create Chain
          </Button>
        </div>

        {error && (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}
      </Card>

      {/* Chains Table */}
      <Card className={styles.tableCard} title="Existing Chains">
        {chains.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="7"/>
              <path d="m13 13 8 8"/>
            </svg>
            <h3>No Scenario Chains</h3>
            <p>Create your first scenario chain to model complex event sequences</p>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
            >
              Create Chain
            </Button>
          </div>
        ) : (
          <Table
            data={chains}
            columns={tableColumns}
            rowKey="chainName"
            loading={loading}
            pagination={{ pageSize: 10, current: 1, total: chains.length }}
            onRowClick={(record) => handleSelectChain(record.chainName)}
            className={styles.chainsTable}
          />
        )}
      </Card>

      {/* Selected Chain Details */}
      {selectedChain && scenarioChains[selectedChain] && (
        <Card className={styles.detailsCard} title={`Chain: ${selectedChain}`}>
          <div className={styles.chainDetails}>
            <div className={styles.chainInfo}>
              <h4>Chain Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Description:</span>
                  <span className={styles.infoValue}>
                    {scenarioChains[selectedChain].scenarioChain.description || 'No description'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Events Count:</span>
                  <span className={styles.infoValue}>
                    {scenarioChains[selectedChain].scenarioChain.leadsTo?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Chain Visualization */}
            <div className={styles.chainVisualization}>
              <h4>Event Chain</h4>
              <div className={styles.eventFlow}>
                <div className={styles.eventNode}>
                  <div className={styles.eventName}>Initial Event</div>
                  <div className={styles.eventType}>Starting Point</div>
                </div>

                {scenarioChains[selectedChain].scenarioChain.leadsTo?.map((event, index) => (
                  <React.Fragment key={index}>
                    <div className={styles.eventArrow}>
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                        <path d="M0 8h20M16 4l4 4-4 4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <div className={styles.eventProbability}>
                        {formatPercentage(event.probability)}
                      </div>
                    </div>

                    <div className={styles.eventNode}>
                      <div className={styles.eventName}>{event.scenario}</div>
                      <div className={styles.eventDetails}>
                        <span>Delay: {event.delay} periods</span>
                        <span>Magnitude: {event.magnitudeModifier}x</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Chain Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Scenario Chain"
        size="large"
      >
        <div className={styles.modalContent}>
          <div className={styles.formSection}>
            <Input
              label="Chain Name"
              placeholder="Enter chain name..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className={styles.formInput}
            />

            <Input
              label="Description"
              placeholder="Describe the scenario chain..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={styles.formInput}
            />
          </div>

          {/* Scenario Events */}
          <div className={styles.eventsSection}>
            <div className={styles.eventsHeader}>
              <h4>Scenario Events</h4>
              <Button
                variant="secondary"
                size="small"
                onClick={addScenarioEvent}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                }
              >
                Add Event
              </Button>
            </div>

            <div className={styles.eventsList}>
              {formData.leadsTo.map((event, index) => (
                <div key={index} className={styles.eventForm}>
                  <div className={styles.eventFormHeader}>
                    <span>Event {index + 1}</span>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => removeScenarioEvent(index)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      }
                    >
                      {null}
                    </Button>
                  </div>

                  <div className={styles.eventFormGrid}>
                    <div className={styles.eventFormField}>
                      <label>Scenario</label>
                      <select
                        value={event.scenario}
                        onChange={(e) => updateScenarioEvent(index, { scenario: e.target.value })}
                        className={styles.eventSelect}
                      >
                        <option value="">Select scenario...</option>
                        {availableScenarios.map(scenario => (
                          <option key={scenario} value={scenario}>
                            {scenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Probability</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={event.probability}
                        onChange={(e) => updateScenarioEvent(index, { probability: parseFloat(e.target.value) || 0 })}
                        className={styles.eventInput}
                      />
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Delay (periods)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={event.delay}
                        onChange={(e) => updateScenarioEvent(index, { delay: parseInt(e.target.value) || 0 })}
                        className={styles.eventInput}
                      />
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Magnitude Modifier</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={event.magnitudeModifier}
                        onChange={(e) => updateScenarioEvent(index, { magnitudeModifier: parseFloat(e.target.value) || 1 })}
                        className={styles.eventInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.leadsTo.length === 0 && (
                <div className={styles.noEvents}>
                  <p>No events added. Click "Add Event" to create your first scenario event.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleCreateChain}
            disabled={!formData.name.trim() || loading}
            loading={loading}
          >
            Create Chain
          </Button>
        </div>
      </Modal>

      {/* Edit Chain Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingChain(null);
          resetForm();
        }}
        title={`Edit Chain: ${editingChain}`}
        size="large"
      >
        <div className={styles.modalContent}>
          <div className={styles.formSection}>
            <div className={styles.editInfo}>
              <p>Editing chain: <strong>{editingChain}</strong></p>
              <p>Note: Chain name and description cannot be modified. Only events can be updated.</p>
            </div>
          </div>

          {/* Scenario Events */}
          <div className={styles.eventsSection}>
            <div className={styles.eventsHeader}>
              <h4>Scenario Events</h4>
              <Button
                variant="secondary"
                size="small"
                onClick={addScenarioEvent}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                }
              >
                Add Event
              </Button>
            </div>

            <div className={styles.eventsList}>
              {formData.leadsTo.map((event, index) => (
                <div key={index} className={styles.eventForm}>
                  <div className={styles.eventFormHeader}>
                    <span>Event {index + 1}</span>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => removeScenarioEvent(index)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      }
                    >
                      {null}
                    </Button>
                  </div>

                  <div className={styles.eventFormGrid}>
                    <div className={styles.eventFormField}>
                      <label>Scenario</label>
                      <select
                        value={event.scenario}
                        onChange={(e) => updateScenarioEvent(index, { scenario: e.target.value })}
                        className={styles.eventSelect}
                      >
                        <option value="">Select scenario...</option>
                        {availableScenarios.map(scenario => (
                          <option key={scenario} value={scenario}>
                            {scenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Probability</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={event.probability}
                        onChange={(e) => updateScenarioEvent(index, { probability: parseFloat(e.target.value) || 0 })}
                        className={styles.eventInput}
                      />
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Delay (periods)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={event.delay}
                        onChange={(e) => updateScenarioEvent(index, { delay: parseInt(e.target.value) || 0 })}
                        className={styles.eventInput}
                      />
                    </div>

                    <div className={styles.eventFormField}>
                      <label>Magnitude Modifier</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={event.magnitudeModifier}
                        onChange={(e) => updateScenarioEvent(index, { magnitudeModifier: parseFloat(e.target.value) || 1 })}
                        className={styles.eventInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.leadsTo.length === 0 && (
                <div className={styles.noEvents}>
                  <p>No events in this chain. Click "Add Event" to create scenario events.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditingChain(null);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSaveEdit}
            disabled={loading}
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ScenarioChain;