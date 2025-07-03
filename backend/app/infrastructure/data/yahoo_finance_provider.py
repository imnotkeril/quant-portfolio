"""
Yahoo Finance data provider implementation.
This module provides market data using the Yahoo Finance API via the yfinance package.
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


class YahooFinanceProvider(MarketDataProvider):
    """
    Implementation of MarketDataProvider interface for Yahoo Finance.
    Uses the yfinance package to fetch data from the Yahoo Finance API.
    """

    def __init__(self, cache_dir: Optional[str] = None, cache_expiry_days: int = 1):
        """
        Initialize the Yahoo Finance data provider.

        Args:
            cache_dir: Directory for caching data (optional)
            cache_expiry_days: Number of days before cache expires
        """
        self.cache_dir = cache_dir
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)

        self.cache_expiry_days = cache_expiry_days
        self.request_delay = 0.2  # Delay between API requests to avoid rate limits
        self.last_request_time = 0

        # Try importing yfinance
        try:
            import yfinance as yf
            self.yf = yf
            self.available = True
        except ImportError:
            logger.warning("yfinance package not installed. Yahoo Finance provider will not work.")
            self.available = False
            self.yf = None

    def _format_ticker(self, ticker: str) -> str:
        """
        Format ticker symbol for Yahoo Finance API.

        Args:
            ticker: Original ticker symbol

        Returns:
            Formatted ticker symbol
        """
        # Yahoo Finance uses - instead of . in ticker symbols
        return ticker.replace('.', '-')

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
        filename = f"{ticker}_{start_date}_{end_date}_{interval}.csv"
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

    def _rate_limit_request(self) -> None:
        """
        Implement rate limiting for API requests.
        """
        current_time = time.time()
        elapsed = current_time - self.last_request_time

        if elapsed < self.request_delay:
            time.sleep(self.request_delay - elapsed)

        self.last_request_time = time.time()

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
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
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

        # Format ticker for Yahoo Finance
        formatted_ticker = self._format_ticker(ticker)

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Use yfinance package to get data
            ticker_obj = self.yf.Ticker(formatted_ticker)
            data = ticker_obj.history(
                start=start_date,
                end=end_date,
                interval=interval
            )

            # If the first method fails, try download method
            if data.empty:
                data = self.yf.download(
                    formatted_ticker,
                    start=start_date,
                    end=end_date,
                    interval=interval,
                    progress=False,
                    show_errors=False
                )

            # Save to cache
            if not data.empty:
                self._save_to_cache(data, cache_path)

            return data

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
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
            return {}

        formatted_ticker = self._format_ticker(ticker)

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Get the data for the last 2 days to ensure we have the latest price
            end_date = datetime.now()
            start_date = end_date - timedelta(days=2)

            data = self.get_historical_prices(
                ticker,
                start_date=start_date.strftime('%Y-%m-%d'),
                end_date=end_date.strftime('%Y-%m-%d')
            )

            if data.empty:
                return {}

            # Get the last row
            latest_data = data.iloc[-1].to_dict()

            # Add timestamp
            latest_data['timestamp'] = data.index[-1].strftime('%Y-%m-%d %H:%M:%S')

            return latest_data

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
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
            return {}

        formatted_ticker = self._format_ticker(ticker)

        try:
            # Implement rate limiting
            self._rate_limit_request()

            ticker_obj = self.yf.Ticker(formatted_ticker)
            info = ticker_obj.info

            # Normalize and format the data
            normalized_info = {
                'symbol': ticker,
                'name': info.get('longName', info.get('shortName', ticker)),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'country': info.get('country', 'N/A'),
                'exchange': info.get('exchange', 'N/A'),
                'currency': info.get('currency', 'USD'),
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'beta': info.get('beta'),
                'description': info.get('longBusinessSummary', 'N/A'),
                'website': info.get('website', 'N/A'),
                'logo_url': info.get('logo_url'),
                'asset_type': self._determine_asset_type(info),
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            return normalized_info

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
        if not self.available:
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
            return {}

        if not tickers:
            return {}

        # Set default dates if not provided
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')

        if start_date is None:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

        result = {}

        # Format tickers
        formatted_tickers = [self._format_ticker(ticker) for ticker in tickers]
        ticker_mapping = {self._format_ticker(ticker): ticker for ticker in tickers}

        # Check which tickers we need to fetch (not in cache)
        tickers_to_fetch = []
        for formatted_ticker, original_ticker in ticker_mapping.items():
            cache_path = self._get_cache_path(original_ticker, start_date, end_date, interval)
            cached_data = self._load_from_cache(cache_path)

            if cached_data is not None:
                logger.info(f"Loaded {original_ticker} data from cache")
                result[original_ticker] = cached_data
            else:
                tickers_to_fetch.append(formatted_ticker)

        if not tickers_to_fetch:
            return result

        try:
            # Implement rate limiting
            self._rate_limit_request()

            # Use yfinance to get data for multiple tickers
            data = self.yf.download(
                tickers_to_fetch,
                start=start_date,
                end=end_date,
                interval=interval,
                group_by='ticker',
                progress=False,
                show_errors=False
            )

            # Process the data
            if len(tickers_to_fetch) == 1:
                # When only one ticker is fetched, the data doesn't have multi-level columns
                formatted_ticker = tickers_to_fetch[0]
                original_ticker = ticker_mapping[formatted_ticker]

                if not data.empty:
                    cache_path = self._get_cache_path(original_ticker, start_date, end_date, interval)
                    self._save_to_cache(data, cache_path)
                    result[original_ticker] = data
            else:
                # Process multi-ticker data
                for formatted_ticker in tickers_to_fetch:
                    if formatted_ticker in data.columns.levels[0]:
                        original_ticker = ticker_mapping[formatted_ticker]
                        ticker_data = data[formatted_ticker].copy()

                        if not ticker_data.empty:
                            cache_path = self._get_cache_path(original_ticker, start_date, end_date, interval)
                            self._save_to_cache(ticker_data, cache_path)
                            result[original_ticker] = ticker_data

            return result

        except Exception as e:
            logger.error(f"Error retrieving batch prices: {e}")

            # If batch request fails, fall back to individual requests
            for ticker in tickers:
                if ticker not in result:
                    data = self.get_historical_prices(ticker, start_date, end_date, interval)
                    if not data.empty:
                        result[ticker] = data

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
        if not query:
            return []

        try:
            # Yahoo Finance has no official search API in yfinance
            # We'll use a direct request to their search endpoint
            url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount={limit}&newsCount=0"
            headers = {'User-Agent': 'Mozilla/5.0'}

            # Implement rate limiting
            self._rate_limit_request()

            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                logger.error(f"Error searching tickers: {response.status_code}")
                return []

            data = response.json()

            results = []
            if 'quotes' in data and data['quotes']:
                for quote in data['quotes'][:limit]:
                    # Convert ticker format if needed (- to .)
                    symbol = quote.get('symbol', '')
                    display_symbol = symbol

                    if '-' in symbol:
                        parts = symbol.split('-')
                        if len(parts) == 2 and len(parts[1]) == 1:
                            # Special case for .A, .B shares
                            display_symbol = f"{parts[0]}.{parts[1]}"

                    result = {
                        'symbol': display_symbol,
                        'name': quote.get('shortname', quote.get('longname', '')),
                        'exchange': quote.get('exchange', ''),
                        'type': quote.get('quoteType', ''),
                        'score': quote.get('score', 0)
                    }

                    results.append(result)

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
        # Yahoo Finance doesn't provide a direct way to get market status through yfinance
        # We'll use a workaround with major indices
        indices = {
            'US': '^GSPC',  # S&P 500
            'NASDAQ': '^IXIC',
            'DOW': '^DJI',
            'EUROPE': '^STOXX50E',
            'ASIA': '^N225'  # Nikkei 225
        }

        results = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'markets': {}
        }

        for region, index_symbol in indices.items():
            try:
                latest_price = self.get_latest_price(index_symbol)

                if latest_price:
                    day_change = 0
                    if 'Close' in latest_price and 'Open' in latest_price and latest_price['Open'] > 0:
                        day_change = (latest_price['Close'] - latest_price['Open']) / latest_price['Open'] * 100

                    results['markets'][region] = {
                        'index': index_symbol,
                        'price': latest_price.get('Close'),
                        'change_pct': day_change,
                        'status': 'open' if abs(day_change) > 0.001 else 'closed'
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
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
            return pd.DataFrame()

        formatted_ticker = self._format_ticker(ticker)

        try:
            # Implement rate limiting
            self._rate_limit_request()

            ticker_obj = self.yf.Ticker(formatted_ticker)

            if data_type.lower() == 'income':
                return ticker_obj.income_stmt
            elif data_type.lower() == 'balance':
                return ticker_obj.balance_sheet
            elif data_type.lower() == 'cash':
                return ticker_obj.cashflow
            elif data_type.lower() == 'earnings':
                # Convert earnings to DataFrame if it's not already
                earnings = ticker_obj.earnings
                if isinstance(earnings, dict):
                    return pd.DataFrame(earnings)
                return earnings
            else:
                logger.warning(f"Unknown fundamental data type: {data_type}")
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
            logger.error("Yahoo Finance provider not available. Please install yfinance package.")
            return False

        formatted_ticker = self._format_ticker(ticker)

        try:
            # Implement rate limiting
            self._rate_limit_request()

            ticker_obj = self.yf.Ticker(formatted_ticker)
            info = ticker_obj.info

            # Check if we got valid info
            return bool(info and len(info) > 5 and 'regularMarketPrice' in info)

        except Exception as e:
            logger.debug(f"Error validating ticker {ticker}: {e}")
            return False

    def _determine_asset_type(self, info: Dict[str, Any]) -> str:
        """
        Determine the asset type based on ticker info.

        Args:
            info: Ticker info dictionary

        Returns:
            Asset type string
        """
        if not info:
            return 'Unknown'

        if 'quoteType' in info:
            quote_type = info['quoteType'].lower()
            if quote_type in ['equity', 'stock']:
                return 'Stock'
            elif quote_type == 'etf':
                return 'ETF'
            elif quote_type == 'index':
                return 'Index'
            elif quote_type in ['cryptocurrency', 'crypto']:
                return 'Cryptocurrency'
            elif quote_type == 'mutualfund':
                return 'Mutual Fund'
            elif quote_type == 'currency':
                return 'Currency'
            else:
                return quote_type.capitalize()

        # Try to determine type from other fields
        if 'fundFamily' in info and info['fundFamily']:
            return 'ETF' if 'ETF' in info.get('longName', '') else 'Mutual Fund'

        if 'industry' in info and info['industry']:
            return 'Stock'

        return 'Unknown'