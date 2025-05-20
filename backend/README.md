# Investment Portfolio Management System - Backend

## Overview

The backend component of the Investment Portfolio Management System provides a comprehensive API for portfolio management, analytics, optimization, risk assessment, and reporting. Built with FastAPI and Python, it offers high-performance, scalable, and reliable services for investment portfolio management.

## Features

- **Portfolio Management**: Create, update, analyze, and track investment portfolios
- **Advanced Analytics**: Comprehensive performance metrics, risk analysis, and benchmarking
- **Portfolio Optimization**: Multiple optimization strategies including Markowitz, Risk Parity, etc.
- **Risk Management**: VaR analysis, stress testing, drawdown analysis, and Monte Carlo simulations
- **Scenario Analysis**: Model impact of different market scenarios on portfolios
- **Historical Analysis**: Historical context and analogies for market conditions
- **Report Generation**: Customizable and schedulable reports in multiple formats

## Technology Stack

- [Python 3.10+](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/): High-performance API framework
- [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/): Data analysis and manipulation
- [SciPy](https://scipy.org/): Scientific computing and optimization
- [yfinance](https://pypi.org/project/yfinance/): Yahoo Finance data retrieval
- [Poetry](https://python-poetry.org/): Dependency management

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Poetry for dependency management
- Docker & Docker Compose (optional)

### Installation

#### Using Poetry:

```bash
# Clone the repository
git clone https://github.com/wildmarketcapital/portfolio-management.git
cd portfolio-management/backend

# Install dependencies
poetry install

# Run the application
poetry run uvicorn app.main:app --reload
```

#### Using Docker:

```bash
# Clone the repository
git clone https://github.com/wildmarketcapital/portfolio-management.git
cd portfolio-management

# Run with Docker Compose
docker-compose up backend
```

### Environment Variables

Create a `.env` file in the backend directory with the following configuration:

```
DEBUG=True
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Project Structure

```
backend/
├── app/                          # Main FastAPI application
│   ├── main.py                   # FastAPI application entry point
│   ├── config.py                 # Configuration and settings
│   ├── core/                     # Application core
│   │   ├── domain/               # Domain models
│   │   ├── services/             # Business logic and services
│   │   ├── interfaces/           # Interfaces for external services
│   ├── infrastructure/           # Infrastructure implementations
│   │   ├── data/                 # Data handling
│   │   ├── storage/              # Data storage
│   │   ├── cache/                # Caching
│   │   ├── reports/              # Reporting
│   ├── api/                      # API interface
│   │   ├── endpoints/            # API endpoints
│   │   ├── dependencies.py       # Dependencies for FastAPI
│   │   ├── middleware.py         # Middleware for API
│   ├── schemas/                  # Pydantic models
│   ├── utils/                    # Utility functions
├── tests/                        # Tests
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
├── templates/                    # Report templates
│   ├── pdf/                      # PDF templates
│   ├── html/                     # HTML templates
├── Dockerfile                    # Docker configuration
├── pyproject.toml                # Project configuration and dependencies
├── README.md                     # Documentation
```

## Development

### Running Tests

```bash
# Run all tests
poetry run pytest

# Run tests with coverage report
poetry run pytest --cov=app --cov-report=term-missing

# Run specific test file
poetry run pytest tests/unit/test_analytics.py
```

### Code Formatting and Linting

```bash
# Format code with Black
poetry run black app tests

# Sort imports with isort
poetry run isort app tests

# Check code with Flake8
poetry run flake8 app tests

# Run type checking with MyPy
poetry run mypy app
```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without the express permission of Wild Market Capital.

## Contact

For questions or support, contact:
- **Wild Market Capital**: [info@wildmarketcapital.com](mailto:info@wildmarketcapital.com)