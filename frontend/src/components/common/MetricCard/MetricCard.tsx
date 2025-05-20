import React from 'react';
import { COLORS } from '../../../constants/colors';

export interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: 'increase' | 'decrease';
  deltaDirection?: 'normal' | 'inverse';
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  footer?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  deltaType,
  deltaDirection = 'normal',
  subtitle,
  icon,
  className = '',
  loading = false,
  onClick,
  footer,
}) => {
  // Determine delta color based on type and direction
  const getDeltaColor = () => {
    // If direction is 'normal', positive change is good (green)
    // If direction is 'inverse', positive change is bad (red)
    if (deltaType === 'increase') {
      return deltaDirection === 'normal' ? COLORS.POSITIVE : COLORS.NEGATIVE;
    }
    if (deltaType === 'decrease') {
      return deltaDirection === 'normal' ? COLORS.NEGATIVE : COLORS.POSITIVE;
    }
    return COLORS.NEUTRAL_GRAY;
  };

  // Determine delta symbol
  const getDeltaSymbol = () => {
    if (deltaType === 'increase') {
      return '↑';
    }
    if (deltaType === 'decrease') {
      return '↓';
    }
    return '';
  };

  const deltaColor = getDeltaColor();
  const deltaSymbol = getDeltaSymbol();

  return (
    <div
      className={`bg-background border border-divider rounded-md p-4 ${className} ${onClick ? 'cursor-pointer hover:border-accent transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-neutral-gray text-xs font-medium">{title}</div>

          {loading ? (
            <div className="mt-2 h-6 w-24 bg-divider animate-pulse rounded"></div>
          ) : (
            <div className="mt-1 text-xl font-semibold text-text-light">
              {value}

              {delta && (
                <span
                  className="ml-2 text-sm font-medium"
                  style={{ color: deltaColor }}
                >
                  {deltaSymbol} {delta}
                </span>
              )}
            </div>
          )}

          {subtitle && (
            <div className="mt-1 text-xs text-neutral-gray">
              {subtitle}
            </div>
          )}
        </div>

        {icon && (
          <div className="text-accent">
            {icon}
          </div>
        )}
      </div>

      {footer && (
        <div className="mt-4 pt-2 border-t border-divider text-xs text-neutral-gray">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MetricCard;