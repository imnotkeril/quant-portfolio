/**
 * Input Component
 * Universal input component with validation states and icons
 */
import React, { forwardRef, useState, useId } from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  type?: InputType;
  size?: InputSize;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | boolean;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  'data-testid'?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  size = 'medium',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  readOnly = false,
  error,
  success = false,
  helperText,
  icon,
  iconPosition = 'left',
  className,
  fullWidth = false,
  required = false,
  autoFocus = false,
  autoComplete,
  'data-testid': testId,
  id: providedId,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const errorMessage = typeof error === 'string' ? error : '';

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const containerClasses = classNames(
    styles.container,
    {
      [styles.fullWidth]: fullWidth,
      [styles.disabled]: disabled,
      [styles.focused]: isFocused,
      [styles.error]: hasError,
      [styles.success]: success && !hasError,
    },
    className
  );

  const inputWrapperClasses = classNames(
    styles.inputWrapper,
    styles[size],
    {
      [styles.hasIconLeft]: icon && iconPosition === 'left',
      [styles.hasIconRight]: icon && iconPosition === 'right' || type === 'password',
      [styles.disabled]: disabled,
      [styles.readOnly]: readOnly,
      [styles.error]: hasError,
      [styles.success]: success && !hasError,
    }
  );

  const inputClasses = classNames(styles.input);

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={inputWrapperClasses}>
        {icon && iconPosition === 'left' && (
          <div className={styles.iconLeft}>{icon}</div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          data-testid={testId}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {icon && iconPosition === 'right' && type !== 'password' && (
          <div className={styles.iconRight}>{icon}</div>
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
});

Input.displayName = 'Input';

export default Input;