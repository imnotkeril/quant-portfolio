"""
Alpha Vantage data provider implementation.
This module provides market data using the Alpha Vantage API service.
"""
import os
import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import re
import time
import requests
from pathlib import Path

from app.infrastructure.data.market_data_provider import MarketDataProvider

# Configure logging
logger = logging.getLogger(__name__)


class AlphaVantageProvider(MarketDataProvider):
    """
    Implementation of MarketDataProvider interface for Alpha Vantage.
    Uses the Alpha Vantage API to fetch financial market data.
    """

    def __init__(
            self,
            api_key: str,
            cache_dir: Optional[str] = None,
            cache_expiry_days: int = 1
    ):
        """
        Initialize the Alpha Vantage data provider.

        Args:
            api_key: Alpha Vantage API key
            cache_dir: Directory for caching data (optional)
            cache_expiry_days: Number of days before cache expires
        """
        self.api_key = api_key

        if not api_key:
            logger.warning("No Alpha Vantage API key provided. Provider will not work.")
            self.available = False
        else:
            self.available = True

        self.cache_dir = cache_dir
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)

        self.cache_expiry_days = cache_expiry_days
        self.base_url = "https://www.alphavantage.co/query"
        self.request_delay = 1.0  # Alpha Vantage has stricter rate limits
        self.last_request_time = 0

        # Keep track of API calls to respect limits
        self.api_calls_today = 0
        self.api_call_limit = 500  # Standard free API key limit
        self.api_call_reset_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)

    def _format_ticker(self, ticker: str) -> str:
        """
        Format ticker symbol for Alpha Vantage API.

        Args:
            ticker: Original ticker symbol

        Returns:
            Formatted ticker symbol
        """
        # Alpha Vantage uses . in ticker symbols
        return ticker

    def _get_cache_path(self, ticker: str, start_date: str, end_date: str, interval: str) -> str:
        """
        Get path for cached data.

        Args:
            ticker: Stock symbol
            start_date: Start date
            end_date: End date
            interval: Data interval

        Returns:
            Path to cache file
        """
        if not self.cache_dir:
            return None

        ticker = ticker.upper().replace('-', '_').replace('.', '_')
        filename = f"av_{ticker}_{start_date}_{end_date}_{interval}.csv"
        return os.path.join(self.cache_dir, filename)

    def _is_cache_valid(self, cache_path: str) -> bool:
        """
        Check if cache file is valid (exists and not expired).

        Args:
            cache_path: Path to cache file

        Returns:
            True if cache is valid, False otherwise
        """
        if not cache_path or not os.path.exists(cache_path):
            return False

        # Check if cache is expired
        cache_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
        expiry_time = cache_time + timedelta(days=self.cache_expiry_days)
        return datetime.now() < expiry_time

    def _save_to_cache(self, df: pd.DataFrame, cache_path: str) -> None:
        """
        Save data to cache.

        Args:
            df: DataFrame to save
            cache_path: Path to cache file
        """
        if not cache_path or df.empty:
            return

        try:
            df.to_csv(cache_path)
        except Exception as e:
            logger.warning(f"Failed to save data to cache: {e}")

    def _load_from_cache(self, cache_path: str) -> Optional[pd.DataFrame]:
        """
        Load data from cache.

        Args:
            cache_path: Path to cache file

        Returns:
            DataFrame with cached data or None if cache is invalid
        """
        if not self._is_cache_valid(cache_path):
            return None

        try:
            df = pd.read_csv(cache_path, index_col=0, parse_dates=True)
            return df
        except Exception as e:
            logger.warning(f"Failed to load data from cache: {e}")
            return None

    def _check_api_limit(self) -> bool:
        """
        Check if we've reached the API call limit.

        Returns:
            True if we can make more calls, False otherwise
        """
        # Reset counter if we're in a new day
        if datetime.now() >= self.api_call_reset_time:
            self.api_calls_today = 0
            self.api_call_reset_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(
                days=1)

        # Check if we've reached the limit
        return self.api_calls_today < self.api_call_limit

    def _rate_limit_request(self) -> None:
        """
        Implement rate limiting for API requests.
        """
        # Check API limit
        if not self._check_api_limit():
            raise Exception("Alpha Vantage API call limit reached for today")

        # Delay to avoid hitting rate limits
        current_time = time.time()
        elapsed = current_time - self.last_request_time

        if elapsed < self.request_delay:
            time.sleep(self.request_delay - elapsed)

        self.last_request_time = time.time()
        self.api_calls_today += 1

    def get_historical_prices(
            self,
            ticker: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            interval: str = "1d"
    ) -> pd.DataFrame:
        """
        Get historical price data for a given ticker.

        Args:
            ticker: Stock symbol
            start_date: Start date (format: YYYY-MM-DD)
            end_date: End date (format: YYYY-MM-DD)
            interval: Data interval ('1d'=daily, '1wk'=weekly, '1mo'=monthly)

        Returns:
            DataFrame with historical price data
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return pd.DataFrame()

        # Set default dates if not provided
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')

        if start_date is None:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

        # Check cache
        cache_path = self._get_cache_path(ticker, start_date, end_date, interval)
        cached_data = self._load_from_cache(cache_path)
        if cached_data is not None:
            logger.info(f"Loaded {ticker} data from cache")
            return cached_data

        # Map intervals to Alpha Vantage function and interval
        interval_map = {
            '1d': ('TIME_SERIES_DAILY_ADJUSTED', 'Daily'),
            '1wk': ('TIME_SERIES_WEEKLY_ADJUSTED', 'Weekly'),
            '1mo': ('TIME_SERIES_MONTHLY_ADJUSTED', 'Monthly')
        }

        if interval not in interval_map:
            logger.error(f"Unsupported interval: {interval}")
            return pd.DataFrame()

        function, time_key_prefix = interval_map[interval]

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Build request parameters
            params = {
                'function': function,
                'symbol': ticker,
                'apikey': self.api_key,
                'outputsize': 'full'  # To get the maximum amount of data
            }

            # Make the request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for errors in the response
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return pd.DataFrame()

            # Extract the time series data
            time_series_key = f"Time Series ({time_key_prefix})"
            if time_series_key not in data:
                logger.error(f"Unexpected response format: {list(data.keys())}")
                return pd.DataFrame()

            time_series = data[time_series_key]

            # Convert to DataFrame
            df = pd.DataFrame.from_dict(time_series, orient='index')

            # Rename columns
            if len(df.columns) >= 5:
                column_map = {
                    '1. open': 'Open',
                    '2. high': 'High',
                    '3. low': 'Low',
                    '4. close': 'Close',
                    '5. adjusted close': 'Adj Close',
                    '5. volume': 'Volume',
                    '6. volume': 'Volume'
                }
                df = df.rename(columns=column_map)

                # Convert to numeric
                for col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')

                # Convert index to datetime
                df.index = pd.to_datetime(df.index)

                # Filter by date range
                if start_date:
                    df = df[df.index >= start_date]
                if end_date:
                    df = df[df.index <= end_date]

                # Sort by date
                df = df.sort_index()

                # Save to cache
                self._save_to_cache(df, cache_path)

                return df
            else:
                logger.error("Unexpected data format from Alpha Vantage")
                return pd.DataFrame()

        except Exception as e:
            logger.error(f"Error retrieving historical prices for {ticker}: {e}")
            return pd.DataFrame()

    def get_latest_price(self, ticker: str) -> Dict[str, Any]:
        """
        Get the latest price for a given ticker.

        Args:
            ticker: Stock symbol

        Returns:
            Dictionary with latest price data
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return {}

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Build request parameters
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': ticker,
                'apikey': self.api_key
            }

            # Make the request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for errors in the response
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return {}

            # Extract the quote data
            if 'Global Quote' not in data or not data['Global Quote']:
                logger.error("No quote data returned")
                return {}

            quote = data['Global Quote']

            # Format the result
            result = {
                'symbol': quote.get('01. symbol', ticker),
                'Open': float(quote.get('02. open', 0)),
                'High': float(quote.get('03. high', 0)),
                'Low': float(quote.get('04. low', 0)),
                'Close': float(quote.get('05. price', 0)),  # Current price
                'Volume': int(quote.get('06. volume', 0)),
                'timestamp': quote.get('07. latest trading day', datetime.now().strftime('%Y-%m-%d')),
                'change': float(quote.get('09. change', 0)),
                'change_percent': quote.get('10. change percent', '0%').strip('%')
            }

            return result

        except Exception as e:
            logger.error(f"Error retrieving latest price for {ticker}: {e}")
            return {}

    def get_company_info(self, ticker: str) -> Dict[str, Any]:
        """
        Get company information for a given ticker.

        Args:
            ticker: Stock symbol

        Returns:
            Dictionary with company information
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return {}

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Build request parameters
            params = {
                'function': 'OVERVIEW',
                'symbol': ticker,
                'apikey': self.api_key
            }

            # Make the request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for errors or empty response
            if 'Error Message' in data or not data or len(data) <= 1:
                logger.error(f"Alpha Vantage API error or no data for {ticker}")
                return {}

            # Format the result
            result = {
                'symbol': data.get('Symbol', ticker),
                'name': data.get('Name', ''),
                'description': data.get('Description', ''),
                'exchange': data.get('Exchange', ''),
                'currency': data.get('Currency', 'USD'),
                'country': data.get('Country', ''),
                'sector': data.get('Sector', ''),
                'industry': data.get('Industry', ''),
                'pe_ratio': self._safe_float(data.get('PERatio')),
                'peg_ratio': self._safe_float(data.get('PEGRatio')),
                'book_value': self._safe_float(data.get('BookValue')),
                'dividend_per_share': self._safe_float(data.get('DividendPerShare')),
                'dividend_yield': self._safe_float(data.get('DividendYield')),
                'eps': self._safe_float(data.get('EPS')),
                'revenue_per_share_ttm': self._safe_float(data.get('RevenuePerShareTTM')),
                'profit_margin': self._safe_float(data.get('ProfitMargin')),
                'operating_margin_ttm': self._safe_float(data.get('OperatingMarginTTM')),
                'return_on_assets_ttm': self._safe_float(data.get('ReturnOnAssetsTTM')),
                'return_on_equity_ttm': self._safe_float(data.get('ReturnOnEquityTTM')),
                'revenue_ttm': self._safe_float(data.get('RevenueTTM')),
                'gross_profit_ttm': self._safe_float(data.get('GrossProfitTTM')),
                'quarterly_earnings_growth_yoy': self._safe_float(data.get('QuarterlyEarningsGrowthYOY')),
                'quarterly_revenue_growth_yoy': self._safe_float(data.get('QuarterlyRevenueGrowthYOY')),
                'market_cap': self._safe_float(data.get('MarketCapitalization')),
                'beta': self._safe_float(data.get('Beta')),
                'shares_outstanding': self._safe_float(data.get('SharesOutstanding')),
                'last_updated': datetime.now().strftime('%Y-%m-%d')
            }

            # Determine asset type
            if result['sector'] == 'N/A' and 'ETF' in result['name']:
                result['asset_type'] = 'ETF'
            elif result['industry'] == 'N/A' and 'Index' in result['name']:
                result['asset_type'] = 'Index'
            else:
                result['asset_type'] = 'Stock'

            return result

        except Exception as e:
            logger.error(f"Error retrieving company info for {ticker}: {e}")
            return {}

    def get_batch_prices(
            self,
            tickers: List[str],
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            interval: str = "1d"
    ) -> Dict[str, pd.DataFrame]:
        """
        Get historical prices for multiple tickers in a single batch request.

        Args:
            tickers: List of stock symbols
            start_date: Start date (format: YYYY-MM-DD)
            end_date: End date (format: YYYY-MM-DD)
            interval: Data interval ('1d'=daily, '1wk'=weekly, '1mo'=monthly)

        Returns:
            Dictionary mapping each ticker to its historical price DataFrame
        """
        # Alpha Vantage doesn't support batch requests in the free tier
        # We'll have to make individual requests for each ticker
        result = {}

        for ticker in tickers:
            try:
                data = self.get_historical_prices(ticker, start_date, end_date, interval)
                if not data.empty:
                    result[ticker] = data
            except Exception as e:
                logger.error(f"Error retrieving batch prices for {ticker}: {e}")

        return result

    def search_tickers(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for tickers based on a query string.

        Args:
            query: Search query
            limit: Maximum number of results to return

        Returns:
            List of dictionaries with ticker information
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return []

        if not query:
            return []

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Build request parameters
            params = {
                'function': 'SYMBOL_SEARCH',
                'keywords': query,
                'apikey': self.api_key
            }

            # Make the request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for errors in the response
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return []

            # Extract the search results
            if 'bestMatches' not in data or not data['bestMatches']:
                return []

            results = []
            for match in data['bestMatches'][:limit]:
                results.append({
                    'symbol': match.get('1. symbol', ''),
                    'name': match.get('2. name', ''),
                    'type': match.get('3. type', ''),
                    'region': match.get('4. region', ''),
                    'currency': match.get('8. currency', 'USD'),
                    'match_score': match.get('9. matchScore', '0')
                })

            return results

        except Exception as e:
            logger.error(f"Error searching tickers: {e}")
            return []

    def get_market_status(self) -> Dict[str, Any]:
        """
        Get current market status.

        Returns:
            Dictionary with market status information
        """
        # Alpha Vantage doesn't provide market status API
        # We can approximate using major indices like S&P 500
        indices = {
            'US': 'SPY',
            'NASDAQ': 'QQQ',
            'DOW': 'DIA',
            'EUROPE': 'FEZ',
            'ASIA': 'FXI'
        }

        results = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'markets': {}
        }

        for region, ticker in indices.items():
            try:
                latest_price = self.get_latest_price(ticker)

                if latest_price:
                    # Calculate change percentage
                    change_percent = float(latest_price.get('change_percent', 0))

                    results['markets'][region] = {
                        'index': ticker,
                        'price': latest_price.get('Close'),
                        'change_pct': change_percent,
                        'status': 'open' if abs(change_percent) > 0.001 else 'closed'  # Approximation
                    }
            except Exception as e:
                logger.warning(f"Error getting market status for {region}: {e}")

        return results

    def get_fundamentals(self, ticker: str, data_type: str = "income") -> pd.DataFrame:
        """
        Get fundamental financial data for a company.

        Args:
            ticker: Stock symbol
            data_type: Type of fundamental data ('income', 'balance', 'cash', 'earnings')

        Returns:
            DataFrame with fundamental financial data
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return pd.DataFrame()

        # Map data types to Alpha Vantage functions
        function_map = {
            'income': 'INCOME_STATEMENT',
            'balance': 'BALANCE_SHEET',
            'cash': 'CASH_FLOW',
            'earnings': 'EARNINGS'
        }

        if data_type not in function_map:
            logger.error(f"Unsupported fundamental data type: {data_type}")
            return pd.DataFrame()

        function = function_map[data_type]

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Build request parameters
            params = {
                'function': function,
                'symbol': ticker,
                'apikey': self.api_key
            }

            # Make the request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for errors in the response
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return pd.DataFrame()

            # Extract the data based on the type
            if data_type == 'earnings':
                # Handle earnings data which has a different structure
                if 'quarterlyEarnings' in data:
                    quarterly = pd.DataFrame(data['quarterlyEarnings'])
                    quarterly.set_index('fiscalDateEnding', inplace=True)
                    quarterly.index = pd.to_datetime(quarterly.index)
                    return quarterly
                else:
                    return pd.DataFrame()
            else:
                # Handle income statement, balance sheet, and cash flow
                report_key = {
                    'income': 'annualReports',
                    'balance': 'annualReports',
                    'cash': 'annualReports'
                }.get(data_type)

                if report_key in data and data[report_key]:
                    # Convert to DataFrame
                    df = pd.DataFrame(data[report_key])

                    # Set index
                    if 'fiscalDateEnding' in df.columns:
                        df.set_index('fiscalDateEnding', inplace=True)
                        df.index = pd.to_datetime(df.index)

                    # Convert to numeric
                    for col in df.columns:
                        if col != 'reportedCurrency':
                            df[col] = pd.to_numeric(df[col], errors='coerce')

                    return df.sort_index()

                return pd.DataFrame()

        except Exception as e:
            logger.error(f"Error retrieving fundamental data for {ticker}: {e}")
            return pd.DataFrame()

    def is_valid_ticker(self, ticker: str) -> bool:
        """
        Check if a ticker symbol is valid.

        Args:
            ticker: Stock symbol to check

        Returns:
            True if the ticker is valid, False otherwise
        """
        if not self.available:
            logger.error("Alpha Vantage provider not available. Please provide a valid API key.")
            return False

        try:
            # Try to get the latest price
            price_data = self.get_latest_price(ticker)

            # Check if we got valid data
            return bool(price_data and 'Close' in price_data and price_data['Close'] > 0)

        except Exception as e:
            logger.debug(f"Error validating ticker {ticker}: {e}")
            return False

    def _safe_float(self, value: Any) -> Optional[float]:
        """
        Safely convert a value to float.

        Args:
            value: Value to convert

        Returns:
            Float value or None if conversion fails
        """
        if value is None:
            return None

        try:
            return float(value)
        except (ValueError, TypeError):
            return None