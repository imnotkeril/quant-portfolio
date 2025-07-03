"""
Main FastAPI application module.
"""
import logging
import json
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.api.dependencies import validate_services_health

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Feature flags
ENDPOINTS_AVAILABLE = True

# Global health status
app_health_status = {
    "startup_time": None,
    "services_healthy": False,
    "api_keys_configured": False,
    "last_health_check": None
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    startup_time = datetime.now()
    app_health_status["startup_time"] = startup_time.isoformat()

    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"📍 Environment: {'Development' if settings.DEBUG else 'Production'}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")

    # Validate services health
    try:
        health_status = validate_services_health()
        app_health_status["services_healthy"] = all([
            health_status["cache"],
            health_status["file_storage"],
            health_status["data_fetcher"]
        ])
        app_health_status["api_keys_configured"] = health_status["api_keys"]["alpha_vantage"]
        app_health_status["last_health_check"] = datetime.now().isoformat()

        if app_health_status["services_healthy"]:
            logger.info("✅ All core services initialized successfully")
        else:
            logger.warning("⚠️  Some services failed initialization")

        if app_health_status["api_keys_configured"]:
            logger.info("🔑 Alpha Vantage API key configured")
        else:
            logger.warning("⚠️  Alpha Vantage API key not configured - limited functionality")

    except Exception as e:
        logger.error(f"❌ Service validation failed: {e}")
        app_health_status["services_healthy"] = False

    # Create required directories
    try:
        for directory in [settings.CACHE_DIR, settings.PORTFOLIO_DIR, settings.STORAGE_DIR, settings.REPORTS_DIR]:
            Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info("📁 Required directories created/verified")
    except Exception as e:
        logger.error(f"❌ Failed to create directories: {e}")

    logger.info(f"🎯 API available at: http://localhost:8000{settings.API_PREFIX}")
    logger.info(f"📖 API docs at: http://localhost:8000/docs")

    yield

    # Shutdown
    logger.info("🛑 Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Professional investment portfolio management and analytics platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers - только если файлы существуют
try:
    from app.api.endpoints import assets
    app.include_router(assets.router, prefix=settings.API_PREFIX, tags=["assets"])
    logger.info("✅ Assets router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Assets router not available: {e}")

try:
    from app.api.endpoints import portfolios
    app.include_router(portfolios.router, prefix=settings.API_PREFIX, tags=["portfolios"])
    logger.info("✅ Portfolios router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Portfolios router not available: {e}")

try:
    from app.api.endpoints import analytics
    app.include_router(analytics.router, prefix=settings.API_PREFIX, tags=["analytics"])
    logger.info("✅ Analytics router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Analytics router not available: {e}")

# =============== PORTFOLIO ENDPOINTS (BASIC IMPLEMENTATION) ===============

@app.get("/api/v1/portfolios")
async def list_portfolios():
    """List all available portfolios"""
    try:
        portfolios = []
        portfolio_dir = Path(settings.PORTFOLIO_DIR)

        if portfolio_dir.exists():
            for file_path in portfolio_dir.glob("*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        portfolio_data = json.load(f)
                        portfolios.append({
                            "id": file_path.stem,
                            "name": portfolio_data.get("name", file_path.stem),
                            "description": portfolio_data.get("description", ""),
                            "createdAt": portfolio_data.get("createdAt", datetime.now().isoformat()),
                            "lastUpdated": portfolio_data.get("lastUpdated", datetime.now().isoformat()),
                            "assetsCount": len(portfolio_data.get("assets", [])),
                            "totalValue": portfolio_data.get("totalValue", 0)
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


@app.post("/api/v1/portfolios")
async def create_portfolio(portfolio_data: Dict[str, Any]):
    """Create a new portfolio"""
    try:
        # Generate portfolio ID
        portfolio_id = portfolio_data.get("id") or f"portfolio_{int(datetime.now().timestamp())}"

        # Add metadata
        portfolio_data.update({
            "id": portfolio_id,
            "createdAt": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat()
        })

        # Save to file
        file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(portfolio_data, f, indent=2, ensure_ascii=False)

        logger.info(f"💾 Portfolio created: ID {portfolio_id}")
        return {
            "message": "Portfolio created successfully",
            "id": portfolio_id,
            "portfolio": portfolio_data
        }
    except Exception as e:
        logger.error(f"Error creating portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/portfolios/{portfolio_id}")
async def get_portfolio(portfolio_id: str):
    """Get a specific portfolio by ID"""
    try:
        file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Portfolio not found")

        with open(file_path, 'r', encoding='utf-8') as f:
            portfolio_data = json.load(f)

        logger.info(f"📖 Portfolio retrieved: ID {portfolio_id}")
        return portfolio_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving portfolio {portfolio_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/v1/portfolios/{portfolio_id}")
async def update_portfolio(portfolio_id: str, portfolio_data: Dict[str, Any]):
    """Update an existing portfolio"""
    try:
        file_path = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Portfolio not found")

        # Update metadata
        portfolio_data.update({
            "id": portfolio_id,
            "lastUpdated": datetime.now().isoformat()
        })

        # Save updated data
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(portfolio_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✏️  Portfolio updated: ID {portfolio_id}")
        return {
            "message": "Portfolio updated successfully",
            "id": portfolio_id,
            "portfolio": portfolio_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating portfolio {portfolio_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/portfolios/{portfolio_id}")
async def delete_portfolio(portfolio_id: str):
    """Delete a portfolio"""
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
        # Update health status
        health_status = validate_services_health()
        app_health_status["services_healthy"] = all([
            health_status["cache"],
            health_status["file_storage"],
            health_status["data_fetcher"]
        ])
        app_health_status["api_keys_configured"] = health_status["api_keys"]["alpha_vantage"]
        app_health_status["last_health_check"] = datetime.now().isoformat()

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
            "status": "healthy" if app_health_status["services_healthy"] else "degraded",
            "timestamp": datetime.now().isoformat(),
            "service": "backend",
            "version": settings.VERSION,
            "config": {
                "debug": settings.DEBUG,
                "endpoints_available": ENDPOINTS_AVAILABLE,
                "directories": dir_status,
                "alpha_vantage_configured": app_health_status["api_keys_configured"],
                "api_prefix": settings.API_PREFIX
            },
            "services": health_status,
            "uptime": app_health_status,
            "features": {
                "portfolios": True,
                "analytics": ENDPOINTS_AVAILABLE,
                "optimization": ENDPOINTS_AVAILABLE,
                "risk_management": ENDPOINTS_AVAILABLE,
                "real_time_data": app_health_status["api_keys_configured"]
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
            "real_time": app_health_status["api_keys_configured"]
        },
        "api_docs": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "startup_info": app_health_status
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
            "path": str(request.url.path),
            "available_endpoints": [
                "/api/v1/health",
                "/api/v1/system/info",
                "/api/v1/portfolios",
                "/api/v1/assets/search",
                "/api/v1/analytics",
                "/docs"
            ]
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
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url.path),
            "status_code": exc.status_code
        }
    )

# =============== DEVELOPMENT HELPERS ===============

if settings.DEBUG:
    @app.get("/api/v1/debug/clear-cache")
    async def clear_cache():
        """Debug endpoint to clear cache (only in development)"""
        try:
            from app.api.dependencies import get_cache_service
            cache_service = get_cache_service()
            cache_service.clear()
            return {"message": "Cache cleared successfully"}
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/v1/debug/services")
    async def debug_services():
        """Debug endpoint to check service status (only in development)"""
        return validate_services_health()

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )