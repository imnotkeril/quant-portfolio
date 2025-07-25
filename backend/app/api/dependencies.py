from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, Callable, Any
import jwt
from datetime import datetime, timedelta
from pydantic import ValidationError

from app.config import settings
from app.infrastructure.data.data_fetcher import DataFetcherService
from app.infrastructure.data.portfolio_manager import PortfolioManagerService
from app.infrastructure.storage.json_storage import JsonStorageService  # Changed from file_storage to json_storage
from app.infrastructure.cache.memory_cache import MemoryCacheService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")

# Global instances for singleton pattern
_cache_service_instance = None
_storage_service_instance = None
_data_fetcher_instance = None


# Infrastructure services (определяем сначала базовые сервисы)
def get_cache_service() -> MemoryCacheService:
    """
    Dependency for getting a MemoryCacheService instance (singleton).

    This service provides in-memory caching for improved performance.
    """
    global _cache_service_instance
    if _cache_service_instance is None:
        _cache_service_instance = MemoryCacheService(default_expiry=settings.CACHE_DEFAULT_EXPIRY)
    return _cache_service_instance


def get_file_storage_service() -> JsonStorageService:  # Changed return type
    """
    Dependency for getting a JsonStorageService instance (singleton).
    """
    global _storage_service_instance
    if _storage_service_instance is None:
        _storage_service_instance = JsonStorageService(str(settings.PORTFOLIO_DIR.parent))
    return _storage_service_instance


# Core services (определяем после базовых)
def get_data_fetcher_service() -> DataFetcherService:
    """
    Dependency for getting a DataFetcherService instance (singleton).

    This service handles fetching data from external sources such as Yahoo Finance and Alpha Vantage.
    """
    global _data_fetcher_instance
    if _data_fetcher_instance is None:
        cache_service = get_cache_service()
        _data_fetcher_instance = DataFetcherService(
            cache_provider=cache_service,
            cache_expiry_days=settings.CACHE_EXPIRY_DAYS
        )
    return _data_fetcher_instance


def get_portfolio_manager_service(
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service),
        storage_service: JsonStorageService = Depends(get_file_storage_service)  # Changed type hint
) -> PortfolioManagerService:
    """
    Dependency for getting a PortfolioManagerService instance.
    """
    return PortfolioManagerService(
        data_provider=data_fetcher,
        storage_provider=storage_service
    )


# Authentication and security
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency for getting the currently authenticated user from the JWT token.

    This function validates the token and returns the user information if valid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Optional authentication (returns None if no token)
def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    """
    Dependency for getting the currently authenticated user from the JWT token.
    Returns None if no token is provided or if the token is invalid.
    """
    if token is None:
        return None

    try:
        return get_current_user(token)
    except HTTPException:
        return None


# Service validation
def validate_services_health() -> dict:
    """
    Validate that all core services are healthy and accessible.
    """
    health_status = {
        "cache": False,
        "file_storage": False,
        "data_fetcher": False,
        "api_keys": {
            "alpha_vantage": False
        }
    }

    try:
        # Test cache service
        cache_service = get_cache_service()
        cache_service.set("health_check", "ok", timedelta(seconds=60))
        if cache_service.get("health_check") == "ok":
            health_status["cache"] = True
        cache_service.delete("health_check")
    except Exception as e:
        print(f"Cache service health check failed: {e}")

    try:
        # Test file storage service
        storage_service = get_file_storage_service()
        health_status["file_storage"] = True
    except Exception as e:
        print(f"File storage service health check failed: {e}")

    try:
        # Test data fetcher service
        data_fetcher = get_data_fetcher_service()
        health_status["data_fetcher"] = True

        # Check API keys
        if hasattr(data_fetcher, 'api_keys'):
            if data_fetcher.api_keys.get('alpha_vantage'):
                health_status["api_keys"]["alpha_vantage"] = True

    except Exception as e:
        print(f"Data fetcher service health check failed: {e}")

    return health_status