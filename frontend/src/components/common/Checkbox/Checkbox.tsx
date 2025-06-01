/**
 * Checkbox Component
 * Universal checkbox component with custom styling
 */
import React, { useId } from 'react';
import classNames from 'classnames';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'small' | 'medium' | 'large';

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: CheckboxSize;
  label?: string;
  helperText?: string;
  error?: string | boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  'data-testid'?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  indeterminate = false,
  size = 'medium',
  label,
  helperText,
  error,
  className,
  id: providedId,
  name,
  value,
  'data-testid': testId,
}) => {
  const generatedId = useId();
  const checkboxId = providedId || generatedId;

  const hasError = !!error;
  const errorMessage = typeof error === 'string' ? error : '';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(event);
  };

  const containerClasses = classNames(
    styles.container,
    styles[size],
    {
      [styles.disabled]: disabled,
      [styles.error]: hasError,
    },
    className
  );

  const checkboxClasses = classNames(
    styles.checkbox,
    {
      [styles.checked]: checked,
      [styles.indeterminate]: indeterminate,
      [styles.disabled]: disabled,
      [styles.error]: hasError,
    }
  );

  return (
    <div className={containerClasses}>
      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          id={checkboxId}
          className={styles.input}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          value={value}
          data-testid={testId}
        />

        <div className={checkboxClasses}>
          {checked && (
            <svg
              className={styles.checkIcon}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}

          {indeterminate && (
            <svg
              className={styles.indeterminateIcon}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>

        {label && (
          <label htmlFor={checkboxId} className={styles.label}>
            {label}
          </label>
        )}
      </div>

      {(errorMessage || helperText) && (
        <div className={classNames(
          styles.helperText,
          { [styles.errorText]: hasError }
        )}>
          {errorMessage || helperText}
        </div>
      )}
    </div>
  );
};

export default Checkbox;