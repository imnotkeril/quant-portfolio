from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from enum import Enum


class NotificationType(str, Enum):
    """Notification type enumeration."""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NotificationPriority(str, Enum):
    """Notification priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationProvider(ABC):
    """Abstract interface for notification providers."""

    @abstractmethod
    def send_notification(
            self,
            user_id: str,
            title: str,
            message: str,
            notification_type: NotificationType = NotificationType.INFO,
            priority: NotificationPriority = NotificationPriority.MEDIUM,
            data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Send a notification to a user.

        Args:
            user_id: User ID
            title: Notification title
            message: Notification message
            notification_type: Notification type
            priority: Notification priority
            data: Optional additional data

        Returns:
            Notification ID
        """
        pass

    @abstractmethod
    def send_email(
            self,
            recipients: List[str],
            subject: str,
            body: str,
            attachments: Optional[List[str]] = None,
            html: bool = False
    ) -> bool:
        """Send an email to one or more recipients.

        Args:
            recipients: List of recipient email addresses
            subject: Email subject
            body: Email body
            attachments: Optional list of attachment file paths
            html: Whether the body is HTML

        Returns:
            True if the email was sent successfully, False otherwise
        """
        pass

    @abstractmethod
    def send_report_notification(
            self,
            user_id: str,
            report_id: str,
            report_name: str,
            report_type: str,
            file_path: str
    ) -> str:
        """Send a notification about a generated report.

        Args:
            user_id: User ID
            report_id: Report ID
            report_name: Report name
            report_type: Report type
            file_path: Path to the report file

        Returns:
            Notification ID
        """
        pass

    @abstractmethod
    def send_optimization_notification(
            self,
            user_id: str,
            portfolio_id: str,
            portfolio_name: str,
            optimization_id: str,
            status: str,
            message: str
    ) -> str:
        """Send a notification about an optimization result.

        Args:
            user_id: User ID
            portfolio_id: Portfolio ID
            portfolio_name: Portfolio name
            optimization_id: Optimization ID
            status: Optimization status
            message: Notification message

        Returns:
            Notification ID
        """
        pass

    @abstractmethod
    def get_user_notifications(
            self,
            user_id: str,
            unread_only: bool = False,
            limit: int = 100,
            offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user.

        Args:
            user_id: User ID
            unread_only: Whether to get only unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip

        Returns:
            List of notification dictionaries
        """
        pass

    @abstractmethod
    def mark_notification_as_read(
            self,
            notification_id: str,
            user_id: str
    ) -> bool:
        """Mark a notification as read.

        Args:
            notification_id: Notification ID
            user_id: User ID

        Returns:
            True if the notification was marked as read, False otherwise
        """
        pass

    @abstractmethod
    def delete_notification(
            self,
            notification_id: str,
            user_id: str
    ) -> bool:
        """Delete a notification.

        Args:
            notification_id: Notification ID
            user_id: User ID

        Returns:
            True if the notification was deleted, False otherwise
        """
        pass