from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid


class HistoricalEvent:
    """Historical market event model."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            start_date: str = "",
            end_date: str = "",
            trigger_events: List[str] = None,
            key_indicators: List[Dict[str, Any]] = None,
            market_impact: Dict[str, str] = None,
            policy_response: List[str] = None,
            lessons_learned: List[str] = None,
            early_warning_signs: List[str] = None,
            most_resilient_assets: List[str] = None,
            most_affected_assets: List[str] = None,
            description: str = "",
            tags: List[str] = None,
            created_at: datetime = None
    ):
        """Initialize a historical event.

        Args:
            id: Event ID
            name: Event name
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            trigger_events: List of triggering events
            key_indicators: List of key indicators with values
            market_impact: Dictionary of impacts on markets
            policy_response: List of policy responses
            lessons_learned: List of lessons learned
            early_warning_signs: List of early warning signs
            most_resilient_assets: List of most resilient assets
            most_affected_assets: List of most affected assets
            description: Description of the event
            tags: List of tags
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.start_date = start_date
        self.end_date = end_date
        self.trigger_events = trigger_events or []
        self.key_indicators = key_indicators or []
        self.market_impact = market_impact or {}
        self.policy_response = policy_response or []
        self.lessons_learned = lessons_learned or []
        self.early_warning_signs = early_warning_signs or []
        self.most_resilient_assets = most_resilient_assets or []
        self.most_affected_assets = most_affected_assets or []
        self.description = description
        self.tags = tags or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the historical event to a dictionary.

        Returns:
            Dictionary representation of the historical event
        """
        return {
            "id": self.id,
            "name": self.name,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "trigger_events": self.trigger_events,
            "key_indicators": self.key_indicators,
            "market_impact": self.market_impact,
            "policy_response": self.policy_response,
            "lessons_learned": self.lessons_learned,
            "early_warning_signs": self.early_warning_signs,
            "most_resilient_assets": self.most_resilient_assets,
            "most_affected_assets": self.most_affected_assets,
            "description": self.description,
            "tags": self.tags,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'HistoricalEvent':
        """Create a historical event from a dictionary.

        Args:
            data: Dictionary containing historical event data

        Returns:
            HistoricalEvent instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data["name"],
            start_date=data.get("start_date", ""),
            end_date=data.get("end_date", ""),
            trigger_events=data.get("trigger_events", []),
            key_indicators=data.get("key_indicators", []),
            market_impact=data.get("market_impact", {}),
            policy_response=data.get("policy_response", []),
            lessons_learned=data.get("lessons_learned", []),
            early_warning_signs=data.get("early_warning_signs", []),
            most_resilient_assets=data.get("most_resilient_assets", []),
            most_affected_assets=data.get("most_affected_assets", []),
            description=data.get("description", ""),
            tags=data.get("tags", []),
            created_at=created_at
        )


class MarketRegime:
    """Market regime model representing a specific market environment."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            characteristics: Dict[str, Any] = None,
            indicators: List[Dict[str, Any]] = None,
            typical_asset_performance: Dict[str, float] = None,
            historical_examples: List[str] = None,
            transition_indicators: List[str] = None,
            tags: List[str] = None,
            created_at: datetime = None
    ):
        """Initialize a market regime.

        Args:
            id: Regime ID
            name: Regime name
            description: Regime description
            characteristics: Dictionary of regime characteristics
            indicators: List of indicators defining the regime
            typical_asset_performance: Dictionary of asset performance in this regime
            historical_examples: List of historical examples of this regime
            transition_indicators: List of indicators for regime transitions
            tags: List of tags
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.characteristics = characteristics or {}
        self.indicators = indicators or []
        self.typical_asset_performance = typical_asset_performance or {}
        self.historical_examples = historical_examples or []
        self.transition_indicators = transition_indicators or []
        self.tags = tags or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the market regime to a dictionary.

        Returns:
            Dictionary representation of the market regime
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "characteristics": self.characteristics,
            "indicators": self.indicators,
            "typical_asset_performance": self.typical_asset_performance,
            "historical_examples": self.historical_examples,
            "transition_indicators": self.transition_indicators,
            "tags": self.tags,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MarketRegime':
        """Create a market regime from a dictionary.

        Args:
            data: Dictionary containing market regime data

        Returns:
            MarketRegime instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description", ""),
            characteristics=data.get("characteristics", {}),
            indicators=data.get("indicators", []),
            typical_asset_performance=data.get("typical_asset_performance", {}),
            historical_examples=data.get("historical_examples", []),
            transition_indicators=data.get("transition_indicators", []),
            tags=data.get("tags", []),
            created_at=created_at
        )


class HistoricalAnalogy:
    """Historical analogy model representing a similarity between current and historical conditions."""

    def __init__(
            self,
            id: str = None,
            current_regime_id: str = None,
            historical_event_id: str = None,
            similarity_score: float = 0.0,
            similarity_factors: Dict[str, float] = None,
            recommendations: List[str] = None,
            created_at: datetime = None
    ):
        """Initialize a historical analogy.

        Args:
            id: Analogy ID
            current_regime_id: ID of the current market regime
            historical_event_id: ID of the historical event
            similarity_score: Overall similarity score (0-1)
            similarity_factors: Dictionary of similarity scores by factor
            recommendations: List of recommendations based on the analogy
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.current_regime_id = current_regime_id
        self.historical_event_id = historical_event_id
        self.similarity_score = similarity_score
        self.similarity_factors = similarity_factors or {}
        self.recommendations = recommendations or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the historical analogy to a dictionary.

        Returns:
            Dictionary representation of the historical analogy
        """
        return {
            "id": self.id,
            "current_regime_id": self.current_regime_id,
            "historical_event_id": self.historical_event_id,
            "similarity_score": self.similarity_score,
            "similarity_factors": self.similarity_factors,
            "recommendations": self.recommendations,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'HistoricalAnalogy':
        """Create a historical analogy from a dictionary.

        Args:
            data: Dictionary containing historical analogy data

        Returns:
            HistoricalAnalogy instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            current_regime_id=data.get("current_regime_id"),
            historical_event_id=data.get("historical_event_id"),
            similarity_score=data.get("similarity_score", 0.0),
            similarity_factors=data.get("similarity_factors", {}),
            recommendations=data.get("recommendations", []),
            created_at=created_at
        )