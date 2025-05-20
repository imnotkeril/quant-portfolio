from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.app.core.services.historical_service import HistoricalService
from backend.app.schemas.historical import (
    HistoricalScenariosResponse,
    HistoricalContextRequest,
    HistoricalContextResponse,
    HistoricalAnalogiesRequest,
    HistoricalAnalogiesResponse,
    HistoricalScenarioRequest,
    HistoricalSimilarityRequest,
    HistoricalSimilarityResponse
)

router = APIRouter(prefix="/historical", tags=["historical"])


# Dependency to get the historical service
def get_historical_service():
    return HistoricalService()


@router.get("/", response_model=HistoricalScenariosResponse)
def list_historical_scenarios(
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    List all available historical scenarios.

    This endpoint returns a list of historical market events that can be used for analysis.
    """
    try:
        scenarios = historical_service.get_historical_scenarios()
        return {"scenarios": scenarios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list historical scenarios: {str(e)}")


@router.post("/context", response_model=HistoricalContextResponse)
def get_historical_context(
        request: HistoricalContextRequest,
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    Get detailed context for a specific historical scenario.

    This endpoint provides comprehensive information about a historical market event,
    including key indicators, market impact, policy responses, and lessons learned.
    """
    try:
        context = historical_service.display_historical_context(request.scenario_key)
        return {"context": context, "scenario_key": request.scenario_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get historical context: {str(e)}")


@router.post("/analogies", response_model=HistoricalAnalogiesResponse)
def find_historical_analogies(
        request: HistoricalAnalogiesRequest,
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    Find historical market periods analogous to current conditions.

    This endpoint analyzes current market data to identify similar historical periods,
    which may provide insights into potential future outcomes.
    """
    try:
        analogies = historical_service.find_historical_analogies(
            current_market_data=request.current_market_data,
            metrics=request.metrics
        )
        return {
            "analogies": analogies,
            "current_regime": request.current_market_data.get("regime", "Unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find historical analogies: {str(e)}")


@router.post("/similarity", response_model=HistoricalSimilarityResponse)
def calculate_similarity_score(
        request: HistoricalSimilarityRequest,
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    Calculate similarity score between current and historical data.

    This endpoint quantifies how similar current market conditions are to specific historical periods.
    """
    try:
        score = historical_service.calculate_similarity_score(
            current_data=request.current_data,
            historical_data=request.historical_data,
            metrics=request.metrics,
            weights=request.weights
        )
        return {
            "similarity_score": score,
            "current_data_id": request.current_data.get("id", "current"),
            "historical_data_id": request.historical_data.get("id", "historical")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate similarity score: {str(e)}")


@router.post("/scenario", status_code=201)
def add_historical_scenario(
        request: HistoricalScenarioRequest,
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    Add a new historical scenario to the database.

    This endpoint allows users to define and save custom historical scenarios for future analysis.
    """
    try:
        historical_service.add_historical_scenario(
            key=request.key,
            name=request.name,
            period=request.period,
            trigger_events=request.trigger_events,
            key_indicators=request.key_indicators,
            market_impact=request.market_impact,
            policy_response=request.policy_response,
            lessons_learned=request.lessons_learned,
            early_warning_signs=request.early_warning_signs,
            most_resilient_assets=request.most_resilient_assets,
            most_affected_assets=request.most_affected_assets
        )
        return {"message": f"Historical scenario '{request.name}' added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add historical scenario: {str(e)}")


@router.delete("/scenario/{key}", status_code=204)
def remove_historical_scenario(
        key: str,
        historical_service: HistoricalService = Depends(get_historical_service)
):
    """
    Remove a historical scenario from the database.

    This endpoint deletes a custom historical scenario from the system.
    """
    try:
        success = historical_service.remove_historical_scenario(key)
        if not success:
            raise HTTPException(status_code=404, detail=f"Historical scenario '{key}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove historical scenario: {str(e)}")