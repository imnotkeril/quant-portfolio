"""
Report template engine implementation.
"""
import logging
import os
from typing import Dict, Any, Optional
from pathlib import Path
import jinja2


class TemplateEngine:
    """
    Report template engine.
    Handles rendering templates for report generation.
    """

    def __init__(self, template_dir: str = "./templates"):
        """
        Initialize template engine

        Args:
            template_dir: Directory containing templates
        """
        self.template_dir = Path(template_dir)
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )

        # Add custom filters
        self.env.filters['format_currency'] = self._format_currency
        self.env.filters['format_percentage'] = self._format_percentage
        self.env.filters['format_number'] = self._format_number

        logging.info(f"Initialized TemplateEngine with template directory: {self.template_dir}")

    def render_pdf(
            self,
            template_name: str,
            context: Dict[str, Any],
            output_path: str
    ) -> str:
        """
        Render PDF report

        Args:
            template_name: Template name
            context: Template context data
            output_path: Path to save the output

        Returns:
            Path to the rendered PDF
        """
        try:
            # First render HTML
            html_content = self.render_html_string(template_name, context)

            # Convert HTML to PDF
            from weasyprint import HTML
            pdf = HTML(string=html_content).write_pdf()

            # Save to file
            with open(output_path, 'wb') as f:
                f.write(pdf)

            logging.info(f"Rendered PDF report to {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error rendering PDF: {e}")
            raise

    def render_html(
            self,
            template_name: str,
            context: Dict[str, Any],
            output_path: str
    ) -> str:
        """
        Render HTML report

        Args:
            template_name: Template name
            context: Template context data
            output_path: Path to save the output

        Returns:
            Path to the rendered HTML
        """
        try:
            # Render HTML
            html_content = self.render_html_string(template_name, context)

            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)

            logging.info(f"Rendered HTML report to {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error rendering HTML: {e}")
            raise

    def render_html_string(
            self,
            template_name: str,
            context: Dict[str, Any]
    ) -> str:
        """
        Render HTML template to string

        Args:
            template_name: Template name
            context: Template context data

        Returns:
            Rendered HTML string
        """
        try:
            template = self.env.get_template(f"{template_name}.html")
            html_content = template.render(**context)
            return html_content
        except Exception as e:
            logging.error(f"Error rendering HTML template: {e}")
            raise

    def export_excel(
            self,
            data: Dict[str, Any],
            output_path: str
    ) -> str:
        """
        Export data to Excel

        Args:
            data: Data to export
            output_path: Path to save the output

        Returns:
            Path to the saved Excel file
        """
        try:
            import pandas as pd

            # Convert data to DataFrame
            sheets = {}
            for sheet_name, sheet_data in data.items():
                if isinstance(sheet_data, list):
                    sheets[sheet_name] = pd.DataFrame(sheet_data)
                elif isinstance(sheet_data, pd.DataFrame):
                    sheets[sheet_name] = sheet_data
                else:
                    sheets[sheet_name] = pd.DataFrame([sheet_data])

            # Create Excel writer
            with pd.ExcelWriter(output_path) as writer:
                for sheet_name, df in sheets.items():
                    df.to_excel(writer, sheet_name=sheet_name, index=False)

            logging.info(f"Exported data to Excel: {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error exporting to Excel: {e}")
            raise

    def export_json(
            self,
            data: Dict[str, Any],
            output_path: str
    ) -> str:
        """
        Export data to JSON

        Args:
            data: Data to export
            output_path: Path to save the output

        Returns:
            Path to the saved JSON file
        """
        try:
            import json

            # Convert to serializable format
            from app.utils.formatters import json_serializer

            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=json_serializer)

            logging.info(f"Exported data to JSON: {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error exporting to JSON: {e}")
            raise

    def export_csv(
            self,
            data: Dict[str, Any],
            output_path: str
    ) -> str:
        """
        Export data to CSV

        Args:
            data: Data to export
            output_path: Path to save the output

        Returns:
            Path to the saved CSV file
        """
        try:
            import pandas as pd

            # Convert to DataFrame
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, pd.DataFrame):
                df = data
            else:
                df = pd.DataFrame([data])

            # Save to file
            df.to_csv(output_path, index=False)

            logging.info(f"Exported data to CSV: {output_path}")
            return output_path
        except Exception as e:
            logging.error(f"Error exporting to CSV: {e}")
            raise

    def _format_currency(self, value, symbol='$', decimals=2):
        """Format value as currency"""
        if value is None:
            return ""
        return f"{symbol}{value:,.{decimals}f}"

    def _format_percentage(self, value, decimals=2):
        """Format value as percentage"""
        if value is None:
            return ""
        return f"{value * 100:.{decimals}f}%"

    def _format_number(self, value, decimals=2):
        """Format value as number"""
        if value is None:
            return ""
        return f"{value:,.{decimals}f}"