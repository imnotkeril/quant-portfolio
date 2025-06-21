/**
 * TimeframeSelector Component
 * Button group and date picker for selecting analysis timeframes
 */
import React, { useState } from 'react';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Card } from '../../common/Card/Card';
import { Modal } from '../../common/Modal/Modal';
import styles from './TimeframeSelector.module.css';

export interface TimeframeOption {
  value: string;
  label: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface TimeframeSelectorProps {
  value: string;
  onChange: (timeframe: string, startDate?: string, endDate?: string) => void;
  options?: TimeframeOption[];
  allowCustom?: boolean;
  showCard?: boolean;
  title?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

const DEFAULT_TIMEFRAMES: TimeframeOption[] = [
  { value: '1M', label: '1M', description: '1 Month' },
  { value: '3M', label: '3M', description: '3 Months' },
  { value: '6M', label: '6M', description: '6 Months' },
  { value: '1Y', label: '1Y', description: '1 Year' },
  { value: '2Y', label: '2Y', description: '2 Years' },
  { value: '5Y', label: '5Y', description: '5 Years' },
  { value: 'YTD', label: 'YTD', description: 'Year to Date' },
  { value: 'ALL', label: 'ALL', description: 'All Available Data' },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  value,
  onChange,
  options = DEFAULT_TIMEFRAMES,
  allowCustom = true,
  showCard = false,
  title = 'Time Period',
  disabled = false,
  className,
  'data-testid': testId,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handlePresetClick = (timeframe: string) => {
    if (disabled) return;

    const option = options.find(opt => opt.value === timeframe);
    if (option) {
      onChange(timeframe, option.startDate, option.endDate);
    } else {
      onChange(timeframe);
    }
  };

  const handleCustomClick = () => {
    if (disabled) return;

    // Set default dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    setCustomEndDate(endDate.toISOString().split('T')[0]);
    setCustomStartDate(startDate.toISOString().split('T')[0]);
    setShowCustomModal(true);
  };

  const handleCustomSubmit = () => {
    if (customStartDate && customEndDate) {
      onChange('CUSTOM', customStartDate, customEndDate);
      setShowCustomModal(false);
    }
  };

  const handleCustomCancel = () => {
    setShowCustomModal(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const validateDates = () => {
    if (!customStartDate || !customEndDate) return false;

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const today = new Date();

    return start <= end && end <= today;
  };

  const getDateRangeDisplay = () => {
    if (value === 'CUSTOM' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString();
      const end = new Date(customEndDate).toLocaleDateString();
      return `${start} - ${end}`;
    }

    const option = options.find(opt => opt.value === value);
    return option?.description || value;
  };

  const isCustomSelected = value === 'CUSTOM';

  const selector = (
    <div className={styles.container} data-testid={testId}>
      <div className={styles.buttonGroup}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'primary' : 'outline'}
            size="small"
            onClick={() => handlePresetClick(option.value)}
            disabled={disabled}
            className={styles.timeframeButton}
            aria-label={option.description}
          >
            {option.label}
          </Button>
        ))}

        {allowCustom && (
          <Button
            variant={isCustomSelected ? 'primary' : 'outline'}
            size="small"
            onClick={handleCustomClick}
            disabled={disabled}
            className={styles.customButton}
            aria-label="Custom date range"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Custom
          </Button>
        )}
      </div>

      {isCustomSelected && (
        <div className={styles.customRange}>
          <span className={styles.customRangeText}>
            {getDateRangeDisplay()}
          </span>
        </div>
      )}

      {/* Custom Date Range Modal */}
      <Modal
        isOpen={showCustomModal}
        onClose={handleCustomCancel}
        title="Select Custom Date Range"
        size="small"
        footer={
          <>
            <Button variant="outline" onClick={handleCustomCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCustomSubmit}
              disabled={!validateDates()}
            >
              Apply
            </Button>
          </>
        }
      >
        <div className={styles.customDateInputs}>
          <Input
            type="text"
            label="Start Date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            fullWidth
          />

          <Input
            type="text"
            label="End Date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            fullWidth
          />

          {customStartDate && customEndDate && !validateDates() && (
            <div className={styles.dateError}>
              End date must be after start date and not in the future.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );

  if (showCard) {
    return (
      <Card title={title} className={className}>
        {selector}
      </Card>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {selector}
    </div>
  );
};

export default TimeframeSelector;