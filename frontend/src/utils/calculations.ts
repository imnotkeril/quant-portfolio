/**
 * Utility functions for financial calculations
 */

/**
 * Calculate simple returns from a price series
 * @param prices Array of prices
 * @returns Array of simple returns
 */
export const calculateSimpleReturns = (prices: number[]): number[] => {
  if (!prices || prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];

    if (prevPrice === 0) {
      returns.push(0); // Avoid division by zero
    } else {
      returns.push((currentPrice - prevPrice) / prevPrice);
    }
  }

  return returns;
};

/**
 * Calculate logarithmic returns from a price series
 * @param prices Array of prices
 * @returns Array of logarithmic returns
 */
export const calculateLogReturns = (prices: number[]): number[] => {
  if (!prices || prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];

    if (prevPrice <= 0 || currentPrice <= 0) {
      returns.push(0); // Avoid log of zero or negative
    } else {
      returns.push(Math.log(currentPrice / prevPrice));
    }
  }

  return returns;
};

/**
 * Calculate cumulative returns from a returns series
 * @param returns Array of returns (simple returns, not log returns)
 * @param initialValue Initial value (default: 1)
 * @returns Array of cumulative values
 */
export const calculateCumulativeReturns = (
  returns: number[],
  initialValue: number = 1
): number[] => {
  if (!returns || returns.length === 0) return [initialValue];

  const cumulativeReturns: number[] = [initialValue];
  let currentValue = initialValue;

  for (let i = 0; i < returns.length; i++) {
    currentValue *= (1 + returns[i]);
    cumulativeReturns.push(currentValue);
  }

  return cumulativeReturns;
};

/**
 * Calculate annualized return from a returns series
 * @param returns Array of returns
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Annualized return
 */
export const calculateAnnualizedReturn = (
  returns: number[],
  periodsPerYear: number = 252
): number => {
  if (!returns || returns.length === 0) return 0;

  // Calculate cumulative return
  const cumulativeReturns = calculateCumulativeReturns(returns);
  const totalReturn = cumulativeReturns[cumulativeReturns.length - 1] / cumulativeReturns[0] - 1;

  // Annualize the return
  const years = returns.length / periodsPerYear;
  return Math.pow(1 + totalReturn, 1 / years) - 1;
};

/**
 * Calculate portfolio return for a given period
 * @param assetReturns Object with asset returns (ticker -> array of returns)
 * @param weights Object with asset weights (ticker -> weight)
 * @returns Array of portfolio returns
 */
export const calculatePortfolioReturns = (
  assetReturns: Record<string, number[]>,
  weights: Record<string, number>
): number[] => {
  if (!assetReturns || !weights) return [];

  const tickers = Object.keys(assetReturns);
  if (tickers.length === 0) return [];

  // Ensure all assets have the same number of periods
  const numPeriods = assetReturns[tickers[0]].length;
  for (const ticker of tickers) {
    if (!assetReturns[ticker] || assetReturns[ticker].length !== numPeriods) {
      throw new Error(`Asset returns must have the same number of periods for all assets`);
    }
  }

  // Calculate portfolio returns for each period
  const portfolioReturns: number[] = Array(numPeriods).fill(0);

  for (const ticker of tickers) {
    const weight = weights[ticker] || 0;
    for (let i = 0; i < numPeriods; i++) {
      portfolioReturns[i] += assetReturns[ticker][i] * weight;
    }
  }

  return portfolioReturns;
};

/**
 * Calculate volatility (standard deviation) of returns
 * @param returns Array of returns
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @param annualized Whether to annualize the result (default: true)
 * @returns Volatility (standard deviation)
 */
export const calculateVolatility = (
  returns: number[],
  periodsPerYear: number = 252,
  annualized: boolean = true
): number => {
  if (!returns || returns.length <= 1) return 0;

  // Calculate mean
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;

  // Calculate sum of squared differences from mean
  const squaredDiffs = returns.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / (returns.length - 1);

  // Calculate standard deviation
  const stdDev = Math.sqrt(variance);

  // Annualize if needed
  return annualized ? stdDev * Math.sqrt(periodsPerYear) : stdDev;
};

/**
 * Calculate Sharpe ratio
 * @param returns Array of returns
 * @param riskFreeRate Risk-free rate (annualized, e.g., 0.02 for 2%)
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Sharpe ratio
 */
export const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate: number = 0,
  periodsPerYear: number = 252
): number => {
  if (!returns || returns.length === 0) return 0;

  // Convert annual risk-free rate to per-period rate
  const riskFreeRatePerPeriod = Math.pow(1 + riskFreeRate, 1 / periodsPerYear) - 1;

  // Calculate excess returns
  const excessReturns = returns.map(r => r - riskFreeRatePerPeriod);

  // Calculate mean of excess returns
  const meanExcessReturn = excessReturns.reduce((sum, value) => sum + value, 0) / excessReturns.length;

  // Calculate volatility of excess returns (annualized)
  const volatility = calculateVolatility(excessReturns, periodsPerYear);

  if (volatility === 0) return 0; // Avoid division by zero

  // Calculate and return Sharpe ratio
  return (meanExcessReturn * periodsPerYear) / volatility;
};

/**
 * Calculate drawdowns from cumulative returns
 * @param cumulativeReturns Array of cumulative returns or values
 * @returns Array of drawdowns (0 to -1, where -0.5 means 50% drawdown)
 */
export const calculateDrawdowns = (cumulativeReturns: number[]): number[] => {
  if (!cumulativeReturns || cumulativeReturns.length === 0) return [];

  const drawdowns: number[] = Array(cumulativeReturns.length).fill(0);
  let peak = cumulativeReturns[0];

  for (let i = 0; i < cumulativeReturns.length; i++) {
    peak = Math.max(peak, cumulativeReturns[i]);
    drawdowns[i] = cumulativeReturns[i] / peak - 1;
  }

  return drawdowns;
};

/**
 * Calculate maximum drawdown from cumulative returns
 * @param cumulativeReturns Array of cumulative returns or values
 * @returns Maximum drawdown (0 to -1, where -0.5 means 50% drawdown)
 */
export const calculateMaxDrawdown = (cumulativeReturns: number[]): number => {
  if (!cumulativeReturns || cumulativeReturns.length === 0) return 0;

  const drawdowns = calculateDrawdowns(cumulativeReturns);
  return Math.min(...drawdowns);
};

/**
 * Calculate Value at Risk (VaR) using historical method
 * @param returns Array of returns
 * @param confidenceLevel Confidence level (default: 0.95 for 95%)
 * @returns Value at Risk
 */
export const calculateHistoricalVaR = (
  returns: number[],
  confidenceLevel: number = 0.95
): number => {
  if (!returns || returns.length === 0) return 0;

  // Sort returns in ascending order
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // Find the index at the specified confidence level
  const index = Math.floor(sortedReturns.length * (1 - confidenceLevel));

  // Return the negative of the value at that index (VaR is typically positive)
  return -sortedReturns[index];
};

/**
 * Calculate Conditional Value at Risk (CVaR) using historical method
 * @param returns Array of returns
 * @param confidenceLevel Confidence level (default: 0.95 for 95%)
 * @returns Conditional Value at Risk
 */
export const calculateHistoricalCVaR = (
  returns: number[],
  confidenceLevel: number = 0.95
): number => {
  if (!returns || returns.length === 0) return 0;

  // Sort returns in ascending order
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // Find the index at the specified confidence level
  const cutoffIndex = Math.floor(sortedReturns.length * (1 - confidenceLevel));

  // Calculate the average of returns beyond the VaR cutoff
  let sum = 0;
  for (let i = 0; i < cutoffIndex; i++) {
    sum += sortedReturns[i];
  }

  // Return the negative of the average (CVaR is typically positive)
  return -sum / cutoffIndex;
};

/**
 * Calculate beta of an asset relative to a benchmark
 * @param assetReturns Array of asset returns
 * @param benchmarkReturns Array of benchmark returns
 * @returns Beta value
 */
export const calculateBeta = (
  assetReturns: number[],
  benchmarkReturns: number[]
): number => {
  if (
    !assetReturns || !benchmarkReturns ||
    assetReturns.length === 0 || benchmarkReturns.length === 0 ||
    assetReturns.length !== benchmarkReturns.length
  ) {
    return 0;
  }

  // Calculate means
  const assetMean = assetReturns.reduce((sum, value) => sum + value, 0) / assetReturns.length;
  const benchmarkMean = benchmarkReturns.reduce((sum, value) => sum + value, 0) / benchmarkReturns.length;

  // Calculate covariance and benchmark variance
  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < assetReturns.length; i++) {
    covariance += (assetReturns[i] - assetMean) * (benchmarkReturns[i] - benchmarkMean);
    benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkMean, 2);
  }

  covariance /= assetReturns.length - 1;
  benchmarkVariance /= benchmarkReturns.length - 1;

  if (benchmarkVariance === 0) return 0; // Avoid division by zero

  return covariance / benchmarkVariance;
};

/**
 * Calculate alpha of an asset relative to a benchmark
 * @param assetReturns Array of asset returns
 * @param benchmarkReturns Array of benchmark returns
 * @param riskFreeRate Risk-free rate (annualized, e.g., 0.02 for 2%)
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Alpha value (annualized)
 */
export const calculateAlpha = (
  assetReturns: number[],
  benchmarkReturns: number[],
  riskFreeRate: number = 0,
  periodsPerYear: number = 252
): number => {
  if (
    !assetReturns || !benchmarkReturns ||
    assetReturns.length === 0 || benchmarkReturns.length === 0 ||
    assetReturns.length !== benchmarkReturns.length
  ) {
    return 0;
  }

  // Calculate beta
  const beta = calculateBeta(assetReturns, benchmarkReturns);

  // Calculate mean returns
  const assetMean = assetReturns.reduce((sum, value) => sum + value, 0) / assetReturns.length;
  const benchmarkMean = benchmarkReturns.reduce((sum, value) => sum + value, 0) / benchmarkReturns.length;

  // Convert annual risk-free rate to per-period rate
  const riskFreeRatePerPeriod = Math.pow(1 + riskFreeRate, 1 / periodsPerYear) - 1;

  // Calculate alpha (per-period)
  const alphaPerPeriod = assetMean - riskFreeRatePerPeriod - beta * (benchmarkMean - riskFreeRatePerPeriod);

  // Annualize alpha
  return Math.pow(1 + alphaPerPeriod, periodsPerYear) - 1;
};

/**
 * Calculate correlation between two return series
 * @param returns1 First array of returns
 * @param returns2 Second array of returns
 * @returns Correlation coefficient (-1 to 1)
 */
export const calculateCorrelation = (
  returns1: number[],
  returns2: number[]
): number => {
  if (
    !returns1 || !returns2 ||
    returns1.length === 0 || returns2.length === 0 ||
    returns1.length !== returns2.length
  ) {
    return 0;
  }

  // Calculate means
  const mean1 = returns1.reduce((sum, value) => sum + value, 0) / returns1.length;
  const mean2 = returns2.reduce((sum, value) => sum + value, 0) / returns2.length;

  // Calculate sums for correlation formula
  let sumCov = 0;
  let sumVar1 = 0;
  let sumVar2 = 0;

  for (let i = 0; i < returns1.length; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;

    sumCov += diff1 * diff2;
    sumVar1 += diff1 * diff1;
    sumVar2 += diff2 * diff2;
  }

  if (sumVar1 === 0 || sumVar2 === 0) return 0; // Avoid division by zero

  return sumCov / Math.sqrt(sumVar1 * sumVar2);
};

/**
 * Calculate Sortino ratio (measures risk-adjusted return, but only considering downside risk)
 * @param returns Array of returns
 * @param targetReturn Minimum acceptable return (default: 0)
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Sortino ratio
 */
export const calculateSortinoRatio = (
  returns: number[],
  targetReturn: number = 0,
  periodsPerYear: number = 252
): number => {
  if (!returns || returns.length === 0) return 0;

  // Calculate mean return
  const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;

  // Calculate downside risk (standard deviation of returns below target)
  const downsideReturns = returns.filter(r => r < targetReturn);
  if (downsideReturns.length === 0) return Infinity; // No downside returns

  const downsideDeviation = Math.sqrt(
    downsideReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / downsideReturns.length
  );

  if (downsideDeviation === 0) return 0; // Avoid division by zero

  // Calculate and return Sortino ratio (annualized)
  return (meanReturn - targetReturn) * Math.sqrt(periodsPerYear) / downsideDeviation;
};

/**
 * Calculate Calmar ratio (measures risk-adjusted return relative to maximum drawdown)
 * @param returns Array of returns
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Calmar ratio
 */
export const calculateCalmarRatio = (
  returns: number[],
  periodsPerYear: number = 252
): number => {
  if (!returns || returns.length === 0) return 0;

  // Calculate annualized return
  const annualizedReturn = calculateAnnualizedReturn(returns, periodsPerYear);

  // Calculate cumulative returns
  const cumulativeReturns = calculateCumulativeReturns(returns);

  // Calculate maximum drawdown
  const maxDrawdown = calculateMaxDrawdown(cumulativeReturns);

  if (maxDrawdown === 0) return 0; // Avoid division by zero

  // Calculate and return Calmar ratio
  return annualizedReturn / Math.abs(maxDrawdown);
};

/**
 * Calculate Omega ratio (measures probability-weighted ratio of gains vs. losses)
 * @param returns Array of returns
 * @param threshold Threshold for gains/losses (default: 0)
 * @param periodsPerYear Number of periods per year (e.g., 252 for daily, 12 for monthly)
 * @returns Omega ratio
 */
export const calculateOmegaRatio = (
  returns: number[],
  threshold: number = 0,
  periodsPerYear: number = 252
): number => {
  if (!returns || returns.length === 0) return 0;

  // Calculate gains and losses relative to threshold
  const gains = returns.filter(r => r > threshold);
  const losses = returns.filter(r => r <= threshold);

  if (losses.length === 0) return Infinity; // No losses

  // Calculate sum of gains and losses
  const sumGains = gains.reduce((sum, r) => sum + (r - threshold), 0);
  const sumLosses = losses.reduce((sum, r) => sum + (threshold - r), 0);

  if (sumLosses === 0) return Infinity; // Avoid division by zero

  // Calculate and return Omega ratio
  return sumGains / sumLosses;
};

/**
 * Calculate portfolio weights from asset values
 * @param values Object with asset values
 * @returns Object with asset weights (normalized to sum to 1)
 */
export const calculateWeightsFromValues = (
  values: Record<string, number>
): Record<string, number> => {
  if (!values || Object.keys(values).length === 0) return {};

  // Calculate total value
  const totalValue = Object.values(values).reduce((total, value) => total + value, 0);

  if (totalValue === 0) return {}; // Avoid division by zero

  // Calculate weights
  const weights: Record<string, number> = {};
  for (const [ticker, value] of Object.entries(values)) {
    weights[ticker] = value / totalValue;
  }

  return weights;
};

/**
 * Calculate portfolio value from asset quantities and prices
 * @param quantities Object with asset quantities
 * @param prices Object with asset prices
 * @returns Total portfolio value
 */
export const calculatePortfolioValue = (
  quantities: Record<string, number>,
  prices: Record<string, number>
): number => {
  if (!quantities || !prices) return 0;

  let totalValue = 0;

  for (const [ticker, quantity] of Object.entries(quantities)) {
    const price = prices[ticker];
    if (price !== undefined) {
      totalValue += quantity * price;
    }
  }

  return totalValue;
};

/**
 * Calculate risk contribution of each asset in portfolio
 * @param assetReturns Object with asset returns
 * @param weights Object with asset weights
 * @returns Object with risk contribution of each asset (normalized to sum to 1)
 */
export const calculateRiskContribution = (
  assetReturns: Record<string, number[]>,
  weights: Record<string, number>
): Record<string, number> => {
  if (!assetReturns || !weights) return {};

  const tickers = Object.keys(weights);
  if (tickers.length === 0) return {};

  // Calculate covariance matrix
  const covMatrix: number[][] = [];
  for (let i = 0; i < tickers.length; i++) {
    covMatrix[i] = [];
    for (let j = 0; j < tickers.length; j++) {
      const returns1 = assetReturns[tickers[i]] || [];
      const returns2 = assetReturns[tickers[j]] || [];
      if (returns1.length === 0 || returns2.length === 0) {
        covMatrix[i][j] = 0;
      } else {
        covMatrix[i][j] = calculateCovariance(returns1, returns2);
      }
    }
  }

  // Calculate portfolio volatility
  let portfolioVariance = 0;
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      portfolioVariance += weights[tickers[i]] * weights[tickers[j]] * covMatrix[i][j];
    }
  }

  const portfolioVolatility = Math.sqrt(portfolioVariance);
  if (portfolioVolatility === 0) return {}; // Avoid division by zero

  // Calculate marginal contribution to risk
  const mcr: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) {
    let contribution = 0;
    for (let j = 0; j < tickers.length; j++) {
      contribution += weights[tickers[j]] * covMatrix[i][j];
    }
    mcr[tickers[i]] = contribution / portfolioVolatility;
  }

  // Calculate risk contribution
  const rc: Record<string, number> = {};
  let totalRiskContribution = 0;

  for (const ticker of tickers) {
    rc[ticker] = weights[ticker] * mcr[ticker];
    totalRiskContribution += rc[ticker];
  }

  // Normalize risk contributions to sum to 1
  for (const ticker of tickers) {
    rc[ticker] /= totalRiskContribution;
  }

  return rc;
};

/**
 * Calculate covariance between two return series
 * @param returns1 First array of returns
 * @param returns2 Second array of returns
 * @returns Covariance
 */
export const calculateCovariance = (
  returns1: number[],
  returns2: number[]
): number => {
  if (
    !returns1 || !returns2 ||
    returns1.length === 0 || returns2.length === 0 ||
    returns1.length !== returns2.length
  ) {
    return 0;
  }

  // Calculate means
  const mean1 = returns1.reduce((sum, value) => sum + value, 0) / returns1.length;
  const mean2 = returns2.reduce((sum, value) => sum + value, 0) / returns2.length;

  // Calculate covariance
  let covariance = 0;
  for (let i = 0; i < returns1.length; i++) {
    covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
  }

  return covariance / (returns1.length - 1);
};