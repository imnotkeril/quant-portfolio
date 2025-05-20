from typing import Any, Optional, List
from abc import ABC, abstractmethod
from datetime import timedelta


class CacheProvider(ABC):
    """Abstract interface for cache providers."""

    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """Retrieve a value from the cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found or expired
        """
        pass

    @abstractmethod
    def set(
            self,
            key: str,
            value: Any,
            expiry: Optional[timedelta] = None
    ) -> None:
        """Store a value in the cache.

        Args:
            key: Cache key
            value: Value to store
            expiry: Optional expiration time delta
        """
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete a value from the cache.

        Args:
            key: Cache key

        Returns:
            True if value was deleted, False if key not found
        """
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if a key exists in the cache and is not expired.

        Args:
            key: Cache key

        Returns:
            True if key exists and is not expired, False otherwise
        """
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear all cached values."""
        pass

    @abstractmethod
    def clear_expired(self) -> int:
        """Clear all expired cached values.

        Returns:
            Number of expired items cleared
        """
        pass

    @abstractmethod
    def get_keys(self, pattern: Optional[str] = None) -> List[str]:
        """Get all keys matching a pattern.

        Args:
            pattern: Optional pattern to match keys against

        Returns:
            List of matching keys
        """
        pass

    @abstractmethod
    def get_size(self) -> int:
        """Get the current size of the cache.

        Returns:
            Number of items in the cache
        """
        pass