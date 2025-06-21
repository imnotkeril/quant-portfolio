"""
Investment Portfolio Management System - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any
import os
from datetime import datetime

# Create FastAPI application
app = FastAPI(
    title="Investment Portfolio Management System",
    description="Advanced Quantitative Portfolio Analytics Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Investment Portfolio Management System API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "docs": "/docs"
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "backend"
    }

# System info endpoint
@app.get("/api/v1/system/info")
async def system_info():
    return {
        "app_name": "Investment Portfolio Management System",
        "version": "1.0.0",
        "python_version": "3.9+",
        "framework": "FastAPI",
        "status": "development"
    }

# Portfolios endpoints (stub)
@app.get("/api/v1/portfolios")
async def list_portfolios():
    return {
        "portfolios": [],
        "total": 0,
        "message": "Portfolio endpoints working"
    }

@app.post("/api/v1/portfolios")
async def create_portfolio(portfolio_data: Dict[str, Any]):
    return {
        "id": "portfolio_1",
        "name": portfolio_data.get("name", "Test Portfolio"),
        "status": "created",
        "message": "Portfolio creation endpoint working"
    }

# Analytics endpoints (stub)
@app.get("/api/v1/analytics/performance")
async def analytics_performance():
    return {
        "metrics": {
            "total_return": 0.15,
            "annual_return": 0.12,
            "volatility": 0.18,
            "sharpe_ratio": 0.67
        },
        "message": "Analytics endpoints working"
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Endpoint not found", "status": "error"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "status": "error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )