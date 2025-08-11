from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import pandas as pd
import numpy as np


class AnalyticsRequest(BaseModel):
    """Base schema for analytics requests."""
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    benchmark: Optional[str] = Field(None, description="Benchmark ticker symbol")
    risk_free_rate: Optional[float] = Field(0.02, description="Risk-free rate (annual, e.g., 0.02 for 2%)")
    periods_per_year: Optional[int] = Field(252, description="Trading periods per year (252 for daily)")
    confidence_level: Optional[float] = Field(0.95,
                                              description="Confidence level for risk metrics (e.g., 0.95 for 95%)")

    class Config:
        # Позволяет принимать как camelCase, так и snake_case
        allow_population_by_field_name = True
        # Автоматическое преобразование camelCase в snake_case
        alias_generator = lambda field_name: field_name  # Оставляем как есть
        extra = "ignore"  # Игнорировать дополнительные поля

        # Альтернативные имена полей для совместимости с frontend
        fields = {
            'portfolio_id': {'alias': 'portfolioId'},
            'start_date': {'alias': 'startDate'},
            'end_date': {'alias': 'endDate'},
            'risk_free_rate': {'alias': 'riskFreeRate'},
            'periods_per_year': {'alias': 'periodsPerYear'},
            'confidence_level': {'alias': 'confidenceLevel'}
        }

    @validator('portfolio_id')
    def validate_portfolio_id(cls, v):
        if not v or not v.strip():
            raise ValueError('Portfolio ID is required and cannot be empty')
        return v.strip()

    @validator('start_date', 'end_date')
    def validate_dates(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')

    @validator('confidence_level')
    def validate_confidence_level(cls, v):
        if v is not None and (v <= 0 or v >= 1):
            raise ValueError('Confidence level must be between 0 and 1')
        return v


class MetricResponse(BaseModel):
    """Schema for a single metric response."""
    name: str = Field(..., description="Metric name")
    value: float = Field(..., description="Metric value")
    description: Optional[str] = Field(None, description="Metric description")


class PerformanceMetricResponse(MetricResponse):
    """Schema for a performance metric response."""
    period: Optional[str] = Field(None, description="Period (e.g., '1Y', 'MTD', 'all')")
    annualized: Optional[bool] = Field(False, description="Whether the metric is annualized")
    benchmark_value: Optional[float] = Field(None, description="Benchmark value for comparison")


class RiskMetricResponse(MetricResponse):
    """Schema for a risk metric response."""
    confidence_level: Optional[float] = Field(None, description="Confidence level for risk metrics like VaR")
    period: Optional[str] = Field(None, description="Period (e.g., '1Y', 'MTD', 'all')")


class RatioMetricResponse(MetricResponse):
    """Schema for a ratio metric response."""
    numerator: Optional[float] = Field(None, description="Numerator value")
    denominator: Optional[float] = Field(None, description="Denominator value")


class MetricsGroupResponse(BaseModel):
    """Schema for a group of metrics responses."""
    group_name: str = Field(..., description="Metrics group name")
    metrics: List[Union[MetricResponse, PerformanceMetricResponse, RiskMetricResponse, RatioMetricResponse]] = Field(
        ..., description="List of metrics")


class PerformanceMetricsResponse(BaseModel):
    """Schema for performance metrics response."""
    total_return: float = Field(..., description="Total return")
    annualized_return: float = Field(..., description="Annualized return")
    period_returns: Dict[str, float] = Field(..., description="Returns by period (MTD, YTD, 1Y, etc.)")
    risk_metrics: Dict[str, float] = Field(..., description="Risk metrics")
    ratio_metrics: Dict[str, float] = Field(..., description="Ratio metrics")
    benchmark_comparison: Optional[Dict[str, Any]] = Field(None, description="Benchmark comparison")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")
    metrics_groups: Optional[List[MetricsGroupResponse]] = Field(None, description="Metrics by group")


class RiskMetricsResponse(BaseModel):
    """Schema for risk metrics response."""
    volatility: float = Field(..., description="Annualized volatility")
    max_drawdown: float = Field(..., description="Maximum drawdown")
    var_95: float = Field(..., description="Value at Risk (95%)")
    cvar_95: float = Field(..., description="Conditional Value at Risk (95%)")
    var_99: Optional[float] = Field(None, description="Value at Risk (99%)")
    cvar_99: Optional[float] = Field(None, description="Conditional Value at Risk (99%)")
    downside_deviation: Optional[float] = Field(None, description="Downside deviation")
    skewness: Optional[float] = Field(None, description="Return distribution skewness")
    kurtosis: Optional[float] = Field(None, description="Return distribution kurtosis")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")


class ReturnsResponse(BaseModel):
    """Schema for returns response."""
    returns: Dict[str, List[float]] = Field(..., description="Time series of returns")
    dates: List[str] = Field(..., description="Dates corresponding to returns")
    portfolio_id: str = Field(..., description="Portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    period: str = Field(..., description="Return period (daily, weekly, monthly, etc.)")
    method: str = Field(..., description="Return calculation method (simple, log)")


class CumulativeReturnsResponse(BaseModel):
    """Schema for cumulative returns response."""
    cumulative_returns: Dict[str, List[float]] = Field(..., description="Time series of cumulative returns")
    dates: List[str] = Field(..., description="Dates corresponding to cumulative returns")
    portfolio_id: str = Field(..., description="Portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    base: int = Field(100, description="Base value for cumulative returns (e.g., 100)")


class DrawdownsResponse(BaseModel):
    """Schema for drawdowns response."""
    drawdowns: Dict[str, List[float]] = Field(..., description="Time series of drawdowns")
    dates: List[str] = Field(..., description="Dates corresponding to drawdowns")
    portfolio_id: str = Field(..., description="Portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    max_drawdown: float = Field(..., description="Maximum drawdown value")
    max_drawdown_date: str = Field(..., description="Date of maximum drawdown")


class RollingMetricsRequest(AnalyticsRequest):
    """Schema for rolling metrics request."""
    window: int = Field(..., description="Window size in periods")
    metrics: List[str] = Field(..., description="List of metrics to calculate")
    min_periods: Optional[int] = Field(None, description="Minimum number of periods required")


class RollingMetricsResponse(BaseModel):
    """Schema for rolling metrics response."""
    rolling_metrics: Dict[str, Dict[str, List[float]]] = Field(..., description="Time series of rolling metrics")
    dates: List[str] = Field(..., description="Dates corresponding to rolling metrics")
    portfolio_id: str = Field(..., description="Portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    window: int = Field(..., description="Window size in periods")


class EnhancedAnalyticsRequest(AnalyticsRequest):
    """Schema for enhanced analytics requests."""
    confidence_level: Optional[float] = Field(0.95, description="Confidence level for metrics")
    target_return: Optional[float] = Field(None, description="Target return for metrics like Sortino or Omega")


class OmegaRatioResponse(BaseModel):
    """Schema for Omega ratio response."""
    omega_ratio: float = Field(..., description="Omega ratio value")
    threshold: float = Field(..., description="Threshold used for calculation")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")


class TailRiskResponse(BaseModel):
    """Schema for tail risk analysis response."""
    var_95: float = Field(..., description="Value at Risk (95%)")
    cvar_95: float = Field(..., description="Conditional Value at Risk (95%)")
    var_99: float = Field(..., description="Value at Risk (99%)")
    cvar_99: float = Field(..., description="Conditional Value at Risk (99%)")
    extreme_loss_probability: float = Field(..., description="Probability of extreme loss")
    tail_risk_metrics: Dict[str, float] = Field(..., description="Additional tail risk metrics")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")


class SeasonalAnalysisResponse(BaseModel):
    """Schema for seasonal analysis response."""
    monthly_returns: Dict[str, Dict[str, float]] = Field(..., description="Average returns by month")
    weekday_returns: Dict[str, float] = Field(..., description="Average returns by weekday")
    quarterly_returns: Dict[str, float] = Field(..., description="Average returns by quarter")
    monthly_heatmap_data: Dict[str, Any] = Field(..., description="Data for monthly returns heatmap")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")


class ConfidenceIntervalsResponse(BaseModel):
    """Schema for confidence intervals response."""
    mean_return: float = Field(..., description="Mean return")
    lower_bound: float = Field(..., description="Lower bound of the confidence interval")
    upper_bound: float = Field(..., description="Upper bound of the confidence interval")
    confidence_level: float = Field(..., description="Confidence level")
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")


class ComparisonResponse(BaseModel):
    """Schema for portfolio comparison response."""
    portfolio1_id: str = Field(..., description="First portfolio ID")
    portfolio2_id: str = Field(..., description="Second portfolio ID")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")
    performance_metrics: Dict[str, Dict[str, float]] = Field(..., description="Comparison of performance metrics")
    risk_metrics: Dict[str, Dict[str, float]] = Field(..., description="Comparison of risk metrics")
    ratio_metrics: Dict[str, Dict[str, float]] = Field(..., description="Comparison of ratio metrics")
    cumulative_returns: Optional[Dict[str, Dict[str, List[float]]]] = Field(None,
                                                                            description="Comparison of cumulative returns")
    drawdowns: Optional[Dict[str, Dict[str, List[float]]]] = Field(None, description="Comparison of drawdowns")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")

class ComparisonRequest(BaseModel):
    """Schema for portfolio comparison requests."""
    portfolio_id1: str = Field(..., description="First portfolio ID")
    portfolio_id2: str = Field(..., description="Second portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    benchmark: Optional[str] = Field(None, description="Benchmark ticker symbol")
    metrics: Optional[List[str]] = Field(None, description="Specific metrics to compare")


class ComparisonResponse(BaseModel):
    """Schema for portfolio comparison response."""
    portfolio_id1: str = Field(..., description="First portfolio ID")
    portfolio_id2: str = Field(..., description="Second portfolio ID")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date")
    comparison_metrics: Dict[str, Any] = Field(..., description="Comparison results")
    relative_performance: Optional[Dict[str, float]] = Field(None, description="Relative performance metrics")
    correlation: Optional[float] = Field(None, description="Correlation between portfolios")