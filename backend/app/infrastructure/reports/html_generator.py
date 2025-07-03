"""
HTML report generator implementation.
"""
import logging
import os
from typing import Dict, Any, Optional, List
from pathlib import Path
import json

from app.infrastructure.reports.template_engine import TemplateEngine


class HTMLGenerator:
    """
    HTML report generator.
    Generates HTML reports from templates and data.
    """

    def __init__(self, template_dir: str = "./templates/html"):
        """
        Initialize HTML generator

        Args:
            template_dir: Directory containing HTML templates
        """
        self.template_dir = Path(template_dir)
        self.template_engine = TemplateEngine(template_dir)
        logging.info(f"Initialized HTMLGenerator with template directory: {self.template_dir}")

    def generate_report(
            self,
            template_name: str,
            data: Dict[str, Any],
            output_path: str,
            options: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate HTML report

        Args:
            template_name: Template name
            data: Report data
            output_path: Path to save the output
            options: Additional options for HTML generation

        Returns:
            Path to the generated HTML
        """
        try:
            # Prepare context with data
            context = self._prepare_context(data, options)

            # Render HTML using template engine
            html_path = self.template_engine.render_html(
                template_name,
                context,
                output_path
            )

            logging.info(f"Generated HTML report: {html_path}")
            return html_path
        except Exception as e:
            logging.error(f"Error generating HTML report: {e}")
            raise

    def generate_portfolio_report(
            self,
            portfolio_data: Dict[str, Any],
            analytics_data: Dict[str, Any],
            output_path: str,
            template_name: str = "portfolio_report",
            include_sections: Optional[List[str]] = None,
            interactive: bool = True
    ) -> str:
        """
        Generate portfolio report

        Args:
            portfolio_data: Portfolio data
            analytics_data: Portfolio analytics data
            output_path: Path to save the output
            template_name: Template name
            include_sections: List of sections to include
            interactive: Whether to include interactive charts

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
                "interactive": interactive,
                "timestamp": self._get_timestamp()
            }

            # For interactive charts, prepare chart data
            if interactive:
                data["charts"] = self._prepare_chart_data(portfolio_data, analytics_data)

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

        # Add JSON utilities for interactive features
        context.update({
            "to_json": lambda x: json.dumps(x)
        })

        return context

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _prepare_chart_data(
            self,
            portfolio_data: Dict[str, Any],
            analytics_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Prepare chart data for interactive charts

        Args:
            portfolio_data: Portfolio data
            analytics_data: Analytics data

        Returns:
            Chart data for templates
        """
        charts = {}

        # Portfolio allocation chart
        assets = portfolio_data.get("assets", [])
        charts["allocation"] = {
            "type": "pie",
            "data": [asset.get("weight", 0) for asset in assets],
            "labels": [asset.get("ticker", "") for asset in assets]
        }

        # Performance chart
        if "returns" in analytics_data and "dates" in analytics_data:
            charts["performance"] = {
                "type": "line",
                "data": analytics_data.get("cumulative_returns", {}),
                "categories": analytics_data.get("dates", []),
                "title": "Cumulative Performance"
            }

        # Risk chart
        if "drawdowns" in analytics_data and "dates" in analytics_data:
            charts["drawdowns"] = {
                "type": "line",
                "data": analytics_data.get("drawdowns", {}),
                "categories": analytics_data.get("dates", []),
                "title": "Drawdowns"
            }

        return charts