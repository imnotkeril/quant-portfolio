/**
 * DateRangePicker Component
 * Date range selection component
 */
import React, { useState } from 'react';
import { Input } from '../Input/Input';
import styles from './DateRangePicker.module.css';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange?: (startDate: string, endDate: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate = '',
  endDate = '',
  onChange,
  placeholder = 'Select date range...',
  disabled = false,
  className,
  'data-testid': testId,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    onChange?.(newStartDate, localEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    onChange?.(localStartDate, newEndDate);
  };

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      <div className={styles.dateInputs}>
        <div className={styles.inputGroup}>
          <Input
            label="Start Date"
            value={localStartDate}
            onChange={handleStartDateChange}
            disabled={disabled}
            placeholder="YYYY-MM-DD"
          />
        </div>

        <div className={styles.separator}>
          <span>to</span>
        </div>

        <div className={styles.inputGroup}>
          <Input
            label="End Date"
            value={localEndDate}
            onChange={handleEndDateChange}
            disabled={disabled}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;