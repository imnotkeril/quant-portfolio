"""Factory for creating service instances."""
from typing import Dict, Any, Type, TypeVar, Optional

from ..services.analytics import AnalyticsService
from ..services.enhanced_analytics import EnhancedAnalyticsService
from ..services.optimization import OptimizationService
from ..services.advanced_optimization import AdvancedOptimizationService
from ..services.risk_management import RiskManagementService
from ..services.monte_carlo import MonteCarloService
from ..services.time_series import TimeSeriesService
from ..services.diversification import DiversificationService
from ..services.scenario_service import ScenarioService
from ..services.historical_service import HistoricalService
from ..services.portfolio_comparison import PortfolioComparisonService
from ..services.report_service import ReportService

T = TypeVar('T')


class ServiceFactory:
    """Factory for creating service instances."""

    _instances: Dict[Type, Any] = {}

    @classmethod
    def get_service(cls, service_class: Type[T]) -> T:
        """Get or create an instance of the specified service class.

        Args:
            service_class: The service class to get an instance of

        Returns:
            An instance of the specified service class
        """
        if service_class not in cls._instances:
            cls._instances[service_class] = service_class()

        return cls._instances[service_class]