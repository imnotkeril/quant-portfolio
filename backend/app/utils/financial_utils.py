# backend/app/utils/financial_utils.py
from typing import List, Dict, Union, Optional, Tuple
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math


def calculate_sharpe_ratio(
        returns: Union[List[float], pd.Series, np.ndarray],
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
) -> float:
    """
    Calculate the Sharpe ratio.

    Args:
        returns: Period returns as decimals (0.05 = 5%)
        risk_free_rate: Annual risk-free rate as decimal
        periods_per_year: Number of periods in a year (252 for daily, 52 for weekly, 12 for monthly)

    Returns:
        Sharpe ratio
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    # Convert annual risk-free rate to period rate
    period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

    # Calculate excess returns
    excess_returns = returns - period_risk_free

    # Calculate mean and standard deviation of excess returns
    mean_excess_return = np.mean(excess_returns)
    std_excess_return = np.std(excess_returns, ddof=1)

    # Avoid division by zero
    if std_excess_return == 0:
        return 0.0

    # Calculate Sharpe ratio and annualize
    sharpe = mean_excess_return / std_excess_return
    annualized_sharpe = sharpe * np.sqrt(periods_per_year)

    return annualized_sharpe


def calculate_sortino_ratio(
        returns: Union[List[float], pd.Series, np.ndarray],
        risk_free_rate: float = 0.0,
        target_return: float = 0.0,
        periods_per_year: int = 252
) -> float:
    """
    Calculate the Sortino ratio.

    Args:
        returns: Period returns as decimals (0.05 = 5%)
        risk_free_rate: Annual risk-free rate as decimal
        target_return: Target return as decimal (usually same as risk_free_rate)
        periods_per_year: Number of periods in a year (252 for daily, 52 for weekly, 12 for monthly)

    Returns:
        Sortino ratio
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    # Convert annual risk-free rate to period rate
    period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

    # If target_return is not specified, use risk-free rate
    if target_return == 0.0:
        target_return = period_risk_free

    # Calculate excess returns
    excess_returns = returns - period_risk_free

    # Calculate mean of excess returns
    mean_excess_return = np.mean(excess_returns)

    # Calculate downside deviation (only negative excess returns)
    downside_returns = excess_returns[excess_returns < 0]

    if len(downside_returns) == 0:
        return np.inf if mean_excess_return > 0 else 0.0

    # Calculate downside deviation
    downside_deviation = np.sqrt(np.mean(downside_returns ** 2))

    # Avoid division by zero
    if downside_deviation == 0:
        return np.inf if mean_excess_return > 0 else 0.0

    # Calculate Sortino ratio and annualize
    sortino = mean_excess_return / downside_deviation
    annualized_sortino = sortino * np.sqrt(periods_per_year)

    return annualized_sortino


def calculate_treynor_ratio(
        returns: Union[List[float], pd.Series, np.ndarray],
        benchmark_returns: Union[List[float], pd.Series, np.ndarray],
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
) -> float:
    """
    Calculate the Treynor Ratio.

    Args:
        returns: Portfolio period returns as decimals
        benchmark_returns: Benchmark period returns as decimals
        risk_free_rate: Annual risk-free rate as decimal
        periods_per_year: Number of periods in a year

    Returns:
        Treynor Ratio
    """
    if (not isinstance(returns, (list, pd.Series, np.ndarray)) or
            not isinstance(benchmark_returns, (list, pd.Series, np.ndarray)) or
            len(returns) == 0 or len(benchmark_returns) == 0):
        return 0.0

    # Convert to numpy arrays
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)
    if isinstance(benchmark_returns, (list, pd.Series)):
        benchmark_returns = np.array(benchmark_returns)

    # Ensure arrays have same length
    min_length = min(len(returns), len(benchmark_returns))
    returns = returns[:min_length]
    benchmark_returns = benchmark_returns[:min_length]

    # Convert annual risk-free rate to period rate
    period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

    # Calculate excess returns
    excess_returns = returns - period_risk_free

    # Calculate mean excess returns (annualized)
    mean_excess_return = np.mean(excess_returns) * periods_per_year

    # Calculate beta (systematic risk)
    cov = np.cov(returns, benchmark_returns)[0, 1]
    benchmark_var = np.var(benchmark_returns, ddof=1)

    # Avoid division by zero
    if benchmark_var == 0:
        return 0.0

    beta = cov / benchmark_var

    # Avoid division by zero
    if beta == 0:
        return 0.0

    # Calculate Treynor Ratio
    treynor = mean_excess_return / beta

    return treynor


def calculate_information_ratio(
        returns: Union[List[float], pd.Series, np.ndarray],
        benchmark_returns: Union[List[float], pd.Series, np.ndarray],
        periods_per_year: int = 252
) -> float:
    """
    Calculate the Information Ratio.

    Args:
        returns: Portfolio period returns as decimals
        benchmark_returns: Benchmark period returns as decimals
        periods_per_year: Number of periods in a year

    Returns:
        Information Ratio
    """
    if (not isinstance(returns, (list, pd.Series, np.ndarray)) or
            not isinstance(benchmark_returns, (list, pd.Series, np.ndarray)) or
            len(returns) == 0 or len(benchmark_returns) == 0):
        return 0.0

    # Convert to numpy arrays
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)
    if isinstance(benchmark_returns, (list, pd.Series)):
        benchmark_returns = np.array(benchmark_returns)

    # Ensure arrays have same length
    min_length = min(len(returns), len(benchmark_returns))
    returns = returns[:min_length]
    benchmark_returns = benchmark_returns[:min_length]

    # Calculate active returns (returns - benchmark_returns)
    active_returns = returns - benchmark_returns

    # Calculate annualized active return
    active_return = np.mean(active_returns) * periods_per_year

    # Calculate tracking error (standard deviation of active returns)
    tracking_error = np.std(active_returns, ddof=1) * np.sqrt(periods_per_year)

    # Avoid division by zero
    if tracking_error == 0:
        return 0.0

    # Calculate Information Ratio
    information_ratio = active_return / tracking_error

    return information_ratio


def calculate_value_at_risk(
        returns: Union[List[float], pd.Series, np.ndarray],
        confidence_level: float = 0.95,
        method: str = 'historical'
) -> float:
    """
    Calculate Value at Risk (VaR).

    Args:
        returns: Period returns as decimals
        confidence_level: Confidence level (e.g., 0.95 for 95%)
        method: Method for calculation ('historical', 'parametric', 'monte_carlo')

    Returns:
        Value at Risk as a positive number
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    if method == 'historical':
        # Historical VaR
        var = np.percentile(returns, 100 * (1 - confidence_level))
        return abs(var)

    elif method == 'parametric':
        # Parametric VaR (assuming normal distribution)
        import scipy.stats as stats
        mean = np.mean(returns)
        std = np.std(returns, ddof=1)
        var = mean + std * stats.norm.ppf(1 - confidence_level)
        return abs(var)

    elif method == 'monte_carlo':
        # Monte Carlo VaR
        mean = np.mean(returns)
        std = np.std(returns, ddof=1)

        # Generate random returns
        np.random.seed(42)  # for reproducibility
        simulations = 10000
        simulated_returns = np.random.normal(mean, std, simulations)

        # Calculate VaR
        var = np.percentile(simulated_returns, 100 * (1 - confidence_level))
        return abs(var)

    else:
        raise ValueError(f"Unknown VaR method: {method}")


def calculate_conditional_value_at_risk(
        returns: Union[List[float], pd.Series, np.ndarray],
        confidence_level: float = 0.95
) -> float:
    """
    Calculate Conditional Value at Risk (CVaR) / Expected Shortfall.

    Args:
        returns: Period returns as decimals
        confidence_level: Confidence level (e.g., 0.95 for 95%)

    Returns:
        CVaR as a positive number
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    # Calculate VaR
    var = np.percentile(returns, 100 * (1 - confidence_level))

    # Calculate average of returns below VaR
    cvar_returns = returns[returns <= var]

    if len(cvar_returns) == 0:
        return abs(var)  # Fallback to VaR if no returns are below VaR

    cvar = np.mean(cvar_returns)

    return abs(cvar)


def calculate_alpha(
        returns: Union[List[float], pd.Series, np.ndarray],
        benchmark_returns: Union[List[float], pd.Series, np.ndarray],
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
) -> float:
    """
    Calculate Jensen's Alpha.

    Args:
        returns: Portfolio period returns as decimals
        benchmark_returns: Benchmark period returns as decimals
        risk_free_rate: Annual risk-free rate as decimal
        periods_per_year: Number of periods in a year

    Returns:
        Alpha value
    """
    if (not isinstance(returns, (list, pd.Series, np.ndarray)) or
            not isinstance(benchmark_returns, (list, pd.Series, np.ndarray)) or
            len(returns) == 0 or len(benchmark_returns) == 0):
        return 0.0

    # Convert to numpy arrays
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)
    if isinstance(benchmark_returns, (list, pd.Series)):
        benchmark_returns = np.array(benchmark_returns)

    # Ensure arrays have same length
    min_length = min(len(returns), len(benchmark_returns))
    returns = returns[:min_length]
    benchmark_returns = benchmark_returns[:min_length]

    # Convert annual risk-free rate to period rate
    period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

    # Calculate beta
    cov = np.cov(returns, benchmark_returns)[0, 1]
    benchmark_var = np.var(benchmark_returns, ddof=1)

    # Avoid division by zero
    if benchmark_var == 0:
        return 0.0

    beta = cov / benchmark_var

    # Calculate alpha
    alpha = np.mean(returns) - period_risk_free - beta * (np.mean(benchmark_returns) - period_risk_free)

    # Annualize alpha
    annualized_alpha = alpha * periods_per_year

    return annualized_alpha


def calculate_beta(
        returns: Union[List[float], pd.Series, np.ndarray],
        benchmark_returns: Union[List[float], pd.Series, np.ndarray]
) -> float:
    """
    Calculate Beta (systematic risk).

    Args:
        returns: Portfolio period returns as decimals
        benchmark_returns: Benchmark period returns as decimals

    Returns:
        Beta value
    """
    if (not isinstance(returns, (list, pd.Series, np.ndarray)) or
            not isinstance(benchmark_returns, (list, pd.Series, np.ndarray)) or
            len(returns) == 0 or len(benchmark_returns) == 0):
        return 1.0  # Default to market beta

    # Convert to numpy arrays
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)
    if isinstance(benchmark_returns, (list, pd.Series)):
        benchmark_returns = np.array(benchmark_returns)

    # Ensure arrays have same length
    min_length = min(len(returns), len(benchmark_returns))
    returns = returns[:min_length]
    benchmark_returns = benchmark_returns[:min_length]

    # Calculate covariance and variance
    cov = np.cov(returns, benchmark_returns)[0, 1]
    benchmark_var = np.var(benchmark_returns, ddof=1)

    # Avoid division by zero
    if benchmark_var == 0:
        return 1.0

    beta = cov / benchmark_var

    return beta


def calculate_max_drawdown(
        returns: Union[List[float], pd.Series, np.ndarray]
) -> float:
    """
    Calculate maximum drawdown.

    Args:
        returns: Period returns as decimals

    Returns:
        Maximum drawdown as a positive number
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    # Calculate cumulative returns
    cum_returns = np.cumprod(1 + returns)

    # Calculate running maximum
    running_max = np.maximum.accumulate(cum_returns)

    # Calculate drawdowns
    drawdowns = cum_returns / running_max - 1

    # Get maximum drawdown
    max_drawdown = np.min(drawdowns)

    return abs(max_drawdown)


def calculate_calmar_ratio(
        returns: Union[List[float], pd.Series, np.ndarray],
        periods_per_year: int = 252
) -> float:
    """
    Calculate Calmar Ratio.

    Args:
        returns: Period returns as decimals
        periods_per_year: Number of periods in a year

    Returns:
        Calmar Ratio
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Calculate annualized return
    annualized_return = ((1 + np.mean(returns)) ** periods_per_year) - 1

    # Calculate maximum drawdown
    max_drawdown = calculate_max_drawdown(returns)

    # Avoid division by zero
    if max_drawdown == 0:
        return np.inf if annualized_return > 0 else 0.0

    # Calculate Calmar Ratio
    calmar_ratio = annualized_return / max_drawdown

    return calmar_ratio


def calculate_present_value(
        future_value: float,
        rate: float,
        periods: int
) -> float:
    """
    Calculate Present Value.

    Args:
        future_value: Future value
        rate: Discount rate per period (as decimal)
        periods: Number of periods

    Returns:
        Present value
    """
    if rate <= -1:
        return 0.0  # Invalid rate

    # PV = FV / (1 + r)^n
    present_value = future_value / ((1 + rate) ** periods)

    return present_value


def calculate_future_value(
        present_value: float,
        rate: float,
        periods: int
) -> float:
    """
    Calculate Future Value.

    Args:
        present_value: Present value
        rate: Interest rate per period (as decimal)
        periods: Number of periods

    Returns:
        Future value
    """
    # FV = PV * (1 + r)^n
    future_value = present_value * ((1 + rate) ** periods)

    return future_value


def calculate_internal_rate_of_return(
        cash_flows: Union[List[float], np.ndarray],
        guess: float = 0.1
) -> float:
    """
    Calculate Internal Rate of Return (IRR).

    Args:
        cash_flows: List of cash flows, starting with the initial investment (negative)
        guess: Initial guess for IRR

    Returns:
        IRR as a decimal
    """
    if not cash_flows or len(cash_flows) < 2:
        return 0.0

    try:
        # Numpy's IRR calculation
        return np.irr(cash_flows)
    except (ValueError, RuntimeError):
        # Fallback to a numerical approximation if numpy's method fails
        return calculate_irr_numerical(cash_flows, guess)


def calculate_irr_numerical(
        cash_flows: Union[List[float], np.ndarray],
        guess: float = 0.1,
        max_iterations: int = 100,
        precision: float = 1e-6
) -> float:
    """
    Calculate IRR using numerical approximation (Newton-Raphson method).

    Args:
        cash_flows: List of cash flows, starting with the initial investment (negative)
        guess: Initial guess for IRR
        max_iterations: Maximum number of iterations
        precision: Required precision

    Returns:
        IRR as a decimal
    """
    rate = guess

    # Newton-Raphson method
    for _ in range(max_iterations):
        # Calculate NPV at current rate
        npv = 0
        for i, cf in enumerate(cash_flows):
            npv += cf / ((1 + rate) ** i)

        # If NPV is close enough to zero, return current rate
        if abs(npv) < precision:
            return rate

        # Calculate derivative of NPV
        dnpv = 0
        for i, cf in enumerate(cash_flows):
            if i == 0:
                continue  # Skip first cash flow in derivative
            dnpv -= i * cf / ((1 + rate) ** (i + 1))

        # Avoid division by zero
        if dnpv == 0:
            break

        # Update rate
        new_rate = rate - npv / dnpv

        # Check for convergence
        if abs(new_rate - rate) < precision:
            return new_rate

        rate = new_rate

    return rate  # Return best estimate after max iterations


def calculate_net_present_value(
        cash_flows: Union[List[float], np.ndarray],
        discount_rate: float
) -> float:
    """
    Calculate Net Present Value (NPV).

    Args:
        cash_flows: List of cash flows, starting with the initial investment (negative)
        discount_rate: Discount rate per period (as decimal)

    Returns:
        NPV
    """
    if not cash_flows:
        return 0.0

    # Convert to numpy array
    if isinstance(cash_flows, list):
        cash_flows = np.array(cash_flows)

    # Calculate NPV
    npv = 0
    for i, cf in enumerate(cash_flows):
        npv += cf / ((1 + discount_rate) ** i)

    return npv