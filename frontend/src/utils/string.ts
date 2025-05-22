/**
 * Utility functions for working with strings
 */

/**
 * Capitalize the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';

  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize the first letter of each word in a string
 * @param str String to capitalize
 * @returns String with capitalized words
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';

  return str
    .split(' ')
    .map(word => word ? capitalize(word) : '')
    .join(' ');
};

/**
 * Convert a string to camelCase
 * @param str String to convert
 * @returns camelCase string
 */
export const toCamelCase = (str: string): string => {
  if (!str) return '';

  return str
    .replace(/[^\w\s]/g, '') // Remove non-word characters
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim()
    .split(' ')
    .map((word, index) => {
      return index === 0 ? word.toLowerCase() : capitalize(word);
    })
    .join('');
};

/**
 * Convert a string to snake_case
 * @param str String to convert
 * @returns snake_case string
 */
export const toSnakeCase = (str: string): string => {
  if (!str) return '';

  return str
    .replace(/[^\w\s]/g, '') // Remove non-word characters
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim()
    .toLowerCase()
    .split(' ')
    .join('_');
};

/**
 * Convert a string to kebab-case
 * @param str String to convert
 * @returns kebab-case string
 */
export const toKebabCase = (str: string): string => {
  if (!str) return '';

  return str
    .replace(/[^\w\s]/g, '') // Remove non-word characters
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim()
    .toLowerCase()
    .split(' ')
    .join('-');
};

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export const truncate = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;

  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Remove HTML tags from a string
 * @param str String with HTML tags
 * @returns String without HTML tags
 */
export const stripHtml = (str: string): string => {
  if (!str) return '';

  return str.replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Escape a string for use in regular expressions
 * @param str String to escape
 * @returns Escaped string
 */
export const escapeRegExp = (str: string): string => {
  if (!str) return '';

  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * Generate a slug from a string
 * @param str String to convert to slug
 * @returns Slug
 */
export const slugify = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');  // Remove leading and trailing hyphens
};

/**
 * Check if a string contains only alphanumeric characters
 * @param str String to check
 * @returns True if string contains only alphanumeric characters
 */
export const isAlphanumeric = (str: string): boolean => {
  if (!str) return false;

  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Check if a string is a valid email
 * @param email Email to check
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format a number as a human-readable string with units
 * @param num Number to format
 * @param digits Number of decimal places (default: 1)
 * @returns Formatted string with units (e.g., 1.2k, 3.4M)
 */
export const formatNumberWithUnits = (num: number, digits: number = 1): string => {
  if (num === null || num === undefined) return '';

  const units = ['', 'k', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (unitIndex === 0) {
    return num.toFixed(digits).replace(/\.0+$/, '');
  }

  const formattedValue = (num / Math.pow(1000, unitIndex)).toFixed(digits);
  return `${formattedValue.replace(/\.0+$/, '')}${units[unitIndex]}`;
};

/**
 * Convert a string to a hash number
 * @param str String to hash
 * @returns Hash number
 */
export const stringToHash = (str: string): number => {
  if (!str) return 0;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Generate a random ID
 * @param length Length of the ID (default: 8)
 * @param chars Characters to use (default: alphanumeric)
 * @returns Random ID
 */
export const randomId = (
  length: number = 8,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Convert a string from camelCase to human-readable format
 * @param str camelCase string
 * @returns Human-readable string with spaces
 */
export const camelCaseToHuman = (str: string): string => {
  if (!str) return '';

  // Insert a space before all uppercase letters
  const spaced = str.replace(/([A-Z])/g, ' $1');

  // Capitalize the first letter and trim any leading space
  return capitalize(spaced.trim());
};

/**
 * Get the initials from a name
 * @param name Full name
 * @param maxLength Maximum number of initials (default: 2)
 * @returns Initials
 */
export const getInitials = (name: string, maxLength: number = 2): string => {
  if (!name) return '';

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, maxLength)
    .join('')
    .toUpperCase();
};

/**
 * Pluralize a word based on count
 * @param word Word to pluralize
 * @param count Count
 * @param pluralForm Custom plural form (default: word + 's')
 * @returns Pluralized word
 */
export const pluralize = (
  word: string,
  count: number,
  pluralForm?: string
): string => {
  if (!word) return '';

  if (count === 1) {
    return word;
  }

  return pluralForm || `${word}s`;
};

/**
 * Convert a string to title case
 * @param str String to convert
 * @returns Title case string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';

  const excludedWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !excludedWords.includes(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(' ');
};

/**
 * Convert a string to a URL-friendly format
 * @param str String to convert
 * @returns URL-friendly string
 */
export const toUrlFriendly = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')   // Remove non-word characters
    .replace(/\-\-+/g, '-')     // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')         // Remove leading hyphens
    .replace(/-+$/, '');        // Remove trailing hyphens
};

/**
 * Format a ticker symbol
 * @param ticker Ticker symbol
 * @returns Formatted ticker
 */
export const formatTicker = (ticker: string): string => {
  if (!ticker) return '';

  return ticker.toUpperCase();
};

/**
 * Parse a string of ticker symbols and weights
 * @param text Text containing tickers and weights
 * @returns Array of ticker-weight pairs
 */
export const parseTickersWeights = (text: string): Array<{ticker: string, weight: number}> => {
  if (!text) return [];

  const result: Array<{ticker: string, weight: number}> = [];

  // Split by new lines and commas
  const lines = text.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    // Try to extract ticker and weight
    const match = line.match(/([A-Za-z0-9.\-]+)(?:\s*[:=]\s*|\s+)(\d*\.?\d+%?)/);

    if (match) {
      const ticker = match[1].trim().toUpperCase();
      let weight = parseFloat(match[2].replace('%', ''));

      // If percentage, convert to decimal
      if (match[2].includes('%')) {
        weight /= 100;
      }

      result.push({ ticker, weight });
    } else {
      // Just a ticker without weight
      const tickerMatch = line.match(/([A-Za-z0-9.\-]+)/);
      if (tickerMatch) {
        result.push({ ticker: tickerMatch[1].trim().toUpperCase(), weight: 0 });
      }
    }
  }

  return result;
};