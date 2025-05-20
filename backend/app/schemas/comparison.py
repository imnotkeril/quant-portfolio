from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import numpy as np

class PortfolioComparisonRequest(BaseModel):
    """Schema for comprehensive portfolio comparison request."""
    portfolio1: Dict[str, Any] = Field(..., description="First portfolio data")
    portfolio2: Dict[str, Any] = Field(..., description="Second portfolio data")
    start_date: Optional[str] = Field(None, description="Start date for comparison (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date for comparison (YYYY-MM-DD)")
    benchmark: Optional[str] = Field(None, description="Benchmark ticker for comparison")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class CompositionComparisonRequest(BaseModel):
    """Schema for comparing portfolio compositions."""
    portfolio1: Dict[str, Any] = Field(..., description="First portfolio data")
    portfolio2: Dict[str, Any] = Field(..., description="Second portfolio data")

class PerformanceComparisonRequest(BaseModel):
    """Schema for comparing portfolio performance."""
    returns1: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for first portfolio")
    returns2: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for second portfolio")
    benchmark_returns: Optional[Union[Dict[str, List[float]], Any]] = Field(None, description="Benchmark returns data")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class RiskComparisonRequest(BaseModel):
    """Schema for comparing portfolio risk metrics."""
    returns1: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for first portfolio")
    returns2: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for second portfolio")
    benchmark_returns: Optional[Union[Dict[str, List[float]], Any]] = Field(None, description="Benchmark returns data")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class SectorComparisonRequest(BaseModel):
    """Schema for comparing sector allocations."""
    portfolio1: Dict[str, Any] = Field(..., description="First portfolio data")
    portfolio2: Dict[str, Any] = Field(..., description="Second portfolio data")

class ScenarioComparisonRequest(BaseModel):
    """Schema for comparing portfolio performance under historical scenarios."""
    portfolio1: Dict[str, Any] = Field(..., description="First portfolio data")
    portfolio2: Dict[str, Any] = Field(..., description="Second portfolio data")
    scenarios: List[str] = Field(..., description="List of historical scenarios to compare")

class DifferentialReturnsRequest(BaseModel):
    """Schema for calculating differential returns between two portfolios."""
    returns1: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for first portfolio")
    returns2: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for second portfolio")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class CompositionDifference(BaseModel):
    """Schema for asset composition differences between portfolios."""
    common_assets: List[str] = Field(..., description="Assets in both portfolios")
    only_in_first: List[str] = Field(..., description="Assets only in first portfolio")
    only_in_second: List[str] = Field(..., description="Assets only in second portfolio")
    weight_differences: Dict[str, float] = Field(..., description="Weight differences for common assets")
    sector_differences: Dict[str, float] = Field(..., description="Sector allocation differences")
    asset_class_differences: Dict[str, float] = Field(..., description="Asset class allocation differences")
    concentration_difference: float = Field(..., description="Difference in concentration (Herfindahl index)")

class CompositionComparisonResponse(BaseModel):
    """Schema for portfolio composition comparison response."""
    composition_comparison: CompositionDifference = Field(..., description="Composition comparison results")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")

class PerformanceComparison(BaseModel):
    """Schema for performance comparison between portfolios."""
    return_metrics: Dict[str, Dict[str, float]] = Field(..., description="Return metrics comparison")
    period_returns: Dict[str, Dict[str, float]] = Field(..., description="Period returns comparison")
    cumulative_returns: Optional[Dict[str, List[float]]] = Field(None, description="Cumulative returns comparison")
    rolling_returns: Optional[Dict[str, Dict[str, List[float]]]] = Field(None, description="Rolling returns comparison")
    outperformance_frequency: Optional[float] = Field(None, description="Frequency of first portfolio outperforming second")
    tracking_error: Optional[float] = Field(None, description="Tracking error between portfolios")
    information_ratio: Optional[float] = Field(None, description="Information ratio between portfolios")

class PerformanceComparisonResponse(BaseModel):
    """Schema for portfolio performance comparison response."""
    performance_comparison: PerformanceComparison = Field(..., description="Performance comparison results")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")

class RiskComparison(BaseModel):
    """Schema for risk comparison between portfolios."""
    volatility: Dict[str, float] = Field(..., description="Volatility comparison")
    drawdown_metrics: Dict[str, Dict[str, float]] = Field(..., description="Drawdown metrics comparison")
    var_metrics: Dict[str, Dict[str, float]] = Field(..., description="VaR metrics comparison")
    ratio_metrics: Dict[str, Dict[str, float]] = Field(..., description="Risk-adjusted ratio comparison")
    tail_risk: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Tail risk comparison")
    distribution_metrics: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Return distribution metrics comparison")

class RiskComparisonResponse(BaseModel):
    """Schema for portfolio risk comparison response."""
    risk_comparison: RiskComparison = Field(..., description="Risk comparison results")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")

class SectorComparisonResponse(BaseModel):
    """Schema for sector allocation comparison response."""
    sector_comparison: Dict[str, Dict[str, float]] = Field(..., description="Sector allocation comparison")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")

class ScenarioResult(BaseModel):
    """Schema for a scenario test result for a single portfolio."""
    impact_percentage: float = Field(..., description="Portfolio impact percentage")
    absolute_loss: float = Field(..., description="Absolute loss in portfolio value")
    recovery_time: Optional[float] = Field(None, description="Estimated recovery time in months")
    most_affected_assets: Dict[str, float] = Field(..., description="Most negatively affected assets")
    most_resilient_assets: Dict[str, float] = Field(..., description="Most resilient assets")

class ScenarioComparison(BaseModel):
    """Schema for comparison of portfolio performance under a single scenario."""
    scenario_name: str = Field(..., description="Scenario name")
    portfolio1_result: ScenarioResult = Field(..., description="Result for first portfolio")
    portfolio2_result: ScenarioResult = Field(..., description="Result for second portfolio")
    relative_resilience: float = Field(..., description="Relative resilience score (positive means first portfolio is more resilient)")
    key_differences: List[str] = Field(..., description="Key differences in performance")

class ScenarioComparisonResponse(BaseModel):
    """Schema for scenario comparison response."""
    scenario_comparison: Dict[str, ScenarioComparison] = Field(..., description="Comparison for each scenario")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    scenarios: List[str] = Field(..., description="Scenarios analyzed")
    overall_resilience_comparison: Dict[str, float] = Field(..., description="Overall resilience comparison metrics")

class DifferentialReturnsResponse(BaseModel):
    """Schema for differential returns response."""
    differential_returns: Dict[str, float] = Field(..., description="Time series of differential returns")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    statistics: Dict[str, float] = Field(..., description="Statistical summary of differential returns")
    outperformance_periods: Dict[str, int] = Field(..., description="Count of outperformance periods")

class PortfolioComparisonResponse(BaseModel):
    """Schema for comprehensive portfolio comparison response."""
    composition_comparison: CompositionDifference = Field(..., description="Composition comparison")
    performance_comparison: PerformanceComparison = Field(..., description="Performance comparison")
    risk_comparison: RiskComparison = Field(..., description="Risk comparison")
    sector_comparison: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Sector allocation comparison")
    scenario_comparison: Optional[Dict[str, ScenarioComparison]] = Field(None, description="Scenario comparison")
    differential_returns_statistics: Optional[Dict[str, float]] = Field(None, description="Differential returns statistics")
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    start_date: Optional[str] = Field(None, description="Start date used for comparison")
    end_date: Optional[str] = Field(None, description="End date used for comparison")
    summary: List[str] = Field(..., description="Summary of key findings")
    recommendations: Optional[List[str]] = Field(None, description="Recommendations based on comparison")