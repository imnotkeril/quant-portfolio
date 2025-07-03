"""
API endpoints for portfolio management.
"""
from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Path, Query, status
from fastapi.responses import FileResponse

from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    PortfolioList,
    TextPortfolioCreate,
    AssetCreate
)
from app.core.domain.portfolio import Portfolio
from app.core.domain.asset import Asset
from app.infrastructure.data.portfolio_manager import PortfolioManagerService

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


def get_portfolio_manager():
    """Dependency injection for portfolio manager"""
    # This will be replaced with dependency injection in a real app
    from app.api.dependencies import get_portfolio_manager_service
    return get_portfolio_manager_service()


@router.get("/", response_model=List[PortfolioList])
async def list_portfolios(portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)):
    """
    List all portfolios

    Returns:
        List of portfolios metadata
    """
    try:
        portfolios = portfolio_manager.list_portfolios()
        return portfolios
    except Exception as e:
        logging.error(f"Error listing portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list portfolios"
        )


@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
        portfolio: PortfolioCreate,
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Create a new portfolio

    Args:
        portfolio: Portfolio creation data

    Returns:
        Created portfolio data
    """
    try:
        # Create domain model
        new_portfolio = Portfolio(
            id=None,  # ID will be auto-generated
            name=portfolio.name,
            description=portfolio.description,
            tags=portfolio.tags,
            created_at=None  # Will be set to current time
        )

        # Add assets if provided
        if portfolio.assets:
            for asset_data in portfolio.assets:
                asset = Asset(
                    ticker=asset_data.ticker,
                    name=asset_data.name,
                    weight=asset_data.weight
                )

                # Set optional attributes
                for attr, value in asset_data.dict(exclude_unset=True).items():
                    if attr not in ('ticker', 'name', 'weight') and value is not None:
                        setattr(asset, attr, value)

                new_portfolio.add_asset(asset, asset_data.weight)

        # Normalize weights
        new_portfolio.normalize_weights()

        # Save portfolio
        portfolio_id = portfolio_manager.save_portfolio(new_portfolio)

        # Load the saved portfolio to return it
        saved_portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not saved_portfolio:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created portfolio"
            )

        return PortfolioResponse.from_domain(saved_portfolio)
    except Exception as e:
        logging.error(f"Error creating portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portfolio: {str(e)}"
        )


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
        portfolio_id: str = Path(..., description="The ID of the portfolio to get"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Get a specific portfolio

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Portfolio data
    """
    portfolio = portfolio_manager.load_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio with ID {portfolio_id} not found"
        )

    return PortfolioResponse.from_domain(portfolio)


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
        portfolio_update: PortfolioUpdate,
        portfolio_id: str = Path(..., description="The ID of the portfolio to update"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Update a portfolio

    Args:
        portfolio_id: Portfolio ID
        portfolio_update: Portfolio update data

    Returns:
        Updated portfolio data
    """
    try:
        # Load existing portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Update portfolio attributes
        if portfolio_update.name is not None:
            portfolio.name = portfolio_update.name

        if portfolio_update.description is not None:
            portfolio.description = portfolio_update.description

        if portfolio_update.tags is not None:
            portfolio.tags = portfolio_update.tags

        # Handle asset updates if provided
        if portfolio_update.assets is not None:
            # Reset assets if requested
            if portfolio_update.reset_assets:
                portfolio.assets = []

            # Add or update assets
            for asset_data in portfolio_update.assets:
                # Check if asset already exists
                existing_asset = portfolio.get_asset_by_ticker(asset_data.ticker)

                if existing_asset:
                    # Update existing asset
                    for attr, value in asset_data.dict(exclude_unset=True).items():
                        if attr != 'ticker' and value is not None:
                            setattr(existing_asset, attr, value)

                    # Update weight if provided
                    if asset_data.weight is not None:
                        portfolio.update_asset_weight(asset_data.ticker, asset_data.weight)
                else:
                    # Create new asset
                    asset = Asset(ticker=asset_data.ticker)

                    # Set attributes
                    for attr, value in asset_data.dict(exclude_unset=True).items():
                        if attr != 'ticker' and value is not None:
                            setattr(asset, attr, value)

                    # Add to portfolio
                    portfolio.add_asset(asset, asset_data.weight)

        # Handle asset deletions if provided
        if portfolio_update.assets_to_delete:
            for ticker in portfolio_update.assets_to_delete:
                portfolio.remove_asset(ticker)

        # Normalize weights
        portfolio.normalize_weights()

        # Save updated portfolio
        portfolio_manager.save_portfolio(portfolio)

        # Return updated portfolio
        return PortfolioResponse.from_domain(portfolio)
    except Exception as e:
        logging.error(f"Error updating portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update portfolio: {str(e)}"
        )


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
        portfolio_id: str = Path(..., description="The ID of the portfolio to delete"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Delete a portfolio

    Args:
        portfolio_id: Portfolio ID
    """
    # Check if portfolio exists
    portfolio = portfolio_manager.load_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio with ID {portfolio_id} not found"
        )

    # Delete portfolio
    success = portfolio_manager.delete_portfolio(portfolio_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete portfolio with ID {portfolio_id}"
        )


@router.post("/from-text", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio_from_text(
        portfolio_text: TextPortfolioCreate,
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Create a portfolio from text

    Args:
        portfolio_text: Portfolio creation data with text representation of assets

    Returns:
        Created portfolio data
    """
    try:
        # Create portfolio from text
        portfolio = portfolio_manager.create_portfolio_from_text(
            portfolio_text.text,
            portfolio_text.name,
            portfolio_text.description
        )

        # Save portfolio
        portfolio_id = portfolio_manager.save_portfolio(portfolio)

        # Load saved portfolio
        saved_portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not saved_portfolio:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created portfolio"
            )

        return PortfolioResponse.from_domain(saved_portfolio)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logging.error(f"Error creating portfolio from text: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portfolio: {str(e)}"
        )


@router.post("/import-csv", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def import_portfolio_from_csv(
        file: UploadFile = File(...),
        portfolio_name: Optional[str] = Form(None),
        description: Optional[str] = Form(""),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Import a portfolio from CSV

    Args:
        file: CSV file
        portfolio_name: Name for the portfolio
        description: Description for the portfolio

    Returns:
        Imported portfolio data
    """
    try:
        # Create temporary file
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Import portfolio
        portfolio = portfolio_manager.import_from_csv(
            temp_file_path,
            portfolio_name
        )

        # Set description if provided
        if description:
            portfolio.description = description

        # Save portfolio
        portfolio_id = portfolio_manager.save_portfolio(portfolio)

        # Load saved portfolio
        saved_portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not saved_portfolio:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve imported portfolio"
            )

        return PortfolioResponse.from_domain(saved_portfolio)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logging.error(f"Error importing portfolio from CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import portfolio: {str(e)}"
        )


@router.get("/{portfolio_id}/export-csv")
async def export_portfolio_to_csv(
        portfolio_id: str = Path(..., description="The ID of the portfolio to export"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Export a portfolio to CSV

    Args:
        portfolio_id: Portfolio ID

    Returns:
        CSV file
    """
    try:
        # Load portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Export to CSV
        csv_path = portfolio_manager.export_to_csv(portfolio)

        # Return file
        return FileResponse(
            path=csv_path,
            filename=f"{portfolio.name}.csv",
            media_type="text/csv"
        )
    except Exception as e:
        logging.error(f"Error exporting portfolio {portfolio_id} to CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export portfolio: {str(e)}"
        )


@router.post("/{portfolio_id}/update-prices", response_model=PortfolioResponse)
async def update_portfolio_prices(
        portfolio_id: str = Path(..., description="The ID of the portfolio to update prices for"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Update portfolio prices

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Updated portfolio data
    """
    try:
        # Load portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Update prices
        updated_portfolio = portfolio_manager.update_portfolio_prices(portfolio)

        # Save updated portfolio
        portfolio_manager.save_portfolio(updated_portfolio)

        return PortfolioResponse.from_domain(updated_portfolio)
    except Exception as e:
        logging.error(f"Error updating prices for portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update portfolio prices: {str(e)}"
        )


@router.post("/{portfolio_id}/assets", response_model=PortfolioResponse)
async def add_asset_to_portfolio(
        asset: AssetCreate,
        portfolio_id: str = Path(..., description="The ID of the portfolio to add asset to"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Add asset to portfolio

    Args:
        portfolio_id: Portfolio ID
        asset: Asset data

    Returns:
        Updated portfolio data
    """
    try:
        # Load portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Check if asset already exists
        existing_asset = portfolio.get_asset_by_ticker(asset.ticker)
        if existing_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Asset with ticker {asset.ticker} already exists in portfolio"
            )

        # Create domain model
        new_asset = Asset(ticker=asset.ticker)

        # Set attributes
        for attr, value in asset.dict(exclude_unset=True).items():
            if attr != 'ticker' and value is not None:
                setattr(new_asset, attr, value)

        # Add to portfolio
        portfolio.add_asset(new_asset, asset.weight)

        # Normalize weights
        portfolio.normalize_weights()

        # Save portfolio
        portfolio_manager.save_portfolio(portfolio)

        return PortfolioResponse.from_domain(portfolio)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error adding asset to portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add asset: {str(e)}"
        )


@router.delete("/{portfolio_id}/assets/{ticker}")
async def remove_asset_from_portfolio(
        portfolio_id: str = Path(..., description="The ID of the portfolio"),
        ticker: str = Path(..., description="The ticker of the asset to remove"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager)
):
    """
    Remove asset from portfolio

    Args:
        portfolio_id: Portfolio ID
        ticker: Asset ticker

    Returns:
        Updated portfolio data
    """
    try:
        # Load portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Check if asset exists
        existing_asset = portfolio.get_asset_by_ticker(ticker)
        if not existing_asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ticker {ticker} not found in portfolio"
            )

        # Remove asset
        portfolio.remove_asset(ticker)

        # Normalize weights
        portfolio.normalize_weights()

        # Save portfolio
        portfolio_manager.save_portfolio(portfolio)

        return PortfolioResponse.from_domain(portfolio)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error removing asset {ticker} from portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove asset: {str(e)}"
        )