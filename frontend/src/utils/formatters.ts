/**
 * Utility functions for formatting data for display
 */

import { formatDistanceToNow } from 'date-fns';

/**
 * Format a number as currency
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (
  value: number,
  precision: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Format a number with specified precision
 */
export const formatNumber = (
  value: number,
  precision: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Format large numbers with abbreviations (K, M, B, T)
 */
export const formatLargeNumber = (
  value: number,
  precision: number = 1,
  locale: string = 'en-US'
): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return (value / 1e12).toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) + 'T';
  } else if (absValue >= 1e9) {
    return (value / 1e9).toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) + 'B';
  } else if (absValue >= 1e6) {
    return (value / 1e6).toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) + 'M';
  } else if (absValue >= 1e3) {
    return (value / 1e3).toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) + 'K';
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/**
 * Format a date with various options
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'medium' | 'long' | 'full' | 'relative' | 'input' = 'medium',
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'input':
      return dateObj.toISOString().split('T')[0];
    case 'relative':
      return formatDistanceToNow(dateObj, { addSuffix: true });
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'full':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString(locale);
  }
};

/**
 * Format a date and time
 */
export const formatDateTime = (
  date: string | Date,
  includeSeconds: boolean = false,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a time duration in seconds to human readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format a risk score to descriptive text
 */
export const formatRiskLevel = (score: number): string => {
  if (score <= 2) return 'Very Low';
  if (score <= 4) return 'Low';
  if (score <= 6) return 'Medium';
  if (score <= 8) return 'High';
  return 'Very High';
};

/**
 * Format portfolio weight as percentage
 */
export const formatWeight = (weight: number): string => {
  return formatPercentage(weight / 100, 1);
};

/**
 * Format change in value with + or - sign
 */
export const formatChange = (value: number, isPercentage: boolean = false): string => {
  const sign = value >= 0 ? '+' : '';
  const formatted = isPercentage ? formatPercentage(Math.abs(value)) : formatNumber(Math.abs(value));
  return `${sign}${value >= 0 ? '' : '-'}${formatted}`;
};

/**
 * Format market cap
 */
export const formatMarketCap = (value: number): string => {
  return formatLargeNumber(value, 2);
};

/**
 * Format ratio (like Sharpe ratio)
 */
export const formatRatio = (value: number, precision: number = 3): string => {
  return formatNumber(value, precision);
};

/**
 * Format basis points
 */
export const formatBasisPoints = (value: number): string => {
  return `${formatNumber(value * 10000, 0)} bps`;
};