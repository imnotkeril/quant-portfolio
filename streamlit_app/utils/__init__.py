"""
Utils package for Wild Market Capital Streamlit app.
Centralized imports for all utility functions and constants.
"""

# Import all formatters
from .formatters import (
    format_percentage,
    format_currency,
    format_number,
    format_large_number,
    format_date,
    format_ratio,
    format_basis_points,
    format_duration,
    safe_divide
)

# Import all validators
from .validators import (
    validate_ticker,
    validate_ticker_live,
    validate_weight,
    validate_portfolio_weights,
    validate_portfolio_name,
    validate_date_string,
    validate_price,
    validate_shares,
    validate_asset_allocation,
    validate_csv_upload,
    validate_text_portfolio
)


# Import all helpers
from .helpers import (
    generate_portfolio_id,
    normalize_weights,
    calculate_portfolio_value,
    convert_weights_to_shares,
    cache_data,  # ← ИСПРАВЛЕНО
    get_cached_data,
    clear_cache,
    serialize_for_json,
    chunk_list,
    safe_get,
    merge_dicts,
    retry_with_backoff,
    format_error_message,
    log_performance
)

# Import all constants
from .constants import (
    # Colors
    COLORS,
    CHART_COLORS,
    PERFORMANCE_COLORS,
    RISK_COLORS,

    # App configuration
    APP_CONFIG,
    PAGES_CONFIG,
    CHART_CONFIG,

    # Metrics categories
    METRICS_CATEGORIES,

    # Default settings
    DEFAULT_SETTINGS,

    # Supported formats
    SUPPORTED_FORMATS
)

# Import styling function
from .styling import apply_custom_css, create_section_header, get_metric_card_html

# Package metadata
__version__ = "1.0.0"
__author__ = "Wild Market Capital"
__description__ = "Utility functions for portfolio management Streamlit application"

# Define public API
__all__ = [
    # Formatters
    "format_percentage",
    "format_currency",
    "format_number",
    "format_large_number",
    "format_date",
    "format_ratio",
    "format_basis_points",
    "format_duration",
    "safe_divide",

    # Validators
    "validate_ticker",
    "validate_ticker_live",
    "validate_weight",
    "validate_portfolio_weights",
    "validate_portfolio_name",
    "validate_date_string",
    "validate_price",
    "validate_shares",
    "validate_asset_allocation",
    "validate_csv_upload",
    "validate_text_portfolio",

    # Helpers
    "generate_portfolio_id",
    "normalize_weights",
    "calculate_portfolio_value",
    "convert_weights_to_shares",
    "cache_data",  # ← ИСПРАВЛЕНО
    "get_cached_data",
    "clear_cache",
    "serialize_for_json",
    "chunk_list",
    "safe_get",
    "merge_dicts",
    "retry_with_backoff",
    "format_error_message",
    "log_performance",

    # Constants
    "COLORS",
    "CHART_COLORS",
    "PERFORMANCE_COLORS",
    "RISK_COLORS",
    "APP_CONFIG",
    "PAGES_CONFIG",
    "CHART_CONFIG",
    "METRICS_CATEGORIES",
    "DEFAULT_SETTINGS",
    "SUPPORTED_FORMATS",

    # Styling
    "apply_custom_css",
    "create_section_header",
    "get_metric_card_html",

    # Package info
    "__version__",
    "__author__",
    "__description__"
]


def get_package_info() -> dict:
    """
    Get package information.

    Returns:
        Dictionary with package metadata
    """
    return {
        "name": "streamlit_utils",
        "version": __version__,
        "author": __author__,
        "description": __description__,
        "modules": [
            "formatters",
            "validators",
            "helpers",
            "constants",
            "styling"
        ]
    }


def validate_imports() -> dict:
    """
    Validate that all imports are working correctly.

    Returns:
        Dictionary with import status for each module
    """
    import_status = {}

    # Test formatters
    try:
        test_value = format_percentage(0.1234)
        import_status["formatters"] = "✅ OK"
    except Exception as e:
        import_status["formatters"] = f"❌ Error: {str(e)}"

    # Test validators
    try:
        test_result = validate_ticker("AAPL")
        import_status["validators"] = "✅ OK"
    except Exception as e:
        import_status["validators"] = f"❌ Error: {str(e)}"

    # Test helpers
    try:
        test_id = generate_portfolio_id("test")
        import_status["helpers"] = "✅ OK"
    except Exception as e:
        import_status["helpers"] = f"❌ Error: {str(e)}"

    # Test constants
    try:
        test_colors = COLORS["primary"]
        import_status["constants"] = "✅ OK"
    except Exception as e:
        import_status["constants"] = f"❌ Error: {str(e)}"

    # Test styling
    try:
        # Just check if function exists, don't call it
        if callable(apply_custom_css) and callable(create_section_header):
            import_status["styling"] = "✅ OK"
        else:
            import_status["styling"] = "❌ Not callable"
    except Exception as e:
        import_status["styling"] = f"❌ Error: {str(e)}"

    return import_status


# Run validation on import for debugging
if __name__ == "__main__":
    print("Wild Market Capital Utils Package")
    print("=" * 40)
    print(f"Version: {__version__}")
    print(f"Author: {__author__}")
    print()

    # Show import status
    status = validate_imports()
    print("Import Status:")
    for module, result in status.items():
        print(f"  {module}: {result}")