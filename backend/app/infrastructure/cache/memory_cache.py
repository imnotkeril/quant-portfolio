"""
In-memory cache implementation for efficient data retrieval.
"""
import time
import logging
import re
from datetime import datetime
from typing import Dict, List, Any, Optional, Pattern, Tuple, Set

from backend.app.core.interfaces.cache_provider import CacheProvider


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

    def set(self, key: str, value: Any, expiry: Optional[int] = None) -> None:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            expiry: Expiry time in seconds (if None, use default)
        """
        # Use default expiry if not specified
        if expiry is None:
            expiry = self.default_expiry

        # Calculate expiry timestamp
        expiry_time = time.time() + expiry

        # Check if cache is full
        if self.max_size and len(self.cache) >= self.max_size and key not in self.cache:
            # Evict least frequently used item
            self._evict_lfu()

        # Store value with expiry timestamp
        self.cache[key] = (value, expiry_time)

        # Initialize access count
        self.access_count[key] = 0

        logging.debug(f"Cached value for key: {key} (expires: {datetime.fromtimestamp(expiry_time)})")

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if deletion was successful, False if key not found
        """
        if key in self.cache:
            del self.cache[key]
            if key in self.access_count:
                del self.access_count[key]

            logging.debug(f"Deleted cached value for key: {key}")
            return True

        return False

    def clear(self) -> None:
        """Clear all cache"""
        self.cache.clear()
        self.access_count.clear()
        logging.info("Cache cleared")

    def clear_expired(self) -> int:
        """
        Clear expired cache entries

        Returns:
            Number of expired entries cleared
        """
        current_time = time.time()

        # Find expired keys
        expired_keys = [
            key for key, (_, expiry_time) in self.cache.items()
            if current_time > expiry_time
        ]

        # Delete expired keys
        for key in expired_keys:
            self.delete(key)

        count = len(expired_keys)
        if count > 0:
            logging.info(f"Cleared {count} expired cache entries")

        return count

    def get_keys(self) -> List[str]:
        """
        Get all cache keys

        Returns:
            List of cache keys
        """
        return list(self.cache.keys())

    def get_keys_matching(self, pattern: str) -> List[str]:
        """
        Get cache keys matching a regex pattern

        Args:
            pattern: Regex pattern to match

        Returns:
            List of matching cache keys
        """
        try:
            regex = re.compile(pattern)
            return [key for key in self.cache.keys() if regex.search(key)]
        except re.error as e:
            logging.error(f"Invalid regex pattern: {pattern} - {e}")
            return []

    def get_size(self) -> int:
        """
        Get current cache size

        Returns:
            Number of items in cache
        """
        return len(self.cache)

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache statistics
        """
        current_time = time.time()

        # Calculate stats
        total_items = len(self.cache)
        expired_items = sum(1 for _, expiry_time in self.cache.values() if current_time > expiry_time)

        return {
            'total_items': total_items,
            'expired_items': expired_items,
            'active_items': total_items - expired_items,
            'max_size': self.max_size,
            'default_expiry': self.default_expiry
        }

    def _evict_lfu(self) -> None:
        """Evict least frequently used item from cache"""
        if not self.cache:
            return

        # Find key with lowest access count
        lfu_key = min(self.access_count.items(), key=lambda x: x[1])[0]

        # Delete item
        self.delete(lfu_key)
        logging.debug(f"Evicted least frequently used item with key: {lfu_key}")