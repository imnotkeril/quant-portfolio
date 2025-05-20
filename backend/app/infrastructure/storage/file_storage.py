"""
File storage service implementation for data persistence.
"""
import os
import json
import pickle
import re
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Pattern

from backend.app.core.interfaces.storage_provider import StorageProvider


class FileStorageService(StorageProvider):
    """
    File storage service implementation.
    Implements the StorageProvider interface.
    """

    def __init__(self, base_dir: str):
        """
        Initialize the file storage service

        Args:
            base_dir: Base directory for storage
        """
        self.base_dir = Path(base_dir)

        # Create base directory if it doesn't exist
        self.base_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        self._create_subdirectories()

        logging.info(f"Initialized FileStorageService with base directory: {self.base_dir}")

    def _create_subdirectories(self) -> None:
        """Create required subdirectories"""
        subdirs = ['portfolios', 'reports', 'cache', 'temp']

        for subdir in subdirs:
            path = self.base_dir / subdir
            path.mkdir(exist_ok=True)
            logging.info(f"Created directory: {path}")

    def save_json(self, data: Dict, filename: str) -> str:
        """
        Save data to JSON file

        Args:
            data: Dictionary data to save
            filename: Filename (with or without extension)

        Returns:
            Path to the saved file
        """
        # Ensure filename has .json extension
        if not filename.endswith('.json'):
            filename += '.json'

        # Determine full path
        file_path = self._get_full_path(filename, subdir='portfolios')

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)

            logging.info(f"Saved data to JSON file: {file_path}")
            return str(file_path)
        except Exception as e:
            logging.error(f"Error saving JSON data to {file_path}: {e}")
            raise

    def load_json(self, filename: str) -> Dict:
        """
        Load data from JSON file

        Args:
            filename: Filename (with or without extension)

        Returns:
            Loaded dictionary data
        """
        # Ensure filename has .json extension
        if not filename.endswith('.json'):
            filename += '.json'

        # Determine full path
        file_path = self._get_full_path(filename, subdir='portfolios')

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            logging.info(f"Loaded data from JSON file: {file_path}")
            return data
        except FileNotFoundError:
            logging.error(f"JSON file not found: {file_path}")
            raise
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding JSON from {file_path}: {e}")
            raise
        except Exception as e:
            logging.error(f"Error loading JSON data from {file_path}: {e}")
            raise

    def save_pickle(self, data: Any, filename: str) -> str:
        """
        Save data to pickle file

        Args:
            data: Data to save
            filename: Filename (with or without extension)

        Returns:
            Path to the saved file
        """
        # Ensure filename has .pkl extension
        if not filename.endswith('.pkl'):
            filename += '.pkl'

        # Determine full path
        file_path = self._get_full_path(filename, subdir='cache')

        try:
            with open(file_path, 'wb') as f:
                pickle.dump(data, f)

            logging.info(f"Saved data to pickle file: {file_path}")
            return str(file_path)
        except Exception as e:
            logging.error(f"Error saving pickle data to {file_path}: {e}")
            raise

    def load_pickle(self, filename: str) -> Any:
        """
        Load data from pickle file

        Args:
            filename: Filename (with or without extension)

        Returns:
            Loaded data
        """
        # Ensure filename has .pkl extension
        if not filename.endswith('.pkl'):
            filename += '.pkl'

        # Determine full path
        file_path = self._get_full_path(filename, subdir='cache')

        try:
            with open(file_path, 'rb') as f:
                data = pickle.load(f)

            logging.info(f"Loaded data from pickle file: {file_path}")
            return data
        except FileNotFoundError:
            logging.error(f"Pickle file not found: {file_path}")
            raise
        except Exception as e:
            logging.error(f"Error loading pickle data from {file_path}: {e}")
            raise

    def list_files(self, extension: str = ".json", subdir: str = 'portfolios', pattern: Optional[str] = None) -> List[
        Path]:
        """
        List files with specified extension

        Args:
            extension: File extension to filter
            subdir: Subdirectory to search in
            pattern: Optional regex pattern to match filenames

        Returns:
            List of file paths
        """
        # Ensure extension starts with a dot
        if not extension.startswith('.'):
            extension = '.' + extension

        # Get directory
        directory = self.base_dir / subdir

        try:
            # Get all files with the specified extension
            files = list(directory.glob(f"*{extension}"))

            # Filter by pattern if provided
            if pattern:
                pattern_compiled = re.compile(pattern)
                files = [f for f in files if pattern_compiled.search(f.name)]

            return sorted(files)
        except Exception as e:
            logging.error(f"Error listing files with extension {extension} in {directory}: {e}")
            return []

    def delete_file(self, filename: str, subdir: str = 'portfolios') -> bool:
        """
        Delete a file

        Args:
            filename: Filename to delete
            subdir: Subdirectory where the file is located

        Returns:
            True if deletion was successful, False otherwise
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            if not file_path.exists():
                logging.warning(f"File does not exist: {file_path}")
                return False

            # Delete the file
            file_path.unlink()

            logging.info(f"Deleted file: {file_path}")
            return True
        except Exception as e:
            logging.error(f"Error deleting file {file_path}: {e}")
            return False

    def save_text(self, text: str, filename: str, subdir: str = 'reports') -> str:
        """
        Save text to file

        Args:
            text: Text to save
            filename: Filename (with or without extension)
            subdir: Subdirectory to save in

        Returns:
            Path to the saved file
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(text)

            logging.info(f"Saved text to file: {file_path}")
            return str(file_path)
        except Exception as e:
            logging.error(f"Error saving text to {file_path}: {e}")
            raise

    def load_text(self, filename: str, subdir: str = 'reports') -> str:
        """
        Load text from file

        Args:
            filename: Filename (with or without extension)
            subdir: Subdirectory where the file is located

        Returns:
            Loaded text
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()

            logging.info(f"Loaded text from file: {file_path}")
            return text
        except FileNotFoundError:
            logging.error(f"Text file not found: {file_path}")
            raise
        except Exception as e:
            logging.error(f"Error loading text from {file_path}: {e}")
            raise

    def save_binary(self, data: bytes, filename: str, subdir: str = 'reports') -> str:
        """
        Save binary data to file

        Args:
            data: Binary data to save
            filename: Filename (with or without extension)
            subdir: Subdirectory to save in

        Returns:
            Path to the saved file
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            with open(file_path, 'wb') as f:
                f.write(data)

            logging.info(f"Saved binary data to file: {file_path}")
            return str(file_path)
        except Exception as e:
            logging.error(f"Error saving binary data to {file_path}: {e}")
            raise

    def load_binary(self, filename: str, subdir: str = 'reports') -> bytes:
        """
        Load binary data from file

        Args:
            filename: Filename (with or without extension)
            subdir: Subdirectory where the file is located

        Returns:
            Loaded binary data
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            with open(file_path, 'rb') as f:
                data = f.read()

            logging.info(f"Loaded binary data from file: {file_path}")
            return data
        except FileNotFoundError:
            logging.error(f"Binary file not found: {file_path}")
            raise
        except Exception as e:
            logging.error(f"Error loading binary data from {file_path}: {e}")
            raise

    def copy_file(self, source: str, destination: str) -> bool:
        """
        Copy a file

        Args:
            source: Source file path
            destination: Destination file path

        Returns:
            True if copy was successful, False otherwise
        """
        source_path = Path(source)
        destination_path = Path(destination)

        try:
            shutil.copy2(source_path, destination_path)

            logging.info(f"Copied file from {source_path} to {destination_path}")
            return True
        except Exception as e:
            logging.error(f"Error copying file from {source_path} to {destination_path}: {e}")
            return False

    def create_directory(self, directory: str) -> bool:
        """
        Create a directory

        Args:
            directory: Directory path

        Returns:
            True if creation was successful, False otherwise
        """
        directory_path = self.base_dir / directory

        try:
            directory_path.mkdir(parents=True, exist_ok=True)

            logging.info(f"Created directory: {directory_path}")
            return True
        except Exception as e:
            logging.error(f"Error creating directory {directory_path}: {e}")
            return False

    def get_base_dir(self) -> str:
        """
        Get base directory

        Returns:
            Base directory path as string
        """
        return str(self.base_dir)

    def get_reports_dir(self) -> str:
        """
        Get reports directory

        Returns:
            Reports directory path as string
        """
        reports_dir = self.base_dir / 'reports'
        return str(reports_dir)

    def get_file_info(self, filename: str, subdir: str = 'portfolios') -> Dict:
        """
        Get file information

        Args:
            filename: Filename
            subdir: Subdirectory where the file is located

        Returns:
            Dictionary with file information
        """
        # Determine full path
        file_path = self._get_full_path(filename, subdir=subdir)

        try:
            if not file_path.exists():
                return {
                    'exists': False,
                    'name': filename,
                    'path': str(file_path)
                }

            # Get file stats
            stats = file_path.stat()

            return {
                'exists': True,
                'name': filename,
                'path': str(file_path),
                'size': stats.st_size,
                'created': datetime.fromtimestamp(stats.st_ctime).isoformat(),
                'modified': datetime.fromtimestamp(stats.st_mtime).isoformat(),
                'extension': file_path.suffix
            }
        except Exception as e:
            logging.error(f"Error getting file info for {file_path}: {e}")
            return {
                'exists': False,
                'name': filename,
                'path': str(file_path),
                'error': str(e)
            }

    def _get_full_path(self, filename: str, subdir: str = 'portfolios') -> Path:
        """
        Get full path for a file

        Args:
            filename: Filename
            subdir: Subdirectory where the file is located

        Returns:
            Full path as Path object
        """
        # Sanitize filename
        safe_filename = self.sanitize_filename(filename)

        # Create full path
        return self.base_dir / subdir / safe_filename

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Clean filename from invalid characters

        Args:
            filename: Original filename

        Returns:
            Sanitized filename
        """
        # Replace invalid characters
        filename = re.sub(r'[\\/*?:"<>|%\\\\\s]', '_', filename)

        # Replace & with 'and'
        filename = filename.replace('&', 'and')

        # Replace other invalid characters
        filename = filename.replace('\\', '_').replace('/', '_').replace(':', '_')

        # Limit length
        if len(filename) > 200:
            filename = filename[:197] + '...'

        return filename