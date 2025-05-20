from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union


class HistoricalScenariosResponse(BaseModel):
    """Schema for listing available historical scenarios."""
    scenarios: List[str] = Field(..., description="List of available historical scenario keys")


class HistoricalContextRequest(BaseModel):
    """Schema for requesting historical context for a scenario."""
    scenario_key: str = Field(..., description="Key of the historical scenario")


class KeyIndicator(BaseModel):
    """Schema for a key indicator during a historical event."""
    name: str = Field(..., description="Indicator name")
    value: str = Field(..., description="Indicator value during the crisis")
    normal: str = Field(..., description="Normal/typical value for comparison")


class HistoricalContext(BaseModel):
    """Schema for historical context of a market event."""
    name: str = Field(..., description="Name of the historical event")
    period: str = Field(..., description="Time period of the event")
    trigger_events: List[str] = Field(..., description="Events that triggered the crisis")
    key_indicators: List[KeyIndicator] = Field(..., description="Key economic/market indicators during the event")
    market_impact: Dict[str, str] = Field(..., description="Impact on various market segments")
    policy_response: List[str] = Field(..., description="Policy and regulatory responses")
    lessons_learned: List[str] = Field(..., description="Key lessons learned from the event")
    early_warning_signs: List[str] = Field(..., description="Early warning indicators that preceded the event")
    most_resilient_assets: List[str] = Field(..., description="Assets that performed relatively well")
    most_affected_assets: List[str] = Field(..., description="Assets that were most negatively affected")
    current_parallels: Optional[List[str]] = Field(None, description="Potential parallels to current market conditions")


class HistoricalContextResponse(BaseModel):
    """Schema for historical context response."""
    context: HistoricalContext = Field(..., description="Historical context information")
    scenario_key: str = Field(..., description="Key of the requested scenario")


class HistoricalAnalogiesRequest(BaseModel):
    """Schema for finding historical analogies to current conditions."""
    current_market_data: Dict[str, Any] = Field(..., description="Current market data and regime")
    metrics: Optional[List[str]] = Field(None, description="Specific metrics to focus on for comparison")


class HistoricalAnalogy(BaseModel):
    """Schema for a single historical analogy."""
    period: str = Field(..., description="Historical period")
    event: str = Field(..., description="Description of the historical event")
    similarity: float = Field(..., description="Similarity score (0-1)")
    key_similarities: List[str] = Field(..., description="Key similarities to current conditions")
    key_differences: List[str] = Field(..., description="Key differences from current conditions")
    outcome: str = Field(..., description="What happened after this historical period")
    lessons: List[str] = Field(..., description="Lessons that might be applicable")
    recommended_actions: List[str] = Field(..., description="Recommended actions based on this analogy")


class HistoricalAnalogiesResponse(BaseModel):
    """Schema for historical analogies response."""
    analogies: List[HistoricalAnalogy] = Field(..., description="Found historical analogies")
    current_regime: str = Field(..., description="Current market regime used for comparison")
    disclaimer: str = Field("Historical analogies are for educational purposes only and do not predict future returns.",
                            description="Disclaimer about limitations of historical analysis")


class HistoricalSimilarityRequest(BaseModel):
    """Schema for calculating similarity between current and historical data."""
    current_data: Dict[str, Any] = Field(..., description="Current market data")
    historical_data: Dict[str, Any] = Field(..., description="Historical market data for comparison")
    metrics: Optional[List[str]] = Field(None, description="Specific metrics to include in comparison")
    weights: Optional[Dict[str, float]] = Field(None, description="Weights for each metric in the comparison")


class HistoricalSimilarityResponse(BaseModel):
    """Schema for similarity score response."""
    similarity_score: float = Field(..., description="Calculated similarity score (0-1)")
    current_data_id: str = Field(..., description="Identifier for current data")
    historical_data_id: str = Field(..., description="Identifier for historical data")
    metric_scores: Optional[Dict[str, float]] = Field(None, description="Similarity scores for individual metrics")


class HistoricalScenarioRequest(BaseModel):
    """Schema for adding a new historical scenario."""
    key: str = Field(..., description="Unique key for the scenario")
    name: str = Field(..., description="Name of the historical event")
    period: str = Field(..., description="Time period of the event")
    trigger_events: List[str] = Field(..., description="Events that triggered the crisis")
    key_indicators: List[Dict[str, str]] = Field(..., description="Key economic/market indicators during the event")
    market_impact: Dict[str, str] = Field(..., description="Impact on various market segments")
    policy_response: List[str] = Field(..., description="Policy and regulatory responses")
    lessons_learned: List[str] = Field(..., description="Key lessons learned from the event")
    early_warning_signs: List[str] = Field(..., description="Early warning indicators that preceded the event")
    most_resilient_assets: List[str] = Field(..., description="Assets that performed relatively well")
    most_affected_assets: List[str] = Field(..., description="Assets that were most negatively affected")

    @validator('key')
    def key_must_be_valid(cls, v):
        if not v.isalnum() and '_' not in v:
            raise ValueError('Key must contain only alphanumeric characters and underscores')
        return v.lower()