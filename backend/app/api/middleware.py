from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
import json
from typing import Callable, Dict

from app.config import settings

# Set up logging
logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging request information.

    This middleware logs information about each request, including method, path,
    processing time, status code, and client IP.
    """

    async def dispatch(self, request: Request, call_next):
        # Record start time
        start_time = time.time()

        # Get request ID or generate a new one
        request_id = request.headers.get("X-Request-ID", None)
        if request_id is None:
            import uuid
            request_id = str(uuid.uuid4())

        # Add request ID to request state
        request.state.request_id = request_id

        # Log request started
        logger.info(
            f"Request started: ID={request_id} Method={request.method} Path={request.url.path} "
            f"Client={request.client.host if request.client else 'unknown'}"
        )

        # Process the request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Add processing time to response headers
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id

            # Log request completed
            logger.info(
                f"Request completed: ID={request_id} Method={request.method} Path={request.url.path} "
                f"Status={response.status_code} Time={process_time:.3f}s "
                f"Client={request.client.host if request.client else 'unknown'}"
            )

            return response
        except Exception as e:
            # Log exception
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: ID={request_id} Method={request.method} Path={request.url.path} "
                f"Error={str(e)} Time={process_time:.3f}s "
                f"Client={request.client.host if request.client else 'unknown'}"
            )

            # Return error response
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "request_id": request_id}
            )


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for basic rate limiting.

    This middleware implements a simple rate limiting mechanism to prevent abuse of the API.
    It tracks requests based on client IP and applies limits per configured timeframe.
    """

    def __init__(
            self,
            app,
            requests_limit: int = 100,
            window_seconds: int = 60
    ):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.clients: Dict[str, Dict] = {}

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for internal requests
        if request.client is None or request.client.host in {"localhost", "127.0.0.1"}:
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host
        current_time = time.time()

        # Clean up old entries
        self._clean_old_requests(current_time)

        # Check if client has exceeded rate limit
        if client_ip in self.clients:
            client_data = self.clients[client_ip]

            # Update request count and last timestamp
            request_count = client_data["count"] + 1
            client_data["last_request"] = current_time
            client_data["count"] = request_count

            # Check if limit exceeded
            if request_count > self.requests_limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
        else:
            # First request from this client
            self.clients[client_ip] = {
                "count": 1,
                "first_request": current_time,
                "last_request": current_time
            }

        # Process the request
        return await call_next(request)

    def _clean_old_requests(self, current_time: float):
        """Remove entries older than the configured window"""
        expired_time = current_time - self.window_seconds
        expired_ips = []

        for ip, data in self.clients.items():
            if data["first_request"] < expired_time:
                expired_ips.append(ip)

        for ip in expired_ips:
            del self.clients[ip]


def setup_middlewares(app):
    """
    Set up all middlewares for the application.

    This function configures and adds all middleware to the FastAPI application.
    """
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # GZip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Request logging
    app.add_middleware(RequestLoggingMiddleware)

    # Rate limiting
    if settings.ENABLE_RATE_LIMIT:
        app.add_middleware(
            RateLimitMiddleware,
            requests_limit=settings.RATE_LIMIT_MAX_REQUESTS,
            window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS
        )