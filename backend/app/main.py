from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import importlib
import uvicorn

from backend.app.config import settings
from backend.app.api.middleware import setup_middlewares

# Setup logging
logging.config.dictConfig(settings.log_config)
logger = logging.getLogger("app")

# Create main application
app = FastAPI(
    title=settings.APP_NAME,
    description="Investment Portfolio Management System",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup middlewares
setup_middlewares(app)

# Import and mount all routers to the API
from backend.app.api.endpoints.portfolios import router as portfolios_router
from backend.app.api.endpoints.analytics import router as analytics_router
from backend.app.api.endpoints.optimization import router as optimization_router
from backend.app.api.endpoints.risk import router as risk_router
from backend.app.api.endpoints.reports import router as reports_router
from backend.app.api.endpoints.system import router as system_router
# Import other routers as needed

# Include routers
app.include_router(portfolios_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(optimization_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(system_router, prefix=settings.API_PREFIX)
# Include other routers with the same pattern

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Execute startup tasks."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")


@app.on_event("shutdown")
async def shutdown_event():
    """Execute shutdown tasks."""
    logger.info(f"Shutting down {settings.APP_NAME}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint that provides basic information about the application."""
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "api": f"{settings.API_PREFIX}",
        "docs": f"{settings.API_PREFIX}/docs" if settings.DEBUG else "Documentation is disabled in production",
        "health": f"{settings.API_PREFIX}/health"
    }


if __name__ == "__main__":
    """
    Run the application using Uvicorn when executed directly.
    """
    uvicorn.run(
        "backend.app.main:app",  # Исправлено на правильный путь к модулю
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )