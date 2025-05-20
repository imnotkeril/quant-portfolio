from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union

class ScenarioListResponse(BaseModel):
    """Schema for listing available scenarios."""
    scenarios: List[str] = Field(..., description="List of available scenario names")

class ScenarioSimulationRequest(BaseModel):
    """Schema for scenario chain simulation request."""
    starting_scenario: str = Field(..., description="Initial scenario to start simulation from")
    num_simulations: int = Field(1000, description="Number of Monte Carlo simulations to run")

class ScenarioResult(BaseModel):
    """Schema for a single scenario simulation result."""
    chain: List[str] = Field(..., description="Chain of scenarios that occurred")
    timeline: List[int] = Field(..., description="Timeline of events in days")
    total_impact: Dict[str, float] = Field(..., description="Cumulative impact on various factors")

class ScenarioSimulationResponse(BaseModel):
    """Schema for scenario chain simulation response."""
    simulation_results: List[ScenarioResult] = Field(..., description="Results of the Monte Carlo simulations")
    starting_scenario: str = Field(..., description="Initial scenario used")
    num_simulations: int = Field(..., description="Number of simulations run")
    impact_statistics: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Statistical summary of impacts")
    most_common_chains: Optional[List[Dict[str, Any]]] = Field(None, description="Most frequently observed chains")
    chain_visualization_data: Optional[Dict[str, Any]] = Field(None, description="Data for visualizing chains")

class ScenarioImpactRequest(BaseModel):
    """Schema for scenario impact analysis request."""
    portfolio: Dict[str, Any] = Field(..., description="Portfolio data")
    scenarios: List[str] = Field(..., description="List of scenarios to analyze")
    data_fetcher: Any = Field(..., description="Data fetcher instance")

    class Config:
        arbitrary_types_allowed = True

class ScenarioImpact(BaseModel):
    """Schema for impact of a scenario on a portfolio."""
    scenario_name: str = Field(..., description="Name of the scenario")
    portfolio_impact: float = Field(..., description="Overall impact on portfolio (%)")
    asset_impacts: Dict[str, float] = Field(..., description="Impact on individual assets (%)")
    sector_impacts: Optional[Dict[str, float]] = Field(None, description="Impact by sector (%)")
    risk_changes: Optional[Dict[str, float]] = Field(None, description="Changes in risk metrics")
    recovery_estimate: Optional[Dict[str, Any]] = Field(None, description="Recovery time estimates")

class ScenarioImpactResponse(BaseModel):
    """Schema for scenario impact analysis response."""
    scenario_impacts: Dict[str, ScenarioImpact] = Field(..., description="Impact analysis for each scenario")
    portfolio_id: str = Field(..., description="Portfolio ID")
    analyzed_scenarios: List[str] = Field(..., description="Scenarios that were analyzed")
    portfolio_vulnerabilities: Optional[List[str]] = Field(None, description="Identified portfolio vulnerabilities")
    recommended_actions: Optional[List[str]] = Field(None, description="Recommended actions to improve resilience")

class ScenarioEvent(BaseModel):
    """Schema for a subsequent event in a scenario chain."""
    scenario: str = Field(..., description="Next scenario that may occur")
    probability: float = Field(..., description="Probability of this scenario occurring")
    delay: int = Field(..., description="Delay in days before this scenario occurs")
    magnitude_modifier: float = Field(1.0, description="Modifier for the impact magnitude")

    @validator('probability')
    def probability_must_be_valid(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Probability must be between 0 and 1')
        return v

    @validator('magnitude_modifier')
    def modifier_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Magnitude modifier must be positive')
        return v

class ScenarioChainRequest(BaseModel):
    """Schema for creating a new scenario chain."""
    name: str = Field(..., description="Name of the scenario chain")
    description: Optional[str] = Field(None, description="Description of the scenario")
    initial_impact: Dict[str, float] = Field(..., description="Initial impact on various factors")
    leads_to: List[ScenarioEvent] = Field([], description="Subsequent events that may occur")

class ScenarioModificationRequest(BaseModel):
    """Schema for modifying an existing scenario chain."""
    name: str = Field(..., description="Name of the scenario chain to modify")
    initial_impact: Optional[Dict[str, float]] = Field(None, description="New initial impact values")
    leads_to: Optional[List[ScenarioEvent]] = Field(None, description="New subsequent events")

class ScenarioChain(BaseModel):
    """Schema for a scenario chain definition."""
    name: str = Field(..., description="Name of the scenario")
    description: Optional[str] = Field(None, description="Description of the scenario")
    initial_impact: Dict[str, float] = Field(..., description="Initial impact on various factors")
    leads_to: List[ScenarioEvent] = Field([], description="Subsequent events that may occur")

class ScenarioChainResponse(BaseModel):
    """Schema for scenario chain response."""
    scenario_chain: ScenarioChain = Field(..., description="Scenario chain definition")
    name: str = Field(..., description="Name of the scenario chain")