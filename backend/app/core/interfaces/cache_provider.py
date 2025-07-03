from typing import Any, Optional, List, Dict, Tuple
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

    # Optional methods that can be overridden by implementations
    def get_statistics(self) -> Dict[str, Any]:
        """Get cache statistics.

        Returns:
            Dictionary with cache statistics
        """
        return {
            "total_keys": self.get_size(),
            "implementation": self.__class__.__name__
        }

    def get_memory_usage(self) -> Dict[str, Any]:
        """Get memory usage information.

        Returns:
            Dictionary with memory usage info
        """
        return {
            "total_keys": self.get_size(),
            "implementation": self.__class__.__name__
        }

    def increment(self, key: str, amount: int = 1, default: int = 0, expiry: Optional[timedelta] = None) -> int:
        """Increment a numeric value in cache.

        Args:
            key: Cache key
            amount: Amount to increment
            default: Default value if key doesn't exist
            expiry: Expiry time

        Returns:
            New value after increment
        """
        current_value = self.get(key)
        if current_value is None:
            new_value = default + amount
        else:
            try:
                new_value = int(current_value) + amount
            except (ValueError, TypeError):
                new_value = default + amount

        self.set(key, new_value, expiry)
        return new_value

    def get_multi(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache.

        Args:
            keys: List of cache keys

        Returns:
            Dictionary mapping keys to values (only includes found keys)
        """
        result = {}
        for key in keys:
            value = self.get(key)
            if value is not None:
                result[key] = value
        return result

    def set_multi(self, mapping: Dict[str, Any], expiry: Optional[timedelta] = None) -> None:
        """Set multiple values in cache.

        Args:
            mapping: Dictionary mapping keys to values
            expiry: Optional expiration time delta for all values
        """
        for key, value in mapping.items():
            self.set(key, value, expiry)

    def delete_multi(self, keys: List[str]) -> int:
        """Delete multiple values from cache.

        Args:
            keys: List of cache keys to delete

        Returns:
            Number of keys that were actually deleted
        """
        deleted_count = 0
        for key in keys:
            if self.delete(key):
                deleted_count += 1
        return deleted_count

    def touch(self, key: str, expiry: Optional[timedelta] = None) -> bool:
        """Update the expiration time of a key without changing its value.

        Args:
            key: Cache key
            expiry: New expiration time delta

        Returns:
            True if key was found and touched, False otherwise
        """
        value = self.get(key)
        if value is not None:
            self.set(key, value, expiry)
            return True
        return False

    def get_ttl(self, key: str) -> Optional[int]:
        """Get the time-to-live for a key in seconds.

        Args:
            key: Cache key

        Returns:
            TTL in seconds, or None if key doesn't exist or has no expiration
        """
        # Default implementation - subclasses should override if they can provide TTL
        return None if not self.exists(key) else -1

    def expire(self, key: str, expiry: timedelta) -> bool:
        """Set a new expiration time for an existing key.

        Args:
            key: Cache key
            expiry: New expiration time delta

        Returns:
            True if key was found and expiration was set, False otherwise
        """
        return self.touch(key, expiry)