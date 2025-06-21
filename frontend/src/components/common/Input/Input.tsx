import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  type?: InputType;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  className?: string;
  error?: string;
  help?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  multiple?: boolean;
  multiline?: boolean; // ДОБАВЛЕНО: поддержка textarea
  rows?: number; // ДОБАВЛЕНО: количество строк для textarea
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  'data-testid'?: string;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      type = 'text',
      disabled = false,
      required = false,
      readOnly = false,
      autoFocus = false,
      autoComplete,
      className,
      error,
      help,
      size = 'medium',
      variant = 'default',
      prefix,
      suffix,
      min,
      max,
      step,
      maxLength,
      minLength,
      pattern,
      multiple = false,
      multiline = false,
      rows = 3,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      'data-testid': testId,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && value !== '';

    const containerClasses = classNames(
      styles.inputContainer,
      styles[`size-${size}`],
      styles[`variant-${variant}`],
      {
        [styles.focused]: isFocused,
        [styles.disabled]: disabled,
        [styles.error]: !!error,
        [styles.hasValue]: hasValue,
        [styles.hasPrefix]: !!prefix,
        [styles.hasSuffix]: !!suffix,
        [styles.multiline]: multiline,
      },
      className
    );

    const inputClasses = classNames(styles.input, {
      [styles.withPrefix]: !!prefix,
      [styles.withSuffix]: !!suffix,
    });

    const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(event);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(event);
      }
    };

    const commonProps = {
      placeholder,
      value,
      defaultValue,
      disabled,
      required,
      readOnly,
      autoFocus,
      autoComplete,
      maxLength,
      minLength,
      className: inputClasses,
      onChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown,
      onKeyUp,
      'data-testid': testId,
    };

    const renderInput = () => {
      if (multiline) {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            {...commonProps}
          />
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          multiple={multiple}
          {...commonProps}
        />
      );
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {prefix && <div className={styles.prefix}>{prefix}</div>}
          {renderInput()}
          {suffix && <div className={styles.suffix}>{suffix}</div>}
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {help && !error && <div className={styles.helpMessage}>{help}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;