from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from enum import Enum
from datetime import datetime


class PaginationParams(BaseModel):
    """Common pagination parameters."""
    page: int = Field(1, description="Page number")
    page_size: int = Field(20, description="Items per page")

    @validator('page')
    def page_must_be_positive(cls, v):
        if v < 1:
            raise ValueError('Page number must be positive')
        return v

    @validator('page_size')
    def page_size_must_be_positive(cls, v):
        if v < 1:
            raise ValueError('Page size must be positive')
        if v > 100:
            raise ValueError('Page size must not exceed 100')
        return v


class SortOrder(str, Enum):
    """Enumeration of sort orders."""
    ASC = "asc"
    DESC = "desc"


class SortParams(BaseModel):
    """Common sorting parameters."""
    sort_by: str = Field(..., description="Field to sort by")
    sort_order: SortOrder = Field(SortOrder.ASC, description="Sort order")


class FilterOperator(str, Enum):
    """Enumeration of filter operators."""
    EQ = "eq"  # Equal
    NEQ = "neq"  # Not equal
    GT = "gt"  # Greater than
    GTE = "gte"  # Greater than or equal
    LT = "lt"  # Less than
    LTE = "lte"  # Less than or equal
    CONTAINS = "contains"  # Contains substring
    STARTS_WITH = "starts_with"  # Starts with
    ENDS_WITH = "ends_with"  # Ends with
    IN = "in"  # In a list
    BETWEEN = "between"  # Between two values


class FilterCondition(BaseModel):
    """Filter condition for a single field."""
    field: str = Field(..., description="Field to filter on")
    operator: FilterOperator = Field(..., description="Filter operator")
    value: Any = Field(..., description="Filter value")


class FilterParams(BaseModel):
    """Common filtering parameters."""
    filters: List[FilterCondition] = Field([], description="List of filter conditions")
    logical_operator: str = Field("and", description="Logical operator between conditions (and, or)")


class PaginatedResponse(BaseModel):
    """Base schema for paginated responses."""
    items: List[Any] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(..., description="Current server time")
    uptime: float = Field(..., description="Service uptime in seconds")
    dependencies: Dict[str, str] = Field(..., description="Status of service dependencies")


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    error_code: Optional[str] = Field(None, description="Application-specific error code")
    path: Optional[str] = Field(None, description="Request path")
    timestamp: datetime = Field(..., description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")


class ValidationErrorDetail(BaseModel):
    """Schema for validation error details."""
    loc: List[str] = Field(..., description="Location of the error")
    msg: str = Field(..., description="Error message")
    type: str = Field(..., description="Error type")


class ValidationErrorResponse(BaseModel):
    """Schema for validation error responses."""
    detail: List[ValidationErrorDetail] = Field(..., description="List of validation errors")
    status_code: int = Field(422, description="HTTP status code")
    error_code: str = Field("validation_error", description="Error code")
    path: Optional[str] = Field(None, description="Request path")
    timestamp: datetime = Field(..., description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")


class SuccessResponse(BaseModel):
    """Schema for generic success responses."""
    message: str = Field(..., description="Success message")
    data: Optional[Any] = Field(None, description="Response data")
    timestamp: datetime = Field(..., description="Response timestamp")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    scope: Optional[str] = Field(None, description="Token scope")


class UserInfo(BaseModel):
    """Schema for user information."""
    username: str = Field(..., description="Username")
    email: Optional[str] = Field(None, description="User email")
    full_name: Optional[str] = Field(None, description="User full name")
    permissions: List[str] = Field([], description="User permissions")
    created_at: datetime = Field(..., description="User creation timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")


class StatusType(str, Enum):
    """Enumeration of status types."""
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    INFO = "info"


class StatusMessage(BaseModel):
    """Schema for status messages."""
    type: StatusType = Field(..., description="Status type")
    message: str = Field(..., description="Status message")
    details: Optional[str] = Field(None, description="Additional details")
    timestamp: datetime = Field(..., description="Status timestamp")
    code: Optional[str] = Field(None, description="Status code")


class DateRange(BaseModel):
    """Schema for date range."""
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class TimeFrame(str, Enum):
    """Enumeration of time frames."""
    DAY = "1d"
    WEEK = "1w"
    MONTH = "1m"
    QUARTER = "3m"
    HALF_YEAR = "6m"
    YEAR = "1y"
    TWO_YEARS = "2y"
    FIVE_YEARS = "5y"
    MAX = "max"
    YTD = "ytd"
    MTD = "mtd"
    QTD = "qtd"


class FileInfo(BaseModel):
    """Schema for file information."""
    file_name: str = Field(..., description="File name")
    file_path: str = Field(..., description="File path")
    file_size: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")
    created_at: datetime = Field(..., description="File creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional file metadata")