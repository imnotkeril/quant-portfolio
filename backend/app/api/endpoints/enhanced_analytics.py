from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.services.enhanced_analytics import EnhancedAnalyticsService
from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.infrastructure.data.data_fetcher import DataFetcherService

# Import correct dependencies
from app.api.dependencies import (
    get_data_fetcher_service,
    get_portfolio_manager_service
)

# Import Pydantic models (schemas)
from app.schemas.analytics import (
    AnalyticsRequest,
    EnhancedAnalyticsRequest,
    RollingMetricsRequest,
    SeasonalAnalysisResponse
)

router = APIRouter(prefix="/enhanced-analytics", tags=["enhanced-analytics"])


# Dependency to get the enhanced analytics service
def get_enhanced_analytics_service():
    return EnhancedAnalyticsService()


@router.post("/advanced-metrics", response_model=EnhancedAnalyticsRequest)
def calculate_enhanced_metrics(
        request: AnalyticsRequest,
        enhanced_analytics: EnhancedAnalyticsService = Depends(get_enhanced_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate enhanced metrics like Omega ratio, Ulcer index, etc.
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
        import pandas as pd
        from app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

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

        # Calculate enhanced metrics
        omega_ratio = enhanced_analytics.calculate_omega_ratio(
            portfolio_returns,
            risk_free_rate=request.risk_free_rate,
            target_return=0.0
        )

        ulcer_index = enhanced_analytics.calculate_ulcer_index(portfolio_returns)

        sharpe_stability = enhanced_analytics.calculate_sharpe_stability(
            portfolio_returns,
            risk_free_rate=request.risk_free_rate
        )

        tail_risk = enhanced_analytics.calculate_tail_risk(
            portfolio_returns,
            confidence_level=0.95
        )

        drawdown_stats = enhanced_analytics.calculate_drawdown_statistics(portfolio_returns)

        confidence_intervals = enhanced_analytics.calculate_confidence_intervals(
            portfolio_returns,
            confidence_level=0.95
        )

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "benchmark": request.benchmark,
            "metrics": {
                "omega_ratio": omega_ratio,
                "ulcer_index": ulcer_index,
                "sharpe_stability": sharpe_stability,
                "tail_risk": tail_risk,
                "drawdown_statistics": drawdown_stats,
                "confidence_intervals": confidence_intervals
            }
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate enhanced metrics: {str(e)}")


@router.post("/rolling-metrics")
def calculate_rolling_metrics(
        request: RollingMetricsRequest,
        enhanced_analytics: EnhancedAnalyticsService = Depends(get_enhanced_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate rolling metrics (e.g., rolling Sharpe ratio, rolling volatility)
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
        import pandas as pd
        from app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

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

        # Set default metrics if not specified
        if not request.metrics or len(request.metrics) == 0:
            request.metrics = ["returns", "volatility", "sharpe_ratio", "drawdown"]

        # Set default window size if not specified
        if not request.window:
            request.window = 21  # Default to 21 days (roughly 1 month)

        # Calculate rolling statistics
        rolling_stats = enhanced_analytics.calculate_rolling_statistics(
            portfolio_returns,
            window=request.window,
            metrics=request.metrics
        )

        # Convert to dictionary for serialization
        rolling_stats_dict = {
            metric: series.to_dict() for metric, series in rolling_stats.items()
        }

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "window": request.window,
            "metrics": request.metrics,
            "rolling_metrics": rolling_stats_dict
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate rolling metrics: {str(e)}")


@router.post("/seasonal-patterns")
def analyze_seasonal_patterns(
        request: SeasonalAnalysisResponse,
        enhanced_analytics: EnhancedAnalyticsService = Depends(get_enhanced_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Analyze seasonal patterns in portfolio returns
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

        # Make sure we have enough historical data for seasonal analysis
        if not request.start_date:
            # Default to 5 years ago for seasonal analysis
            start_date = datetime.now() - timedelta(days=5 * 365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

        # Check if price data was retrieved successfully
        if not price_data or all(price_data[ticker].empty for ticker in price_data):
            raise HTTPException(status_code=400, detail="Failed to retrieve price data for portfolio assets")

        # Calculate returns for each asset
        import pandas as pd
        from app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

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

        # Calculate seasonal patterns
        seasonal_patterns = enhanced_analytics.calculate_seasonal_patterns(portfolio_returns)

        # Convert to serializable format
        serializable_patterns = {}
        for pattern_name, pattern_data in seasonal_patterns.items():
            if isinstance(pattern_data, pd.DataFrame):
                serializable_patterns[pattern_name] = pattern_data.to_dict()
            else:
                serializable_patterns[pattern_name] = pattern_data

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "seasonal_patterns": serializable_patterns
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze seasonal patterns: {str(e)}")


@router.post("/confidence-intervals")
def calculate_confidence_intervals(
        request: AnalyticsRequest,
        confidence_level: float = Query(0.95, description="Confidence level for interval calculation"),
        enhanced_analytics: EnhancedAnalyticsService = Depends(get_enhanced_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Calculate confidence intervals for portfolio metrics
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
        import pandas as pd
        from app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

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

        # Calculate confidence intervals
        confidence_intervals = enhanced_analytics.calculate_confidence_intervals(
            portfolio_returns, confidence_level
        )

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "confidence_level": confidence_level,
            "confidence_intervals": confidence_intervals
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate confidence intervals: {str(e)}")


@router.post("/tail-risk")
def analyze_tail_risk(
        request: AnalyticsRequest,
        confidence_level: float = Query(0.95, description="Confidence level for tail risk calculation"),
        method: str = Query("historical", description="Method for tail risk calculation"),
        enhanced_analytics: EnhancedAnalyticsService = Depends(get_enhanced_analytics_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service)
):
    """
    Analyze tail risk of a portfolio
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
        import pandas as pd
        from app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

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

        # Calculate tail risk
        tail_risk = enhanced_analytics.calculate_tail_risk(
            portfolio_returns, confidence_level, method
        )

        # Prepare the response
        result = {
            "portfolio_id": request.portfolio_id,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "confidence_level": confidence_level,
            "method": method,
            "tail_risk": tail_risk
        }

        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze tail risk: {str(e)}")