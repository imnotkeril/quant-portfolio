from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
import uuid


class ReportType(str, Enum):
    """Report type enumeration."""
    PERFORMANCE = "performance"
    RISK = "risk"
    OPTIMIZATION = "optimization"
    SCENARIO = "scenario"
    HISTORICAL = "historical"
    COMPARISON = "comparison"
    COMPREHENSIVE = "comprehensive"
    CUSTOM = "custom"


class ReportFormat(str, Enum):
    """Report format enumeration."""
    PDF = "pdf"
    HTML = "html"
    EXCEL = "excel"
    JSON = "json"
    CSV = "csv"


class ReportFrequency(str, Enum):
    """Report generation frequency enumeration."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"
    ONCE = "once"


class ReportTemplate:
    """Report template model."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            report_type: ReportType = ReportType.PERFORMANCE,
            sections: List[str] = None,
            format: ReportFormat = ReportFormat.PDF,
            style_settings: Dict[str, Any] = None,
            created_at: datetime = None
    ):
        """Initialize a report template.

        Args:
            id: Template ID
            name: Template name
            description: Template description
            report_type: Type of report
            sections: List of sections to include
            format: Report format
            style_settings: Dictionary of style settings
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.report_type = report_type
        self.sections = sections or []
        self.format = format
        self.style_settings = style_settings or {}
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the template to a dictionary.

        Returns:
            Dictionary representation of the template
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "report_type": self.report_type.value,
            "sections": self.sections,
            "format": self.format.value,
            "style_settings": self.style_settings,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ReportTemplate':
        """Create a template from a dictionary.

        Args:
            data: Dictionary containing template data

        Returns:
            ReportTemplate instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data["name"],
            description=data.get("description", ""),
            report_type=ReportType(data.get("report_type", "performance")),
            sections=data.get("sections", []),
            format=ReportFormat(data.get("format", "pdf")),
            style_settings=data.get("style_settings", {}),
            created_at=created_at
        )


class Report:
    """Generated report model."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            template_id: str = None,
            portfolio_id: str = None,
            comparison_portfolio_ids: List[str] = None,
            report_type: ReportType = ReportType.PERFORMANCE,
            format: ReportFormat = ReportFormat.PDF,
            file_path: str = None,
            start_date: str = None,
            end_date: str = None,
            benchmark: str = None,
            sections: List[str] = None,
            generation_status: str = "pending",
            metadata: Dict[str, Any] = None,
            created_at: datetime = None
    ):
        """Initialize a report.

        Args:
            id: Report ID
            name: Report name
            description: Report description
            template_id: Template ID used
            portfolio_id: Portfolio ID
            comparison_portfolio_ids: List of comparison portfolio IDs
            report_type: Type of report
            format: Report format
            file_path: Path to the generated file
            start_date: Start date for data (YYYY-MM-DD)
            end_date: End date for data (YYYY-MM-DD)
            benchmark: Benchmark symbol
            sections: List of sections included
            generation_status: Status of generation (pending, in_progress, completed, failed)
            metadata: Additional metadata
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.template_id = template_id
        self.portfolio_id = portfolio_id
        self.comparison_portfolio_ids = comparison_portfolio_ids or []
        self.report_type = report_type
        self.format = format
        self.file_path = file_path
        self.start_date = start_date
        self.end_date = end_date
        self.benchmark = benchmark
        self.sections = sections or []
        self.generation_status = generation_status
        self.metadata = metadata or {}
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the report to a dictionary.

        Returns:
            Dictionary representation of the report
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "report_type": self.report_type.value,
            "format": self.format.value,
            "generation_status": self.generation_status,
            "created_at": self.created_at.isoformat()
        }

        if self.template_id:
            result["template_id"] = self.template_id

        if self.portfolio_id:
            result["portfolio_id"] = self.portfolio_id

        if self.comparison_portfolio_ids:
            result["comparison_portfolio_ids"] = self.comparison_portfolio_ids

        if self.file_path:
            result["file_path"] = self.file_path

        if self.start_date:
            result["start_date"] = self.start_date

        if self.end_date:
            result["end_date"] = self.end_date

        if self.benchmark:
            result["benchmark"] = self.benchmark

        if self.sections:
            result["sections"] = self.sections

        if self.metadata:
            result["metadata"] = self.metadata

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Report':
        """Create a report from a dictionary.

        Args:
            data: Dictionary containing report data

        Returns:
            Report instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data.get("name", ""),
            description=data.get("description", ""),
            template_id=data.get("template_id"),
            portfolio_id=data.get("portfolio_id"),
            comparison_portfolio_ids=data.get("comparison_portfolio_ids"),
            report_type=ReportType(data.get("report_type", "performance")),
            format=ReportFormat(data.get("format", "pdf")),
            file_path=data.get("file_path"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            benchmark=data.get("benchmark"),
            sections=data.get("sections"),
            generation_status=data.get("generation_status", "pending"),
            metadata=data.get("metadata", {}),
            created_at=created_at
        )


class ScheduledReport:
    """Scheduled report model."""

    def __init__(
            self,
            id: str = None,
            name: str = "",
            description: str = "",
            template_id: str = None,
            portfolio_id: str = None,
            comparison_portfolio_ids: List[str] = None,
            report_type: ReportType = ReportType.PERFORMANCE,
            format: ReportFormat = ReportFormat.PDF,
            frequency: ReportFrequency = ReportFrequency.MONTHLY,
            next_generation: str = None,
            last_generated: str = None,
            email_recipients: List[str] = None,
            is_active: bool = True,
            parameters: Dict[str, Any] = None,
            created_at: datetime = None
    ):
        """Initialize a scheduled report.

        Args:
            id: Schedule ID
            name: Schedule name
            description: Schedule description
            template_id: Template ID to use
            portfolio_id: Portfolio ID
            comparison_portfolio_ids: List of comparison portfolio IDs
            report_type: Type of report
            format: Report format
            frequency: Generation frequency
            next_generation: Next generation date (YYYY-MM-DD)
            last_generated: Last generation date (YYYY-MM-DD)
            email_recipients: List of email recipients
            is_active: Whether the schedule is active
            parameters: Additional parameters
            created_at: Creation timestamp
        """
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.template_id = template_id
        self.portfolio_id = portfolio_id
        self.comparison_portfolio_ids = comparison_portfolio_ids or []
        self.report_type = report_type
        self.format = format
        self.frequency = frequency
        self.next_generation = next_generation
        self.last_generated = last_generated
        self.email_recipients = email_recipients or []
        self.is_active = is_active
        self.parameters = parameters or {}
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the scheduled report to a dictionary.

        Returns:
            Dictionary representation of the scheduled report
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "report_type": self.report_type.value,
            "format": self.format.value,
            "frequency": self.frequency.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }

        if self.template_id:
            result["template_id"] = self.template_id

        if self.portfolio_id:
            result["portfolio_id"] = self.portfolio_id

        if self.comparison_portfolio_ids:
            result["comparison_portfolio_ids"] = self.comparison_portfolio_ids

        if self.next_generation:
            result["next_generation"] = self.next_generation

        if self.last_generated:
            result["last_generated"] = self.last_generated

        if self.email_recipients:
            result["email_recipients"] = self.email_recipients

        if self.parameters:
            result["parameters"] = self.parameters

        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScheduledReport':
        """Create a scheduled report from a dictionary.

        Args:
            data: Dictionary containing scheduled report data

        Returns:
            ScheduledReport instance
        """
        created_at = data.get("created_at")
        if created_at and isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        return cls(
            id=data.get("id"),
            name=data.get("name", ""),
            description=data.get("description", ""),
            template_id=data.get("template_id"),
            portfolio_id=data.get("portfolio_id"),
            comparison_portfolio_ids=data.get("comparison_portfolio_ids"),
            report_type=ReportType(data.get("report_type", "performance")),
            format=ReportFormat(data.get("format", "pdf")),
            frequency=ReportFrequency(data.get("frequency", "monthly")),
            next_generation=data.get("next_generation"),
            last_generated=data.get("last_generated"),
            email_recipients=data.get("email_recipients", []),
            is_active=data.get("is_active", True),
            parameters=data.get("parameters", {}),
            created_at=created_at
        )