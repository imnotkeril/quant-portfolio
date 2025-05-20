from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.app.core.services.portfolio_comparison import PortfolioComparisonService
from backend.app.schemas.comparison import (
    PortfolioComparisonRequest,
    PortfolioComparisonResponse,
    CompositionComparisonRequest,
    CompositionComparisonResponse,
    PerformanceComparisonRequest,
    PerformanceComparisonResponse,
    RiskComparisonRequest,
    RiskComparisonResponse,
    SectorComparisonRequest,
    SectorComparisonResponse,
    ScenarioComparisonRequest,
    ScenarioComparisonResponse,
    DifferentialReturnsRequest,
    DifferentialReturnsResponse
)

router = APIRouter(prefix="/comparison", tags=["comparison"])


# Dependency to get the comparison service
def get_comparison_service():
    return PortfolioComparisonService()


@router.post("/", response_model=PortfolioComparisonResponse)
def compare_portfolios(
        request: PortfolioComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Comprehensive comparison of two portfolios.

    This endpoint performs a full comparison of two portfolios across multiple dimensions,
    including composition, performance, risk metrics, and sector allocations.
    """
    try:
        result = comparison_service.compare_portfolios(
            portfolio1=request.portfolio1,
            portfolio2=request.portfolio2,
            start_date=request.start_date,
            end_date=request.end_date,
            benchmark=request.benchmark
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio comparison failed: {str(e)}")


@router.post("/composition", response_model=CompositionComparisonResponse)
def compare_compositions(
        request: CompositionComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Compare portfolio compositions.

    This endpoint focuses on comparing the asset allocations between two portfolios,
    highlighting differences in holdings and weights.
    """
    try:
        result = comparison_service.compare_compositions(
            portfolio1=request.portfolio1,
            portfolio2=request.portfolio2
        )
        return {
            "composition_comparison": result,
            "portfolio1_id": request.portfolio1.get("id", "portfolio1"),
            "portfolio2_id": request.portfolio2.get("id", "portfolio2")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Composition comparison failed: {str(e)}")


@router.post("/performance", response_model=PerformanceComparisonResponse)
def compare_performance(
        request: PerformanceComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Compare portfolio performance metrics.

    This endpoint compares the performance of two portfolios over time, including
    returns, cumulative growth, and other key performance indicators.
    """
    try:
        result = comparison_service.compare_performance(
            returns1=request.returns1,
            returns2=request.returns2,
            benchmark_returns=request.benchmark_returns
        )
        return {
            "performance_comparison": result,
            "portfolio1_id": request.portfolio1_id,
            "portfolio2_id": request.portfolio2_id,
            "benchmark_id": request.benchmark_id if request.benchmark_returns is not None else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance comparison failed: {str(e)}")


@router.post("/risk", response_model=RiskComparisonResponse)
def compare_risk_metrics(
        request: RiskComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Compare portfolio risk metrics.

    This endpoint analyzes and compares risk characteristics between two portfolios,
    such as volatility, drawdowns, VaR, and various risk ratios.
    """
    try:
        result = comparison_service.compare_risk_metrics(
            returns1=request.returns1,
            returns2=request.returns2,
            benchmark_returns=request.benchmark_returns
        )
        return {
            "risk_comparison": result,
            "portfolio1_id": request.portfolio1_id,
            "portfolio2_id": request.portfolio2_id,
            "benchmark_id": request.benchmark_id if request.benchmark_returns is not None else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk metrics comparison failed: {str(e)}")


@router.post("/sectors", response_model=SectorComparisonResponse)
def compare_sector_allocations(
        request: SectorComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Compare sector allocations between portfolios.

    This endpoint analyzes the sector breakdown of two portfolios, highlighting
    differences in sector exposures and concentrations.
    """
    try:
        result = comparison_service.compare_sector_allocations(
            portfolio1=request.portfolio1,
            portfolio2=request.portfolio2
        )
        return {
            "sector_comparison": result,
            "portfolio1_id": request.portfolio1.get("id", "portfolio1"),
            "portfolio2_id": request.portfolio2.get("id", "portfolio2")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sector allocation comparison failed: {str(e)}")


@router.post("/differential-returns", response_model=DifferentialReturnsResponse)
def calculate_differential_returns(
        request: DifferentialReturnsRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Calculate differential returns between two portfolios.

    This endpoint computes the difference in returns between two portfolios over time,
    useful for understanding relative performance characteristics.
    """
    try:
        result = comparison_service.calculate_differential_returns(
            returns1=request.returns1,
            returns2=request.returns2
        )
        return {
            "differential_returns": result.to_dict(),
            "portfolio1_id": request.portfolio1_id,
            "portfolio2_id": request.portfolio2_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Differential returns calculation failed: {str(e)}")


@router.post("/scenarios", response_model=ScenarioComparisonResponse)
def compare_historical_scenarios(
        request: ScenarioComparisonRequest,
        comparison_service: PortfolioComparisonService = Depends(get_comparison_service)
):
    """
    Compare portfolio performance under historical scenarios.

    This endpoint analyzes how two portfolios would have performed under various
    historical market scenarios, highlighting differences in resilience.
    """
    try:
        result = comparison_service.compare_historical_scenarios(
            portfolio1=request.portfolio1,
            portfolio2=request.portfolio2,
            scenarios=request.scenarios
        )
        return {
            "scenario_comparison": result,
            "portfolio1_id": request.portfolio1.get("id", "portfolio1"),
            "portfolio2_id": request.portfolio2.get("id", "portfolio2"),
            "scenarios": request.scenarios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Historical scenario comparison failed: {str(e)}")