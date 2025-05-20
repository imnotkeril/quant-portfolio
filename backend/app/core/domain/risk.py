from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum


class RiskType(str, Enum):
    """Risk type enumeration."""
    MARKET = "market"
    CREDIT = "credit"
    LIQUIDITY = "liquidity"
    OPERATIONAL = "operational"
    SYSTEMATIC = "systematic"
    UNSYSTEMATIC = "unsystematic"


class RiskLevel(str, Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class RiskAssessment:
    """Risk assessment for a portfolio or asset."""

    def __init__(
            self,
            id: str,
            portfolio_id: str,
            risk_level: RiskLevel,
            risk_score: float,
            risk_metrics: Dict[str, float],
            risk_breakdown: Dict[str, float],
            risk_types: Dict[RiskType, float],
            description: str = "",
            created_at: datetime = None
    ):
        """Initialize a risk assessment.

        Args:
            id: Risk assessment ID
            portfolio_id: Portfolio ID
            risk_level: Overall risk level
            risk_score: Numerical risk score
            risk_metrics: Dictionary of risk metrics
            risk_breakdown: Breakdown of risk by component
            risk_types: Risk scores by risk type
            description: Description of the risk assessment
            created_at: Creation timestamp
        """
        self.id = id
        self.portfolio_id = portfolio_id
        self.risk_level = risk_level
        self.risk_score = risk_score
        self.risk_metrics = risk_metrics
        self.risk_breakdown = risk_breakdown
        self.risk_types = risk_types
        self.description = description
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the risk assessment to a dictionary.

        Returns:
            Dictionary representation of the risk assessment
        """
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "risk_level": self.risk_level,
            "risk_score": self.risk_score,
            "risk_metrics": self.risk_metrics,
            "risk_breakdown": self.risk_breakdown,
            "risk_types": {k.value: v for k, v in self.risk_types.items()},
            "description": self.description,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RiskAssessment':
        """Create a risk assessment from a dictionary.

        Args:
            data: Dictionary containing risk assessment data

        Returns:
            RiskAssessment instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        risk_types = {RiskType(k): v for k, v in data.get("risk_types", {}).items()}

        return cls(
            id=data["id"],
            portfolio_id=data["portfolio_id"],
            risk_level=RiskLevel(data["risk_level"]),
            risk_score=data["risk_score"],
            risk_metrics=data.get("risk_metrics", {}),
            risk_breakdown=data.get("risk_breakdown", {}),
            risk_types=risk_types,
            description=data.get("description", ""),
            created_at=created_at
        )


class StressTestScenario:
    """Stress test scenario for risk analysis."""

    def __init__(
            self,
            id: str,
            name: str,
            description: str,
            shocks: Dict[str, float],
            duration_days: int = None,
            recovery_multiplier: float = None,
            is_historical: bool = False,
            historical_period: str = None,
            created_at: datetime = None
    ):
        """Initialize a stress test scenario.

        Args:
            id: Scenario ID
            name: Scenario name
            description: Scenario description
            shocks: Dictionary of shocks for assets, sectors, or macroeconomic factors
            duration_days: Duration of the scenario in days
            recovery_multiplier: Recovery time multiplier
            is_historical: Whether the scenario is based on historical data
            historical_period: Historical period for historical scenarios
            created_at: Creation timestamp
        """
        self.id = id
        self.name = name
        self.description = description
        self.shocks = shocks
        self.duration_days = duration_days
        self.recovery_multiplier = recovery_multiplier
        self.is_historical = is_historical
        self.historical_period = historical_period
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the stress test scenario to a dictionary.

        Returns:
            Dictionary representation of the stress test scenario
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "shocks": self.shocks,
            "is_historical": self.is_historical,
            "created_at": self.created_at.isoformat()
        }

        if self.duration_days is not None:
            result["duration_days"] = self.duration_days

        if self.recovery_multiplier is not None:
            result["recovery_multiplier"] = self.recovery_multiplier

        if self.historical_period:
            result["historical_period"] = self.historical_period

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StressTestScenario':
        """Create a stress test scenario from a dictionary.

        Args:
            data: Dictionary containing stress test scenario data

        Returns:
            StressTestScenario instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            shocks=data["shocks"],
            duration_days=data.get("duration_days"),
            recovery_multiplier=data.get("recovery_multiplier"),
            is_historical=data.get("is_historical", False),
            historical_period=data.get("historical_period"),
            created_at=created_at
        )


class StressTestResult:
    """Result of a stress test for a portfolio."""

    def __init__(
            self,
            id: str,
            portfolio_id: str,
            scenario_id: str,
            portfolio_value: float,
            post_stress_value: float,
            loss_amount: float,
            loss_percentage: float,
            asset_impacts: Dict[str, Dict[str, Any]],
            recovery_days: Optional[float] = None,
            recovery_months: Optional[float] = None,
            created_at: datetime = None
    ):
        """Initialize a stress test result.

        Args:
            id: Result ID
            portfolio_id: Portfolio ID
            scenario_id: Scenario ID
            portfolio_value: Initial portfolio value
            post_stress_value: Portfolio value after stress
            loss_amount: Absolute loss amount
            loss_percentage: Percentage loss
            asset_impacts: Impact details for each asset
            recovery_days: Estimated recovery time in days
            recovery_months: Estimated recovery time in months
            created_at: Creation timestamp
        """
        self.id = id
        self.portfolio_id = portfolio_id
        self.scenario_id = scenario_id
        self.portfolio_value = portfolio_value
        self.post_stress_value = post_stress_value
        self.loss_amount = loss_amount
        self.loss_percentage = loss_percentage
        self.asset_impacts = asset_impacts
        self.recovery_days = recovery_days
        self.recovery_months = recovery_months
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the stress test result to a dictionary.

        Returns:
            Dictionary representation of the stress test result
        """
        result = {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "scenario_id": self.scenario_id,
            "portfolio_value": self.portfolio_value,
            "post_stress_value": self.post_stress_value,
            "loss_amount": self.loss_amount,
            "loss_percentage": self.loss_percentage,
            "asset_impacts": self.asset_impacts,
            "created_at": self.created_at.isoformat()
        }

        if self.recovery_days is not None:
            result["recovery_days"] = self.recovery_days

        if self.recovery_months is not None:
            result["recovery_months"] = self.recovery_months

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StressTestResult':
        """Create a stress test result from a dictionary.

        Args:
            data: Dictionary containing stress test result data

        Returns:
            StressTestResult instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data["id"],
            portfolio_id=data["portfolio_id"],
            scenario_id=data["scenario_id"],
            portfolio_value=data["portfolio_value"],
            post_stress_value=data["post_stress_value"],
            loss_amount=data["loss_amount"],
            loss_percentage=data["loss_percentage"],
            asset_impacts=data["asset_impacts"],
            recovery_days=data.get("recovery_days"),
            recovery_months=data.get("recovery_months"),
            created_at=created_at
        )