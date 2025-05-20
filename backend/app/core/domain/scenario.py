from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid


class ScenarioImpact:
    """Impact of a scenario on an asset, sector, or market factor."""

    def __init__(
            self,
            entity_type: str,
            entity_id: str,
            impact_value: float,
            probability: float = 1.0,
            description: str = ""
    ):
        """Initialize a scenario impact.

        Args:
            entity_type: Type of entity affected (asset, sector, factor)
            entity_id: Identifier of the affected entity
            impact_value: Impact value (usually a percentage)
            probability: Probability of this impact
            description: Description of the impact
        """
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.impact_value = impact_value
        self.probability = probability
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        """Convert the impact to a dictionary.

        Returns:
            Dictionary representation of the impact
        """
        return {
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "impact_value": self.impact_value,
            "probability": self.probability,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScenarioImpact':
        """Create an impact from a dictionary.

        Args:
            data: Dictionary containing impact data

        Returns:
            ScenarioImpact instance
        """
        return cls(
            entity_type=data["entity_type"],
            entity_id=data["entity_id"],
            impact_value=data["impact_value"],
            probability=data.get("probability", 1.0),
            description=data.get("description", "")
        )


class Scenario:
    """A scenario for modeling market events."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            impacts: List[ScenarioImpact] = None,
            duration_days: Optional[int] = None,
            leads_to: List[Dict[str, Any]] = None,
            probability: float = 1.0,
            tags: List[str] = None,
            created_at: datetime = None
    ):
        """Initialize a scenario.

        Args:
            id: Scenario ID
            name: Scenario name
            description: Scenario description
            impacts: List of impacts
            duration_days: Duration in days
            leads_to: List of subsequent scenarios with probabilities
            probability: Overall probability of the scenario
            tags: List of tags
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.impacts = impacts or []
        self.duration_days = duration_days
        self.leads_to = leads_to or []
        self.probability = probability
        self.tags = tags or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the scenario to a dictionary.

        Returns:
            Dictionary representation of the scenario
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "impacts": [impact.to_dict() for impact in self.impacts],
            "leads_to": self.leads_to,
            "probability": self.probability,
            "tags": self.tags,
            "created_at": self.created_at.isoformat()
        }

        if self.duration_days is not None:
            result["duration_days"] = self.duration_days

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Scenario':
        """Create a scenario from a dictionary.

        Args:
            data: Dictionary containing scenario data

        Returns:
            Scenario instance
        """
        impacts = None
        if "impacts" in data:
            impacts = [ScenarioImpact.from_dict(impact) for impact in data["impacts"]]

        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description", ""),
            impacts=impacts,
            duration_days=data.get("duration_days"),
            leads_to=data.get("leads_to", []),
            probability=data.get("probability", 1.0),
            tags=data.get("tags", []),
            created_at=created_at
        )


class ScenarioChain:
    """A chain of connected scenarios."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            starting_scenario_id: str = None,
            scenarios: Dict[str, Scenario] = None,
            tags: List[str] = None,
            created_at: datetime = None
    ):
        """Initialize a scenario chain.

        Args:
            id: Chain ID
            name: Chain name
            description: Chain description
            starting_scenario_id: ID of the starting scenario
            scenarios: Dictionary of scenarios in the chain
            tags: List of tags
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.starting_scenario_id = starting_scenario_id
        self.scenarios = scenarios or {}
        self.tags = tags or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the chain to a dictionary.

        Returns:
            Dictionary representation of the chain
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "starting_scenario_id": self.starting_scenario_id,
            "scenarios": {id: scenario.to_dict() for id, scenario in self.scenarios.items()},
            "tags": self.tags,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScenarioChain':
        """Create a chain from a dictionary.

        Args:
            data: Dictionary containing chain data

        Returns:
            ScenarioChain instance
        """
        scenarios = {}
        if "scenarios" in data:
            scenarios = {id: Scenario.from_dict(scenario_data) for id, scenario_data in data["scenarios"].items()}

        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description", ""),
            starting_scenario_id=data.get("starting_scenario_id"),
            scenarios=scenarios,
            tags=data.get("tags", []),
            created_at=created_at
        )


class ScenarioSimulationResult:
    """Result of a scenario chain simulation."""

    def __init__(
            self,
            id: str = None,
            chain_id: str = None,
            portfolio_id: str = None,
            scenario_paths: List[List[str]] = None,
            impacts: Dict[str, Dict[str, Any]] = None,
            created_at: datetime = None
    ):
        """Initialize a simulation result.

        Args:
            id: Result ID
            chain_id: ID of the simulated chain
            portfolio_id: ID of the affected portfolio
            scenario_paths: Paths of scenarios in the simulation
            impacts: Impact details
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.chain_id = chain_id
        self.portfolio_id = portfolio_id
        self.scenario_paths = scenario_paths or []
        self.impacts = impacts or {}
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the result to a dictionary.

        Returns:
            Dictionary representation of the result
        """
        return {
            "id": self.id,
            "chain_id": self.chain_id,
            "portfolio_id": self.portfolio_id,
            "scenario_paths": self.scenario_paths,
            "impacts": self.impacts,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScenarioSimulationResult':
        """Create a result from a dictionary.

        Args:
            data: Dictionary containing result data

        Returns:
            ScenarioSimulationResult instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            chain_id=data.get("chain_id"),
            portfolio_id=data.get("portfolio_id"),
            scenario_paths=data.get("scenario_paths", []),
            impacts=data.get("impacts", {}),
            created_at=created_at
        )