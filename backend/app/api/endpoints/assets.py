"""
API endpoints for asset management.
"""
from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from datetime import datetime, timedelta

from backend.app.schemas.asset import (
    AssetSearch,
    AssetHistoricalData,
    AssetPerformance
)
from backend.app.infrastructure.data.data_fetcher import DataFetcherService
from backend.app.infrastructure.data.portfolio_manager import PortfolioManagerService

router = APIRouter(prefix="/assets", tags=["assets"])


def get_data_fetcher():
    """Dependency injection for data fetcher"""
    # This will be replaced with dependency injection in a real app
    from backend.app.api.dependencies import get_data_fetcher_service
    return get_data_fetcher_service()


def get_portfolio_manager():
    """Dependency injection for portfolio manager"""
    from backend.app.api.dependencies import get_portfolio_manager_service
    return get_portfolio_manager_service()


@router.get("/search", response_model=List[AssetSearch])
async def search_assets(
        query: str = Query(..., description="Search query string"),
        limit: int = Query(10, description="Maximum number of results to return"),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Search for assets by name or ticker

    Args:
        query: Search query
        limit: Maximum number of results to return

    Returns:
        List of matching assets
    """
    try:
        results = data_fetcher.search_tickers(query, limit)
        return results
    except Exception as e:
        logging.error(f"Error searching for assets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search for assets: {str(e)}"
        )


@router.get("/historical/{ticker}", response_model=AssetHistoricalData)
async def get_historical_data(
        ticker: str = Path(..., description="Asset ticker symbol"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        interval: str = Query("1d", description="Data interval (1d, 1wk, 1mo)"),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Get historical price data for an asset

    Args:
        ticker: Asset ticker symbol
        start_date: Start date
        end_date: End date
        interval: Data interval

    Returns:
        Historical price data
    """
    try:
        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

        # Get historical price data
        price_data = data_fetcher.get_historical_prices(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            interval=interval
        )

        if price_data.empty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No historical data found for {ticker}"
            )

        # Convert to response format
        dates = price_data.index.strftime("%Y-%m-%d").tolist()

        # Extract price series
        prices = {
            "open": price_data["Open"].tolist() if "Open" in price_data.columns else [],
            "high": price_data["High"].tolist() if "High" in price_data.columns else [],
            "low": price_data["Low"].tolist() if "Low" in price_data.columns else [],
            "close": price_data["Close"].tolist() if "Close" in price_data.columns else [],
            "adj_close": price_data["Adj Close"].tolist() if "Adj Close" in price_data.columns else []
        }

        # Extract volumes if available
        volumes = price_data["Volume"].tolist() if "Volume" in price_data.columns else None

        return {
            "ticker": ticker.upper(),
            "dates": dates,
            "prices": prices,
            "volumes": volumes,
            "start_date": start_date,
            "end_date": end_date,
            "interval": interval
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting historical data for {ticker}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get historical data: {str(e)}"
        )


@router.get("/info/{ticker}")
async def get_asset_info(
        ticker: str = Path(..., description="Asset ticker symbol"),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Get detailed information about an asset

    Args:
        ticker: Asset ticker symbol

    Returns:
        Asset information
    """
    try:
        info = data_fetcher.get_company_info(ticker)

        if not info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No information found for {ticker}"
            )

        return info
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting information for {ticker}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get asset information: {str(e)}"
        )


@router.get("/performance/{ticker}", response_model=AssetPerformance)
async def get_asset_performance(
        ticker: str = Path(..., description="Asset ticker symbol"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        benchmark: Optional[str] = Query(None, description="Benchmark ticker"),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Get performance metrics for an asset

    Args:
        ticker: Asset ticker symbol
        start_date: Start date
        end_date: End date
        benchmark: Benchmark ticker

    Returns:
        Asset performance metrics
    """
    try:
        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

        # Get historical price data
        price_data = data_fetcher.get_historical_prices(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            interval="1d"
        )

        if price_data.empty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No price data found for {ticker}"
            )

        # Get benchmark data if specified
        benchmark_data = None
        if benchmark:
            benchmark_data = data_fetcher.get_historical_prices(
                ticker=benchmark,
                start_date=start_date,
                end_date=end_date,
                interval="1d"
            )

        # Calculate performance metrics
        from backend.app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

        # Calculate returns
        price_col = "Adj Close" if "Adj Close" in price_data.columns else "Close"
        returns = analytics_service.calculate_returns(price_data[[price_col]])

        # Calculate benchmark returns if available
        benchmark_returns = None
        if benchmark_data is not None and not benchmark_data.empty:
            price_col = "Adj Close" if "Adj Close" in benchmark_data.columns else "Close"
            benchmark_returns = analytics_service.calculate_returns(benchmark_data[[price_col]])

        # Calculate basic metrics
        total_return = analytics_service.calculate_cumulative_returns(returns).iloc[-1]
        annualized_return = analytics_service.calculate_annualized_return(returns)
        volatility = analytics_service.calculate_volatility(returns)
        max_drawdown = analytics_service.calculate_max_drawdown(returns)

        # Calculate risk-adjusted metrics
        sharpe_ratio = analytics_service.calculate_sharpe_ratio(returns)
        sortino_ratio = analytics_service.calculate_sortino_ratio(returns)

        # Calculate benchmark-relative metrics
        beta = None
        alpha = None
        if benchmark_returns is not None:
            beta = analytics_service.calculate_beta(returns, benchmark_returns)
            alpha = analytics_service.calculate_alpha(returns, benchmark_returns)

        # Calculate period returns
        period_returns = {}

        # 1 day
        if len(returns) > 1:
            period_returns["1d"] = returns.iloc[-1]

        # 1 week
        one_week_ago = returns.index[-1] - timedelta(days=7)
        week_data = returns[returns.index >= one_week_ago]
        if not week_data.empty:
            period_returns["1w"] = analytics_service.calculate_cumulative_returns(week_data).iloc[-1]

        # 1 month
        one_month_ago = returns.index[-1] - timedelta(days=30)
        month_data = returns[returns.index >= one_month_ago]
        if not month_data.empty:
            period_returns["1m"] = analytics_service.calculate_cumulative_returns(month_data).iloc[-1]

        # 3 months
        three_months_ago = returns.index[-1] - timedelta(days=90)
        three_month_data = returns[returns.index >= three_months_ago]
        if not three_month_data.empty:
            period_returns["3m"] = analytics_service.calculate_cumulative_returns(three_month_data).iloc[-1]

        # 6 months
        six_months_ago = returns.index[-1] - timedelta(days=180)
        six_month_data = returns[returns.index >= six_months_ago]
        if not six_month_data.empty:
            period_returns["6m"] = analytics_service.calculate_cumulative_returns(six_month_data).iloc[-1]

        # 1 year
        one_year_ago = returns.index[-1] - timedelta(days=365)
        year_data = returns[returns.index >= one_year_ago]
        if not year_data.empty:
            period_returns["1y"] = analytics_service.calculate_cumulative_returns(year_data).iloc[-1]

        # YTD (Year to Date)
        start_of_year = datetime(returns.index[-1].year, 1, 1)
        ytd_data = returns[returns.index >= start_of_year]
        if not ytd_data.empty:
            period_returns["ytd"] = analytics_service.calculate_cumulative_returns(ytd_data).iloc[-1]

        return {
            "ticker": ticker.upper(),
            "total_return": total_return,
            "annualized_return": annualized_return,
            "volatility": volatility,
            "max_drawdown": max_drawdown,
            "sharpe_ratio": sharpe_ratio,
            "sortino_ratio": sortino_ratio,
            "beta": beta,
            "alpha": alpha,
            "period_returns": period_returns,
            "start_date": start_date,
            "end_date": end_date,
            "benchmark_id": benchmark
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error calculating performance metrics for {ticker}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate performance metrics: {str(e)}"
        )


@router.get("/validate/{ticker}")
async def validate_ticker(
        ticker: str = Path(..., description="Asset ticker symbol"),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Validate if a ticker symbol exists

    Args:
        ticker: Asset ticker symbol

    Returns:
        Validation result
    """
    try:
        valid_tickers, invalid_tickers = data_fetcher.validate_tickers([ticker])

        return {
            "ticker": ticker.upper(),
            "valid": ticker.upper() in valid_tickers,
            "exchange": None  # This could be populated if the data provider returns exchange info
        }
    except Exception as e:
        logging.error(f"Error validating ticker {ticker}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate ticker: {str(e)}"
        )


@router.get("/market-status")
async def get_market_status(
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Get current market status

    Returns:
        Market status information
    """
    try:
        status = data_fetcher.get_market_status()
        return status
    except Exception as e:
        logging.error(f"Error getting market status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market status: {str(e)}"
        )


@router.get("/sectors/performance")
async def get_sector_performance(
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Get sector performance data

    Returns:
        Sector performance data
    """
    try:
        performance = data_fetcher.get_sector_performance()

        # Convert DataFrame to list of dictionaries for JSON response
        if hasattr(performance, 'to_dict'):
            return performance.to_dict(orient="records")

        return performance
    except Exception as e:
        logging.error(f"Error getting sector performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sector performance: {str(e)}"
        )