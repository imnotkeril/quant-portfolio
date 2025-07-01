import React from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  'data-testid'?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error,
  success = false,
  helperText,
  icon,
  iconPosition = 'right',
  className,
  fullWidth = false,
  id,
  name,
  required = false,
  pattern,
  min,
  max,
  step,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  maxLength,
  'data-testid': dataTestId,
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={classNames(
        styles.container,
        { [styles.fullWidth]: fullWidth },
        className
      )}
    >
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={classNames(
        styles.inputWrapper,
        {
          [styles.disabled]: disabled,
          [styles.error]: !!error,
          [styles.success]: success,
          [styles.hasIconLeft]: icon && iconPosition === 'left',
          [styles.hasIconRight]: icon && iconPosition === 'right'
        }
      )}>
        {icon && iconPosition === 'left' && (
          <div className={styles.iconLeft}>{icon}</div>
        )}

        <input
          id={inputId}
          type={type}
          className={styles.input}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          name={name}
          required={required}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          maxLength={maxLength}
          data-testid={dataTestId}
        />

        {icon && iconPosition === 'right' && (
          <div className={styles.iconRight}>{icon}</div>
        )}
      </div>

      {(error || helperText) && (
        <div className={classNames(
          styles.helperText,
          { [styles.errorText]: !!error }
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};