from datetime import datetime
from typing import Dict, Optional, Any


class Asset:
    """Domain model for an asset."""

    def __init__(
            self,
            ticker: str,
            name: str = None,
            weight: float = 0.0,
            current_price: float = None,
            purchase_price: float = None,
            purchase_date: datetime = None,
            quantity: float = None,
            sector: str = None,
            industry: str = None,
            asset_class: str = None,
            currency: str = "USD",
            country: str = None,
            exchange: str = None,
            last_updated: datetime = None
    ):
        """Initialize an asset.

        Args:
            ticker: Stock/ETF ticker symbol
            name: Name of the asset
            weight: Weight in the portfolio (0.0-1.0)
            current_price: Current price
            purchase_price: Purchase price
            purchase_date: Purchase date
            quantity: Quantity owned
            sector: Sector (e.g., Technology, Healthcare)
            industry: Industry within the sector
            asset_class: Asset class (e.g., Equity, Fixed Income)
            currency: Currency code
            country: Country code
            exchange: Exchange code
            last_updated: Last update timestamp
        """

        if not ticker:
            raise ValueError("Ticker is required")
        if not isinstance(ticker, str):
            raise TypeError(f"Ticker must be a string, got {type(ticker).__name__}")

        if weight is not None and not isinstance(weight, (int, float)):
            raise TypeError(f"Weight must be a number, got {type(weight).__name__}")
        if current_price is not None and not isinstance(current_price, (int, float)):
            raise TypeError(f"Current price must be a number, got {type(current_price).__name__}")
        if purchase_price is not None and not isinstance(purchase_price, (int, float)):
            raise TypeError(f"Purchase price must be a number, got {type(purchase_price).__name__}")
        if quantity is not None and not isinstance(quantity, (int, float)):
            raise TypeError(f"Quantity must be a number, got {type(quantity).__name__}")

        if purchase_date is not None and not isinstance(purchase_date, datetime):
            raise TypeError(f"Purchase date must be a datetime, got {type(purchase_date).__name__}")
        if last_updated is not None and not isinstance(last_updated, datetime):
            raise TypeError(f"Last updated must be a datetime, got {type(last_updated).__name__}")

        self.ticker = ticker
        self.name = name or ticker
        self.weight = weight
        self.current_price = current_price
        self.purchase_price = purchase_price
        self.purchase_date = purchase_date
        self.quantity = quantity
        self.sector = sector
        self.industry = industry
        self.asset_class = asset_class
        self.currency = currency
        self.country = country
        self.exchange = exchange
        self.last_updated = last_updated or datetime.now()

    def calculate_value(self) -> Optional[float]:
        """Calculate the current value of the position."""
        if self.current_price is None:
            return None

        if self.quantity is None:
            return None

        return self.current_price * self.quantity

    def calculate_profit_loss(self) -> Optional[float]:
        """Calculate the absolute profit or loss.

        Returns:
            Profit/loss or None if required data is not available
        """
        if self.current_price is not None and self.purchase_price is not None and self.quantity is not None:
            return (self.current_price - self.purchase_price) * self.quantity
        return None

    def calculate_profit_loss_pct(self) -> Optional[float]:
        """Calculate the percentage profit or loss.

        Returns:
            Profit/loss percentage or None if required data is not available
        """
        if self.current_price is not None and self.purchase_price is not None and self.purchase_price > 0:
            return (self.current_price - self.purchase_price) / self.purchase_price
        return None

    def to_dict(self) -> Dict[str, Any]:
        """Convert the asset to a dictionary.

        Returns:
            Dictionary representation of the asset
        """
        result = {
            "ticker": self.ticker,
            "name": self.name,
            "weight": self.weight
        }

        # Add optional fields if they exist
        for field in ["current_price", "purchase_price", "quantity",
                      "sector", "industry", "asset_class",
                      "currency", "country", "exchange"]:
            value = getattr(self, field)
            if value is not None:
                result[field] = value

        if self.purchase_date:
            result["purchase_date"] = self.purchase_date.isoformat()

        if self.last_updated:
            result["last_updated"] = self.last_updated.isoformat()

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Asset':
        """Create an asset from a dictionary.

        Args:
            data: Dictionary containing asset data

        Returns:
            Asset instance
        """
        purchase_date = data.get("purchase_date")
        if purchase_date and isinstance(purchase_date, str):
            purchase_date = datetime.fromisoformat(purchase_date)

        last_updated = data.get("last_updated")
        if last_updated and isinstance(last_updated, str):
            last_updated = datetime.fromisoformat(last_updated)

        return cls(
            ticker=data["ticker"],
            name=data.get("name"),
            weight=data.get("weight", 0.0),
            current_price=data.get("current_price"),
            purchase_price=data.get("purchase_price"),
            purchase_date=purchase_date,
            quantity=data.get("quantity"),
            sector=data.get("sector"),
            industry=data.get("industry"),
            asset_class=data.get("asset_class"),
            currency=data.get("currency", "USD"),
            country=data.get("country"),
            exchange=data.get("exchange"),
            last_updated=last_updated
        )