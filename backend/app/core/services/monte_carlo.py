# backend/app/core/services/monte_carlo.py
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
import logging

# Setup logging
logger = logging.getLogger(__name__)


class MonteCarloService:
    """Advanced Monte Carlo simulation service."""

    def simulate_with_regime_switching(
            self,
            returns: pd.Series,
            initial_value: float = 10000,
            years: int = 10,
            simulations: int = 1000,
            annual_contribution: float = 0,
            regime_params: Dict[str, Dict] = None
    ) -> Dict:
        if returns.empty:
            raise ValueError('No returns data provided')

        """
        Perform simulation with regime switching between market states.

        Args:
            returns: Series with portfolio returns
            initial_value: Initial portfolio value
            years: Number of years to simulate
            simulations: Number of Monte Carlo simulations
            annual_contribution: Annual contribution to the portfolio
            regime_params: Dictionary with parameters for different market regimes

        Returns:
            Dictionary with simulation results
        """
        if returns.empty:
            return {'error': 'No returns data provided'}

        # Default regime parameters if none provided
        if regime_params is None:
            # Define two market regimes: normal and stressed
            regime_params = {
                'normal': {
                    'probability': 0.8,  # 80% probability of normal regime
                    'mean_multiplier': 1.0,  # Normal returns
                    'vol_multiplier': 1.0,  # Normal volatility
                    'transition_probs': {'normal': 0.95, 'stressed': 0.05}  # 5% chance to switch to stressed
                },
                'stressed': {
                    'probability': 0.2,  # 20% probability of stressed regime
                    'mean_multiplier': -0.5,  # Lower or negative returns
                    'vol_multiplier': 2.0,  # Higher volatility
                    'transition_probs': {'normal': 0.2, 'stressed': 0.8}  # 20% chance to switch back to normal
                }
            }

        # Calculate base parameters from historical returns
        mu = returns.mean()
        sigma = returns.std()

        # Annualized parameters
        annual_mu = mu * 252
        annual_sigma = sigma * np.sqrt(252)

        # Daily parameters for simulation
        daily_mu = annual_mu / 252
        daily_sigma = annual_sigma / np.sqrt(252)

        # Calculate number of trading days to simulate
        trading_days = years * 252
        memory_estimate = simulations * trading_days * 8

        if memory_estimate > 1e9:
            logger.warning(f"Large simulation requested: ~{memory_estimate / 1e9:.2f}GB. "
                           f"Consider reducing simulations or years.")

            if simulations > 10000:
                simulations = 10000
                logger.warning(f"Reducing simulations to {simulations} to conserve memory.")

        # Set random seed for reproducibility
        np.random.seed(42)

        # Initialize array for simulation results
        simulation_results = np.zeros((simulations, trading_days + 1))
        simulation_results[:, 0] = initial_value

        # Daily contribution (if annual contribution is provided)
        daily_contribution = annual_contribution / 252 if annual_contribution else 0

        # Initialize regime tracking
        regime_counts = {regime: 0 for regime in regime_params}

        # Run Monte Carlo simulation with regime switching
        for sim in range(simulations):
            # Determine initial regime based on probabilities
            regime_probs = [regime_params[r]['probability'] for r in regime_params]
            initial_regime = np.random.choice(list(regime_params.keys()), p=regime_probs)
            current_regime = initial_regime

            # Track regimes throughout simulation
            simulation_regimes = []

            for day in range(trading_days):
                # Get regime parameters
                regime_mean_mult = regime_params[current_regime]['mean_multiplier']
                regime_vol_mult = regime_params[current_regime]['vol_multiplier']

                # Adjust mean and volatility based on current regime
                adjusted_mu = daily_mu * regime_mean_mult
                adjusted_sigma = daily_sigma * regime_vol_mult

                # Generate random return
                random_return = np.random.normal(adjusted_mu, adjusted_sigma)

                # Calculate new portfolio value
                simulation_results[sim, day + 1] = simulation_results[sim, day] * (
                        1 + random_return) + daily_contribution

                # Record current regime
                simulation_regimes.append(current_regime)
                regime_counts[current_regime] += 1

                # Determine if regime switches
                transition_probs = regime_params[current_regime]['transition_probs']
                regimes = list(transition_probs.keys())
                probs = list(transition_probs.values())
                current_regime = np.random.choice(regimes, p=probs)

        # Calculate statistics from simulation results
        final_values = simulation_results[:, -1]
        percentiles = {
            'min': np.min(final_values),
            'max': np.max(final_values),
            'median': np.median(final_values),
            'mean': np.mean(final_values),
            'p10': np.percentile(final_values, 10),
            'p25': np.percentile(final_values, 25),
            'p75': np.percentile(final_values, 75),
            'p90': np.percentile(final_values, 90)
        }

        # Calculate probability of reaching certain targets
        targets = {
            'double': initial_value * 2,
            'triple': initial_value * 3,
            'quadruple': initial_value * 4
        }

        probabilities = {
            f'prob_reaching_{name}': np.mean(final_values >= target) for name, target in targets.items()
        }

        # Calculate regime statistics
        total_days = simulations * trading_days
        regime_percentages = {regime: count / total_days for regime, count in regime_counts.items()}

        return {
            'initial_value': initial_value,
            'years': years,
            'simulations': simulations,
            'annual_contribution': annual_contribution,
            'annual_mean_return': annual_mu,
            'annual_volatility': annual_sigma,
            'percentiles': percentiles,
            'probabilities': probabilities,
            'regime_percentages': regime_percentages,
            'simulation_data': simulation_results
        }

    def simulate_with_copulas(
            self,
            returns: pd.DataFrame,
            weights: Dict[str, float],
            initial_value: float = 10000,
            years: int = 10,
            simulations: int = 1000,
            annual_contribution: float = 0,
            copula_type: str = 'gaussian'
    ) -> Dict:
        """
        Perform simulation using copulas for modeling dependencies between assets.

        Args:
            returns: DataFrame with asset returns
            weights: Dictionary with asset weights {ticker: weight}
            initial_value: Initial portfolio value
            years: Number of years to simulate
            simulations: Number of Monte Carlo simulations
            annual_contribution: Annual contribution to the portfolio
            copula_type: Type of copula to use ('gaussian', 't', 'clayton', 'gumbel')

        Returns:
            Dictionary with simulation results
        """
        if returns.empty or not weights:
            return {'error': 'Missing required data for copula simulation'}

        try:
            # This requires installing additional libraries: copulas
            from copulas.multivariate import GaussianMultivariate
            has_copulas = True
        except ImportError:
            has_copulas = False
            logger.warning("The 'copulas' package is not installed. Using standard multivariate normal instead.")

        # Filter returns to include only assets in weights
        tickers = list(weights.keys())
        filtered_returns = returns[tickers].copy()

        # Calculate weights array
        weights_array = np.array([weights.get(ticker, 0) for ticker in tickers])

        # Normalize weights
        if sum(weights_array) > 0:
            weights_array = weights_array / sum(weights_array)

        # Calculate means and covariance matrix
        means = filtered_returns.mean().values
        cov_matrix = filtered_returns.cov().values

        # Calculate number of trading days to simulate
        trading_days = years * 252

        # Daily contribution (if annual contribution is provided)
        daily_contribution = annual_contribution / 252 if annual_contribution else 0

        # Set random seed for reproducibility
        np.random.seed(42)

        # Initialize array for simulation results
        simulation_results = np.zeros((simulations, trading_days + 1))
        simulation_results[:, 0] = initial_value

        # Generate correlated random returns
        if has_copulas and copula_type != 'gaussian':
            # Using copulas package for non-Gaussian copulas
            copula = GaussianMultivariate()
            copula.fit(filtered_returns)

            # Generate samples
            all_simulated_returns = []

            for _ in range(simulations):
                sim_returns = copula.sample(trading_days)
                all_simulated_returns.append(sim_returns)
        else:
            # Generate multivariate normal samples
            all_simulated_returns = []

            for _ in range(simulations):
                # Generate random returns for all assets
                sim_returns = np.random.multivariate_normal(
                    means * 252,  # Annualized mean
                    cov_matrix * 252,  # Annualized covariance
                    trading_days
                ) / 252  # Convert back to daily returns

                all_simulated_returns.append(sim_returns)

        # Run Monte Carlo simulation with correlated returns
        for sim in range(simulations):
            simulated_returns = all_simulated_returns[sim]

            for day in range(trading_days):
                # Calculate portfolio return for this day
                if isinstance(simulated_returns, pd.DataFrame):
                    day_returns = simulated_returns.iloc[day].values
                else:
                    day_returns = simulated_returns[day]

                portfolio_return = np.dot(day_returns, weights_array)

                # Calculate new portfolio value
                simulation_results[sim, day + 1] = simulation_results[sim, day] * (
                        1 + portfolio_return) + daily_contribution

        # Calculate statistics from simulation results
        final_values = simulation_results[:, -1]
        percentiles = {
            'min': np.min(final_values),
            'max': np.max(final_values),
            'median': np.median(final_values),
            'mean': np.mean(final_values),
            'p10': np.percentile(final_values, 10),
            'p25': np.percentile(final_values, 25),
            'p75': np.percentile(final_values, 75),
            'p90': np.percentile(final_values, 90)
        }

        # Calculate probability of reaching certain targets
        targets = {
            'double': initial_value * 2,
            'triple': initial_value * 3,
            'quadruple': initial_value * 4
        }

        probabilities = {
            f'prob_reaching_{name}': np.mean(final_values >= target) for name, target in targets.items()
        }

        # Calculate portfolio statistics
        annual_portfolio_return = np.dot(means * 252, weights_array)
        annual_portfolio_vol = np.sqrt(np.dot(weights_array.T, np.dot(cov_matrix * 252, weights_array)))

        return {
            'initial_value': initial_value,
            'years': years,
            'simulations': simulations,
            'annual_contribution': annual_contribution,
            'annual_portfolio_return': annual_portfolio_return,
            'annual_portfolio_volatility': annual_portfolio_vol,
            'percentiles': percentiles,
            'probabilities': probabilities,
            'simulation_data': simulation_results,
            'copula_type': copula_type if has_copulas else 'gaussian (fallback)'
        }

    def estimate_recovery_time(
            self,
            returns: pd.Series,
            drawdown_depth: float,
            confidence_level: float = 0.95,
            simulations: int = 1000
    ) -> Dict:
        """
        Estimate recovery time after a drawdown.

        Args:
            returns: Series with portfolio returns
            drawdown_depth: Drawdown depth as a positive percentage (e.g., 0.25 for 25%)
            confidence_level: Confidence level for the estimate
            simulations: Number of Monte Carlo simulations

        Returns:
            Dictionary with recovery time estimates
        """
        if returns.empty:
            return {'error': 'No returns data provided'}

        # Calculate mean and standard deviation of returns
        mu = returns.mean()
        sigma = returns.std()

        # Set random seed for reproducibility
        np.random.seed(42)

        # Initialize array for recovery times
        recovery_times = np.zeros(simulations)
        max_days = 252 * 10  # Maximum of 10 years to recover

        # Run simulations
        for sim in range(simulations):
            # Start from drawdown
            value = 1.0 - drawdown_depth
            days = 0

            # Simulate until recovery or max days reached
            while value < 1.0 and days < max_days:
                # Generate random return
                random_return = np.random.normal(mu, sigma)

                # Update value
                value *= (1 + random_return)
                days += 1

            # Record recovery time
            recovery_times[sim] = days if days < max_days else np.nan

        # Calculate recovery time statistics
        valid_times = recovery_times[~np.isnan(recovery_times)]

        if len(valid_times) == 0:
            return {
                'drawdown_depth': drawdown_depth,
                'recovery_time_mean': np.nan,
                'recovery_time_median': np.nan,
                'recovery_time_confidence_interval': (np.nan, np.nan),
                'recovery_probability': 0.0
            }

        recovery_time_mean = np.mean(valid_times)
        recovery_time_median = np.median(valid_times)
        recovery_probability = len(valid_times) / simulations

        # Calculate confidence interval
        confidence_interval = (
            np.percentile(valid_times, (1 - confidence_level) * 100 / 2),
            np.percentile(valid_times, 100 - (1 - confidence_level) * 100 / 2)
        )

        # Convert to trading days and months
        trading_days_mean = recovery_time_mean
        trading_days_median = recovery_time_median
        trading_days_ci = confidence_interval

        months_mean = trading_days_mean / 21
        months_median = trading_days_median / 21
        months_ci = (trading_days_ci[0] / 21, trading_days_ci[1] / 21)

        return {
            'drawdown_depth': drawdown_depth,
            'recovery_time_mean_days': trading_days_mean,
            'recovery_time_median_days': trading_days_median,
            'recovery_time_ci_days': trading_days_ci,
            'recovery_time_mean_months': months_mean,
            'recovery_time_median_months': months_median,
            'recovery_time_ci_months': months_ci,
            'recovery_probability': recovery_probability,
            'simulations': simulations,
            'confidence_level': confidence_level
        }

    def sensitivity_analysis(
            self,
            returns: pd.DataFrame,
            weights: Dict[str, float],
            parameters: Dict[str, List[float]],
            initial_value: float = 10000,
            years: int = 10,
            simulations: int = 1000
    ) -> Dict:
        """
        Perform sensitivity analysis on different parameters.

        Args:
            returns: DataFrame with asset returns
            weights: Dictionary with asset weights {ticker: weight}
            parameters: Dictionary with parameters to vary and their values.
                       Supported parameters: 'mean_return', 'volatility', 'correlation'
            initial_value: Initial portfolio value
            years: Number of years to simulate
            simulations: Number of Monte Carlo simulations per parameter value

        Returns:
            Dictionary with sensitivity analysis results containing:
                - base_annual_return: Base case annual return
                - base_annual_volatility: Base case annual volatility
                - sensitivity_results: Dictionary with results for each parameter
                - initial_value: Initial portfolio value
                - years: Number of years simulated
                - simulations: Number of Monte Carlo simulations per parameter value
        """

        if returns.empty or not weights or not parameters:
            return {'error': 'Missing required data for sensitivity analysis'}

        # Calculate base portfolio statistics
        tickers = list(weights.keys())
        filtered_returns = returns[tickers].copy()

        weights_array = np.array([weights.get(ticker, 0) for ticker in tickers])
        if sum(weights_array) > 0:
            weights_array = weights_array / sum(weights_array)

        means = filtered_returns.mean().values
        cov_matrix = filtered_returns.cov().values

        # Base values
        base_annual_return = np.dot(means * 252, weights_array)
        base_annual_vol = np.sqrt(np.dot(weights_array.T, np.dot(cov_matrix * 252, weights_array)))

        # Prepare results
        sensitivity_results = {}

        # Perform sensitivity analysis for each parameter
        for param_name, param_values in parameters.items():
            param_results = []

            for param_value in param_values:
                # Simulate with modified parameter
                result = None

                if param_name == 'mean_return':
                    # Adjust mean returns
                    adjusted_means = means * param_value
                    adjusted_annual_return = np.dot(adjusted_means * 252, weights_array)

                    # Run simulation with adjusted returns
                    result = self._simulate_with_params(
                        adjusted_means, cov_matrix, weights_array,
                        initial_value, years, simulations
                    )
                    result['annual_return'] = adjusted_annual_return
                    result['annual_volatility'] = base_annual_vol

                elif param_name == 'volatility':
                    # Adjust volatility
                    adjusted_cov = cov_matrix * (param_value ** 2)
                    adjusted_annual_vol = np.sqrt(np.dot(weights_array.T, np.dot(adjusted_cov * 252, weights_array)))

                    # Run simulation with adjusted volatility
                    result = self._simulate_with_params(
                        means, adjusted_cov, weights_array,
                        initial_value, years, simulations
                    )
                    result['annual_return'] = base_annual_return
                    result['annual_volatility'] = adjusted_annual_vol

                elif param_name == 'correlation':
                    # Adjust correlation (preserving volatilities)
                    std_devs = np.sqrt(np.diag(cov_matrix))
                    n_assets = len(std_devs)

                    # Create adjusted correlation matrix
                    adjusted_corr = np.ones((n_assets, n_assets)) * param_value
                    np.fill_diagonal(adjusted_corr, 1.0)

                    # Convert back to covariance matrix
                    adjusted_cov = np.outer(std_devs, std_devs) * adjusted_corr
                    adjusted_annual_vol = np.sqrt(np.dot(weights_array.T, np.dot(adjusted_cov * 252, weights_array)))

                    # Run simulation with adjusted correlation
                    result = self._simulate_with_params(
                        means, adjusted_cov, weights_array,
                        initial_value, years, simulations
                    )
                    result['annual_return'] = base_annual_return
                    result['annual_volatility'] = adjusted_annual_vol

                if result:
                    result['param_value'] = param_value
                    param_results.append(result)

            sensitivity_results[param_name] = param_results

        return {
            'base_annual_return': base_annual_return,
            'base_annual_volatility': base_annual_vol,
            'sensitivity_results': sensitivity_results,
            'initial_value': initial_value,
            'years': years,
            'simulations': simulations
        }

    def _simulate_with_params(
            self,
            means: np.ndarray,
            cov_matrix: np.ndarray,
            weights_array: np.ndarray,
            initial_value: float,
            years: int,
            simulations: int
    ) -> Dict:
        """
        Helper method to run a simulation with specific parameters.

        Args:
            means: Mean returns for each asset
            cov_matrix: Covariance matrix of returns
            weights_array: Array of asset weights
            initial_value: Initial portfolio value
            years: Number of years to simulate
            simulations: Number of Monte Carlo simulations

        Returns:
            Dictionary with simulation results
        """
        # Calculate number of trading days to simulate
        trading_days = years * 252

        # Set random seed for reproducibility
        np.random.seed(42)

        # Initialize array for simulation results
        simulation_results = np.zeros((simulations, trading_days + 1))
        simulation_results[:, 0] = initial_value

        # Run Monte Carlo simulation
        for sim in range(simulations):
            # Generate correlated random returns for all assets
            sim_returns = np.random.multivariate_normal(
                means * 252,  # Annualized mean
                cov_matrix * 252,  # Annualized covariance
                trading_days
            ) / 252  # Convert back to daily returns

            for day in range(trading_days):
                # Calculate portfolio return for this day
                portfolio_return = np.dot(sim_returns[day], weights_array)

                # Calculate new portfolio value
                simulation_results[sim, day + 1] = simulation_results[sim, day] * (1 + portfolio_return)

        # Calculate statistics from simulation results
        final_values = simulation_results[:, -1]
        percentiles = {
            'min': np.min(final_values),
            'max': np.max(final_values),
            'median': np.median(final_values),
            'mean': np.mean(final_values),
            'p10': np.percentile(final_values, 10),
            'p25': np.percentile(final_values, 25),
            'p75': np.percentile(final_values, 75),
            'p90': np.percentile(final_values, 90)
        }

        return {
            'percentiles': percentiles,
            'simulation_data': simulation_results
        }