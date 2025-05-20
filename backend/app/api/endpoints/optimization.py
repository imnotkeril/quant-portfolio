from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np
from backend.app.core.services.optimization import OptimizationService
from backend.app.infrastructure.data.portfolio_manager import PortfolioManagerService
from backend.app.infrastructure.data.data_fetcher import DataFetcherService

# Import Pydantic models (schemas)
from backend.app.schemas.optimization import (
    OptimizationRequest,
    OptimizationResponse,
    EfficientFrontierRequest,
    EfficientFrontierResponse
)

router = APIRouter(prefix="/optimization", tags=["optimization"])


# Dependency to get the portfolio optimizer service
def get_portfolio_optimizer():
    return OptimizationService()


# Dependency to get the portfolio manager service
def get_portfolio_manager():
    data_fetcher = DataFetcherService()
    portfolio_manager = PortfolioManagerService(data_fetcher)
    return portfolio_manager

# Dependency to get the data fetcher service
def get_data_fetcher():
    return DataFetcherService()


@router.post("/", response_model=OptimizationResponse)
def optimize_portfolio(
        request: OptimizationRequest,
        method: str = Query("markowitz", description="Optimization method"),
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Optimize portfolio using various methods
    """
    try:
        # Validate optimization method
        valid_methods = ["markowitz", "risk_parity", "minimum_variance", "maximum_sharpe", "equal_weight"]
        if method not in valid_methods:
            raise HTTPException(status_code=400,
                                detail=f"Invalid optimization method: {method}. Valid options are: {', '.join(valid_methods)}")

        # Load the portfolio if specified
        portfolio = None
        if request.portfolio_id:
            portfolio = portfolio_manager.load_portfolio(request.portfolio_id)
            if not portfolio:
                raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")

        # Get the tickers either from request or from portfolio
        tickers = request.tickers
        if not tickers and portfolio:
            tickers = [asset["ticker"] for asset in portfolio.get("assets", [])]

        if not tickers:
            raise HTTPException(status_code=400, detail="No tickers provided for optimization")

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 3 years ago for reasonable return estimation
            start_date = datetime.now() - timedelta(days=3 * 365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

        # Check if price data was retrieved successfully
        valid_tickers = [ticker for ticker, prices in price_data.items() if not prices.empty]

        if not valid_tickers:
            raise HTTPException(status_code=400,
                                detail="Failed to retrieve price data for any of the specified tickers")

        if len(valid_tickers) < len(tickers):
            missing_tickers = set(tickers) - set(valid_tickers)
            detailed_error = f"Failed to retrieve price data for the following tickers: {', '.join(missing_tickers)}"
            raise HTTPException(status_code=400, detail=detailed_error)

        # Calculate returns for each asset
        import pandas as pd
        from backend.app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Handle missing values
        # For optimization, it's often better to drop rows with NaN values
        returns_df = returns_df.dropna()

        if returns_df.empty:
            raise HTTPException(status_code=400, detail="Not enough overlapping data points for optimization")

        # Gather optimization parameters
        optimization_params = {
            "risk_free_rate": request.risk_free_rate
        }

        # Add method-specific parameters
        if method == "markowitz":
            optimization_params.update({
                "target_return": request.target_return,
                "target_risk": request.target_risk,
                "min_weight": request.min_weight or 0.0,
                "max_weight": request.max_weight or 1.0
            })
        elif method == "risk_parity":
            # Convert risk budget from ticker:budget format to dictionary
            if request.risk_budget:
                risk_budget = {}
                for item in request.risk_budget:
                    ticker, budget = item.split(":")
                    risk_budget[ticker] = float(budget)

                optimization_params["risk_budget"] = risk_budget

            optimization_params.update({
                "min_weight": request.min_weight or 0.01,
                "max_weight": request.max_weight or 1.0
            })
        elif method in ["minimum_variance", "maximum_sharpe"]:
            optimization_params.update({
                "min_weight": request.min_weight or 0.0,
                "max_weight": request.max_weight or 1.0
            })

        # Perform optimization
        result = portfolio_optimizer.optimize_portfolio(
            returns_df,
            method,
            **optimization_params
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Prepare the response
        response = {
            "optimization_method": method,
            "tickers": tickers,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "risk_free_rate": request.risk_free_rate,
            "optimal_weights": result["optimal_weights"],
            "expected_return": result["expected_return"],
            "expected_risk": result["expected_risk"],
            "performance_metrics": {}
        }

        # Add method-specific metrics
        if method == "markowitz" or method == "maximum_sharpe":
            response["performance_metrics"]["sharpe_ratio"] = result.get("sharpe_ratio", 0.0)

        if method == "risk_parity" and "risk_contribution" in result:
            response["performance_metrics"]["risk_contribution"] = result["risk_contribution"]

        # Add efficient frontier if available
        if "efficient_frontier" in result:
            response["efficient_frontier"] = result["efficient_frontier"]

        # If portfolio_id was provided, create a new optimized portfolio
        portfolio_id = getattr(request, 'portfolio_id', None)
        create_optimized_portfolio = getattr(request, 'create_optimized_portfolio', False)

        # If portfolio_id was provided, create a new optimized portfolio
        if portfolio_id and create_optimized_portfolio:
            # Create a new portfolio with the optimized weights
            optimized_portfolio = {
                "name": f"{portfolio['name']} - Optimized ({method.capitalize()})",
                "description": f"Optimized version of {portfolio['name']} using {method} method",
                "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "assets": []
            }

            # Add assets with optimized weights
            for ticker, weight in result["optimal_weights"].items():
                # Find the original asset data if available
                original_asset = next((asset for asset in portfolio.get("assets", []) if asset["ticker"] == ticker),
                                      None)

                if original_asset:
                    # Copy relevant fields from the original asset
                    asset_data = {k: v for k, v in original_asset.items() if k not in ["weight"]}
                    asset_data["weight"] = weight
                else:
                    # Create a basic asset entry
                    asset_data = {
                        "ticker": ticker,
                        "weight": weight
                    }

                optimized_portfolio["assets"].append(asset_data)

            # Save the optimized portfolio
            saved_portfolio = portfolio_manager.save_portfolio(optimized_portfolio)
            response["optimized_portfolio_id"] = saved_portfolio

        return response
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize portfolio: {str(e)}")


@router.post("/efficient-frontier", response_model=EfficientFrontierResponse)
def calculate_efficient_frontier(
        request: EfficientFrontierRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Calculate efficient frontier for a set of assets
    """
    try:
        # Load the portfolio if specified
        portfolio_id = getattr(request, 'portfolio_id', None)
        portfolio = None
        if portfolio_id:
            portfolio = portfolio_manager.load_portfolio(portfolio_id)
            if not portfolio:
                raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")

        # Get the tickers either from request or from portfolio
        tickers = request.tickers
        if not tickers and portfolio:
            tickers = [asset["ticker"] for asset in portfolio.get("assets", [])]

        if not tickers:
            raise HTTPException(status_code=400, detail="No tickers provided for efficient frontier calculation")

        # Set default dates if not provided
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")

        if not request.start_date:
            # Default to 3 years ago for reasonable return estimation
            start_date = datetime.now() - timedelta(days=3 * 365)
            request.start_date = start_date.strftime("%Y-%m-%d")

        # Fetch historical price data
        price_data = data_fetcher.get_batch_data(tickers, request.start_date, request.end_date)

        # Check if price data was retrieved successfully
        valid_tickers = [ticker for ticker, prices in price_data.items() if not prices.empty]

        if not valid_tickers:
            raise HTTPException(status_code=400,
                                detail="Failed to retrieve price data for any of the specified tickers")

        if len(valid_tickers) < len(tickers):
            missing_tickers = set(tickers) - set(valid_tickers)
            detailed_error = f"Failed to retrieve price data for the following tickers: {', '.join(missing_tickers)}"
            raise HTTPException(status_code=400, detail=detailed_error)

        # Calculate returns for each asset
        import pandas as pd
        from backend.app.core.services.analytics import AnalyticsService
        analytics_service = AnalyticsService()

        returns_data = {}
        for ticker, prices in price_data.items():
            if not prices.empty:
                # Use Adjusted Close if available, otherwise use Close
                price_col = 'Adj Close' if 'Adj Close' in prices.columns else 'Close'
                returns_data[ticker] = analytics_service.calculate_returns(prices[[price_col]])

        # Combine into a DataFrame
        returns_df = pd.DataFrame(returns_data)

        # Handle missing values
        returns_df = returns_df.dropna()

        if returns_df.empty:
            raise HTTPException(status_code=400,
                                detail="Not enough overlapping data points for efficient frontier calculation")

        # Calculate efficient frontier
        # We can use the markowitz optimization with different target returns to get the efficient frontier
        efficient_frontier = []

        # Alternative approach: Use the built-in efficient frontier calculation in PortfolioOptimizer
        # Get mean returns and covariance
        expected_returns = returns_df.mean() * 252
        min_return = expected_returns.min()
        max_return = expected_returns.max()

        # Create a range of target returns
        num_points = request.points or 50
        target_returns = [min_return + i * (max_return - min_return) / (num_points - 1) for i in range(num_points)]

        for target_return in target_returns:
            try:
                result = portfolio_optimizer.markowitz_optimization(
                    returns_df,
                    risk_free_rate=request.risk_free_rate,
                    target_return=target_return,
                    min_weight=request.min_weight or 0.0,
                    max_weight=request.max_weight or 1.0
                )

                if "error" not in result:
                    efficient_frontier.append({
                        "return": result["expected_return"],
                        "risk": result["expected_risk"],
                        "sharpe_ratio": result.get("sharpe_ratio", 0.0),
                        "weights": result["optimal_weights"]
                    })
            except Exception:
                # Skip points that cannot be optimized
                continue

        # Calculate the optimal portfolios
        # Global minimum variance portfolio
        min_var_result = portfolio_optimizer.minimum_variance_optimization(
            returns_df,
            min_weight=request.min_weight or 0.0,
            max_weight=request.max_weight or 1.0
        )

        # Maximum Sharpe ratio portfolio
        max_sharpe_result = portfolio_optimizer.maximum_sharpe_optimization(
            returns_df,
            risk_free_rate=request.risk_free_rate,
            min_weight=request.min_weight or 0.0,
            max_weight=request.max_weight or 1.0
        )

        # Get the current portfolio point if portfolio_id is provided
        current_portfolio_point = None
        if portfolio:
            weights = {asset["ticker"]: asset.get("weight", 0) for asset in portfolio.get("assets", [])}

            # Calculate current portfolio return and risk
            portfolio_return = expected_returns.dot(pd.Series(weights))
            cov_matrix = returns_df.cov() * 252
            portfolio_risk = np.sqrt(pd.Series(weights).dot(cov_matrix).dot(pd.Series(weights)))

            sharpe_ratio = (portfolio_return - request.risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

            current_portfolio_point = {
                "return": float(portfolio_return),
                "risk": float(portfolio_risk),
                "sharpe_ratio": float(sharpe_ratio),
                "weights": weights
            }

        # Prepare the response
        response = {
            "tickers": valid_tickers,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "risk_free_rate": request.risk_free_rate,
            "efficient_frontier": efficient_frontier,
            "min_variance_portfolio": {
                "return": min_var_result["expected_return"],
                "risk": min_var_result["expected_risk"],
                "weights": min_var_result["optimal_weights"]
            },
            "max_sharpe_portfolio": {
                "return": max_sharpe_result["expected_return"],
                "risk": max_sharpe_result["expected_risk"],
                "sharpe_ratio": max_sharpe_result.get("sharpe_ratio", 0.0),
                "weights": max_sharpe_result["optimal_weights"]
            }
        }

        if current_portfolio_point:
            response["current_portfolio"] = current_portfolio_point

        return response
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {request.portfolio_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate efficient frontier: {str(e)}")


@router.post("/markowitz", response_model=OptimizationResponse)
def markowitz_optimization(
        request: OptimizationRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Optimize portfolio using Markowitz mean-variance optimization
    """
    # Forward to the generic optimizer with method="markowitz"
    return optimize_portfolio(
        request,
        method="markowitz",
        portfolio_optimizer=portfolio_optimizer,
        portfolio_manager=portfolio_manager,
        data_fetcher=data_fetcher
    )


@router.post("/risk-parity", response_model=OptimizationResponse)
def risk_parity_optimization(
        request: OptimizationRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Optimize portfolio using Risk Parity (equal risk contribution)
    """
    # Forward to the generic optimizer with method="risk_parity"
    return optimize_portfolio(
        request,
        method="risk_parity",
        portfolio_optimizer=portfolio_optimizer,
        portfolio_manager=portfolio_manager,
        data_fetcher=data_fetcher
    )


@router.post("/minimum-variance", response_model=OptimizationResponse)
def minimum_variance_optimization(
        request: OptimizationRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Optimize portfolio for minimum variance
    """
    # Forward to the generic optimizer with method="minimum_variance"
    return optimize_portfolio(
        request,
        method="minimum_variance",
        portfolio_optimizer=portfolio_optimizer,
        portfolio_manager=portfolio_manager,
        data_fetcher=data_fetcher
    )


@router.post("/maximum-sharpe", response_model=OptimizationResponse)
def maximum_sharpe_optimization(
        request: OptimizationRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Optimize portfolio for maximum Sharpe ratio
    """
    # Forward to the generic optimizer with method="maximum_sharpe"
    return optimize_portfolio(
        request,
        method="maximum_sharpe",
        portfolio_optimizer=portfolio_optimizer,
        portfolio_manager=portfolio_manager,
        data_fetcher=data_fetcher
    )


@router.post("/equal-weight", response_model=OptimizationResponse)
def equal_weight_optimization(
        request: OptimizationRequest,
        portfolio_optimizer: OptimizationService = Depends(get_portfolio_optimizer),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager),
        data_fetcher: DataFetcherService = Depends(get_data_fetcher)
):
    """
    Create an equal-weighted portfolio
    """
    # Forward to the generic optimizer with method="equal_weight"
    return optimize_portfolio(
        request,
        method="equal_weight",
        portfolio_optimizer=portfolio_optimizer,
        portfolio_manager=portfolio_manager,
        data_fetcher=data_fetcher
    )