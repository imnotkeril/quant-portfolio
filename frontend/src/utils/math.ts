/**
 * Utility functions for mathematical operations
 */

/**
 * Round a number to a specified number of decimal places
 * @param value Number to round
 * @param decimals Number of decimal places (default: 2)
 * @returns Rounded number
 */
export const round = (value: number, decimals: number = 2): number => {
  if (isNaN(value)) return 0;

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Clamp a number between a minimum and maximum value
 * @param value Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (isNaN(value)) return min;

  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate the weighted average of values
 * @param values Array of values
 * @param weights Array of weights
 * @returns Weighted average
 */
export const weightedAverage = (values: number[], weights: number[]): number => {
  if (!values || !weights || values.length === 0 || values.length !== weights.length) {
    return 0;
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);

  return weightedSum / totalWeight;
};

/**
 * Linear interpolation between two values
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export const lerp = (a: number, b: number, t: number): number => {
  // Ensure t is between 0 and 1
  const clampedT = clamp(t, 0, 1);

  return a + (b - a) * clampedT;
};

/**
 * Map a value from one range to another
 * @param value Value to map
 * @param fromMin Source range minimum
 * @param fromMax Source range maximum
 * @param toMin Target range minimum
 * @param toMax Target range maximum
 * @param clampResult Whether to clamp the result to the target range (default: true)
 * @returns Mapped value
 */
export const mapRange = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
  clampResult: boolean = true
): number => {
  const fromRange = fromMax - fromMin;
  const toRange = toMax - toMin;

  if (fromRange === 0) return toMin;

  const normalizedValue = (value - fromMin) / fromRange;
  const result = toMin + normalizedValue * toRange;

  return clampResult ? clamp(result, toMin, toMax) : result;
};

/**
 * Calculate the percentage of a value within a range
 * @param value Value to calculate percentage for
 * @param min Minimum value of the range
 * @param max Maximum value of the range
 * @returns Percentage (0-1)
 */
export const percentageInRange = (value: number, min: number, max: number): number => {
  if (min === max) return 0;

  return clamp((value - min) / (max - min), 0, 1);
};

/**
 * Check if two numbers are approximately equal
 * @param a First number
 * @param b Second number
 * @param tolerance Tolerance for comparison (default: 1e-6)
 * @returns True if numbers are approximately equal
 */
export const approxEqual = (a: number, b: number, tolerance: number = 1e-6): boolean => {
  return Math.abs(a - b) <= tolerance;
};

/**
 * Convert a number from degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert a number from radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculate the log returns from a series of prices
 * @param prices Array of prices
 * @returns Array of log returns
 */
export const calculateLogReturns = (prices: number[]): number[] => {
  if (!prices || prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] <= 0 || prices[i] <= 0) {
      returns.push(0); // Avoid log of zero or negative
    } else {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }

  return returns;
};

/**
 * Calculate the simple returns from a series of prices
 * @param prices Array of prices
 * @returns Array of simple returns
 */
export const calculateSimpleReturns = (prices: number[]): number[] => {
  if (!prices || prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) {
      returns.push(0); // Avoid division by zero
    } else {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  return returns;
};

/**
 * Calculate the compound annual growth rate (CAGR)
 * @param startValue Starting value
 * @param endValue Ending value
 * @param years Number of years
 * @returns CAGR as a decimal (e.g., 0.1 for 10%)
 */
export const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || years <= 0) return 0;

  return Math.pow(endValue / startValue, 1 / years) - 1;
};

/**
 * Calculate the compound future value
 * @param principal Principal amount
 * @param rate Annual rate (decimal, e.g., 0.05 for 5%)
 * @param years Number of years
 * @param compoundFrequency Compound frequency per year (default: 1)
 * @returns Future value
 */
export const calculateCompoundValue = (
  principal: number,
  rate: number,
  years: number,
  compoundFrequency: number = 1
): number => {
  if (principal <= 0 || years <= 0 || compoundFrequency <= 0) return 0;

  return principal * Math.pow(1 + rate / compoundFrequency, compoundFrequency * years);
};

/**
 * Calculate the standard deviation of a set of values
 * @param values Array of values
 * @param population Whether to use population standard deviation (default: false)
 * @returns Standard deviation
 */
export const calculateStandardDeviation = (
  values: number[],
  population: boolean = false
): number => {
  if (!values || values.length === 0) return 0;
  if (values.length === 1) return 0;

  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  // Calculate sum of squared differences
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const sumSquaredDiffs = squaredDiffs.reduce((sum, value) => sum + value, 0);

  // Divide by n - 1 for sample or n for population
  const divisor = population ? values.length : values.length - 1;

  // Return standard deviation
  return Math.sqrt(sumSquaredDiffs / divisor);
};

/**
 * Calculate the correlation coefficient between two sets of values
 * @param values1 First array of values
 * @param values2 Second array of values
 * @returns Correlation coefficient (-1 to 1)
 */
export const calculateCorrelation = (values1: number[], values2: number[]): number => {
  if (
    !values1 || !values2 ||
    values1.length === 0 || values2.length === 0 ||
    values1.length !== values2.length
  ) {
    return 0;
  }

  // Calculate means
  const mean1 = values1.reduce((sum, value) => sum + value, 0) / values1.length;
  const mean2 = values2.reduce((sum, value) => sum + value, 0) / values2.length;

  // Calculate covariance and standard deviations
  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;

  for (let i = 0; i < values1.length; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;

    covariance += diff1 * diff2;
    variance1 += diff1 * diff1;
    variance2 += diff2 * diff2;
  }

  covariance /= values1.length;
  variance1 /= values1.length;
  variance2 /= values1.length;

  const stdDev1 = Math.sqrt(variance1);
  const stdDev2 = Math.sqrt(variance2);

  if (stdDev1 === 0 || stdDev2 === 0) return 0;

  return covariance / (stdDev1 * stdDev2);
};

/**
 * Generate a sequence of numbers
 * @param start Start value (inclusive)
 * @param end End value (inclusive)
 * @param step Step between values (default: 1)
 * @returns Array of numbers
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = [];

  if (step === 0) return result;

  if (step > 0 && start <= end) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else if (step < 0 && start >= end) {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }

  return result;
};

/**
 * Generate a random number between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (exclusive)
 * @param isInteger Whether to return an integer (default: false)
 * @returns Random number
 */
export const randomBetween = (min: number, max: number, isInteger: boolean = false): number => {
  const random = Math.random() * (max - min) + min;
  return isInteger ? Math.floor(random) : random;
};

/**
 * Convert a percentage to a decimal
 * @param percentage Percentage value (e.g., 25 for 25%)
 * @returns Decimal value (e.g., 0.25)
 */
export const percentToDecimal = (percentage: number): number => {
  return percentage / 100;
};

/**
 * Convert a decimal to a percentage
 * @param decimal Decimal value (e.g., 0.25)
 * @returns Percentage value (e.g., 25)
 */
export const decimalToPercent = (decimal: number): number => {
  return decimal * 100;
};