"""
In-memory cache implementation for efficient data retrieval.
"""
import time
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Pattern, Tuple, Set

from app.core.interfaces.cache_provider import CacheProvider


class MemoryCacheService(CacheProvider):
    """
    In-memory cache service implementation.
    Implements the CacheProvider interface.
    """

    def __init__(self, default_expiry: int = 86400, max_size: Optional[int] = None):
        """
        Initialize the memory cache service

        Args:
            default_expiry: Default cache expiry time in seconds (default: 1 day)
            max_size: Maximum number of items in cache (default: None = unlimited)
        """
        self.cache: Dict[str, Tuple[Any, float]] = {}  # {key: (value, expiry_timestamp)}
        self.default_expiry = default_expiry
        self.max_size = max_size
        self.access_count: Dict[str, int] = {}  # Track access frequency for eviction policy

        logging.info(f"Initialized MemoryCacheService with default expiry: {default_expiry}s")

    def get(self, key: str) -> Any:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if key not found or expired
        """
        # Check if key exists
        if key not in self.cache:
            return None

        value, expiry_time = self.cache[key]

        # Check if value is expired
        if time.time() > expiry_time:
            # Remove expired value
            self.delete(key)
            return None

        # Update access count
        self.access_count[key] = self.access_count.get(key, 0) + 1

        logging.debug(f"Cache hit for key: {key}")
        return value

    def set(self, key: str, value: Any, expiry: Optional[timedelta] = None) -> None:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            expiry: Expiry time as timedelta (if None, use default)
        """
        # Convert timedelta to seconds if provided
        if expiry is not None:
            expiry_seconds = int(expiry.total_seconds())
        else:
            expiry_seconds = self.default_expiry

        # Calculate expiry timestamp
        expiry_timestamp = time.time() + expiry_seconds

        # Check if we need to evict items due to max_size
        if self.max_size is not None and len(self.cache) >= self.max_size:
            self._evict_least_accessed()

        # Store the value
        self.cache[key] = (value, expiry_timestamp)
        self.access_count[key] = 1

        logging.debug(f"Cache set for key: {key}, expires in {expiry_seconds}s")

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if value was deleted, False if key not found
        """
        if key in self.cache:
            del self.cache[key]
            if key in self.access_count:
                del self.access_count[key]
            logging.debug(f"Cache deleted for key: {key}")
            return True
        return False

    def exists(self, key: str) -> bool:
        """
        Check if a key exists in the cache and is not expired

        Args:
            key: Cache key

        Returns:
            True if key exists and is not expired, False otherwise
        """
        if key not in self.cache:
            return False

        _, expiry_time = self.cache[key]

        # Check if expired
        if time.time() > expiry_time:
            self.delete(key)
            return False

        return True

    def clear(self) -> None:
        """Clear all cached values"""
        self.cache.clear()
        self.access_count.clear()
        logging.info("Cache cleared")

    def clear_expired(self) -> int:
        """
        Clear all expired cached values

        Returns:
            Number of expired items cleared
        """
        current_time = time.time()
        expired_keys = []

        for key, (_, expiry_time) in self.cache.items():
            if current_time > expiry_time:
                expired_keys.append(key)

        for key in expired_keys:
            self.delete(key)

        logging.info(f"Cleared {len(expired_keys)} expired cache entries")
        return len(expired_keys)

    def get_keys(self, pattern: Optional[str] = None) -> List[str]:
        """
        Get all keys matching a pattern

        Args:
            pattern: Optional pattern to match keys against (regex)

        Returns:
            List of matching keys
        """
        # First clean up expired keys
        self.clear_expired()

        if pattern is None:
            return list(self.cache.keys())

        try:
            regex_pattern = re.compile(pattern)
            return [key for key in self.cache.keys() if regex_pattern.match(key)]
        except re.error:
            logging.warning(f"Invalid regex pattern: {pattern}")
            return list(self.cache.keys())

    def get_size(self) -> int:
        """
        Get the current size of the cache

        Returns:
            Number of items in the cache
        """
        return len(self.cache)

    def get_memory_usage(self) -> Dict[str, Any]:
        """
        Get memory usage statistics

        Returns:
            Dictionary with memory usage info
        """
        import sys

        total_size = 0
        for key, (value, _) in self.cache.items():
            total_size += sys.getsizeof(key) + sys.getsizeof(value)

        return {
            "total_keys": len(self.cache),
            "total_size_bytes": total_size,
            "average_size_per_key": total_size / len(self.cache) if self.cache else 0,
            "max_size_limit": self.max_size
        }

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache statistics
        """
        current_time = time.time()
        expired_count = 0

        for _, (_, expiry_time) in self.cache.items():
            if current_time > expiry_time:
                expired_count += 1

        return {
            "total_keys": len(self.cache),
            "expired_keys": expired_count,
            "valid_keys": len(self.cache) - expired_count,
            "memory_usage": self.get_memory_usage(),
            "most_accessed_keys": self._get_most_accessed_keys(10)
        }

    def _evict_least_accessed(self) -> None:
        """Evict the least accessed item from cache"""
        if not self.cache:
            return

        # Find the key with minimum access count
        least_accessed_key = min(self.access_count, key=self.access_count.get)
        self.delete(least_accessed_key)
        logging.debug(f"Evicted least accessed key: {least_accessed_key}")

    def _get_most_accessed_keys(self, limit: int = 10) -> List[Tuple[str, int]]:
        """
        Get the most accessed keys

        Args:
            limit: Maximum number of keys to return

        Returns:
            List of tuples (key, access_count)
        """
        sorted_keys = sorted(
            self.access_count.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_keys[:limit]

    # Additional convenience methods
    def set_with_seconds(self, key: str, value: Any, expiry_seconds: Optional[int] = None) -> None:
        """
        Set value in cache with expiry in seconds (convenience method)

        Args:
            key: Cache key
            value: Value to cache
            expiry_seconds: Expiry time in seconds (if None, use default)
        """
        if expiry_seconds is not None:
            expiry = timedelta(seconds=expiry_seconds)
        else:
            expiry = None
        self.set(key, value, expiry)

    def increment(self, key: str, amount: int = 1, default: int = 0, expiry: Optional[timedelta] = None) -> int:
        """
        Increment a numeric value in cache

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