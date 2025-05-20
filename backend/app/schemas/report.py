from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

class ReportRequest(BaseModel):
    """Schema for generating a portfolio report."""
    portfolio_id: str = Field(..., description="Portfolio ID")
    report_type: str = Field(..., description="Report type (performance, risk, optimization, etc.)")
    start_date: Optional[str] = Field(None, description="Start date for report data (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date for report data (YYYY-MM-DD)")
    benchmark: Optional[str] = Field(None, description="Benchmark ticker for comparison")
    sections: Optional[List[str]] = Field(None, description="Specific report sections to include")
    format: str = Field("pdf", description="Report format (pdf, html, excel)")
    run_in_background: bool = Field(False, description="Whether to run report generation in background")

class ReportResponse(BaseModel):
    """Schema for report generation response."""
    status: str = Field(..., description="Report status (completed, processing, failed)")
    report_path: Optional[str] = Field(None, description="Path to the generated report")
    message: Optional[str] = Field(None, description="Status message")
    portfolio_id: str = Field(..., description="Portfolio ID")
    report_type: str = Field(..., description="Report type")
    format: str = Field(..., description="Report format")
    generated_at: Optional[datetime] = Field(None, description="Generation timestamp")
    report_id: Optional[str] = Field(None, description="Unique report ID")

class ComparisonReportRequest(BaseModel):
    """Schema for generating a portfolio comparison report."""
    portfolio_ids: List[str] = Field(..., description="List of portfolio IDs to compare")
    report_type: str = Field("comparison", description="Report type")
    start_date: Optional[str] = Field(None, description="Start date for report data (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date for report data (YYYY-MM-DD)")
    benchmark: Optional[str] = Field(None, description="Benchmark ticker for comparison")
    sections: Optional[List[str]] = Field(None, description="Specific report sections to include")
    format: str = Field("pdf", description="Report format (pdf, html, excel)")
    run_in_background: bool = Field(False, description="Whether to run report generation in background")

class ScheduleReportRequest(BaseModel):
    """Schema for scheduling a periodic report."""
    portfolio_id: str = Field(..., description="Portfolio ID")
    report_type: str = Field(..., description="Report type (performance, risk, optimization, etc.)")
    frequency: str = Field(..., description="Report frequency (daily, weekly, monthly, quarterly)")
    email: Optional[str] = Field(None, description="Email to send the report to")
    report_params: Dict[str, Any] = Field({}, description="Additional report parameters")

class ScheduleReportResponse(BaseModel):
    """Schema for scheduled report response."""
    report_id: str = Field(..., description="Unique scheduled report ID")
    portfolio_id: str = Field(..., description="Portfolio ID")
    report_type: str = Field(..., description="Report type")
    frequency: str = Field(..., description="Report frequency")
    status: str = Field(..., description="Schedule status (active, paused)")
    next_run: Optional[datetime] = Field(None, description="Next scheduled run time")
    email: Optional[str] = Field(None, description="Email for report delivery")

class ReportHistoryResponse(BaseModel):
    """Schema for report history entry."""
    report_id: str = Field(..., description="Unique report ID")
    portfolio_id: str = Field(..., description="Portfolio ID")
    report_type: str = Field(..., description="Report type")
    format: str = Field(..., description="Report format")
    generated_at: datetime = Field(..., description="Generation timestamp")
    status: str = Field(..., description="Report status (completed, failed)")
    file_path: Optional[str] = Field(None, description="Path to the report file")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    duration_ms: Optional[int] = Field(None, description="Generation duration in milliseconds")
    parameters: Dict[str, Any] = Field({}, description="Report parameters used")

class ReportSection(BaseModel):
    """Schema for a report template section."""
    id: str = Field(..., description="Section ID")
    name: str = Field(..., description="Section name")
    description: Optional[str] = Field(None, description="Section description")
    required: bool = Field(False, description="Whether the section is required")
    default: bool = Field(True, description="Whether the section is included by default")
    order: int = Field(0, description="Display order of the section")
    dependencies: Optional[List[str]] = Field(None, description="IDs of sections this section depends on")

class ReportTemplateRequest(BaseModel):
    """Schema for creating a custom report template."""
    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    sections: List[str] = Field(..., description="Section IDs to include")
    format: str = Field("pdf", description="Default format (pdf, html, excel)")
    style_settings: Optional[Dict[str, Any]] = Field(None, description="Custom style settings")

    @validator('sections')
    def sections_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('At least one section must be included')
        return v

class ReportTemplateResponse(BaseModel):
    """Schema for report template response."""
    template_id: str = Field(..., description="Unique template ID")
    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    format: str = Field(..., description="Default format")
    sections: Optional[List[ReportSection]] = Field(None, description="Sections in the template")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    is_system: bool = Field(False, description="Whether this is a system template")

class ReportFileInfoResponse(BaseModel):
    """Schema for report file information."""
    report_id: str = Field(..., description="Unique report ID")
    file_path: str = Field(..., description="Path to the report file")
    file_name: str = Field(..., description="File name")
    format: str = Field(..., description="File format")
    mime_type: str = Field(..., description="MIME type")
    file_size: int = Field(..., description="File size in bytes")
    created_at: datetime = Field(..., description="File creation timestamp")
    download_url: str = Field(..., description="URL to download the file")