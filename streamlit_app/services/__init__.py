"""
Backend services integration for Streamlit app.
Direct imports from existing backend without API calls.
"""
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import all backend services (using correct paths from existing structure)
try:
    # Try different import approaches
    import sys
    print(f"📍 Python path: {sys.path[:3]}")
    print(f"📍 Current working directory: {Path.cwd()}")
    print(f"📍 Backend path: {backend_path}")
    print(f"📍 Backend exists: {backend_path.exists()}")

    # Check if specific files exist
    app_path = backend_path / "app"
    services_path = app_path / "core" / "services"
    print(f"📍 App path exists: {app_path.exists()}")
    print(f"📍 Services path exists: {services_path.exists()}")

    if services_path.exists():
        print(f"📍 Services directory contains: {list(services_path.glob('*.py'))}")

    # Import core services (correct names from backend)
    from app.core.services.analytics import AnalyticsService
    from app.core.services.enhanced_analytics import EnhancedAnalyticsService
    from app.core.services.optimization import OptimizationService
    from app.core.services.advanced_optimization import AdvancedOptimizationService
    from app.core.services.risk_management import RiskManagementService
    from app.core.services.monte_carlo import MonteCarloService
    from app.core.services.time_series import TimeSeriesService
    from app.core.services.diversification import DiversificationService
    from app.core.services.scenario_service import ScenarioService
    from app.core.services.historical_service import HistoricalService
    from app.core.services.portfolio_comparison import PortfolioComparisonService
    from app.core.services.report_service import ReportService

    # Infrastructure services (correct names from backend)
    try:
        from app.infrastructure.data.data_fetcher import DataFetcherService
        print("✅ DataFetcherService imported successfully")
    except ImportError as e:
        print(f"❌ DataFetcherService import failed: {e}")
        DataFetcherService = None

    try:
        from app.infrastructure.data.portfolio_manager import PortfolioManagerService
        print("✅ PortfolioManagerService imported successfully")
    except ImportError as e:
        print(f"❌ PortfolioManagerService import failed: {e}")
        PortfolioManagerService = None

    try:
        from app.infrastructure.storage.json_storage import JsonStorageService
        print("✅ JsonStorageService imported successfully")
    except ImportError as e:
        print(f"❌ JsonStorageService import failed: {e}")
        JsonStorageService = None

    try:
        from app.infrastructure.cache.memory_cache import MemoryCacheService
        print("✅ MemoryCacheService imported successfully")
    except ImportError as e:
        print(f"❌ MemoryCacheService import failed: {e}")
        MemoryCacheService = None

    # Import config
    from app.config import settings

    print("✅ Successfully imported core backend services for Streamlit")

except ImportError as e:
    print(f"❌ Failed to import backend services: {e}")
    print("📍 Current working directory:", Path.cwd())
    print("📍 Backend path:", backend_path)
    print("📍 Backend exists:", backend_path.exists())

    # Set dummy services for testing if imports failed
    AnalyticsService = None
    EnhancedAnalyticsService = None
    OptimizationService = None
    AdvancedOptimizationService = None
    RiskManagementService = None
    MonteCarloService = None
    TimeSeriesService = None
    DiversificationService = None
    ScenarioService = None
    HistoricalService = None
    PortfolioComparisonService = None
    ReportService = None
    DataFetcherService = None
    PortfolioManagerService = None
    JsonStorageService = None
    MemoryCacheService = None
    settings = None

__all__ = [
    'AnalyticsService',
    'EnhancedAnalyticsService',
    'OptimizationService',
    'AdvancedOptimizationService',
    'RiskManagementService',
    'MonteCarloService',
    'TimeSeriesService',
    'DiversificationService',
    'ScenarioService',
    'HistoricalService',
    'PortfolioComparisonService',
    'ReportService',
    'DataFetcherService',          # Updated name
    'PortfolioManagerService',     # Updated name
    'JsonStorageService',          # Updated name
    'MemoryCacheService',          # Added
    'settings'
]