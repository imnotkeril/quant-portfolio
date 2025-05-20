# backend/app/core/services/time_series.py
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union, Any
import logging

# Setup logging
logger = logging.getLogger(__name__)


class TimeSeriesService:
    """Time series data processing and analysis service."""

    def detect_outliers(
            self,
            series: pd.Series,
            method: str = 'zscore',
            threshold: float = 3.0
    ) -> pd.Series:
        """
        Detect outliers in time series data.

        Args:
            series: Series with time series data
            method: Method for outlier detection ('zscore', 'mad', 'iqr')
            threshold: Threshold for outlier detection

        Returns:
            Series with boolean values (True for outliers)
        """
        if series.empty:
            return pd.Series(dtype=bool)

        outliers = pd.Series(False, index=series.index)

        if method == 'zscore':
            # Z-score method
            mean = series.mean()
            std = series.std()

            if std == 0:
                return outliers

            z_scores = (series - mean) / std
            outliers = abs(z_scores) > threshold

        elif method == 'mad':
            # Median Absolute Deviation method
            median = series.median()
            mad = (series - median).abs().median()

            if mad == 0:
                return outliers

            mad_scores = (series - median).abs() / mad
            outliers = mad_scores > threshold

        elif method == 'iqr':
            # Interquartile Range method
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1

            if iqr == 0:
                return outliers

            lower_bound = q1 - threshold * iqr
            upper_bound = q3 + threshold * iqr

            outliers = (series < lower_bound) | (series > upper_bound)

        else:
            raise ValueError(f"Unknown outlier detection method: {method}")

        return outliers

    def handle_outliers(
            self,
            series: pd.Series,
            method: str = 'zscore',
            threshold: float = 3.0,
            handling: str = 'winsorize'
    ) -> pd.Series:
        """
        Handle outliers in time series data.

        Args:
            series: Series with time series data
            method: Method for outlier detection ('zscore', 'mad', 'iqr')
            threshold: Threshold for outlier detection
            handling: Method for handling outliers ('winsorize', 'trim', 'mean', 'median', 'interpolate')

        Returns:
            Series with outliers handled
        """
        if series.empty:
            return series.copy()

        # Detect outliers
        outliers = self.detect_outliers(series, method, threshold)

        # Create a copy of the series
        result = series.copy()

        if not outliers.any():
            return result

        if handling == 'winsorize':
            # Winsorize outliers (replace with closest non-outlier value)
            if method == 'zscore':
                mean = series.mean()
                std = series.std()
                upper_bound = mean + threshold * std
                lower_bound = mean - threshold * std
            elif method == 'mad':
                median = series.median()
                mad = (series - median).abs().median()
                upper_bound = median + threshold * mad
                lower_bound = median - threshold * mad
            elif method == 'iqr':
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                upper_bound = q3 + threshold * iqr
                lower_bound = q1 - threshold * iqr
            else:
                raise ValueError(f"Unknown outlier detection method: {method}")

            result[result > upper_bound] = upper_bound
            result[result < lower_bound] = lower_bound

        elif handling == 'trim':
            # Trim outliers (set to NaN and handle later)
            result[outliers] = np.nan

        elif handling == 'mean':
            # Replace outliers with mean
            result[outliers] = series[~outliers].mean()

        elif handling == 'median':
            # Replace outliers with median
            result[outliers] = series[~outliers].median()

        elif handling == 'interpolate':
            # Replace outliers with interpolated values
            result[outliers] = np.nan
            result = result.interpolate(method='linear')

            # Handle edge cases
            if np.isnan(result.iloc[0]):
                # Use next valid value for start
                result.iloc[0] = result.dropna().iloc[0]

            if np.isnan(result.iloc[-1]):
                # Use previous valid value for end
                result.iloc[-1] = result.dropna().iloc[-1]

        else:
            raise ValueError(f"Unknown outlier handling method: {handling}")

        return result

    def interpolate_missing(
            self,
            series: pd.Series,
            method: str = 'linear'
    ) -> pd.Series:
        """
        Interpolate missing values in time series data.

        Args:
            series: Series with time series data
            method: Method for interpolation ('linear', 'spline', 'polynomial', 'time')

        Returns:
            Series with missing values interpolated
        """
        if series.empty:
            return series.copy()

        # Create a copy of the series
        result = series.copy()

        # Check if there are missing values
        if not result.isna().any():
            return result

        # Interpolate missing values
        if method == 'linear':
            result = result.interpolate(method='linear')
        elif method == 'spline':
            result = result.interpolate(method='spline', order=3)
        elif method == 'polynomial':
            result = result.interpolate(method='polynomial', order=2)
        elif method == 'time':
            if isinstance(result.index, pd.DatetimeIndex):
                result = result.interpolate(method='time')
            else:
                logger.warning("Time interpolation requires DatetimeIndex. Using linear interpolation instead.")
                result = result.interpolate(method='linear')
        else:
            raise ValueError(f"Unknown interpolation method: {method}")

        # Handle edge cases
        if result.isna().any():
            # Forward fill first
            result = result.ffill()

            # Backward fill if still have NaNs
            result = result.bfill()

        return result

    def adjust_for_corporate_actions(
            self,
            prices: pd.DataFrame,
            corporate_actions: Dict[str, List[Dict]]
    ) -> pd.DataFrame:
        """
        Adjust price data for corporate actions.

        Args:
            prices: DataFrame with price data
            corporate_actions: Dictionary with corporate actions for each ticker

        Returns:
            DataFrame with adjusted price data
        """
        if prices.empty or not corporate_actions:
            return prices.copy()

        # Create a copy of the prices DataFrame
        adjusted_prices = prices.copy()

        # Process corporate actions for each ticker
        for ticker, actions in corporate_actions.items():
            if ticker not in adjusted_prices.columns:
                continue

            # Sort actions by date (newest first)
            sorted_actions = sorted(actions, key=lambda x: x['date'], reverse=True)

            for action in sorted_actions:
                action_date = pd.Timestamp(action['date'])
                action_type = action['type']

                if action_date not in adjusted_prices.index:
                    # Find the nearest available date
                    nearest_date = adjusted_prices.index[adjusted_prices.index < action_date]
                    if len(nearest_date) == 0:
                        continue
                    action_date = nearest_date[-1]

                if action_type == 'split':
                    # Stock split
                    split_ratio = action['ratio']
                    # Adjust prices before the split
                    mask = adjusted_prices.index < action_date
                    adjusted_prices.loc[mask, ticker] = adjusted_prices.loc[mask, ticker] / split_ratio

                elif action_type == 'dividend':
                    # Cash dividend
                    dividend_amount = action['amount']
                    # Adjust prices before the dividend
                    mask = adjusted_prices.index < action_date
                    pre_dividend_price = adjusted_prices.loc[action_date, ticker]
                    adjustment_factor = 1 - (dividend_amount / pre_dividend_price)
                    adjusted_prices.loc[mask, ticker] = adjusted_prices.loc[mask, ticker] * adjustment_factor

                elif action_type == 'merger':
                    # Merger/Acquisition
                    merger_ratio = action['ratio']
                    # Adjust prices before the merger
                    mask = adjusted_prices.index < action_date
                    adjusted_prices.loc[mask, ticker] = adjusted_prices.loc[mask, ticker] * merger_ratio

        return adjusted_prices

    def synchronize_time_series(
            self,
            series_dict: Dict[str, pd.Series],
            method: str = 'ffill'
    ) -> Dict[str, pd.Series]:
        """
        Synchronize multiple time series with different frequencies.

        Args:
            series_dict: Dictionary with time series {name: series}
            method: Method for filling missing values ('ffill', 'bfill', 'nearest', 'interpolate')

        Returns:
            Dictionary with synchronized time series
        """
        if not series_dict:
            return {}

        # Get all unique indices
        all_indices = []
        for series in series_dict.values():
            if not series.empty:
                all_indices.append(series.index)

        if not all_indices:
            return series_dict.copy()

        # Create a unified index
        unified_index = all_indices[0].union_many(all_indices[1:])

        # Reindex and synchronize each series
        synchronized_dict = {}

        for name, series in series_dict.items():
            if series.empty:
                synchronized_dict[name] = series.copy()
                continue

            # Reindex to unified index
            synchronized = series.reindex(unified_index)

            # Fill missing values
            if method == 'ffill':
                synchronized = synchronized.ffill()
            elif method == 'bfill':
                synchronized = synchronized.bfill()
            elif method == 'nearest':
                synchronized = synchronized.interpolate(method='nearest')
            elif method == 'interpolate':
                synchronized = synchronized.interpolate(method='linear')
                # Handle edge cases
                synchronized = synchronized.ffill().bfill()
            else:
                raise ValueError(f"Unknown synchronization method: {method}")

            synchronized_dict[name] = synchronized

        return synchronized_dict

    def detect_structural_breaks(
            self,
            series: pd.Series,
            min_segment_size: int = 30
    ) -> Dict:
        """
        Detect structural breaks in time series data.

        Args:
            series: Series with time series data
            min_segment_size: Minimum size of segments for break detection

        Returns:
            Dictionary with structural break information
        """
        if series.empty or len(series) < min_segment_size * 2:
            return {'breaks': [], 'statistics': {}}

        try:
            # This requires installing additional libraries: ruptures
            import ruptures as rpt
            has_ruptures = True
        except ImportError:
            has_ruptures = False
            logger.warning("The 'ruptures' package is not installed. Using a simplified method instead.")

        if has_ruptures:
            # Use ruptures for break detection
            # Convert series to numpy array
            signal = series.values

            # Detect breaks using Pelt method
            algo = rpt.Pelt(model="rbf").fit(signal)
            breaks = algo.predict(pen=10)

            # Convert break indices to dates
            break_dates = [series.index[i - 1] for i in breaks if i < len(series)]

            # Calculate statistics for each segment
            segments = []
            prev = 0

            for i, brk in enumerate(breaks):
                if brk - prev < min_segment_size:
                    # Skip segments that are too small
                    prev = brk
                    continue

                segment = series.iloc[prev:brk]

                segments.append({
                    'start': series.index[prev],
                    'end': series.index[brk - 1] if brk < len(series) else series.index[-1],
                    'mean': segment.mean(),
                    'std': segment.std(),
                    'min': segment.min(),
                    'max': segment.max()
                })

                prev = brk
        else:
            # Simplified method: rolling window statistics
            window_size = min(min_segment_size, len(series) // 5)

            # Calculate rolling mean and standard deviation
            rolling_mean = series.rolling(window=window_size).mean()
            rolling_std = series.rolling(window=window_size).std()

            # Calculate z-scores of changes in rolling statistics
            mean_changes = rolling_mean.diff().dropna()
            std_changes = rolling_std.diff().dropna()

            mean_z = (mean_changes - mean_changes.mean()) / mean_changes.std() if mean_changes.std() > 0 else 0
            std_z = (std_changes - std_changes.mean()) / std_changes.std() if std_changes.std() > 0 else 0

            # Detect potential breaks
            thresh = 2.5  # Z-score threshold
            mean_breaks = mean_z[abs(mean_z) > thresh].index
            std_breaks = std_z[abs(std_z) > thresh].index

            # Combine breaks
            all_breaks = list(set(mean_breaks) | set(std_breaks))
            all_breaks.sort()

            # Filter breaks that are too close
            break_dates = [all_breaks[0]] if all_breaks else []
            for brk in all_breaks[1:]:
                if (brk - break_dates[-1]).days > min_segment_size:
                    break_dates.append(brk)

            # Calculate statistics for each segment
            segments = []
            if break_dates:
                # Add start and end points
                all_points = [series.index[0]] + break_dates + [series.index[-1]]

                for i in range(len(all_points) - 1):
                    segment = series.loc[all_points[i]:all_points[i + 1]]

                    segments.append({
                        'start': all_points[i],
                        'end': all_points[i + 1],
                        'mean': segment.mean(),
                        'std': segment.std(),
                        'min': segment.min(),
                        'max': segment.max()
                    })

        # Calculate overall statistics
        statistics = {
            'overall_mean': series.mean(),
            'overall_std': series.std(),
            'segment_count': len(segments),
            'largest_mean_change': max([abs(segments[i]['mean'] - segments[i + 1]['mean'])
                                        for i in range(len(segments) - 1)]) if len(segments) > 1 else 0,
            'largest_std_change': max([abs(segments[i]['std'] - segments[i + 1]['std'])
                                       for i in range(len(segments) - 1)]) if len(segments) > 1 else 0
        }

        return {
            'breaks': break_dates,
            'segments': segments,
            'statistics': statistics
        }

    def calculate_rolling_window_analysis(
            self,
            series: pd.Series,
            windows: List[int] = [5, 21, 63, 252],
            metrics: List[str] = ['mean', 'std', 'sharpe', 'skew']
    ) -> Dict[str, pd.DataFrame]:
        """
        Calculate rolling window analysis for time series data.

        Args:
            series: Series with time series data
            windows: List of window sizes in days
            metrics: List of metrics to calculate ('mean', 'std', 'sharpe', 'skew', 'kurtosis', 'var', 'cvar')

        Returns:
            Dictionary with rolling window analysis results
        """
        if series.empty:
            return {}

        results = {}

        for window in windows:
            window_results = {}

            if 'mean' in metrics:
                # Rolling mean (annualized)
                window_results['mean'] = series.rolling(window=window).mean() * 252

            if 'std' in metrics:
                # Rolling standard deviation (annualized)
                window_results['std'] = series.rolling(window=window).std() * np.sqrt(252)

            if 'sharpe' in metrics:
                # Rolling Sharpe ratio (annualized)
                rolling_mean = series.rolling(window=window).mean() * 252
                rolling_std = series.rolling(window=window).std() * np.sqrt(252)
                window_results['sharpe'] = rolling_mean / rolling_std

            if 'skew' in metrics:
                # Rolling skewness
                window_results['skew'] = series.rolling(window=window).skew()

            if 'kurtosis' in metrics:
                # Rolling kurtosis
                window_results['kurtosis'] = series.rolling(window=window).kurt()

            if 'var' in metrics:
                # Rolling Value at Risk (95%)
                def rolling_var(x):
                    return -np.percentile(x, 5)

                window_results['var'] = series.rolling(window=window).apply(rolling_var)

            if 'cvar' in metrics:
                # Rolling Conditional Value at Risk (95%)
                def rolling_cvar(x):
                    var = np.percentile(x, 5)
                    return -x[x <= var].mean()

                window_results['cvar'] = series.rolling(window=window).apply(rolling_cvar)

            # Create a DataFrame with all metrics for this window
            if window_results:
                results[f'window_{window}'] = pd.DataFrame(window_results)

        return results