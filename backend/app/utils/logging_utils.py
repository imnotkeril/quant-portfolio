"""
Logging utilities for the Investment Portfolio Management System.

This module provides utilities for logging configuration and management.
"""
import logging
import logging.config
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Union

DEFAULT_LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DEFAULT_LOG_LEVEL = "INFO"


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name.

    Args:
        name: Logger name (usually the module name)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


def setup_logger(
        name: str,
        log_level: str = DEFAULT_LOG_LEVEL,
        log_format: str = DEFAULT_LOG_FORMAT
) -> logging.Logger:
    """
    Set up a logger with the specified name, level, and format.

    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log message format

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Set the log level
    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    # Create handler if none exists
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)

        # Create formatter
        formatter = logging.Formatter(log_format)
        handler.setFormatter(formatter)

        # Add handler to logger
        logger.addHandler(handler)

    return logger


def setup_file_logger(
        name: str,
        log_file: Union[str, Path],
        log_level: str = DEFAULT_LOG_LEVEL,
        log_format: str = DEFAULT_LOG_FORMAT,
        max_bytes: int = 10485760,  # 10 MB
        backup_count: int = 5
) -> logging.Logger:
    """
    Set up a logger that logs to a file with rotation.

    Args:
        name: Logger name
        log_file: Path to the log file
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log message format
        max_bytes: Maximum file size before rotation
        backup_count: Number of backup files to keep

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Set the log level
    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    # Create directory for log file if it doesn't exist
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # Create handler
    handler = logging.handlers.RotatingFileHandler(
        log_path,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    handler.setLevel(level)

    # Create formatter
    formatter = logging.Formatter(log_format)
    handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(handler)

    return logger


def setup_logging_from_config(config: Dict[str, Any]) -> None:
    """
    Set up logging configuration from a dictionary.

    Args:
        config: Logging configuration dictionary
    """
    logging.config.dictConfig(config)


def log_function_call(logger: logging.Logger, level: str = "DEBUG"):
    """
    Decorator to log function calls with arguments and return value.

    Args:
        logger: Logger instance
        level: Logging level for the message

    Returns:
        Decorated function
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            func_name = func.__name__
            log_level = getattr(logging, level.upper(), logging.DEBUG)

            # Format arguments for logging (truncate large objects)
            args_str = ', '.join([_format_arg(arg) for arg in args])
            kwargs_str = ', '.join([f"{k}={_format_arg(v)}" for k, v in kwargs.items()])

            # Log function call
            logger.log(log_level,
                       f"Calling {func_name}({args_str}{', ' if args_str and kwargs_str else ''}{kwargs_str})")

            # Call the function
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                # Log successful completion
                elapsed = datetime.now() - start_time
                logger.log(log_level,
                           f"{func_name} completed in {elapsed.total_seconds():.3f}s with result: {_format_arg(result)}")
                return result
            except Exception as e:
                # Log exception
                elapsed = datetime.now() - start_time
                logger.exception(f"{func_name} failed after {elapsed.total_seconds():.3f}s with error: {str(e)}")
                raise

        return wrapper

    return decorator


def _format_arg(arg: Any) -> str:
    """
    Format an argument for logging, truncating large objects.

    Args:
        arg: Argument to format

    Returns:
        Formatted string representation of the argument
    """
    # Handle common types explicitly
    if isinstance(arg, (str, int, float, bool, type(None))):
        return repr(arg)

    # Handle pandas DataFrame
    if 'pandas.core.frame.DataFrame' in str(type(arg)):
        return f"DataFrame(shape={arg.shape})"

    # Handle pandas Series
    if 'pandas.core.series.Series' in str(type(arg)):
        return f"Series(length={len(arg)})"

    # Handle numpy arrays
    if 'numpy.ndarray' in str(type(arg)):
        return f"ndarray(shape={arg.shape})"

    # Handle lists and dictionaries (truncate if large)
    if isinstance(arg, list):
        if len(arg) > 5:
            return f"[{', '.join([repr(x) for x in arg[:3]])}... +{len(arg) - 3} more]"
        return repr(arg)

    if isinstance(arg, dict):
        if len(arg) > 5:
            keys = list(arg.keys())
            return f"{{{', '.join([f'{repr(k)}: {repr(arg[k])}' for k in keys[:3]])}... +{len(arg) - 3} more}}"
        return repr(arg)

    # Default representation (truncated)
    repr_str = repr(arg)
    if len(repr_str) > 100:
        return f"{repr_str[:97]}..."
    return repr_str


class LoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter that adds context to log messages.
    """

    def __init__(self, logger: logging.Logger, extra: Dict[str, Any] = None):
        """
        Initialize the adapter with a logger and extra context.

        Args:
            logger: Logger instance
            extra: Extra context to add to log messages
        """
        super().__init__(logger, extra or {})

    def process(self, msg, kwargs):
        """
        Process the log message and add context.

        Args:
            msg: Log message
            kwargs: Keyword arguments for the log method

        Returns:
            Tuple of (processed message, processed kwargs)
        """
        # Add context to message
        context_str = ' '.join([f"[{k}={v}]" for k, v in self.extra.items()])
        if context_str:
            msg = f"{context_str} {msg}"

        return msg, kwargs