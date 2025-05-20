# backend/app/core/services/diversification.py
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
import logging

# Setup logging
logger = logging.getLogger(__name__)


class DiversificationService:
    """Diversification analysis service."""

    def calculate_effective_n(
            self,
            returns: pd.DataFrame,
            weights: Dict[str, float]
    ) -> float:
        """
        Calculate effective number of assets (diversification metric).

        Args:
            returns: DataFrame with asset returns
            weights: Dictionary with asset weights {ticker: weight}

        Returns:
            Effective number of assets as a float
        """
        if returns.empty or not weights:
            return 0.0

        # Convert weights to array
        weights_array = np.array([weights.get(ticker, 0.0) for ticker in returns.columns])

        # Normalize weights
        if np.sum(weights_array) > 0:
            weights_array = weights_array / np.sum(weights_array)

        # Calculate effective N using Herfindahl-Hirschman Index (HHI)
        hhi = np.sum(weights_array ** 2)

        if hhi > 0:
            return 1.0 / hhi
        else:
            return 0.0

    def analyze_hierarchical_risks(
            self,
            returns: pd.DataFrame,
            weights: Dict[str, float],
            asset_grouping: Dict[str, List[str]] = None
    ) -> Dict:
        """
        Analyze hierarchical risks in portfolio.

        Args:
            returns: DataFrame with asset returns
            weights: Dictionary with asset weights {ticker: weight}
            asset_grouping: Dictionary with groups of assets {group_name: [ticker1, ticker2, ...]}

        Returns:
            Dictionary with hierarchical risk analysis
        """
        if returns.empty or not weights:
            return {'error': 'Missing required data for hierarchical risk analysis'}

        # Calculate covariance matrix
        cov_matrix = returns.cov()

        # Convert weights to dictionary with tickers in returns
        filtered_weights = {ticker: weights.get(ticker, 0.0) for ticker in returns.columns}

        # Normalize weights
        total_weight = sum(filtered_weights.values())
        if total_weight > 0:
            filtered_weights = {ticker: weight / total_weight for ticker, weight in filtered_weights.items()}

        # Create weights array
        weights_array = np.array([filtered_weights.get(ticker, 0.0) for ticker in returns.columns])

        # Calculate portfolio variance
        portfolio_variance = np.dot(weights_array.T, np.dot(cov_matrix, weights_array))
        portfolio_volatility = np.sqrt(portfolio_variance)

        # Calculate risk contribution for each asset
        if portfolio_volatility > 0:
            marginal_contributions = np.dot(cov_matrix, weights_array) / portfolio_volatility
            risk_contributions = weights_array * marginal_contributions
            normalized_contributions = risk_contributions / portfolio_volatility
        else:
            normalized_contributions = weights_array  # Equal to weights if volatility is zero

        asset_risk_contributions = {
            ticker: normalized_contributions[i]
            for i, ticker in enumerate(returns.columns)
        }

        # Analyze risk by groups if provided
        group_risk_contributions = {}

        if asset_grouping:
            # Calculate risk contribution for each group
            for group_name, tickers in asset_grouping.items():
                valid_tickers = [ticker for ticker in tickers if ticker in returns.columns]
                if not valid_tickers:
                    continue

                group_contribution = sum(asset_risk_contributions.get(ticker, 0.0) for ticker in valid_tickers)
                group_weight = sum(filtered_weights.get(ticker, 0.0) for ticker in valid_tickers)

                group_risk_contributions[group_name] = {
                    'risk_contribution': group_contribution,
                    'weight': group_weight,
                    'risk_concentration': group_contribution / group_weight if group_weight > 0 else 0.0,
                    'assets': valid_tickers
                }

        # Calculate risk concentration
        weight_concentration = np.sum(weights_array ** 2)
        risk_concentration = np.sum(normalized_contributions ** 2)

        # Calculate diversification ratio
        diversification_ratio = portfolio_volatility / np.sqrt(np.sum(weights_array * np.diag(cov_matrix) ** 0.5) ** 2)

        return {
            'portfolio_volatility': portfolio_volatility,
            'asset_risk_contributions': asset_risk_contributions,
            'group_risk_contributions': group_risk_contributions,
            'weight_concentration': weight_concentration,
            'risk_concentration': risk_concentration,
            'diversification_ratio': diversification_ratio,
            'effective_number': 1.0 / risk_concentration if risk_concentration > 0 else 0.0
        }

    def calculate_risk_contribution(
            self,
            returns: pd.DataFrame,
            weights: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calculate risk contribution of each asset to portfolio risk.

        Args:
            returns: DataFrame with asset returns
            weights: Dictionary with asset weights {ticker: weight}

        Returns:
            Dictionary with risk contribution percentages {ticker: contribution}
        """
        if returns.empty or not weights:
            return {}

        # Filter returns to include only assets in weights
        tickers = list(weights.keys())
        filtered_returns = returns[tickers].copy()

        # Calculate covariance matrix
        cov_matrix = filtered_returns.cov()

        # Create weights array
        weight_array = np.array([weights.get(ticker, 0) for ticker in filtered_returns.columns])

        # Calculate portfolio variance
        portfolio_variance = np.dot(weight_array.T, np.dot(cov_matrix, weight_array))

        # Calculate marginal contribution to risk
        mcr = np.dot(cov_matrix, weight_array)

        # Calculate component contribution to risk
        ccr = weight_array * mcr

        # Calculate percentage contribution to risk
        pcr = ccr / portfolio_variance if portfolio_variance > 0 else weight_array

        # Create dictionary with risk contributions
        risk_contribution = {ticker: pcr[i] for i, ticker in enumerate(filtered_returns.columns)}

        return risk_contribution

    def optimize_diversification(
            self,
            returns: pd.DataFrame,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Optimize portfolio for maximum diversification.

        Args:
            returns: DataFrame with asset returns
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty:
            return {'error': 'No returns data provided'}

        import scipy.optimize as sco

        # Number of assets
        n_assets = len(returns.columns)

        # Calculate covariance matrix
        cov_matrix = returns.cov()

        # Vector of asset volatilities
        asset_vols = np.sqrt(np.diag(cov_matrix))

        # Function to minimize (negative of diversification ratio)
        def neg_diversification_ratio(weights):
            weights = np.array(weights)
            portfolio_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            weighted_vol_sum = np.sum(weights * asset_vols)

            if portfolio_vol == 0 or weighted_vol_sum == 0:
                return 0

            # Diversification ratio = weighted sum of volatilities / portfolio volatility
            div_ratio = weighted_vol_sum / portfolio_vol
            return -div_ratio  # Negative because we want to maximize

        # Constraints
        bounds = tuple((min_weight, max_weight) for _ in range(n_assets))
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})

        # Initial guess (equal weights)
        init_guess = np.array([1.0 / n_assets] * n_assets)

        # Optimize portfolio
        result = sco.minimize(neg_diversification_ratio, init_guess, method='SLSQP',
                              bounds=bounds, constraints=constraints)

        # Check if optimization was successful
        if not result['success']:
            return {'error': f'Optimization failed: {result["message"]}'}

        # Extract optimal weights
        optimal_weights = result['x']

        # Calculate diversification ratio
        portfolio_vol = np.sqrt(np.dot(optimal_weights.T, np.dot(cov_matrix, optimal_weights)))
        weighted_vol_sum = np.sum(optimal_weights * asset_vols)
        diversification_ratio = weighted_vol_sum / portfolio_vol if portfolio_vol > 0 else 0

        # Calculate expected returns (annualized)
        expected_returns = returns.mean() * 252

        # Calculate portfolio statistics
        portfolio_return = np.sum(expected_returns * optimal_weights)
        portfolio_risk = portfolio_vol * np.sqrt(252)  # Annualized

        # Generate weights dictionary
        weights_dict = {ticker: weight for ticker, weight in zip(returns.columns, optimal_weights)}

        # Calculate effective number of assets
        effective_n = 1.0 / np.sum(optimal_weights ** 2) if np.sum(optimal_weights ** 2) > 0 else 0

        return {
            'method': 'maximum_diversification',
            'optimal_weights': weights_dict,
            'expected_return': portfolio_return,
            'expected_risk': portfolio_risk,
            'diversification_ratio': diversification_ratio,
            'effective_n': effective_n
        }

    def calculate_portfolio_concentration(
            self,
            weights: Dict[str, float],
            sectors: Dict[str, str] = None
    ) -> Dict:
        """
        Calculate portfolio concentration metrics.

        Args:
            weights: Dictionary with asset weights {ticker: weight}
            sectors: Dictionary with sector assignments of assets {ticker: sector}

        Returns:
            Dictionary with concentration metrics
        """
        if not weights:
            return {'error': 'No weights provided'}

        # Normalize weights
        total_weight = sum(weights.values())
        if total_weight > 0:
            normalized_weights = {ticker: weight / total_weight for ticker, weight in weights.items()}
        else:
            normalized_weights = weights

        # Calculate Herfindahl-Hirschman Index (HHI) for assets
        hhi_assets = sum(weight ** 2 for weight in normalized_weights.values())

        # Calculate effective number of assets
        effective_n_assets = 1.0 / hhi_assets if hhi_assets > 0 else 0

        # Calculate concentration metrics for sectors if provided
        sector_metrics = {}

        if sectors:
            # Calculate weights by sector
            sector_weights = {}

            for ticker, weight in normalized_weights.items():
                if ticker in sectors:
                    sector = sectors[ticker]
                    if sector not in sector_weights:
                        sector_weights[sector] = 0
                    sector_weights[sector] += weight

            # Calculate HHI for sectors
            hhi_sectors = sum(weight ** 2 for weight in sector_weights.values())

            # Calculate effective number of sectors
            effective_n_sectors = 1.0 / hhi_sectors if hhi_sectors > 0 else 0

            # Calculate concentration ratio (top sectors)
            sorted_sectors = sorted(sector_weights.items(), key=lambda x: x[1], reverse=True)
            concentration_ratio_3 = sum(weight for _, weight in sorted_sectors[:3])
            concentration_ratio_5 = sum(weight for _, weight in sorted_sectors[:5])

            sector_metrics = {
                'sector_weights': sector_weights,
                'hhi_sectors': hhi_sectors,
                'effective_n_sectors': effective_n_sectors,
                'concentration_ratio_3': concentration_ratio_3,
                'concentration_ratio_5': concentration_ratio_5
            }

        # Calculate concentration ratio (top assets)
        sorted_assets = sorted(normalized_weights.items(), key=lambda x: x[1], reverse=True)
        concentration_ratio_3_assets = sum(weight for _, weight in sorted_assets[:3])
        concentration_ratio_5_assets = sum(weight for _, weight in sorted_assets[:5])
        concentration_ratio_10_assets = sum(weight for _, weight in sorted_assets[:10])

        return {
            'hhi_assets': hhi_assets,
            'effective_n_assets': effective_n_assets,
            'concentration_ratio_3_assets': concentration_ratio_3_assets,
            'concentration_ratio_5_assets': concentration_ratio_5_assets,
            'concentration_ratio_10_assets': concentration_ratio_10_assets,
            **sector_metrics
        }

    def calculate_optimal_number_of_assets(
            self,
            returns: pd.DataFrame,
            max_assets: int = None,
            criterion: str = 'variance'
    ) -> Dict:
        """
        Determine optimal number of assets for diversification.

        Args:
            returns: DataFrame with asset returns
            max_assets: Maximum number of assets to consider
            criterion: Criterion for optimization ('variance', 'sharpe', 'diversification')

        Returns:
            Dictionary with optimization results
        """
        if returns.empty:
            return {'error': 'No returns data provided'}

        # Set max_assets to total number of assets if not provided
        if max_assets is None or max_assets > len(returns.columns):
            max_assets = len(returns.columns)

        # Calculate expected returns and covariance matrix
        expected_returns = returns.mean() * 252  # Annualized
        cov_matrix = returns.cov() * 252  # Annualized

        # Results for different numbers of assets
        results = []

        # Start with the assets with highest Sharpe ratio
        sharpe_ratios = expected_returns / np.sqrt(np.diag(cov_matrix))
        ranked_assets = sharpe_ratios.sort_values(ascending=False).index

        for n_assets in range(1, max_assets + 1):
            # Select top n assets
            selected_assets = ranked_assets[:n_assets]
            selected_returns = returns[selected_assets]

            # Equal weights
            weights = np.ones(n_assets) / n_assets

            # Calculate portfolio statistics
            portfolio_return = np.dot(expected_returns[selected_assets], weights)
            portfolio_variance = np.dot(weights.T, np.dot(cov_matrix.loc[selected_assets, selected_assets], weights))
            portfolio_volatility = np.sqrt(portfolio_variance)
            sharpe_ratio = portfolio_return / portfolio_volatility if portfolio_volatility > 0 else 0

            # Calculate diversification metrics
            asset_vols = np.sqrt(np.diag(cov_matrix.loc[selected_assets, selected_assets]))
            weighted_vol_sum = np.sum(weights * asset_vols)
            diversification_ratio = weighted_vol_sum / portfolio_volatility if portfolio_volatility > 0 else 0

            results.append({
                'n_assets': n_assets,
                'assets': list(selected_assets),
                'portfolio_return': portfolio_return,
                'portfolio_volatility': portfolio_volatility,
                'sharpe_ratio': sharpe_ratio,
                'diversification_ratio': diversification_ratio
            })

        # Determine optimal number of assets based on criterion
        if criterion == 'variance':
            # Minimize volatility
            optimal_result = min(results, key=lambda x: x['portfolio_volatility'])
        elif criterion == 'sharpe':
            # Maximize Sharpe ratio
            optimal_result = max(results, key=lambda x: x['sharpe_ratio'])
        elif criterion == 'diversification':
            # Maximize diversification ratio
            optimal_result = max(results, key=lambda x: x['diversification_ratio'])
        else:
            return {'error': f'Unknown criterion: {criterion}'}

        return {
            'optimal_n_assets': optimal_result['n_assets'],
            'optimal_assets': optimal_result['assets'],
            'criterion': criterion,
            'optimal_metrics': {
                'portfolio_return': optimal_result['portfolio_return'],
                'portfolio_volatility': optimal_result['portfolio_volatility'],
                'sharpe_ratio': optimal_result['sharpe_ratio'],
                'diversification_ratio': optimal_result['diversification_ratio']
            },
            'all_results': results
        }