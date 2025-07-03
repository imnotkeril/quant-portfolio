"""
Data fetcher implementation for retrieving financial data from various sources.
"""
import os
import time
import logging
import pickle
import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union, Any

import pandas as pd
import numpy as np
import requests

from app.core.interfaces.data_provider import DataProvider
from app.core.interfaces.cache_provider import CacheProvider


class DataFetcherService(DataProvider):
    """
    Service for fetching financial data from various sources.
    Implements the DataProvider interface.
    """

    def __init__(
            self,
            cache_provider: CacheProvider,
            cache_expiry_days: int = 1
    ):
        """
        Initialize the data fetcher service

        Args:
            cache_provider: Cache provider for storing data
            cache_expiry_days: Cache expiration time in days
        """
        self.cache_provider = cache_provider
        self.cache_expiry_days = cache_expiry_days
        self.api_call_counts = {'yfinance': 0, 'alpha_vantage': 0}
        self.api_limits = {'alpha_vantage': 500}

        # Load API keys from environment variables
        self.api_keys = {
            'alpha_vantage': os.environ.get('ALPHA_VANTAGE_API_KEY', '')
        }

        # Dictionary of supported data providers
        self.providers = {
            'yfinance': self._fetch_yfinance,
            'alpha_vantage': self._fetch_alpha_vantage
        }

        # Preloading benchmark data
        self.benchmark_data = {}
        self.benchmark_tickers = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI']
        self.preload_benchmarks()

        logging.info(f"Initialized DataFetcherService")

    def preload_benchmarks(self):
        """Preload major benchmark data with a long historical period"""
        start_date = '1990-01-01'
        end_date = datetime.now().strftime('%Y-%m-%d')

        for ticker in self.benchmark_tickers:
            try:
                data = self.get_historical_prices(ticker, start_date, end_date, force_refresh=False)
                if not data.empty:
                    self.benchmark_data[ticker] = data
                    logging.info(f"Historical data for benchmark preloaded {ticker}")
            except Exception as e:
                logging.warning(f"Failed to preload benchmark data {ticker}: {e}")

    def get_historical_prices(
            self,
            ticker: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            provider: str = 'yfinance',
            interval: str = '1d',
            force_refresh: bool = False
    ) -> pd.DataFrame:
        """
        Get historical prices for the specified ticker

        Args:
            ticker: Stock/ETF ticker
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            provider: Data provider ('yfinance', 'alpha_vantage')
            interval: Data interval ('1d', '1wk', '1mo')
            force_refresh: Force data refresh

        Returns:
            DataFrame with historical prices
        """
        # Check if the ticker contains a dot and create a corrected version for the API
        original_ticker = ticker
        corrected_ticker = ticker.replace('.', '-') if '.' in ticker else ticker

        if corrected_ticker != original_ticker:
            logging.info(f"Use corrected ticker {corrected_ticker} to query {original_ticker}")

        # Use original ticker for cache
        cache_key = f"{original_ticker}_{start_date}_{end_date}_{interval}_{provider}"

        # Set default values for dates
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')

        if start_date is None:
            start_date = (datetime.now() - timedelta(days=5 * 365)).strftime('%Y-%m-%d')

        # Check cache
        if not force_refresh:
            cached_data = self.cache_provider.get(cache_key)
            if cached_data is not None:
                logging.info(f"Loading {original_ticker} data from cache")
                return cached_data

        # If cache is missing or outdated, get new data
        if provider in self.providers:
            try:
                data = self.providers[provider](corrected_ticker, start_date, end_date, interval)

                if data is not None and not data.empty:
                    # Store in cache with timedelta
                    self.cache_provider.set(
                        cache_key,
                        data,
                        timedelta(days=self.cache_expiry_days)
                    )
                    logging.info(f"Saved data {original_ticker} to cache")

                return data
            except Exception as e:
                logging.error(f"Error retrieving data for {original_ticker} from {provider}: {e}")

                # Try fallback provider
                fallback_provider = next((p for p in self.providers.keys() if p != provider), None)
                if fallback_provider:
                    logging.info(f"Let's try an alternative provider: {fallback_provider}")
                    return self.get_historical_prices(
                        ticker, start_date, end_date, fallback_provider, interval, force_refresh
                    )
        else:
            raise ValueError(f"Unsupported data provider: {provider}")

        return pd.DataFrame()

    def get_company_info(self, ticker: str, provider: str = 'yfinance') -> Dict:
        """
        Get company information

        Args:
            ticker: Stock/ETF ticker
            provider: Data provider

        Returns:
            Dictionary with company information
        """
        cache_key = f"{ticker}_info_{provider}"

        # Check cache (company information expires after 7 days)
        cached_info = self.cache_provider.get(cache_key)
        if cached_info is not None:
            logging.info(f"Loading information about {ticker} from cache")
            return cached_info

        info = {}

        try:
            if provider == 'yfinance':
                info = self._get_yfinance_company_info(ticker)
            elif provider == 'alpha_vantage':
                info = self._get_alpha_vantage_company_info(ticker)
            else:
                raise ValueError(f"Unsupported provider for company information: {provider}")

            if info:
                # Store in cache for 7 days
                self.cache_provider.set(cache_key, info, timedelta(days=7))
                logging.info(f"Saved information about {ticker} to cache")

            return info
        except Exception as e:
            logging.error(f"Error getting information about {ticker}: {e}")

            # Try fallback provider
            if provider != 'yfinance':
                logging.info("We are trying to get information through yfinance")
                return self.get_company_info(ticker, 'yfinance')

            return {}

    def search_tickers(self, query: str, limit: int = 10, provider: str = 'yfinance') -> List[Dict]:
        """
        Search tickers by query

        Args:
            query: Search query
            limit: Maximum number of results
            provider: Data provider

        Returns:
            List of dictionaries with information about found tickers
        """
        cache_key = f"search_{query.lower()}_{provider}"

        # Check cache (search results expire after 3 days)
        cached_results = self.cache_provider.get(cache_key)
        if cached_results is not None:
            logging.info(f"Loading search results for '{query}' from cache")
            return cached_results[:limit]

        results = []

        try:
            if provider == 'alpha_vantage':
                results = self._search_alpha_vantage(query, limit)
            elif provider == 'yfinance':
                results = self._search_alternative(query, limit)
            else:
                raise ValueError(f"Unsupported provider for search: {provider}")

            if results:
                # Store in cache for 3 days
                self.cache_provider.set(cache_key, results, timedelta(days=3))
                logging.info(f"Search results for '{query}' saved to cache")

            return results[:limit]
        except Exception as e:
            logging.error(f"Error searching for tickers on request '{query}': {e}")

            # Try fallback provider
        if provider == 'yfinance' and self.api_keys['alpha_vantage']:
            try:
                logging.info("🔄 Fallback: trying Alpha Vantage...")
                fallback_results = self._search_alpha_vantage(query, limit)
                if fallback_results:
                    logging.info(f"✅ Fallback successful! Found {len(fallback_results)} results")
                    # Cache the fallback results under the original provider key
                    self.cache_provider.set(cache_key, fallback_results, timedelta(days=3))
                    return fallback_results[:limit]
            except Exception as fallback_error:
                logging.error(f"❌ Fallback search also failed: {fallback_error}")

        elif provider == 'alpha_vantage':
            try:
                logging.info("🔄 Fallback: trying Yahoo Finance...")
                fallback_results = self._search_alternative(query, limit)
                if fallback_results:
                    logging.info(f"✅ Fallback successful! Found {len(fallback_results)} results")
                    return fallback_results[:limit]
            except Exception as fallback_error:
                logging.error(f"❌ Fallback search also failed: {fallback_error}")

            # Last resort - return popular tickers for better UX
        return self._get_popular_tickers_fallback(query, limit)

    def validate_tickers(self, tickers: List[str]) -> Tuple[List[str], List[str]]:
        """
        Validate a list of tickers

        Args:
            tickers: List of tickers to check

        Returns:
           Tuple (valid_tickers, invalid_tickers)
        """
        # List of popular tickers that we consider valid by default
        popular_tickers = [
            'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'TSLA', 'META', 'NVDA',
            'JPM', 'V', 'WMT', 'SPY', 'QQQ', 'VTI', 'VOO', 'BRK.B'
        ]

        valid_tickers = []
        invalid_tickers = []

        for ticker in tickers:
            if ticker in popular_tickers:
                valid_tickers.append(ticker)
                continue

            try:
                # Try to get basic information about a ticker
                data = self.get_historical_prices(ticker,
                                                 start_date=(datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d'),
                                                 end_date=datetime.now().strftime('%Y-%m-%d'))

                if data is not None and not data.empty:
                    valid_tickers.append(ticker)
                else:
                    invalid_tickers.append(ticker)
            except Exception:
                invalid_tickers.append(ticker)

        return valid_tickers, invalid_tickers

    def get_macro_indicators(
        self,
        indicators: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, pd.DataFrame]:
        """
        Get macroeconomic indicators

        Args:
            indicators: List of indicators
            start_date: Start date
            end_date: End date

        Returns:
            Dictionary {indicator: DataFrame}
        """
        results = {}

        # Map indicator codes to their FRED codes
        indicator_mapping = {
            'INFLATION': 'CPIAUCSL',  # Consumer Price Index
            'GDP': 'GDP',  # Gross Domestic Product
            'UNEMPLOYMENT': 'UNRATE',  # Unemployment Rate
            'INTEREST_RATE': 'FEDFUNDS',  # Federal Funds Rate
            'RETAIL_SALES': 'RSXFS',  # Retail Sales
            'INDUSTRIAL_PRODUCTION': 'INDPRO',  # Industrial Production Index
            'HOUSE_PRICE_INDEX': 'CSUSHPISA',  # Case-Shiller Home Price Index
            'CONSUMER_SENTIMENT': 'UMCSENT'  # University of Michigan Consumer Sentiment
        }

        try:
            import pandas_datareader.data as web

            if end_date is None:
                end_date = datetime.now().strftime('%Y-%m-%d')

            if start_date is None:
                start_date = (datetime.now() - timedelta(days=5 * 365)).strftime('%Y-%m-%d')

            # Convert date strings to datetime
            start_date_dt = pd.to_datetime(start_date)
            end_date_dt = pd.to_datetime(end_date)

            for indicator in indicators:
                try:
                    fred_code = indicator_mapping.get(indicator, indicator)

                    # Check cache
                    cache_key = f"macro_{fred_code}_{start_date}_{end_date}"
                    cached_data = self.cache_provider.get(cache_key)

                    if cached_data is not None:
                        results[indicator] = cached_data
                        logging.info(f"Loaded macro indicator {indicator} from cache")
                        continue

                    # Fetch data from FRED
                    data = web.DataReader(fred_code, 'fred', start_date_dt, end_date_dt)

                    # Store in cache for 1 day
                    self.cache_provider.set(cache_key, data, timedelta(days=1))

                    results[indicator] = data
                    logging.info(f"Macroeconomic indicator loaded {indicator} ({fred_code})")
                except Exception as e:
                    logging.error(f"Error loading indicator {indicator}: {e}")
                    results[indicator] = pd.DataFrame()

            return results
        except ImportError:
            logging.error("pandas_datareader is not installed. Install it with pip install pandas-datareader")
            return {indicator: pd.DataFrame() for indicator in indicators}
        except Exception as e:
            logging.error(f"Error while getting macroeconomic indicators: {e}")
            return {indicator: pd.DataFrame() for indicator in indicators}

    def get_etf_constituents(self, etf_ticker: str) -> List[Dict]:
        """
        Get ETF composition

        Args:
            etf_ticker: ETF ticker

        Returns:
            List of ETF components with weights
        """
        # Cache key for ETF constituents
        cache_key = f"{etf_ticker}_constituents"

        # Check cache
        cached_data = self.cache_provider.get(cache_key)
        if cached_data is not None:
            logging.info(f"Loaded ETF {etf_ticker} constituents from cache")
            return cached_data

        constituents = []

        try:
            import yfinance as yf
            from bs4 import BeautifulSoup

            # Try to get composition via Yahoo Finance
            etf_info = yf.Ticker(etf_ticker)
            holdings = etf_info.holdings

            # If we got data via yfinance
            if holdings is not None and hasattr(holdings, 'to_dict'):
                top_holdings = holdings.get('holdings', [])

                for i, (symbol, data) in enumerate(top_holdings.items()):
                    if i >= 100:
                        break

                    weight = data.get('percent_of_fund', 0)
                    constituent = {
                        'ticker': symbol,
                        'name': data.get('name', ''),
                        'weight': weight / 100 if weight else 0,
                        'sector': data.get('sector', '')
                    }
                    constituents.append(constituent)

            # If yfinance didn't work, try web scraping
            if not constituents:
                if etf_ticker.upper() in ['SPY', 'VOO', 'QQQ', 'VTI', 'IWM']:
                    url = f"https://www.etf.com/{etf_ticker}"
                    headers = {'User-Agent': 'Mozilla/5.0'}

                    response = requests.get(url, headers=headers)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')

                        tables = soup.find_all('table')
                        for table in tables:
                            if 'holdings' in table.get('class', []):
                                rows = table.find_all('tr')
                                for row in rows[1:]:
                                    cells = row.find_all('td')
                                    if len(cells) >= 3:
                                        ticker = cells[0].text.strip()
                                        name = cells[1].text.strip()
                                        weight_text = cells[2].text.strip().replace('%', '')

                                        try:
                                            weight = float(weight_text) / 100
                                        except ValueError:
                                            weight = 0

                                        constituents.append({
                                            'ticker': ticker,
                                            'name': name,
                                            'weight': weight
                                        })

            if constituents:
                # Store in cache for 30 days
                self.cache_provider.set(cache_key, constituents, timedelta(days=30))

            return constituents
        except Exception as e:
            logging.error(f"Error getting ETF composition {etf_ticker}: {e}")
            return []

    def get_sector_performance(self) -> pd.DataFrame:
        """
        Get sector performance data

        Returns:
            DataFrame with sector returns
        """
        cache_key = "sector_performance"

        # Check cache
        cached_data = self.cache_provider.get(cache_key)
        if cached_data is not None:
            logging.info(f"Loaded sector performance from cache")
            return cached_data

        try:
            # List of sector ETFs
            sector_etfs = {
                'Technology': 'XLK',
                'Healthcare': 'XLV',
                'Financials': 'XLF',
                'Consumer Discretionary': 'XLY',
                'Consumer Staples': 'XLP',
                'Energy': 'XLE',
                'Utilities': 'XLU',
                'Real Estate': 'XLRE',
                'Materials': 'XLB',
                'Industrials': 'XLI',
                'Communication Services': 'XLC'
            }

            # Define time periods for returns calculation
            periods = {
                '1D': timedelta(days=1),
                '1W': timedelta(weeks=1),
                '1M': timedelta(days=30),
                '3M': timedelta(days=90),
                'YTD': timedelta(days=(datetime.now() - datetime(datetime.now().year, 1, 1)).days),
                '1Y': timedelta(days=365)
            }

            # Get historical data for all sector ETFs
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=365 + 10)).strftime('%Y-%m-%d')

            etf_data = self.get_batch_data(list(sector_etfs.values()), start_date, end_date)

            # Create a DataFrame with the results
            result_data = []

            for sector_name, ticker in sector_etfs.items():
                if ticker in etf_data and not etf_data[ticker].empty:
                    price_data = etf_data[ticker]

                    price_col = 'Adj Close' if 'Adj Close' in price_data.columns else 'Close'

                    latest_price = price_data[price_col].iloc[-1]

                    returns = {}
                    for period_name, period_delta in periods.items():
                        start_idx = price_data.index[-1] - period_delta
                        historical_data = price_data[price_data.index >= start_idx]

                        if not historical_data.empty and len(historical_data) > 1:
                            start_price = historical_data[price_col].iloc[0]
                            returns[period_name] = (latest_price / start_price - 1) * 100
                        else:
                            returns[period_name] = None

                    # Add information to the result
                    sector_info = {
                        'Sector': sector_name,
                        'Ticker': ticker,
                        'Latest Price': latest_price
                    }
                    sector_info.update(returns)

                    result_data.append(sector_info)

            result_df = pd.DataFrame(result_data)

            # Store in cache for 1 day
            self.cache_provider.set(cache_key, result_df, timedelta(days=1))

            return result_df
        except Exception as e:
            logging.error(f"Error getting sector performance: {e}")
            return pd.DataFrame()

    def get_batch_data(
        self,
        tickers: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        provider: str = 'yfinance'
    ) -> Dict[str, pd.DataFrame]:
        """
        Get data for multiple tickers at once

        Args:
            tickers: List of tickers
            start_date: Start date
            end_date: End date
            provider: Data provider

        Returns:
            Dictionary {ticker: DataFrame}
        """
        results = {}

        ticker_mapping = {}
        corrected_tickers = []

        for ticker in tickers:
            if '.' in ticker:
                corrected_ticker = ticker.replace('.', '-')
                ticker_mapping[corrected_ticker] = ticker
                corrected_tickers.append(corrected_ticker)
            else:
                corrected_tickers.append(ticker)
                ticker_mapping[ticker] = ticker

        if ticker_mapping:
            logging.info(f"Tickers have been replaced for data requests: {ticker_mapping}")

        if provider == 'yfinance' and len(corrected_tickers) > 1:
            try:
                import yfinance as yf

                if end_date is None:
                    end_date = datetime.now().strftime('%Y-%m-%d')

                if start_date is None:
                    start_date = (datetime.now() - timedelta(days=5 * 365)).strftime('%Y-%m-%d')

                tickers_to_download = []
                download_mapping = {}

                for original_ticker in tickers:
                    cache_key = f"{original_ticker}_{start_date}_{end_date}_1d_{provider}"
                    cached_data = self.cache_provider.get(cache_key)

                    if cached_data is not None:
                        results[original_ticker] = cached_data
                        logging.info(f"Loading {original_ticker} data from cache")
                        continue

                    corrected_ticker = original_ticker.replace('.', '-') if '.' in original_ticker else original_ticker
                    tickers_to_download.append(corrected_ticker)
                    download_mapping[corrected_ticker] = original_ticker

                if tickers_to_download:
                    self.api_call_counts['yfinance'] += 1

                    data = yf.download(
                        tickers_to_download,
                        start=start_date,
                        end=end_date,
                        interval='1d',
                        group_by='ticker',
                        progress=False,
                        show_errors=False
                    )

                    for corrected_ticker, original_ticker in download_mapping.items():
                        if len(tickers_to_download) == 1:
                            ticker_data = data
                        else:
                            ticker_data = data[corrected_ticker].copy() if corrected_ticker in data else pd.DataFrame()

                        if not ticker_data.empty:
                            cache_key = f"{original_ticker}_{start_date}_{end_date}_1d_{provider}"
                            self.cache_provider.set(cache_key, ticker_data, timedelta(days=self.cache_expiry_days))

                            results[original_ticker] = ticker_data
                            logging.info(
                                f"Loaded and saved data for {original_ticker} (queried as {corrected_ticker})"
                            )

                return results
            except ImportError:
                logging.error("yfinance is not installed. Install it with pip install yfinance")
            except Exception as e:
                logging.error(f"Error while loading data in batch: {e}")

        # Sequential download for each ticker
        for original_ticker in tickers:
            try:
                corrected_ticker = original_ticker.replace('.', '-') if '.' in original_ticker else original_ticker

                data = self.get_historical_prices(corrected_ticker, start_date, end_date, provider)

                if not data.empty:
                    results[original_ticker] = data
            except Exception as e:
                logging.error(f"Error loading data for {original_ticker}: {e}")

        return results

    def get_fundamental_data(self, ticker: str, data_type: str = 'income') -> pd.DataFrame:
        """
        Get fundamental financial data

        Args:
            ticker: Company ticker
            data_type: Data type ('income', 'balance', 'cash', 'earnings')

        Returns:
            DataFrame with fundamental data
        """
        cache_key = f"{ticker}_fundamental_{data_type}"

        # Check cache
        cached_data = self.cache_provider.get(cache_key)
        if cached_data is not None:
            logging.info(f"Loading fundamental data {data_type} for {ticker} from cache")
            return cached_data

        try:
            import yfinance as yf

            # Increase the API call counter
            self.api_call_counts['yfinance'] += 1

            ticker_obj = yf.Ticker(ticker)

            if data_type == 'income':
                df = ticker_obj.income_stmt
            elif data_type == 'balance':
                df = ticker_obj.balance_sheet
            elif data_type == 'cash':
                df = ticker_obj.cashflow
            elif data_type == 'earnings':
                df = ticker_obj.earnings
            else:
                raise ValueError(f"Unsupported fundamental data type: {data_type}")

            if df is None or df.empty:
                logging.warning(f"No fundamental data {data_type} found for {ticker}")
                return pd.DataFrame()

            # Store in cache for 30 days
            self.cache_provider.set(cache_key, df, timedelta(days=30))

            return df
        except ImportError:
            logging.error("yfinance is not installed. Install it with pip install yfinance")
            return pd.DataFrame()
        except Exception as e:
            logging.error(f"Error in getting fundamental data for {ticker}: {e}")
            return pd.DataFrame()

    def clear_cache(self, tickers: Optional[List[str]] = None):
        """
        Clear data cache

        Args:
            tickers: List of tickers to clear. If None, clears the entire cache.
        """
        if tickers is None:
            # Clear all cache
            self.cache_provider.clear()
            logging.info("The cache has been completely cleared.")
        else:
            # Clear cache for specific tickers
            for ticker in tickers:
                # Pattern matching for ticker-related cache keys
                pattern = f"^{ticker}_"
                keys_to_clear = self.cache_provider.get_keys(pattern)
                for key in keys_to_clear:
                    self.cache_provider.delete(key)
            logging.info(f"Cache cleared for tickers: {tickers}")

    # Helper methods for fetching data from specific providers
    def _fetch_yfinance(self, ticker: str, start_date: str, end_date: str, interval: str = '1d') -> pd.DataFrame:
        """
        Get data via yfinance

        Args:
            ticker: Stock/ETF ticker
            start_date: Start date
            end_date: End date
            interval: Data interval

        Returns:
            DataFrame with historical data
        """
        try:
            import yfinance as yf

            original_ticker = ticker
            corrected_ticker = ticker.replace('.', '-') if '.' in ticker else ticker

            if corrected_ticker != original_ticker:
                logging.info(f"Use corrected ticker {corrected_ticker} to query {original_ticker}")

            # Increase the API call counter
            self.api_call_counts['yfinance'] += 1

            try:
                ticker_obj = yf.Ticker(corrected_ticker)
                data = ticker_obj.history(start=start_date, end=end_date, interval=interval)

                if data is None or data.empty:
                    data = yf.download(
                        corrected_ticker,
                        start=start_date,
                        end=end_date,
                        interval=interval,
                        progress=False,
                        show_errors=False
                    )

                if data is None or data.empty:
                    logging.warning(
                        f"No data found for {original_ticker} (query as {corrected_ticker}) via yfinance"
                    )
                    return pd.DataFrame()

                # Check and adjust index if it is not DatetimeIndex
                if not isinstance(data.index, pd.DatetimeIndex):
                    try:
                        data.index = pd.to_datetime(data.index)
                    except Exception as e:
                        logging.warning(f"Failed to convert index to DatetimeIndex: {e}")

                # Ensure required columns exist
                required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
                for col in required_columns:
                    if col not in data.columns:
                        if col == 'Volume' and 'volume' in data.columns:
                            data['Volume'] = data['volume']
                        else:
                            data[col] = np.nan

                if 'Adj Close' not in data.columns:
                    data['Adj Close'] = data['Close']

                return data

            except Exception as e:
                logging.error(
                    f"Error retrieving data via yfinance for {original_ticker} (request as {corrected_ticker}): {e}"
                )
                return pd.DataFrame()
        except ImportError:
            logging.error("yfinance is not installed. Install it with pip install yfinance")
            return pd.DataFrame()
        except Exception as e:
            logging.error(f"Error retrieving data via yfinance for {ticker}: {e}")
            return pd.DataFrame()

    def _fetch_alpha_vantage(self, ticker: str, start_date: str, end_date: str, interval: str = '1d') -> pd.DataFrame:
        """
        Get data via Alpha Vantage API

        Args:
            ticker: Stock/ETF ticker
            start_date: Start date
            end_date: End date
            interval: Data interval

        Returns:
            DataFrame with historical data
        """
        if not self.api_keys['alpha_vantage']:
            logging.error("API key for Alpha Vantage not installed")
            return pd.DataFrame()

        if self.api_call_counts['alpha_vantage'] >= self.api_limits['alpha_vantage']:
            logging.warning("Alpha Vantage API call limit reached")
            return pd.DataFrame()

        original_ticker = ticker
        corrected_ticker = ticker.replace('.', '-') if '.' in ticker else ticker

        if corrected_ticker != original_ticker:
            logging.info(
                f"Use corrected ticker {corrected_ticker} to query Alpha Vantage {original_ticker}"
            )

        interval_map = {
            '1d': 'daily',
            '1wk': 'weekly',
            '1mo': 'monthly'
        }

        function = f"TIME_SERIES_{interval_map.get(interval, 'daily').upper()}"

        try:
            # Form URL
            base_url = "https://www.alphavantage.co/query"
            params = {
                "function": function,
                "symbol": corrected_ticker,
                "apikey": self.api_keys['alpha_vantage'],
                "outputsize": "full"
            }

            self.api_call_counts['alpha_vantage'] += 1

            response = requests.get(base_url, params=params)
            response.raise_for_status()

            data = response.json()

            if "Error Message" in data:
                logging.error(
                    f"Alpha Vantage API returned an error for {original_ticker} (queried as {corrected_ticker}): {data['Error Message']}"
                )
                return pd.DataFrame()

            # Determine the time series key depending on the function
            time_series_key = next((k for k in data.keys() if k.startswith("Time Series")), None)

            if not time_series_key:
                logging.error(f"Unexpected Alpha Vantage response format for {original_ticker}: {data.keys()}")
                return pd.DataFrame()

            time_series_data = data[time_series_key]

            df = pd.DataFrame.from_dict(time_series_data, orient='index')

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

            for col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

            df.index = pd.to_datetime(df.index)

            df = df.sort_index()

            if start_date:
                df = df[df.index >= start_date]
            if end_date:
                df = df[df.index <= end_date]

            return df
        except requests.exceptions.RequestException as e:
            logging.error(f"Error requesting Alpha Vantage API for {original_ticker}: {e}")
            return pd.DataFrame()
        except Exception as e:
            logging.error(f"Error processing Alpha Vantage data for {original_ticker}: {e}")
            return pd.DataFrame()

    def _get_yfinance_company_info(self, ticker: str) -> Dict:
        """
        Get company information via yfinance

        Args:
            ticker: Company ticker

        Returns:
            Dictionary with company information
        """
        try:
            import yfinance as yf

            # Check if the ticker contains a dot and create a corrected version for the API
            original_ticker = ticker
            corrected_ticker = ticker.replace('.', '-') if '.' in ticker else ticker

            if corrected_ticker != original_ticker:
                logging.info(
                    f"Use the corrected ticker {corrected_ticker} to query information about the company {original_ticker}"
                )

            self.api_call_counts['yfinance'] += 1

            ticker_obj = yf.Ticker(corrected_ticker)
            info = ticker_obj.info

            normalized_info = {
                'symbol': original_ticker,
                'name': info.get('longName', info.get('shortName', original_ticker)),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'country': info.get('country', 'N/A'),
                'exchange': info.get('exchange', 'N/A'),
                'currency': info.get('currency', 'USD'),
                'market_cap': info.get('marketCap', None),
                'pe_ratio': info.get('trailingPE', None),
                'forward_pe': info.get('forwardPE', None),
                'pb_ratio': info.get('priceToBook', None),
                'dividend_yield': info.get('dividendYield', None) if info.get('dividendYield') else None,
                'beta': info.get('beta', None),
                'description': info.get('longBusinessSummary', 'N/A'),
                'website': info.get('website', 'N/A'),
                'employees': info.get('fullTimeEmployees', None),
                'logo_url': info.get('logo_url', None),
                'type': self._determine_asset_type(info),
                'last_updated': datetime.now().strftime('%Y-%m-%d')
            }

            for metric in ['returnOnEquity', 'returnOnAssets', 'profitMargins', 'operatingMargins', 'grossMargins']:
                if metric in info:
                    normalized_info[self._camel_to_snake(metric)] = info[metric]

            return normalized_info
        except ImportError:
            logging.error("yfinance is not installed. Install it with pip install yfinance")
            return {}
        except Exception as e:
            logging.error(f"Error when getting company information via yfinance for {original_ticker}: {e}")
            return {}

    def _get_alpha_vantage_company_info(self, ticker: str) -> Dict:
        """
        Get company information via Alpha Vantage

        Args:
            ticker: Company ticker

        Returns:
            Dictionary with company information
        """
        if not self.api_keys['alpha_vantage']:
            logging.error("API key for Alpha Vantage not installed")
            return {}

        # Check API limits
        if self.api_call_counts['alpha_vantage'] >= self.api_limits['alpha_vantage']:
            logging.warning("Alpha Vantage API call limit reached")
            return {}

        # Check if the ticker contains a dot and create a corrected version for the API
        original_ticker = ticker
        corrected_ticker = ticker.replace('.', '-') if '.' in ticker else ticker

        if corrected_ticker != original_ticker:
            logging.info(
                f"Use the corrected ticker {corrected_ticker} to query Alpha Vantage for company {original_ticker}"
            )

        try:
            base_url = "https://www.alphavantage.co/query"
            params = {
                "function": "OVERVIEW",
                "symbol": corrected_ticker,
                "apikey": self.api_keys['alpha_vantage']
            }

            self.api_call_counts['alpha_vantage'] += 1

            response = requests.get(base_url, params=params)
            response.raise_for_status()

            data = response.json()

            if not data or ("Error Message" in data) or len(data.keys()) <= 1:
                logging.warning(f"Alpha Vantage did not return data for {original_ticker} (queried as {corrected_ticker})")
                return {}

            # Transform and normalize data
            normalized_info = {
                'symbol': original_ticker,
                'name': data.get('Name', original_ticker),
                'sector': data.get('Sector', 'N/A'),
                'industry': data.get('Industry', 'N/A'),
                'country': data.get('Country', 'N/A'),
                'exchange': data.get('Exchange', 'N/A'),
                'currency': data.get('Currency', 'USD'),
                'market_cap': self._safe_convert(data.get('MarketCapitalization'), float),
                'pe_ratio': self._safe_convert(data.get('PERatio'), float),
                'forward_pe': self._safe_convert(data.get('ForwardPE'), float),
                'pb_ratio': self._safe_convert(data.get('PriceToBookRatio'), float),
                'dividend_yield': self._safe_convert(data.get('DividendYield'), float),
                'beta': self._safe_convert(data.get('Beta'), float),
                'description': data.get('Description', 'N/A'),
                'last_updated': datetime.now().strftime('%Y-%m-%d')
            }

            for key in ['ReturnOnEquityTTM', 'ReturnOnAssetsTTM', 'ProfitMargin', 'OperatingMarginTTM',
                        'GrossProfitTTM']:
                if key in data:
                    normalized_key = self._camel_to_snake(key.replace('TTM', ''))
                    normalized_info[normalized_key] = self._safe_convert(data[key], float)

            return normalized_info
        except requests.exceptions.RequestException as e:
            logging.error(f"Error requesting Alpha Vantage API for company information {original_ticker}: {e}")
            return {}
        except Exception as e:
            logging.error(f"Error processing Alpha Vantage information for {original_ticker}: {e}")
            return {}

    def _search_alpha_vantage(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for tickers via Alpha Vantage

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of dictionaries with information about found tickers
        """
        if not self.api_keys['alpha_vantage']:
            logging.error("API key for Alpha Vantage not installed")
            return []

        # Check API limits
        if self.api_call_counts['alpha_vantage'] >= self.api_limits['alpha_vantage']:
            logging.warning("Alpha Vantage API call limit reached")
            return []

        try:
            base_url = "https://www.alphavantage.co/query"
            params = {
                "function": "SYMBOL_SEARCH",
                "keywords": query,
                "apikey": self.api_keys['alpha_vantage']
            }

            self.api_call_counts['alpha_vantage'] += 1

            response = requests.get(base_url, params=params)
            response.raise_for_status()

            data = response.json()

            results = []
            if 'bestMatches' in data:
                for match in data['bestMatches'][:limit]:
                    symbol = match.get('1. symbol', '')

                    display_symbol = symbol
                    if '-' in symbol:
                        # Check for special cases that should be converted to dot notation
                        known_patterns = ['BRK-B', 'BF-B']
                        if symbol in known_patterns or (len(symbol.split('-')) == 2 and len(symbol.split('-')[1]) == 1):
                            display_symbol = symbol.replace('-', '.')
                            logging.info(f"Converted ticker in search results: {symbol} -> {display_symbol}")

                    results.append({
                        'ticker': display_symbol,  # ← ИСПРАВЛЕНО: было 'symbol'
                        'name': match.get('2. name', ''),
                        'exchange': match.get('4. region', ''),
                        'asset_type': match.get('3. type', ''),  # ← ИСПРАВЛЕНО: было 'type'
                        'country': match.get('4. region', ''),
                        'currency': match.get('8. currency', 'USD'),
                        'sector': None,  # Alpha Vantage search не предоставляет sector
                        'industry': None  # Alpha Vantage search не предоставляет industry
                    })

            return results
        except requests.exceptions.RequestException as e:
            logging.error(f"Error requesting Alpha Vantage API for search: {e}")
            return []
        except Exception as e:
            logging.error(f"Error searching for tickers via Alpha Vantage: {e}")
            return []

    def _search_alternative(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Alternative method of finding tickers via Yahoo Finance API

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of dictionaries with information about found tickers
        """
        try:
            import yfinance as yf
            import json

            url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount={limit}&newsCount=0"
            headers = {'User-Agent': 'Mozilla/5.0'}

            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                logging.error(f"Error requesting Yahoo Finance API: {response.status_code}")
                return []

            data = response.json()

            results = []
            if 'quotes' in data and data['quotes']:
                for quote in data['quotes'][:limit]:
                    ticker = quote.get('symbol', '')

                    display_ticker = ticker
                    if '-' in ticker:
                        if len(ticker.split('-')) == 2 and len(ticker.split('-')[1]) == 1:
                            display_ticker = ticker.replace('-', '.')

                    results.append({
                        'ticker': display_ticker,  # ← ИСПРАВЛЕНО: было 'symbol'
                        'name': quote.get('shortname', quote.get('longname', '')),
                        'exchange': quote.get('exchange', ''),
                        'asset_type': quote.get('quoteType', ''),  # ← ИСПРАВЛЕНО: было 'type'
                        'country': quote.get('region', 'US'),
                        'currency': quote.get('currency', 'USD'),
                        'sector': quote.get('sector', ''),
                        'industry': quote.get('industry', '')
                    })

            return results
        except Exception as e:
            logging.error(f"Error searching for tickers via Yahoo Finance: {e}")
            return []

    def _determine_asset_type(self, info: Dict) -> str:
        """
        Determine the asset type based on the information

        Args:
            info: Asset information dictionary

        Returns:
            Asset type as string
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
                return 'Crypto'
            elif quote_type == 'mutualfund':
                return 'Mutual Fund'
            else:
                return quote_type.capitalize()

        if 'fundFamily' in info and info['fundFamily']:
            return 'ETF' if 'ETF' in info.get('longName', '') else 'Mutual Fund'

        if 'industry' in info and info['industry']:
            return 'Stock'

        return 'Unknown'

    def _camel_to_snake(self, name: str) -> str:
        """
        Convert camelCase to snake_case

        Args:
            name: camelCase string

        Returns:
            snake_case string
        """
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def _get_popular_tickers_fallback(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Last resort fallback with popular tickers when APIs fail
        """
        logging.info("🆘 Using popular tickers fallback")

        popular_tickers = [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'asset_type': 'Equity', 'exchange': 'NASDAQ', 'currency': 'USD',
             'country': 'US', 'sector': 'Technology', 'industry': 'Consumer Electronics'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'asset_type': 'Equity', 'exchange': 'NASDAQ',
             'currency': 'USD', 'country': 'US', 'sector': 'Technology', 'industry': 'Software'},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'asset_type': 'Equity', 'exchange': 'NASDAQ',
             'currency': 'USD', 'country': 'US', 'sector': 'Technology', 'industry': 'Internet'},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'asset_type': 'Equity', 'exchange': 'NASDAQ',
             'currency': 'USD', 'country': 'US', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail'},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'asset_type': 'Equity', 'exchange': 'NASDAQ', 'currency': 'USD',
             'country': 'US', 'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers'},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'asset_type': 'Equity', 'exchange': 'NASDAQ',
             'currency': 'USD', 'country': 'US', 'sector': 'Technology', 'industry': 'Social Media'},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'asset_type': 'Equity', 'exchange': 'NASDAQ',
             'currency': 'USD', 'country': 'US', 'sector': 'Technology', 'industry': 'Semiconductors'},
            {'ticker': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'asset_type': 'ETF', 'exchange': 'NYSE',
             'currency': 'USD', 'country': 'US', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund'},
            {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust', 'asset_type': 'ETF', 'exchange': 'NASDAQ', 'currency': 'USD',
             'country': 'US', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund'},
            {'ticker': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'asset_type': 'ETF', 'exchange': 'NYSE',
             'currency': 'USD', 'country': 'US', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund'}
        ]

        if not query or query.strip() == '':
            return popular_tickers[:limit]

        query_lower = query.lower()
        filtered_results = [
            ticker for ticker in popular_tickers
            if query_lower in ticker['ticker'].lower() or query_lower in ticker['name'].lower()
        ]

        if not filtered_results:
            filtered_results = popular_tickers[:3]

        return filtered_results[:limit]

    def _safe_convert(self, value: Any, convert_type) -> Optional[Any]:
        """
        Safe type conversion with error handling

        Args:
            value: Value to convert
            convert_type: Type to convert to

        Returns:
            Converted value or None if conversion fails
        """
        if value is None:
            return None

        try:
            return convert_type(value)
        except (ValueError, TypeError):
            return None