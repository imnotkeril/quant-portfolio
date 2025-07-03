"""
Pickle storage implementation for efficient serialization of complex objects.
"""
import os
import pickle
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

from app.core.interfaces.storage_provider import StorageProvider


class PickleStorageService(StorageProvider):
    """
    Pickle storage service implementation.
    Implements the StorageProvider interface.
    Provides efficient binary serialization for complex objects.
    """

    def __init__(self, storage_dir: str):
        """
        Initialize the pickle storage service.

        Args:
            storage_dir: Base directory for pickle storage
        """
        self.storage_dir = Path(storage_dir)

        # Create storage directory if it doesn't exist
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        self._create_subdirectories()

        logging.info(f"Initialized PickleStorageService with storage directory: {self.storage_dir}")

    def _create_subdirectories(self) -> None:
        """Create required subdirectories."""
        subdirs = ['portfolios', 'reports', 'optimizations', 'scenarios', 'cache']

        for subdir in subdirs:
            path = self.storage_dir / subdir
            path.mkdir(exist_ok=True)
            logging.info(f"Created directory: {path}")

    def save_portfolio(
            self,
            portfolio_data: Dict[str, Any],
            portfolio_id: Optional[str] = None
    ) -> str:
        """
        Save portfolio data.

        Args:
            portfolio_data: Dictionary with portfolio data
            portfolio_id: Optional portfolio ID

        Returns:
            Portfolio ID
        """
        # Use provided ID or get it from data
        if portfolio_id is None:
            portfolio_id = portfolio_data.get('id')
            if portfolio_id is None:
                raise ValueError("Portfolio ID not provided and not found in data")

        # Set portfolio ID in data
        portfolio_data['id'] = portfolio_id

        # Add metadata
        if 'created_at' not in portfolio_data:
            portfolio_data['created_at'] = datetime.now()

        portfolio_data['last_updated'] = datetime.now()

        # Save to file
        file_path = self.storage_dir / 'portfolios' / f"{portfolio_id}.pkl"

        with open(file_path, 'wb') as f:
            pickle.dump(portfolio_data, f, protocol=pickle.HIGHEST_PROTOCOL)

        logging.info(f"Saved portfolio data with ID: {portfolio_id}")
        return portfolio_id

    def load_portfolio(self, portfolio_id: str) -> Dict[str, Any]:
        """
        Load portfolio data.

        Args:
            portfolio_id: Portfolio ID

        Returns:
            Dictionary with portfolio data
        """
        file_path = self.storage_dir / 'portfolios' / f"{portfolio_id}.pkl"

        if not file_path.exists():
            raise FileNotFoundError(f"Portfolio with ID {portfolio_id} not found")

        try:
            with open(file_path, 'rb') as f:
                portfolio_data = pickle.load(f)

            logging.info(f"Loaded portfolio data with ID: {portfolio_id}")
            return portfolio_data
        except Exception as e:
            logging.error(f"Error loading portfolio {portfolio_id}: {e}")
            raise

    def delete_portfolio(self, portfolio_id: str) -> bool:
        """
        Delete portfolio data.

        Args:
            portfolio_id: Portfolio ID

        Returns:
            True if deletion was successful, False otherwise
        """
        file_path = self.storage_dir / 'portfolios' / f"{portfolio_id}.pkl"

        if not file_path.exists():
            logging.warning(f"Portfolio with ID {portfolio_id} not found for deletion")
            return False

        try:
            file_path.unlink()
            logging.info(f"Deleted portfolio with ID: {portfolio_id}")
            return True
        except Exception as e:
            logging.error(f"Error deleting portfolio {portfolio_id}: {e}")
            return False

    def list_portfolios(self) -> List[Dict[str, Any]]:
        """
        List all portfolios.

        Returns:
            List of dictionaries with portfolio metadata
        """
        portfolio_dir = self.storage_dir / 'portfolios'
        portfolio_files = list(portfolio_dir.glob('*.pkl'))

        portfolios = []
        for file_path in portfolio_files:
            try:
                with open(file_path, 'rb') as f:
                    data = pickle.load(f)

                # Extract metadata
                portfolio_info = {
                    'id': data.get('id', file_path.stem),
                    'name': data.get('name', ''),
                    'created_at': data.get('created_at', ''),
                    'last_updated': data.get('last_updated', ''),
                    'asset_count': len(data.get('assets', [])),
                    'description': data.get('description', '')
                }

                portfolios.append(portfolio_info)
            except Exception as e:
                logging.error(f"Error reading portfolio file {file_path.name}: {e}")

        # Sort by name
        portfolios.sort(key=lambda x: x.get('name', ''))

        return portfolios

    def save_report(
            self,
            report_data: Dict[str, Any],
            report_id: Optional[str] = None
    ) -> str:
        """
        Save report data.

        Args:
            report_data: Dictionary with report data
            report_id: Optional report ID

        Returns:
            Report ID
        """
        # Use provided ID or get it from data
        if report_id is None:
            report_id = report_data.get('id')
            if report_id is None:
                raise ValueError("Report ID not provided and not found in data")

        # Set report ID in data
        report_data['id'] = report_id

        # Add metadata
        if 'created_at' not in report_data:
            report_data['created_at'] = datetime.now()

        # Save to file
        file_path = self.storage_dir / 'reports' / f"{report_id}.pkl"

        with open(file_path, 'wb') as f:
            pickle.dump(report_data, f, protocol=pickle.HIGHEST_PROTOCOL)

        logging.info(f"Saved report data with ID: {report_id}")
        return report_id

    def load_report(self, report_id: str) -> Dict[str, Any]:
        """
        Load report data.

        Args:
            report_id: Report ID

        Returns:
            Dictionary with report data
        """
        file_path = self.storage_dir / 'reports' / f"{report_id}.pkl"

        if not file_path.exists():
            raise FileNotFoundError(f"Report with ID {report_id} not found")

        try:
            with open(file_path, 'rb') as f:
                report_data = pickle.load(f)

            logging.info(f"Loaded report data with ID: {report_id}")
            return report_data
        except Exception as e:
            logging.error(f"Error loading report {report_id}: {e}")
            raise

    def delete_report(self, report_id: str) -> bool:
        """
        Delete report data.

        Args:
            report_id: Report ID

        Returns:
            True if deletion was successful, False otherwise
        """
        file_path = self.storage_dir / 'reports' / f"{report_id}.pkl"

        if not file_path.exists():
            logging.warning(f"Report with ID {report_id} not found for deletion")
            return False

        try:
            file_path.unlink()
            logging.info(f"Deleted report with ID: {report_id}")
            return True
        except Exception as e:
            logging.error(f"Error deleting report {report_id}: {e}")
            return False

    def list_reports(self, portfolio_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all reports, optionally filtered by portfolio.

        Args:
            portfolio_id: Optional portfolio ID to filter by

        Returns:
            List of dictionaries with report metadata
        """
        reports_dir = self.storage_dir / 'reports'
        report_files = list(reports_dir.glob('*.pkl'))

        reports = []
        for file_path in report_files:
            try:
                with open(file_path, 'rb') as f:
                    data = pickle.load(f)

                # Filter by portfolio ID if specified
                if portfolio_id is not None and data.get('portfolio_id') != portfolio_id:
                    continue

                # Extract metadata
                report_info = {
                    'id': data.get('id', file_path.stem),
                    'name': data.get('name', ''),
                    'portfolio_id': data.get('portfolio_id', ''),
                    'report_type': data.get('report_type', ''),
                    'created_at': data.get('created_at', ''),
                    'file_path': data.get('file_path', '')
                }

                reports.append(report_info)
            except Exception as e:
                logging.error(f"Error reading report file {file_path.name}: {e}")

        # Sort by creation date, newest first
        reports.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return reports

    def save_optimization_result(
            self,
            result_data: Dict[str, Any],
            result_id: Optional[str] = None
    ) -> str:
        """
        Save optimization result data.

        Args:
            result_data: Dictionary with optimization result data
            result_id: Optional result ID

        Returns:
            Result ID
        """
        # Use provided ID or get it from data
        if result_id is None:
            result_id = result_data.get('id')
            if result_id is None:
                raise ValueError("Optimization result ID not provided and not found in data")

        # Set result ID in data
        result_data['id'] = result_id

        # Add metadata
        if 'created_at' not in result_data:
            result_data['created_at'] = datetime.now()

        # Save to file
        file_path = self.storage_dir / 'optimizations' / f"{result_id}.pkl"

        with open(file_path, 'wb') as f:
            pickle.dump(result_data, f, protocol=pickle.HIGHEST_PROTOCOL)

        logging.info(f"Saved optimization result with ID: {result_id}")
        return result_id

    def load_optimization_result(self, result_id: str) -> Dict[str, Any]:
        """
        Load optimization result data.

        Args:
            result_id: Result ID

        Returns:
            Dictionary with optimization result data
        """
        file_path = self.storage_dir / 'optimizations' / f"{result_id}.pkl"

        if not file_path.exists():
            raise FileNotFoundError(f"Optimization result with ID {result_id} not found")

        try:
            with open(file_path, 'rb') as f:
                result_data = pickle.load(f)

            logging.info(f"Loaded optimization result with ID: {result_id}")
            return result_data
        except Exception as e:
            logging.error(f"Error loading optimization result {result_id}: {e}")
            raise

    def list_optimization_results(self, portfolio_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all optimization results, optionally filtered by portfolio.

        Args:
            portfolio_id: Optional portfolio ID to filter by

        Returns:
            List of dictionaries with optimization result metadata
        """
        optimizations_dir = self.storage_dir / 'optimizations'
        optimization_files = list(optimizations_dir.glob('*.pkl'))

        results = []
        for file_path in optimization_files:
            try:
                with open(file_path, 'rb') as f:
                    data = pickle.load(f)

                # Filter by portfolio ID if specified
                if portfolio_id is not None and data.get('portfolio_id') != portfolio_id:
                    continue

                # Extract metadata
                result_info = {
                    'id': data.get('id', file_path.stem),
                    'portfolio_id': data.get('portfolio_id', ''),
                    'method': data.get('method', ''),
                    'created_at': data.get('created_at', '')
                }

                results.append(result_info)
            except Exception as e:
                logging.error(f"Error reading optimization file {file_path.name}: {e}")

        # Sort by creation date, newest first
        results.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return results

    def save_object(
            self,
            object_type: str,
            object_data: Dict[str, Any],
            object_id: Optional[str] = None
    ) -> str:
        """
        Save generic object data.

        Args:
            object_type: Type of object
            object_data: Dictionary with object data
            object_id: Optional object ID

        Returns:
            Object ID
        """
        # Use provided ID or get it from data
        if object_id is None:
            object_id = object_data.get('id')
            if object_id is None:
                raise ValueError(f"{object_type} ID not provided and not found in data")

        # Set object ID in data
        object_data['id'] = object_id

        # Add metadata
        if 'created_at' not in object_data:
            object_data['created_at'] = datetime.now()

        object_data['last_updated'] = datetime.now()

        # Determine directory based on object type
        object_dir = self._get_object_dir(object_type)

        # Save to file
        file_path = self.storage_dir / object_dir / f"{object_id}.pkl"

        with open(file_path, 'wb') as f:
            pickle.dump(object_data, f, protocol=pickle.HIGHEST_PROTOCOL)

        logging.info(f"Saved {object_type} data with ID: {object_id}")
        return object_id

    def load_object(self, object_type: str, object_id: str) -> Dict[str, Any]:
        """
        Load generic object data.

        Args:
            object_type: Type of object
            object_id: Object ID

        Returns:
            Dictionary with object data
        """
        # Determine directory based on object type
        object_dir = self._get_object_dir(object_type)

        file_path = self.storage_dir / object_dir / f"{object_id}.pkl"

        if not file_path.exists():
            raise FileNotFoundError(f"{object_type} with ID {object_id} not found")

        try:
            with open(file_path, 'rb') as f:
                object_data = pickle.load(f)

            logging.info(f"Loaded {object_type} data with ID: {object_id}")
            return object_data
        except Exception as e:
            logging.error(f"Error loading {object_type} {object_id}: {e}")
            raise

    def delete_object(self, object_type: str, object_id: str) -> bool:
        """
        Delete generic object data.

        Args:
            object_type: Type of object
            object_id: Object ID

        Returns:
            True if deletion was successful, False otherwise
        """
        # Determine directory based on object type
        object_dir = self._get_object_dir(object_type)

        file_path = self.storage_dir / object_dir / f"{object_id}.pkl"

        if not file_path.exists():
            logging.warning(f"{object_type} with ID {object_id} not found for deletion")
            return False

        try:
            file_path.unlink()
            logging.info(f"Deleted {object_type} with ID: {object_id}")
            return True
        except Exception as e:
            logging.error(f"Error deleting {object_type} {object_id}: {e}")
            return False

    def list_objects(
            self,
            object_type: str,
            filter_criteria: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        List all objects of a specific type, optionally filtered.

        Args:
            object_type: Type of object
            filter_criteria: Optional dictionary with filter criteria

        Returns:
            List of dictionaries with object metadata
        """
        # Determine directory based on object type
        object_dir = self._get_object_dir(object_type)

        object_files = list((self.storage_dir / object_dir).glob('*.pkl'))

        objects = []
        for file_path in object_files:
            try:
                with open(file_path, 'rb') as f:
                    data = pickle.load(f)

                # Apply filters if specified
                if filter_criteria:
                    if not all(data.get(key) == value for key, value in filter_criteria.items()):
                        continue

                # Extract metadata
                object_info = {
                    'id': data.get('id', file_path.stem),
                    'created_at': data.get('created_at', ''),
                    'last_updated': data.get('last_updated', '')
                }

                # Add common metadata fields if present
                for field in ['name', 'description', 'type']:
                    if field in data:
                        object_info[field] = data[field]

                objects.append(object_info)
            except Exception as e:
                logging.error(f"Error reading {object_type} file {file_path.name}: {e}")

        # Sort by last updated, newest first
        objects.sort(key=lambda x: x.get('last_updated', ''), reverse=True)

        return objects

    def _get_object_dir(self, object_type: str) -> str:
        """
        Get directory for a specific object type.

        Args:
            object_type: Type of object

        Returns:
            Directory name
        """
        # Map object types to directories
        type_dirs = {
            'portfolio': 'portfolios',
            'report': 'reports',
            'optimization': 'optimizations',
            'scenario': 'scenarios',
            'cache': 'cache'
        }

        # Get directory or use object_type as fallback
        directory = type_dirs.get(object_type.lower(), object_type.lower())

        # Create directory if it doesn't exist
        dir_path = self.storage_dir / directory
        dir_path.mkdir(exist_ok=True)

        return directory

    def cache_object(self, key: str, data: Any, expiry_seconds: int = 86400) -> None:
        """
        Cache an object with expiry time.
        This is a convenience method for caching objects that are expensive to compute.

        Args:
            key: Cache key
            data: Object to cache
            expiry_seconds: Expiry time in seconds (default: 1 day)
        """
        cache_data = {
            'data': data,
            'expires_at': datetime.now().timestamp() + expiry_seconds
        }

        file_path = self.storage_dir / 'cache' / f"{key}.pkl"

        with open(file_path, 'wb') as f:
            pickle.dump(cache_data, f, protocol=pickle.HIGHEST_PROTOCOL)

        logging.debug(f"Cached object with key: {key}")

    def get_cached_object(self, key: str) -> Optional[Any]:
        """
        Get cached object if it exists and is not expired.

        Args:
            key: Cache key

        Returns:
            Cached object or None if not found or expired
        """
        file_path = self.storage_dir / 'cache' / f"{key}.pkl"

        if not file_path.exists():
            return None

        try:
            with open(file_path, 'rb') as f:
                cache_data = pickle.load(f)

            # Check expiry
            if datetime.now().timestamp() > cache_data.get('expires_at', 0):
                logging.debug(f"Cache expired for key: {key}")
                file_path.unlink()
                return None

            logging.debug(f"Cache hit for key: {key}")
            return cache_data.get('data')
        except Exception as e:
            logging.error(f"Error reading cache with key {key}: {e}")
            return None

    def clear_cache(self) -> int:
        """
        Clear all cache objects.

        Returns:
            Number of cache objects cleared
        """
        cache_dir = self.storage_dir / 'cache'
        cache_files = list(cache_dir.glob('*.pkl'))

        cleared_count = 0
        for file_path in cache_files:
            try:
                file_path.unlink()
                cleared_count += 1
            except Exception as e:
                logging.error(f"Error clearing cache file {file_path.name}: {e}")

        logging.info(f"Cleared {cleared_count} cache objects")
        return cleared_count