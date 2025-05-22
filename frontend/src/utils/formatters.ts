/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted currency string
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
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number as percentage
 * @param value Number to format (e.g., 0.1234 for 12.34%)
 * @param decimals Number of decimal places (default: 2)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a number with thousand separators
 * @param value Number to format
 * @param decimals Number of decimal places (default: 2)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a date to a string
 * @param date Date to format (Date object or ISO string)
 * @param format Format type (default: 'short')
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: format
  }).format(dateObj);
};

/**
 * Format a timestamp to a date and time string
 * @param timestamp Timestamp to format (Date object or ISO string)
 * @param format Format type (default: 'short')
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  timestamp: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string => {
  if (!timestamp) return '';

  const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
    timeStyle: format
  }).format(dateObj);
};

/**
 * Format a file size
 * @param bytes Size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size (e.g., "1.25 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m 15s")
 */
export const formatDuration = (ms: number): string => {
  if (ms < 0) return 'Invalid duration';
  if (ms === 0) return '0s';

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * Truncate text to specified length with ellipsis if needed
 * @param text Text to truncate
 * @param maxLength Maximum length (default: 50)
 * @param ellipsis Ellipsis string (default: "...")
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number = 50,
  ellipsis: string = '...'
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength - ellipsis.length)}${ellipsis}`;
};

/**
 * Format asset ticker to display with proper formatting
 * @param ticker Asset ticker
 * @returns Formatted ticker
 */
export const formatTicker = (ticker: string): string => {
  if (!ticker) return '';

  // Typically tickers are uppercase
  return ticker.toUpperCase();
};

/**
 * Format financial metric name to display name
 * @param metricName Technical metric name
 * @returns Human-readable metric name
 */
export const formatMetricName = (metricName: string): string => {
  if (!metricName) return '';

  // Replace underscores with spaces and capitalize each word
  return metricName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format risk level to display name and optionally add color code
 * @param riskLevel Risk level value
 * @param includeColor Whether to include color code
 * @returns Formatted risk level with optional color
 */
export const formatRiskLevel = (
  riskLevel: string,
  includeColor: boolean = false
): string | { text: string; color: string } => {
  const levels: Record<string, { text: string; color: string }> = {
    'low': { text: 'Low', color: '#74F174' },
    'medium': { text: 'Medium', color: '#FFF59D' },
    'high': { text: 'High', color: '#FAA1A4' },
    'very_high': { text: 'Very High', color: '#FF6B6B' }
  };

  const level = levels[riskLevel.toLowerCase()] || { text: 'Unknown', color: '#D1D4DC' };

  return includeColor ? level : level.text;
};