import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('analytics_service')


class AnalyticsService:
    """Portfolio analysis service."""

    def calculate_returns(
        self,
        prices: pd.DataFrame,
        period: str = 'daily',
        method: str = 'simple'
    ) -> pd.DataFrame:
        """Calculate returns for the specified period.

        Args:
            prices: DataFrame with price data
            period: Period for returns calculation ('daily', 'weekly', 'monthly', 'annual')
            method: Method for calculation ('simple', 'log')

        Returns:
            DataFrame with returns data
        """
        if prices.empty:
            logger.warning("Empty price data provided")
            return pd.DataFrame()

        # Ensure the index is datetime
        if not isinstance(prices.index, pd.DatetimeIndex):
            try:
                prices.index = pd.to_datetime(prices.index)
            except Exception as e:
                logger.error(f"Failed to convert index to DatetimeIndex: {e}")
                return pd.DataFrame()

        # Extract close prices if a multi-column DataFrame is provided
        if isinstance(prices, pd.DataFrame) and 'Close' in prices.columns:
            prices_series = prices['Close']
        elif isinstance(prices, pd.DataFrame) and 'Adj Close' in prices.columns:
            prices_series = prices['Adj Close']
        else:
            prices_series = prices

        # Resample based on period
        if period == 'daily':
            # No resampling needed for daily
            resampled_prices = prices_series
        elif period == 'weekly':
            resampled_prices = prices_series.resample('W').last()
        elif period == 'monthly':
            resampled_prices = prices_series.resample('M').last()
        elif period == 'annual':
            resampled_prices = prices_series.resample('Y').last()
        else:
            logger.warning(f"Unsupported period: {period}, using 'daily' as default")
            resampled_prices = prices_series

        # Calculate returns
        if method == 'simple':
            returns = resampled_prices.pct_change().dropna()
        elif method == 'log':
            returns = np.log(resampled_prices / resampled_prices.shift(1)).dropna()
        else:
            logger.warning(f"Unsupported method: {method}, using 'simple' as default")
            returns = resampled_prices.pct_change().dropna()

        return returns

    def calculate_portfolio_return(
        self,
        returns: pd.DataFrame,
        weights: Dict[str, float]
    ) -> pd.Series:
        """Calculate weighted portfolio returns.

        Args:
            returns: DataFrame with returns for each asset
            weights: Dictionary with asset weights {ticker: weight}

        Returns:
            Series with portfolio returns
        """
        if returns.empty or not weights:
            logger.warning("Empty returns data or weights provided")
            return pd.Series()

        # Filter returns to include only assets in weights
        assets_in_weights = list(weights.keys())
        filtered_returns = returns[assets_in_weights].copy()

        # Handle missing data by filling with 0
        filtered_returns = filtered_returns.fillna(0)

        # Calculate portfolio returns
        portfolio_weights = np.array([weights.get(ticker, 0) for ticker in filtered_returns.columns])
        portfolio_returns = filtered_returns.dot(portfolio_weights)

        return portfolio_returns

    def calculate_cumulative_returns(
        self,
        returns: pd.Series,
        is_log_returns: bool = False
    ) -> pd.Series:
        """Calculate cumulative returns.

        Args:
            returns: Series with returns data
            is_log_returns: Whether the returns are log returns

        Returns:
            Series with cumulative returns
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return pd.Series()

        if is_log_returns:
            cumulative_returns = np.exp(returns.cumsum()) - 1
        else:
            cumulative_returns = (1 + returns).cumprod() - 1

        return cumulative_returns

    def calculate_annualized_return(
        self,
        returns: pd.Series,
        periods_per_year: int = 252,
        is_log_returns: bool = False
    ) -> float:
        """Calculate annualized return.

        Args:
            returns: Series with returns data
            periods_per_year: Number of periods in a year (252 for daily, 52 for weekly, 12 for monthly)
            is_log_returns: Whether the returns are log returns

        Returns:
            Annualized return as a float
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        if is_log_returns:
            total_return = np.exp(returns.sum()) - 1
        else:
            total_return = (1 + returns).prod() - 1

        years = len(returns) / periods_per_year

        if years <= 0:
            logger.warning("Insufficient data for annualization")
            return 0.0

        annualized_return = (1 + total_return) ** (1 / years) - 1
        return annualized_return

    def calculate_volatility(
        self,
        returns: pd.Series,
        periods_per_year: int = 252
    ) -> float:
        """Calculate annualized volatility.

        Args:
            returns: Series with returns data
            periods_per_year: Number of periods in a year

        Returns:
            Annualized volatility as a float
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        volatility = returns.std() * np.sqrt(periods_per_year)
        return volatility

    def calculate_sharpe_ratio(
        self,
        returns: pd.Series,
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252,
        is_log_returns: bool = False
    ) -> float:
        """Calculate Sharpe ratio.

        Args:
            returns: Series with returns data
            risk_free_rate: Annual risk-free rate (e.g., 0.02 for 2%)
            periods_per_year: Number of periods in a year
            is_log_returns: Whether the returns are log returns

        Returns:
            Sharpe ratio as a float
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Convert annual risk-free rate to period rate
        period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

        # For log returns, convert risk-free rate to log
        if is_log_returns:
            period_risk_free = np.log(1 + period_risk_free)

        excess_returns = returns - period_risk_free
        annualized_excess_return = excess_returns.mean() * periods_per_year
        annualized_volatility = returns.std() * np.sqrt(periods_per_year)

        if annualized_volatility < 1e-10:
            logger.warning("Near-zero volatility, Sharpe ratio undefined")
            return 0.0

        sharpe_ratio = annualized_excess_return / annualized_volatility
        return sharpe_ratio

    def calculate_sortino_ratio(
        self,
        returns: pd.Series,
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252,
        is_log_returns: bool = False
    ) -> float:
        """Calculate Sortino ratio.

        Args:
            returns: Series with returns data
            risk_free_rate: Annual risk-free rate
            periods_per_year: Number of periods in a year
            is_log_returns: Whether the returns are log returns

        Returns:
            Sortino ratio as a float
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Convert annual risk-free rate to period rate
        period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

        # For log returns, convert risk-free rate to log
        if is_log_returns:
            period_risk_free = np.log(1 + period_risk_free)

        excess_returns = returns - period_risk_free
        annualized_excess_return = excess_returns.mean() * periods_per_year

        # Calculate downside deviation (only negative returns)
        negative_returns = excess_returns[excess_returns < 0]

        if len(negative_returns) == 0 or abs(negative_returns.std()) < 1e-10:
            # If there is no negative return, return a large value (but not infinity)
            logger.warning("No negative excess returns, Sortino ratio undefined")
            return 100.0  # High value instead of infinity

        # Use the standard deviation of negative returns
        downside_deviation = np.sqrt(np.mean(negative_returns ** 2)) * np.sqrt(periods_per_year)

        if downside_deviation < 1e-10:  # Check for very small value
            logger.warning("Downside deviation too small, Sortino ratio undefined")
            return 100.0  # High value instead of dividing by small number

        sortino_ratio = annualized_excess_return / downside_deviation
        return sortino_ratio

    def calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown.

        Args:
            returns: Series with returns data

        Returns:
            Maximum drawdown as a float (positive value)
        """
        if returns.empty or len(returns) < 5:  # Require a minimum of 5 data points
            logger.warning("Insufficient returns data provided")
            return 0.0

        try:
            cumulative_returns = (1 + returns).cumprod()
            peak_values = cumulative_returns.cummax()
            drawdowns = (cumulative_returns / peak_values) - 1
            max_drawdown = drawdowns.min()

            # Check for outliers (too big drops)
            if max_drawdown < -0.99:  # Drawdown over 99% is suspicious
                logger.warning(f"Extreme drawdown detected: {max_drawdown:.2%}")
                # Winsorization or other outlier treatment can be applied

            # Return positive value for easier interpretation
            return abs(max_drawdown)
        except Exception as e:
            logger.error(f"Error in calculating maximum drawdown: {e}")
            return 0.0

    def calculate_calmar_ratio(
        self,
        returns: pd.Series,
        periods_per_year: int = 252
    ) -> float:
        """Calculate Calmar ratio (annualized return / maximum drawdown).

        Args:
            returns: Series with returns data
            periods_per_year: Number of periods in a year

        Returns:
            Calmar ratio as a float
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        annualized_return = self.calculate_annualized_return(returns, periods_per_year)
        max_drawdown = self.calculate_max_drawdown(returns)

        if max_drawdown == 0:
            logger.warning("Zero maximum drawdown, Calmar ratio undefined")
            return 0.0

        calmar_ratio = annualized_return / max_drawdown
        return calmar_ratio

    def calculate_beta(
        self,
        returns: pd.Series,
        benchmark_returns: pd.Series
    ) -> float:
        """Calculate beta (systematic risk) relative to a benchmark.

        Args:
            returns: Series with portfolio returns
            benchmark_returns: Series with benchmark returns

        Returns:
            Beta as a float
        """
        if returns.empty or benchmark_returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Align the series
        common_index = returns.index.intersection(benchmark_returns.index)
        if len(common_index) == 0:
            logger.warning("No common dates between returns and benchmark")
            return 0.0

        returns = returns.loc[common_index]
        benchmark_returns = benchmark_returns.loc[common_index]

        # Calculate beta using covariance and variance
        covariance = returns.cov(benchmark_returns)
        benchmark_variance = benchmark_returns.var()

        if benchmark_variance == 0:
            logger.warning("Zero benchmark variance, beta undefined")
            return 0.0

        beta = covariance / benchmark_variance
        return beta

    def calculate_alpha(
        self,
        returns: pd.Series,
        benchmark_returns: pd.Series,
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
    ) -> float:
        """Calculate Jensen's alpha.

        Args:
            returns: Series with portfolio returns
            benchmark_returns: Series with benchmark returns
            risk_free_rate: Annual risk-free rate
            periods_per_year: Number of periods in a year

        Returns:
            Alpha as a float
        """
        if returns.empty or benchmark_returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Convert annual risk-free rate to period rate
        period_risk_free = (1 + risk_free_rate) ** (1 / periods_per_year) - 1

        # Align the series
        common_index = returns.index.intersection(benchmark_returns.index)
        if len(common_index) == 0:
            logger.warning("No common dates between returns and benchmark")
            return 0.0

        returns = returns.loc[common_index]
        benchmark_returns = benchmark_returns.loc[common_index]

        # Calculate beta
        beta = self.calculate_beta(returns, benchmark_returns)

        # Calculate alpha (annualized)
        alpha = (returns.mean() - period_risk_free - beta * (
                benchmark_returns.mean() - period_risk_free)) * periods_per_year
        return alpha

    def calculate_var(
        self,
        returns: pd.Series,
        confidence_level: float = 0.95
    ) -> float:
        """Calculate Value at Risk (VaR) using historical method.

        Args:
            returns: Series with returns data
            confidence_level: Confidence level (e.g., 0.95 for 95%)

        Returns:
            VaR as a positive float (loss)
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # VaR is a percentile of the returns distribution
        var = -np.percentile(returns, 100 * (1 - confidence_level))
        return max(0, var)  # Return positive value (loss)

    def calculate_cvar(
        self,
        returns: pd.Series,
        confidence_level: float = 0.95
    ) -> float:
        """Calculate Conditional Value at Risk (CVaR) / Expected Shortfall.

        Args:
            returns: Series with returns data
            confidence_level: Confidence level (e.g., 0.95 for 95%)

        Returns:
            CVaR as a positive float (expected loss)
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Calculate VaR
        var = self.calculate_var(returns, confidence_level)

        # CVaR is the average of returns that are worse than VaR
        cvar = -returns[returns <= -var].mean() if var > 0 else 0

        if np.isnan(cvar):
            logger.warning("CVaR calculation resulted in NaN")
            return 0.0

        return cvar

    def calculate_portfolio_metrics(
        self,
        returns: pd.Series,
        benchmark_returns: pd.Series = None,
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
    ) -> Dict[str, float]:
        """Calculate comprehensive portfolio metrics.

        Args:
            returns: Portfolio return series
            benchmark_returns: Benchmark return series (optional)
            risk_free_rate: Annual risk-free rate
            periods_per_year: Number of periods per year

        Returns:
            Dictionary of performance metrics
        """
        metrics = {}

        if returns.empty:
            logger.warning("Empty returns data provided")
            return metrics

        # Basic Profitability Metrics
        metrics['total_return'] = (1 + returns).prod() - 1
        metrics['annualized_return'] = self.calculate_annualized_return(returns, periods_per_year)
        metrics['volatility'] = self.calculate_volatility(returns, periods_per_year)

        # Risk metrics
        metrics['sharpe_ratio'] = self.calculate_sharpe_ratio(returns, risk_free_rate, periods_per_year)
        metrics['sortino_ratio'] = self.calculate_sortino_ratio(returns, risk_free_rate, periods_per_year)
        metrics['max_drawdown'] = self.calculate_max_drawdown(returns)
        metrics['calmar_ratio'] = self.calculate_calmar_ratio(returns, periods_per_year)

        # alpha, beta, information ratio
        metrics['alpha'] = 0.0
        metrics['beta'] = 1.0
        metrics['information_ratio'] = 0.0

        if benchmark_returns is not None and not benchmark_returns.empty:
            common_index = returns.index.intersection(benchmark_returns.index)
            if len(common_index) > 0:
                # Align series by common index
                aligned_returns = returns.loc[common_index]
                aligned_benchmark = benchmark_returns.loc[common_index]

                metrics['beta'] = self.calculate_beta(aligned_returns, aligned_benchmark)
                metrics['alpha'] = self.calculate_alpha(aligned_returns, aligned_benchmark, risk_free_rate, periods_per_year)
                metrics['information_ratio'] = self.calculate_information_ratio(aligned_returns, aligned_benchmark, periods_per_year)

        # Additional risk metrics
        metrics['var_95'] = self.calculate_var(returns, 0.95)
        metrics['cvar_95'] = self.calculate_cvar(returns, 0.95)
        metrics['var_99'] = self.calculate_var(returns, 0.99)
        metrics['cvar_99'] = self.calculate_cvar(returns, 0.99)

        # Distribution statistics
        metrics['skewness'] = returns.skew() if len(returns) > 2 else 0
        metrics['kurtosis'] = returns.kurtosis() if len(returns) > 3 else 0

        # Performance Metrics
        win_metrics = self.calculate_win_metrics(returns)
        metrics.update(win_metrics)

        # Metrics for different time periods
        if isinstance(returns.index, pd.DatetimeIndex):
            period_performance = self.calculate_period_performance(returns)

            # Add with a prefix to separate from other metrics
            for period, value in period_performance.items():
                metrics[f'period_{period}'] = value

        # Metrics relative to the benchmark
        if benchmark_returns is not None and not benchmark_returns.empty:
            common_index = returns.index.intersection(benchmark_returns.index)

            if len(common_index) > 0:
                # Align series by common index
                aligned_returns = returns.loc[common_index]
                aligned_benchmark = benchmark_returns.loc[common_index]

                # Basic benchmark metrics
                metrics['benchmark_return'] = (1 + aligned_benchmark).prod() - 1
                metrics['benchmark_annualized_return'] = self.calculate_annualized_return(
                    aligned_benchmark, periods_per_year)
                metrics['benchmark_volatility'] = self.calculate_volatility(
                    aligned_benchmark, periods_per_year)
                metrics['benchmark_max_drawdown'] = self.calculate_max_drawdown(aligned_benchmark)

                # Benchmark coefficients
                metrics['benchmark_sharpe_ratio'] = self.calculate_sharpe_ratio(
                    aligned_benchmark, risk_free_rate, periods_per_year)
                metrics['benchmark_sortino_ratio'] = self.calculate_sortino_ratio(
                    aligned_benchmark, risk_free_rate, periods_per_year)
                metrics['benchmark_calmar_ratio'] = self.calculate_calmar_ratio(
                    aligned_benchmark, periods_per_year)

                # Adding performance metrics to the benchmark
                benchmark_win_metrics = self.calculate_win_metrics(aligned_benchmark)
                metrics.update({f'benchmark_{k}': v for k, v in benchmark_win_metrics.items()})

                # Additional benchmark risk metrics
                metrics['benchmark_var_95'] = self.calculate_var(aligned_benchmark, 0.95)
                metrics['benchmark_cvar_95'] = self.calculate_cvar(aligned_benchmark, 0.95)

                # Capture Ratios
                capture_ratios = self.calculate_capture_ratios(aligned_returns, aligned_benchmark)
                metrics.update(capture_ratios)

        return metrics

    def calculate_information_ratio(
        self,
        returns: pd.Series,
        benchmark_returns: pd.Series,
        periods_per_year: int = 252
    ) -> float:
        """Calculate Information Ratio - a risk-adjusted return indicator relative to the benchmark.

        Args:
            returns: Portfolio return series
            benchmark_returns: Benchmark return series
            periods_per_year: Number of periods per year

        Returns:
            Information ratio as a float
        """
        if returns.empty or benchmark_returns.empty:
            logger.warning("Empty returns data provided")
            return 0.0

        # Align series
        common_index = returns.index.intersection(benchmark_returns.index)
        returns = returns.loc[common_index]
        benchmark_returns = benchmark_returns.loc[common_index]

        # Calculate excess return
        excess_returns = returns - benchmark_returns

        # Calculate Information Ratio
        tracking_error = excess_returns.std() * np.sqrt(periods_per_year)
        if tracking_error == 0:
            logger.warning("Zero tracking error, Information Ratio undefined")
            return 0.0

        mean_excess = excess_returns.mean() * periods_per_year
        return mean_excess / tracking_error

    def calculate_capture_ratios(
        self,
        returns: pd.Series,
        benchmark_returns: pd.Series
    ) -> Dict[str, float]:
        """Calculate Up/Down Capture Ratios - how much a portfolio captures the benchmark's
        upward/downward movements.

        Args:
            returns: Portfolio return series
            benchmark_returns: Benchmark return series

        Returns:
            Dictionary with capture ratios
        """
        if returns.empty or benchmark_returns.empty:
            logger.warning("Empty returns data provided")
            return {
                'up_capture': 0.0,
                'down_capture': 0.0,
                'up_ratio': 0.0,
                'down_ratio': 0.0
            }

        # Align series
        common_index = returns.index.intersection(benchmark_returns.index)
        returns = returns.loc[common_index]
        benchmark_returns = benchmark_returns.loc[common_index]

        # Split into up and down periods
        up_periods = benchmark_returns > 0
        down_periods = benchmark_returns < 0

        # Calculate Up/Down Capture
        up_capture = returns[up_periods].mean() / benchmark_returns[up_periods].mean() if up_periods.sum() > 0 else 0.0
        down_capture = returns[down_periods].mean() / benchmark_returns[down_periods].mean() if down_periods.sum() > 0 else 0.0

        # Calculate Up/Down Ratio
        up_ratio = (1 + returns[up_periods]).prod() / (
                1 + benchmark_returns[up_periods]).prod() if up_periods.sum() > 0 else 1.0
        down_ratio = (1 + returns[down_periods]).prod() / (
                1 + benchmark_returns[down_periods]).prod() if down_periods.sum() > 0 else 1.0

        return {
            'up_capture': up_capture,
            'down_capture': down_capture,
            'up_ratio': up_ratio,
            'down_ratio': down_ratio
        }

    def calculate_win_metrics(
        self,
        returns: pd.Series
    ) -> Dict[str, float]:
        """Calculate performance metrics: Win Rate, Payoff Ratio, etc.

        Args:
            returns: Series with returns data

        Returns:
            Dictionary with performance metrics
        """
        if returns.empty or len(returns) < 2:
            logger.warning("Insufficient returns data provided")
            return {
                'win_rate': 0.0,
                'payoff_ratio': 0.0,
                'profit_factor': 0.0
            }

        # Count positive and negative trading days
        wins = returns[returns > 0]
        losses = returns[returns < 0]

        # Win Rate
        total_trades = len(wins) + len(losses)
        win_rate = len(wins) / total_trades if total_trades > 0 else 0.0

        # Payoff Ratio (average win / average loss)
        avg_win = wins.mean() if len(wins) > 0 else 0.0
        avg_loss = abs(losses.mean()) if len(losses) > 0 else 0.0
        payoff_ratio = avg_win / avg_loss if avg_loss > 0 else 0.0

        # Profit Factor (sum of wins / sum of losses)
        total_wins = wins.sum()
        total_losses = abs(losses.sum())
        profit_factor = total_wins / total_losses if total_losses > 0 else 0.0

        return {
            'win_rate': win_rate,
            'payoff_ratio': payoff_ratio,
            'profit_factor': profit_factor
        }

    def calculate_period_performance(
        self,
        returns: pd.Series,
        periods: Dict[str, Tuple[str, str]] = None
    ) -> Dict[str, float]:
        """Calculate returns for different periods (MTD, YTD, 3Y, 5Y, etc.).

        Args:
            returns: Returns Series
            periods: Dictionary of periods in the format {'period_name': (start_date, end_date)}
                    If None, standard periods will be calculated.

        Returns:
            Dictionary with returns for the specified periods
        """
        if returns.empty:
            logger.warning("Empty returns data provided")
            return {}

        # Check that the index is a DatetimeIndex
        if not isinstance(returns.index, pd.DatetimeIndex):
            logger.warning("Returns index is not DatetimeIndex")
            return {}

        # Normalize the index to eliminate time zone issues
        returns_index = returns.index.tz_localize(None) if returns.index.tz else returns.index
        returns = returns.copy()
        returns.index = returns_index

        result = {}
        today = returns_index.max()

        # Calculate standard periods if custom ones are not specified
        if periods is None:
            # Month to Date
            month_start = pd.Timestamp(today.year, today.month, 1)
            month_start_idx = returns_index[returns_index >= month_start]
            if len(month_start_idx) > 0:
                nearest_date = month_start_idx[0]
                result['MTD'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # Year to Date
            year_start = pd.Timestamp(today.year, 1, 1)
            year_start_idx = returns_index[returns_index >= year_start]
            if len(year_start_idx) > 0:
                nearest_date = year_start_idx[0]
                result['YTD'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # 1 Month
            one_month_ago = today - pd.DateOffset(months=1)
            one_month_idx = returns_index[returns_index >= one_month_ago]
            if len(one_month_idx) > 0:
                nearest_date = one_month_idx[0]
                result['1M'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # 3 Months
            three_months_ago = today - pd.DateOffset(months=3)
            three_month_idx = returns_index[returns_index >= three_months_ago]
            if len(three_month_idx) > 0:
                nearest_date = three_month_idx[0]
                result['3M'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # 6 Months
            six_months_ago = today - pd.DateOffset(months=6)
            six_month_idx = returns_index[returns_index >= six_months_ago]
            if len(six_month_idx) > 0:
                nearest_date = six_month_idx[0]
                result['6M'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # 1 Year
            one_year_ago = today - pd.DateOffset(years=1)
            one_year_idx = returns_index[returns_index >= one_year_ago]
            if len(one_year_idx) > 0:
                nearest_date = one_year_idx[0]
                result['1Y'] = (1 + returns[returns.index >= nearest_date]).prod() - 1

            # 3 Years
            three_years_ago = today - pd.DateOffset(years=3)
            three_year_idx = returns_index[returns_index >= three_years_ago]
            if len(three_year_idx) > 0:
                nearest_date = three_year_idx[0]
                period_returns = returns[returns.index >= nearest_date]
                if len(period_returns) > 0:
                    period_total_return = (1 + period_returns).prod() - 1
                    # If there is enough data for annual calculation
                    if (today - nearest_date).days > 365:
                        years_fraction = (today - nearest_date).days / 365
                        result['3Y'] = (1 + period_total_return) ** (1 / years_fraction) - 1
                    else:
                        result['3Y'] = period_total_return

            # 5 Years
            five_years_ago = today - pd.DateOffset(years=5)
            five_year_idx = returns_index[returns_index >= five_years_ago]
            if len(five_year_idx) > 0:
                nearest_date = five_year_idx[0]
                period_returns = returns[returns.index >= nearest_date]
                if len(period_returns) > 0:
                    period_total_return = (1 + period_returns).prod() - 1
                    # If there is enough data for annual calculation
                    if (today - nearest_date).days > 365:
                        years_fraction = (today - nearest_date).days / 365
                        result['5Y'] = (1 + period_total_return) ** (1 / years_fraction) - 1
                    else:
                        result['5Y'] = period_total_return
        else:
            # Using custom periods
            for period_name, (start_date, end_date) in periods.items():
                start_timestamp = pd.Timestamp(start_date).tz_localize(None)
                end_timestamp = pd.Timestamp(end_date).tz_localize(None)
                period_returns = returns[(returns.index >= start_timestamp) & (returns.index <= end_timestamp)]
                if not period_returns.empty:
                    result[period_name] = (1 + period_returns).prod() - 1

        return result