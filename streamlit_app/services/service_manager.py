"""
Service Manager with Streamlit caching.
ИСПРАВЛЕНО: Правильные пути к данным портфелей в streamlit_app/data/portfolios
"""
import streamlit as st
from pathlib import Path
import logging
from typing import Optional, List, Dict, Any

# Import all services from backend (existing imports from services/__init__.py)
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
    DataFetcherService,
    PortfolioManagerService,
    JsonStorageService,
    MemoryCacheService,
    settings
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PortfolioManagerWrapper:
    """
    Wrapper for PortfolioManagerService to fix backend compatibility issues.
    ИСПРАВЛЕНО: Обходим проблему 'list_files' метода используя JsonStorageService.list_portfolios() напрямую
    """

    def __init__(self, portfolio_manager: PortfolioManagerService, json_storage: JsonStorageService):
        """
        Initialize wrapper.

        Args:
            portfolio_manager: Backend PortfolioManagerService instance
            json_storage: Backend JsonStorageService instance
        """
        self.portfolio_manager = portfolio_manager
        self.json_storage = json_storage

    def list_portfolios(self) -> List[Dict[str, Any]]:
        """
        List all portfolios using JsonStorageService directly.
        ИСПРАВЛЕНО: Обходим проблему с missing list_files() method в JsonStorageService.

        Returns:
            List of portfolio metadata dictionaries
        """
        try:
            # Use JsonStorageService.list_portfolios() directly instead of PortfolioManagerService
            portfolios = self.json_storage.list_portfolios()
            logger.info(f"Listed {len(portfolios)} portfolios using JsonStorageService.list_portfolios()")

            # Debug logging - show portfolio details
            for portfolio in portfolios:
                portfolio_id = portfolio.get('id', 'unknown')
                asset_count = portfolio.get('asset_count', 0)
                name = portfolio.get('name', 'unnamed')
                logger.info(f"Portfolio: {name} (ID: {portfolio_id}) has {asset_count} assets")

            return portfolios

        except Exception as e:
            logger.error(f"Error listing portfolios: {e}")
            return []

    def load_portfolio(self, portfolio_id: str) -> Optional[Dict[str, Any]]:
        """Load portfolio using PortfolioManagerService."""
        try:
            return self.portfolio_manager.load_portfolio(portfolio_id)
        except Exception as e:
            logger.error(f"Error loading portfolio {portfolio_id}: {e}")
            return None

    def save_portfolio(self, portfolio_data: Dict[str, Any]) -> str:
        """Save portfolio using JsonStorageService directly."""
        try:
            portfolio_id = portfolio_data.get('id')
            if not portfolio_id:
                raise ValueError("Portfolio ID is required")

            return self.json_storage.save_portfolio(portfolio_data, portfolio_id)

        except Exception as e:
            logger.error(f"Error saving portfolio: {e}")
            raise

    def delete_portfolio(self, portfolio_id: str) -> bool:
        """Delete portfolio using JsonStorageService directly."""
        try:
            return self.json_storage.delete_portfolio(portfolio_id)
        except Exception as e:
            logger.error(f"Error deleting portfolio {portfolio_id}: {e}")
            return False


class ServiceManager:
    """
    Centralized service manager with Streamlit caching.
    All services are cached using @st.cache_resource for performance.
    ИСПРАВЛЕНО: get_json_storage_service() теперь использует правильный путь к данным
    """

    @staticmethod
    @st.cache_resource
    def get_analytics_service():
        """Get Analytics Service instance with caching."""
        if AnalyticsService is None:
            st.error("Analytics Service not available - backend connection failed")
            return None
        return AnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_enhanced_analytics_service():
        """Get Enhanced Analytics Service instance with caching."""
        if EnhancedAnalyticsService is None:
            st.error("Enhanced Analytics Service not available - backend connection failed")
            return None
        return EnhancedAnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_optimization_service():
        """Get Optimization Service instance with caching."""
        if OptimizationService is None:
            st.error("Optimization Service not available - backend connection failed")
            return None
        return OptimizationService()

    @staticmethod
    @st.cache_resource
    def get_advanced_optimization_service():
        """Get Advanced Optimization Service instance with caching."""
        if AdvancedOptimizationService is None:
            st.error("Advanced Optimization Service not available - backend connection failed")
            return None
        return AdvancedOptimizationService()

    @staticmethod
    @st.cache_resource
    def get_risk_management_service():
        """Get Risk Management Service instance with caching."""
        if RiskManagementService is None:
            st.error("Risk Management Service not available - backend connection failed")
            return None
        return RiskManagementService()

    @staticmethod
    @st.cache_resource
    def get_monte_carlo_service():
        """Get Monte Carlo Service instance with caching."""
        if MonteCarloService is None:
            st.error("Monte Carlo Service not available - backend connection failed")
            return None
        return MonteCarloService()

    @staticmethod
    @st.cache_resource
    def get_time_series_service():
        """Get Time Series Service instance with caching."""
        if TimeSeriesService is None:
            st.error("Time Series Service not available - backend connection failed")
            return None
        return TimeSeriesService()

    @staticmethod
    @st.cache_resource
    def get_diversification_service():
        """Get Diversification Service instance with caching."""
        if DiversificationService is None:
            st.error("Diversification Service not available - backend connection failed")
            return None
        return DiversificationService()

    @staticmethod
    @st.cache_resource
    def get_scenario_service():
        """Get Scenario Service instance with caching."""
        if ScenarioService is None:
            st.error("Scenario Service not available - backend connection failed")
            return None
        return ScenarioService()

    @staticmethod
    @st.cache_resource
    def get_historical_service():
        """Get Historical Service instance with caching."""
        if HistoricalService is None:
            st.error("Historical Service not available - backend connection failed")
            return None
        return HistoricalService()

    @staticmethod
    @st.cache_resource
    def get_portfolio_comparison_service():
        """Get Portfolio Comparison Service instance with caching."""
        if PortfolioComparisonService is None:
            st.error("Portfolio Comparison Service not available - backend connection failed")
            return None
        return PortfolioComparisonService()

    @staticmethod
    @st.cache_resource
    def get_report_service():
        """Get Report Service instance with caching."""
        if ReportService is None:
            st.error("Report Service not available - backend connection failed")
            return None
        return ReportService()

    @staticmethod
    @st.cache_resource
    def get_cache_service():
        """Get Memory Cache Service instance with caching."""
        if MemoryCacheService is None:
            st.error("Memory Cache Service not available - backend connection failed")
            return None

        # Use settings from local StreamlitSettings
        default_expiry = settings.CACHE_DEFAULT_EXPIRY if settings else 86400
        return MemoryCacheService(default_expiry=default_expiry)

    @staticmethod
    @st.cache_resource
    def get_json_storage_service():
        """
        Get JSON Storage Service instance with caching.
        ИСПРАВЛЕНО: Использует правильный путь к streamlit_app/data
        """
        if JsonStorageService is None:
            st.error("JSON Storage Service not available - backend connection failed")
            return None

        # ИСПРАВЛЕНО: Используем settings.DATA_DIR вместо PORTFOLIO_DIR.parent
        if settings is None:
            st.error("Settings not available")
            return None

        storage_path = str(settings.DATA_DIR)
        logger.info(f"Initializing JsonStorageService with path: {storage_path}")

        return JsonStorageService(storage_path)

    @staticmethod
    @st.cache_resource
    def get_data_fetcher():
        """Get Data Fetcher Service instance with caching."""
        if DataFetcherService is None:
            st.error("Data Fetcher Service not available - backend connection failed")
            return None

        # DataFetcher needs cache_provider
        cache_service = ServiceManager.get_cache_service()
        if cache_service is None:
            st.error("Cannot create Data Fetcher - cache service failed")
            return None

        # Use settings for cache expiry
        cache_expiry_days = settings.CACHE_EXPIRY_DAYS if settings else 1

        return DataFetcherService(
            cache_provider=cache_service,
            cache_expiry_days=cache_expiry_days
        )

    @staticmethod
    @st.cache_resource
    def get_portfolio_manager() -> Optional[PortfolioManagerWrapper]:
        """
        Get Portfolio Manager Wrapper instance with caching.
        ИСПРАВЛЕНО: Возвращает wrapper который обходит проблему list_files()

        Returns:
            PortfolioManagerWrapper instance or None if initialization failed
        """
        if PortfolioManagerService is None:
            st.error("Portfolio Manager Service not available - backend connection failed")
            return None

        # Get required dependencies
        data_fetcher = ServiceManager.get_data_fetcher()
        storage_service = ServiceManager.get_json_storage_service()

        if data_fetcher is None or storage_service is None:
            st.error("Cannot create Portfolio Manager - dependencies failed")

            # Debug logging
            logger.error(f"Dependencies failed: data_fetcher={data_fetcher}, storage_service={storage_service}")
            if settings:
                logger.error(f"Settings DATA_DIR: {settings.DATA_DIR}")
                logger.error(f"Settings PORTFOLIO_DIR: {settings.PORTFOLIO_DIR}")
                logger.error(f"Portfolio dir exists: {settings.PORTFOLIO_DIR.exists()}")

            return None

        try:
            # Create backend PortfolioManagerService
            portfolio_manager = PortfolioManagerService(
                data_provider=data_fetcher,
                storage_provider=storage_service
            )

            # Return wrapper that fixes compatibility issues
            wrapper = PortfolioManagerWrapper(portfolio_manager, storage_service)
            logger.info("Created PortfolioManagerWrapper successfully")

            return wrapper

        except Exception as e:
            st.error(f"Failed to create Portfolio Manager: {e}")
            logger.error(f"Portfolio Manager creation failed: {e}")
            return None

    @staticmethod
    def clear_cache():
        """Clear all cached services. Use when needed to refresh services."""
        st.cache_resource.clear()
        st.success("Service cache cleared")

    @staticmethod
    def get_settings():
        """Get application settings."""
        return settings

    @staticmethod
    def get_service_status() -> Dict[str, bool]:
        """
        Get status of all services.

        Returns:
            Dictionary with service names and their status
        """
        services = {
            'Analytics Service': ServiceManager.get_analytics_service() is not None,
            'Enhanced Analytics Service': ServiceManager.get_enhanced_analytics_service() is not None,
            'Optimization Service': ServiceManager.get_optimization_service() is not None,
            'Advanced Optimization Service': ServiceManager.get_advanced_optimization_service() is not None,
            'Risk Management Service': ServiceManager.get_risk_management_service() is not None,
            'Monte Carlo Service': ServiceManager.get_monte_carlo_service() is not None,
            'Time Series Service': ServiceManager.get_time_series_service() is not None,
            'Diversification Service': ServiceManager.get_diversification_service() is not None,
            'Scenario Service': ServiceManager.get_scenario_service() is not None,
            'Historical Service': ServiceManager.get_historical_service() is not None,
            'Portfolio Comparison Service': ServiceManager.get_portfolio_comparison_service() is not None,
            'Report Service': ServiceManager.get_report_service() is not None,
            'Cache Service': ServiceManager.get_cache_service() is not None,
            'JSON Storage Service': ServiceManager.get_json_storage_service() is not None,
            'Data Fetcher Service': ServiceManager.get_data_fetcher() is not None,
            'Portfolio Manager': ServiceManager.get_portfolio_manager() is not None,
        }

        return services

    @staticmethod
    def diagnose_portfolio_loading():
        """
        Diagnostic function to help debug portfolio loading issues.
        Returns detailed information about storage paths and portfolio files.
        """
        diagnosis = {
            'settings_available': settings is not None,
            'json_storage_available': JsonStorageService is not None,
            'portfolio_files': [],
            'paths': {},
            'errors': []
        }

        if settings:
            diagnosis['paths'] = {
                'DATA_DIR': str(settings.DATA_DIR),
                'PORTFOLIO_DIR': str(settings.PORTFOLIO_DIR),
                'data_dir_exists': settings.DATA_DIR.exists(),
                'portfolio_dir_exists': settings.PORTFOLIO_DIR.exists()
            }

            # Check for portfolio files
            if settings.PORTFOLIO_DIR.exists():
                json_files = list(settings.PORTFOLIO_DIR.glob('*.json'))
                diagnosis['portfolio_files'] = [f.name for f in json_files]

                # Try to load first portfolio to check structure
                if json_files:
                    try:
                        import json
                        with open(json_files[0], 'r') as f:
                            portfolio_data = json.load(f)

                        diagnosis['sample_portfolio'] = {
                            'filename': json_files[0].name,
                            'keys': list(portfolio_data.keys()),
                            'asset_count': len(portfolio_data.get('assets', [])),
                            'has_assets_field': 'assets' in portfolio_data
                        }

                        if portfolio_data.get('assets'):
                            diagnosis['sample_asset'] = portfolio_data['assets'][0]

                    except Exception as e:
                        diagnosis['errors'].append(f"Error reading portfolio file: {e}")
        else:
            diagnosis['errors'].append("Settings not available")

        return diagnosis