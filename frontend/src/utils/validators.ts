/**
 * Utility functions for validating data
 */

/**
 * Check if a value is a valid number
 * @param value Value to check
 * @returns True if value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return false;
  if (typeof value === 'object') return false;

  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

/**
 * Check if a value is a valid positive number
 * @param value Value to check
 * @param includeZero Whether to include zero as positive (default: false)
 * @returns True if value is a valid positive number
 */
export const isPositiveNumber = (value: any, includeZero: boolean = false): boolean => {
  if (!isValidNumber(value)) return false;

  const num = Number(value);
  return includeZero ? num >= 0 : num > 0;
};

/**
 * Check if a value is a valid percentage (0-1 or 0-100)
 * @param value Value to check
 * @param format Percentage format (default: 'decimal' meaning 0-1)
 * @returns True if value is a valid percentage
 */
export const isValidPercentage = (
  value: any,
  format: 'decimal' | 'percent' = 'decimal'
): boolean => {
  if (!isValidNumber(value)) return false;

  const num = Number(value);

  if (format === 'decimal') {
    return num >= 0 && num <= 1;
  } else {
    return num >= 0 && num <= 100;
  }
};

/**
 * Check if a string is a valid date
 * @param dateStr String to check
 * @returns True if string is a valid date
 */
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return false;

  // Try to create a date and check if it's valid
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Check if a string is a valid date in YYYY-MM-DD format
 * @param dateStr String to check
 * @returns True if string is a valid date in YYYY-MM-DD format
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return false;

  // Check if the format is YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  // Check if it's a valid date
  return isValidDate(dateStr);
};

/**
 * Check if a string is a valid email address
 * @param email String to check
 * @returns True if string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  // Basic email validation regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Check if a ticker symbol is valid
 * @param ticker Ticker to check
 * @returns True if ticker is valid
 */
export const isValidTicker = (ticker: string): boolean => {
  if (!ticker) return false;

  // Most tickers consist of letters, numbers, dots, and hyphens
  const regex = /^[A-Za-z0-9.\-]+$/;
  return regex.test(ticker);
};

/**
 * Check if a portfolio has valid weights (sum to 1)
 * @param weights Object with asset weights
 * @param tolerance Tolerance for sum (default: 0.0001)
 * @returns True if weights are valid
 */
export const hasValidWeights = (
  weights: Record<string, number>,
  tolerance: number = 0.0001
): boolean => {
  if (!weights || Object.keys(weights).length === 0) return false;

  // Check if all weights are valid numbers
  const allValid = Object.values(weights).every(weight =>
    isValidNumber(weight) && weight >= 0
  );
  if (!allValid) return false;

  // Calculate sum and check if it's close to 1
  const sum = Object.values(weights).reduce((total, weight) => total + weight, 0);
  return Math.abs(sum - 1) <= tolerance;
};

/**
 * Validate portfolio data for completeness
 * @param portfolio Portfolio object to validate
 * @returns Object with validation result and errors
 */
export const validatePortfolio = (portfolio: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!portfolio.name) {
    errors.push('Portfolio name is required');
  }

  // Check assets
  if (!portfolio.assets || !Array.isArray(portfolio.assets) || portfolio.assets.length === 0) {
    errors.push('Portfolio must have at least one asset');
  } else {
    // Check each asset
    portfolio.assets.forEach((asset: any, index: number) => {
      if (!asset.ticker) {
        errors.push(`Asset #${index + 1} must have a ticker symbol`);
      }

      if (!isValidNumber(asset.weight) || asset.weight < 0) {
        errors.push(`Asset #${index + 1} (${asset.ticker || 'unknown'}) must have a valid weight`);
      }
    });

    // Check if weights sum to 1
    const weights = portfolio.assets.reduce((obj: Record<string, number>, asset: any) => {
      obj[asset.ticker] = asset.weight || 0;
      return obj;
    }, {});

    if (!hasValidWeights(weights)) {
      errors.push('Asset weights must sum to 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate optimization parameters
 * @param params Optimization parameters
 * @returns Object with validation result and errors
 */
export const validateOptimizationParams = (params: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check method
  const validMethods = [
    'markowitz', 'risk_parity', 'minimum_variance',
    'maximum_sharpe', 'equal_weight', 'robust',
    'conditional', 'hierarchical', 'esg', 'cost_aware'
  ];

  if (!params.method || !validMethods.includes(params.method)) {
    errors.push(`Optimization method must be one of: ${validMethods.join(', ')}`);
  }

  // Check risk-free rate
  if (params.riskFreeRate !== undefined && !isValidNumber(params.riskFreeRate)) {
    errors.push('Risk-free rate must be a valid number');
  }

  // Check weights constraints
  if (params.minWeight !== undefined && !isValidNumber(params.minWeight)) {
    errors.push('Minimum weight must be a valid number');
  }

  if (params.maxWeight !== undefined && !isValidNumber(params.maxWeight)) {
    errors.push('Maximum weight must be a valid number');
  }

  if (
    params.minWeight !== undefined &&
    params.maxWeight !== undefined &&
    params.minWeight > params.maxWeight
  ) {
    errors.push('Minimum weight must be less than or equal to maximum weight');
  }

  // Method-specific validation
  if (params.method === 'markowitz') {
    if (params.targetReturn !== undefined && !isValidNumber(params.targetReturn)) {
      errors.push('Target return must be a valid number');
    }

    if (params.targetRisk !== undefined && !isValidNumber(params.targetRisk)) {
      errors.push('Target risk must be a valid number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};