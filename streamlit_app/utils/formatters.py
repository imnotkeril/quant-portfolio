"""
Data formatting utilities for Wild Market Capital.
Professional financial data formatting functions for Streamlit app.
"""
import pandas as pd
import numpy as np
from typing import Union, Optional, Any
from datetime import datetime, date
import math


def format_percentage(
        value: Union[float, int, np.number],
        decimals: int = 2,
        include_sign: bool = False
) -> str:
    """
    Format a decimal value as a percentage.

    Args:
        value: Decimal value (0.15 = 15%)
        decimals: Number of decimal places
        include_sign: Whether to include + for positive values

    Returns:
        Formatted percentage string
    """
    if pd.isna(value) or value is None:
        return "N/A"

    try:
        percentage = float(value) * 100
        sign = "+" if include_sign and percentage > 0 else ""
        return f"{sign}{percentage:.{decimals}f}%"
    except (ValueError, TypeError):
        return "N/A"


def format_currency(
        value: Union[float, int, np.number],
        currency: str = "$",
        decimals: int = 2,
        compact: bool = False
) -> str:
    """
    Format a value as currency.

    Args:
        value: Numeric value
        currency: Currency symbol
        decimals: Number of decimal places
        compact: Whether to use compact notation (K, M, B)

    Returns:
        Formatted currency string
    """
    if pd.isna(value) or value is None:
        return f"{currency}N/A"

    try:
        num_value = float(value)

        if compact:
            return f"{currency}{format_large_number(num_value, decimals)}"
        else:
            return f"{currency}{num_value:,.{decimals}f}"
    except (ValueError, TypeError):
        return f"{currency}N/A"


def format_number(
        value: Union[float, int, np.number],
        decimals: int = 2,
        thousands_sep: bool = True
) -> str:
    """
    Format a number with proper separators.

    Args:
        value: Numeric value
        decimals: Number of decimal places
        thousands_sep: Whether to include thousands separator

    Returns:
        Formatted number string
    """
    if pd.isna(value) or value is None:
        return "N/A"

    try:
        num_value = float(value)

        if thousands_sep:
            return f"{num_value:,.{decimals}f}"
        else:
            return f"{num_value:.{decimals}f}"
    except (ValueError, TypeError):
        return "N/A"


def format_large_number(
        value: Union[float, int, np.number],
        decimals: int = 1
) -> str:
    """
    Format large numbers with K, M, B, T suffixes.

    Args:
        value: Numeric value
        decimals: Number of decimal places for the coefficient

    Returns:
        Formatted compact number string
    """
    if pd.isna(value) or value is None:
        return "N/A"

    try:
        num_value = float(value)
        abs_value = abs(num_value)
        sign = "-" if num_value < 0 else ""

        if abs_value >= 1e12:  # Trillions
            return f"{sign}{abs_value / 1e12:.{decimals}f}T"
        elif abs_value >= 1e9:  # Billions
            return f"{sign}{abs_value / 1e9:.{decimals}f}B"
        elif abs_value >= 1e6:  # Millions
            return f"{sign}{abs_value / 1e6:.{decimals}f}M"
        elif abs_value >= 1e3:  # Thousands
            return f"{sign}{abs_value / 1e3:.{decimals}f}K"
        else:
            return f"{sign}{abs_value:.{decimals}f}"
    except (ValueError, TypeError):
        return "N/A"


def format_date(
        date_value: Union[str, datetime, date],
        format_type: str = "short"
) -> str:
    """
    Format date values consistently.

    Args:
        date_value: Date value (string, datetime, or date object)
        format_type: Format type ('short', 'long', 'iso')

    Returns:
        Formatted date string
    """
    if pd.isna(date_value) or date_value is None or date_value == "":
        return "N/A"

    try:
        # Convert string to datetime if needed
        if isinstance(date_value, str):
            # Try different parsing formats
            for fmt in ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"]:
                try:
                    date_value = datetime.strptime(date_value.split('T')[0] if 'T' in date_value else date_value,
                                                   "%Y-%m-%d")
                    break
                except ValueError:
                    continue
            else:
                # If no format worked, try pandas
                date_value = pd.to_datetime(date_value)

        # Format based on type
        if format_type == "short":
            return date_value.strftime("%m/%d/%Y")
        elif format_type == "long":
            return date_value.strftime("%B %d, %Y")
        elif format_type == "iso":
            return date_value.strftime("%Y-%m-%d")
        else:
            return date_value.strftime("%m/%d/%Y")

    except (ValueError, TypeError, AttributeError):
        return str(date_value) if date_value else "N/A"


def format_ratio(
        value: Union[float, int, np.number],
        decimals: int = 2,
        suffix: str = ""
) -> str:
    """
    Format ratio values (like Sharpe ratio, beta, etc.).

    Args:
        value: Numeric value
        decimals: Number of decimal places
        suffix: Optional suffix (e.g., "x" for multiples)

    Returns:
        Formatted ratio string
    """
    if pd.isna(value) or value is None:
        return "N/A"

    try:
        num_value = float(value)
        return f"{num_value:.{decimals}f}{suffix}"
    except (ValueError, TypeError):
        return "N/A"


def format_basis_points(
        value: Union[float, int, np.number],
        decimals: int = 0
) -> str:
    """
    Format a decimal value as basis points.

    Args:
        value: Decimal value (0.01 = 100 basis points)
        decimals: Number of decimal places

    Returns:
        Formatted basis points string
    """
    if pd.isna(value) or value is None:
        return "N/A"

    try:
        basis_points = float(value) * 10000
        return f"{basis_points:.{decimals}f} bps"
    except (ValueError, TypeError):
        return "N/A"


def format_duration(
        days: Union[int, float],
        unit: str = "auto"
) -> str:
    """
    Format duration in days to human-readable format.

    Args:
        days: Number of days
        unit: Unit to use ('auto', 'days', 'weeks', 'months', 'years')

    Returns:
        Formatted duration string
    """
    if pd.isna(days) or days is None:
        return "N/A"

    try:
        days_value = float(days)

        if unit == "auto":
            if days_value >= 365:
                years = days_value / 365
                return f"{years:.1f} years"
            elif days_value >= 30:
                months = days_value / 30
                return f"{months:.1f} months"
            elif days_value >= 7:
                weeks = days_value / 7
                return f"{weeks:.1f} weeks"
            else:
                return f"{days_value:.0f} days"
        elif unit == "years":
            return f"{days_value / 365:.1f} years"
        elif unit == "months":
            return f"{days_value / 30:.1f} months"
        elif unit == "weeks":
            return f"{days_value / 7:.1f} weeks"
        else:
            return f"{days_value:.0f} days"

    except (ValueError, TypeError):
        return "N/A"


def safe_divide(
        numerator: Union[float, int, np.number],
        denominator: Union[float, int, np.number],
        default: float = 0.0
) -> float:
    """
    Safely divide two numbers, handling zero division and NaN values.

    Args:
        numerator: Numerator value
        denominator: Denominator value
        default: Default value to return on error

    Returns:
        Division result or default value
    """
    try:
        if pd.isna(numerator) or pd.isna(denominator) or denominator == 0:
            return default
        return float(numerator) / float(denominator)
    except (ValueError, TypeError, ZeroDivisionError):
        return default


def clean_numeric_series(
        series: pd.Series,
        fill_method: str = "forward",
        default_fill: float = 0.0
) -> pd.Series:
    """
    Clean a numeric series by handling NaN values.

    Args:
        series: Input pandas Series
        fill_method: Method to fill NaN values ('forward', 'backward', 'mean', 'median', 'zero')
        default_fill: Default value to use if fill_method fails

    Returns:
        Cleaned Series
    """
    cleaned = series.copy()

    # Handle NaN values
    if fill_method == "forward":
        cleaned = cleaned.fillna(method='ffill').fillna(default_fill)
    elif fill_method == "backward":
        cleaned = cleaned.fillna(method='bfill').fillna(default_fill)
    elif fill_method == "mean":
        cleaned = cleaned.fillna(cleaned.mean()).fillna(default_fill)
    elif fill_method == "median":
        cleaned = cleaned.fillna(cleaned.median()).fillna(default_fill)
    else:  # zero or default
        cleaned = cleaned.fillna(default_fill)

    return cleaned


def format_metric_for_display(
        value: Any,
        metric_type: str,
        decimals: int = 2,
        compact: bool = False
) -> str:
    """
    Universal metric formatter based on metric type.

    Args:
        value: Value to format
        metric_type: Type of metric ('percentage', 'currency', 'ratio', etc.)
        decimals: Number of decimal places
        compact: Whether to use compact notation

    Returns:
        Formatted metric string
    """
    if metric_type == "percentage":
        return format_percentage(value, decimals)
    elif metric_type == "currency":
        return format_currency(value, decimals=decimals, compact=compact)
    elif metric_type == "ratio":
        return format_ratio(value, decimals)
    elif metric_type == "number":
        return format_large_number(value, decimals) if compact else format_number(value, decimals)
    elif metric_type == "basis_points":
        return format_basis_points(value, decimals)
    elif metric_type == "duration":
        return format_duration(value)
    elif metric_type == "date":
        return format_date(value)
    else:
        return str(value) if value is not None else "N/A"