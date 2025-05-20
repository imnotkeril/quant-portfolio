# backend/app/utils/calculations.py
from typing import Dict, List, Union, Any, Optional, Tuple
import numpy as np  # noqa
import pandas as pd  # noqa


def safe_division(
        numerator: Union[float, int],
        denominator: Union[float, int],
        default: Union[float, int] = 0.0
) -> float:
    """
    Perform safe division, returning default value if denominator is zero.

    Args:
        numerator: Value to divide
        denominator: Value to divide by
        default: Default value to return if denominator is zero

    Returns:
        Division result or default value
    """
    if denominator == 0 or denominator is None or np.isnan(denominator):
        return default
    return numerator / denominator


def weighted_average(
        values: List[Union[float, int]],
        weights: List[Union[float, int]]
) -> float:
    """
    Calculate weighted average of values.

    Args:
        values: List of values
        weights: List of weights

    Returns:
        Weighted average
    """
    if not values or not weights or len(values) != len(weights):
        return 0.0

    total_weight = sum(weights)
    if total_weight == 0:
        return 0.0

    weighted_sum = sum(v * w for v, w in zip(values, weights))
    return weighted_sum / total_weight


def compound_annual_growth_rate(
        start_value: Union[float, int],
        end_value: Union[float, int],
        years: Union[float, int]
) -> float:
    """
    Calculate Compound Annual Growth Rate (CAGR).

    Args:
        start_value: Starting value
        end_value: Ending value
        years: Number of years

    Returns:
        CAGR as a decimal (0.05 = 5%)
    """
    if start_value <= 0 or years <= 0:
        return 0.0

    return (end_value / start_value) ** (1 / years) - 1


def geometric_mean(
        returns: List[Union[float, int]]
) -> float:
    """
    Calculate geometric mean of returns (e.g., for annualizing).

    Args:
        returns: List of returns as decimals (0.05 = 5%)

    Returns:
        Geometric mean
    """
    if not returns:
        return 0.0

    # Convert returns to numpy array for calculation
    returns_array = np.array(returns) + 1.0
    return np.prod(returns_array) ** (1.0 / len(returns)) - 1.0


def calculate_moving_average(
        data: Union[List[float], pd.Series, np.ndarray],
        window: int
) -> Union[List[float], pd.Series, np.ndarray]:
    """
    Calculate simple moving average.

    Args:
        data: Data points
        window: Moving average window size

    Returns:
        Moving average values
    """
    if isinstance(data, list):
        data = np.array(data)

    if isinstance(data, pd.Series):
        return data.rolling(window=window, min_periods=1).mean()

    # Numpy array implementation
    result = np.full_like(data, np.nan)
    for i in range(len(data)):
        start_idx = max(0, i - window + 1)
        result[i] = np.mean(data[start_idx:i + 1])

    return result


def calculate_exponential_moving_average(
        data: Union[List[float], pd.Series, np.ndarray],
        span: int
) -> Union[List[float], pd.Series, np.ndarray]:
    """
    Calculate exponential moving average.

    Args:
        data: Data points
        span: EMA span parameter

    Returns:
        EMA values
    """
    if isinstance(data, list):
        data = np.array(data)

    if isinstance(data, pd.Series):
        return data.ewm(span=span, min_periods=1, adjust=False).mean()

    # Implement EMA for numpy array
    result = np.zeros_like(data)
    alpha = 2.0 / (span + 1.0)

    result[0] = data[0]
    for i in range(1, len(data)):
        result[i] = data[i] * alpha + result[i - 1] * (1 - alpha)

    return result


def calculate_percent_change(
        old_value: Union[float, int],
        new_value: Union[float, int]
) -> float:
    """
    Calculate percentage change between two values.

    Args:
        old_value: Original value
        new_value: New value

    Returns:
        Percentage change as a decimal (0.05 = 5%)
    """
    if old_value == 0:
        return float('inf') if new_value > 0 else float('-inf') if new_value < 0 else 0.0

    return (new_value - old_value) / abs(old_value)


def calculate_annualized_return(
        returns: Union[List[float], pd.Series, np.ndarray],
        periods_per_year: int = 252
) -> float:
    """
    Calculate annualized return from a series of period returns.

    Args:
        returns: Period returns as decimals (0.05 = 5%)
        periods_per_year: Number of periods in a year (252 for daily, 52 for weekly, 12 for monthly)

    Returns:
        Annualized return
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    # Calculate cumulative return
    cumulative_return = np.prod(1 + returns) - 1

    # Annualize
    years = len(returns) / periods_per_year
    if years <= 0:
        return 0.0

    return (1 + cumulative_return) ** (1 / years) - 1


def calculate_annualized_volatility(
        returns: Union[List[float], pd.Series, np.ndarray],
        periods_per_year: int = 252
) -> float:
    """
    Calculate annualized volatility (standard deviation) from a series of period returns.

    Args:
        returns: Period returns as decimals (0.05 = 5%)
        periods_per_year: Number of periods in a year (252 for daily, 52 for weekly, 12 for monthly)

    Returns:
        Annualized volatility
    """
    if not isinstance(returns, (list, pd.Series, np.ndarray)) or len(returns) == 0:
        return 0.0

    # Convert to numpy array for calculation
    if isinstance(returns, (list, pd.Series)):
        returns = np.array(returns)

    return np.std(returns, ddof=1) * np.sqrt(periods_per_year)


def calculate_covariance_matrix(
        returns_data: pd.DataFrame
) -> pd.DataFrame:
    """
    Calculate the covariance matrix for a set of returns.

    Args:
        returns_data: DataFrame with asset returns (each column is an asset)

    Returns:
        Covariance matrix as DataFrame
    """
    if returns_data.empty:
        return pd.DataFrame()

    return returns_data.cov()


def calculate_correlation_matrix(
        returns_data: pd.DataFrame
) -> pd.DataFrame:
    """
    Calculate the correlation matrix for a set of returns.

    Args:
        returns_data: DataFrame with asset returns (each column is an asset)

    Returns:
        Correlation matrix as DataFrame
    """
    if returns_data.empty:
        return pd.DataFrame()

    return returns_data.corr()


def calculate_portfolio_return(
        returns_data: pd.DataFrame,
        weights: Dict[str, float]
) -> pd.Series:
    """
    Calculate portfolio returns based on asset returns and weights.

    Args:
        returns_data: DataFrame with asset returns (each column is an asset)
        weights: Dictionary mapping asset names to weights

    Returns:
        Series with portfolio returns
    """
    if returns_data.empty or not weights:
        return pd.Series()

    # Filter returns data to include only assets in weights
    assets = list(weights.keys())
    available_assets = [asset for asset in assets if asset in returns_data.columns]

    if not available_assets:
        return pd.Series(0, index=returns_data.index)

    # Filter and normalize weights
    filtered_weights = {asset: weights[asset] for asset in available_assets}
    total_weight = sum(filtered_weights.values())

    if total_weight <= 0:
        return pd.Series(0, index=returns_data.index)

    normalized_weights = {k: v / total_weight for k, v in filtered_weights.items()}

    # Calculate portfolio return
    portfolio_returns = pd.Series(0, index=returns_data.index)
    for asset, weight in normalized_weights.items():
        portfolio_returns += returns_data[asset] * weight

    return portfolio_returns


def calculate_drawdowns(
        returns: Union[pd.Series, np.ndarray, List[float]]
) -> Tuple[float, pd.Series]:
    """
    Calculate drawdowns from returns series.

    Args:
        returns: Series of returns

    Returns:
        Tuple of (maximum_drawdown, drawdown_series)
    """
    if isinstance(returns, list):
        returns = pd.Series(returns)
    elif isinstance(returns, np.ndarray):
        returns = pd.Series(returns)

    if returns.empty:
        return 0.0, pd.Series()

    # Calculate cumulative returns
    wealth_index = (1 + returns).cumprod()

    # Calculate previous peaks
    previous_peaks = wealth_index.cummax()

    # Calculate drawdowns
    drawdowns = (wealth_index - previous_peaks) / previous_peaks

    # Get maximum drawdown
    max_drawdown = drawdowns.min()

    return abs(max_drawdown), drawdowns


def linear_regression(
        x: Union[List[float], pd.Series, np.ndarray],
        y: Union[List[float], pd.Series, np.ndarray]
) -> Dict[str, float]:
    """
    Perform linear regression and return the slope, intercept, and R-squared.

    Args:
        x: Independent variable values
        y: Dependent variable values

    Returns:
        Dictionary with regression results
    """
    if isinstance(x, list):
        x = np.array(x)
    if isinstance(y, list):
        y = np.array(y)

    if isinstance(x, pd.Series):
        x = x.values
    if isinstance(y, pd.Series):
        y = y.values

    if len(x) != len(y) or len(x) < 2:
        return {
            'slope': 0.0,
            'intercept': 0.0,
            'r_squared': 0.0
        }

    # Remove any NaN values
    mask = ~(np.isnan(x) | np.isnan(y))
    x = x[mask]
    y = y[mask]

    if len(x) < 2:
        return {
            'slope': 0.0,
            'intercept': 0.0,
            'r_squared': 0.0
        }

    # Calculate the regression
    slope, intercept = np.polyfit(x, y, 1)

    # Calculate R-squared
    y_pred = slope * x + intercept
    ss_total = np.sum((y - np.mean(y)) ** 2)
    ss_residual = np.sum((y - y_pred) ** 2)
    r_squared = 1 - (ss_residual / ss_total)

    return {
        'slope': slope,
        'intercept': intercept,
        'r_squared': r_squared
    }