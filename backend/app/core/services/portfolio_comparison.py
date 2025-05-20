# backend/app/core/services/portfolio_comparison.py
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
import logging
from .analytics import AnalyticsService
from .risk_management import RiskManagementService
# Setup logging
logger = logging.getLogger(__name__)


class PortfolioComparisonService:
    """Portfolio comparison service."""

    def compare_portfolios(
            self,
            portfolio1: Dict,
            portfolio2: Dict,
            start_date: str = None,
            end_date: str = None,
            benchmark: str = None
    ) -> Dict:
        """
        Compare two portfolios.

        Args:
            portfolio1: First portfolio data
            portfolio2: Second portfolio data
            start_date: Start date for comparison
            end_date: End date for comparison
            benchmark: Benchmark ticker

        Returns:
            Dictionary with comparison results
        """
        if not portfolio1 or not portfolio2:
            return {'error': 'Invalid portfolio data'}

        # Compare portfolio compositions
        composition_comparison = self.compare_compositions(portfolio1, portfolio2)

        # Additional comparison data would be calculated using historical returns
        # This would require fetching data for both portfolios
        # In a real implementation, this would involve more complex calculations

        return {
            'portfolio1_name': portfolio1.get('name', 'Portfolio 1'),
            'portfolio2_name': portfolio2.get('name', 'Portfolio 2'),
            'composition_comparison': composition_comparison,
            'start_date': start_date,
            'end_date': end_date,
            'benchmark': benchmark
        }

    def compare_compositions(
            self,
            portfolio1: Dict,
            portfolio2: Dict
    ) -> Dict:
        """
        Compare portfolio compositions.

        Args:
            portfolio1: First portfolio data
            portfolio2: Second portfolio data

        Returns:
            Dictionary with composition comparison
        """
        if 'assets' not in portfolio1 or 'assets' not in portfolio2:
            return {'error': 'Invalid portfolio data'}

        # Extract assets from portfolios
        assets1 = {asset['ticker']: asset.get('weight', 0) for asset in portfolio1['assets']}
        assets2 = {asset['ticker']: asset.get('weight', 0) for asset in portfolio2['assets']}

        # Find common and unique assets
        common_assets = set(assets1.keys()) & set(assets2.keys())
        unique_to_1 = set(assets1.keys()) - set(assets2.keys())
        unique_to_2 = set(assets2.keys()) - set(assets1.keys())

        # Calculate weight differences for common assets
        common_asset_diffs = {}
        for ticker in common_assets:
            weight1 = assets1[ticker]
            weight2 = assets2[ticker]
            diff = weight2 - weight1  # Positive means higher weight in portfolio2
            common_asset_diffs[ticker] = {
                'weight1': weight1,
                'weight2': weight2,
                'diff': diff
            }

        # Sector analysis
        sectors1 = self._get_sector_weights(portfolio1)
        sectors2 = self._get_sector_weights(portfolio2)

        # Compare sectors
        all_sectors = set(sectors1.keys()) | set(sectors2.keys())
        sector_diffs = {}

        for sector in all_sectors:
            weight1 = sectors1.get(sector, 0)
            weight2 = sectors2.get(sector, 0)
            diff = weight2 - weight1
            sector_diffs[sector] = {
                'weight1': weight1,
                'weight2': weight2,
                'diff': diff
            }

        # Overall portfolio stats
        total_common_weight1 = sum(assets1[ticker] for ticker in common_assets)
        total_common_weight2 = sum(assets2[ticker] for ticker in common_assets)
        total_unique_weight1 = sum(assets1[ticker] for ticker in unique_to_1)
        total_unique_weight2 = sum(assets2[ticker] for ticker in unique_to_2)

        return {
            'common_assets': len(common_assets),
            'unique_to_portfolio1': len(unique_to_1),
            'unique_to_portfolio2': len(unique_to_2),
            'total_common_weight1': total_common_weight1,
            'total_common_weight2': total_common_weight2,
            'total_unique_weight1': total_unique_weight1,
            'total_unique_weight2': total_unique_weight2,
            'common_asset_diffs': common_asset_diffs,
            'unique_assets1': {ticker: assets1[ticker] for ticker in unique_to_1},
            'unique_assets2': {ticker: assets2[ticker] for ticker in unique_to_2},
            'sector_diffs': sector_diffs
        }

    def _get_sector_weights(self, portfolio: Dict) -> Dict[str, float]:
        """
        Calculate sector weights for a portfolio.

        Args:
            portfolio: Portfolio data

        Returns:
            Dictionary with sector weights
        """
        sector_weights = {}

        for asset in portfolio.get('assets', []):
            sector = asset.get('sector', 'Unknown')
            weight = asset.get('weight', 0)

            if sector not in sector_weights:
                sector_weights[sector] = 0

            sector_weights[sector] += weight

        return sector_weights

    def compare_performance(
            self,
            returns1: pd.Series,
            returns2: pd.Series,
            benchmark_returns: Optional[pd.Series] = None
    ) -> Dict:
        """
        Compare portfolio performance.

        Args:
            returns1: Returns of the first portfolio
            returns2: Returns of the second portfolio
            benchmark_returns: Returns of the benchmark

        Returns:
            Dictionary with performance comparison
        """
        if returns1.empty or returns2.empty:
            return {'error': 'Missing returns data'}

        # Align the returns
        common_index = returns1.index.intersection(returns2.index)
        if len(common_index) == 0:
            return {'error': 'No common dates for comparison'}

        aligned_returns1 = returns1.loc[common_index]
        aligned_returns2 = returns2.loc[common_index]

        # Calculate performance metrics
        from ..services.service_factory import ServiceFactory
        analytics_service = ServiceFactory.get_service(AnalyticsService)

        metrics1 = analytics_service.calculate_portfolio_metrics(
            aligned_returns1,
            benchmark_returns.loc[common_index] if benchmark_returns is not None else None
        )

        metrics2 = analytics_service.calculate_portfolio_metrics(
            aligned_returns2,
            benchmark_returns.loc[common_index] if benchmark_returns is not None else None
        )

        # Calculate cumulative returns
        cum_returns1 = (1 + aligned_returns1).cumprod() - 1
        cum_returns2 = (1 + aligned_returns2).cumprod() - 1

        if benchmark_returns is not None:
            aligned_benchmark = benchmark_returns.loc[common_index]
            cum_benchmark = (1 + aligned_benchmark).cumprod() - 1
        else:
            cum_benchmark = None

        # Calculate performance differences
        performance_diff = {}

        for metric in metrics1:
            if metric in metrics2:
                # Skip benchmark-specific metrics
                if metric.startswith('benchmark_'):
                    continue

                value1 = metrics1[metric]
                value2 = metrics2[metric]

                if isinstance(value1, (int, float)) and isinstance(value2, (int, float)):
                    diff = value2 - value1
                    performance_diff[metric] = {
                        'portfolio1': value1,
                        'portfolio2': value2,
                        'diff': diff,
                        'percentage_diff': diff / value1 * 100 if value1 != 0 else float('inf')
                    }

        return {
            'metrics1': metrics1,
            'metrics2': metrics2,
            'performance_diff': performance_diff,
            'cum_returns1': cum_returns1,
            'cum_returns2': cum_returns2,
            'cum_benchmark': cum_benchmark
        }

    def compare_risk_metrics(
            self,
            returns1: pd.Series,
            returns2: pd.Series,
            benchmark_returns: Optional[pd.Series] = None
    ) -> Dict:
        """
        Compare portfolio risk metrics.

        Args:
            returns1: Returns of the first portfolio
            returns2: Returns of the second portfolio
            benchmark_returns: Returns of the benchmark

        Returns:
            Dictionary with risk metrics comparison
        """
        from .risk_management import RiskManagementService
        risk_service = RiskManagementService()

        if returns1.empty or returns2.empty:
            return {'error': 'Missing returns data'}

        # Align the returns
        common_index = returns1.index.intersection(returns2.index)
        if len(common_index) == 0:
            return {'error': 'No common dates for comparison'}

        aligned_returns1 = returns1.loc[common_index]
        aligned_returns2 = returns2.loc[common_index]

        # Calculate risk metrics
        risk_metrics = {}

        # VaR and CVaR
        var_levels = [0.90, 0.95, 0.99]

        for level in var_levels:
            var1 = risk_service.calculate_var_historical(aligned_returns1, level)
            var2 = risk_service.calculate_var_historical(aligned_returns2, level)

            cvar1 = risk_service.calculate_cvar(aligned_returns1, level)
            cvar2 = risk_service.calculate_cvar(aligned_returns2, level)

            var_key = f'var_{int(level * 100)}'
            cvar_key = f'cvar_{int(level * 100)}'

            risk_metrics[var_key] = {
                'portfolio1': var1,
                'portfolio2': var2,
                'diff': var2 - var1,
                'ratio': var2 / var1 if var1 > 0 else float('inf')
            }

            risk_metrics[cvar_key] = {
                'portfolio1': cvar1,
                'portfolio2': cvar2,
                'diff': cvar2 - cvar1,
                'ratio': cvar2 / cvar1 if cvar1 > 0 else float('inf')
            }

        # Drawdown analysis
        drawdowns1 = risk_service.analyze_drawdowns(aligned_returns1)
        drawdowns2 = risk_service.analyze_drawdowns(aligned_returns2)

        max_dd1 = abs(drawdowns1['depth'].min()) if not drawdowns1.empty else 0
        max_dd2 = abs(drawdowns2['depth'].min()) if not drawdowns2.empty else 0

        avg_dd1 = abs(drawdowns1['depth'].mean()) if not drawdowns1.empty else 0
        avg_dd2 = abs(drawdowns2['depth'].mean()) if not drawdowns2.empty else 0

        risk_metrics['max_drawdown'] = {
            'portfolio1': max_dd1,
            'portfolio2': max_dd2,
            'diff': max_dd2 - max_dd1,
            'ratio': max_dd2 / max_dd1 if max_dd1 > 0 else float('inf')
        }

        risk_metrics['avg_drawdown'] = {
            'portfolio1': avg_dd1,
            'portfolio2': avg_dd2,
            'diff': avg_dd2 - avg_dd1,
            'ratio': avg_dd2 / avg_dd1 if avg_dd1 > 0 else float('inf')
        }

        # Volatility comparison
        vol1 = aligned_returns1.std() * np.sqrt(252)
        vol2 = aligned_returns2.std() * np.sqrt(252)

        risk_metrics['volatility'] = {
            'portfolio1': vol1,
            'portfolio2': vol2,
            'diff': vol2 - vol1,
            'ratio': vol2 / vol1 if vol1 > 0 else float('inf')
        }

        # Beta comparison if benchmark provided
        if benchmark_returns is not None:
            aligned_benchmark = benchmark_returns.loc[common_index]

            beta1 = aligned_returns1.cov(aligned_benchmark) / aligned_benchmark.var()
            beta2 = aligned_returns2.cov(aligned_benchmark) / aligned_benchmark.var()

            risk_metrics['beta'] = {
                'portfolio1': beta1,
                'portfolio2': beta2,
                'diff': beta2 - beta1,
                'ratio': beta2 / beta1 if beta1 > 0 else float('inf')
            }

        return risk_metrics

    def compare_sector_allocations(
            self,
            portfolio1: Dict,
            portfolio2: Dict
    ) -> Dict:
        """
        Compare sector allocations.

        Args:
            portfolio1: First portfolio data
            portfolio2: Second portfolio data

        Returns:
            Dictionary with sector allocation comparison
        """
        # This is similar to _get_sector_weights but returns more detailed comparison
        sectors1 = self._get_sector_weights(portfolio1)
        sectors2 = self._get_sector_weights(portfolio2)

        # Compare sectors
        all_sectors = set(sectors1.keys()) | set(sectors2.keys())
        sector_comparison = {}

        for sector in all_sectors:
            weight1 = sectors1.get(sector, 0)
            weight2 = sectors2.get(sector, 0)
            diff = weight2 - weight1

            sector_comparison[sector] = {
                'weight1': weight1,
                'weight2': weight2,
                'diff': diff,
                'relative_diff': diff / weight1 * 100 if weight1 > 0 else float('inf')
            }

        # Calculate sector concentration
        concentration1 = sum(w ** 2 for w in sectors1.values())
        concentration2 = sum(w ** 2 for w in sectors2.values())

        return {
            'sector_comparison': sector_comparison,
            'concentration1': concentration1,
            'concentration2': concentration2,
            'concentration_diff': concentration2 - concentration1
        }

    def calculate_differential_returns(
            self,
            returns1: pd.Series,
            returns2: pd.Series
    ) -> pd.Series:
        """
        Calculate differential returns between two portfolios.

        Args:
            returns1: Returns of the first portfolio
            returns2: Returns of the second portfolio

        Returns:
            Series with differential returns
        """
        if returns1.empty or returns2.empty:
            return pd.Series()

        # Align the returns
        common_index = returns1.index.intersection(returns2.index)
        if len(common_index) == 0:
            return pd.Series()

        aligned_returns1 = returns1.loc[common_index]
        aligned_returns2 = returns2.loc[common_index]

        # Calculate differential returns
        differential_returns = aligned_returns2 - aligned_returns1

        return differential_returns

    def compare_historical_scenarios(
            self,
            portfolio1: Dict,
            portfolio2: Dict,
            scenarios: List[str]
    ) -> Dict:
        """
        Compare performance under historical scenarios.

        Args:
            portfolio1: First portfolio data
            portfolio2: Second portfolio data
            scenarios: List of scenario keys

        Returns:
            Dictionary with scenario comparison results
        """
        if not portfolio1 or not portfolio2 or not scenarios:
            return {'error': 'Missing required data'}

        # In a real implementation, this would involve using the risk management service
        # to analyze how each portfolio would perform under historical scenarios

        # Placeholder results
        scenario_results = {}

        for scenario in scenarios:
            scenario_results[scenario] = {
                'portfolio1_impact': -0.1,  # Placeholder
                'portfolio2_impact': -0.15,  # Placeholder
                'relative_performance': -0.05  # Placeholder
            }

        return {
            'scenario_results': scenario_results
        }