/**
 * ScenarioSelector Component
 * Allows users to select and manage scenarios for analysis
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Card } from '../../common/Card/Card';
import { Modal } from '../../common/Modal/Modal';
import { loadScenarios } from '../../../store/scenarios/actions';
import {
  setSelectedScenarios,
  addCustomScenario
} from '../../../store/scenarios/reducer';
import {
  selectAvailableScenarios,
  selectSelectedScenarios,
  selectScenariosLoading,
  selectCustomScenarios,
  selectScenariosError
} from '../../../store/scenarios/selectors';
import { CustomScenario } from '../../../store/scenarios/types';
import styles from './ScenarioSelector.module.css';

interface ScenarioSelectorProps {
  className?: string;
  onScenarioChange?: (scenarios: string[]) => void;
  'data-testid'?: string;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  className,
  onScenarioChange,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch();
  const availableScenarios = useSelector(selectAvailableScenarios);
  const selectedScenarios = useSelector(selectSelectedScenarios);
  const customScenarios = useSelector(selectCustomScenarios);
  const loading = useSelector(selectScenariosLoading);
  const error = useSelector(selectScenariosError);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomScenarioModal, setShowCustomScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');

  // Load scenarios on mount
  useEffect(() => {
    dispatch(loadScenarios() as any);
  }, [dispatch]);

  // Notify parent of changes
  useEffect(() => {
    onScenarioChange?.(selectedScenarios);
  }, [selectedScenarios, onScenarioChange]);

  // Filter scenarios based on search
  const filteredScenarios = availableScenarios.filter(scenario =>
    scenario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customScenariosList = Object.values(customScenarios);
  const filteredCustomScenarios = customScenariosList.filter(scenario =>
    scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScenarioToggle = (scenarioName: string) => {
    const newSelected = selectedScenarios.includes(scenarioName)
      ? selectedScenarios.filter(s => s !== scenarioName)
      : [...selectedScenarios, scenarioName];

    dispatch(setSelectedScenarios(newSelected));
  };

  const handleSelectAll = () => {
    const allScenarios = [
      ...filteredScenarios,
      ...filteredCustomScenarios.map(s => s.name)
    ];
    dispatch(setSelectedScenarios(allScenarios));
  };

  const handleClearAll = () => {
    dispatch(setSelectedScenarios([]));
  };

  const handleCreateCustomScenario = () => {
    if (!newScenarioName.trim()) return;

    const customScenario: CustomScenario = {
      id: `custom_${Date.now()}`,
      name: newScenarioName.trim(),
      description: newScenarioDescription.trim(),
      initialImpact: {},
      leadsTo: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addCustomScenario(customScenario));
    setShowCustomScenarioModal(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
  };

  const isSelected = (scenarioName: string) => selectedScenarios.includes(scenarioName);

  return (
    <Card
      className={classNames(styles.container, className)}
      title="Select Scenarios"
      data-testid={testId}
    >
      {/* Header Controls */}
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <Input
            type="search"
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            }
            className={styles.searchInput}
          />
        </div>

        <div className={styles.actionSection}>
          <Button
            variant="text"
            size="small"
            onClick={handleSelectAll}
            disabled={loading}
          >
            Select All
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={handleClearAll}
            disabled={loading || selectedScenarios.length === 0}
          >
            Clear All
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowCustomScenarioModal(true)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Create Custom
          </Button>
        </div>
      </div>

      {/* Selected Count */}
      {selectedScenarios.length > 0 && (
        <div className={styles.selectedCount}>
          {selectedScenarios.length} scenario{selectedScenarios.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Error Display */}
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

      {/* Scenarios List */}
      <div className={styles.scenariosContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading scenarios...</span>
          </div>
        ) : (
          <>
            {/* Predefined Scenarios */}
            {filteredScenarios.length > 0 && (
              <div className={styles.scenarioGroup}>
                <h4 className={styles.groupTitle}>Predefined Scenarios</h4>
                <div className={styles.scenariosList}>
                  {filteredScenarios.map((scenario) => (
                    <div
                      key={scenario}
                      className={classNames(
                        styles.scenarioItem,
                        { [styles.selected]: isSelected(scenario) }
                      )}
                      onClick={() => handleScenarioToggle(scenario)}
                    >
                      <div className={styles.scenarioCheckbox}>
                        <input
                          type="checkbox"
                          checked={isSelected(scenario)}
                          onChange={() => handleScenarioToggle(scenario)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className={styles.scenarioContent}>
                        <div className={styles.scenarioName}>{scenario}</div>
                        <div className={styles.scenarioType}>Predefined</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Scenarios */}
            {filteredCustomScenarios.length > 0 && (
              <div className={styles.scenarioGroup}>
                <h4 className={styles.groupTitle}>Custom Scenarios</h4>
                <div className={styles.scenariosList}>
                  {filteredCustomScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={classNames(
                        styles.scenarioItem,
                        { [styles.selected]: isSelected(scenario.name) }
                      )}
                      onClick={() => handleScenarioToggle(scenario.name)}
                    >
                      <div className={styles.scenarioCheckbox}>
                        <input
                          type="checkbox"
                          checked={isSelected(scenario.name)}
                          onChange={() => handleScenarioToggle(scenario.name)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className={styles.scenarioContent}>
                        <div className={styles.scenarioName}>{scenario.name}</div>
                        <div className={styles.scenarioDescription}>{scenario.description}</div>
                        <div className={styles.scenarioType}>Custom</div>
                      </div>

                      <div className={styles.scenarioActions}>
                        <Button
                          variant="text"
                          size="small"
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open edit modal
                          }}
                        >
                          {null}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredScenarios.length === 0 && filteredCustomScenarios.length === 0 && !loading && (
              <div className={styles.emptyState}>
                {searchTerm ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No scenarios found matching "{searchTerm}"</p>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p>No scenarios available</p>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => dispatch(loadScenarios() as any)}
                    >
                      Reload Scenarios
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Custom Scenario Modal */}
      <Modal
        isOpen={showCustomScenarioModal}
        onClose={() => setShowCustomScenarioModal(false)}
        title="Create Custom Scenario"
        size="medium"
      >
        <div className={styles.modalContent}>
          <Input
            label="Scenario Name"
            placeholder="Enter scenario name..."
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            required
            className={styles.modalInput}
          />

          <Input
            label="Description"
            placeholder="Describe the scenario..."
            value={newScenarioDescription}
            onChange={(e) => setNewScenarioDescription(e.target.value)}
            className={styles.modalInput}
          />
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={() => setShowCustomScenarioModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleCreateCustomScenario}
            disabled={!newScenarioName.trim()}
          >
            Create Scenario
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default ScenarioSelector;