"""Error handling utilities for services."""
from typing import Dict, Any, Optional, Union, TypeVar, Generic

T = TypeVar('T')


class Result(Generic[T]):
    """Result class for representing success or failure of an operation."""

    def __init__(
            self,
            success: bool,
            value: Optional[T] = None,
            error: Optional[str] = None
    ):
        """Initialize a result.

        Args:
            success: Whether the operation was successful
            value: The result value (if successful)
            error: The error message (if not successful)
        """
        self.success = success
        self.value = value
        self.error = error

    @classmethod
    def ok(cls, value: T) -> 'Result[T]':
        """Create a successful result.

        Args:
            value: The result value

        Returns:
            A successful result with the specified value
        """
        return cls(True, value)

    @classmethod
    def fail(cls, error: str) -> 'Result[T]':
        """Create a failed result.

        Args:
            error: The error message

        Returns:
            A failed result with the specified error message
        """
        return cls(False, error=error)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the result to a dictionary.

        Returns:
            Dictionary representation of the result
        """
        if self.success:
            return {'success': True, 'data': self.value}
        else:
            return {'success': False, 'error': self.error}