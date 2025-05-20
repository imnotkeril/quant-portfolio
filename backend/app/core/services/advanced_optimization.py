# backend/app/core/services/advanced_optimization.py
import numpy as np
import pandas as pd
import scipy.optimize as sco
from typing import Dict, List, Tuple, Optional, Union, Any
import logging

# Setup logging
logger = logging.getLogger(__name__)


class AdvancedOptimizationService:
    """Advanced portfolio optimization service with sophisticated methods."""

    def robust_optimization(
            self,
            returns: pd.DataFrame,
            risk_free_rate: float = 0.0,
            uncertainty_level: float = 0.05,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Perform robust optimization accounting for estimation uncertainty.

        Args:
            returns: DataFrame with asset returns
            risk_free_rate: Risk-free rate (annual)
            uncertainty_level: Level of uncertainty in expected returns (0-1)
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty:
            return {'error': 'No returns data provided'}

        # Number of assets
        n_assets = len(returns.columns)

        # Calculate expected returns (annualized)
        expected_returns = returns.mean() * 252

        # Calculate covariance matrix (annualized)
        cov_matrix = returns.cov() * 252

        # Estimate return uncertainty (standard errors)
        return_std_errors = returns.std() / np.sqrt(len(returns)) * 252

        # Apply uncertainty to expected returns (worst-case scenario)
        adjusted_returns = expected_returns - uncertainty_level * return_std_errors

        # Function to calculate portfolio statistics with adjusted returns
        def portfolio_stats(weights):
            weights = np.array(weights)
            portfolio_return = np.sum(adjusted_returns * weights)
            portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return portfolio_return, portfolio_risk

        # Function to minimize for negative Sharpe Ratio
        def neg_sharpe_ratio(weights):
            portfolio_return, portfolio_risk = portfolio_stats(weights)
            return -(portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Constraints
        bounds = tuple((min_weight, max_weight) for _ in range(n_assets))
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})

        # Initial guess (equal weights)
        init_guess = np.array([1.0 / n_assets] * n_assets)

        # Optimize portfolio
        result = sco.minimize(neg_sharpe_ratio, init_guess, method='SLSQP',
                              bounds=bounds, constraints=constraints)

        # Check if optimization was successful
        if not result['success']:
            return {'error': f'Optimization failed: {result["message"]}'}

        # Extract optimal weights
        optimal_weights = result['x']

        # Calculate portfolio statistics (with original and adjusted returns)
        orig_portfolio_return = np.sum(expected_returns * optimal_weights)
        adjusted_portfolio_return, portfolio_risk = portfolio_stats(optimal_weights)

        sharpe_ratio = (adjusted_portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Generate weights dictionary
        weights_dict = {ticker: weight for ticker, weight in zip(returns.columns, optimal_weights)}

        return {
            'method': 'robust_optimization',
            'optimal_weights': weights_dict,
            'expected_return': orig_portfolio_return,
            'adjusted_return': adjusted_portfolio_return,
            'expected_risk': portfolio_risk,
            'sharpe_ratio': sharpe_ratio,
            'uncertainty_level': uncertainty_level
        }

    def cost_aware_optimization(
            self,
            returns: pd.DataFrame,
            current_weights: Dict[str, float],
            transaction_costs: Dict[str, float],
            risk_free_rate: float = 0.0,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Perform optimization accounting for transaction costs.

        Args:
            returns: DataFrame with asset returns
            current_weights: Dictionary with current asset weights {ticker: weight}
            transaction_costs: Dictionary with transaction costs for each asset {ticker: cost}
            risk_free_rate: Risk-free rate (annual)
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty or not current_weights or not transaction_costs:
            return {'error': 'Missing required data for cost-aware optimization'}

        # Ensure all assets have current weights and transaction costs
        for ticker in returns.columns:
            if ticker not in current_weights:
                current_weights[ticker] = 0.0
            if ticker not in transaction_costs:
                transaction_costs[ticker] = 0.0

        # Number of assets
        n_assets = len(returns.columns)

        # Calculate expected returns (annualized)
        expected_returns = returns.mean() * 252

        # Calculate covariance matrix (annualized)
        cov_matrix = returns.cov() * 252

        # Convert current weights and transaction costs to arrays
        current_weights_array = np.array([current_weights.get(ticker, 0.0) for ticker in returns.columns])
        transaction_costs_array = np.array([transaction_costs.get(ticker, 0.0) for ticker in returns.columns])

        # Function to calculate portfolio statistics with transaction costs
        def portfolio_stats_with_costs(weights):
            weights = np.array(weights)

            # Calculate transaction costs
            weight_changes = np.abs(weights - current_weights_array)
            total_cost = np.sum(weight_changes * transaction_costs_array)

            # Calculate return and risk
            portfolio_return = np.sum(expected_returns * weights) - total_cost
            portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

            return portfolio_return, portfolio_risk, total_cost

        # Function to minimize for negative Sharpe Ratio
        def neg_sharpe_ratio(weights):
            portfolio_return, portfolio_risk, _ = portfolio_stats_with_costs(weights)
            return -(portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Constraints
        bounds = tuple((min_weight, max_weight) for _ in range(n_assets))
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})

        # Initial guess (current weights)
        init_guess = current_weights_array.copy()

        # Ensure initial guess is valid
        if not np.isclose(np.sum(init_guess), 1.0):
            init_guess = init_guess / np.sum(init_guess) if np.sum(init_guess) > 0 else np.array(
                [1.0 / n_assets] * n_assets)

        # Optimize portfolio
        result = sco.minimize(neg_sharpe_ratio, init_guess, method='SLSQP',
                              bounds=bounds, constraints=constraints)

        # Check if optimization was successful
        if not result['success']:
            return {'error': f'Optimization failed: {result["message"]}'}

        # Extract optimal weights
        optimal_weights = result['x']

        # Calculate portfolio statistics
        portfolio_return, portfolio_risk, total_cost = portfolio_stats_with_costs(optimal_weights)
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Calculate weight changes
        weight_changes = {
            ticker: optimal_weights[i] - current_weights.get(ticker, 0.0)
            for i, ticker in enumerate(returns.columns)
        }

        # Generate weights dictionary
        weights_dict = {ticker: weight for ticker, weight in zip(returns.columns, optimal_weights)}

        # Calculate transaction costs for each asset
        costs_per_asset = {
            ticker: abs(weight_changes[ticker]) * transaction_costs.get(ticker, 0.0)
            for ticker in returns.columns
        }

        return {
            'method': 'cost_aware_optimization',
            'optimal_weights': weights_dict,
            'expected_return': portfolio_return,
            'expected_risk': portfolio_risk,
            'sharpe_ratio': sharpe_ratio,
            'total_transaction_cost': total_cost,
            'weight_changes': weight_changes,
            'costs_per_asset': costs_per_asset
        }

    def conditional_optimization(
            self,
            returns: pd.DataFrame,
            scenarios: Dict[str, pd.DataFrame],
            scenario_probabilities: Dict[str, float],
            risk_free_rate: float = 0.0,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Perform conditional optimization for different scenarios.

        Args:
            returns: Base case DataFrame with asset returns
            scenarios: Dictionary with scenario names as keys and returns DataFrames as values
            scenario_probabilities: Dictionary with scenario probabilities {scenario_name: probability}
            risk_free_rate: Risk-free rate (annual)
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty or not scenarios or not scenario_probabilities:
            return {'error': 'Missing required data for conditional optimization'}

        # Normalize scenario probabilities
        total_prob = sum(scenario_probabilities.values())
        if not np.isclose(total_prob, 1.0):
            scenario_probabilities = {k: v / total_prob for k, v in scenario_probabilities.items()}

        # Number of assets
        n_assets = len(returns.columns)

        # Prepare expected returns and covariance matrices for each scenario
        scenario_returns = {}
        scenario_covs = {}

        # Base case
        scenario_returns['base'] = returns.mean() * 252
        scenario_covs['base'] = returns.cov() * 252

        # Other scenarios
        for scenario_name, scenario_data in scenarios.items():
            if scenario_data.empty:
                continue

            # Ensure scenario data has the same columns as base returns
            common_columns = list(set(returns.columns).intersection(set(scenario_data.columns)))
            if not common_columns:
                continue

            scenario_returns[scenario_name] = scenario_data[common_columns].mean() * 252
            scenario_covs[scenario_name] = scenario_data[common_columns].cov() * 252

        # Function to calculate weighted expected return and risk
        def portfolio_conditional_stats(weights):
            weights = np.array(weights)

            # Initialize weighted return and risk
            weighted_return = 0.0
            weighted_risk = 0.0

            # Base case
            base_prob = scenario_probabilities.get('base', 0.0)
            if base_prob > 0:
                base_return = np.sum(scenario_returns['base'] * weights)
                base_risk = np.sqrt(np.dot(weights.T, np.dot(scenario_covs['base'], weights)))
                weighted_return += base_prob * base_return
                weighted_risk += base_prob * base_risk

            # Other scenarios
            for scenario_name in scenarios:
                if scenario_name not in scenario_returns or scenario_name not in scenario_covs:
                    continue

                scenario_prob = scenario_probabilities.get(scenario_name, 0.0)
                if scenario_prob > 0:
                    scenario_ret = np.sum(
                        scenario_returns[scenario_name] * weights[:len(scenario_returns[scenario_name])])
                    scenario_risk = np.sqrt(np.dot(weights[:len(scenario_returns[scenario_name])].T,
                                                   np.dot(scenario_covs[scenario_name],
                                                          weights[:len(scenario_returns[scenario_name])])))
                    weighted_return += scenario_prob * scenario_ret
                    weighted_risk += scenario_prob * scenario_risk

            return weighted_return, weighted_risk

        # Function to minimize for negative Sharpe Ratio
        def neg_conditional_sharpe_ratio(weights):
            weighted_return, weighted_risk = portfolio_conditional_stats(weights)
            return -(weighted_return - risk_free_rate) / weighted_risk if weighted_risk > 0 else 0

        # Constraints
        bounds = tuple((min_weight, max_weight) for _ in range(n_assets))
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})

        # Initial guess (equal weights)
        init_guess = np.array([1.0 / n_assets] * n_assets)

        # Optimize portfolio
        result = sco.minimize(neg_conditional_sharpe_ratio, init_guess, method='SLSQP',
                              bounds=bounds, constraints=constraints)

        # Check if optimization was successful
        if not result['success']:
            return {'error': f'Optimization failed: {result["message"]}'}

        # Extract optimal weights
        optimal_weights = result['x']

        # Calculate portfolio statistics
        weighted_return, weighted_risk = portfolio_conditional_stats(optimal_weights)
        weighted_sharpe = (weighted_return - risk_free_rate) / weighted_risk if weighted_risk > 0 else 0

        # Calculate scenario-specific metrics
        scenario_metrics = {}

        # Base case
        base_return = np.sum(scenario_returns['base'] * optimal_weights)
        base_risk = np.sqrt(np.dot(optimal_weights.T, np.dot(scenario_covs['base'], optimal_weights)))
        base_sharpe = (base_return - risk_free_rate) / base_risk if base_risk > 0 else 0

        scenario_metrics['base'] = {
            'expected_return': base_return,
            'expected_risk': base_risk,
            'sharpe_ratio': base_sharpe,
            'probability': scenario_probabilities.get('base', 0.0)
        }

        # Other scenarios
        for scenario_name in scenarios:
            if scenario_name not in scenario_returns or scenario_name not in scenario_covs:
                continue

            scenario_ret = np.sum(
                scenario_returns[scenario_name] * optimal_weights[:len(scenario_returns[scenario_name])])
            scenario_risk = np.sqrt(np.dot(optimal_weights[:len(scenario_returns[scenario_name])].T,
                                           np.dot(scenario_covs[scenario_name],
                                                  optimal_weights[:len(scenario_returns[scenario_name])])))
            scenario_sharpe = (scenario_ret - risk_free_rate) / scenario_risk if scenario_risk > 0 else 0

            scenario_metrics[scenario_name] = {
                'expected_return': scenario_ret,
                'expected_risk': scenario_risk,
                'sharpe_ratio': scenario_sharpe,
                'probability': scenario_probabilities.get(scenario_name, 0.0)
            }

        # Generate weights dictionary
        weights_dict = {ticker: weight for ticker, weight in zip(returns.columns, optimal_weights)}

        return {
            'method': 'conditional_optimization',
            'optimal_weights': weights_dict,
            'weighted_return': weighted_return,
            'weighted_risk': weighted_risk,
            'weighted_sharpe': weighted_sharpe,
            'scenario_metrics': scenario_metrics
        }

    def esg_optimization(
            self,
            returns: pd.DataFrame,
            esg_scores: Dict[str, float],
            esg_target: float = None,
            risk_free_rate: float = 0.0,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Perform optimization with ESG criteria.

        Args:
            returns: DataFrame with asset returns
            esg_scores: Dictionary with ESG scores for each asset {ticker: score}
            esg_target: Target ESG score for the portfolio (if None, maximizes ESG)
            risk_free_rate: Risk-free rate (annual)
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty or not esg_scores:
            return {'error': 'Missing required data for ESG optimization'}

        # Ensure all assets have ESG scores
        for ticker in returns.columns:
            if ticker not in esg_scores:
                esg_scores[ticker] = 0.0

        # Number of assets
        n_assets = len(returns.columns)

        # Calculate expected returns (annualized)
        expected_returns = returns.mean() * 252

        # Calculate covariance matrix (annualized)
        cov_matrix = returns.cov() * 252

        # Convert ESG scores to array
        esg_array = np.array([esg_scores.get(ticker, 0.0) for ticker in returns.columns])

        # Function to calculate portfolio statistics
        def portfolio_stats(weights):
            weights = np.array(weights)
            portfolio_return = np.sum(expected_returns * weights)
            portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            portfolio_esg = np.sum(esg_array * weights)
            return portfolio_return, portfolio_risk, portfolio_esg

        # Function to minimize for ESG-aware Sharpe Ratio
        def neg_esg_sharpe_ratio(weights):
            portfolio_return, portfolio_risk, _ = portfolio_stats(weights)
            return -(portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Function to minimize negative ESG score
        def neg_esg_score(weights):
            _, _, portfolio_esg = portfolio_stats(weights)
            return -portfolio_esg

        # Constraints
        bounds = tuple((min_weight, max_weight) for _ in range(n_assets))
        base_constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]

        # Add ESG constraint if target is specified
        if esg_target is not None:
            esg_constraint = {'type': 'eq', 'fun': lambda x: np.sum(esg_array * x) - esg_target}
            constraints = tuple(base_constraints + [esg_constraint])
        else:
            constraints = tuple(base_constraints)

        # Initial guess (equal weights)
        init_guess = np.array([1.0 / n_assets] * n_assets)

        # Optimize portfolio
        if esg_target is None:
            # Multi-objective optimization (maximize Sharpe and ESG)
            # We use a linear combination approach with ESG weight as 0.5
            def multi_objective(weights):
                sharpe = neg_esg_sharpe_ratio(weights)
                esg = neg_esg_score(weights)
                return 0.5 * sharpe + 0.5 * esg

            result = sco.minimize(multi_objective, init_guess, method='SLSQP',
                                  bounds=bounds, constraints=constraints)
        else:
            # Maximize Sharpe with ESG constraint
            result = sco.minimize(neg_esg_sharpe_ratio, init_guess, method='SLSQP',
                                  bounds=bounds, constraints=constraints)

        # Check if optimization was successful
        if not result['success']:
            return {'error': f'Optimization failed: {result["message"]}'}

        # Extract optimal weights
        optimal_weights = result['x']

        # Calculate portfolio statistics
        portfolio_return, portfolio_risk, portfolio_esg = portfolio_stats(optimal_weights)
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        # Generate weights dictionary
        weights_dict = {ticker: weight for ticker, weight in zip(returns.columns, optimal_weights)}

        # Calculate ESG contribution
        esg_contribution = {
            ticker: weight * esg_scores.get(ticker, 0.0)
            for ticker, weight in zip(returns.columns, optimal_weights)
        }

        return {
            'method': 'esg_optimization',
            'optimal_weights': weights_dict,
            'expected_return': portfolio_return,
            'expected_risk': portfolio_risk,
            'sharpe_ratio': sharpe_ratio,
            'portfolio_esg_score': portfolio_esg,
            'esg_contribution': esg_contribution,
            'esg_target': esg_target
        }

    def hierarchical_optimization(
            self,
            returns: pd.DataFrame,
            asset_groups: Dict[str, List[str]],
            group_weights: Dict[str, float] = None,
            risk_free_rate: float = 0.0,
            min_weight: float = 0.0,
            max_weight: float = 1.0
    ) -> Dict:
        """
        Perform hierarchical optimization.

        Args:
            returns: DataFrame with asset returns
            asset_groups: Dictionary with groups of assets {group_name: [ticker1, ticker2, ...]}
            group_weights: Dictionary with target weights for each group {group_name: weight}
            risk_free_rate: Risk-free rate (annual)
            min_weight: Minimum weight constraint
            max_weight: Maximum weight constraint

        Returns:
            Dictionary with optimization results
        """
        if returns.empty or not asset_groups:
            return {'error': 'Missing required data for hierarchical optimization'}

        # Verify that all assets in groups are in returns data
        all_grouped_assets = []
        for assets in asset_groups.values():
            all_grouped_assets.extend(assets)

        valid_tickers = set(returns.columns).intersection(set(all_grouped_assets))
        if not valid_tickers:
            return {'error': 'No valid assets found in asset groups'}

        # If group weights not provided, optimize at the group level first
        if group_weights is None:
            group_weights = self._optimize_group_weights(returns, asset_groups, risk_free_rate)
        else:
            # Normalize group weights
            total_weight = sum(group_weights.values())
            if not np.isclose(total_weight, 1.0) and total_weight > 0:
                group_weights = {k: v / total_weight for k, v in group_weights.items()}

        # Optimize within each group
        group_allocations = {}
        for group_name, assets in asset_groups.items():
            if group_name not in group_weights or group_weights[group_name] <= 0:
                continue

            # Filter returns for assets in this group
            group_assets = [a for a in assets if a in returns.columns]
            if not group_assets:
                continue

            group_returns = returns[group_assets]

            # Optimize this group
            try:
                from .optimization import OptimizationService
                optimization_service = OptimizationService()

                result = optimization_service.optimize_portfolio(
                    group_returns,
                    method='maximum_sharpe',
                    risk_free_rate=risk_free_rate,
                    min_weight=min_weight,
                    max_weight=max_weight
                )

                if 'error' in result:
                    # Use equal weights as fallback
                    equal_weight = 1.0 / len(group_assets)
                    group_allocations[group_name] = {
                        'assets': group_assets,
                        'weights': {ticker: equal_weight for ticker in group_assets},
                        'error': result['error']
                    }
                else:
                    group_allocations[group_name] = {
                        'assets': group_assets,
                        'weights': result['optimal_weights'],
                        'expected_return': result['expected_return'],
                        'expected_risk': result['expected_risk'],
                        'sharpe_ratio': result['sharpe_ratio']
                    }
            except Exception as e:
                logger.error(f"Error optimizing group {group_name}: {str(e)}")
                # Use equal weights as fallback
                equal_weight = 1.0 / len(group_assets)
                group_allocations[group_name] = {
                    'assets': group_assets,
                    'weights': {ticker: equal_weight for ticker in group_assets},
                    'error': str(e)
                }

        # Combine group allocations into final portfolio weights
        final_weights = {}

        for group_name, allocation in group_allocations.items():
            group_weight = group_weights.get(group_name, 0.0)

            for ticker, weight in allocation['weights'].items():
                # Final weight = Group weight × Asset weight within group
                if ticker not in final_weights:
                    final_weights[ticker] = 0.0

                final_weights[ticker] += group_weight * weight

        # Calculate overall portfolio statistics
        filtered_returns = returns[[ticker for ticker in final_weights.keys() if ticker in returns.columns]]
        if filtered_returns.empty:
            return {'error': 'No valid assets in final portfolio'}

        weights_array = np.array([final_weights.get(ticker, 0.0) for ticker in filtered_returns.columns])

        # Normalize weights
        if np.sum(weights_array) > 0:
            weights_array = weights_array / np.sum(weights_array)
            final_weights = {ticker: weights_array[i] for i, ticker in enumerate(filtered_returns.columns)}

        # Calculate expected returns and covariance matrix
        expected_returns = filtered_returns.mean() * 252
        cov_matrix = filtered_returns.cov() * 252

        # Calculate portfolio statistics
        portfolio_return = np.sum(expected_returns * weights_array)
        portfolio_risk = np.sqrt(np.dot(weights_array.T, np.dot(cov_matrix, weights_array)))
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0

        return {
            'method': 'hierarchical_optimization',
            'optimal_weights': final_weights,
            'expected_return': portfolio_return,
            'expected_risk': portfolio_risk,
            'sharpe_ratio': sharpe_ratio,
            'group_weights': group_weights,
            'group_allocations': group_allocations
        }

    def _optimize_group_weights(
            self,
            returns: pd.DataFrame,
            asset_groups: Dict[str, List[str]],
            risk_free_rate: float = 0.0
    ) -> Dict[str, float]:
        """
        Optimize weights for asset groups.

        Args:
            returns: DataFrame with asset returns
            asset_groups: Dictionary with groups of assets {group_name: [ticker1, ticker2, ...]}
            risk_free_rate: Risk-free rate (annual)

        Returns:
            Dictionary with optimal group weights {group_name: weight}
        """
        # Calculate returns for each group (as equal-weighted portfolios)
        group_returns = {}

        for group_name, assets in asset_groups.items():
            valid_assets = [a for a in assets if a in returns.columns]
            if not valid_assets:
                continue

            # Equal-weighted returns for this group
            group_return = returns[valid_assets].mean(axis=1)
            group_returns[group_name] = group_return

        if not group_returns:
            # If no valid groups, return equal weights
            return {group_name: 1.0 / len(asset_groups) for group_name in asset_groups}

        # Create a DataFrame of group returns
        group_returns_df = pd.DataFrame(group_returns)

        # Optimize at the group level
        try:
            from .optimization import OptimizationService
            optimization_service = OptimizationService()

            result = optimization_service.optimize_portfolio(
                group_returns_df,
                method='maximum_sharpe',
                risk_free_rate=risk_free_rate
            )

            if 'error' in result:
                # Use equal weights as fallback
                return {group_name: 1.0 / len(group_returns) for group_name in group_returns}

            return result['optimal_weights']
        except Exception as e:
            logger.error(f"Error optimizing group weights: {str(e)}")
            # Use equal weights as fallback
            return {group_name: 1.0 / len(group_returns) for group_name in group_returns}