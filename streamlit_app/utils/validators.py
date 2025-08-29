"""
Input validation utilities for Wild Market Capital Streamlit app.
Validation functions for user input and data integrity.
"""
import re
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Union, Optional, Any
from datetime import datetime, date
import yfinance as yf


def validate_ticker(ticker: str) -> bool:
    """
    Validate ticker symbol format.

    Args:
        ticker: Stock ticker symbol

    Returns:
        True if valid format, False otherwise
    """
    if not ticker or not isinstance(ticker, str):
        return False

    # Basic ticker format validation
    ticker = ticker.strip().upper()

    # Allow letters, numbers, dots, dashes
    pattern = r'^[A-Z0-9.-]{1,10}$'

    return bool(re.match(pattern, ticker))


def validate_ticker_live(ticker: str, timeout: int = 5) -> Tuple[bool, Optional[Dict]]:
    """
    Validate ticker by checking if it exists in market.

    Args:
        ticker: Stock ticker symbol
        timeout: Timeout in seconds

    Returns:
        Tuple of (is_valid, info_dict)
    """
    if not validate_ticker(ticker):
        return False, None

    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Check if we got valid info
        if info and 'regularMarketPrice' in info:
            return True, {
                'name': info.get('longName', ticker),
                'price': info.get('regularMarketPrice', 0),
                'currency': info.get('currency', 'USD'),
                'sector': info.get('sector', 'Unknown')
            }
        else:
            return False, None

    except Exception:
        return False, None


def validate_weight(weight: Union[float, int, str], as_percentage: bool = True) -> Tuple[bool, str]:
    """
    Validate portfolio weight value.

    Args:
        weight: Weight value
        as_percentage: Whether weight is in percentage (0-100) or decimal (0-1)

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        weight_val = float(weight)

        if as_percentage:
            # Percentage format (0-100%)
            if weight_val < 0:
                return False, "Weight cannot be negative"
            elif weight_val > 100:
                return False, "Weight cannot exceed 100%"
        else:
            # Decimal format (0-1)
            if weight_val < 0:
                return False, "Weight cannot be negative"
            elif weight_val > 1:
                return False, "Weight cannot exceed 1.0"

        return True, ""

    except (ValueError, TypeError):
        return False, "Weight must be a number"


def validate_portfolio_weights(weights: List[Union[float, int]], tolerance: float = 0.01) -> Tuple[bool, str]:
    """
    Validate that portfolio weights sum to approximately 100% (or 1.0).

    Args:
        weights: List of weight values
        tolerance: Tolerance for sum validation

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not weights:
        return False, "No weights provided"

    try:
        total = sum(float(w) for w in weights)

        # Check if weights are in percentage format (sum ~100) or decimal format (sum ~1)
        if abs(total - 100) <= tolerance:
            return True, ""
        elif abs(total - 1.0) <= tolerance:
            return True, ""
        else:
            return False, f"Portfolio weights sum to {total:.2f}, should be 100% or 1.0"

    except (ValueError, TypeError):
        return False, "All weights must be numbers"


def validate_portfolio_name(name: str) -> Tuple[bool, str]:
    """
    Validate portfolio name.

    Args:
        name: Portfolio name

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name or not isinstance(name, str):
        return False, "Portfolio name is required"

    name = name.strip()

    if len(name) < 2:
        return False, "Portfolio name must be at least 2 characters"

    if len(name) > 50:
        return False, "Portfolio name cannot exceed 50 characters"

    # Check for valid characters
    if not re.match(r'^[a-zA-Z0-9\s\-_\.]+$', name):
        return False, "Portfolio name contains invalid characters"

    return True, ""


def validate_date_string(date_str: str) -> Tuple[bool, str]:
    """
    Validate date string format.

    Args:
        date_str: Date string

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not date_str:
        return True, ""  # Optional field

    # Try common date formats
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"]

    for fmt in formats:
        try:
            datetime.strptime(date_str, fmt)
            return True, ""
        except ValueError:
            continue

    return False, "Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY"


def validate_price(price: Union[float, int, str]) -> Tuple[bool, str]:
    """
    Validate price value.

    Args:
        price: Price value

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        price_val = float(price)

        if price_val < 0:
            return False, "Price cannot be negative"

        if price_val > 1000000:  # Reasonable upper limit
            return False, "Price seems unreasonably high"

        return True, ""

    except (ValueError, TypeError):
        return False, "Price must be a number"


def validate_shares(shares: Union[float, int, str]) -> Tuple[bool, str]:
    """
    Validate number of shares.

    Args:
        shares: Number of shares

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        shares_val = float(shares)

        if shares_val <= 0:
            return False, "Number of shares must be positive"

        if shares_val > 1000000:  # Reasonable upper limit
            return False, "Number of shares seems unreasonably high"

        return True, ""

    except (ValueError, TypeError):
        return False, "Number of shares must be a number"


def validate_asset_allocation(assets: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
    """
    Validate complete asset allocation for a portfolio.

    Args:
        assets: List of asset dictionaries

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    if not assets:
        errors.append("Portfolio must contain at least one asset")
        return False, errors

    # Check for duplicate tickers
    tickers = []
    weights = []

    for i, asset in enumerate(assets):
        # Validate ticker
        ticker = asset.get('ticker', '')
        if not ticker:
            errors.append(f"Asset {i + 1}: Ticker is required")
            continue

        if not validate_ticker(ticker):
            errors.append(f"Asset {i + 1}: Invalid ticker format '{ticker}'")

        if ticker in tickers:
            errors.append(f"Duplicate ticker: {ticker}")
        else:
            tickers.append(ticker)

        # Validate weight
        weight = asset.get('weight', 0)
        is_valid, error = validate_weight(weight)
        if not is_valid:
            errors.append(f"Asset {i + 1} ({ticker}): {error}")
        else:
            weights.append(float(weight))

    # Validate total weights
    if weights:
        is_valid, error = validate_portfolio_weights(weights)
        if not is_valid:
            errors.append(error)

    return len(errors) == 0, errors


def validate_csv_upload(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validate uploaded CSV data for portfolio creation.

    Args:
        df: Uploaded DataFrame

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    if df.empty:
        errors.append("CSV file is empty")
        return False, errors

    # Check required columns
    required_columns = ['ticker']  # Minimum requirement
    optional_columns = ['weight', 'shares', 'price', 'name']

    # Check for ticker column (case insensitive)
    ticker_col = None
    for col in df.columns:
        if col.lower() in ['ticker', 'symbol', 'stock']:
            ticker_col = col
            break

    if ticker_col is None:
        errors.append("CSV must contain a 'ticker' or 'symbol' column")
        return False, errors

    # Validate each row
    for idx, row in df.iterrows():
        ticker = str(row[ticker_col]).strip()

        if not ticker or ticker == 'nan':
            errors.append(f"Row {idx + 1}: Missing ticker")
            continue

        if not validate_ticker(ticker):
            errors.append(f"Row {idx + 1}: Invalid ticker format '{ticker}'")

    # Check for weight column if present
    weight_col = None
    for col in df.columns:
        if col.lower() in ['weight', 'allocation', 'percent']:
            weight_col = col
            break

    if weight_col:
        for idx, row in df.iterrows():
            weight = row[weight_col]
            if pd.notna(weight):
                is_valid, error = validate_weight(weight)
                if not is_valid:
                    errors.append(f"Row {idx + 1}: {error}")

    return len(errors) == 0, errors


def validate_text_portfolio(text: str) -> Tuple[bool, List[str], List[Dict[str, Any]]]:
    """
    Validate and parse text input for portfolio creation.

    Args:
        text: Text input with tickers and weights

    Returns:
        Tuple of (is_valid, list_of_errors, parsed_assets)
    """
    errors = []
    assets = []

    if not text or not text.strip():
        errors.append("Text input cannot be empty")
        return False, errors, []

    lines = [line.strip() for line in text.strip().split('\n') if line.strip()]

    if not lines:
        errors.append("No valid lines found in text input")
        return False, errors, []

    for i, line in enumerate(lines):
        line_num = i + 1

        # Try to parse ticker and weight
        # Formats: "AAPL 25%" or "AAPL 0.25" or "AAPL: 25" or just "AAPL"
        patterns = [
            r'^([A-Z0-9.-]+)[\s:,]+([0-9.]+)%?$',  # AAPL 25% or AAPL: 25
            r'^([A-Z0-9.-]+)$'  # Just AAPL
        ]

        parsed = False
        for pattern in patterns:
            match = re.match(pattern, line.upper())
            if match:
                ticker = match.group(1)
                weight = float(match.group(2)) if len(match.groups()) > 1 else None

                # Validate ticker
                if not validate_ticker(ticker):
                    errors.append(f"Line {line_num}: Invalid ticker '{ticker}'")
                    continue

                # Validate weight if provided
                if weight is not None:
                    is_valid, error = validate_weight(weight)
                    if not is_valid:
                        errors.append(f"Line {line_num}: {error}")
                        continue

                assets.append({
                    'ticker': ticker,
                    'weight': weight,
                    'line_number': line_num
                })
                parsed = True
                break

        if not parsed:
            errors.append(f"Line {line_num}: Could not parse '{line}'. Use format like 'AAPL 25%'")

    # Check for duplicates
    tickers = [asset['ticker'] for asset in assets]
    duplicates = set([t for t in tickers if tickers.count(t) > 1])
    if duplicates:
        for dup in duplicates:
            errors.append(f"Duplicate ticker: {dup}")

    return len(errors) == 0, errors, assets


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    if not filename:
        return "unnamed"

    # Remove or replace invalid characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    sanitized = re.sub(r'\s+', '_', sanitized)  # Replace spaces with underscores
    sanitized = sanitized.strip('._')  # Remove leading/trailing dots and underscores

    # Limit length
    if len(sanitized) > 50:
        sanitized = sanitized[:50]

    return sanitized or "unnamed"


def is_market_hours() -> bool:
    """
    Check if current time is during market hours (US Eastern Time).

    Returns:
        True if market is open, False otherwise
    """
    try:
        from datetime import datetime
        import pytz

        # Get current time in Eastern Time
        et = pytz.timezone('US/Eastern')
        now = datetime.now(et)

        # Check if it's a weekday
        if now.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return False

        # Market hours: 9:30 AM to 4:00 PM ET
        market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
        market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)

        return market_open <= now <= market_close

    except:
        # If timezone handling fails, assume market is open
        return True