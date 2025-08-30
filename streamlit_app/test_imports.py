#!/usr/bin/env python3
"""
Test script to validate all imports in streamlit_app.
Run this before starting the main app to catch import errors.
"""
import sys
from pathlib import Path

print("🧪 Testing Streamlit app imports...")
print("=" * 50)

try:
    # Test utils imports
    print("📦 Testing utils package...")
    from utils import (
        format_percentage,
        format_currency,
        validate_ticker,
        generate_portfolio_id,
        normalize_weights,
        set_cached_data,
        get_cached_data,
        COLORS,
        apply_custom_css,
        create_section_header
    )

    print("✅ Utils imports successful")

    # Test package info
    from utils import get_package_info, validate_imports

    info = get_package_info()
    print(f"📋 Package info: {info['name']} v{info['version']}")

    # Run validation
    print("🔍 Running import validation...")
    status = validate_imports()
    for module, result in status.items():
        print(f"  {module}: {result}")

except ImportError as e:
    print(f"❌ Import error in utils: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error in utils: {e}")
    sys.exit(1)

try:
    # Test services imports
    print("\n📦 Testing services package...")
    from services.service_manager import ServiceManager

    print("✅ Services imports successful")

except ImportError as e:
    print(f"❌ Import error in services: {e}")
    print("⚠️  This is expected if backend is not available")
except Exception as e:
    print(f"❌ Error in services: {e}")

try:
    # Test components imports
    print("\n📦 Testing components package...")
    from components.charts import create_portfolio_composition_chart
    from components.metrics_cards import create_metrics_grid
    from components.tables import create_portfolio_assets_table
    from components.portfolio_selector import create_portfolio_selector
    from components.sidebar_nav import create_sidebar_navigation

    print("✅ Components imports successful")

except ImportError as e:
    print(f"❌ Import error in components: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error in components: {e}")
    sys.exit(1)

print("\n🎉 All critical imports successful!")
print("✅ Ready to run: streamlit run app.py")

# Test a few key functions
print("\n🧪 Testing key functions...")
try:
    # Test formatters
    test_percentage = format_percentage(0.1234)
    print(f"📊 format_percentage(0.1234) = {test_percentage}")

    test_currency = format_currency(1234.56)
    print(f"💰 format_currency(1234.56) = {test_currency}")

    # Test validator
    test_ticker = validate_ticker("AAPL")
    print(f"🔍 validate_ticker('AAPL') = {test_ticker}")

    # Test helper
    test_id = generate_portfolio_id("Test Portfolio")
    print(f"🆔 generate_portfolio_id('Test Portfolio') = {test_id}")

    # Test normalize weights
    test_weights = normalize_weights([0.3, 0.5, 0.1])
    print(f"⚖️ normalize_weights([0.3, 0.5, 0.1]) = {test_weights}")

    print("✅ All function tests passed!")

except Exception as e:
    print(f"❌ Function test error: {e}")
    sys.exit(1)

print("\n" + "=" * 50)
print("🚀 Ready to launch Wild Market Capital Streamlit app!")