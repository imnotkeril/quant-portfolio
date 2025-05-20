# backend/app/utils/formatters.py
from typing import Union, Optional, Dict, Any
import locale
import decimal
from datetime import datetime, date

# Set locale for currency and number formatting
try:
    locale.setlocale(locale.LC_ALL, '')  # Use system default locale
except locale.Error:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')  # Fallback to English


def format_currency(
        value: Union[float, int, decimal.Decimal],
        currency: str = 'USD',
        decimals: int = 2,
        include_symbol: bool = True,
        thousand_separator: bool = True
) -> str:
    """
    Format a value as currency.

    Args:
        value: Numeric value to format
        currency: Currency code (USD, EUR, etc.)
        decimals: Number of decimal places
        include_symbol: Whether to include the currency symbol
        thousand_separator: Whether to include thousand separators

    Returns:
        Formatted currency string
    """
    if value is None:
        return ""

    try:
        # Convert to Decimal for precise decimal handling
        if not isinstance(value, decimal.Decimal):
            value = decimal.Decimal(str(value))

        # Format the number
        value_str = f"{value:,.{decimals}f}" if thousand_separator else f"{value:.{decimals}f}"

        # Add currency symbol based on currency code
        currency_symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CNY': '¥',
            'RUB': '₽',
        }

        if include_symbol:
            symbol = currency_symbols.get(currency, currency)
            if currency in ['USD', 'GBP']:
                return f"{symbol}{value_str}"
            else:
                return f"{value_str} {symbol}"
        else:
            return value_str
    except (ValueError, decimal.InvalidOperation):
        return f"Error: Invalid value for currency formatting: {value}"


def format_percentage(
        value: Union[float, int, decimal.Decimal],
        decimals: int = 2,
        include_symbol: bool = True
) -> str:
    """
    Format a value as a percentage.

    Args:
        value: Numeric value to format (0.1 = 10%)
        decimals: Number of decimal places
        include_symbol: Whether to include the percent symbol

    Returns:
        Formatted percentage string
    """
    if value is None:
        return ""

    try:
        # Convert to Decimal for precise decimal handling
        if not isinstance(value, decimal.Decimal):
            value = decimal.Decimal(str(value))

        # Convert to percentage (multiply by 100)
        percentage = value * 100

        # Format with specified decimal places
        formatted = f"{percentage:.{decimals}f}"

        # Add percent symbol if requested
        if include_symbol:
            return f"{formatted}%"
        else:
            return formatted
    except (ValueError, decimal.InvalidOperation):
        return f"Error: Invalid value for percentage formatting: {value}"


def format_date(
        date_value: Union[datetime, date, str],
        format_str: str = "%Y-%m-%d"
) -> str:
    """
    Format a date value according to the specified format.

    Args:
        date_value: Date to format (datetime, date or string)
        format_str: Format string (default: YYYY-MM-DD)

    Returns:
        Formatted date string
    """
    if date_value is None:
        return ""

    try:
        # Convert string to datetime if needed
        if isinstance(date_value, str):
            date_value = datetime.strptime(date_value, "%Y-%m-%d")

        # Format the date
        return date_value.strftime(format_str)
    except (ValueError, TypeError):
        return f"Error: Invalid date value: {date_value}"


def format_number(
        value: Union[float, int, decimal.Decimal],
        decimals: int = 2,
        thousand_separator: bool = True,
        abbreviate: bool = False
) -> str:
    """
    Format a number with specified decimal places and optional thousand separators.

    Args:
        value: Numeric value to format
        decimals: Number of decimal places
        thousand_separator: Whether to include thousand separators
        abbreviate: Whether to abbreviate large numbers (K, M, B, T)

    Returns:
        Formatted number string
    """
    if value is None:
        return ""

    try:
        # Convert to Decimal for precise decimal handling
        if not isinstance(value, decimal.Decimal):
            value = decimal.Decimal(str(value))

        # Abbreviate large numbers if requested
        if abbreviate:
            abbrev = ""
            for unit in ["", "K", "M", "B", "T"]:
                if abs(value) < 1000:
                    abbrev = unit
                    break
                value /= 1000

            # Format with specified decimal places
            if thousand_separator:
                result = f"{value:,.{decimals}f}{abbrev}"
            else:
                result = f"{value:.{decimals}f}{abbrev}"
        else:
            # Format with specified decimal places
            if thousand_separator:
                result = f"{value:,.{decimals}f}"
            else:
                result = f"{value:.{decimals}f}"

        return result
    except (ValueError, decimal.InvalidOperation):
        return f"Error: Invalid value for number formatting: {value}"


def format_time_period(
        days: int
) -> str:
    """
    Format a number of days as a human-readable time period.

    Args:
        days: Number of days

    Returns:
        Formatted time period string (e.g., "2 years, 3 months, 5 days")
    """
    if days is None:
        return ""

    try:
        years = days // 365
        days = days % 365
        months = days // 30
        days = days % 30

        parts = []
        if years > 0:
            parts.append(f"{years} {'year' if years == 1 else 'years'}")
        if months > 0:
            parts.append(f"{months} {'month' if months == 1 else 'months'}")
        if days > 0 or (years == 0 and months == 0):
            parts.append(f"{days} {'day' if days == 1 else 'days'}")

        return ", ".join(parts)
    except (ValueError, TypeError):
        return f"Error: Invalid value for time period formatting: {days}"


def format_report_data(
        data: Dict[str, Any],
        include_headers: bool = True,
        delimiter: str = ",",
        decimal_places: int = 2
) -> str:
    """
    Format a dictionary of data for reports.

    Args:
        data: Dictionary of data to format
        include_headers: Whether to include column headers
        delimiter: Delimiter character for columns
        decimal_places: Number of decimal places for numeric values

    Returns:
        Formatted string representation of the data
    """
    if not data:
        return ""

    try:
        result = []

        # Add headers if requested
        if include_headers:
            result.append(delimiter.join(data.keys()))

        # Format each value based on its type
        values = []
        for value in data.values():
            if isinstance(value, (float, decimal.Decimal)):
                values.append(f"{value:.{decimal_places}f}")
            elif isinstance(value, (datetime, date)):
                values.append(value.strftime("%Y-%m-%d"))
            else:
                values.append(str(value))

        result.append(delimiter.join(values))
        return "\n".join(result)
    except Exception as e:
        return f"Error: Failed to format report data: {str(e)}"


def format_asset_allocation(
        allocations: Dict[str, float],
        decimal_places: int = 2,
        include_percentage: bool = True
) -> str:
    """
    Format asset allocation data for display.

    Args:
        allocations: Dictionary with asset names as keys and weights as values
        decimal_places: Number of decimal places for percentage values
        include_percentage: Whether to include percentage symbols

    Returns:
        Formatted asset allocation string
    """
    if not allocations:
        return "No allocation data available"

    try:
        total = sum(allocations.values())
        if total <= 0:
            return "Error: Total allocation must be greater than zero"

        items = []
        for asset, weight in sorted(allocations.items(), key=lambda x: x[1], reverse=True):
            percentage = (weight / total) * 100
            formatted_pct = f"{percentage:.{decimal_places}f}"
            if include_percentage:
                formatted_pct += "%"
            items.append(f"{asset}: {formatted_pct}")

        return ", ".join(items)
    except Exception as e:
        return f"Error: Failed to format asset allocation: {str(e)}"