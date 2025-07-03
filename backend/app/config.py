import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import Field

# Load .env file explicitly
try:
    from dotenv import load_dotenv

    # Try different .env locations
    env_locations = [
        Path(".env"),  # backend/.env
        Path("../.env"),  # project_root/.env
        Path("./backend/.env")  # if running from project root
    ]

    for env_path in env_locations:
        if env_path.exists():
            print(f"🔧 Loading .env from: {env_path.absolute()}")
            load_dotenv(env_path, override=True)
            break
    else:
        print("⚠️ No .env file found in standard locations")

except ImportError:
    print("⚠️ python-dotenv not installed - install with: pip install python-dotenv")


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    These settings control the behavior of the application, and can
    be configured via environment variables or a .env file.
    """
    # Application
    APP_NAME: str = "Investment Portfolio Management System"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(False, env="DEBUG")
    SECRET_KEY: str = Field("very-secret-key", env="SECRET_KEY")

    # API
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000"],
        env="CORS_ORIGINS"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate limiting
    ENABLE_RATE_LIMIT: bool = Field(True, env="ENABLE_RATE_LIMIT")
    RATE_LIMIT_MAX_REQUESTS: int = Field(100, env="RATE_LIMIT_MAX_REQUESTS")
    RATE_LIMIT_WINDOW_SECONDS: int = Field(60, env="RATE_LIMIT_WINDOW_SECONDS")

    # Directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = Field(default_factory=lambda: Path("data"))
    CACHE_DIR: Path = Field(default_factory=lambda: Path("data/cache"))
    STORAGE_DIR: Path = Field(default_factory=lambda: Path("data/storage"))
    PORTFOLIO_DIR: Path = Field(default_factory=lambda: Path("data/portfolios"))
    REPORTS_DIR: Path = Field(default_factory=lambda: Path("data/reports"))
    TEMPLATES_DIR: Path = Field(default_factory=lambda: Path("templates"))

    # Data and caching
    CACHE_EXPIRY_DAYS: int = Field(1, env="CACHE_EXPIRY_DAYS")
    CACHE_DEFAULT_EXPIRY: int = Field(86400, env="CACHE_DEFAULT_EXPIRY")  # 24 hours in seconds

    # External APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = Field(None, env="ALPHA_VANTAGE_API_KEY")

    # Security
    TOKEN_URL: str = Field("/api/v1/auth/token", env="TOKEN_URL")

    # Logging
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field("%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT")

    # Email
    SMTP_HOST: Optional[str] = Field(None, env="SMTP_HOST")
    SMTP_PORT: Optional[int] = Field(None, env="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, env="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field(None, env="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = Field(None, env="EMAILS_FROM_NAME")

    # Metrics and performance
    ENABLE_PROMETHEUS: bool = Field(False, env="ENABLE_PROMETHEUS")
    TRACING_ENABLED: bool = Field(False, env="TRACING_ENABLED")

    # Optimization defaults
    DEFAULT_RISK_FREE_RATE: float = Field(0.02, env="DEFAULT_RISK_FREE_RATE")  # 2% annual
    MAX_OPTIMIZATION_ITERATIONS: int = Field(10000, env="MAX_OPTIMIZATION_ITERATIONS")

    # Monte Carlo simulation defaults
    DEFAULT_MONTE_CARLO_SIMULATIONS: int = Field(1000, env="DEFAULT_MONTE_CARLO_SIMULATIONS")

    # Risk management defaults
    DEFAULT_VAR_CONFIDENCE_LEVEL: float = Field(0.95, env="DEFAULT_VAR_CONFIDENCE_LEVEL")

    # Report generation
    MAX_BACKGROUND_REPORTS: int = Field(5, env="MAX_BACKGROUND_REPORTS")
    REPORT_FILE_EXPIRY_DAYS: int = Field(30, env="REPORT_FILE_EXPIRY_DAYS")

    # Advanced settings
    WORKER_CONCURRENCY: int = Field(1, env="WORKER_CONCURRENCY")
    MAX_UPLOAD_SIZE_MB: int = Field(50, env="MAX_UPLOAD_SIZE_MB")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Create necessary directories if they don't exist
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        self.PORTFOLIO_DIR.mkdir(parents=True, exist_ok=True)
        self.REPORTS_DIR.mkdir(parents=True, exist_ok=True)

        # Debug info
        print(f"🔧 Settings initialized:")
        print(f"   DEBUG: {self.DEBUG}")
        print(f"   ALPHA_VANTAGE_API_KEY: {'✅ Set' if self.ALPHA_VANTAGE_API_KEY else '❌ Not set'}")
        if self.ALPHA_VANTAGE_API_KEY:
            print(f"   API Key: {self.ALPHA_VANTAGE_API_KEY[:8]}...")

    @property
    def log_config(self) -> Dict[str, Any]:
        """Return logging configuration."""
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": self.LOG_FORMAT,
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "console": {
                    "level": self.LOG_LEVEL,
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                },
                "file": {
                    "level": self.LOG_LEVEL,
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "default",
                    "filename": "app.log",
                    "maxBytes": 10485760,  # 10 MB
                    "backupCount": 5,
                    "encoding": "utf8",
                },
            },
            "loggers": {
                "app": {
                    "handlers": ["console", "file"],
                    "level": self.LOG_LEVEL,
                    "propagate": True,
                },
                "uvicorn": {
                    "handlers": ["console", "file"],
                    "level": self.LOG_LEVEL,
                    "propagate": False,
                },
                "fastapi": {
                    "handlers": ["console", "file"],
                    "level": self.LOG_LEVEL,
                    "propagate": False,
                },
            },
        }

    def get_db_uri(self) -> str:
        """
        Return database URI for SQLAlchemy.
        This can be extended if a database is needed in the future.
        """
        return "sqlite:///./portfolio.db"


settings = Settings()