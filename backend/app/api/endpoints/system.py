"""
System endpoints for the Investment Portfolio Management System.

These endpoints provide system information and health checking functionality.
"""
from fastapi import APIRouter, Request, Response
from typing import Dict, Any
import platform
import logging
from datetime import datetime
import psutil

from app.config import settings

router = APIRouter(prefix="/system", tags=["system"])
logger = logging.getLogger("app.api.system")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.

    Returns:
        Health status and basic system information.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }


@router.get("/info")
async def system_info() -> Dict[str, Any]:
    """
    System information endpoint.

    Returns:
        Detailed system information, including Python version, memory usage, etc.
    """
    try:
        mem = psutil.virtual_memory()
        return {
            "app_name": settings.APP_NAME,
            "version": settings.VERSION,
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "cpu_count": psutil.cpu_count(logical=False),
            "logical_cpu_count": psutil.cpu_count(logical=True),
            "memory": {
                "total": mem.total,
                "available": mem.available,
                "percent_used": mem.percent
            },
            "uptime": "N/A"  # Would require additional logic to track application start time
        }
    except Exception as e:
        logger.error(f"Error retrieving system info: {e}")
        return {
            "app_name": settings.APP_NAME,
            "version": settings.VERSION,
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "error": "Failed to retrieve complete system information"
        }


@router.get("/config")
async def get_config() -> Dict[str, Any]:
    """
    Configuration information endpoint.

    Returns:
        Public configuration settings.
    """
    # Return only non-sensitive settings
    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "debug_mode": settings.DEBUG,
        "api_prefix": settings.API_PREFIX,
        "default_risk_free_rate": settings.DEFAULT_RISK_FREE_RATE,
        "default_monte_carlo_simulations": settings.DEFAULT_MONTE_CARLO_SIMULATIONS,
        "default_var_confidence_level": settings.DEFAULT_VAR_CONFIDENCE_LEVEL
    }


@router.get("/ping")
async def ping() -> Dict[str, str]:
    """
    Simple ping endpoint for testing connectivity.

    Returns:
        A simple ping response.
    """
    return {"response": "pong"}


@router.get("/test-error")
async def test_error():
    """
    Endpoint to test error handling.

    Raises:
        Exception: Always raises an exception to test error handling.
    """
    logger.info("Test error endpoint called")
    raise Exception("This is a test error")