"""
Analytics endpoints for portfolio analysis
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import logging

from app.core.services.analytics import AnalyticsService
from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.infrastructure.data.data_fetcher import DataFetcherService

# Import correct dependencies
from app.api.dependencies import (
    get_data_fetcher_service,
    get_portfolio_manager_service
)

# Local dependency for analytics service
def get_analytics_service():
    from app.core.services.analytics import AnalyticsService
    return AnalyticsService()

# Import Pydantic models (schemas)
from app.schemas.analytics import (
    AnalyticsRequest,
    PerformanceMetricsResponse,
    RiskMetricsResponse,
    ReturnsResponse,
    CumulativeReturnsResponse,
    DrawdownsResponse,
    ComparisonRequest,
    ComparisonResponse
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

logger = logging.getLogger(__name__)


@router.post("/performance", response_model=PerformanceMetricsResponse)
def calculate_performance_metrics(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate performance metrics for a portfolio
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date
        benchmark = request.benchmark
        risk_free_rate = request.risk_free_rate or 0.02

        logger.info(f"Calculating performance metrics for portfolio: {portfolio_id}")

        # Validate portfolio_id
        if not portfolio_id:
            raise HTTPException(status_code=400, detail="Portfolio ID is required")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate benchmark returns if provided
        benchmark_returns = None
        if benchmark:
            benchmark_data = data_fetcher.get_historical_data(benchmark, start_date, end_date)
            if not benchmark_data.empty:
                price_col = 'Adj Close' if 'Adj Close' in benchmark_data.columns else 'Close'
                benchmark_returns = analytics_service.calculate_returns(benchmark_data[[price_col]])

                # Align with portfolio returns dates
                common_index = portfolio_returns.index.intersection(benchmark_returns.index)
                if len(common_index) > 0:
                    portfolio_returns = portfolio_returns.loc[common_index]
                    benchmark_returns = benchmark_returns.loc[common_index]
                else:
                    benchmark_returns = None

        # Calculate performance metrics
        metrics = analytics_service.calculate_portfolio_metrics(
            portfolio_returns,
            benchmark_returns,
            risk_free_rate=risk_free_rate
        )

        # Calculate cumulative returns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Calculate benchmark cumulative returns if available
        benchmark_cumulative_returns = None
        if benchmark_returns is not None:
            benchmark_cumulative_returns = analytics_service.calculate_cumulative_returns(benchmark_returns)

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "benchmark": benchmark,
            "risk_free_rate": risk_free_rate,
            "metrics": metrics,
            # Convert time series data to dict for JSON serialization
            "returns": portfolio_returns.to_dict(),
            "cumulative_returns": cumulative_returns.to_dict()
        }

        # Add benchmark data if available
        if benchmark_returns is not None:
            result["benchmark_returns"] = benchmark_returns.to_dict()

        if benchmark_cumulative_returns is not None:
            result["benchmark_cumulative_returns"] = benchmark_cumulative_returns.to_dict()

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate performance metrics: {str(e)}")


@router.post("/risk", response_model=RiskMetricsResponse)
def calculate_risk_metrics(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate risk metrics for a portfolio
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date
        confidence_level = request.confidence_level or 0.95

        logger.info(f"Calculating risk metrics for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate risk metrics
        risk_metrics = analytics_service.calculate_risk_metrics(
            portfolio_returns,
            confidence_level=confidence_level
        )

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "confidence_level": confidence_level,
            "risk_metrics": risk_metrics,
            "returns": portfolio_returns.to_dict()
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating risk metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate risk metrics: {str(e)}")


@router.post("/returns", response_model=ReturnsResponse)
def calculate_returns(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate portfolio returns
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date

        logger.info(f"Calculating returns for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "returns": portfolio_returns.to_dict(),
            "statistics": {
                "mean": float(portfolio_returns.mean()),
                "std": float(portfolio_returns.std()),
                "min": float(portfolio_returns.min()),
                "max": float(portfolio_returns.max()),
                "count": len(portfolio_returns)
            }
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating returns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate returns: {str(e)}")


@router.get("/cumulative-returns", response_model=CumulativeReturnsResponse)
def calculate_cumulative_returns(
        portfolio_id: str = Query(..., description="Portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        method: str = Query("simple", description="Calculation method (simple or compound)"),
        benchmark: Optional[str] = Query(None, description="Benchmark ticker symbol"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate cumulative returns for a portfolio
    """
    try:
        logger.info(f"Calculating cumulative returns for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate cumulative returns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Calculate benchmark cumulative returns if provided
        benchmark_cumulative_returns = None
        if benchmark:
            benchmark_data = data_fetcher.get_historical_data(benchmark, start_date, end_date)
            if not benchmark_data.empty:
                price_col = 'Adj Close' if 'Adj Close' in benchmark_data.columns else 'Close'
                benchmark_returns = analytics_service.calculate_returns(benchmark_data[[price_col]])
                benchmark_cumulative_returns = analytics_service.calculate_cumulative_returns(benchmark_returns)

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "method": method,
            "cumulative_returns": {
                "portfolio": cumulative_returns.tolist()
            }
        }

        if benchmark_cumulative_returns is not None:
            result["cumulative_returns"]["benchmark"] = benchmark_cumulative_returns.tolist()

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating cumulative returns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate cumulative returns: {str(e)}")


@router.post("/drawdowns", response_model=DrawdownsResponse)
def calculate_drawdowns(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate drawdowns for a portfolio
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date

        logger.info(f"Calculating drawdowns for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate drawdowns
        drawdowns = analytics_service.calculate_drawdowns(portfolio_returns)

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "drawdowns": drawdowns.to_dict(),
            "max_drawdown": float(drawdowns.min()),
            "max_drawdown_duration": len(drawdowns[drawdowns < 0])
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating drawdowns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate drawdowns: {str(e)}")


@router.post("/compare", response_model=ComparisonResponse)
def compare_portfolios(
        request: ComparisonRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Compare two portfolios
    """
    try:
        portfolio_id1 = request.portfolio_id1
        portfolio_id2 = request.portfolio_id2
        start_date = request.start_date
        end_date = request.end_date

        logger.info(f"Comparing portfolios: {portfolio_id1} vs {portfolio_id2}")

        # Load both portfolios
        portfolio1 = portfolio_manager.load_portfolio(portfolio_id1)
        portfolio2 = portfolio_manager.load_portfolio(portfolio_id2)

        if not portfolio1:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id1} not found")
        if not portfolio2:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id2} not found")

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Calculate metrics for both portfolios
        # This is a simplified comparison - extend as needed
        comparison_result = {
            "portfolio_id1": portfolio_id1,
            "portfolio_id2": portfolio_id2,
            "start_date": start_date,
            "end_date": end_date,
            "comparison_metrics": {
                "portfolio1": {"name": portfolio1.get("name", portfolio_id1)},
                "portfolio2": {"name": portfolio2.get("name", portfolio_id2)}
            }
        }

        return comparison_result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing portfolios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to compare portfolios: {str(e)}")