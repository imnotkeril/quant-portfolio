from typing import Dict, List, Tuple, Optional, Any
from abc import ABC, abstractmethod
import pandas as pd
from datetime import datetime


class DataProvider(ABC):
    """Abstract interface for data providers."""

    @abstractmethod
    def get_historical_prices(
            self,
            ticker: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            interval: str = "1d",
            force_refresh: bool = False
    ) -> pd.DataFrame:
        """Get historical price data for a given ticker.

        Args:
            ticker: Stock/ETF ticker symbol
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            interval: Data interval ('1d', '1wk', '1mo')
            force_refresh: Force refresh data from source

        Returns:
            DataFrame with historical price data
        """
        pass

    @abstractmethod
    def get_company_info(
            self,
            ticker: str
    ) -> Dict[str, Any]:
        """Get company information for a given ticker.

        Args:
            ticker: Stock/ETF ticker symbol

        Returns:
            Dictionary with company information
        """
        pass

    @abstractmethod
    def search_tickers(
            self,
            query: str,
            limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for tickers based on a query.

        Args:
            query: Search query string
            limit: Maximum number of results

        Returns:
            List of dictionaries with ticker information
        """
        pass

    @abstractmethod
    def validate_tickers(
            self,
            tickers: List[str]
    ) -> Tuple[List[str], List[str]]:
        """Validate a list of tickers.

        Args:
            tickers: List of ticker symbols to validate

        Returns:
            Tuple of (valid_tickers, invalid_tickers)
        """
        pass

    @abstractmethod
    def get_macro_indicators(
            self,
            indicators: List[str],
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
    ) -> Dict[str, pd.DataFrame]:
        """Get macroeconomic indicators.

        Args:
            indicators: List of indicator codes
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format

        Returns:
            Dictionary mapping indicator codes to DataFrames with indicator data
        """
        pass

    @abstractmethod
    def get_etf_constituents(
            self,
            etf_ticker: str
    ) -> List[Dict[str, Any]]:
        """Get the constituents of an ETF.

        Args:
            etf_ticker: ETF ticker symbol

        Returns:
            List of dictionaries with constituent information
        """
        pass

    @abstractmethod
    def get_sector_performance(self) -> pd.DataFrame:
        """Get sector performance data.

        Returns:
            DataFrame with sector performance data
        """
        pass

    @abstractmethod
    def get_batch_data(
            self,
            tickers: List[str],
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
    ) -> Dict[str, pd.DataFrame]:
        """Get historical price data for multiple tickers.

        Args:
            tickers: List of ticker symbols
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format

        Returns:
            Dictionary mapping ticker symbols to DataFrames with price data
        """
        pass

    @abstractmethod
    def get_fundamental_data(
            self,
            ticker: str,
            data_type: str = "income"
    ) -> pd.DataFrame:
        """Get fundamental financial data for a given ticker.

        Args:
            ticker: Stock ticker symbol
            data_type: Type of data ('income', 'balance', 'cash', 'earnings')

        Returns:
            DataFrame with fundamental data
        """
        pass

    @abstractmethod
    def clear_cache(
            self,
            tickers: Optional[List[str]] = None
    ) -> None:
        """Clear cached data.

        Args:
            tickers: List of tickers to clear cache for, or None to clear all
        """
        pass