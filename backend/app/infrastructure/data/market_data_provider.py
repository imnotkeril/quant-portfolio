"""
Abstract base class for market data providers.
Defines the interface that all data providers must implement.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any
import pandas as pd
from datetime import datetime, timedelta


class MarketDataProvider(ABC):
    """
    Abstract base class that defines the interface for market data providers.
    All specific providers (Yahoo Finance, Alpha Vantage, etc.) must implement this interface.
    """

    @abstractmethod
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
            DataFrame with historical price data (columns: Open, High, Low, Close, Adj Close, Volume)
        """
        pass

    @abstractmethod
    def get_latest_price(
        self,
        ticker: str
    ) -> Dict[str, Any]:
        """
        Get the latest price for a given ticker.

        Args:
            ticker: Stock symbol

        Returns:
            Dictionary with latest price data
        """
        pass

    @abstractmethod
    def get_company_info(
        self,
        ticker: str
    ) -> Dict[str, Any]:
        """
        Get company information for a given ticker.

        Args:
            ticker: Stock symbol

        Returns:
            Dictionary with company information
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    def search_tickers(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for tickers based on a query string.

        Args:
            query: Search query
            limit: Maximum number of results to return

        Returns:
            List of dictionaries with ticker information
        """
        pass

    @abstractmethod
    def get_market_status(self) -> Dict[str, Any]:
        """
        Get current market status.

        Returns:
            Dictionary with market status information
        """
        pass

    @abstractmethod
    def get_fundamentals(
        self,
        ticker: str,
        data_type: str = "income"
    ) -> pd.DataFrame:
        """
        Get fundamental financial data for a company.

        Args:
            ticker: Stock symbol
            data_type: Type of fundamental data ('income', 'balance', 'cash', 'earnings')

        Returns:
            DataFrame with fundamental financial data
        """
        pass

    @abstractmethod
    def is_valid_ticker(self, ticker: str) -> bool:
        """
        Check if a ticker symbol is valid.

        Args:
            ticker: Stock symbol to check

        Returns:
            True if the ticker is valid, False otherwise
        """
        pass