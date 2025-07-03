"""
Investment Portfolio Management System - FastAPI Backend
Main application entry point - ИСПРАВЛЕННАЯ ВЕРСИЯ
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any
import os
import logging
from datetime import datetime
from pathlib import Path

# Import configurations and services
from .config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Import API routers - with fallback for development
ENDPOINTS_AVAILABLE = False
try:
    from app.api.endpoints import portfolios, analytics
    from app.api.middleware import setup_middlewares
    ENDPOINTS_AVAILABLE = True
    logger.info("✅ Full API endpoints loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️  API endpoints not fully implemented yet: {e}")
    logger.info("🔄 Using temporary working endpoints")

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Advanced Quantitative Portfolio Analytics Platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    debug=settings.DEBUG
)

# =============== MIDDLEWARE SETUP ===============

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add other middleware if available
if ENDPOINTS_AVAILABLE:
    try:
        setup_middlewares(app)
        logger.info("✅ Middleware setup completed")
    except Exception as e:
        logger.warning(f"⚠️  Middleware setup failed: {e}")

# =============== API ENDPOINTS ===============

if ENDPOINTS_AVAILABLE:
    # Include real routers when available
    app.include_router(portfolios.router, prefix="/api/v1", tags=["portfolios"])
    app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
    logger.info("✅ Real API routers included")
else:
    # Temporary working endpoints until full implementation is ready
    logger.info("🔄 Setting up temporary working endpoints")

    @app.get("/api/v1/portfolios")
    async def list_portfolios():
        """Temporary working portfolio list endpoint"""
        try:
            portfolios_dir = Path(settings.PORTFOLIO_DIR)
            portfolios_dir.mkdir(parents=True, exist_ok=True)

            portfolio_files = list(portfolios_dir.glob("*.json"))
            portfolios = []

            for file_path in portfolio_files:
                try:
                    import json
                    with open(file_path, 'r', encoding='utf-8') as f:
                        portfolio_data = json.load(f)
                        portfolios.append({
                            "id": portfolio_data.get("id", file_path.stem),
                            "name": portfolio_data.get("name", file_path.stem),
                            "description": portfolio_data.get("description"),
                            "assetCount": len(portfolio_data.get("assets", [])),
                            "tags": portfolio_data.get("tags", []),
                            "lastUpdated": portfolio_data.get("lastUpdated", datetime.now().isoformat())
                        })
                except Exception as e:
                    logger.error(f"Error reading portfolio file {file_path}: {e}")
                    continue

            logger.info(f"📋 Found {len(portfolios)} portfolios")
            return {
                "portfolios": portfolios,
                "total": len(portfolios),
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Error listing portfolios: {e}")
            raise HTTPException(status_code=500, detail=str(e))


    # В секции временных endpoints (после строки ~95), добавьте:

    @app.get("/api/v1/assets/search")
    async def search_assets_temp(query: str, limit: int = 10):
        """Temporary working asset search endpoint"""
        try:
            # Импортируем здесь чтобы избежать проблем на старте
            from backend.app.infrastructure.data.data_fetcher import DataFetcherService
            from backend.app.infrastructure.cache.memory_cache import MemoryCacheProvider

            # Создаем сервисы
            cache_provider = MemoryCacheProvider()
            data_fetcher = DataFetcherService(cache_provider)

            # Выполняем поиск
            results = data_fetcher.search_tickers(query, limit)

            logger.info(f"🔍 Asset search for '{query}' returned {len(results)} results")
            return results

        except Exception as e:
            logger.error(f"❌ Asset search error: {e}")

            # Fallback - возвращаем популярные активы
            popular_assets = [
                {"ticker": "AAPL", "name": "Apple Inc.", "asset_type": "Equity", "exchange": "NASDAQ",
                 "currency": "USD"},
                {"ticker": "MSFT", "name": "Microsoft Corporation", "asset_type": "Equity", "exchange": "NASDAQ",
                 "currency": "USD"},
                {"ticker": "GOOGL", "name": "Alphabet Inc.", "asset_type": "Equity", "exchange": "NASDAQ",
                 "currency": "USD"},
                {"ticker": "AMZN", "name": "Amazon.com Inc.", "asset_type": "Equity", "exchange": "NASDAQ",
                 "currency": "USD"},
                {"ticker": "TSLA", "name": "Tesla Inc.", "asset_type": "Equity", "exchange": "NASDAQ",
                 "currency": "USD"}
            ]

            # Фильтруем по запросу
            if query:
                query_lower = query.lower()
                filtered = [asset for asset in popular_assets
                            if query_lower in asset["ticker"].lower() or query_lower in asset["name"].lower()]
                return filtered[:limit] if filtered else popular_assets[:3]

            return popular_assets[:limit]

    @app.post("/api/v1/portfolios")
    async def create_portfolio(portfolio_data: Dict[str, Any]):
        """Temporary working portfolio creation endpoint"""
        try:
            import json
            import uuid

            # Validate required fields
            if not portfolio_data.get("name"):
                raise HTTPException(status_code=400, detail="Portfolio name is required")

            # Generate portfolio ID
            portfolio_id = str(uuid.uuid4())

            # Prepare portfolio data
            portfolio = {
                "id": portfolio_id,
                "name": portfolio_data.get("name"),
                "description": portfolio_data.get("description", ""),
                "assets": portfolio_data.get("assets", []),
                "tags": portfolio_data.get("tags", []),
                "created": datetime.now().isoformat(),
                "lastUpdated": datetime.now().isoformat()
            }

            # Validate and normalize assets
            if "assets" in portfolio_data and portfolio_data["assets"]:
                total_weight = 0
                valid_assets = []

                for asset in portfolio_data["assets"]:
                    if not asset.get("ticker"):
                        continue

                    # Clean asset data
                    clean_asset = {
                        "ticker": asset["ticker"].upper().strip(),
                        "name": asset.get("name", asset["ticker"]),
                        "weight": float(asset.get("weight", 0)),
                        "quantity": asset.get("quantity"),
                        "purchasePrice": asset.get("purchasePrice"),
                        "currentPrice": asset.get("currentPrice"),
                        "sector": asset.get("sector"),
                        "industry": asset.get("industry")
                    }

                    valid_assets.append(clean_asset)
                    total_weight += clean_asset["weight"]

                # Normalize weights if needed
                if total_weight > 0 and abs(total_weight - 1.0) > 0.001:
                    for asset in valid_assets:
                        asset["weight"] = asset["weight"] / total_weight

                portfolio["assets"] = valid_assets

            # Save to file
            portfolios_dir = Path(settings.PORTFOLIO_DIR)
            portfolios_dir.mkdir(parents=True, exist_ok=True)

            file_path = portfolios_dir / f"{portfolio_id}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(portfolio, f, indent=2, ensure_ascii=False)

            logger.info(f"✅ Portfolio created: {portfolio['name']} (ID: {portfolio_id})")

            return {
                "id": portfolio_id,
                "name": portfolio["name"],
                "description": portfolio["description"],
                "assets": portfolio["assets"],
                "tags": portfolio["tags"],
                "created": portfolio["created"],
                "lastUpdated": portfolio["lastUpdated"],
                "totalValue": 0,
                "status": "created"
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating portfolio: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create portfolio: {str(e)}")

    @app.get("/api/v1/portfolios/{portfolio_id}")
    async def get_portfolio(portfolio_id: str):
        """Get specific portfolio by ID"""
        try:
            import json

            file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

            if not file_path.exists():
                raise HTTPException(status_code=404, detail="Portfolio not found")

            with open(file_path, 'r', encoding='utf-8') as f:
                portfolio = json.load(f)

            logger.info(f"📖 Portfolio retrieved: {portfolio.get('name')} (ID: {portfolio_id})")
            return portfolio

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting portfolio {portfolio_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.put("/api/v1/portfolios/{portfolio_id}")
    async def update_portfolio(portfolio_id: str, portfolio_data: Dict[str, Any]):
        """Update existing portfolio"""
        try:
            import json

            file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

            if not file_path.exists():
                raise HTTPException(status_code=404, detail="Portfolio not found")

            # Load existing portfolio
            with open(file_path, 'r', encoding='utf-8') as f:
                existing_portfolio = json.load(f)

            # Update fields
            existing_portfolio.update({
                "name": portfolio_data.get("name", existing_portfolio["name"]),
                "description": portfolio_data.get("description", existing_portfolio["description"]),
                "tags": portfolio_data.get("tags", existing_portfolio["tags"]),
                "lastUpdated": datetime.now().isoformat()
            })

            # Update assets if provided
            if "assets" in portfolio_data:
                existing_portfolio["assets"] = portfolio_data["assets"]

            # Save updated portfolio
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(existing_portfolio, f, indent=2, ensure_ascii=False)

            logger.info(f"✅ Portfolio updated: {existing_portfolio['name']} (ID: {portfolio_id})")
            return existing_portfolio

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating portfolio {portfolio_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.delete("/api/v1/portfolios/{portfolio_id}")
    async def delete_portfolio(portfolio_id: str):
        """Delete portfolio"""
        try:
            file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

            if not file_path.exists():
                raise HTTPException(status_code=404, detail="Portfolio not found")

            file_path.unlink()
            logger.info(f"🗑️  Portfolio deleted: ID {portfolio_id}")

            return {"message": "Portfolio deleted successfully", "id": portfolio_id}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting portfolio {portfolio_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# =============== SYSTEM ENDPOINTS ===============

@app.get("/")
async def root():
    return {
        "message": "Investment Portfolio Management System API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/v1/health",
        "endpoints_available": ENDPOINTS_AVAILABLE,
        "version": settings.VERSION
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check directory access
        directories = {
            "cache": settings.CACHE_DIR,
            "portfolios": settings.PORTFOLIO_DIR,
            "storage": settings.STORAGE_DIR,
            "reports": settings.REPORTS_DIR
        }

        dir_status = {}
        for name, path in directories.items():
            try:
                Path(path).mkdir(parents=True, exist_ok=True)
                dir_status[name] = "accessible"
            except Exception as e:
                dir_status[name] = f"error: {str(e)}"

        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "backend",
            "version": settings.VERSION,
            "config": {
                "debug": settings.DEBUG,
                "endpoints_available": ENDPOINTS_AVAILABLE,
                "directories": dir_status,
                "alpha_vantage_configured": bool(settings.ALPHA_VANTAGE_API_KEY and settings.ALPHA_VANTAGE_API_KEY != "demo"),
                "features": {
                    "portfolios": True,
                    "analytics": ENDPOINTS_AVAILABLE,
                    "optimization": ENDPOINTS_AVAILABLE,
                    "risk_management": ENDPOINTS_AVAILABLE,
                    "real_time_data": bool(settings.ALPHA_VANTAGE_API_KEY and settings.ALPHA_VANTAGE_API_KEY != "demo")
                }
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
        )

@app.get("/api/v1/system/info")
async def system_info():
    """System information endpoint"""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "python_version": "3.10+",
        "framework": "FastAPI",
        "environment": "development" if settings.DEBUG else "production",
        "features": {
            "portfolios": True,
            "analytics": ENDPOINTS_AVAILABLE,
            "optimization": ENDPOINTS_AVAILABLE,
            "risk_management": ENDPOINTS_AVAILABLE,
            "scenarios": ENDPOINTS_AVAILABLE,
            "reports": ENDPOINTS_AVAILABLE,
            "real_time": bool(settings.ALPHA_VANTAGE_API_KEY and settings.ALPHA_VANTAGE_API_KEY != "demo")
        },
        "api_docs": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }

# =============== ERROR HANDLERS ===============

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "message": "Endpoint not found",
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "status": "error",
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    logger.warning(f"Validation error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "details": str(exc)
        }
    )

# =============== STARTUP/SHUTDOWN EVENTS ===============

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    try:
        # Create necessary directories
        directories = [
            settings.CACHE_DIR,
            settings.PORTFOLIO_DIR,
            settings.STORAGE_DIR,
            settings.REPORTS_DIR,
            settings.TEMPLATES_DIR
        ]

        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)

        logger.info(f"🚀 {settings.APP_NAME} v{settings.VERSION} started successfully")
        logger.info(f"📁 Directories initialized: {[str(d) for d in directories]}")
        logger.info(f"🔑 Alpha Vantage API: {'Configured' if settings.ALPHA_VANTAGE_API_KEY and settings.ALPHA_VANTAGE_API_KEY != 'demo' else 'Not configured (using demo)'}")
        logger.info(f"🔧 Debug mode: {settings.DEBUG}")
        logger.info(f"🌐 CORS origins: {settings.CORS_ORIGINS}")
        logger.info(f"📊 Full endpoints available: {ENDPOINTS_AVAILABLE}")

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Application shutting down...")

# =============== DEVELOPMENT SERVER ===============

if __name__ == "__main__":
    logger.info(f"🔥 Starting {settings.APP_NAME} in development mode...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )