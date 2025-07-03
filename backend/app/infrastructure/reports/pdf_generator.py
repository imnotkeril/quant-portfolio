"""
PDF report generator implementation.
"""
import logging
import os
from typing import Dict, Any, Optional, List
from pathlib import Path
import base64

from app.infrastructure.reports.template_engine import TemplateEngine


class PDFGenerator:
    """
    PDF report generator.
    Generates PDF reports from templates and data.
    """

    def __init__(self, template_dir: str = "./templates/pdf"):
        """
        Initialize PDF generator

        Args:
            template_dir: Directory containing PDF templates
        """
        self.template_dir = Path(template_dir)
        self.template_engine = TemplateEngine(template_dir)
        logging.info(f"Initialized PDFGenerator with template directory: {self.template_dir}")

    def generate_report(
            self,
            template_name: str,
            data: Dict[str, Any],
            output_path: str,
            options: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate PDF report

        Args:
            template_name: Template name
            data: Report data
            output_path: Path to save the output
            options: Additional options for PDF generation

        Returns:
            Path to the generated PDF
        """
        try:
            # Prepare context with data
            context = self._prepare_context(data, options)

            # Render PDF using template engine
            pdf_path = self.template_engine.render_pdf(
                template_name,
                context,
                output_path
            )

            logging.info(f"Generated PDF report: {pdf_path}")
            return pdf_path
        except Exception as e:
            logging.error(f"Error generating PDF report: {e}")
            raise

    def generate_portfolio_report(
            self,
            portfolio_data: Dict[str, Any],
            analytics_data: Dict[str, Any],
            output_path: str,
            template_name: str = "portfolio_report",
            include_sections: Optional[List[str]] = None
    ) -> str:
        """
        Generate portfolio report

        Args:
            portfolio_data: Portfolio data
            analytics_data: Portfolio analytics data
            output_path: Path to save the output
            template_name: Template name
            include_sections: List of sections to include

        Returns:
            Path to the generated report
        """
        try:
            # Combine data
            data = {
                "portfolio": portfolio_data,
                "analytics": analytics_data,
                "sections": include_sections or [
                    "summary", "performance", "risk", "allocation", "details"
                ],
                "report_type": "portfolio",
                "timestamp": self._get_timestamp()
            }

            # Generate report
            return self.generate_report(template_name, data, output_path)
        except Exception as e:
            logging.error(f"Error generating portfolio report: {e}")
            raise

    def _prepare_context(
            self,
            data: Dict[str, Any],
            options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Prepare template context

        Args:
            data: Report data
            options: Additional options

        Returns:
            Template context
        """
        context = data.copy()

        # Add options
        if options:
            context.update(options)

        # Add standard context
        context.update({
            "timestamp": self._get_timestamp(),
            "generator": "Investment Portfolio Management System",
            "version": "1.0.0"
        })

        # Add chart helpers
        context.update({
            "encode_chart": self._encode_chart
        })

        return context

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _encode_chart(self, chart_data: Dict[str, Any]) -> str:
        """
        Encode chart data as base64 for embedding in PDF

        Args:
            chart_data: Chart data

        Returns:
            Base64 encoded chart image
        """
        try:
            import io
            import matplotlib.pyplot as plt

            # Create figure
            fig = plt.figure(figsize=(10, 6))

            # Plot data based on chart type
            chart_type = chart_data.get("type", "line")

            if chart_type == "line":
                for series in chart_data.get("series", []):
                    plt.plot(
                        series.get("x", []),
                        series.get("y", []),
                        label=series.get("name", "")
                    )
                plt.legend()

            elif chart_type == "bar":
                x = chart_data.get("categories", [])
                for series in chart_data.get("series", []):
                    plt.bar(
                        x,
                        series.get("data", []),
                        label=series.get("name", "")
                    )
                plt.legend()

            elif chart_type == "pie":
                plt.pie(
                    chart_data.get("data", []),
                    labels=chart_data.get("labels", []),
                    autopct='%1.1f%%'
                )

            # Set title and labels
            plt.title(chart_data.get("title", ""))
            plt.xlabel(chart_data.get("xAxis", {}).get("title", ""))
            plt.ylabel(chart_data.get("yAxis", {}).get("title", ""))

            # Save to buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)

            # Encode as base64
            chart_base64 = base64.b64encode(buf.read()).decode('utf-8')

            # Close figure
            plt.close(fig)

            return f"data:image/png;base64,{chart_base64}"
        except Exception as e:
            logging.error(f"Error encoding chart: {e}")
            return ""