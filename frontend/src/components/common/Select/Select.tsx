import React from 'react';
import classNames from 'classnames';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * Select component following Wild Market Capital design system
 */
export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  success = false,
  helperText,
  placeholder,
  className,
  fullWidth = false,
  required = false,
  icon
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={classNames(
        'flex flex-col',
        {
          'w-full': fullWidth
        },
        className
      )}
    >
      {label && (
        <label htmlFor={selectId} className="mb-1 text-sm font-medium text-white">
          {label}
          {required && <span className="ml-1 text-negative">*</span>}
        </label>
      )}

      <div className={classNames(
        'relative',
        {
          'opacity-60 cursor-not-allowed': disabled
        }
      )}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={classNames(
            'w-full h-10 px-4 pr-10 appearance-none bg-background/50 border rounded outline-none text-white transition-all',
            {
              'border-divider focus:border-accent': !error && !success,
              'border-negative focus:border-negative': error,
              'border-positive focus:border-positive': success && !error,
              'cursor-not-allowed': disabled
            }
          )}
          required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-neutral-gray">
          {icon || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </div>
      </div>

      {(error || helperText) && (
        <div className={classNames(
          'mt-1 text-xs',
          {
            'text-negative': error,
            'text-neutral-gray': !error
          }
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};