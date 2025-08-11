"""
Analytics endpoints for portfolio analysis
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.services.analytics import AnalyticsService
from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.infrastructure.data.data_fetcher import DataFetcherService

# Import correct dependencies
from app.api.dependencies import (
    get_analytics_service,
    get_data_fetcher_service,
    get_portfolio_manager_service
)

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
        import pandas as pd
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Fetch benchmark data if specified
        benchmark_returns = None
        if benchmark:
            benchmark_data = data_fetcher.get_historical_prices(
                benchmark, start_date, end_date
            )

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
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    except Exception as e:
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
        import pandas as pd
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate risk metrics
        volatility = analytics_service.calculate_volatility(portfolio_returns)
        max_drawdown = analytics_service.calculate_max_drawdown(portfolio_returns)
        var_95 = analytics_service.calculate_var(portfolio_returns, 0.95)
        var_99 = analytics_service.calculate_var(portfolio_returns, 0.99)
        cvar_95 = analytics_service.calculate_cvar(portfolio_returns, 0.95)
        cvar_99 = analytics_service.calculate_cvar(portfolio_returns, 0.99)

        # Calculate downside deviation
        negative_returns = portfolio_returns[portfolio_returns < 0]
        downside_deviation = negative_returns.std() * (252 ** 0.5) if len(negative_returns) > 0 else 0

        # Calculate drawdown series
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)
        peak = cumulative_returns.cummax()
        drawdown = (cumulative_returns / peak - 1)

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "confidence_level": confidence_level,
            "risk_metrics": {
                "volatility": volatility,
                "max_drawdown": max_drawdown,
                "var_95": var_95,
                "var_99": var_99,
                "cvar_95": cvar_95,
                "cvar_99": cvar_99,
                "downside_deviation": downside_deviation
            },
            "drawdown_series": drawdown.to_dict()
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate risk metrics: {str(e)}")


@router.post("/returns", response_model=ReturnsResponse)
def calculate_returns(
        request: AnalyticsRequest,
        period: str = Query("daily", description="Period for returns calculation"),
        method: str = Query("simple", description="Method for returns calculation"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate returns for a portfolio
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date

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
        import pandas as pd
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
            "period": period,
            "method": method,
            "returns": portfolio_returns.to_dict(),
            "asset_returns": {ticker: returns.to_dict() for ticker, returns in returns_data.items()}
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate returns: {str(e)}")


@router.post("/cumulative-returns", response_model=CumulativeReturnsResponse)
def calculate_cumulative_returns(
        request: AnalyticsRequest,
        method: str = Query("simple", description="Method for returns calculation"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate cumulative returns for a portfolio
    """
    try:
        portfolio_id = request.portfolio_id
        start_date = request.start_date
        end_date = request.end_date
        benchmark = request.benchmark

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
        import pandas as pd
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate cumulative returns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Fetch benchmark data if specified
        benchmark_cumulative_returns = None
        if benchmark:
            benchmark_data = data_fetcher.get_historical_prices(
                benchmark, start_date, end_date
            )

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
            "benchmark": benchmark,
            "cumulative_returns": cumulative_returns.to_dict()
        }

        if benchmark_cumulative_returns is not None:
            result["benchmark_cumulative_returns"] = benchmark_cumulative_returns.to_dict()

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    except Exception as e:
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
        import pandas as pd
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate cumulative returns and drawdowns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)
        peak = cumulative_returns.cummax()
        drawdown = (cumulative_returns / peak - 1)

        # Calculate max drawdown
        max_drawdown = analytics_service.calculate_max_drawdown(portfolio_returns)

        # Find drawdown periods
        drawdown_periods = []
        in_drawdown = False
        start_idx = None

        for i, dd in enumerate(drawdown):
            if dd < 0 and not in_drawdown:
                # Start of new drawdown
                in_drawdown = True
                start_idx = i
            elif dd >= 0 and in_drawdown:
                # End of drawdown
                in_drawdown = False
                if start_idx is not None:
                    period_dd = drawdown.iloc[start_idx:i]
                    min_dd = period_dd.min()
                    drawdown_periods.append({
                        "start_date": drawdown.index[start_idx].isoformat(),
                        "end_date": drawdown.index[i - 1].isoformat(),
                        "duration_days": (drawdown.index[i - 1] - drawdown.index[start_idx]).days,
                        "max_drawdown": min_dd
                    })

        # Handle case where we're still in drawdown at the end
        if in_drawdown and start_idx is not None:
            period_dd = drawdown.iloc[start_idx:]
            min_dd = period_dd.min()
            drawdown_periods.append({
                "start_date": drawdown.index[start_idx].isoformat(),
                "end_date": drawdown.index[-1].isoformat(),
                "duration_days": (drawdown.index[-1] - drawdown.index[start_idx]).days,
                "max_drawdown": min_dd
            })

        # Prepare the response
        result = {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date,
            "max_drawdown": max_drawdown,
            "drawdown_series": drawdown.to_dict(),
            "drawdown_periods": drawdown_periods,
            "current_drawdown": drawdown.iloc[-1] if len(drawdown) > 0 else 0
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    except Exception as e:
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
        # Implementation would be similar to other endpoints
        # but comparing two portfolios instead of one
        raise HTTPException(status_code=501, detail="Portfolio comparison not yet implemented")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare portfolios: {str(e)}")