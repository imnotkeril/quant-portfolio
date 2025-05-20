from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from ..domain.report import ReportFormat, ReportType


class ReportGenerator(ABC):
    """Abstract interface for report generators."""

    @abstractmethod
    def generate_performance_report(
            self,
            portfolio_id: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            benchmark: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a performance report for a portfolio.

        Args:
            portfolio_id: Portfolio ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)
            benchmark: Optional benchmark symbol
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_risk_report(
            self,
            portfolio_id: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            benchmark: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a risk report for a portfolio.

        Args:
            portfolio_id: Portfolio ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)
            benchmark: Optional benchmark symbol
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_optimization_report(
            self,
            portfolio_id: str,
            optimization_id: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate an optimization report for a portfolio.

        Args:
            portfolio_id: Portfolio ID
            optimization_id: Optional optimization result ID
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_scenario_report(
            self,
            portfolio_id: str,
            scenario_id: Optional[str] = None,
            scenario_chain_id: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a scenario analysis report for a portfolio.

        Args:
            portfolio_id: Portfolio ID
            scenario_id: Optional scenario ID
            scenario_chain_id: Optional scenario chain ID
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_comparison_report(
            self,
            portfolio_ids: List[str],
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            benchmark: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a comparison report for multiple portfolios.

        Args:
            portfolio_ids: List of portfolio IDs
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)
            benchmark: Optional benchmark symbol
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_comprehensive_report(
            self,
            portfolio_id: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
            benchmark: Optional[str] = None,
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a comprehensive report for a portfolio.

        Args:
            portfolio_id: Portfolio ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)
            benchmark: Optional benchmark symbol
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def generate_custom_report(
            self,
            report_type: ReportType,
            parameters: Dict[str, Any],
            sections: Optional[List[str]] = None,
            format: ReportFormat = ReportFormat.PDF,
            template_id: Optional[str] = None,
            output_path: Optional[str] = None
    ) -> str:
        """Generate a custom report.

        Args:
            report_type: Report type
            parameters: Report parameters
            sections: Optional list of sections to include
            format: Report format
            template_id: Optional template ID
            output_path: Optional output path

        Returns:
            Path to the generated report file
        """
        pass

    @abstractmethod
    def get_available_sections(
            self,
            report_type: ReportType
    ) -> List[Dict[str, Any]]:
        """Get available sections for a report type.

        Args:
            report_type: Report type

        Returns:
            List of dictionaries with section information
        """
        pass

    @abstractmethod
    def get_available_templates(
            self,
            report_type: Optional[ReportType] = None
    ) -> List[Dict[str, Any]]:
        """Get available templates, optionally filtered by report type.

        Args:
            report_type: Optional report type to filter by

        Returns:
            List of dictionaries with template information
        """
        pass

    @abstractmethod
    def create_template(
            self,
            name: str,
            description: str,
            report_type: ReportType,
            sections: List[str],
            format: ReportFormat = ReportFormat.PDF,
            style_settings: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new report template.

        Args:
            name: Template name
            description: Template description
            report_type: Report type
            sections: List of sections to include
            format: Report format
            style_settings: Optional style settings

        Returns:
            Template ID
        """
        pass