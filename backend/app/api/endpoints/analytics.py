from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.services.analytics import AnalyticsService
from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.infrastructure.data.data_fetcher import DataFetcherService

# Import Pydantic models (schemas)
from app.schemas.analytics import (
    AnalyticsRequest,
    PerformanceMetricsResponse,
    RiskMetricsResponse
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


# Dependency to get the analytics service
def get_analytics_service():
    return AnalyticsService()


# Dependency to get the portfolio manager service
def get_portfolio_manager():
    data_fetcher = DataFetcherService()
    portfolio_manager = PortfolioManagerService(data_fetcher)
    return portfolio_manager


# Dependency to get the data fetcher service
def get_data_fetcher():
    return DataFetcherService()


@router.post("/performance", response_model=PerformanceMetricsResponse)
def calculate_performance_metrics(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate performance metrics for a portfolio
    """
    try:
        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 1 year ago
            start_date = datetime.now() - timedelta(days=365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

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
        if request.benchmark:
            benchmark_data = data_fetcher.get_historical_prices(
                request.benchmark, request.start_date, request.end_date
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
            risk_free_rate=request.risk_free_rate
        )

        # Calculate cumulative returns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Calculate benchmark cumulative returns if available
        benchmark_cumulative_returns = None
        if benchmark_returns is not None:
            benchmark_cumulative_returns = analytics_service.calculate_cumulative_returns(benchmark_returns)

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "benchmark": request.benchmark,
            "risk_free_rate": request.risk_free_rate,
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
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate performance metrics: {str(e)}")


@router.post("/risk", response_model=RiskMetricsResponse)
def calculate_risk_metrics(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate risk metrics for a portfolio
    """
    try:
        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 1 year ago
            start_date = datetime.now() - timedelta(days=365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

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
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
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
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate risk metrics: {str(e)}")


@router.post("/returns")
def calculate_returns(
        request: AnalyticsRequest,
        period: str = Query("daily", description="Period for returns calculation"),
        method: str = Query("simple", description="Method for returns calculation"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate returns for a portfolio
    """
    try:
        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 1 year ago
            start_date = datetime.now() - timedelta(days=365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'

                # Resample prices based on the requested period
                if period != "daily":
                    # Resample to the requested period before calculating returns
                    period_map = {
                        "weekly": "W",
                        "monthly": "M",
                        "quarterly": "Q",
                        "yearly": "Y"
                    }
                    resample_rule = period_map.get(period, "D")
                    prices_resampled = prices[[price_col]].resample(resample_rule).last()
                    returns_data[ticker] = analytics_service.calculate_returns(
                        prices_resampled, "daily", method
                    )
                else:
                    returns_data[ticker] = analytics_service.calculate_returns(
                        prices[[price_col]], period, method
                    )

        # Combine into a DataFrame
        import pandas as pd
        returns_df = pd.DataFrame(returns_data)

        # Fill NaN values with 0 (for assets with missing data points)
        returns_df = returns_df.fillna(0)

        # Calculate portfolio returns
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        # Calculate cumulative returns
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "period": period,
            "method": method,
            "returns": portfolio_returns.to_dict(),
            "cumulative_returns": cumulative_returns.to_dict(),
            "asset_returns": {ticker: returns.to_dict() for ticker, returns in returns_data.items()}
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate returns: {str(e)}")


@router.post("/cumulative-returns")
def calculate_cumulative_returns(
        request: AnalyticsRequest,
        method: str = Query("simple", description="Method for returns calculation"),
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate cumulative returns for a portfolio
    """
    try:
        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 1 year ago
            start_date = datetime.now() - timedelta(days=365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

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

        # Calculate asset cumulative returns
        asset_cumulative_returns = {}
        for ticker, returns in returns_data.items():
            is_log_returns = method == "log"
            asset_cumulative_returns[ticker] = analytics_service.calculate_cumulative_returns(
                returns, is_log_returns
            ).to_dict()

        # Calculate portfolio cumulative returns
        is_log_returns = method == "log"
        cumulative_returns = analytics_service.calculate_cumulative_returns(
            portfolio_returns, is_log_returns
        )

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "method": method,
            "cumulative_returns": cumulative_returns.to_dict(),
            "asset_cumulative_returns": asset_cumulative_returns
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate cumulative returns: {str(e)}")


@router.post("/drawdowns")
def calculate_drawdowns(
        request: AnalyticsRequest,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate drawdowns for a portfolio
    """
    try:
        # Load the portfolio
        portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the assets and weights
        assets = portfolio.get("assets", [])
        if not assets:
            raise HTTPException(status_code=400, detail="Portfolio has no assets")

        weights = {asset["ticker"]: asset.get("weight", 0) for asset in assets}
        tickers = list(weights.keys())

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 1 year ago
            start_date = datetime.now() - timedelta(days=365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

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

        # Calculate drawdown
        peak = cumulative_returns.cummax()
        drawdown = (cumulative_returns / peak - 1)

        # Extract top 5 drawdowns
        from app.core.services.risk_management import RiskManagement
        risk_service = RiskManagement()
        drawdown_periods = risk_service.analyze_drawdowns(portfolio_returns)

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "max_drawdown": drawdown.min(),
            "current_drawdown": drawdown.iloc[-1],
            "drawdown_series": drawdown.to_dict(),
            "drawdown_periods": drawdown_periods.to_dict(orient='records') if not drawdown_periods.empty else []
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate drawdowns: {str(e)}")


@router.post("/compare")
def compare_portfolios(
        portfolio_id1: str,
        portfolio_id2: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        benchmark: Optional[str] = None,
        analytics_service: AnalyticsService = Depends(get_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Compare performance of two portfolios
    """
    try:
        # Import the PortfolioComparisonService
        from app.core.services.portfolio_comparison import PortfolioComparisonService
        comparison_service = PortfolioComparisonService()

        # Load the portfolios
        portfolio1 = portfolio_manager.load_portfolio(portfolio_id1)
        if not portfolio1:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id1} not found")

        portfolio2 = portfolio_manager.load_portfolio(portfolio_id2)
        if not portfolio2:
            raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id2} not found")

        # Set default dates if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        if not start_date:
            # Default to 1 year ago
            start_date_obj = datetime.now() - timedelta(days=365)
            start_date = start_date_obj.strftime("%Y-%m-%d")

        # Perform the comparison
        result = comparison_service.compare_portfolios(
            portfolio1,
            portfolio2,
            start_date,
            end_date,
            benchmark
        )

        # Further enrich the comparison with performance and risk metrics
        # For both portfolios, calculate returns and perform comparison
        # In a real implementation, this would fetch data and calculate metrics

        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare portfolios: {str(e)}")