# backend/app/utils/statistical_utils.py
from typing import List, Dict, Union, Optional, Tuple
import numpy as np
import pandas as pd
import scipy.stats as stats


def calculate_mean(
        data: Union[List[float], pd.Series, np.ndarray],
        trim_pct: float = 0.0
) -> float:
    """
    Calculate mean (average) of data, with optional trimming.

    Args:
        data: Data values
        trim_pct: Percentage to trim from each end (0-0.5)

    Returns:
        Mean value
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) == 0:
        return 0.0

    # Apply trimming if requested
    if trim_pct > 0:
        if trim_pct >= 0.5:
            trim_pct = 0.49  # Cap at just under 50%

        # Calculate trimmed mean
        return stats.trim_mean(data, trim_pct)

    # Calculate regular mean
    return np.mean(data)


def calculate_median(
        data: Union[List[float], pd.Series, np.ndarray]
) -> float:
    """
    Calculate median (middle value) of data.

    Args:
        data: Data values

    Returns:
        Median value
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) == 0:
        return 0.0

    return np.median(data)


def calculate_mode(
        data: Union[List[float], pd.Series, np.ndarray]
) -> Union[float, List[float]]:
    """
    Calculate mode (most frequent value) of data.

    Args:
        data: Data values

    Returns:
        Mode value or list of mode values
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) == 0:
        return 0.0

    # Calculate mode
    mode_result = stats.mode(data)

    # Extract mode value(s)
    if isinstance(mode_result, tuple):  # scipy < 1.9.0
        mode_values = mode_result[0]
    else:  # scipy >= 1.9.0
        mode_values = mode_result.mode

    # Return single value if only one mode, otherwise return list
    if len(mode_values) == 1:
        return float(mode_values[0])
    else:
        return [float(x) for x in mode_values]


def calculate_standard_deviation(
        data: Union[List[float], pd.Series, np.ndarray],
        ddof: int = 1
) -> float:
    """
    Calculate standard deviation of data.

    Args:
        data: Data values
        ddof: Delta degrees of freedom (1 for sample, 0 for population)

    Returns:
        Standard deviation
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) <= ddof:
        return 0.0

    return np.std(data, ddof=ddof)


def calculate_skewness(
        data: Union[List[float], pd.Series, np.ndarray]
) -> float:
    """
    Calculate skewness of data distribution.

    Args:
        data: Data values

    Returns:
        Skewness
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) < 3:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) < 3:
        return 0.0

    return stats.skew(data)


def calculate_kurtosis(
        data: Union[List[float], pd.Series, np.ndarray],
        fisher: bool = True
) -> float:
    """
    Calculate kurtosis of data distribution.

    Args:
        data: Data values
        fisher: If True, Fisher's definition is used (excess kurtosis, normal = 0.0)
               If False, Pearson's definition is used (normal = 3.0)

    Returns:
        Kurtosis
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) < 4:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) < 4:
        return 0.0

    return stats.kurtosis(data, fisher=fisher)


def calculate_percentile(
        data: Union[List[float], pd.Series, np.ndarray],
        percentile: float
) -> float:
    """
    Calculate percentile of data.

    Args:
        data: Data values
        percentile: Percentile to calculate (0-100)

    Returns:
        Percentile value
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) == 0:
        return 0.0

    return np.percentile(data, percentile)


def calculate_correlation(
        data1: Union[List[float], pd.Series, np.ndarray],
        data2: Union[List[float], pd.Series, np.ndarray],
        method: str = 'pearson'
) -> float:
    """
    Calculate correlation between two datasets.

    Args:
        data1: First dataset
        data2: Second dataset
        method: Correlation method ('pearson', 'spearman', or 'kendall')

    Returns:
        Correlation coefficient
    """
    if (not isinstance(data1, (list, pd.Series, np.ndarray)) or
            not isinstance(data2, (list, pd.Series, np.ndarray)) or
            len(data1) == 0 or len(data2) == 0):
        return 0.0

    # Convert to numpy arrays
    if isinstance(data1, (list, pd.Series)):
        data1 = np.array(data1)
    if isinstance(data2, (list, pd.Series)):
        data2 = np.array(data2)

    # Ensure arrays have same length
    min_length = min(len(data1), len(data2))
    data1 = data1[:min_length]
    data2 = data2[:min_length]

    # Remove pairs with NaN values
    mask = ~(np.isnan(data1) | np.isnan(data2))
    data1 = data1[mask]
    data2 = data2[mask]

    if len(data1) < 2:
        return 0.0

    if method == 'pearson':
        # Pearson correlation
        return stats.pearsonr(data1, data2)[0]
    elif method == 'spearman':
        # Spearman rank correlation
        return stats.spearmanr(data1, data2)[0]
    elif method == 'kendall':
        # Kendall Tau correlation
        return stats.kendalltau(data1, data2)[0]
    else:
        raise ValueError(f"Unknown correlation method: {method}")


def calculate_basic_statistics(
        data: Union[List[float], pd.Series, np.ndarray]
) -> Dict[str, float]:
    """
    Calculate basic descriptive statistics for a dataset.

    Args:
        data: Data values

    Returns:
        Dictionary with basic statistics
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return {
            'count': 0,
            'mean': 0.0,
            'median': 0.0,
            'std': 0.0,
            'min': 0.0,
            'max': 0.0,
            'range': 0.0
        }

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) == 0:
        return {
            'count': 0,
            'mean': 0.0,
            'median': 0.0,
            'std': 0.0,
            'min': 0.0,
            'max': 0.0,
            'range': 0.0
        }

    # Calculate statistics
    count = len(data)
    mean = np.mean(data)
    median = np.median(data)
    std = np.std(data, ddof=1) if count > 1 else 0.0
    min_val = np.min(data)
    max_val = np.max(data)
    data_range = max_val - min_val

    return {
        'count': count,
        'mean': mean,
        'median': median,
        'std': std,
        'min': min_val,
        'max': max_val,
        'range': data_range
    }


def calculate_confidence_interval(
        data: Union[List[float], pd.Series, np.ndarray],
        confidence: float = 0.95
) -> Tuple[float, float]:
    """
    Calculate confidence interval for the mean.

    Args:
        data: Data values
        confidence: Confidence level (e.g., 0.95 for 95%)

    Returns:
        Tuple of (lower_bound, upper_bound)
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) < 2:
        return (0.0, 0.0)

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) < 2:
        return (0.0, 0.0)

    # Calculate mean and standard error
    mean = np.mean(data)
    sem = stats.sem(data)

    # Calculate confidence interval
    return stats.t.interval(confidence, len(data) - 1, loc=mean, scale=sem)


def t_test(
        data1: Union[List[float], pd.Series, np.ndarray],
        data2: Union[List[float], pd.Series, np.ndarray] = None,
        equal_var: bool = True
) -> Dict[str, float]:
    """
    Perform t-test on one or two samples.

    Args:
        data1: First dataset
        data2: Second dataset (if None, performs one-sample t-test against 0)
        equal_var: Whether to assume equal variance (for two-sample test)

    Returns:
        Dictionary with t-statistic and p-value
    """
    if not isinstance(data1, (list, pd.Series, np.ndarray)) or len(data1) == 0:
        return {'t_statistic': 0.0, 'p_value': 1.0}

    # Convert to numpy arrays
    if isinstance(data1, (list, pd.Series)):
        data1 = np.array(data1)

    # Remove NaN values
    data1 = data1[~np.isnan(data1)]

    if len(data1) < 2:
        return {'t_statistic': 0.0, 'p_value': 1.0}

    if data2 is None:
        # One-sample t-test against 0
        t_stat, p_val = stats.ttest_1samp(data1, 0)
    else:
        # Two-sample t-test
        if isinstance(data2, (list, pd.Series)):
            data2 = np.array(data2)

        # Remove NaN values
        data2 = data2[~np.isnan(data2)]

        if len(data2) < 2:
            return {'t_statistic': 0.0, 'p_value': 1.0}

        t_stat, p_val = stats.ttest_ind(data1, data2, equal_var=equal_var)

    return {'t_statistic': t_stat, 'p_value': p_val}


def autocorrelation(
        data: Union[List[float], pd.Series, np.ndarray],
        lag: int = 1
) -> float:
    """
    Calculate autocorrelation of a time series.

    Args:
        data: Time series data
        lag: Lag for autocorrelation

    Returns:
        Autocorrelation coefficient
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) <= lag:
        return 0.0

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) <= lag:
        return 0.0

    # Calculate autocorrelation
    result = np.corrcoef(data[lag:], data[:-lag])[0, 1]

    return result if not np.isnan(result) else 0.0


def calculate_normality_test(
        data: Union[List[float], pd.Series, np.ndarray]
) -> Dict[str, float]:
    """
    Perform normality test on data (Shapiro-Wilk test).

    Args:
        data: Data values

    Returns:
        Dictionary with test statistic and p-value
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) < 3:
        return {'statistic': 0.0, 'p_value': 1.0}

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values
    data = data[~np.isnan(data)]

    if len(data) < 3 or len(data) > 5000:
        # Shapiro-Wilk test not appropriate for very large samples
        return {'statistic': 0.0, 'p_value': 1.0}

    # Perform Shapiro-Wilk test
    statistic, p_value = stats.shapiro(data)

    return {'statistic': statistic, 'p_value': p_value}


def normalize_data(
        data: Union[List[float], pd.Series, np.ndarray],
        method: str = 'zscore'
) -> Union[np.ndarray, pd.Series]:
    """
    Normalize data using various methods.

    Args:
        data: Data values
        method: Normalization method ('zscore', 'minmax', 'robust', 'log')

    Returns:
        Normalized data
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return np.array([])

    # Keep original type for return value
    original_type = type(data)

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Remove NaN values for calculation but preserve positions
    mask = ~np.isnan(data)
    values = data[mask]

    if len(values) == 0:
        return data  # Return original with NaNs

    if method == 'zscore':
        # Z-score normalization
        mean = np.mean(values)
        std = np.std(values)
        if std == 0:
            normalized = np.zeros_like(values)
        else:
            normalized = (values - mean) / std

    elif method == 'minmax':
        # Min-max normalization
        min_val = np.min(values)
        max_val = np.max(values)
        if max_val == min_val:
            normalized = np.zeros_like(values)
        else:
            normalized = (values - min_val) / (max_val - min_val)

    elif method == 'robust':
        # Robust normalization using median and IQR
        median = np.median(values)
        q1 = np.percentile(values, 25)
        q3 = np.percentile(values, 75)
        iqr = q3 - q1
        if iqr == 0:
            normalized = np.zeros_like(values)
        else:
            normalized = (values - median) / iqr

    elif method == 'log':
        # Log normalization (add small value to avoid log(0))
        min_val = np.min(values)
        offset = 0 if min_val > 0 else abs(min_val) + 1e-10
        normalized = np.log(values + offset)

    else:
        raise ValueError(f"Unknown normalization method: {method}")

    # Create result array with NaNs preserved
    result = np.full_like(data, np.nan)
    result[mask] = normalized

    # Return same type as input
    if original_type == pd.Series and isinstance(data, pd.Series):
        return pd.Series(result, index=data.index)
    else:
        return result


def detect_outliers(
        data: Union[List[float], pd.Series, np.ndarray],
        method: str = 'zscore',
        threshold: float = 3.0
) -> np.ndarray:
    """
    Detect outliers in data.

    Args:
        data: Data values
        method: Detection method ('zscore', 'iqr', 'modified_zscore')
        threshold: Threshold for outlier detection

    Returns:
        Boolean array where True indicates outlier
    """
    if not isinstance(data, (list, pd.Series, np.ndarray)) or len(data) == 0:
        return np.array([])

    # Convert to numpy array
    if isinstance(data, (list, pd.Series)):
        data = np.array(data)

    # Create mask for NaN values
    mask = ~np.isnan(data)
    values = data[mask]

    if len(values) == 0:
        return np.full(data.shape, False)

    # Initialize outliers array
    outliers = np.full(values.shape, False)

    if method == 'zscore':
        # Z-score method
        mean = np.mean(values)
        std = np.std(values)
        if std > 0:
            z_scores = np.abs((values - mean) / std)
            outliers = z_scores > threshold

    elif method == 'iqr':
        # IQR method
        q1 = np.percentile(values, 25)
        q3 = np.percentile(values, 75)
        iqr = q3 - q1
        if iqr > 0:
            lower_bound = q1 - threshold * iqr
            upper_bound = q3 + threshold * iqr
            outliers = (values < lower_bound) | (values > upper_bound)

    elif method == 'modified_zscore':
        # Modified Z-score method
        median = np.median(values)
        mad = np.median(np.abs(values - median))
        if mad > 0:
            modified_z_scores = 0.6745 * np.abs(values - median) / mad
            outliers = modified_z_scores > threshold

    else:
        raise ValueError(f"Unknown outlier detection method: {method}")

    # Create result array with NaNs preserved
    result = np.full(data.shape, False)
    result[mask] = outliers

    return result