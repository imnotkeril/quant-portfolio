// src/components/common/Input/Input.tsx - COMPLETE IMPLEMENTATION
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

export type InputSize = 'small' | 'middle' | 'large';
export type InputStatus = 'error' | 'warning' | 'success';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  size?: InputSize;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  allowClear?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  status?: InputStatus;
  bordered?: boolean;
  showCount?: boolean;
  count?: {
    show?: boolean;
    max?: number;
    strategy?: (value: string) => number;
    exceedFormatter?: (value: string, config: { max: number }) => string;
  };
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  title?: string;
  inputMode?: 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
  setSelectionRange: (start: number, end: number) => void;
  input: HTMLInputElement | null;
}

export const Input = forwardRef<InputRef, InputProps>(({
  type = 'text',
  size = 'middle',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  maxLength,
  minLength,
  autoComplete,
  autoFocus = false,
  allowClear = false,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  status,
  bordered = true,
  showCount = false,
  count,
  onChange,
  onBlur,
  onFocus,
  onPressEnter,
  onKeyDown,
  onKeyUp,
  onClear,
  className,
  style,
  id,
  name,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId,
  min,
  max,
  step,
  pattern,
  title,
  inputMode,
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const isControlled = value !== undefined;

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select(),
    setSelectionRange: (start: number, end: number) => {
      inputRef.current?.setSelectionRange(start, end);
    },
    input: inputRef.current,
  }));

  // Calculate character count
  const getCharacterCount = (): number => {
    if (count?.strategy) {
      return count.strategy(currentValue);
    }
    return currentValue.length;
  };

  const characterCount = getCharacterCount();
  const maxCount = count?.max || maxLength;
  const isExceeded = maxCount !== undefined && characterCount > maxCount;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(e);
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
    onKeyDown?.(e);
  };

  // Handle clear
  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }

    // Create synthetic event for onChange
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange?.(syntheticEvent);
    onClear?.();
    inputRef.current?.focus();
  };

  // Show clear button
  const showClearButton = allowClear && currentValue && !disabled && !readOnly;

  // Count display
  const countFormatter = count?.exceedFormatter;
  const displayCount = isExceeded && countFormatter
    ? countFormatter(currentValue, { max: maxCount! })
    : `${characterCount}${maxCount !== undefined ? `/${maxCount}` : ''}`;

  // Build class names
  const wrapperClasses = classNames(
    styles.inputWrapper,
    styles[size],
    {
      [styles.focused]: focused,
      [styles.disabled]: disabled,
      [styles.readOnly]: readOnly,
      [styles.bordered]: bordered,
      [styles.hasPrefix]: !!prefix,
      [styles.hasSuffix]: !!suffix || showClearButton,
      [styles.hasAddonBefore]: !!addonBefore,
      [styles.hasAddonAfter]: !!addonAfter,
      [styles.error]: status === 'error',
      [styles.warning]: status === 'warning',
      [styles.success]: status === 'success',
      [styles.exceeded]: isExceeded,
    },
    className
  );

  const inputElement = (
    <input
      ref={inputRef}
      type={type}
      className={styles.input}
      placeholder={placeholder}
      value={currentValue}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      minLength={minLength}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={onKeyUp}
      id={id}
      name={name}
      required={required}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-testid={dataTestId}
      min={min}
      max={max}
      step={step}
      pattern={pattern}
      title={title}
      inputMode={inputMode}
    />
  );

  const inputWithAffixes = (
    <div className={styles.inputInner}>
      {prefix && (
        <span className={styles.inputPrefix}>
          {prefix}
        </span>
      )}

      {inputElement}

      {(suffix || showClearButton) && (
        <span className={styles.inputSuffix}>
          {showClearButton && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {suffix}
        </span>
      )}
    </div>
  );

  const inputWithAddons = (
    <>
      {addonBefore && (
        <span className={styles.inputAddonBefore}>
          {addonBefore}
        </span>
      )}

      {inputWithAffixes}

      {addonAfter && (
        <span className={styles.inputAddonAfter}>
          {addonAfter}
        </span>
      )}
    </>
  );

  return (
    <div className={styles.inputContainer} style={style}>
      <div className={wrapperClasses}>
        {inputWithAddons}
      </div>

      {(showCount || count?.show) && (
        <div className={classNames(styles.inputCount, {
          [styles.countExceeded]: isExceeded,
        })}>
          {displayCount}
        </div>
      )}
    </div>
  );
});

export default Input;