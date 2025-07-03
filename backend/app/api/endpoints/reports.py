from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response
from typing import List, Optional, Dict, Any
from fastapi.responses import FileResponse
import os

from app.core.services.report_service import ReportService
from app.schemas.report import (
    ReportRequest,
    ReportResponse,
    ComparisonReportRequest,
    ScheduleReportRequest,
    ScheduleReportResponse,
    ReportHistoryResponse,
    ReportTemplateRequest,
    ReportTemplateResponse
)

router = APIRouter(prefix="/reports", tags=["reports"])


# Dependency to get the report service
def get_report_service():
    return ReportService()


@router.post("/generate", response_model=ReportResponse)
def generate_report(
        request: ReportRequest,
        background_tasks: BackgroundTasks,
        report_service: ReportService = Depends(get_report_service)
):
    """
    Generate a portfolio report.

    This endpoint creates a comprehensive report for a portfolio, including performance
    analysis, risk metrics, and other analytics. Reports can be generated in various formats.
    """
    try:
        # For very complex reports, we might want to run this in the background
        # and notify the client when it's done
        if request.run_in_background:
            # Add to background tasks
            background_tasks.add_task(
                report_service.generate_report,
                portfolio_id=request.portfolio_id,
                report_type=request.report_type,
                start_date=request.start_date,
                end_date=request.end_date,
                benchmark=request.benchmark,
                sections=request.sections,
                format=request.format
            )

            return {
                "status": "processing",
                "message": "Report generation started in background",
                "portfolio_id": request.portfolio_id,
                "report_type": request.report_type,
                "format": request.format
            }
        else:
            # Generate the report synchronously
            report_path = report_service.generate_report(
                portfolio_id=request.portfolio_id,
                report_type=request.report_type,
                start_date=request.start_date,
                end_date=request.end_date,
                benchmark=request.benchmark,
                sections=request.sections,
                format=request.format
            )

            return {
                "status": "completed",
                "report_path": report_path,
                "portfolio_id": request.portfolio_id,
                "report_type": request.report_type,
                "format": request.format
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.post("/compare", response_model=ReportResponse)
def generate_comparison_report(
        request: ComparisonReportRequest,
        background_tasks: BackgroundTasks,
        report_service: ReportService = Depends(get_report_service)
):
    """
    Generate a portfolio comparison report.

    This endpoint creates a report comparing multiple portfolios, highlighting differences
    in composition, performance, risk characteristics, and other metrics.
    """
    try:
        if request.run_in_background:
            # Add to background tasks
            background_tasks.add_task(
                report_service.generate_comparison_report,
                portfolio_ids=request.portfolio_ids,
                report_type=request.report_type,
                start_date=request.start_date,
                end_date=request.end_date,
                benchmark=request.benchmark,
                sections=request.sections,
                format=request.format
            )

            return {
                "status": "processing",
                "message": "Comparison report generation started in background",
                "portfolio_ids": request.portfolio_ids,
                "report_type": request.report_type,
                "format": request.format
            }
        else:
            # Generate the report synchronously
            report_path = report_service.generate_comparison_report(
                portfolio_ids=request.portfolio_ids,
                report_type=request.report_type,
                start_date=request.start_date,
                end_date=request.end_date,
                benchmark=request.benchmark,
                sections=request.sections,
                format=request.format
            )

            return {
                "status": "completed",
                "report_path": report_path,
                "portfolio_ids": request.portfolio_ids,
                "report_type": request.report_type,
                "format": request.format
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison report generation failed: {str(e)}")


@router.post("/schedule", response_model=ScheduleReportResponse)
def schedule_report(
        request: ScheduleReportRequest,
        report_service: ReportService = Depends(get_report_service)
):
    """
    Schedule a periodic report generation.

    This endpoint sets up automated generation of reports on a regular schedule,
    with options for delivery via email or other notification methods.
    """
    try:
        report_id = report_service.schedule_report(
            portfolio_id=request.portfolio_id,
            report_type=request.report_type,
            frequency=request.frequency,
            email=request.email,
            **request.report_params
        )

        return {
            "report_id": report_id,
            "portfolio_id": request.portfolio_id,
            "report_type": request.report_type,
            "frequency": request.frequency,
            "status": "scheduled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule report: {str(e)}")


@router.get("/scheduled", response_model=List[ScheduleReportResponse])
def list_scheduled_reports(
        report_service: ReportService = Depends(get_report_service)
):
    """
    List all scheduled reports.

    This endpoint returns a list of all reports that are scheduled for automatic generation.
    """
    try:
        scheduled_reports = report_service.list_scheduled_reports()
        return scheduled_reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list scheduled reports: {str(e)}")


@router.delete("/scheduled/{report_id}", status_code=204)
def cancel_scheduled_report(
        report_id: str,
        report_service: ReportService = Depends(get_report_service)
):
    """
    Cancel a scheduled report.

    This endpoint stops the automatic generation of a previously scheduled report.
    """
    try:
        success = report_service.cancel_scheduled_report(report_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Scheduled report '{report_id}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel scheduled report: {str(e)}")


@router.get("/history", response_model=List[ReportHistoryResponse])
def list_report_history(
        portfolio_id: Optional[str] = None,
        report_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        report_service: ReportService = Depends(get_report_service)
):
    """
    List report generation history.

    This endpoint returns a history of generated reports, with optional filtering
    by portfolio, report type, and date range.
    """
    try:
        history = report_service.list_report_history(
            portfolio_id=portfolio_id,
            report_type=report_type,
            start_date=start_date,
            end_date=end_date
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list report history: {str(e)}")


@router.get("/templates", response_model=List[ReportTemplateResponse])
def get_report_templates(
        report_service: ReportService = Depends(get_report_service)
):
    """
    Get available report templates.

    This endpoint lists all available templates that can be used for report generation.
    """
    try:
        templates = report_service.get_report_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get report templates: {str(e)}")


@router.post("/templates", response_model=ReportTemplateResponse)
def create_report_template(
        request: ReportTemplateRequest,
        report_service: ReportService = Depends(get_report_service)
):
    """
    Create a custom report template.

    This endpoint allows users to define and save custom templates for future report generation.
    """
    try:
        template_id = report_service.create_report_template(
            name=request.name,
            description=request.description,
            sections=request.sections,
            format=request.format,
            style_settings=request.style_settings
        )

        return {
            "template_id": template_id,
            "name": request.name,
            "description": request.description,
            "format": request.format
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create report template: {str(e)}")


@router.get("/download/{report_id}")
def download_report(
        report_id: str,
        report_service: ReportService = Depends(get_report_service)
):
    try:

        reports = report_service.list_report_history(report_id=report_id)
        if not reports:
            raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found")

        report_info = reports[0]
        if 'file_path' not in report_info:
            raise HTTPException(status_code=404, detail=f"Report file path not found")

        file_path = report_info['file_path']

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Report file not found")

        file_name = os.path.basename(file_path)

        return FileResponse(
            path=file_path,
            filename=file_name,
            media_type=report_service.get_content_type(file_path)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")