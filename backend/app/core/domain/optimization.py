from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
import uuid


class OptimizationMethod(str, Enum):
    """Optimization method enumeration."""
    MARKOWITZ = "markowitz"
    RISK_PARITY = "risk_parity"
    MINIMUM_VARIANCE = "minimum_variance"
    MAXIMUM_SHARPE = "maximum_sharpe"
    EQUAL_WEIGHT = "equal_weight"
    ROBUST = "robust"
    CONDITIONAL = "conditional"
    HIERARCHICAL = "hierarchical"
    ESG = "esg"
    COST_AWARE = "cost_aware"


class OptimizationConstraint:
    """Constraint for portfolio optimization."""

    def __init__(
            self,
            type: str,
            parameter: str,
            min_value: Optional[float] = None,
            max_value: Optional[float] = None,
            target_value: Optional[float] = None,
            assets: Optional[List[str]] = None
    ):
        """Initialize an optimization constraint.

        Args:
            type: Constraint type (e.g., 'weight', 'sector', 'class')
            parameter: Parameter to constrain (e.g., ticker, sector name)
            min_value: Minimum value
            max_value: Maximum value
            target_value: Target value
            assets: List of assets affected by this constraint
        """
        self.type = type
        self.parameter = parameter
        self.min_value = min_value
        self.max_value = max_value
        self.target_value = target_value
        self.assets = assets or []

    def to_dict(self) -> Dict[str, Any]:
        """Convert the constraint to a dictionary.

        Returns:
            Dictionary representation of the constraint
        """
        result = {
            "type": self.type,
            "parameter": self.parameter
        }

        if self.min_value is not None:
            result["min_value"] = self.min_value

        if self.max_value is not None:
            result["max_value"] = self.max_value

        if self.target_value is not None:
            result["target_value"] = self.target_value

        if self.assets:
            result["assets"] = self.assets

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'OptimizationConstraint':
        """Create a constraint from a dictionary.

        Args:
            data: Dictionary containing constraint data

        Returns:
            OptimizationConstraint instance
        """
        return cls(
            type=data["type"],
            parameter=data["parameter"],
            min_value=data.get("min_value"),
            max_value=data.get("max_value"),
            target_value=data.get("target_value"),
            assets=data.get("assets")
        )


class OptimizationSettings:
    """Settings for portfolio optimization."""

    def __init__(
            self,
            method: OptimizationMethod,
            risk_free_rate: float = 0.0,
            target_return: Optional[float] = None,
            target_risk: Optional[float] = None,
            min_weight: float = 0.0,
            max_weight: float = 1.0,
            constraints: List[OptimizationConstraint] = None,
            risk_budget: Optional[Dict[str, float]] = None,
            advanced_settings: Optional[Dict[str, Any]] = None
    ):
        """Initialize optimization settings.

        Args:
            method: Optimization method
            risk_free_rate: Risk-free rate for calculations
            target_return: Target return for optimization
            target_risk: Target risk for optimization
            min_weight: Minimum weight constraint for all assets
            max_weight: Maximum weight constraint for all assets
            constraints: List of specific constraints
            risk_budget: Dictionary of {ticker: risk_budget} for risk parity
            advanced_settings: Dictionary of advanced settings for specific methods
        """
        self.method = method
        self.risk_free_rate = risk_free_rate
        self.target_return = target_return
        self.target_risk = target_risk
        self.min_weight = min_weight
        self.max_weight = max_weight
        self.constraints = constraints or []
        self.risk_budget = risk_budget
        self.advanced_settings = advanced_settings or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert the settings to a dictionary.

        Returns:
            Dictionary representation of the settings
        """
        result = {
            "method": self.method.value,
            "risk_free_rate": self.risk_free_rate,
            "min_weight": self.min_weight,
            "max_weight": self.max_weight,
            "constraints": [constraint.to_dict() for constraint in self.constraints],
            "advanced_settings": self.advanced_settings
        }

        if self.target_return is not None:
            result["target_return"] = self.target_return

        if self.target_risk is not None:
            result["target_risk"] = self.target_risk

        if self.risk_budget is not None:
            result["risk_budget"] = self.risk_budget

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'OptimizationSettings':
        """Create settings from a dictionary.

        Args:
            data: Dictionary containing settings data

        Returns:
            OptimizationSettings instance
        """
        constraints = None
        if "constraints" in data:
            constraints = [OptimizationConstraint.from_dict(c) for c in data["constraints"]]

        return cls(
            method=OptimizationMethod(data["method"]),
            risk_free_rate=data.get("risk_free_rate", 0.0),
            target_return=data.get("target_return"),
            target_risk=data.get("target_risk"),
            min_weight=data.get("min_weight", 0.0),
            max_weight=data.get("max_weight", 1.0),
            constraints=constraints,
            risk_budget=data.get("risk_budget"),
            advanced_settings=data.get("advanced_settings", {})
        )


class OptimizationResult:
    """Result of a portfolio optimization."""

    def __init__(
            self,
            id: str = None,
            portfolio_id: str = None,
            settings: OptimizationSettings = None,
            weights: Dict[str, float] = None,
            expected_return: float = None,
            expected_risk: float = None,
            sharpe_ratio: float = None,
            efficient_frontier: List[Dict[str, float]] = None,
            risk_contribution: Optional[Dict[str, float]] = None,
            created_at: datetime = None
    ):
        """Initialize an optimization result.

        Args:
            id: Result ID
            portfolio_id: Portfolio ID
            settings: Optimization settings used
            weights: Optimal weights for each asset
            expected_return: Expected return of the optimized portfolio
            expected_risk: Expected risk of the optimized portfolio
            sharpe_ratio: Sharpe ratio of the optimized portfolio
            efficient_frontier: Points on the efficient frontier
            risk_contribution: Risk contribution of each asset
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.portfolio_id = portfolio_id
        self.settings = settings
        self.weights = weights or {}
        self.expected_return = expected_return
        self.expected_risk = expected_risk
        self.sharpe_ratio = sharpe_ratio
        self.efficient_frontier = efficient_frontier or []
        self.risk_contribution = risk_contribution
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the result to a dictionary.

        Returns:
            Dictionary representation of the result
        """
        result = {
            "id": self.id,
            "created_at": self.created_at.isoformat(),
            "weights": self.weights
        }

        if self.portfolio_id:
            result["portfolio_id"] = self.portfolio_id

        if self.settings:
            result["settings"] = self.settings.to_dict()

        if self.expected_return is not None:
            result["expected_return"] = self.expected_return

        if self.expected_risk is not None:
            result["expected_risk"] = self.expected_risk

        if self.sharpe_ratio is not None:
            result["sharpe_ratio"] = self.sharpe_ratio

        if self.efficient_frontier:
            result["efficient_frontier"] = self.efficient_frontier

        if self.risk_contribution:
            result["risk_contribution"] = self.risk_contribution

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'OptimizationResult':
        """Create a result from a dictionary.

        Args:
            data: Dictionary containing result data

        Returns:
            OptimizationResult instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        settings = None
        if "settings" in data:
            settings = OptimizationSettings.from_dict(data["settings"])

        return cls(
            id=data.get("id"),
            portfolio_id=data.get("portfolio_id"),
            settings=settings,
            weights=data.get("weights", {}),
            expected_return=data.get("expected_return"),
            expected_risk=data.get("expected_risk"),
            sharpe_ratio=data.get("sharpe_ratio"),
            efficient_frontier=data.get("efficient_frontier", []),
            risk_contribution=data.get("risk_contribution"),
            created_at=created_at
        )