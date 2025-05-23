/**
 * Select Component
 * Custom select dropdown with search and multi-select capabilities
 */
import React, { useState, useRef, useEffect, useId } from 'react';
import classNames from 'classnames';
import { useClickOutside } from '../../../hooks/useClickOutside';
import styles from './Select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export type SelectSize = 'small' | 'medium' | 'large';

interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  error?: string | boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  maxHeight?: number;
  'data-testid'?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select option...',
  size = 'medium',
  disabled = false,
  error,
  success = false,
  helperText,
  label,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  loading = false,
  className,
  fullWidth = false,
  maxHeight = 200,
  'data-testid': testId,
  id: providedId,
}) => {
  const generatedId = useId();
  const selectId = providedId || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalValue, setInternalValue] = useState<string | number | (string | number)[]>(
    value !== undefined ? value : defaultValue || (multiple ? [] : '')
  );

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasError = !!error;
  const errorMessage = typeof error === 'string' ? error : '';

  // Close dropdown when clicking outside
  useClickOutside(selectRef, () => {
    setIsOpen(false);
    setSearchTerm('');
  });

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const currentValue = value !== undefined ? value : internalValue;

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected options for display
  const getSelectedOptions = (): SelectOption[] => {
    if (multiple && Array.isArray(currentValue)) {
      return options.filter(option => currentValue.includes(option.value));
    }
    const selectedOption = options.find(option => option.value === currentValue);
    return selectedOption ? [selectedOption] : [];
  };

  const selectedOptions = getSelectedOptions();

  // Handle option selection
  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    let newValue: string | number | (string | number)[];

    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      if (currentArray.includes(option.value)) {
        newValue = currentArray.filter(v => v !== option.value);
      } else {
        newValue = [...currentArray, option.value];
      }
    } else {
      newValue = option.value;
      setIsOpen(false);
      setSearchTerm('');
    }

    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : '';
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault();
          // Could implement option navigation here
        }
        break;
    }
  };

  const containerClasses = classNames(
    styles.container,
    {
      [styles.fullWidth]: fullWidth,
      [styles.disabled]: disabled,
      [styles.error]: hasError,
      [styles.success]: success && !hasError,
    },
    className
  );

  const selectClasses = classNames(
    styles.select,
    styles[size],
    {
      [styles.open]: isOpen,
      [styles.disabled]: disabled,
      [styles.error]: hasError,
      [styles.success]: success && !hasError,
      [styles.hasValue]: selectedOptions.length > 0,
    }
  );

  const dropdownClasses = classNames(
    styles.dropdown,
    {
      [styles.open]: isOpen,
    }
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        ref={selectRef}
        className={selectClasses}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label ? `${selectId}-label` : undefined}
        data-testid={testId}
      >
        <div className={styles.valueContainer}>
          {selectedOptions.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : multiple ? (
            <div className={styles.multiValue}>
              {selectedOptions.slice(0, 2).map(option => (
                <span key={option.value} className={styles.tag}>
                  {option.icon && <span className={styles.tagIcon}>{option.icon}</span>}
                  {option.label}
                  <button
                    type="button"
                    className={styles.tagRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option);
                    }}
                    aria-label={`Remove ${option.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <span className={styles.moreCount}>
                  +{selectedOptions.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <div className={styles.singleValue}>
              {selectedOptions[0].icon && (
                <span className={styles.valueIcon}>{selectedOptions[0].icon}</span>
              )}
              {selectedOptions[0].label}
            </div>
          )}
        </div>

        <div className={styles.indicators}>
          {loading && (
            <div className={styles.loadingSpinner} />
          )}

          {clearable && selectedOptions.length > 0 && !loading && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          <div className={styles.dropdownIndicator}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
        </div>

        <div className={dropdownClasses} style={{ maxHeight }}>
          {searchable && (
            <div className={styles.searchContainer}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className={styles.optionsList} role="listbox">
            {filteredOptions.length === 0 ? (
              <div className={styles.noOptions}>
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = multiple
                  ? Array.isArray(currentValue) && currentValue.includes(option.value)
                  : currentValue === option.value;

                return (
                  <div
                    key={option.value}
                    className={classNames(
                      styles.option,
                      {
                        [styles.selected]: isSelected,
                        [styles.disabled]: option.disabled,
                      }
                    )}
                    onClick={() => handleOptionSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {multiple && (
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          tabIndex={-1}
                        />
                      </div>
                    )}

                    {option.icon && (
                      <span className={styles.optionIcon}>{option.icon}</span>
                    )}

                    <div className={styles.optionContent}>
                      <div className={styles.optionLabel}>{option.label}</div>
                      {option.description && (
                        <div className={styles.optionDescription}>
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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

export default Select;