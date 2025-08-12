"""
API endpoints for portfolio management.
"""
from typing import List, Optional
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Path, Query, status
from fastapi.responses import FileResponse

from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.api.dependencies import get_portfolio_manager_service

router = APIRouter(prefix="/portfolios", tags=["portfolios"])

# Configure logging
logger = logging.getLogger(__name__)


@router.get("/")
async def list_portfolios(portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)):
    """
    List all portfolios

    Returns:
        List of portfolios metadata
    """
    try:
        logger.info("📋 Listing all portfolios")
        portfolios = portfolio_manager.list_portfolios()
        logger.info(f"✅ Found {len(portfolios)} portfolios")
        return portfolios
    except Exception as e:
        logger.error(f"❌ Error listing portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list portfolios"
        )


@router.get("/{portfolio_id}")
async def get_portfolio(
        portfolio_id: str = Path(..., description="The ID of the portfolio to get"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
):
    """
    Get a specific portfolio

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Portfolio data
    """
    try:
        logger.info(f"📖 Getting portfolio: {portfolio_id}")

        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            logger.warning(f"⚠️ Portfolio not found: {portfolio_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        logger.info(f"✅ Portfolio loaded: {portfolio_id}")

        # Return simple portfolio data without domain conversion
        return {
            "portfolio": portfolio,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio: {str(e)}"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_portfolio(
        portfolio_data: dict,
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
):
    """
    Create a new portfolio

    Args:
        portfolio_data: Portfolio creation data

    Returns:
        Created portfolio data
    """
    try:
        logger.info(f"🆕 Creating new portfolio: {portfolio_data.get('name', 'Unnamed')}")

        # Simple portfolio creation without domain models
        portfolio_id = f"portfolio_{int(datetime.now().timestamp())}"

        # Basic portfolio structure
        new_portfolio = {
            "id": portfolio_id,
            "name": portfolio_data.get("name", "New Portfolio"),
            "description": portfolio_data.get("description", ""),
            "assets": portfolio_data.get("assets", []),
            "createdAt": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat(),
            "totalValue": 0,
            "startingAmount": portfolio_data.get("startingAmount", 0)
        }

        # Save portfolio using portfolio manager (it should handle the saving)
        try:
            saved_id = portfolio_manager.save_portfolio(new_portfolio)
            logger.info(f"✅ Portfolio created with ID: {saved_id}")

            return {
                "portfolio": new_portfolio,
                "status": "success",
                "message": f"Portfolio created with ID: {saved_id}"
            }
        except Exception as save_error:
            logger.error(f"❌ Error saving portfolio: {save_error}")
            # Even if save fails, return the portfolio data
            return {
                "portfolio": new_portfolio,
                "status": "created_but_not_saved",
                "message": "Portfolio created but may not be saved permanently"
            }

    except Exception as e:
        logger.error(f"❌ Error creating portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portfolio: {str(e)}"
        )


@router.put("/{portfolio_id}")
async def update_portfolio(
        portfolio_data: dict,
        portfolio_id: str = Path(..., description="The ID of the portfolio to update"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
):
    """
    Update a portfolio

    Args:
        portfolio_id: Portfolio ID
        portfolio_data: Portfolio update data

    Returns:
        Updated portfolio data
    """
    try:
        logger.info(f"🔄 Updating portfolio: {portfolio_id}")

        # Load existing portfolio
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            logger.warning(f"⚠️ Portfolio not found for update: {portfolio_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Update portfolio data
        portfolio.update(portfolio_data)
        portfolio["lastUpdated"] = datetime.now().isoformat()

        # Save updated portfolio
        try:
            portfolio_manager.save_portfolio(portfolio)
            logger.info(f"✅ Portfolio updated: {portfolio_id}")
        except Exception as save_error:
            logger.warning(f"⚠️ Error saving updated portfolio: {save_error}")

        # Return updated portfolio
        return {
            "portfolio": portfolio,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update portfolio: {str(e)}"
        )


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
        portfolio_id: str = Path(..., description="The ID of the portfolio to delete"),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
):
    """
    Delete a portfolio

    Args:
        portfolio_id: Portfolio ID
    """
    try:
        logger.info(f"🗑️ Deleting portfolio: {portfolio_id}")

        # Check if portfolio exists
        portfolio = portfolio_manager.load_portfolio(portfolio_id)
        if not portfolio:
            logger.warning(f"⚠️ Portfolio not found for deletion: {portfolio_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Delete portfolio
        try:
            success = portfolio_manager.delete_portfolio(portfolio_id)
            if success:
                logger.info(f"✅ Portfolio deleted: {portfolio_id}")
            else:
                logger.warning(f"⚠️ Portfolio deletion may have failed: {portfolio_id}")
        except Exception as delete_error:
            logger.error(f"❌ Error deleting portfolio: {delete_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete portfolio with ID {portfolio_id}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete portfolio: {str(e)}"
        )


@router.post("/from-text", status_code=status.HTTP_201_CREATED)
async def create_portfolio_from_text(
        portfolio_text_data: dict,
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
):
    """
    Create a portfolio from text

    Args:
        portfolio_text_data: Portfolio creation data with text representation of assets

    Returns:
        Created portfolio data
    """
    try:
        text_content = portfolio_text_data.get("text", "")
        name = portfolio_text_data.get("name", "Text Portfolio")
        description = portfolio_text_data.get("description", "")

        logger.info(f"📝 Creating portfolio from text: {name}")

        # Simple text parsing (basic implementation)
        assets = []
        if text_content:
            lines = text_content.strip().split('\n')
            for line in lines:
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 2:
                        ticker = parts[0].upper()
                        try:
                            weight = float(parts[1])
                            assets.append({
                                "ticker": ticker,
                                "name": ticker,
                                "weight": weight
                            })
                        except ValueError:
                            continue

        # Create portfolio
        portfolio_id = f"portfolio_{int(datetime.now().timestamp())}"
        new_portfolio = {
            "id": portfolio_id,
            "name": name,
            "description": description,
            "assets": assets,
            "createdAt": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat(),
            "totalValue": 0,
            "startingAmount": 0
        }

        # Save portfolio
        try:
            saved_id = portfolio_manager.save_portfolio(new_portfolio)
            logger.info(f"✅ Portfolio created from text with ID: {saved_id}")
        except Exception as save_error:
            logger.warning(f"⚠️ Error saving text portfolio: {save_error}")

        return {
            "portfolio": new_portfolio,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"❌ Error creating portfolio from text: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portfolio: {str(e)}"
        )


@router.post("/import-csv", status_code=status.HTTP_201_CREATED)
async def import_portfolio_from_csv(
        file: UploadFile = File(...),
        portfolio_name: Optional[str] = Form(None),
        description: Optional[str] = Form(""),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service)
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
        logger.info(f"📥 Importing portfolio from CSV: {file.filename}")

        # Read CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')

        # Simple CSV parsing
        assets = []
        lines = csv_content.strip().split('\n')

        # Skip header if exists
        data_lines = lines[1:] if len(lines) > 1 and not lines[0].replace(',', '').replace('.', '').isdigit() else lines

        for line in data_lines:
            if line.strip():
                parts = line.split(',')
                if len(parts) >= 2:
                    ticker = parts[0].strip().upper()
                    try:
                        weight = float(parts[1].strip())
                        assets.append({
                            "ticker": ticker,
                            "name": ticker,
                            "weight": weight
                        })
                    except ValueError:
                        continue

        # Create portfolio
        portfolio_id = f"portfolio_{int(datetime.now().timestamp())}"
        new_portfolio = {
            "id": portfolio_id,
            "name": portfolio_name or f"Imported_{file.filename}",
            "description": description,
            "assets": assets,
            "createdAt": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat(),
            "totalValue": 0,
            "startingAmount": 0
        }

        # Save portfolio
        try:
            saved_id = portfolio_manager.save_portfolio(new_portfolio)
            logger.info(f"✅ Portfolio imported from CSV with ID: {saved_id}")
        except Exception as save_error:
            logger.warning(f"⚠️ Error saving CSV portfolio: {save_error}")

        return {
            "portfolio": new_portfolio,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"❌ Error importing portfolio from CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import portfolio: {str(e)}"
        )