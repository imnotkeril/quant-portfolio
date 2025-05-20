from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import numpy as np

class OptimizationRequest(BaseModel):
    """Base schema for optimization requests."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for assets")
    risk_free_rate: Optional[float] = Field(0.0, description="Risk-free rate (annual, e.g., 0.02 for 2%)")
    min_weight: Optional[float] = Field(0.0, description="Minimum weight constraint")
    max_weight: Optional[float] = Field(1.0, description="Maximum weight constraint")
    constraints: Optional[Dict[str, Any]] = Field(None, description="Additional optimization constraints")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class EfficientFrontierRequest(OptimizationRequest):
    """Schema for efficient frontier calculation request."""
    points: Optional[int] = Field(50, description="Number of points on the efficient frontier")
    risk_range: Optional[List[float]] = Field(None, description="Risk range for efficient frontier points")
    return_range: Optional[List[float]] = Field(None, description="Return range for efficient frontier points")

class MarkowitzRequest(OptimizationRequest):
    """Schema for Markowitz optimization request."""
    target_return: Optional[float] = Field(None, description="Target return constraint")
    target_risk: Optional[float] = Field(None, description="Target risk/volatility constraint")

class RiskParityRequest(OptimizationRequest):
    """Schema for Risk Parity optimization request."""
    risk_budget: Optional[Dict[str, float]] = Field(None, description="Risk allocation for each asset")

class MinimumVarianceRequest(OptimizationRequest):
    """Schema for Minimum Variance optimization request."""
    pass

class MaximumSharpeRequest(OptimizationRequest):
    """Schema for Maximum Sharpe optimization request."""
    pass

class EqualWeightRequest(OptimizationRequest):
    """Schema for Equal Weight optimization request."""
    pass

class OptimizationResult(BaseModel):
    """Schema for optimization result."""
    weights: Dict[str, float] = Field(..., description="Optimal asset weights")
    expected_return: float = Field(..., description="Expected portfolio return")
    expected_risk: float = Field(..., description="Expected portfolio risk/volatility")
    sharpe_ratio: Optional[float] = Field(None, description="Portfolio Sharpe ratio")
    additional_metrics: Optional[Dict[str, Any]] = Field(None, description="Additional optimization metrics")

class OptimizationResponse(BaseModel):
    """Schema for optimization response."""
    method: str = Field(..., description="Optimization method used")
    optimal_weights: Dict[str, float] = Field(..., description="Optimal asset weights")
    expected_return: float = Field(..., description="Expected portfolio return")
    expected_risk: float = Field(..., description="Expected portfolio risk/volatility")
    sharpe_ratio: Optional[float] = Field(None, description="Portfolio Sharpe ratio")
    risk_contribution: Optional[Dict[str, float]] = Field(None, description="Risk contribution by asset")
    efficient_frontier: Optional[List[Dict[str, float]]] = Field(None, description="Efficient frontier points")
    constraints_applied: Optional[Dict[str, Any]] = Field(None, description="Constraints that were applied")
    additional_metrics: Optional[Dict[str, Any]] = Field(None, description="Additional optimization metrics")

class EfficientFrontierPoint(BaseModel):
    """Schema for a single point on the efficient frontier."""
    risk: float = Field(..., description="Portfolio risk/volatility")
    return_: float = Field(..., alias="return", description="Portfolio return")
    sharpe: Optional[float] = Field(None, description="Sharpe ratio")
    weights: Optional[Dict[str, float]] = Field(None, description="Asset weights for this point")

class EfficientFrontierResponse(BaseModel):
    """Schema for efficient frontier response."""
    efficient_frontier: List[EfficientFrontierPoint] = Field(..., description="Points on the efficient frontier")
    min_risk_portfolio: OptimizationResult = Field(..., description="Minimum risk portfolio")
    max_sharpe_portfolio: OptimizationResult = Field(..., description="Maximum Sharpe ratio portfolio")
    max_return_portfolio: OptimizationResult = Field(..., description="Maximum return portfolio")
    equal_weight_portfolio: Optional[OptimizationResult] = Field(None, description="Equal weight portfolio")
    current_portfolio: Optional[OptimizationResult] = Field(None, description="Current portfolio")
    risk_free_rate: float = Field(..., description="Risk-free rate used")

class AdvancedOptimizationRequest(OptimizationRequest):
    """Base schema for advanced optimization requests."""
    pass

class RobustOptimizationRequest(AdvancedOptimizationRequest):
    """Schema for robust optimization request."""
    uncertainty_level: float = Field(0.05, description="Uncertainty level for parameters")

class CostAwareOptimizationRequest(AdvancedOptimizationRequest):
    """Schema for optimization with transaction costs."""
    current_weights: Dict[str, float] = Field(..., description="Current portfolio weights")
    transaction_costs: Dict[str, float] = Field(..., description="Transaction costs for each asset")

class ConditionalOptimizationRequest(AdvancedOptimizationRequest):
    """Schema for conditional optimization with multiple scenarios."""
    scenarios: Dict[str, Any] = Field(..., description="Scenario returns data")
    scenario_probabilities: Dict[str, float] = Field(..., description="Probability for each scenario")

class ESGOptimizationRequest(AdvancedOptimizationRequest):
    """Schema for ESG optimization."""
    esg_scores: Dict[str, float] = Field(..., description="ESG scores for each asset")
    esg_target: Optional[float] = Field(None, description="Target ESG score for the portfolio")

class HierarchicalOptimizationRequest(AdvancedOptimizationRequest):
    """Schema for hierarchical optimization."""
    asset_groups: Dict[str, List[str]] = Field(..., description="Asset groupings")
    group_weights: Optional[Dict[str, float]] = Field(None, description="Target weights for groups")