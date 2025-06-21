// src/components/common/Select/Select.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import styles from './Select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string | number, option: SelectOption) => void;
  onSelect?: (value: string | number, option: SelectOption) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
  notFoundContent?: React.ReactNode;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  className?: string;
  dropdownClassName?: string;
  style?: React.CSSProperties;
  popupMatchSelectWidth?: boolean;
  maxTagCount?: number;
  mode?: 'multiple' | 'tags';
  tagRender?: (props: { label: string; value: string | number; onClose: () => void }) => React.ReactNode;
  suffixIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  autoClearSearchValue?: boolean;
  defaultActiveFirstOption?: boolean;
  listHeight?: number;
  virtual?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  defaultValue,
  placeholder = 'Please select',
  options = [],
  onChange,
  onSelect,
  onBlur,
  onFocus,
  disabled = false,
  loading = false,
  allowClear = false,
  showSearch = false,
  filterOption = true,
  notFoundContent = 'No data',
  size = 'middle',
  bordered = true,
  className,
  dropdownClassName,
  style,
  popupMatchSelectWidth = true,
  mode,
  suffixIcon,
  clearIcon,
  listHeight = 256,
  virtual = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [internalValue, setInternalValue] = useState<string | number | (string | number)[]>(
    value !== undefined ? value : defaultValue || (mode ? [] : '')
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const currentValue = value !== undefined ? value : internalValue;

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !searchValue) return options;

    return options.filter(option => {
      if (typeof filterOption === 'function') {
        return filterOption(searchValue, option);
      }
      if (filterOption === false) return true;

      return option.label.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [options, searchValue, showSearch, filterOption]);

  // Get display value
  const getDisplayValue = useCallback(() => {
    if (isMultiple) {
      const values = Array.isArray(currentValue) ? currentValue : [];
      return values.map(val => {
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      });
    }

    const option = options.find(opt => opt.value === currentValue);
    return option ? option.label : '';
  }, [currentValue, options, isMultiple]);

  // Handle option select
  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;

    let newValue: string | number | (string | number)[];

    if (isMultiple) {
      const values = Array.isArray(currentValue) ? currentValue : [];
      if (values.includes(option.value)) {
        newValue = values.filter(val => val !== option.value);
      } else {
        newValue = [...values, option.value];
      }
    } else {
      newValue = option.value;
      setIsOpen(false);
      setSearchValue('');
    }

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue as any, option);
    onSelect?.(option.value, option);
  }, [currentValue, isMultiple, value, onChange, onSelect]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = isMultiple ? [] : '';

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue as any, {} as SelectOption);
    setSearchValue('');
  }, [isMultiple, value, onChange]);

  // Handle remove tag (for multiple mode)
  const handleRemoveTag = useCallback((tagValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMultiple) return;

    const values = Array.isArray(currentValue) ? currentValue : [];
    const newValue = values.filter(val => val !== tagValue);

    if (value === undefined) {
      setInternalValue(newValue);
    }

    const option = options.find(opt => opt.value === tagValue);
    onChange?.(newValue as any, option || {} as SelectOption);
  }, [currentValue, isMultiple, value, options, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchValue('');
        setFocusedIndex(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;

      case 'Backspace':
        if (isMultiple && !searchValue && Array.isArray(currentValue) && currentValue.length > 0) {
          const lastValue = currentValue[currentValue.length - 1];
          handleRemoveTag(lastValue, e as any);
        }
        break;
    }
  }, [disabled, isOpen, focusedIndex, filteredOptions, handleSelect, isMultiple, searchValue, currentValue, handleRemoveTag]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchValue('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions]);

  const displayValue = getDisplayValue();
  const showClear = allowClear && !disabled && (
    isMultiple ? Array.isArray(currentValue) && currentValue.length > 0 : currentValue
  );

  return (
    <div
      ref={selectRef}
      className={classNames(
        styles.select,
        styles[size],
        {
          [styles.open]: isOpen,
          [styles.disabled]: disabled,
          [styles.bordered]: bordered,
          [styles.multiple]: isMultiple,
          [styles.focused]: isOpen,
        },
        className
      )}
      style={style}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      onFocus={onFocus}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-disabled={disabled}
    >
      <div className={styles.selector}>
        <div className={styles.selectionContainer}>
          {isMultiple ? (
            <div className={styles.selectionOverflow}>
              {Array.isArray(displayValue) && displayValue.map((label, index) => {
                const tagValue = Array.isArray(currentValue) ? currentValue[index] : '';
                return (
                  <span key={tagValue} className={styles.selectionItem}>
                    <span className={styles.selectionItemContent}>{label}</span>
                    <button
                      type="button"
                      className={styles.selectionItemRemove}
                      onClick={(e) => handleRemoveTag(tagValue, e)}
                      aria-label={`Remove ${label}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                );
              })}

              {showSearch && (
                <div className={styles.selectionSearch}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={styles.selectionSearchInput}
                    disabled={disabled}
                    style={{ width: Math.max(searchValue.length * 8 + 20, 20) }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {showSearch && isOpen ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className={styles.selectionSearchInput}
                  placeholder={displayValue || placeholder}
                  disabled={disabled}
                  autoFocus
                />
              ) : (
                <span className={styles.selectionText}>
                  {displayValue || <span className={styles.placeholder}>{placeholder}</span>}
                </span>
              )}
            </>
          )}
        </div>

        <div className={styles.selectionActions}>
          {loading && (
            <span className={styles.loadingIcon}>
              <svg className={styles.spinner} width="14" height="14" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
            </span>
          )}

          {showClear && (
            <button
              type="button"
              className={styles.clearIcon}
              onClick={handleClear}
              aria-label="Clear selection"
            >
              {clearIcon || (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          )}

          <span className={classNames(styles.arrow, { [styles.open]: isOpen })}>
            {suffixIcon || (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            )}
          </span>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={classNames(styles.dropdown, dropdownClassName)}
          style={{
            width: popupMatchSelectWidth ? '100%' : 'auto',
            maxHeight: listHeight,
          }}
        >
          <div className={styles.dropdownInner}>
            {filteredOptions.length > 0 ? (
              <ul className={styles.optionList} role="listbox">
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    className={classNames(styles.option, {
                      [styles.optionSelected]: isMultiple
                        ? Array.isArray(currentValue) && currentValue.includes(option.value)
                        : currentValue === option.value,
                      [styles.optionDisabled]: option.disabled,
                      [styles.optionFocused]: index === focusedIndex,
                    })}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={
                      isMultiple
                        ? Array.isArray(currentValue) && currentValue.includes(option.value)
                        : currentValue === option.value
                    }
                    aria-disabled={option.disabled}
                  >
                    <div className={styles.optionContent}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      {isMultiple && Array.isArray(currentValue) && currentValue.includes(option.value) && (
                        <span className={styles.optionCheck}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.notFound}>
                {notFoundContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};