"""
Service Manager with Streamlit caching.
Centralized access to all backend services with @st.cache_resource.
"""
import streamlit as st
from pathlib import Path

# Import all services from backend (corrected names)
from services import (
    AnalyticsService,
    EnhancedAnalyticsService,
    OptimizationService,
    AdvancedOptimizationService,
    RiskManagementService,
    MonteCarloService,
    TimeSeriesService,
    DiversificationService,
    ScenarioService,
    HistoricalService,
    PortfolioComparisonService,
    ReportService,
    DataFetcherService,          # Corrected name
    PortfolioManagerService,     # Corrected name
    JsonStorageService,          # Corrected name
    MemoryCacheService,          # Added for DataFetcher
    settings
)

class ServiceManager:
    """
    Centralized service manager with Streamlit caching.
    All services are cached using @st.cache_resource for performance.
    """

    @staticmethod
    @st.cache_resource
    def get_analytics_service():
        """Get Analytics Service instance with caching."""
        if AnalyticsService is None:
            st.error("❌ Analytics Service not available - backend connection failed")
            return None
        return AnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_enhanced_analytics_service():
        """Get Enhanced Analytics Service instance with caching."""
        if EnhancedAnalyticsService is None:
            st.error("❌ Enhanced Analytics Service not available - backend connection failed")
            return None
        return EnhancedAnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_optimization_service():
        """Get Optimization Service instance with caching."""
        if OptimizationService is None:
            st.error("❌ Optimization Service not available - backend connection failed")
            return None
        return OptimizationService()

    @staticmethod
    @st.cache_resource
    def get_advanced_optimization_service():
        """Get Advanced Optimization Service instance with caching."""
        if AdvancedOptimizationService is None:
            st.error("❌ Advanced Optimization Service not available - backend connection failed")
            return None
        return AdvancedOptimizationService()

    @staticmethod
    @st.cache_resource
    def get_risk_management_service():
        """Get Risk Management Service instance with caching."""
        if RiskManagementService is None:
            st.error("❌ Risk Management Service not available - backend connection failed")
            return None
        return RiskManagementService()

    @staticmethod
    @st.cache_resource
    def get_monte_carlo_service():
        """Get Monte Carlo Service instance with caching."""
        if MonteCarloService is None:
            st.error("❌ Monte Carlo Service not available - backend connection failed")
            return None
        return MonteCarloService()

    @staticmethod
    @st.cache_resource
    def get_time_series_service():
        """Get Time Series Service instance with caching."""
        if TimeSeriesService is None:
            st.error("❌ Time Series Service not available - backend connection failed")
            return None
        return TimeSeriesService()

    @staticmethod
    @st.cache_resource
    def get_diversification_service():
        """Get Diversification Service instance with caching."""
        if DiversificationService is None:
            st.error("❌ Diversification Service not available - backend connection failed")
            return None
        return DiversificationService()

    @staticmethod
    @st.cache_resource
    def get_scenario_service():
        """Get Scenario Service instance with caching."""
        if ScenarioService is None:
            st.error("❌ Scenario Service not available - backend connection failed")
            return None
        return ScenarioService()

    @staticmethod
    @st.cache_resource
    def get_historical_service():
        """Get Historical Service instance with caching."""
        if HistoricalService is None:
            st.error("❌ Historical Service not available - backend connection failed")
            return None
        return HistoricalService()

    @staticmethod
    @st.cache_resource
    def get_portfolio_comparison_service():
        """Get Portfolio Comparison Service instance with caching."""
        if PortfolioComparisonService is None:
            st.error("❌ Portfolio Comparison Service not available - backend connection failed")
            return None
        return PortfolioComparisonService()

    @staticmethod
    @st.cache_resource
    def get_report_service():
        """Get Report Service instance with caching."""
        if ReportService is None:
            st.error("❌ Report Service not available - backend connection failed")
            return None
        return ReportService()

    @staticmethod
    @st.cache_resource
    def get_cache_service():
        """Get Memory Cache Service instance with caching."""
        if MemoryCacheService is None:
            st.error("❌ Memory Cache Service not available - backend connection failed")
            return None

        # Use correct settings from backend
        default_expiry = 86400  # Default 24 hours
        if settings is not None:
            default_expiry = settings.CACHE_DEFAULT_EXPIRY

        return MemoryCacheService(default_expiry=default_expiry)

    @staticmethod
    @st.cache_resource
    def get_json_storage_service():
        """Get JSON Storage Service instance with caching."""
        if JsonStorageService is None or settings is None:
            return None

        # Use PORTFOLIO_DIR.parent as in dependencies.py
        storage_path = str(settings.PORTFOLIO_DIR.parent)
        return JsonStorageService(storage_path)

    @staticmethod
    @st.cache_resource
    def get_data_fetcher():
        """Get Data Fetcher Service instance with caching."""
        if DataFetcherService is None:
            st.error("❌ Data Fetcher Service not available - backend connection failed")
            return None

        # DataFetcher needs cache_provider
        cache_service = ServiceManager.get_cache_service()
        if cache_service is None:
            st.error("❌ Cannot create Data Fetcher - cache service failed")
            return None

        # Use correct settings
        cache_expiry_days = 1  # Default
        if settings is not None:
            cache_expiry_days = settings.CACHE_EXPIRY_DAYS

        return DataFetcherService(
            cache_provider=cache_service,
            cache_expiry_days=cache_expiry_days
        )

    @staticmethod
    @st.cache_resource
    def get_portfolio_manager():
        """Get Portfolio Manager Service instance with caching."""
        if PortfolioManagerService is None:
            st.error("❌ Portfolio Manager Service not available - backend connection failed")
            return None

        # PortfolioManager needs data_provider and storage_provider
        data_fetcher = ServiceManager.get_data_fetcher()
        storage_service = ServiceManager.get_json_storage_service()

        if data_fetcher is None or storage_service is None:
            st.error("❌ Cannot create Portfolio Manager - dependencies failed")
            return None

        return PortfolioManagerService(
            data_provider=data_fetcher,
            storage_provider=storage_service
        )

    @staticmethod
    def clear_cache():
        """Clear all cached services. Use when needed to refresh services."""
        st.cache_resource.clear()

    @staticmethod
    def get_settings():
        """Get application settings."""
        if settings is None:
            st.error("❌ Settings not available - backend connection failed")
            return None
        return settings

    @staticmethod
    def test_backend_connection():
        """Test backend connection and return status."""
        try:
            # Test basic service creation step by step
            cache_service = ServiceManager.get_cache_service()
            data_fetcher = ServiceManager.get_data_fetcher()
            storage_service = ServiceManager.get_json_storage_service()
            portfolio_manager = ServiceManager.get_portfolio_manager()
            analytics = ServiceManager.get_analytics_service()
            app_settings = ServiceManager.get_settings()

            # Check which services failed
            failed_services = []
            if cache_service is None:
                failed_services.append("cache_service")
            if data_fetcher is None:
                failed_services.append("data_fetcher")
            if storage_service is None:
                failed_services.append("storage_service")
            if portfolio_manager is None:
                failed_services.append("portfolio_manager")
            if analytics is None:
                failed_services.append("analytics")
            if app_settings is None:
                failed_services.append("settings")

            if failed_services:
                return {
                    "status": "error",
                    "message": f"Some backend services failed to load: {', '.join(failed_services)}",
                    "failed_services": failed_services,
                    "cache_service": cache_service is not None,
                    "data_fetcher": data_fetcher is not None,
                    "storage_service": storage_service is not None,
                    "portfolio_manager": portfolio_manager is not None,
                    "analytics": analytics is not None,
                    "settings": app_settings is not None
                }

            return {
                "status": "success",
                "message": "All backend services connected successfully",
                "cache_service": cache_service.__class__.__name__,
                "data_fetcher": data_fetcher.__class__.__name__,
                "storage_service": storage_service.__class__.__name__,
                "portfolio_manager": portfolio_manager.__class__.__name__,
                "analytics": analytics.__class__.__name__,
                "storage_dir": str(app_settings.STORAGE_DIR) if app_settings else "N/A"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Backend connection test failed: {str(e)}"
            }