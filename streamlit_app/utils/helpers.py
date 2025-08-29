"""
Helper functions for Wild Market Capital Streamlit app.
Utility functions for common operations and data processing.
"""
import streamlit as st
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timedelta
import hashlib
import json
import time
import logging


def generate_portfolio_id(name: str, timestamp: Optional[datetime] = None) -> str:
    """
    Generate a unique portfolio ID.

    Args:
        name: Portfolio name
        timestamp: Optional timestamp (defaults to now)

    Returns:
        Unique portfolio ID
    """
    if timestamp is None:
        timestamp = datetime.now()

    # Create a hash based on name and timestamp
    content = f"{name}_{timestamp.isoformat()}"
    hash_object = hashlib.md5(content.encode())
    hash_hex = hash_object.hexdigest()[:8]

    # Format: portfolio_YYYYMMDD_HHMMSS_hash
    date_str = timestamp.strftime("%Y%m%d_%H%M%S")
    return f"portfolio_{date_str}_{hash_hex}"


def normalize_weights(weights: List[float], target_sum: float = 1.0) -> List[float]:
    """
    Normalize weights to sum to target value.

    Args:
        weights: List of weight values
        target_sum: Target sum (1.0 for decimal, 100.0 for percentage)

    Returns:
        Normalized weights list
    """
    if not weights:
        return []

    current_sum = sum(weights)
    if current_sum == 0:
        # Equal weights if all are zero
        equal_weight = target_sum / len(weights)
        return [equal_weight] * len(weights)

    # Normalize to target sum
    factor = target_sum / current_sum
    return [w * factor for w in weights]


def calculate_portfolio_value(assets: List[Dict[str, Any]]) -> float:
    """
    Calculate total portfolio value from assets.

    Args:
        assets: List of asset dictionaries with 'shares' and 'price'

    Returns:
        Total portfolio value
    """
    total_value = 0.0

    for asset in assets:
        shares = asset.get('shares', 0)
        price = asset.get('current_price', 0)

        if shares and price:
            total_value += float(shares) * float(price)

    return total_value


def convert_weights_to_shares(
        weights: List[float],
        prices: List[float],
        total_investment: float
) -> List[float]:
    """
    Convert percentage weights to number of shares.

    Args:
        weights: List of weights (as decimals, e.g., 0.25 for 25%)
        prices: List of current prices
        total_investment: Total amount to invest

    Returns:
        List of share quantities
    """
    shares = []

    for weight, price in zip(weights, prices):
        if price > 0:
            dollar_amount = weight * total_investment
            share_count = dollar_amount / price
            shares.append(share_count)
        else:
            shares.append(0.0)

    return shares


def get_trading_days(start_date: datetime, end_date: datetime) -> int:
    """
    Calculate number of trading days between two dates.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        Number of trading days
    """
    # Simple approximation: exclude weekends
    total_days = (end_date - start_date).days
    weeks = total_days // 7
    remaining_days = total_days % 7

    # Count weekend days in remaining days
    weekend_days = 0
    current_date = start_date + timedelta(days=weeks * 7)

    for i in range(remaining_days):
        if (current_date + timedelta(days=i)).weekday() >= 5:  # Saturday or Sunday
            weekend_days += 1

    trading_days = total_days - (weeks * 2) - weekend_days
    return max(0, trading_days)


def annualize_return(total_return: float, days: int) -> float:
    """
    Annualize a total return based on number of days.

    Args:
        total_return: Total return as decimal (e.g., 0.15 for 15%)
        days: Number of days

    Returns:
        Annualized return
    """
    if days <= 0:
        return 0.0

    years = days / 365.25
    if years == 0:
        return 0.0

    # Compound annualization: (1 + total_return)^(1/years) - 1
    annualized = (1 + total_return) ** (1 / years) - 1
    return annualized


def calculate_compound_return(returns: List[float]) -> float:
    """
    Calculate compound return from a series of returns.

    Args:
        returns: List of periodic returns (as decimals)

    Returns:
        Compound return
    """
    compound = 1.0
    for ret in returns:
        compound *= (1 + ret)

    return compound - 1


def create_date_range(
        start_date: Union[str, datetime],
        end_date: Union[str, datetime],
        freq: str = "D"
) -> pd.DatetimeIndex:
    """
    Create a date range for analysis.

    Args:
        start_date: Start date
        end_date: End date
        freq: Frequency ('D' for daily, 'B' for business days, 'W' for weekly)

    Returns:
        Pandas DatetimeIndex
    """
    return pd.date_range(start=start_date, end=end_date, freq=freq)


def rebalance_portfolio(
        current_weights: List[float],
        target_weights: List[float],
        tolerance: float = 0.05
) -> Tuple[bool, List[float]]:
    """
    Check if portfolio needs rebalancing and calculate adjustments.

    Args:
        current_weights: Current portfolio weights
        target_weights: Target portfolio weights
        tolerance: Tolerance for rebalancing trigger

    Returns:
        Tuple of (needs_rebalancing, adjustment_amounts)
    """
    if len(current_weights) != len(target_weights):
        return True, [0.0] * len(current_weights)

    adjustments = []
    needs_rebalancing = False

    for current, target in zip(current_weights, target_weights):
        diff = target - current
        adjustments.append(diff)

        if abs(diff) > tolerance:
            needs_rebalancing = True

    return needs_rebalancing, adjustments


def create_summary_stats(data: pd.Series) -> Dict[str, float]:
    """
    Create summary statistics for a data series.

    Args:
        data: Pandas Series with numeric data

    Returns:
        Dictionary with summary statistics
    """
    if data.empty:
        return {}

    return {
        'count': len(data),
        'mean': data.mean(),
        'std': data.std(),
        'min': data.min(),
        'max': data.max(),
        'median': data.median(),
        'q25': data.quantile(0.25),
        'q75': data.quantile(0.75),
        'skew': data.skew(),
        'kurt': data.kurtosis()
    }


def cache_data(key: str, data: Any, ttl_seconds: int = 300) -> None:
    """
    Cache data in Streamlit session state with TTL.

    Args:
        key: Cache key
        data: Data to cache
        ttl_seconds: Time to live in seconds
    """
    cache_entry = {
        'data': data,
        'timestamp': time.time(),
        'ttl': ttl_seconds
    }
    st.session_state[f'cache_{key}'] = cache_entry


def get_cached_data(key: str) -> Optional[Any]:
    """
    Get cached data from Streamlit session state.

    Args:
        key: Cache key

    Returns:
        Cached data or None if expired/not found
    """
    cache_key = f'cache_{key}'

    if cache_key not in st.session_state:
        return None

    cache_entry = st.session_state[cache_key]

    # Check if expired
    if time.time() - cache_entry['timestamp'] > cache_entry['ttl']:
        del st.session_state[cache_key]
        return None

    return cache_entry['data']


def clear_cache(pattern: Optional[str] = None) -> None:
    """
    Clear cached data from session state.

    Args:
        pattern: Optional pattern to match keys (clears all cache if None)
    """
    keys_to_remove = []

    for key in st.session_state.keys():
        if key.startswith('cache_'):
            if pattern is None or pattern in key:
                keys_to_remove.append(key)

    for key in keys_to_remove:
        del st.session_state[key]


def serialize_for_json(obj: Any) -> Any:
    """
    Serialize object for JSON storage.

    Args:
        obj: Object to serialize

    Returns:
        JSON-serializable object
    """
    if isinstance(obj, (datetime, pd.Timestamp)):
        return obj.isoformat()
    elif isinstance(obj, pd.Series):
        return obj.to_dict()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient='records')
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.integer, np.floating)):
        return float(obj)
    else:
        return obj


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    Split a list into chunks of specified size.

    Args:
        lst: List to chunk
        chunk_size: Size of each chunk

    Returns:
        List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def safe_get(dictionary: Dict, key: str, default: Any = None) -> Any:
    """
    Safely get value from dictionary with nested key support.

    Args:
        dictionary: Dictionary to search
        key: Key (supports dot notation for nested keys)
        default: Default value if key not found

    Returns:
        Value or default
    """
    try:
        keys = key.split('.')
        value = dictionary

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value
    except:
        return default


def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple dictionaries.

    Args:
        *dicts: Dictionaries to merge

    Returns:
        Merged dictionary
    """
    result = {}
    for d in dicts:
        if isinstance(d, dict):
            result.update(d)
    return result


def retry_with_backoff(
        func: callable,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
        exceptions: Tuple = (Exception,)
) -> Any:
    """
    Retry a function with exponential backoff.

    Args:
        func: Function to retry
        max_retries: Maximum number of retries
        backoff_factor: Backoff multiplier
        exceptions: Tuple of exceptions to catch

    Returns:
        Function result

    Raises:
        Last exception if all retries fail
    """
    last_exception = None

    for attempt in range(max_retries + 1):
        try:
            return func()
        except exceptions as e:
            last_exception = e
            if attempt < max_retries:
                sleep_time = backoff_factor * (2 ** attempt)
                time.sleep(sleep_time)
            else:
                raise last_exception


def format_error_message(error: Exception, context: str = "") -> str:
    """
    Format error message for user display.

    Args:
        error: Exception object
        context: Additional context

    Returns:
        Formatted error message
    """
    error_type = type(error).__name__
    error_msg = str(error)

    if context:
        return f"{context}: {error_type} - {error_msg}"
    else:
        return f"{error_type}: {error_msg}"


def log_performance(func_name: str, start_time: float, end_time: float) -> None:
    """
    Log performance metrics.

    Args:
        func_name: Name of function
        start_time: Start timestamp
        end_time: End timestamp
    """
    duration = end_time - start_time
    logging.info(f"Performance: {func_name} took {duration:.3f} seconds")

    # Also log to Streamlit if in debug mode
    if hasattr(st, 'session_state') and st.session_state.get('debug_mode', False):
        st.sidebar.text(f"{func_name}: {duration:.3f}s")