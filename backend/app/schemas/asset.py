from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import re


class AssetBase(BaseModel):
    """Base schema for an asset."""
    ticker: str = Field(..., description="Asset ticker symbol")
    name: Optional[str] = Field(None, description="Asset name")
    weight: Optional[float] = Field(0.0, description="Asset weight in the portfolio (0-1)")

    @validator('ticker')
    def ticker_must_be_valid(cls, v):
        """Validate that the ticker is a valid stock symbol format."""
        if not re.match(r'^[A-Za-z0-9.\-]+$', v):
            raise ValueError('Ticker must contain only letters, numbers, dots, and hyphens')
        return v.upper()

    @validator('weight')
    def weight_must_be_valid(cls, v):
        """Validate that the weight is between 0 and 1."""
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Weight must be between 0 and 1')
        return v


class AssetCreate(AssetBase):
    """Schema for creating a new asset."""
    quantity: Optional[float] = Field(None, description="Asset quantity")
    purchase_price: Optional[float] = Field(None, description="Purchase price")
    purchase_date: Optional[datetime] = Field(None, description="Purchase date")
    current_price: Optional[float] = Field(None, description="Current price")
    sector: Optional[str] = Field(None, description="Sector (e.g., Technology, Healthcare)")
    industry: Optional[str] = Field(None, description="Industry within the sector")
    asset_class: Optional[str] = Field(None, description="Asset class (e.g., Equity, Fixed Income)")
    currency: Optional[str] = Field("USD", description="Currency code")
    country: Optional[str] = Field(None, description="Country code")
    exchange: Optional[str] = Field(None, description="Exchange code")


class AssetUpdate(BaseModel):
    """Schema for updating an existing asset."""
    name: Optional[str] = Field(None, description="Asset name")
    weight: Optional[float] = Field(None, description="Asset weight in the portfolio (0-1)")
    quantity: Optional[float] = Field(None, description="Asset quantity")
    purchase_price: Optional[float] = Field(None, description="Purchase price")
    purchase_date: Optional[datetime] = Field(None, description="Purchase date")
    current_price: Optional[float] = Field(None, description="Current price")
    sector: Optional[str] = Field(None, description="Sector")
    industry: Optional[str] = Field(None, description="Industry")
    asset_class: Optional[str] = Field(None, description="Asset class")
    currency: Optional[str] = Field(None, description="Currency code")
    country: Optional[str] = Field(None, description="Country code")
    exchange: Optional[str] = Field(None, description="Exchange code")

    @validator('weight')
    def weight_must_be_valid(cls, v):
        """Validate that the weight is between 0 and 1."""
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Weight must be between 0 and 1')
        return v


class AssetInPortfolio(AssetBase):
    """Schema for an asset as part of a portfolio response."""
    quantity: Optional[float] = Field(None, description="Asset quantity")
    purchase_price: Optional[float] = Field(None, description="Purchase price")
    purchase_date: Optional[datetime] = Field(None, description="Purchase date")
    current_price: Optional[float] = Field(None, description="Current price")
    sector: Optional[str] = Field(None, description="Sector")
    industry: Optional[str] = Field(None, description="Industry")
    asset_class: Optional[str] = Field(None, description="Asset class")
    currency: str = Field("USD", description="Currency code")
    country: Optional[str] = Field(None, description="Country code")
    exchange: Optional[str] = Field(None, description="Exchange code")
    last_updated: Optional[datetime] = Field(None, description="Last price update timestamp")

    # Calculated fields
    position_value: Optional[float] = Field(None, description="Current position value")
    profit_loss: Optional[float] = Field(None, description="Absolute profit/loss")
    profit_loss_pct: Optional[float] = Field(None, description="Percentage profit/loss")


class AssetPriceUpdate(BaseModel):
    """Schema for updating asset prices."""
    ticker: str = Field(..., description="Asset ticker symbol")
    current_price: float = Field(..., description="Current price")
    price_date: Optional[datetime] = Field(None, description="Price date")
    source: Optional[str] = Field(None, description="Price data source")


class AssetSearch(BaseModel):
    """Schema for asset search results."""
    ticker: str = Field(..., description="Asset ticker symbol")
    name: str = Field(..., description="Asset name")
    exchange: Optional[str] = Field(None, description="Exchange code")
    asset_type: Optional[str] = Field(None, description="Asset type")
    country: Optional[str] = Field(None, description="Country code")
    currency: Optional[str] = Field(None, description="Currency code")
    sector: Optional[str] = Field(None, description="Sector")
    industry: Optional[str] = Field(None, description="Industry")


class AssetHistoricalData(BaseModel):
    """Schema for asset historical data response."""
    ticker: str = Field(..., description="Asset ticker symbol")
    dates: List[str] = Field(..., description="List of dates")
    prices: Dict[str, List[float]] = Field(...,
                                           description="Dictionary of price series (open, high, low, close, adj_close)")
    volumes: Optional[List[int]] = Field(None, description="List of volumes")
    start_date: str = Field(..., description="Start date of the data")
    end_date: str = Field(..., description="End date of the data")
    interval: str = Field("1d", description="Data interval")


class AssetPerformance(BaseModel):
    """Schema for asset performance metrics."""
    ticker: str = Field(..., description="Asset ticker symbol")
    total_return: float = Field(..., description="Total return")
    annualized_return: float = Field(..., description="Annualized return")
    volatility: float = Field(..., description="Annualized volatility")
    max_drawdown: float = Field(..., description="Maximum drawdown")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio")
    beta: Optional[float] = Field(None, description="Beta against benchmark")
    alpha: Optional[float] = Field(None, description="Alpha against benchmark")
    period_returns: Dict[str, float] = Field(..., description="Returns by period (1d, 1w, 1m, 3m, 6m, 1y, ytd)")
    start_date: str = Field(..., description="Start date for performance calculation")
    end_date: str = Field(..., description="End date for performance calculation")
    benchmark_id: Optional[str] = Field(None, description="Benchmark ID")