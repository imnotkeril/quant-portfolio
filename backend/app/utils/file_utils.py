# backend/app/utils/file_utils.py
import os
import json
import pickle
import csv
import yaml
import tempfile
from typing import Dict, List, Any, Optional, Union, TextIO, BinaryIO
from pathlib import Path
import shutil
import logging
import datetime
import zipfile
import gzip
import base64

# Setup logging
logger = logging.getLogger(__name__)


def ensure_directory_exists(directory_path: Union[str, Path]) -> bool:
    """
    Ensure that a directory exists, creating it if necessary.

    Args:
        directory_path: Path to the directory

    Returns:
        True if the directory exists or was created successfully, False otherwise
    """
    try:
        path = Path(directory_path)
        if not path.exists():
            path.mkdir(parents=True)
        elif not path.is_dir():
            logger.error(f"Path exists but is not a directory: {directory_path}")
            return False
        return True
    except Exception as e:
        logger.error(f"Failed to ensure directory exists: {directory_path}. Error: {str(e)}")
        return False


def list_files(
        directory_path: Union[str, Path],
        file_extension: Optional[str] = None,
        recursive: bool = False
) -> List[Path]:
    """
    List files in a directory, optionally filtering by extension.

    Args:
        directory_path: Path to the directory
        file_extension: File extension to filter by (e.g., '.json')
        recursive: Whether to search recursively in subdirectories

    Returns:
        List of file paths
    """
    try:
        path = Path(directory_path)
        if not path.exists() or not path.is_dir():
            logger.warning(f"Directory does not exist or is not a directory: {directory_path}")
            return []

        if recursive:
            files = list(path.glob('**/*'))
        else:
            files = list(path.glob('*'))

        # Filter out directories
        files = [f for f in files if f.is_file()]

        # Filter by extension if specified
        if file_extension:
            if not file_extension.startswith('.'):
                file_extension = '.' + file_extension
            files = [f for f in files if f.suffix.lower() == file_extension.lower()]

        return files
    except Exception as e:
        logger.error(f"Error listing files in directory: {directory_path}. Error: {str(e)}")
        return []


def read_text_file(file_path: Union[str, Path], encoding: str = 'utf-8') -> Optional[str]:
    """
    Read text from a file.

    Args:
        file_path: Path to the file
        encoding: File encoding

    Returns:
        File contents as string, or None if file could not be read
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        with open(path, 'r', encoding=encoding) as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file: {file_path}. Error: {str(e)}")
        return None


def write_text_file(
        file_path: Union[str, Path],
        content: str,
        encoding: str = 'utf-8',
        create_dirs: bool = True
) -> bool:
    """
    Write text to a file.

    Args:
        file_path: Path to the file
        content: Content to write
        encoding: File encoding
        create_dirs: Whether to create parent directories if they don't exist

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding=encoding) as f:
            f.write(content)

        return True
    except Exception as e:
        logger.error(f"Error writing to file: {file_path}. Error: {str(e)}")
        return False


def read_binary_file(file_path: Union[str, Path]) -> Optional[bytes]:
    """
    Read binary data from a file.

    Args:
        file_path: Path to the file

    Returns:
        File contents as bytes, or None if file could not be read
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        with open(path, 'rb') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading binary file: {file_path}. Error: {str(e)}")
        return None


def write_binary_file(
        file_path: Union[str, Path],
        content: bytes,
        create_dirs: bool = True
) -> bool:
    """
    Write binary data to a file.

    Args:
        file_path: Path to the file
        content: Content to write
        create_dirs: Whether to create parent directories if they don't exist

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'wb') as f:
            f.write(content)

        return True
    except Exception as e:
        logger.error(f"Error writing to binary file: {file_path}. Error: {str(e)}")
        return False


def read_json_file(file_path: Union[str, Path], encoding: str = 'utf-8') -> Optional[Dict]:
    """
    Read JSON data from a file.

    Args:
        file_path: Path to the file
        encoding: File encoding

    Returns:
        JSON data as dictionary, or None if file could not be read or parsed
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        with open(path, 'r', encoding=encoding) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON from file: {file_path}. Error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error reading JSON file: {file_path}. Error: {str(e)}")
        return None


def write_json_file(
        file_path: Union[str, Path],
        data: Any,
        encoding: str = 'utf-8',
        indent: int = 2,
        create_dirs: bool = True
) -> bool:
    """
    Write data to a JSON file.

    Args:
        file_path: Path to the file
        data: Data to write
        encoding: File encoding
        indent: JSON indentation level
        create_dirs: Whether to create parent directories if they don't exist

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding=encoding) as f:
            json.dump(data, f, indent=indent, default=json_serializer)

        return True
    except Exception as e:
        logger.error(f"Error writing JSON to file: {file_path}. Error: {str(e)}")
        return False


def json_serializer(obj: Any) -> Any:
    """
    Custom JSON serializer to handle non-serializable types.

    Args:
        obj: Object to serialize

    Returns:
        Serializable representation of the object
    """
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    elif isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, bytes):
        return base64.b64encode(obj).decode('ascii')
    elif hasattr(obj, 'to_dict') and callable(getattr(obj, 'to_dict')):
        return obj.to_dict()
    elif hasattr(obj, '__dict__'):
        return obj.__dict__

    raise TypeError(f"Type {type(obj)} not serializable")


def read_csv_file(
        file_path: Union[str, Path],
        encoding: str = 'utf-8',
        delimiter: str = ',',
        has_header: bool = True
) -> Optional[List[Dict]]:
    """
    Read CSV data from a file.

    Args:
        file_path: Path to the file
        encoding: File encoding
        delimiter: CSV delimiter
        has_header: Whether the CSV has a header row

    Returns:
        List of dictionaries (rows), or None if file could not be read or parsed
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        rows = []
        with open(path, 'r', encoding=encoding, newline='') as f:
            if has_header:
                reader = csv.DictReader(f, delimiter=delimiter)
                rows = list(reader)
            else:
                reader = csv.reader(f, delimiter=delimiter)
                rows = [dict(zip([f"col{i}" for i in range(len(row))], row)) for row in reader]

        return rows
    except Exception as e:
        logger.error(f"Error reading CSV file: {file_path}. Error: {str(e)}")
        return None


def write_csv_file(
        file_path: Union[str, Path],
        data: List[Dict],
        encoding: str = 'utf-8',
        delimiter: str = ',',
        create_dirs: bool = True
) -> bool:
    """
    Write data to a CSV file.

    Args:
        file_path: Path to the file
        data: List of dictionaries (rows) to write
        encoding: File encoding
        delimiter: CSV delimiter
        create_dirs: Whether to create parent directories if they don't exist

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        if not data:
            logger.warning("No data provided for CSV file")
            return False

        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding=encoding, newline='') as f:
            # Get field names from the first row
            fieldnames = list(data[0].keys())
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=delimiter)

            # Write header and rows
            writer.writeheader()
            writer.writerows(data)

        return True
    except Exception as e:
        logger.error(f"Error writing CSV to file: {file_path}. Error: {str(e)}")
        return False


def read_pickle_file(file_path: Union[str, Path]) -> Optional[Any]:
    """
    Read Python object from a pickle file.

    Args:
        file_path: Path to the file

    Returns:
        Unpickled object, or None if file could not be read or unpickled
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        with open(path, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        logger.error(f"Error reading pickle file: {file_path}. Error: {str(e)}")
        return None


def write_pickle_file(
        file_path: Union[str, Path],
        data: Any,
        create_dirs: bool = True,
        protocol: int = pickle.HIGHEST_PROTOCOL
) -> bool:
    """
    Write Python object to a pickle file.

    Args:
        file_path: Path to the file
        data: Object to pickle
        create_dirs: Whether to create parent directories if they don't exist
        protocol: Pickle protocol version

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'wb') as f:
            pickle.dump(data, f, protocol=protocol)

        return True
    except Exception as e:
        logger.error(f"Error writing pickle to file: {file_path}. Error: {str(e)}")
        return False


def read_yaml_file(file_path: Union[str, Path], encoding: str = 'utf-8') -> Optional[Dict]:
    """
    Read YAML data from a file.

    Args:
        file_path: Path to the file
        encoding: File encoding

    Returns:
        YAML data as dictionary, or None if file could not be read or parsed
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        with open(path, 'r', encoding=encoding) as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Error reading YAML file: {file_path}. Error: {str(e)}")
        return None


def write_yaml_file(
        file_path: Union[str, Path],
        data: Any,
        encoding: str = 'utf-8',
        create_dirs: bool = True
) -> bool:
    """
    Write data to a YAML file.

    Args:
        file_path: Path to the file
        data: Data to write
        encoding: File encoding
        create_dirs: Whether to create parent directories if they don't exist

    Returns:
        True if file was written successfully, False otherwise
    """
    try:
        path = Path(file_path)

        # Create parent directories if they don't exist
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding=encoding) as f:
            yaml.dump(data, f, default_flow_style=False)

        return True
    except Exception as e:
        logger.error(f"Error writing YAML to file: {file_path}. Error: {str(e)}")
        return False


def create_temp_file(content: Union[str, bytes], suffix: str = '') -> Optional[str]:
    """
    Create a temporary file with the given content.

    Args:
        content: File content
        suffix: File suffix (e.g., '.json')

    Returns:
        Path to the temporary file, or None if file could not be created
    """
    try:
        # Create a temporary file
        fd, path = tempfile.mkstemp(suffix=suffix)

        try:
            # Write content to the file
            if isinstance(content, str):
                with os.fdopen(fd, 'w') as f:
                    f.write(content)
            else:
                with os.fdopen(fd, 'wb') as f:
                    f.write(content)

            return path
        except Exception:
            # Close and remove the file in case of error
            os.close(fd)
            os.unlink(path)
            raise
    except Exception as e:
        logger.error(f"Error creating temporary file: {str(e)}")
        return None


def compress_file(
        file_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None,
        compression: str = 'gzip'
) -> Optional[str]:
    """
    Compress a file using the specified compression method.

    Args:
        file_path: Path to the file to compress
        output_path: Path to the output file (if None, appends compression extension to input path)
        compression: Compression method ('gzip' or 'zip')

    Returns:
        Path to the compressed file, or None if compression failed
    """
    try:
        input_path = Path(file_path)
        if not input_path.exists() or not input_path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        # Determine output path if not provided
        if output_path is None:
            if compression == 'gzip':
                output_path = str(input_path) + '.gz'
            elif compression == 'zip':
                output_path = str(input_path) + '.zip'
            else:
                output_path = str(input_path) + '.compressed'

        output_path = Path(output_path)

        # Create parent directories if they don't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if compression == 'gzip':
            with open(input_path, 'rb') as f_in:
                with gzip.open(output_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
        elif compression == 'zip':
            with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(input_path, arcname=input_path.name)
        else:
            raise ValueError(f"Unsupported compression method: {compression}")

        return str(output_path)
    except Exception as e:
        logger.error(f"Error compressing file: {str(e)}")
        return None


def decompress_file(
        file_path: Union[str, Path],
        output_path: Optional[Union[str, Path]] = None
) -> Optional[str]:
    """
    Decompress a file based on its extension.

    Args:
        file_path: Path to the compressed file
        output_path: Path to the output file (if None, strips compression extension from input path)

    Returns:
        Path to the decompressed file, or None if decompression failed
    """
    try:
        input_path = Path(file_path)
        if not input_path.exists() or not input_path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        # Determine output path if not provided
        if output_path is None:
            if input_path.name.endswith('.gz'):
                output_path = input_path.with_suffix('')
            elif input_path.name.endswith('.zip'):
                output_path = input_path.with_suffix('')
            else:
                output_path = input_path.with_suffix('.decompressed')

        output_path = Path(output_path)

        # Create parent directories if they don't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if input_path.name.endswith('.gz'):
            with gzip.open(input_path, 'rb') as f_in:
                with open(output_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
        elif input_path.name.endswith('.zip'):
            with zipfile.ZipFile(input_path, 'r') as zipf:
                # Extract the first file in the archive
                file_list = zipf.namelist()
                if not file_list:
                    raise ValueError("ZIP file is empty")

                with zipf.open(file_list[0]) as f_in:
                    with open(output_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
        else:
            raise ValueError(f"Unsupported compression format for file: {file_path}")

        return str(output_path)
    except Exception as e:
        logger.error(f"Error decompressing file: {str(e)}")
        return None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename by removing invalid characters.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Replace invalid characters with underscores
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')

    # Remove leading/trailing whitespace and periods
    filename = filename.strip().strip('.')

    # Replace empty filename with default
    if not filename:
        filename = 'file'

    return filename


def get_file_size(file_path: Union[str, Path]) -> Optional[int]:
    """
    Get the size of a file in bytes.

    Args:
        file_path: Path to the file

    Returns:
        File size in bytes, or None if file could not be accessed
    """
    try:
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        return path.stat().st_size
    except Exception as e:
        logger.error(f"Error getting file size: {str(e)}")
        return None


def get_file_hash(file_path: Union[str, Path], algorithm: str = 'sha256') -> Optional[str]:
    """
    Calculate the hash of a file.

    Args:
        file_path: Path to the file
        algorithm: Hash algorithm ('md5', 'sha1', 'sha256', etc.)

    Returns:
        File hash as a hexadecimal string, or None if hash could not be calculated
    """
    try:
        import hashlib

        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.warning(f"File does not exist or is not a file: {file_path}")
            return None

        # Initialize hash object
        if algorithm == 'md5':
            hash_obj = hashlib.md5()
        elif algorithm == 'sha1':
            hash_obj = hashlib.sha1()
        elif algorithm == 'sha256':
            hash_obj = hashlib.sha256()
        else:
            hash_obj = getattr(hashlib, algorithm)()

        # Calculate hash
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hash_obj.update(chunk)

        return hash_obj.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating file hash: {str(e)}")
        return None