from typing import Dict, Any, Optional
from datetime import datetime


class Metric:
    """Base class for metrics."""

    def __init__(self, name: str, value: float, description: str = ""):
        """Initialize a metric.

        Args:
            name: Metric name
            value: Metric value
            description: Metric description
        """
        self.name = name
        self.value = value
        self.description = description
        self.created_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the metric to a dictionary.

        Returns:
            Dictionary representation of the metric
        """
        return {
            "name": self.name,
            "value": self.value,
            "description": self.description,
            "created_at": self.created_at.isoformat()
        }


class PerformanceMetric(Metric):
    """Performance metric."""

    def __init__(
            self,
            name: str,
            value: float,
            period: str = "all",
            annualized: bool = False,
            benchmark_value: Optional[float] = None,
            description: str = ""
    ):
        """Initialize a performance metric.

        Args:
            name: Metric name
            value: Metric value
            period: Time period for the metric
            annualized: Whether the metric is annualized
            benchmark_value: Corresponding benchmark value if available
            description: Metric description
        """
        super().__init__(name, value, description)
        self.period = period
        self.annualized = annualized
        self.benchmark_value = benchmark_value

    def to_dict(self) -> Dict[str, Any]:
        """Convert the performance metric to a dictionary.

        Returns:
            Dictionary representation of the performance metric
        """
        result = super().to_dict()
        result.update({
            "period": self.period,
            "annualized": self.annualized
        })

        if self.benchmark_value is not None:
            result["benchmark_value"] = self.benchmark_value

        return result


class RiskMetric(Metric):
    """Risk metric."""

    def __init__(
            self,
            name: str,
            value: float,
            confidence_level: Optional[float] = None,
            period: str = "all",
            description: str = ""
    ):
        """Initialize a risk metric.

        Args:
            name: Metric name
            value: Metric value
            confidence_level: Confidence level for metrics like VaR and CVaR
            period: Time period for the metric
            description: Metric description
        """
        super().__init__(name, value, description)
        self.confidence_level = confidence_level
        self.period = period

    def to_dict(self) -> Dict[str, Any]:
        """Convert the risk metric to a dictionary.

        Returns:
            Dictionary representation of the risk metric
        """
        result = super().to_dict()
        result.update({
            "period": self.period
        })

        if self.confidence_level is not None:
            result["confidence_level"] = self.confidence_level

        return result


class RatioMetric(Metric):
    """Ratio metric (coefficient)."""

    def __init__(
            self,
            name: str,
            value: float,
            numerator: Optional[float] = None,
            denominator: Optional[float] = None,
            description: str = ""
    ):
        """Initialize a ratio metric.

        Args:
            name: Metric name
            value: Metric value
            numerator: Numerator value if available
            denominator: Denominator value if available
            description: Metric description
        """
        super().__init__(name, value, description)
        self.numerator = numerator
        self.denominator = denominator

    def to_dict(self) -> Dict[str, Any]:
        """Convert the ratio metric to a dictionary.

        Returns:
            Dictionary representation of the ratio metric
        """
        result = super().to_dict()

        if self.numerator is not None:
            result["numerator"] = self.numerator

        if self.denominator is not None:
            result["denominator"] = self.denominator

        return result