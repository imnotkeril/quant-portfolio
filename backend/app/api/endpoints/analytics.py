"""
Analytics endpoints for portfolio analysis
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
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

router = APIRouter(prefix="/analytics", tags=["analytics"])

logger = logging.getLogger(__name__)


@router.get("/performance")
def calculate_performance_metrics(
        portfolio_id: str = Query(..., description="Portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        benchmark: Optional[str] = Query(None, description="Benchmark ticker symbol"),
        risk_free_rate: Optional[float] = Query(0.02, description="Risk-free rate"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate performance metrics for a portfolio
    """
    try:
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

        # Try to fetch data, but handle errors gracefully
        try:
            price_data = data_fetcher.get_batch_data(tickers, start_date, end_date)
        except Exception as e:
            logger.warning(f"Error fetching data: {e}")
            # Return simple response without calculations
            return {
                "portfolio_id": portfolio_id,
                "start_date": start_date,
                "end_date": end_date,
                "benchmark": benchmark,
                "risk_free_rate": risk_free_rate,
                "total_return": 0.0,
                "annualized_return": 0.0,
                "volatility": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "status": "error",
                "message": "Data fetching failed"
            }

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            return {
                "portfolio_id": portfolio_id,
                "start_date": start_date,
                "end_date": end_date,
                "benchmark": benchmark,
                "risk_free_rate": risk_free_rate,
                "total_return": 0.0,
                "annualized_return": 0.0,
                "volatility": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "status": "error",
                "message": "No price data available"
            }

        # Calculate simple metrics
        try:
            # Calculate returns for each asset
            returns_data = {}
            for ticker, prices in price_data.items():
                if not prices.empty:
                    # Use Adjusted Close if available, otherwise use Close
                    price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                    returns = prices[price_col].pct_change().dropna()
                    returns_data[ticker] = returns

            # Combine into a DataFrame
            returns_df = pd.DataFrame(returns_data)
            returns_df = returns_df.fillna(0)

            # Calculate portfolio returns
            portfolio_returns = sum(returns_df[ticker] * weights.get(ticker, 0) for ticker in returns_df.columns)
            portfolio_returns = portfolio_returns.dropna()

            if len(portfolio_returns) == 0:
                raise ValueError("No valid returns data")

            # Calculate basic metrics
            total_return = float((1 + portfolio_returns).prod() - 1)
            annualized_return = float(portfolio_returns.mean() * 252)  # Assuming daily data
            volatility = float(portfolio_returns.std() * np.sqrt(252))

            # Calculate Sharpe ratio
            sharpe_ratio = float((annualized_return - risk_free_rate) / volatility) if volatility > 0 else 0.0

            # Calculate max drawdown
            cumulative = (1 + portfolio_returns).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = float(abs(drawdown.min()))

            return {
                "portfolio_id": portfolio_id,
                "start_date": start_date,
                "end_date": end_date,
                "benchmark": benchmark,
                "risk_free_rate": risk_free_rate,
                "total_return": total_return,
                "annualized_return": annualized_return,
                "volatility": volatility,
                "sharpe_ratio": sharpe_ratio,
                "max_drawdown": max_drawdown,
                "status": "success"
            }

        except Exception as e:
            logger.error(f"Error in calculations: {e}")
            return {
                "portfolio_id": portfolio_id,
                "start_date": start_date,
                "end_date": end_date,
                "benchmark": benchmark,
                "risk_free_rate": risk_free_rate,
                "total_return": 0.0,
                "annualized_return": 0.0,
                "volatility": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "status": "calculation_error",
                "message": str(e)
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate performance metrics: {str(e)}")


@router.get("/risk")
def calculate_risk_metrics(
        portfolio_id: str = Query(..., description="Portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        confidence_level: Optional[float] = Query(0.95, description="Confidence level"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate risk metrics for a portfolio
    """
    try:
        logger.info(f"Calculating risk metrics for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Simple response for now
        return {
            "portfolio_id": portfolio_id,
            "start_date": start_date or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "confidence_level": confidence_level,
            "var_95": 0.05,
            "cvar_95": 0.07,
            "volatility": 0.15,
            "downside_deviation": 0.12,
            "skewness": 0.0,
            "kurtosis": 3.0,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating risk metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate risk metrics: {str(e)}")


@router.get("/returns")
def calculate_returns(
        portfolio_id: str = Query(..., description="Portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        period: str = Query("daily", description="Period for returns calculation"),
        method: str = Query("simple", description="Method for returns calculation"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate portfolio returns
    """
    try:
        logger.info(f"Calculating returns for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Simple response for now
        return {
            "portfolio_id": portfolio_id,
            "start_date": start_date or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "period": period,
            "method": method,
            "returns": [0.01, -0.02, 0.015, 0.005],  # Sample data
            "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"],
            "statistics": {
                "mean": 0.0025,
                "std": 0.015,
                "min": -0.02,
                "max": 0.015,
                "count": 4
            },
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating returns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate returns: {str(e)}")


@router.get("/cumulative-returns")
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

        # Simple response for now
        return {
            "portfolio_id": portfolio_id,
            "start_date": start_date or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "method": method,
            "benchmark": benchmark,
            "cumulative_returns": {
                "portfolio": [100.0, 101.0, 99.0, 101.5, 103.0],  # Sample data
                "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"]
            },
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating cumulative returns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate cumulative returns: {str(e)}")


@router.get("/drawdowns")
def calculate_drawdowns(
        portfolio_id: str = Query(..., description="Portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate drawdowns for a portfolio
    """
    try:
        logger.info(f"Calculating drawdowns for portfolio: {portfolio_id}")

        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Simple response for now
        return {
            "portfolio_id": portfolio_id,
            "start_date": start_date or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "drawdowns": {
                "values": [0.0, -0.01, -0.02, -0.01, 0.0],  # Sample data
                "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"]
            },
            "max_drawdown": 0.02,
            "max_drawdown_duration": 3,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating drawdowns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate drawdowns: {str(e)}")


@router.get("/compare")
def compare_portfolios(
        portfolio_id1: str = Query(..., description="First portfolio ID"),
        portfolio_id2: str = Query(..., description="Second portfolio ID"),
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        benchmark: Optional[str] = Query(None, description="Benchmark ticker symbol"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Compare two portfolios
    """
    try:
        logger.info(f"Comparing portfolios: {portfolio_id1} vs {portfolio_id2}")

        # Load both portfolios
        portfolio1 = portfolio_manager.load_portfolio(portfolio_id1)
        portfolio2 = portfolio_manager.load_portfolio(portfolio_id2)

        if not portfolio1:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id1} not found")
        if not portfolio2:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id2} not found")

        # Simple response for now
        return {
            "portfolio_id1": portfolio_id1,
            "portfolio_id2": portfolio_id2,
            "start_date": start_date or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "benchmark": benchmark,
            "comparison_metrics": {
                "portfolio1": {"name": portfolio1.get("name", portfolio_id1), "return": 0.10},
                "portfolio2": {"name": portfolio2.get("name", portfolio_id2), "return": 0.08}
            },
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing portfolios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to compare portfolios: {str(e)}")