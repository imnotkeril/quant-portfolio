import React from 'react';
import { COLORS } from '../../../constants/colors';

export interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  width?: number | string;
  showBorder?: boolean;
  footer?: React.ReactNode;
  headerRightContent?: React.ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  description,
  children,
  className = '',
  height = 'auto',
  width = '100%',
  showBorder = true,
  footer,
  headerRightContent,
  loading = false,
  error,
  onRetry,
}) => {
  return (
    <div
      className={`bg-background ${showBorder ? 'border border-divider' : ''} rounded-md overflow-hidden ${className}`}
      style={{ height, width }}
    >
      {/* Header */}
      {(title || subtitle || headerRightContent) && (
        <div className="flex justify-between items-start border-b border-divider p-4">
          <div>
            {title && <h3 className="text-base font-semibold text-text-light">{title}</h3>}
            {subtitle && <h4 className="text-sm text-neutral-gray mt-1">{subtitle}</h4>}
            {description && <p className="text-xs text-neutral-gray mt-2">{description}</p>}
          </div>
          {headerRightContent && (
            <div className="ml-4">
              {headerRightContent}
            </div>
          )}
        </div>
      )}

      {/* Chart Content */}
      <div className="p-4 h-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-negative mb-2">Error loading chart data</div>
            <div className="text-xs text-neutral-gray mb-4">{error}</div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-accent text-text-light rounded-md text-xs hover:bg-hover transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-auto border-t border-divider p-3 text-xs text-neutral-gray">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;