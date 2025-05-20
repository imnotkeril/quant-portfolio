from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod


class StorageProvider(ABC):
    """Abstract interface for storage providers."""

    @abstractmethod
    def save_portfolio(
            self,
            portfolio_data: Dict[str, Any],
            portfolio_id: Optional[str] = None
    ) -> str:
        """Save portfolio data.

        Args:
            portfolio_data: Dictionary with portfolio data
            portfolio_id: Optional portfolio ID

        Returns:
            Portfolio ID
        """
        pass

    @abstractmethod
    def load_portfolio(
            self,
            portfolio_id: str
    ) -> Dict[str, Any]:
        """Load portfolio data.

        Args:
            portfolio_id: Portfolio ID

        Returns:
            Dictionary with portfolio data
        """
        pass

    @abstractmethod
    def delete_portfolio(
            self,
            portfolio_id: str
    ) -> bool:
        """Delete portfolio data.

        Args:
            portfolio_id: Portfolio ID

        Returns:
            True if deletion was successful, False otherwise
        """
        pass

    @abstractmethod
    def list_portfolios(self) -> List[Dict[str, Any]]:
        """List all portfolios.

        Returns:
            List of dictionaries with portfolio metadata
        """
        pass

    @abstractmethod
    def save_report(
            self,
            report_data: Dict[str, Any],
            report_id: Optional[str] = None
    ) -> str:
        """Save report data.

        Args:
            report_data: Dictionary with report data
            report_id: Optional report ID

        Returns:
            Report ID
        """
        pass

    @abstractmethod
    def load_report(
            self,
            report_id: str
    ) -> Dict[str, Any]:
        """Load report data.

        Args:
            report_id: Report ID

        Returns:
            Dictionary with report data
        """
        pass

    @abstractmethod
    def delete_report(
            self,
            report_id: str
    ) -> bool:
        """Delete report data.

        Args:
            report_id: Report ID

        Returns:
            True if deletion was successful, False otherwise
        """
        pass

    @abstractmethod
    def list_reports(
            self,
            portfolio_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all reports, optionally filtered by portfolio.

        Args:
            portfolio_id: Optional portfolio ID to filter by

        Returns:
            List of dictionaries with report metadata
        """
        pass

    @abstractmethod
    def save_optimization_result(
            self,
            result_data: Dict[str, Any],
            result_id: Optional[str] = None
    ) -> str:
        """Save optimization result data.

        Args:
            result_data: Dictionary with optimization result data
            result_id: Optional result ID

        Returns:
            Result ID
        """
        pass

    @abstractmethod
    def load_optimization_result(
            self,
            result_id: str
    ) -> Dict[str, Any]:
        """Load optimization result data.

        Args:
            result_id: Result ID

        Returns:
            Dictionary with optimization result data
        """
        pass

    @abstractmethod
    def list_optimization_results(
            self,
            portfolio_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all optimization results, optionally filtered by portfolio.

        Args:
            portfolio_id: Optional portfolio ID to filter by

        Returns:
            List of dictionaries with optimization result metadata
        """
        pass

    @abstractmethod
    def save_object(
            self,
            object_type: str,
            object_data: Dict[str, Any],
            object_id: Optional[str] = None
    ) -> str:
        """Save generic object data.

        Args:
            object_type: Type of object
            object_data: Dictionary with object data
            object_id: Optional object ID

        Returns:
            Object ID
        """
        pass

    @abstractmethod
    def load_object(
            self,
            object_type: str,
            object_id: str
    ) -> Dict[str, Any]:
        """Load generic object data.

        Args:
            object_type: Type of object
            object_id: Object ID

        Returns:
            Dictionary with object data
        """
        pass

    @abstractmethod
    def delete_object(
            self,
            object_type: str,
            object_id: str
    ) -> bool:
        """Delete generic object data.

        Args:
            object_type: Type of object
            object_id: Object ID

        Returns:
            True if deletion was successful, False otherwise
        """
        pass

    @abstractmethod
    def list_objects(
            self,
            object_type: str,
            filter_criteria: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """List all objects of a specific type, optionally filtered.

        Args:
            object_type: Type of object
            filter_criteria: Optional dictionary with filter criteria

        Returns:
            List of dictionaries with object metadata
        """
        pass