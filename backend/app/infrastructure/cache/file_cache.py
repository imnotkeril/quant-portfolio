"""
File-based cache implementation for efficient data retrieval.
"""
import os
import pickle
import json
import time
import logging
import hashlib
import glob
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Pattern
from pathlib import Path

from backend.app.core.interfaces.cache_provider import CacheProvider

# Configure logging
logger = logging.getLogger(__name__)


class FileCacheService(CacheProvider):
    """
    File-based cache service implementation.
    Implements the CacheProvider interface.
    """

    def __init__(
            self,
            cache_dir: str = "./cache",
            default_expiry: int = 86400,  # 1 day in seconds
            use_hash_keys: bool = True,
            cache_format: str = "pickle"  # "pickle" or "json"
    ):
        """
        Initialize the file cache service

        Args:
            cache_dir: Directory to store cache files
            default_expiry: Default cache expiry time in seconds
            use_hash_keys: Whether to hash cache keys to create filenames
            cache_format: Format to use for cache files ("pickle" or "json")
        """
        self.cache_dir = Path(cache_dir)
        self.default_expiry = default_expiry
        self.use_hash_keys = use_hash_keys
        self.cache_format = cache_format.lower()

        if self.cache_format not in ["pickle", "json"]:
            logger.warning(f"Unsupported cache format: {cache_format}. Using pickle instead.")
            self.cache_format = "pickle"

        # Create cache directory if it doesn't exist
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Initialized FileCacheService in {self.cache_dir}")

        # Optional: clear expired items on startup
        self.clear_expired()

    def _get_cache_path(self, key: str) -> Path:
        """
        Get cache file path for a key.

        Args:
            key: Cache key

        Returns:
            Path to cache file
        """
        if self.use_hash_keys:
            # Create a file-safe hash of the key
            hashed_key = hashlib.md5(key.encode('utf-8')).hexdigest()
            filename = f"{hashed_key}.{'pkl' if self.cache_format == 'pickle' else 'json'}"
        else:
            # Create a file-safe version of the key
            safe_key = ''.join(c if c.isalnum() else '_' for c in key)
            filename = f"{safe_key}.{'pkl' if self.cache_format == 'pickle' else 'json'}"

        return self.cache_dir / filename

    def _get_metadata_path(self, cache_path: Path) -> Path:
        """
        Get metadata file path for a cache file.

        Args:
            cache_path: Path to cache file

        Returns:
            Path to metadata file
        """
        return cache_path.with_suffix(cache_path.suffix + '.meta')

    def _save_metadata(self, cache_path: Path, expiry: float, key: str) -> None:
        """
        Save metadata for a cache file.

        Args:
            cache_path: Path to cache file
            expiry: Expiry timestamp
            key: Original cache key
        """
        metadata = {
            'expiry': expiry,
            'key': key,
            'created_at': time.time()
        }

        metadata_path = self._get_metadata_path(cache_path)

        try:
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f)
        except Exception as e:
            logger.warning(f"Failed to save cache metadata for {key}: {e}")

    def _load_metadata(self, cache_path: Path) -> Optional[Dict[str, Any]]:
        """
        Load metadata for a cache file.

        Args:
            cache_path: Path to cache file

        Returns:
            Metadata dictionary or None if not found
        """
        metadata_path = self._get_metadata_path(cache_path)

        if not metadata_path.exists():
            return None

        try:
            with open(metadata_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load cache metadata for {cache_path}: {e}")
            return None

    def _is_expired(self, cache_path: Path) -> bool:
        """
        Check if a cache file is expired.

        Args:
            cache_path: Path to cache file

        Returns:
            True if expired, False otherwise
        """
        metadata = self._load_metadata(cache_path)

        if metadata is None:
            # If no metadata, assume expired
            return True

        return time.time() > metadata['expiry']

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found or expired
        """
        cache_path = self._get_cache_path(key)

        # Check if cache file exists
        if not cache_path.exists():
            return None

        # Check if cache is expired
        if self._is_expired(cache_path):
            # Remove expired files
            self.delete(key)
            return None

        try:
            # Load cached data
            if self.cache_format == "pickle":
                with open(cache_path, 'rb') as f:
                    return pickle.load(f)
            else:  # json
                with open(cache_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load cached data for {key}: {e}")
            return None

    def set(
            self,
            key: str,
            value: Any,
            expiry: Optional[int] = None
    ) -> None:
        """
        Store value in cache

        Args:
            key: Cache key
            value: Value to store
            expiry: Optional expiration time in seconds
        """
        if expiry is None:
            expiry = self.default_expiry

        # Calculate expiry timestamp
        expiry_time = time.time() + expiry

        cache_path = self._get_cache_path(key)

        try:
            # Save data
            if self.cache_format == "pickle":
                with open(cache_path, 'wb') as f:
                    pickle.dump(value, f)
            else:  # json
                with open(cache_path, 'w', encoding='utf-8') as f:
                    json.dump(value, f, ensure_ascii=False, default=self._json_serializer)

            # Save metadata
            self._save_metadata(cache_path, expiry_time, key)

            logger.debug(f"Saved data to cache for key: {key}")
        except Exception as e:
            logger.warning(f"Failed to save data to cache for {key}: {e}")

    def _json_serializer(self, obj: Any) -> Any:
        """
        Custom JSON serializer for handling non-serializable objects.

        Args:
            obj: Object to serialize

        Returns:
            Serializable representation of the object
        """
        # Handle datetime objects
        if isinstance(obj, datetime):
            return obj.isoformat()

        # Handle numpy arrays if available
        try:
            import numpy as np
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
        except ImportError:
            pass

        # Handle pandas DataFrames if available
        try:
            import pandas as pd
            if isinstance(obj, pd.DataFrame):
                return obj.to_dict(orient='records')
            if isinstance(obj, pd.Series):
                return obj.to_dict()
        except ImportError:
            pass

        # Default behavior - try to get a string representation
        try:
            return str(obj)
        except:
            return None

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if deletion was successful, False if key not found
        """
        cache_path = self._get_cache_path(key)
        metadata_path = self._get_metadata_path(cache_path)

        if not cache_path.exists():
            return False

        try:
            # Delete cache file
            cache_path.unlink()

            # Delete metadata file if it exists
            if metadata_path.exists():
                metadata_path.unlink()

            logger.debug(f"Deleted cached data for key: {key}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete cached data for {key}: {e}")
            return False

    def exists(self, key: str) -> bool:
        """
        Check if a key exists in the cache and is not expired.

        Args:
            key: Cache key

        Returns:
            True if key exists and is not expired, False otherwise
        """
        cache_path = self._get_cache_path(key)

        if not cache_path.exists():
            return False

        return not self._is_expired(cache_path)

    def clear(self) -> None:
        """
        Clear all cached values.
        """
        try:
            # Find all cache files
            cache_files = list(self.cache_dir.glob('*.pkl')) + list(self.cache_dir.glob('*.json'))

            # Delete cache and metadata files
            for cache_path in cache_files:
                cache_path.unlink(missing_ok=True)

                metadata_path = self._get_metadata_path(cache_path)
                if metadata_path.exists():
                    metadata_path.unlink(missing_ok=True)

            logger.info(f"Cleared {len(cache_files)} items from cache")
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")

    def clear_expired(self) -> int:
        """
        Clear all expired cached values.

        Returns:
            Number of expired items cleared
        """
        count = 0

        try:
            # Find all cache files
            cache_files = list(self.cache_dir.glob('*.pkl')) + list(self.cache_dir.glob('*.json'))

            # Check each file for expiration
            for cache_path in cache_files:
                if self._is_expired(cache_path):
                    cache_path.unlink(missing_ok=True)

                    metadata_path = self._get_metadata_path(cache_path)
                    if metadata_path.exists():
                        metadata_path.unlink(missing_ok=True)

                    count += 1

            if count > 0:
                logger.info(f"Cleared {count} expired items from cache")
        except Exception as e:
            logger.error(f"Failed to clear expired cache items: {e}")

        return count

    def get_keys(self, pattern: Optional[str] = None) -> List[str]:
        """
        Get all keys matching a pattern.

        Args:
            pattern: Optional pattern to match keys against

        Returns:
            List of matching keys
        """
        try:
            # Find all cache files
            cache_files = list(self.cache_dir.glob('*.pkl')) + list(self.cache_dir.glob('*.json'))

            keys = []
            for cache_path in cache_files:
                metadata = self._load_metadata(cache_path)
                if metadata and 'key' in metadata:
                    if pattern is None or pattern in metadata['key']:
                        keys.append(metadata['key'])

            return keys
        except Exception as e:
            logger.error(f"Failed to get cache keys: {e}")
            return []

    def get_size(self) -> int:
        """
        Get the current size of the cache.

        Returns:
            Number of items in the cache
        """
        try:
            # Find all cache files
            cache_files = list(self.cache_dir.glob('*.pkl')) + list(self.cache_dir.glob('*.json'))

            # Count non-expired cache files
            count = 0
            for cache_path in cache_files:
                if not self._is_expired(cache_path):
                    count += 1

            return count
        except Exception as e:
            logger.error(f"Failed to get cache size: {e}")
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the cache.

        Returns:
            Dictionary with cache statistics
        """
        try:
            # Find all cache files
            cache_files = list(self.cache_dir.glob('*.pkl')) + list(self.cache_dir.glob('*.json'))

            total_size = 0
            expired_count = 0
            valid_count = 0
            oldest_timestamp = time.time()
            newest_timestamp = 0

            for cache_path in cache_files:
                # Get file size
                total_size += cache_path.stat().st_size

                # Check expiration
                if self._is_expired(cache_path):
                    expired_count += 1
                else:
                    valid_count += 1

                # Get metadata for timestamp info
                metadata = self._load_metadata(cache_path)
                if metadata and 'created_at' in metadata:
                    created_at = metadata['created_at']
                    oldest_timestamp = min(oldest_timestamp, created_at)
                    newest_timestamp = max(newest_timestamp, created_at)

            return {
                'total_items': len(cache_files),
                'valid_items': valid_count,
                'expired_items': expired_count,
                'total_size_bytes': total_size,
                'cache_dir': str(self.cache_dir),
                'oldest_item_age': time.time() - oldest_timestamp if oldest_timestamp < time.time() else 0,
                'newest_item_age': time.time() - newest_timestamp if newest_timestamp > 0 else 0,
                'default_expiry': self.default_expiry,
                'format': self.cache_format
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {
                'error': str(e)
            }