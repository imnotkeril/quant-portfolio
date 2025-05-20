# backend/app/utils/validators.py
from typing import Dict, List, Union, Any, Optional, Set, Tuple
import re
from datetime import datetime, date

# Regular expressions for validation
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
TICKER_PATTERN = re.compile(r"^[A-Z0-9.]{1,5}$")
UUID_PATTERN = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def validate_email(email: str) -> bool:
    """
    Validate that a string is a properly formatted email address.

    Args:
        email: Email address to validate

    Returns:
        True if valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False

    return bool(EMAIL_PATTERN.match(email))


def validate_ticker(ticker: str) -> bool:
    """
    Validate that a string is a properly formatted stock ticker symbol.

    Args:
        ticker: Ticker symbol to validate

    Returns:
        True if valid, False otherwise
    """
    if not ticker or not isinstance(ticker, str):
        return False

    return bool(TICKER_PATTERN.match(ticker))


def validate_uuid(uuid_str: str) -> bool:
    """
    Validate that a string is a properly formatted UUID.

    Args:
        uuid_str: UUID string to validate

    Returns:
        True if valid, False otherwise
    """
    if not uuid_str or not isinstance(uuid_str, str):
        return False

    return bool(UUID_PATTERN.match(uuid_str))


def validate_date(date_str: str, format_str: str = "%Y-%m-%d") -> bool:
    """
    Validate that a string is a properly formatted date.

    Args:
        date_str: Date string to validate
        format_str: Expected date format string

    Returns:
        True if valid, False otherwise
    """
    if not date_str or not isinstance(date_str, str):
        return False

    try:
        datetime.strptime(date_str, format_str)
        return True
    except ValueError:
        return False


def validate_percentage(value: Union[float, int, str], allow_negative: bool = False) -> bool:
    """
    Validate that a value is a proper percentage (0-100 or 0-1).

    Args:
        value: Value to validate
        allow_negative: Whether to allow negative percentages

    Returns:
        True if valid, False otherwise
    """
    try:
        # Convert string to float if needed
        if isinstance(value, str):
            # Remove % sign if present
            if value.endswith('%'):
                value = value[:-1]
            value = float(value)

        # Check if value is a number
        if not isinstance(value, (int, float)):
            return False

        # Handle both 0-1 and 0-100 scale
        if 0 <= value <= 1:
            return True
        elif 0 <= value <= 100:
            return True
        elif allow_negative and -1 <= value <= 0:
            return True
        elif allow_negative and -100 <= value <= 0:
            return True

        return False
    except (ValueError, TypeError):
        return False


def validate_portfolio_weights(weights: Dict[str, float], tolerance: float = 0.01) -> bool:
    """
    Validate that portfolio weights sum to approximately 1.0.

    Args:
        weights: Dictionary of asset weights
        tolerance: Acceptable deviation from 1.0

    Returns:
        True if valid, False otherwise
    """
    if not weights:
        return False

    try:
        total = sum(weights.values())
        return abs(total - 1.0) <= tolerance
    except (ValueError, TypeError):
        return False


def validate_date_range(start_date: str, end_date: str, format_str: str = "%Y-%m-%d") -> bool:
    """
    Validate that a date range is valid (start_date <= end_date).

    Args:
        start_date: Start date string
        end_date: End date string
        format_str: Date format string

    Returns:
        True if valid, False otherwise
    """
    if not validate_date(start_date, format_str) or not validate_date(end_date, format_str):
        return False

    try:
        start = datetime.strptime(start_date, format_str)
        end = datetime.strptime(end_date, format_str)
        return start <= end
    except ValueError:
        return False


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Tuple[bool, List[str]]:
    """
    Validate that a dictionary contains all required fields.

    Args:
        data: Dictionary to validate
        required_fields: List of required field names

    Returns:
        Tuple of (is_valid, list_of_missing_fields)
    """
    if not data or not required_fields:
        return False, required_fields

    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)

    return len(missing_fields) == 0, missing_fields


def validate_numeric_range(
        value: Union[int, float],
        min_value: Optional[Union[int, float]] = None,
        max_value: Optional[Union[int, float]] = None
) -> bool:
    """
    Validate that a numeric value is within a specified range.

    Args:
        value: Numeric value to validate
        min_value: Minimum allowed value (inclusive)
        max_value: Maximum allowed value (inclusive)

    Returns:
        True if valid, False otherwise
    """
    if not isinstance(value, (int, float)):
        return False

    if min_value is not None and value < min_value:
        return False

    if max_value is not None and value > max_value:
        return False

    return True


def validate_string_length(
        value: str,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None
) -> bool:
    """
    Validate that a string's length is within a specified range.

    Args:
        value: String to validate
        min_length: Minimum allowed length (inclusive)
        max_length: Maximum allowed length (inclusive)

    Returns:
        True if valid, False otherwise
    """
    if not isinstance(value, str):
        return False

    if min_length is not None and len(value) < min_length:
        return False

    if max_length is not None and len(value) > max_length:
        return False

    return True


def validate_asset_data(asset_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate that asset data contains all required fields and values.

    Args:
        asset_data: Dictionary with asset data

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    required_fields = ["ticker"]
    for field in required_fields:
        if field not in asset_data or not asset_data[field]:
            errors.append(f"Missing required field: {field}")

    # Validate ticker format
    if "ticker" in asset_data and asset_data["ticker"]:
        if not validate_ticker(asset_data["ticker"]):
            errors.append("Invalid ticker format")

    # Validate weight if present
    if "weight" in asset_data:
        if asset_data["weight"] is not None:
            try:
                weight = float(asset_data["weight"])
                if weight < 0:
                    errors.append("Weight cannot be negative")
            except (ValueError, TypeError):
                errors.append("Weight must be a number")

    # Validate price fields if present
    for price_field in ["current_price", "purchase_price"]:
        if price_field in asset_data and asset_data[price_field] is not None:
            try:
                price = float(asset_data[price_field])
                if price < 0:
                    errors.append(f"{price_field} cannot be negative")
            except (ValueError, TypeError):
                errors.append(f"{price_field} must be a number")

    # Validate dates if present
    if "purchase_date" in asset_data and asset_data["purchase_date"]:
        date_str = asset_data["purchase_date"]
        if isinstance(date_str, str) and not validate_date(date_str):
            errors.append("Invalid purchase_date format (should be YYYY-MM-DD)")

    return len(errors) == 0, errors


def validate_portfolio_data(portfolio_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate that portfolio data contains all required fields and valid values.

    Args:
        portfolio_data: Dictionary with portfolio data

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    required_fields = ["name"]
    for field in required_fields:
        if field not in portfolio_data or not portfolio_data[field]:
            errors.append(f"Missing required field: {field}")

    # Validate assets if present
    if "assets" in portfolio_data and portfolio_data["assets"]:
        if not isinstance(portfolio_data["assets"], list):
            errors.append("Assets must be a list")
        else:
            asset_tickers = set()
            for idx, asset in enumerate(portfolio_data["assets"]):
                is_valid, asset_errors = validate_asset_data(asset)
                if not is_valid:
                    for err in asset_errors:
                        errors.append(f"Asset {idx} error: {err}")

                # Check for duplicate tickers
                if "ticker" in asset:
                    ticker = asset["ticker"]
                    if ticker in asset_tickers:
                        errors.append(f"Duplicate ticker in assets: {ticker}")
                    asset_tickers.add(ticker)

    return len(errors) == 0, errors