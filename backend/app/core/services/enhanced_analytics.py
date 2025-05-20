# backend/app/core/services/enhanced_analytics.py
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Union, Any
import logging
from scipy import stats

# Setup logging
logger = logging.getLogger(__name__)


class EnhancedAnalyticsService:
    """Enhanced portfolio analytics service with advanced metrics and analysis."""

    def calculate_omega_ratio(
            self,
            returns: pd.Series,
            risk_free_rate: float = 0.0,
            target_return: float = 0.0,
            periods_per_year: int = 252
    ) -> float:
        """
        Calculate Omega ratio - a risk-return performance measure that considers the probability distribution
        of returns above and below a threshold.

        Args:
            returns: Series with portfolio returns
            risk_free_rate: Risk-free rate (annual)
            target_return: Target return threshold (annual)
            periods_per_year: Number of periods per year

        Returns:
            Omega ratio as a float
        """
        if returns.empty:
            return 0.0

        # Convert annual target return to period return
        period_target = (1 + target_return) ** (1 / periods_per_year) - 1

        # Calculate excess returns over target
        excess_returns = returns - period_target

        # Separate positive and negative excess returns
        positive_excess = excess_returns[excess_returns > 0]
        negative_excess = excess_returns[excess_returns < 0]

        # If no positive or negative excess returns, return default values
        if len(positive_excess) == 0:
            return 0.0
        if len(negative_excess) == 0:
            return 100.0  # Large value instead of infinity

        # Calculate the ratio of positive to negative excess returns
        omega = positive_excess.sum() / abs(negative_excess.sum())

        return omega

    def calculate_ulcer_index(self, returns: pd.Series, window: int = None) -> float:
        """
        Calculate the Ulcer Index, which measures the depth and duration of drawdowns.

        Args:
            returns: Series with portfolio returns
            window: Rolling window size (if None, calculates over entire history)

        Returns:
            Ulcer Index as a float
        """
        if returns.empty:
            return 0.0

        # Calculate cumulative returns
        cumulative_returns = (1 + returns).cumprod()

        # Calculate running maximum (peak values)
        if window is not None:
            peak_values = cumulative_returns.rolling(window=window, min_periods=1).max()
        else:
            peak_values = cumulative_returns.cummax()

        # Calculate percentage drawdowns
        drawdowns = (cumulative_returns / peak_values) - 1

        # Square the drawdowns and take the mean
        squared_drawdowns = drawdowns ** 2
        ulcer_index = np.sqrt(squared_drawdowns.mean())

        return ulcer_index

    def calculate_gain_pain_ratio(self, returns: pd.Series) -> float:
        """
        Calculate the Gain to Pain ratio, which is the sum of positive returns
        divided by the absolute sum of negative returns.

        Args:
            returns: Series with portfolio returns

        Returns:
            Gain to Pain ratio as a float
        """
        if returns.empty:
            return 0.0

        positive_returns = returns[returns > 0]
        negative_returns = returns[returns < 0]

        if len(negative_returns) == 0 or abs(negative_returns.sum()) < 1e-10:
            return 100.0  # High value instead of infinity

        gain_pain_ratio = positive_returns.sum() / abs(negative_returns.sum())

        return gain_pain_ratio

    def calculate_tail_risk(
            self,
            returns: pd.Series,
            confidence_level: float = 0.95,
            method: str = 'historical'
    ) -> Dict[str, float]:
        """
        Calculate tail risk metrics, including Expected Shortfall, Skewness, and Kurtosis.

        Args:
            returns: Series with portfolio returns
            confidence_level: Confidence level for Expected Shortfall
            method: Method for calculation ('historical', 'gaussian')

        Returns:
            Dictionary with tail risk metrics
        """
        if returns.empty or len(returns) < 4:  # Need at least 4 observations for kurtosis
            return {
                'expected_shortfall': 0.0,
                'skewness': 0.0,
                'kurtosis': 0.0,
                'tail_ratio': 0.0
            }

        # Calculate Expected Shortfall (Conditional VaR)
        percentile = np.percentile(returns, 100 * (1 - confidence_level))
        expected_shortfall = -returns[returns <= percentile].mean()

        if np.isnan(expected_shortfall):
            expected_shortfall = 0.0

        # Calculate skewness and kurtosis
        skewness = returns.skew()
        kurtosis = returns.kurtosis()

        # Calculate tail ratio (ratio of right tail to left tail)
        left_tail = np.percentile(returns, 5)
        right_tail = np.percentile(returns, 95)

        if abs(left_tail) < 1e-10:
            tail_ratio = 100.0  # High value instead of division by near-zero
        else:
            tail_ratio = abs(right_tail / left_tail)

        return {
            'expected_shortfall': float(expected_shortfall),
            'skewness': float(skewness),
            'kurtosis': float(kurtosis),
            'tail_ratio': float(tail_ratio)
        }

    def calculate_sharpe_stability(
            self,
            returns: pd.Series,
            risk_free_rate: float = 0.0,
            window: int = 252,
            min_periods: int = 30
    ) -> float:
        """
        Calculate Sharpe Ratio stability by measuring the standard deviation
        of rolling Sharpe Ratios.

        Args:
            returns: Series with portfolio returns
            risk_free_rate: Risk-free rate (annual)
            window: Rolling window size
            min_periods: Minimum periods for calculation

        Returns:
            Stability measure as a float (lower is more stable)
        """
        if returns.empty or len(returns) < min_periods:
            return 0.0

        # Convert annual risk-free rate to period rate
        period_risk_free = (1 + risk_free_rate) ** (1 / 252) - 1

        # Calculate excess returns
        excess_returns = returns - period_risk_free

        # Calculate rolling Sharpe ratio (annualized)
        def rolling_sharpe(x):
            if len(x) < min_periods:
                return np.nan
            return (x.mean() * 252) / (x.std() * np.sqrt(252))

        rolling_sharpe_values = excess_returns.rolling(window=window, min_periods=min_periods).apply(rolling_sharpe)

        # Calculate stability as the standard deviation of rolling Sharpe ratios
        stability = rolling_sharpe_values.std()

        return stability

    def calculate_confidence_intervals(
            self,
            returns: pd.Series,
            confidence_level: float = 0.95
    ) -> Dict[str, float]:
        """
        Calculate confidence intervals for returns and key metrics.

        Args:
            returns: Series with portfolio returns
            confidence_level: Confidence level (e.g., 0.95 for 95%)

        Returns:
            Dictionary with confidence intervals
        """
        if returns.empty:
            return {
                'mean_lower': 0.0,
                'mean_upper': 0.0,
                'volatility_lower': 0.0,
                'volatility_upper': 0.0
            }

        # Sample size
        n = len(returns)

        # Mean and standard deviation
        mean_return = returns.mean()
        std_dev = returns.std()

        # Standard error of the mean
        sem = std_dev / np.sqrt(n)

        # Critical value for the confidence level
        alpha = 1 - confidence_level
        t_critical = stats.t.ppf(1 - alpha / 2, n - 1)

        # Confidence interval for the mean
        mean_lower = mean_return - t_critical * sem
        mean_upper = mean_return + t_critical * sem

        # Confidence interval for volatility
        chi2_lower = stats.chi2.ppf(alpha / 2, n - 1)
        chi2_upper = stats.chi2.ppf(1 - alpha / 2, n - 1)

        vol_lower = std_dev * np.sqrt((n - 1) / chi2_upper)
        vol_upper = std_dev * np.sqrt((n - 1) / chi2_lower)

        return {
            'mean_lower': float(mean_lower),
            'mean_upper': float(mean_upper),
            'volatility_lower': float(vol_lower),
            'volatility_upper': float(vol_upper)
        }

    def calculate_rolling_statistics(
            self,
            returns: pd.Series,
            window: int = 21,
            metrics: List[str] = None
    ) -> Dict[str, pd.Series]:
        """
        Calculate rolling statistics for various metrics.

        Args:
            returns: Series with portfolio returns
            window: Rolling window size
            metrics: List of metrics to calculate (default: all available)

        Returns:
            Dictionary with metric name as key and rolling metric time series as value
        """
        if returns.empty:
            return {}

        # Default metrics if none specified
        if metrics is None:
            metrics = ['return', 'volatility', 'sharpe', 'sortino', 'drawdown', 'win_rate']

        # Convert to list if single string is passed
        if isinstance(metrics, str):
            metrics = [metrics]

        results = {}

        # Calculate rolling metrics
        if 'return' in metrics:
            # Rolling return (annualized)
            rolling_return = returns.rolling(window=window, min_periods=window // 2).mean() * 252
            results['return'] = rolling_return

        if 'volatility' in metrics:
            # Rolling volatility (annualized)
            rolling_vol = returns.rolling(window=window, min_periods=window // 2).std() * np.sqrt(252)
            results['volatility'] = rolling_vol

        if 'sharpe' in metrics:
            # Rolling Sharpe ratio (annualized)
            def rolling_sharpe(x):
                return (x.mean() * 252) / (x.std() * np.sqrt(252)) if x.std() > 0 else 0

            rolling_sharpe_ratio = returns.rolling(window=window, min_periods=window // 2).apply(rolling_sharpe)
            results['sharpe'] = rolling_sharpe_ratio

        if 'sortino' in metrics:
            # Rolling Sortino ratio (annualized)
            def rolling_sortino(x):
                negative_returns = x[x < 0]
                downside_deviation = np.sqrt(np.mean(negative_returns ** 2)) if len(negative_returns) > 0 else 0
                return (x.mean() * 252) / (downside_deviation * np.sqrt(252)) if downside_deviation > 0 else 0

            rolling_sortino_ratio = returns.rolling(window=window, min_periods=window // 2).apply(rolling_sortino)
            results['sortino'] = rolling_sortino_ratio

        if 'drawdown' in metrics:
            # Rolling maximum drawdown
            def rolling_max_drawdown(x):
                cumulative_returns = (1 + x).cumprod()
                peak_values = cumulative_returns.cummax()
                drawdowns = (cumulative_returns / peak_values) - 1
                return abs(drawdowns.min()) if len(drawdowns) > 0 else 0

            rolling_drawdown = returns.rolling(window=window, min_periods=window // 2).apply(rolling_max_drawdown)
            results['drawdown'] = rolling_drawdown

        if 'win_rate' in metrics:
            # Rolling win rate
            def rolling_win_rate(x):
                return len(x[x > 0]) / len(x) if len(x) > 0 else 0

            rolling_win = returns.rolling(window=window, min_periods=window // 2).apply(rolling_win_rate)
            results['win_rate'] = rolling_win

        return results

    def calculate_seasonal_patterns(
            self,
            returns: pd.Series
    ) -> Dict[str, pd.DataFrame]:
        """
        Calculate seasonal patterns in returns data.

        Args:
            returns: Series with portfolio returns

        Returns:
            Dictionary with seasonal analysis results
        """
        if returns.empty or not isinstance(returns.index, pd.DatetimeIndex):
            return {}

        results = {}

        # Monthly returns
        monthly_returns = returns.groupby(returns.index.month).mean() * 21
        results['monthly'] = pd.DataFrame({
            'month': range(1, 13),
            'return': monthly_returns.reindex(range(1, 13), fill_value=0)
        })

        # Day of week returns
        day_returns = returns.groupby(returns.index.dayofweek).mean() * 5
        results['day_of_week'] = pd.DataFrame({
            'day': range(0, 5),
            'return': day_returns.reindex(range(0, 5), fill_value=0)
        })

        # Quarterly returns
        quarterly_returns = returns.groupby(returns.index.quarter).mean() * 63
        results['quarterly'] = pd.DataFrame({
            'quarter': range(1, 5),
            'return': quarterly_returns.reindex(range(1, 5), fill_value=0)
        })

        # Yearly pattern (monthly returns by year)
        yearly_pattern = returns.groupby([returns.index.year, returns.index.month]).mean()
        yearly_pattern = yearly_pattern.unstack(level=1) * 21
        results['yearly_pattern'] = yearly_pattern

        return results

    def analyze_drawdown_statistics(self, returns: pd.Series) -> Dict[str, Any]:
        """
        Perform detailed analysis of drawdown periods.

        Args:
            returns: Series with portfolio returns

        Returns:
            Dictionary with drawdown statistics
        """
        if returns.empty:
            return {
                'max_drawdown': 0.0,
                'avg_drawdown': 0.0,
                'drawdown_count': 0,
                'avg_recovery_time': 0,
                'longest_recovery': 0,
                'drawdown_details': []
            }

        # Calculate cumulative returns
        cum_returns = (1 + returns).cumprod()

        # Calculate running maximum (peak values)
        peak_values = cum_returns.cummax()

        # Calculate drawdowns
        drawdowns = (cum_returns / peak_values) - 1

        # Identify drawdown periods
        is_drawdown = drawdowns < 0

        # If no drawdowns detected
        if not is_drawdown.any():
            return {
                'max_drawdown': 0.0,
                'avg_drawdown': 0.0,
                'drawdown_count': 0,
                'avg_recovery_time': 0,
                'longest_recovery': 0,
                'drawdown_details': []
            }

        # Analyze drawdown periods
        drawdown_periods = []
        in_drawdown = False
        start_date = None
        valley_date = None
        valley_value = 0

        for date, value in drawdowns.items():
            if value < 0 and not in_drawdown:
                in_drawdown = True
                start_date = date
                valley_date = date
                valley_value = value
            elif value < 0 and in_drawdown:
                if value < valley_value:
                    valley_date = date
                    valley_value = value
            elif value >= 0 and in_drawdown:
                # End of drawdown period
                drawdown_periods.append({
                    'start_date': start_date,
                    'valley_date': valley_date,
                    'recovery_date': date,
                    'depth': valley_value,
                    'length_days': (date - start_date).days,
                    'recovery_days': (date - valley_date).days
                })
                in_drawdown = False

        # Handle case where we're still in a drawdown at the end of the data
        if in_drawdown:
            drawdown_periods.append({
                'start_date': start_date,
                'valley_date': valley_date,
                'recovery_date': None,
                'depth': valley_value,
                'length_days': (returns.index[-1] - start_date).days,
                'recovery_days': None
            })

        # Calculate aggregate statistics
        max_drawdown = min(drawdowns)
        avg_drawdown = np.mean([period['depth'] for period in drawdown_periods])
        drawdown_count = len(drawdown_periods)

        # Recovery time statistics (excluding ongoing drawdowns)
        recovery_times = [period['recovery_days'] for period in drawdown_periods if period['recovery_days'] is not None]
        avg_recovery_time = np.mean(recovery_times) if recovery_times else 0
        longest_recovery = max(recovery_times) if recovery_times else 0

        return {
            'max_drawdown': float(max_drawdown),
            'avg_drawdown': float(avg_drawdown),
            'drawdown_count': drawdown_count,
            'avg_recovery_time': float(avg_recovery_time),
            'longest_recovery': float(longest_recovery),
            'drawdown_details': drawdown_periods
        }