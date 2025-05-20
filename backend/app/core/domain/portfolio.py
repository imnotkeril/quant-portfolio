from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

from .asset import Asset

import logging

# Setup logging
logger = logging.getLogger(__name__)


class Portfolio:
    """Domain model for a portfolio."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            tags: List[str] = None,
            assets: List[Asset] = None,
            created_at: datetime = None,
            updated_at: datetime = None
    ):
        """Initialize a portfolio.

        Args:
            id: Unique identifier for the portfolio
            name: Name of the portfolio
            description: Description of the portfolio
            tags: List of tags for the portfolio
            assets: List of assets in the portfolio
            created_at: Creation timestamp
            updated_at: Last update timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.tags = tags or []
        self.assets = assets or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def add_asset(self, asset: Asset, weight: float = None) -> None:
        """Add an asset to the portfolio.

        Args:
            asset: Asset to add
            weight: Weight of the asset in the portfolio (optional)
        """
        # Валидация
        if not isinstance(asset, Asset):
            raise TypeError(f"Expected Asset instance, got {type(asset).__name__}")

        if weight is not None:
            if not isinstance(weight, (int, float)):
                raise TypeError(f"Weight must be a number, got {type(weight).__name__}")
            if weight < 0:
                raise ValueError(f"Weight must be non-negative, got {weight}")
            asset.weight = weight

        for i, existing_asset in enumerate(self.assets):
            if existing_asset.ticker == asset.ticker:
                # Update existing asset
                self.assets[i] = asset
                self.updated_at = datetime.now()
                return

        # Add new asset
        self.assets.append(asset)
        self.updated_at = datetime.now()

    def remove_asset(self, ticker: str) -> None:
        """Remove an asset from the portfolio.

        Args:
            ticker: Ticker symbol of the asset to remove
        """
        self.assets = [asset for asset in self.assets if asset.ticker != ticker]
        self.updated_at = datetime.now()

    def update_asset_weight(self, ticker: str, weight: float) -> None:
        """Update the weight of an asset in the portfolio.

        Args:
            ticker: Ticker symbol of the asset to update
            weight: New weight for the asset
        """
        for asset in self.assets:
            if asset.ticker == ticker:
                asset.weight = weight
                self.updated_at = datetime.now()
                return


    def normalize_weights(self) -> None:
        """Normalize the weights of all assets to sum to 1.0."""
        total_weight = self.get_total_weight()

        if len(self.assets) == 0:
            return

        if total_weight <= 0:

            equal_weight = 1.0 / len(self.assets)
            for asset in self.assets:
                asset.weight = equal_weight
        else:

            for asset in self.assets:
                asset.weight = asset.weight / total_weight

        self.updated_at = datetime.now()

    def get_asset_by_ticker(self, ticker: str) -> Optional[Asset]:
        """Get an asset by its ticker symbol.

        Args:
            ticker: Ticker symbol of the asset to get

        Returns:
            Asset or None if not found
        """
        for asset in self.assets:
            if asset.ticker == ticker:
                return asset
        return None

    def get_total_weight(self) -> float:
        """Get the total weight of all assets in the portfolio.

        Returns:
            Total weight of all assets
        """
        return sum(asset.weight for asset in self.assets)

    def get_asset_weights(self) -> Dict[str, float]:
        """Get a dictionary of asset weights by ticker.

        Returns:
            Dictionary of {ticker: weight} pairs
        """
        return {asset.ticker: asset.weight for asset in self.assets}

    def get_asset_sectors(self) -> Dict[str, List[str]]:
        """Group assets by sector.

        Returns:
            Dictionary of {sector: [ticker1, ticker2, ...]} pairs
        """
        sectors = {}
        for asset in self.assets:
            if asset.sector:
                if asset.sector not in sectors:
                    sectors[asset.sector] = []
                sectors[asset.sector].append(asset.ticker)
        return sectors

    def get_asset_classes(self) -> Dict[str, List[str]]:
        """Group assets by asset class.

        Returns:
            Dictionary of {asset_class: [ticker1, ticker2, ...]} pairs
        """
        asset_classes = {}
        for asset in self.assets:
            if asset.asset_class:
                if asset.asset_class not in asset_classes:
                    asset_classes[asset.asset_class] = []
                asset_classes[asset.asset_class].append(asset.ticker)
        return asset_classes

    def to_dict(self) -> Dict[str, Any]:
        """Convert the portfolio to a dictionary.

        Returns:
            Dictionary representation of the portfolio
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "tags": self.tags,
            "assets": [asset.to_dict() for asset in self.assets],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Portfolio':
        """Create a portfolio from a dictionary."""
        if not isinstance(data, dict):
            raise TypeError(f"Expected dictionary, got {type(data).__name__}")

        if "assets" in data and not isinstance(data["assets"], list):
            raise ValueError("Assets must be a list")

        assets = [Asset.from_dict(asset_data) for asset_data in data.get("assets", [])]

        # Улучшенная обработка created_at
        created_at = data.get("created_at")
        if created_at:
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except ValueError:
                    logger.warning(f"Invalid datetime format: {created_at}, using current time")
                    created_at = datetime.now()
            elif not isinstance(created_at, datetime):
                logger.warning(f"Invalid created_at type: {type(created_at)}, using current time")
                created_at = datetime.now()
        else:
            created_at = datetime.now()

        # Аналогичная обработка для updated_at
        updated_at = data.get("updated_at")
        if updated_at:
            if isinstance(updated_at, str):
                try:
                    updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                except ValueError:
                    logger.warning(f"Invalid datetime format: {updated_at}, using current time")
                    updated_at = datetime.now()
            elif not isinstance(updated_at, datetime):
                logger.warning(f"Invalid updated_at type: {type(updated_at)}, using current time")
                updated_at = datetime.now()
        else:
            updated_at = datetime.now()

        return cls(
            id=data.get("id"),
            name=data.get("name", ""),
            description=data.get("description", ""),
            tags=data.get("tags", []),
            assets=assets,
            created_at=created_at,
            updated_at=updated_at
        )