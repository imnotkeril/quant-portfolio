/**
 * Validation utilities for forms and data input
 */

import { Asset } from '../types/portfolio';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isEmpty = value === null || value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  return {
    isValid: !isEmpty,
    errors: isEmpty ? [`${fieldName} is required`] : [],
  };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    if (value > max) {
      errors.push(`${fieldName} must be no more than ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate percentage (0-100)
 */
export const validatePercentage = (value: number, fieldName: string = 'Percentage'): ValidationResult => {
  const errors: string[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (value < 0) {
    errors.push(`${fieldName} cannot be negative`);
  } else if (value > 100) {
    errors.push(`${fieldName} cannot exceed 100%`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (value <= 0) {
    errors.push(`${fieldName} must be a positive number`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate stock ticker symbol
 */
export const validateTicker = (ticker: string): ValidationResult => {
  const errors: string[] = [];

  if (!ticker || ticker.trim() === '') {
    errors.push('Ticker symbol is required');
  } else {
    const trimmed = ticker.trim().toUpperCase();
    if (!/^[A-Z]{1,5}$/.test(trimmed)) {
      errors.push('Ticker symbol must be 1-5 uppercase letters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate portfolio name
 */
export const validatePortfolioName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name || name.trim() === '') {
    errors.push('Portfolio name is required');
  } else {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      errors.push('Portfolio name must be at least 2 characters long');
    }
    if (trimmed.length > 100) {
      errors.push('Portfolio name must be no more than 100 characters long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate asset data
 */
export const validateAsset = (asset: Partial<Asset>): ValidationResult => {
  const errors: string[] = [];

  // Validate ticker
  if (!asset.ticker || asset.ticker.trim() === '') {
    errors.push('Ticker symbol is required');
  } else {
    const tickerValidation = validateTicker(asset.ticker);
    if (!tickerValidation.isValid) {
      errors.push(...tickerValidation.errors);
    }
  }

  // Validate name
  if (!asset.name || asset.name.trim() === '') {
    errors.push('Asset name is required');
  }

  // Validate weight как проценты (0-100)
  if (asset.weight === undefined || asset.weight === null) {
    errors.push('Weight is required');
  } else {
    const weightValidation = validatePercentage(asset.weight, 'Weight');
    if (!weightValidation.isValid) {
      errors.push(...weightValidation.errors);
    }
  }

  // Validate quantity (if provided)
  if (asset.quantity !== undefined && asset.quantity !== null) {
    const quantityValidation = validatePositiveNumber(asset.quantity, 'Quantity');
    if (!quantityValidation.isValid) {
      errors.push(...quantityValidation.errors);
    }
  }

  // Validate purchase price (if provided)
  if (asset.purchasePrice !== undefined && asset.purchasePrice !== null) {
    const priceValidation = validatePositiveNumber(asset.purchasePrice, 'Purchase price');
    if (!priceValidation.isValid) {
      errors.push(...priceValidation.errors);
    }
  }

  // Validate current price (if provided)
  if (asset.currentPrice !== undefined && asset.currentPrice !== null) {
    const currentPriceValidation = validatePositiveNumber(asset.currentPrice, 'Current price');
    if (!currentPriceValidation.isValid) {
      errors.push(...currentPriceValidation.errors);
    }
  }

  // Validate purchase date format (if provided)
  if (asset.purchaseDate && asset.purchaseDate.trim() !== '') {
    const date = new Date(asset.purchaseDate);
    if (isNaN(date.getTime())) {
      errors.push('Purchase date must be a valid date');
    } else if (date > new Date()) {
      errors.push('Purchase date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate array of assets for portfolio
 */
export const validateAssets = (assets: Partial<Asset>[]): ValidationResult => {
  const errors: string[] = [];

  if (!assets || assets.length === 0) {
    errors.push('At least one asset is required');
    return { isValid: false, errors };
  }

  // Validate each asset
  assets.forEach((asset, index) => {
    const assetValidation = validateAsset(asset);
    if (!assetValidation.isValid) {
      assetValidation.errors.forEach(error => {
        errors.push(`Asset ${index + 1}: ${error}`);
      });
    }
  });

  // Check for duplicate tickers
  const tickers = assets.map(asset => asset.ticker?.trim().toUpperCase()).filter(Boolean);
  const uniqueTickers = new Set(tickers);
  if (tickers.length !== uniqueTickers.size) {
    errors.push('Duplicate ticker symbols are not allowed');
  }

  // Validate total weight
  const totalWeight = assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Total asset weights must equal 100%, currently ${totalWeight.toFixed(2)}%`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const errors: string[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    errors.push('Start date must be a valid date');
  }

  if (isNaN(end.getTime())) {
    errors.push('End date must be a valid date');
  }

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    if (start >= end) {
      errors.push('End date must be after start date');
    }

    if (end > new Date()) {
      errors.push('End date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  maxSizeBytes: number,
  allowedTypes: string[]
): ValidationResult => {
  const errors: string[] = [];

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];

  try {
    new URL(url);
  } catch {
    errors.push('Must be a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number (US format)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];

  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  if (!phoneRegex.test(phone)) {
    errors.push('Phone number must be in format: (123) 456-7890');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};