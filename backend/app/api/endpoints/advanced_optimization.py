from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any

from app.core.services.advanced_optimization import AdvancedOptimizationService
from app.schemas.optimization import (
    AdvancedOptimizationRequest,
    OptimizationResponse,
    RobustOptimizationRequest,
    CostAwareOptimizationRequest,
    ConditionalOptimizationRequest,
    ESGOptimizationRequest,
    HierarchicalOptimizationRequest
)

router = APIRouter(prefix="/advanced-optimization", tags=["advanced-optimization"])


# Dependency to get the optimization service
def get_optimization_service():
    return AdvancedOptimizationService()


@router.post("/robust", response_model=OptimizationResponse)
def robust_optimization(
        request: RobustOptimizationRequest,
        optimization_service: AdvancedOptimizationService = Depends(get_optimization_service)
):
    """
    Perform robust optimization that accounts for uncertainty in parameter estimates.

    This endpoint optimizes a portfolio using techniques that are robust to estimation
    errors in expected returns and covariances.
    """
    try:
        result = optimization_service.robust_optimization(
            returns=request.returns,
            risk_free_rate=request.risk_free_rate,
            uncertainty_level=request.uncertainty_level,
            min_weight=request.min_weight,
            max_weight=request.max_weight,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Robust optimization failed: {str(e)}")


@router.post("/cost-aware", response_model=OptimizationResponse)
def cost_aware_optimization(
        request: CostAwareOptimizationRequest,
        optimization_service: AdvancedOptimizationService = Depends(get_optimization_service)
):
    """
    Perform optimization accounting for transaction costs.

    This endpoint optimizes a portfolio considering the costs of
    transitioning from the current to the optimal portfolio.
    """
    try:
        result = optimization_service.cost_aware_optimization(
            returns=request.returns,
            current_weights=request.current_weights,
            transaction_costs=request.transaction_costs,
            risk_free_rate=request.risk_free_rate,
            min_weight=request.min_weight,
            max_weight=request.max_weight,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cost-aware optimization failed: {str(e)}")


@router.post("/conditional", response_model=OptimizationResponse)
def conditional_optimization(
        request: ConditionalOptimizationRequest,
        optimization_service: AdvancedOptimizationService = Depends(get_optimization_service)
):
    """
    Perform conditional optimization for different scenarios.

    This endpoint optimizes a portfolio considering multiple potential market scenarios
    and their probabilities.
    """
    try:
        result = optimization_service.conditional_optimization(
            returns=request.returns,
            scenarios=request.scenarios,
            scenario_probabilities=request.scenario_probabilities,
            risk_free_rate=request.risk_free_rate,
            min_weight=request.min_weight,
            max_weight=request.max_weight,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conditional optimization failed: {str(e)}")


@router.post("/esg", response_model=OptimizationResponse)
def esg_optimization(
        request: ESGOptimizationRequest,
        optimization_service: AdvancedOptimizationService = Depends(get_optimization_service)
):
    """
    Perform optimization with ESG (Environmental, Social, Governance) criteria.

    This endpoint optimizes a portfolio while accounting for ESG scores of assets.
    """
    try:
        result = optimization_service.esg_optimization(
            returns=request.returns,
            esg_scores=request.esg_scores,
            esg_target=request.esg_target,
            risk_free_rate=request.risk_free_rate,
            min_weight=request.min_weight,
            max_weight=request.max_weight,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ESG optimization failed: {str(e)}")


@router.post("/hierarchical", response_model=OptimizationResponse)
def hierarchical_optimization(
        request: HierarchicalOptimizationRequest,
        optimization_service: AdvancedOptimizationService = Depends(get_optimization_service)
):
    """
    Perform hierarchical optimization based on asset groups.

    This endpoint optimizes a portfolio using a two-step process, first allocating to
    asset classes/groups and then to individual assets within those groups.
    """
    try:
        result = optimization_service.hierarchical_optimization(
            returns=request.returns,
            asset_groups=request.asset_groups,
            group_weights=request.group_weights,
            risk_free_rate=request.risk_free_rate,
            min_weight=request.min_weight,
            max_weight=request.max_weight,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hierarchical optimization failed: {str(e)}")