from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any

from app.core.services.risk_management import RiskManagementService
from app.schemas.risk import (
    VaRRequest,
    VaRResponse,
    StressTestRequest,
    StressTestResponse,
    CustomStressTestRequest,
    MonteCarloRequest,
    MonteCarloResponse,
    DrawdownRequest,
    DrawdownResponse,
    RiskContributionRequest,
    RiskContributionResponse,
    AdvancedStressTestRequest
)

router = APIRouter(prefix="/risk", tags=["risk"])


# Dependency to get the risk management service
def get_risk_service():
    return RiskManagementService()


@router.post("/var", response_model=VaRResponse)
def calculate_var(
        request: VaRRequest,
        method: str = Query("historical",
                            description="VaR calculation method: 'parametric', 'historical', or 'monte_carlo'"),
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Calculate Value at Risk (VaR) for a portfolio.

    This endpoint calculates the potential loss in value of a portfolio over a defined
    period for a given confidence level using various methods.
    """
    try:
        if method == "parametric":
            result = risk_service.calculate_var_parametric(
                returns=request.returns,
                confidence_level=request.confidence_level,
                time_horizon=request.time_horizon
            )
        elif method == "historical":
            result = risk_service.calculate_var_historical(
                returns=request.returns,
                confidence_level=request.confidence_level,
                time_horizon=request.time_horizon
            )
        elif method == "monte_carlo":
            result = risk_service.calculate_var_monte_carlo(
                returns=request.returns,
                confidence_level=request.confidence_level,
                time_horizon=request.time_horizon,
                simulations=request.simulations if hasattr(request, 'simulations') else 10000
            )
        else:
            raise HTTPException(status_code=400, detail=f"Invalid VaR method: {method}")

        return {"var": result, "method": method, "confidence_level": request.confidence_level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"VaR calculation failed: {str(e)}")


@router.post("/cvar", response_model=VaRResponse)
def calculate_cvar(
        request: VaRRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Calculate Conditional Value at Risk (CVaR) for a portfolio.

    This endpoint calculates the expected loss given that the loss exceeds the VaR.
    Also known as Expected Shortfall.
    """
    try:
        result = risk_service.calculate_cvar(
            returns=request.returns,
            confidence_level=request.confidence_level
        )
        return {"var": result, "method": "cvar", "confidence_level": request.confidence_level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CVaR calculation failed: {str(e)}")


@router.post("/stress-test", response_model=StressTestResponse)
def perform_stress_test(
        request: StressTestRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Perform stress testing on a portfolio using historical scenarios.

    This endpoint simulates the impact of known historical market events on the portfolio.
    """
    try:
        result = risk_service.perform_stress_test(
            returns=request.returns,
            scenario=request.scenario,
            portfolio_value=request.portfolio_value
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress test failed: {str(e)}")


@router.post("/historical-stress-test", response_model=StressTestResponse)
def perform_historical_stress_test(
        request: StressTestRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Perform stress testing using detailed historical data.

    This endpoint provides more comprehensive stress testing based on historical data.
    """
    try:
        result = risk_service.perform_historical_stress_test(
            data_fetcher=request.data_fetcher,
            current_portfolio_tickers=request.current_portfolio_tickers,
            weights=request.weights,
            scenario_name=request.scenario,
            portfolio_value=request.portfolio_value,
            portfolio_data=request.portfolio_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Historical stress test failed: {str(e)}")


@router.post("/custom-stress-test", response_model=StressTestResponse)
def perform_custom_stress_test(
        request: CustomStressTestRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Perform custom stress testing with user-defined shock parameters.

    This endpoint allows users to define custom market shocks to test portfolio resilience.
    """
    try:
        result = risk_service.perform_custom_stress_test(
            returns=request.returns,
            weights=request.weights,
            shocks=request.shocks,
            portfolio_value=request.portfolio_value
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom stress test failed: {str(e)}")


@router.post("/advanced-stress-test", response_model=StressTestResponse)
def perform_advanced_custom_stress_test(
        request: AdvancedStressTestRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Perform advanced stress testing considering correlations between assets.

    This endpoint offers more sophisticated stress testing that accounts for how assets
    may move together during market stress events.
    """
    try:
        result = risk_service.perform_advanced_custom_stress_test(
            returns=request.returns,
            weights=request.weights,
            custom_shocks=request.custom_shocks,
            asset_sectors=request.asset_sectors,
            portfolio_value=request.portfolio_value,
            correlation_adjusted=request.correlation_adjusted,
            use_beta=request.use_beta
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced stress test failed: {str(e)}")


@router.post("/monte-carlo", response_model=MonteCarloResponse)
def perform_monte_carlo_simulation(
        request: MonteCarloRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Perform Monte Carlo simulation to project portfolio value.

    This endpoint simulates thousands of potential future paths for portfolio returns
    to estimate the range of possible outcomes.
    """
    try:
        result = risk_service.perform_monte_carlo_simulation(
            returns=request.returns,
            initial_value=request.initial_value,
            years=request.years,
            simulations=request.simulations,
            annual_contribution=request.annual_contribution
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monte Carlo simulation failed: {str(e)}")


@router.post("/drawdowns", response_model=DrawdownResponse)
def analyze_drawdowns(
        request: DrawdownRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Analyze drawdown periods in the portfolio history.

    This endpoint identifies and characterizes periods of sustained loss in portfolio value.
    """
    try:
        result = risk_service.analyze_drawdowns(returns=request.returns)
        underwater = risk_service.calculate_underwater_series(returns=request.returns)

        return {
            "drawdown_periods": result.to_dict(orient="records") if not result.empty else [],
            "underwater_series": underwater.to_dict() if not underwater.empty else {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drawdown analysis failed: {str(e)}")


@router.post("/risk-contribution", response_model=RiskContributionResponse)
def calculate_risk_contribution(
        request: RiskContributionRequest,
        risk_service: RiskManagementService = Depends(get_risk_service)
):
    """
    Calculate the risk contribution of each asset to portfolio risk.

    This endpoint helps identify which assets contribute most to overall portfolio risk.
    """
    try:
        result = risk_service.calculate_risk_contribution(
            returns=request.returns,
            weights=request.weights
        )
        return {"risk_contributions": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk contribution calculation failed: {str(e)}")