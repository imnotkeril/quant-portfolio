import React from 'react';
import { COLORS } from '../../../constants/colors';

export interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'normal' | 'large';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  className = '',
  children,
  footer,
  headerRight,
  loading = false,
  loadingRows = 3,
  bordered = true,
  hoverable = false,
  onClick,
  padding = 'normal',
}) => {
  // Determine padding class based on prop
  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-2';
      case 'large':
        return 'p-6';
      case 'normal':
      default:
        return 'p-4';
    }
  };

  const paddingClass = getPaddingClass();

  return (
    <div
      className={`
        bg-background 
        ${bordered ? 'border border-divider' : ''} 
        rounded-md overflow-hidden 
        ${hoverable ? 'hover:shadow-md hover:border-accent transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Card Header */}
      {(title || headerRight) && (
        <div className={`flex justify-between items-center ${paddingClass} ${subtitle ? 'pb-2' : ''} ${bordered ? 'border-b border-divider' : ''}`}>
          <div>
            {title && <h3 className="text-sm font-semibold text-text-light">{title}</h3>}
            {subtitle && <div className="text-xs text-neutral-gray mt-1">{subtitle}</div>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      {/* Card Content */}
      <div className={paddingClass}>
        {loading ? (
          // Loading skeleton
          <div className="animate-pulse">
            {Array.from({ length: loadingRows }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-divider rounded mb-2"
                style={{
                  width: `${Math.floor(Math.random() * 30) + 70}%`,
                }}
              ></div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={`${paddingClass} pt-3 ${bordered ? 'border-t border-divider' : ''} text-xs text-neutral-gray`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;