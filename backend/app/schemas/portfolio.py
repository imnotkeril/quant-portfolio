from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any
from datetime import datetime
import re


class AssetBase(BaseModel):
    """Base schema for an asset in a portfolio."""
    ticker: str = Field(..., description="Asset ticker symbol")
    weight: Optional[float] = Field(None, description="Asset weight in the portfolio (0-1)")

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
    name: Optional[str] = Field(None, description="Asset name")
    quantity: Optional[float] = Field(None, description="Asset quantity")
    purchase_price: Optional[float] = Field(None, description="Purchase price")
    purchase_date: Optional[datetime] = Field(None, description="Purchase date")
    current_price: Optional[float] = Field(None, description="Current price")
    sector: Optional[str] = Field(None, description="Sector")
    industry: Optional[str] = Field(None, description="Industry")
    asset_class: Optional[str] = Field(None, description="Asset class")
    currency: Optional[str] = Field("USD", description="Currency")
    country: Optional[str] = Field(None, description="Country")
    exchange: Optional[str] = Field(None, description="Exchange")


class AssetResponse(AssetCreate):
    """Schema for an asset response."""
    price_change_pct: Optional[float] = Field(None, description="Price change percentage")
    price_date: Optional[str] = Field(None, description="Price date")
    position_value: Optional[float] = Field(None, description="Position value")


class PortfolioBase(BaseModel):
    """Base schema for a portfolio."""
    name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field("", description="Portfolio description")
    tags: Optional[List[str]] = Field([], description="Portfolio tags")


class PortfolioCreate(PortfolioBase):
    """Schema for creating a new portfolio."""
    assets: List[AssetCreate] = Field([], description="Portfolio assets")


class PortfolioUpdate(BaseModel):
    """Schema for updating an existing portfolio."""
    name: Optional[str] = Field(None, description="Portfolio name")
    description: Optional[str] = Field(None, description="Portfolio description")
    tags: Optional[List[str]] = Field(None, description="Portfolio tags")
    assets: Optional[List[AssetCreate]] = Field(None, description="Portfolio assets")


class PortfolioResponse(PortfolioBase):
    """Schema for a portfolio response."""
    id: str = Field(..., description="Portfolio ID")
    assets: List[AssetResponse] = Field(..., description="Portfolio assets")
    created: datetime = Field(..., description="Creation timestamp")
    last_updated: datetime = Field(..., description="Last update timestamp")
    total_value: Optional[float] = Field(None, description="Total portfolio value")
    performance: Optional[Dict[str, float]] = Field(None, description="Portfolio performance metrics")


class PortfolioList(BaseModel):
    """Schema for a portfolio in a list."""
    id: str = Field(..., description="Portfolio ID")
    name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field("", description="Portfolio description")
    asset_count: int = Field(..., description="Number of assets")
    tags: List[str] = Field([], description="Portfolio tags")
    last_updated: datetime = Field(..., description="Last update timestamp")


class TextPortfolioCreate(BaseModel):
    """Schema for creating a portfolio from text."""
    name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field("", description="Portfolio description")
    text: str = Field(..., description="Text with tickers and weights")
    tags: Optional[List[str]] = Field([], description="Portfolio tags")


class PortfolioImport(BaseModel):
    """Schema for importing a portfolio from a file."""
    portfolio_name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field("", description="Portfolio description")
    file_path: str = Field(..., description="Path to the imported file")
    tags: Optional[List[str]] = Field([], description="Portfolio tags")


class PortfolioExport(BaseModel):
    """Schema for exporting a portfolio to a file."""
    portfolio_id: str = Field(..., description="Portfolio ID")
    format: str = Field("csv", description="Export format (csv, excel, json)")
    file_path: Optional[str] = Field(None, description="Path to save the exported file")


class UpdatePricesResponse(BaseModel):
    """Schema for the response after updating portfolio prices."""
    portfolio_id: str = Field(..., description="Portfolio ID")
    updated_assets: int = Field(..., description="Number of assets updated")
    timestamp: datetime = Field(..., description="Update timestamp")
    price_changes: Dict[str, float] = Field(..., description="Price changes by ticker")