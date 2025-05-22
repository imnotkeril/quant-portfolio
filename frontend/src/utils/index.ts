/**
 * Export all utility functions
 */

// Export formatters
export * from './formatters';

// Export validators with explicit naming to avoid conflicts
export * from './validators';

// Export calculations with explicit naming to avoid conflicts
export {
  calculateSimpleReturns,
  calculateLogReturns,
  calculateCumulativeReturns,
  calculateAnnualizedReturn,
  calculatePortfolioReturns,
  calculateVolatility,
  calculateSharpeRatio,
  calculateDrawdowns,
  calculateMaxDrawdown,
  calculateHistoricalVaR,
  calculateHistoricalCVaR,
  calculateBeta,
  calculateAlpha,
  calculateCorrelation as calculateReturnsCorrelation,
  calculateSortinoRatio,
  calculateCalmarRatio,
  calculateOmegaRatio,
  calculateWeightsFromValues,
  calculatePortfolioValue,
  calculateRiskContribution,
  calculateCovariance
} from './calculations';

// Export date utilities
export * from './date';

// Export color utilities
export * from './color';

// Export array utilities
export * from './array';

// Export object utilities
export * from './object';

// Export string utilities with explicit naming to avoid conflicts
export {
  capitalize,
  capitalizeWords,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  stripHtml,
  escapeRegExp,
  slugify,
  isAlphanumeric,
  isValidEmail as isValidEmailString,
  formatNumberWithUnits,
  stringToHash,
  randomId,
  camelCaseToHuman,
  getInitials,
  pluralize,
  toTitleCase,
  toUrlFriendly,
  formatTicker,
  parseTickersWeights
} from './string';

// Export math utilities with explicit naming to avoid conflicts
export {
  round,
  clamp,
  weightedAverage,
  lerp,
  mapRange,
  percentageInRange,
  approxEqual,
  degreesToRadians,
  radiansToDegrees,
  calculateLogReturns as calculateMathLogReturns,
  calculateSimpleReturns as calculateMathSimpleReturns,
  calculateCAGR,
  calculateCompoundValue,
  calculateStandardDeviation as calculateMathStandardDeviation,
  calculateCorrelation as calculateMathCorrelation,
  range,
  randomBetween,
  percentToDecimal,
  decimalToPercent
} from './math';