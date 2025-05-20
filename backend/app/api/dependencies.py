from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, Callable, Any
import jwt
from datetime import datetime, timedelta
from pydantic import ValidationError

from backend.app.config import settings
from backend.app.infrastructure.data.data_fetcher import DataFetcherService
from backend.app.infrastructure.data.portfolio_manager import PortfolioManagerService
from backend.app.infrastructure.storage.file_storage import FileStorageService
from backend.app.infrastructure.cache.memory_cache import MemoryCacheService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")


# Core services
def get_data_fetcher_service() -> DataFetcherService:
    """
    Dependency for getting a DataFetcherService instance.

    This service handles fetching data from external sources such as Yahoo Finance and Alpha Vantage.
    """
    cache_service = get_cache_service()
    return DataFetcherService(
        cache_provider=cache_service,
        cache_expiry_days=settings.CACHE_EXPIRY_DAYS
    )


def get_file_storage_service() -> FileStorageService:
    """
    Dependency for getting a FileStorageService instance.

    This service handles file storage operations.
    """
    return FileStorageService(storage_dir=settings.STORAGE_DIR)

def get_portfolio_manager_service(
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service),
        storage_service: FileStorageService = Depends(get_file_storage_service)
) -> PortfolioManagerService:
    """
    Dependency for getting a PortfolioManagerService instance.

    This service handles portfolio storage, loading, and management operations.
    """
    return PortfolioManagerService(
        data_fetcher=data_fetcher,
        storage_service=storage_service
    )


# Infrastructure services
def get_file_storage_service() -> FileStorageService:
    """
    Dependency for getting a FileStorageService instance.

    This service handles file storage operations like saving and loading portfolios, reports, etc.
    """
    return FileStorageService(storage_dir=settings.STORAGE_DIR)


def get_cache_service() -> MemoryCacheService:
    """
    Dependency for getting a MemoryCacheService instance.

    This service provides in-memory caching for improved performance.
    """
    return MemoryCacheService(default_expiry=settings.CACHE_DEFAULT_EXPIRY)


# Authentication and security
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency for getting the currently authenticated user from the JWT token.

    This function validates the token and returns the user information if valid.
    """
    # Define the token exception
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Extract user info from token
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

        # Check if token has expired
        exp = payload.get("exp")
        if exp is None or datetime.utcnow() > datetime.fromtimestamp(exp):
            raise credentials_exception

        return {"username": username, "permissions": payload.get("permissions", [])}

    except (jwt.PyJWTError, ValidationError):
        raise credentials_exception


def has_permission(required_permission: str) -> Callable:
    """
    Factory for creating a dependency that checks if a user has a specific permission.

    Args:
        required_permission: The permission needed to access the resource

    Returns:
        A dependency function that validates the permission
    """

    def permission_checker(user: dict = Depends(get_current_user)) -> dict:
        """
        Dependency that checks if the current user has the required permission.

        Args:
            user: The authenticated user

        Returns:
            The user if they have the permission

        Raises:
            HTTPException: If the user lacks the required permission
        """
        permissions = user.get("permissions", [])
        if required_permission in permissions:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return permission_checker


# Combine common dependencies
def get_portfolio_dependencies(
        data_fetcher: DataFetcherService = Depends(get_data_fetcher_service),
        portfolio_manager: PortfolioManagerService = Depends(get_portfolio_manager_service),
        cache_service: MemoryCacheService = Depends(get_cache_service)
) -> dict:
    """
    Combines common dependencies for portfolio-related endpoints.

    This helps avoid repeating the same dependencies across multiple endpoints.
    """
    return {
        "data_fetcher": data_fetcher,
        "portfolio_manager": portfolio_manager,
        "cache_service": cache_service
    }