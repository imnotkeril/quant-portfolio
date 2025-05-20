import React from 'react';
import classNames from 'classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Button component following Wild Market Capital design system
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  className,
  type = 'button',
  icon,
  iconPosition = 'left'
}) => {
  return (
    <button
      type={type}
      className={classNames(
        'inline-flex items-center justify-center transition-all font-medium rounded focus:outline-none',
        {
          // Size classes
          'px-3 py-1.5 text-xs': size === 'small',
          'px-4 py-2 text-sm': size === 'medium',
          'px-6 py-3 text-base': size === 'large',

          // Width
          'w-full': fullWidth,

          // Variant classes - primary
          'bg-accent hover:bg-accent/90 active:bg-accent/80 text-white shadow-sm hover:shadow-glow':
            variant === 'primary' && !disabled,

          // Variant classes - secondary
          'bg-transparent border border-accent text-accent hover:border-hover hover:text-hover active:border-active active:text-active':
            variant === 'secondary' && !disabled,

          // Variant classes - outline
          'bg-transparent border border-divider text-white hover:border-accent hover:text-accent active:border-active active:text-active':
            variant === 'outline' && !disabled,

          // Variant classes - text
          'bg-transparent text-accent hover:text-hover hover:underline active:text-active px-0 py-0':
            variant === 'text' && !disabled,

          // Disabled state
          'opacity-60 cursor-not-allowed': disabled,
          'bg-disabled text-white': variant === 'primary' && disabled,
          'border-disabled text-disabled': (variant === 'secondary' || variant === 'outline') && disabled,
          'text-disabled': variant === 'text' && disabled
        },
        className
      )}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};