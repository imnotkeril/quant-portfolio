import React from 'react';
import classNames from 'classnames';

interface InputProps {
  type?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}

/**
 * Input component following Wild Market Capital design system
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
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
  autoComplete
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

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
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-white">
          {label}
          {required && <span className="ml-1 text-negative">*</span>}
        </label>
      )}

      <div className={classNames(
        'relative flex items-center bg-background/50 border rounded transition-all',
        {
          'border-divider focus-within:border-accent': !error && !success,
          'border-negative focus-within:border-negative': error,
          'border-positive focus-within:border-positive': success && !error,
          'opacity-60 cursor-not-allowed': disabled,
          'pr-10': icon && iconPosition === 'right',
          'pl-10': icon && iconPosition === 'left'
        }
      )}>
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={classNames(
            'w-full h-10 px-4 bg-transparent outline-none text-white',
            {
              'cursor-not-allowed': disabled
            }
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          name={name}
          required={required}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-gray">
            {icon}
          </div>
        )}
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