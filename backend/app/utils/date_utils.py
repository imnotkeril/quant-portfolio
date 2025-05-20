# backend/app/utils/date_utils.py
from typing import List, Union, Optional, Tuple
from datetime import datetime, date, timedelta
import pandas as pd
import numpy as np


def parse_date(
        date_str: str,
        formats: List[str] = None
) -> Optional[datetime]:
    """
    Try to parse a date string using various formats.

    Args:
        date_str: Date string to parse
        formats: List of date formats to try (default: common formats)

    Returns:
        Parsed datetime or None if parsing fails
    """
    if not date_str:
        return None

    if formats is None:
        formats = [
            "%Y-%m-%d",  # 2023-01-31
            "%d/%m/%Y",  # 31/01/2023
            "%m/%d/%Y",  # 01/31/2023
            "%B %d, %Y",  # January 31, 2023
            "%d %B %Y",  # 31 January 2023
            "%Y%m%d",  # 20230131
            "%d-%m-%Y",  # 31-01-2023
            "%m-%d-%Y",  # 01-31-2023
            "%d.%m.%Y",  # 31.01.2023
            "%m.%d.%Y"  # 01.31.2023
        ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    return None


def date_to_iso(date_obj: Union[datetime, date]) -> str:
    """
    Convert a date object to ISO format (YYYY-MM-DD).

    Args:
        date_obj: Date object to convert

    Returns:
        ISO formatted date string
    """
    if isinstance(date_obj, datetime):
        return date_obj.date().isoformat()
    elif isinstance(date_obj, date):
        return date_obj.isoformat()
    return ""


def get_date_range(
        start_date: Union[str, datetime, date],
        end_date: Union[str, datetime, date],
        freq: str = "D"
) -> List[datetime]:
    """
    Generate a list of dates between start_date and end_date.

    Args:
        start_date: Start date
        end_date: End date
        freq: Frequency ('D' for daily, 'W' for weekly, 'M' for monthly)

    Returns:
        List of dates in the range
    """
    # Parse strings if needed
    if isinstance(start_date, str):
        start_date = parse_date(start_date)
    if isinstance(end_date, str):
        end_date = parse_date(end_date)

    if not start_date or not end_date:
        return []

    # Convert to pandas Timestamp for date_range function
    start_ts = pd.Timestamp(start_date)
    end_ts = pd.Timestamp(end_date)

    # Generate date range
    date_range = pd.date_range(start=start_ts, end=end_ts, freq=freq)

    # Convert to python datetime objects
    return [date.to_pydatetime() for date in date_range]


def get_trading_days(
        start_date: Union[str, datetime, date],
        end_date: Union[str, datetime, date],
        calendar: str = "NYSE"
) -> List[datetime]:
    """
    Get trading days between start_date and end_date.

    Args:
        start_date: Start date
        end_date: End date
        calendar: Trading calendar to use ('NYSE', 'NASDAQ', 'LSE', etc.)

    Returns:
        List of trading days
    """
    # Parse strings if needed
    if isinstance(start_date, str):
        start_date = parse_date(start_date)
    if isinstance(end_date, str):
        end_date = parse_date(end_date)

    if not start_date or not end_date:
        return []

    # Convert to pandas Timestamp
    start_ts = pd.Timestamp(start_date)
    end_ts = pd.Timestamp(end_date)

    # Generate a date range
    all_days = pd.date_range(start=start_ts, end=end_ts, freq='D')

    # Simple approximation of trading days (weekdays)
    # In a real implementation, you would use a proper trading calendar library
    trading_days = [d for d in all_days if d.dayofweek < 5]  # 0-4 are Monday to Friday

    # Convert to python datetime objects
    return [date.to_pydatetime() for date in trading_days]


def get_period_start_end(
        period: str,
        end_date: Union[str, datetime, date] = None
) -> Tuple[datetime, datetime]:
    """
    Get start and end dates for a specified period.

    Args:
        period: Period string ('1d', '1w', '1m', '3m', '6m', '1y', '3y', '5y', 'ytd', 'max')
        end_date: End date (defaults to current date)

    Returns:
        Tuple of (start_date, end_date)
    """
    # Set end date to today if not provided
    if end_date is None:
        end_date = datetime.now().date()

    # Parse string if needed
    if isinstance(end_date, str):
        end_date = parse_date(end_date)
        if end_date is None:
            end_date = datetime.now().date()

    # Convert datetime to date if needed
    if isinstance(end_date, datetime):
        end_date = end_date.date()

    # Calculate start date based on period
    if period == '1d':
        start_date = end_date - timedelta(days=1)
    elif period == '1w':
        start_date = end_date - timedelta(weeks=1)
    elif period == '1m':
        start_date = end_date - timedelta(days=30)
    elif period == '3m':
        start_date = end_date - timedelta(days=90)
    elif period == '6m':
        start_date = end_date - timedelta(days=180)
    elif period == '1y':
        start_date = end_date - timedelta(days=365)
    elif period == '3y':
        start_date = end_date - timedelta(days=365 * 3)
    elif period == '5y':
        start_date = end_date - timedelta(days=365 * 5)
    elif period == '10y':
        start_date = end_date - timedelta(days=365 * 10)
    elif period == 'ytd':
        start_date = datetime(end_date.year, 1, 1).date()
    elif period == 'max':
        start_date = datetime(1900, 1, 1).date()  # A very early date
    else:
        # Default to 1 year
        start_date = end_date - timedelta(days=365)

    return datetime.combine(start_date, datetime.min.time()), datetime.combine(end_date, datetime.min.time())


def get_period_label(period: str) -> str:
    """
    Get a human-readable label for a period.

    Args:
        period: Period string ('1d', '1w', '1m', '3m', '6m', '1y', '3y', '5y', 'ytd', 'max')

    Returns:
        Human-readable period label
    """
    period_labels = {
        '1d': '1 Day',
        '1w': '1 Week',
        '1m': '1 Month',
        '3m': '3 Months',
        '6m': '6 Months',
        '1y': '1 Year',
        '3y': '3 Years',
        '5y': '5 Years',
        '10y': '10 Years',
        'ytd': 'Year to Date',
        'max': 'Maximum'
    }

    return period_labels.get(period, period)


def date_offset(
        date_obj: Union[datetime, date],
        years: int = 0,
        months: int = 0,
        days: int = 0
) -> Union[datetime, date]:
    """
    Offset a date by a specified number of years, months, and days.

    Args:
        date_obj: Date to offset
        years: Number of years to offset
        months: Number of months to offset
        days: Number of days to offset

    Returns:
        Offset date
    """
    if not date_obj:
        return None

    # Convert to datetime if needed
    dt = date_obj
    if isinstance(date_obj, date) and not isinstance(date_obj, datetime):
        dt = datetime.combine(date_obj, datetime.min.time())

    # Apply offsets
    if years != 0:
        dt = dt.replace(year=dt.year + years)

    if months != 0:
        month = dt.month - 1 + months
        year = dt.year + month // 12
        month = month % 12 + 1
        day = min(dt.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
                           31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
        dt = dt.replace(year=year, month=month, day=day)

    if days != 0:
        dt = dt + timedelta(days=days)

    # Return same type as input
    if isinstance(date_obj, date) and not isinstance(date_obj, datetime):
        return dt.date()

    return dt


def get_fiscal_year_dates(
        fiscal_year: int,
        fiscal_year_end_month: int = 12,
        fiscal_year_end_day: int = 31
) -> Tuple[datetime, datetime]:
    """
    Get start and end dates for a fiscal year.

    Args:
        fiscal_year: Fiscal year
        fiscal_year_end_month: Month of fiscal year end (1-12)
        fiscal_year_end_day: Day of fiscal year end

    Returns:
        Tuple of (start_date, end_date)
    """
    # Validate inputs
    if not 1 <= fiscal_year_end_month <= 12:
        fiscal_year_end_month = 12

    if not 1 <= fiscal_year_end_day <= 31:
        fiscal_year_end_day = last_day_of_month(fiscal_year, fiscal_year_end_month)

    # Calculate end date
    end_date = datetime(fiscal_year, fiscal_year_end_month, fiscal_year_end_day)

    # Calculate start date (day after the end of previous fiscal year)
    if fiscal_year_end_month == 12 and fiscal_year_end_day == 31:
        # Calendar year
        start_date = datetime(fiscal_year, 1, 1)
    else:
        # Previous fiscal year end
        prev_year_end = datetime(fiscal_year - 1, fiscal_year_end_month, fiscal_year_end_day)
        # Start date is the day after
        start_date = prev_year_end + timedelta(days=1)

    return start_date, end_date


def last_day_of_month(year: int, month: int) -> int:
    """
    Get the last day of a month.

    Args:
        year: Year
        month: Month (1-12)

    Returns:
        Last day of the month (28-31)
    """
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)

    return (next_month - timedelta(days=1)).day


def is_trading_day(date_obj: Union[datetime, date], calendar: str = "NYSE") -> bool:
    """
    Check if a date is a trading day.

    Args:
        date_obj: Date to check
        calendar: Trading calendar to use ('NYSE', 'NASDAQ', 'LSE', etc.)

    Returns:
        True if trading day, False otherwise
    """
    # Simple implementation - just check if it's a weekday
    # In a real implementation, you would use a proper trading calendar library
    # that accounts for holidays
    if isinstance(date_obj, datetime):
        date_obj = date_obj.date()

    return date_obj.weekday() < 5  # 0-4 are Monday to Friday


def get_quarter_start_end(year: int, quarter: int) -> Tuple[date, date]:
    """
    Get start and end dates for a specific quarter.

    Args:
        year: Year
        quarter: Quarter (1-4)

    Returns:
        Tuple of (start_date, end_date)
    """
    if not 1 <= quarter <= 4:
        raise ValueError("Quarter must be between 1 and 4")

    start_month = (quarter - 1) * 3 + 1
    end_month = quarter * 3

    start_date = date(year, start_month, 1)

    if end_month == 12:
        end_date = date(year, end_month, 31)
    else:
        # Last day of the end month
        next_month = date(year, end_month + 1, 1)
        end_date = next_month - timedelta(days=1)

    return start_date, end_date