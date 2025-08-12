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


app = FastAPI(
    title=settings.APP_NAME,
    description="Professional investment portfolio management and analytics platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)

@app.get("/debug/health")
def debug_health():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "cors_origins": settings.CORS_ORIGINS,
        "debug_mode": settings.DEBUG,
        "api_prefix": settings.API_PREFIX
    }


# =============== MIDDLEWARE SETUP ===============

# CORS middleware with proper settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# =============== ROUTERS SETUP (ONLY EXISTING ONES) ===============

# Assets router
try:
    from app.api.endpoints import assets
    app.include_router(assets.router, prefix=settings.API_PREFIX, tags=["assets"])
    logger.info("✅ Assets router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Assets router not available: {e}")

# Portfolios router
try:
    from app.api.endpoints import portfolios
    app.include_router(portfolios.router, prefix=settings.API_PREFIX, tags=["portfolios"])
    logger.info("✅ Portfolios router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Portfolios router not available: {e}")

# Analytics router
try:
    from app.api.endpoints import analytics
    app.include_router(analytics.router, prefix=settings.API_PREFIX, tags=["analytics"])
    logger.info("✅ Analytics router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Analytics router not available: {e}")

# Enhanced Analytics router
try:
    from app.api.endpoints import enhanced_analytics
    app.include_router(enhanced_analytics.router, prefix=settings.API_PREFIX, tags=["enhanced-analytics"])
    logger.info("✅ Enhanced Analytics router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Enhanced Analytics router not available: {e}")

# System router
try:
    from app.api.endpoints import system
    app.include_router(system.router, prefix=settings.API_PREFIX, tags=["system"])
    logger.info("✅ System router loaded")
except ImportError as e:
    logger.warning(f"⚠️ System router not available: {e}")

# =============== PORTFOLIO ENDPOINTS (FALLBACK IMPLEMENTATION) ===============
# Keep the fallback implementation in case the router isn't loaded

@app.get("/api/v1/portfolios")
async def list_portfolios_fallback():
    """List all available portfolios - Fallback implementation"""
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
                            "assetCount": len(portfolio_data.get("assets", [])),
                            "totalValue": portfolio_data.get("totalValue", 0),
                            "assets": portfolio_data.get("assets", []),
                            "startingAmount": portfolio_data.get("startingAmount", 0)
                        })
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse portfolio {file_path}: {e}")
                except Exception as e:
                    logger.error(f"Error reading portfolio {file_path}: {e}")

        logger.info(f"📋 Found {len(portfolios)} portfolios")
        return {
            "portfolios": portfolios,
            "total": len(portfolios),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error listing portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list portfolios: {str(e)}"
        )


@app.get("/api/v1/portfolios/{portfolio_id}")
async def get_portfolio_fallback(portfolio_id: str):
    """Get a specific portfolio - Fallback implementation"""
    try:
        portfolio_file = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

        if not portfolio_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        with open(portfolio_file, 'r', encoding='utf-8') as f:
            portfolio_data = json.load(f)

        return {
            "portfolio": portfolio_data,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio: {str(e)}"
        )


@app.put("/api/v1/portfolios/{portfolio_id}")
async def update_portfolio_fallback(portfolio_id: str, portfolio_data: dict):
    """Update a portfolio - Fallback implementation"""
    try:
        portfolio_file = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

        if not portfolio_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        # Update the portfolio data
        portfolio_data["lastUpdated"] = datetime.now().isoformat()

        with open(portfolio_file, 'w', encoding='utf-8') as f:
            json.dump(portfolio_data, f, indent=2, ensure_ascii=False)

        return {
            "portfolio": portfolio_data,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update portfolio: {str(e)}"
        )


@app.delete("/api/v1/portfolios/{portfolio_id}")
async def delete_portfolio_fallback(portfolio_id: str):
    """Delete a portfolio - Fallback implementation"""
    try:
        portfolio_file = Path(settings.PORTFOLIO_DIR) / f"{portfolio_id}.json"

        if not portfolio_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

        portfolio_file.unlink()

        return {
            "message": f"Portfolio {portfolio_id} deleted successfully",
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete portfolio: {str(e)}"
        )


# =============== HEALTH AND DEBUG ENDPOINTS ===============

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "backend",
        "version": settings.VERSION,
        "config": {
            "debug": settings.DEBUG,
            "endpoints_available": ENDPOINTS_AVAILABLE,
            "directories": {
                "cache": "accessible" if Path(settings.CACHE_DIR).exists() else "missing",
                "portfolios": "accessible" if Path(settings.PORTFOLIO_DIR).exists() else "missing",
                "storage": "accessible" if Path(settings.STORAGE_DIR).exists() else "missing",
                "reports": "accessible" if Path(settings.REPORTS_DIR).exists() else "missing"
            },
            "alpha_vantage_configured": bool(settings.ALPHA_VANTAGE_API_KEY),
            "api_prefix": settings.API_PREFIX
        },
        "services": {
            "cache": True,
            "file_storage": True,
            "data_fetcher": True,
            "api_keys": {
                "alpha_vantage": bool(settings.ALPHA_VANTAGE_API_KEY)
            }
        },
        "uptime": app_health_status,
        "features": {
            "portfolios": True,
            "analytics": True,
            "optimization": False,  # Not implemented yet
            "risk_management": False,  # Not implemented yet
            "real_time_data": bool(settings.ALPHA_VANTAGE_API_KEY)
        }
    }


# =============== EXCEPTION HANDLERS ===============

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle internal server errors"""
    logger.error(f"Internal server error on {request.url}: {str(exc)}")
    logger.error(traceback.format_exc())

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "status_code": 500,
            "path": str(request.url.path)
        }
    )


# =============== STARTUP MESSAGE ===============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )