from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import numpy as np

class VaRRequest(BaseModel):
    """Schema for Value at Risk (VaR) calculation request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for the portfolio")
    confidence_level: float = Field(0.95, description="Confidence level (e.g., 0.95 for 95%)")
    time_horizon: int = Field(1, description="Time horizon in days")
    simulations: Optional[int] = Field(10000, description="Number of simulations for Monte Carlo VaR")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class VaRResponse(BaseModel):
    """Schema for Value at Risk (VaR) calculation response."""
    var: float = Field(..., description="Value at Risk")
    method: str = Field(..., description="Method used (parametric, historical, monte_carlo, cvar)")
    confidence_level: float = Field(..., description="Confidence level used")
    time_horizon: Optional[int] = Field(1, description="Time horizon in days")
    simulations: Optional[int] = Field(None, description="Number of simulations used (for Monte Carlo)")

class StressTestRequest(BaseModel):
    """Schema for stress testing request."""
    returns: Optional[Union[Dict[str, List[float]], Any]] = Field(None, description="Returns data for the portfolio")
    scenario: str = Field(..., description="Stress scenario name")
    portfolio_value: float = Field(10000, description="Current portfolio value")
    data_fetcher: Optional[Any] = Field(None, description="Data fetcher instance")
    current_portfolio_tickers: Optional[List[str]] = Field(None, description="List of tickers in the portfolio")
    weights: Optional[Dict[str, float]] = Field(None, description="Portfolio weights")
    portfolio_data: Optional[Dict[str, Any]] = Field(None, description="Complete portfolio data")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class CustomStressTestRequest(BaseModel):
    """Schema for custom stress testing request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for the portfolio")
    weights: Dict[str, float] = Field(..., description="Portfolio weights")
    shocks: Dict[str, float] = Field(..., description="Shock percentages for each asset")
    portfolio_value: float = Field(10000, description="Current portfolio value")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class AdvancedStressTestRequest(BaseModel):
    """Schema for advanced stress testing request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for the portfolio")
    weights: Dict[str, float] = Field(..., description="Portfolio weights")
    custom_shocks: Dict[str, Any] = Field(..., description="Custom shocks specification")
    asset_sectors: Optional[Dict[str, str]] = Field(None, description="Sector assignments for assets")
    portfolio_value: float = Field(10000, description="Current portfolio value")
    correlation_adjusted: bool = Field(True, description="Whether to adjust for correlations")
    use_beta: bool = Field(True, description="Whether to use beta for market shock estimation")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class StressTestResponse(BaseModel):
    """Schema for stress test response."""
    scenario: Optional[str] = Field(None, description="Stress scenario name")
    scenario_name: Optional[str] = Field(None, description="Descriptive name of the scenario")
    scenario_description: Optional[str] = Field(None, description="Description of the scenario")
    period: Optional[str] = Field(None, description="Historical period of the scenario")
    shock_percentage: float = Field(..., description="Overall portfolio shock percentage")
    portfolio_value: float = Field(..., description="Initial portfolio value")
    portfolio_loss: float = Field(..., description="Portfolio loss in absolute terms")
    portfolio_after_shock: float = Field(..., description="Portfolio value after shock")
    recovery_days: Optional[float] = Field(None, description="Estimated recovery time in days")
    recovery_months: Optional[float] = Field(None, description="Estimated recovery time in months")
    position_impacts: Optional[Dict[str, Any]] = Field(None, description="Impact on individual positions")
    index_price_change: Optional[float] = Field(None, description="Market index price change during scenario")
    std_deviations: Optional[float] = Field(None, description="Number of standard deviations of the shock")
    shock_duration_days: Optional[int] = Field(None, description="Duration of the shock in days")
    error_msg: Optional[str] = Field(None, description="Error message if any")

class MonteCarloRequest(BaseModel):
    """Schema for Monte Carlo simulation request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for the portfolio")
    initial_value: float = Field(10000, description="Initial portfolio value")
    years: int = Field(10, description="Number of years to simulate")
    simulations: int = Field(1000, description="Number of Monte Carlo simulations")
    annual_contribution: float = Field(0, description="Annual contribution to the portfolio")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class MonteCarloResponse(BaseModel):
    """Schema for Monte Carlo simulation response."""
    initial_value: float = Field(..., description="Initial portfolio value")
    years: int = Field(..., description="Number of years simulated")
    simulations: int = Field(..., description="Number of simulations run")
    annual_contribution: float = Field(..., description="Annual contribution used")
    annual_mean_return: float = Field(..., description="Annual mean return used")
    annual_volatility: float = Field(..., description="Annual volatility used")
    percentiles: Dict[str, float] = Field(..., description="Percentiles of final values")
    probabilities: Dict[str, float] = Field(..., description="Probabilities of reaching targets")
    simulation_summary: Dict[str, Any] = Field(..., description="Summary statistics of simulations")
    simulation_data_sample: Optional[List[List[float]]] = Field(None, description="Sample of simulation paths")

class DrawdownRequest(BaseModel):
    """Schema for drawdown analysis request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for the portfolio")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class DrawdownPeriod(BaseModel):
    """Schema for a single drawdown period."""
    start_date: str = Field(..., description="Start date of drawdown")
    valley_date: str = Field(..., description="Date of maximum drawdown (valley)")
    recovery_date: Optional[str] = Field(None, description="Recovery date (or None if not recovered)")
    depth: float = Field(..., description="Maximum drawdown depth")
    length: int = Field(..., description="Length of drawdown period in days")
    recovery: Optional[int] = Field(None, description="Recovery time in days")

class DrawdownResponse(BaseModel):
    """Schema for drawdown analysis response."""
    drawdown_periods: List[DrawdownPeriod] = Field(..., description="List of drawdown periods")
    underwater_series: Dict[str, float] = Field(..., description="Time series of underwater values")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown value")
    avg_drawdown: Optional[float] = Field(None, description="Average drawdown")
    avg_recovery_time: Optional[float] = Field(None, description="Average recovery time in days")
    pain_index: Optional[float] = Field(None, description="Pain index (average absolute drawdown)")
    pain_ratio: Optional[float] = Field(None, description="Pain ratio (return/pain index)")
    ulcer_index: Optional[float] = Field(None, description="Ulcer index")

class RiskContributionRequest(BaseModel):
    """Schema for risk contribution calculation request."""
    returns: Union[Dict[str, List[float]], Any] = Field(..., description="Returns data for portfolio assets")
    weights: Dict[str, float] = Field(..., description="Portfolio weights")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            pd.DataFrame: lambda df: df.to_dict(orient="records"),
            pd.Series: lambda s: s.to_dict(),
            np.ndarray: lambda arr: arr.tolist(),
        }

class RiskContributionResponse(BaseModel):
    """Schema for risk contribution calculation response."""
    risk_contributions: Dict[str, float] = Field(..., description="Risk contribution of each asset")
    marginal_contributions: Optional[Dict[str, float]] = Field(None, description="Marginal contribution to risk")
    percentage_contributions: Optional[Dict[str, float]] = Field(None, description="Percentage contribution to risk")
    diversification_ratio: Optional[float] = Field(None, description="Diversification ratio")
    portfolio_volatility: Optional[float] = Field(None, description="Portfolio volatility")