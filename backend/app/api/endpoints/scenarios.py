from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.app.core.services.scenario_service import ScenarioService
from backend.app.schemas.scenario import (
    ScenarioListResponse,
    ScenarioSimulationRequest,
    ScenarioSimulationResponse,
    ScenarioImpactRequest,
    ScenarioImpactResponse,
    ScenarioChainRequest,
    ScenarioChainResponse,
    ScenarioModificationRequest
)

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


# Dependency to get the scenario service
def get_scenario_service():
    return ScenarioService()


@router.get("/", response_model=ScenarioListResponse)
def list_scenarios(
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    List all available predefined scenarios.

    This endpoint returns a list of all scenarios that can be used for stress testing and
    scenario analysis.
    """
    try:
        scenarios = scenario_service.get_available_scenarios()
        return {"scenarios": scenarios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list scenarios: {str(e)}")


@router.post("/simulate", response_model=ScenarioSimulationResponse)
def simulate_scenario_chain(
        request: ScenarioSimulationRequest,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Simulate the effects of a chain of scenario events.

    This endpoint runs simulations of how different scenarios might unfold and chain together,
    with their cumulative impact on portfolio performance.
    """
    try:
        results = scenario_service.simulate_scenario_chain(
            starting_scenario=request.starting_scenario,
            num_simulations=request.num_simulations
        )
        return {
            "simulation_results": results,
            "starting_scenario": request.starting_scenario,
            "num_simulations": request.num_simulations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario simulation failed: {str(e)}")


@router.post("/impact", response_model=ScenarioImpactResponse)
def analyze_scenario_impact(
        request: ScenarioImpactRequest,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Analyze the impact of specific scenarios on a portfolio.

    This endpoint calculates how individual scenarios would affect portfolio performance,
    highlighting vulnerabilities and strengths.
    """
    try:
        impact = scenario_service.analyze_scenario_impact(
            portfolio=request.portfolio,
            scenarios=request.scenarios,
            data_fetcher=request.data_fetcher
        )
        return {
            "scenario_impacts": impact,
            "portfolio_id": request.portfolio.get("id", "unknown"),
            "analyzed_scenarios": request.scenarios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario impact analysis failed: {str(e)}")


@router.post("/chain", response_model=ScenarioChainResponse)
def create_scenario_chain(
        request: ScenarioChainRequest,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Create or define a new scenario chain.

    This endpoint allows users to define custom chains of events for simulation and analysis.
    """
    try:
        chain = scenario_service.create_scenario_chain(
            name=request.name,
            initial_impact=request.initial_impact,
            leads_to=request.leads_to,
            description=request.description
        )
        return {"scenario_chain": chain, "name": request.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create scenario chain: {str(e)}")


@router.put("/chain", response_model=ScenarioChainResponse)
def modify_scenario_chain(
        request: ScenarioModificationRequest,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Modify an existing scenario chain.

    This endpoint allows users to update parameters of existing scenario chains.
    """
    try:
        scenario_service.modify_scenario_chain(
            name=request.name,
            initial_impact=request.initial_impact,
            leads_to=request.leads_to
        )

        # Get the updated chain
        updated_chain = scenario_service.get_scenario_chain(request.name)
        return {"scenario_chain": updated_chain, "name": request.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to modify scenario chain: {str(e)}")


@router.get("/chain/{name}", response_model=ScenarioChainResponse)
def get_scenario_chain(
        name: str,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Get details of a specific scenario chain.

    This endpoint provides the complete definition of a scenario chain by name.
    """
    try:
        chain = scenario_service.get_scenario_chain(name)
        if not chain:
            raise HTTPException(status_code=404, detail=f"Scenario chain '{name}' not found")
        return {"scenario_chain": chain, "name": name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scenario chain: {str(e)}")


@router.delete("/chain/{name}", status_code=204)
def delete_scenario_chain(
        name: str,
        scenario_service: ScenarioService = Depends(get_scenario_service)
):
    """
    Delete a scenario chain.

    This endpoint removes a custom scenario chain from the system.
    """
    try:
        success = scenario_service.delete_scenario_chain(name)
        if not success:
            raise HTTPException(status_code=404, detail=f"Scenario chain '{name}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete scenario chain: {str(e)}")