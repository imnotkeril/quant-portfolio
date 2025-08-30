#!/usr/bin/env python3
"""
Diagnostic script to identify portfolio loading issues.
Run this from streamlit_app directory to check portfolio data.

Usage: python diagnose_portfolios.py
"""

import sys
import json
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))


def check_directory_structure():
    """Check if directories exist and are properly structured."""
    print("DIRECTORY STRUCTURE CHECK")
    print("=" * 50)

    streamlit_dir = Path.cwd()
    print(f"Current directory: {streamlit_dir}")

    # Check key directories
    dirs_to_check = [
        streamlit_dir / "data",
        streamlit_dir / "data" / "portfolios",
        streamlit_dir / "services",
        streamlit_dir.parent / "backend"
    ]

    for dir_path in dirs_to_check:
        exists = dir_path.exists()
        print(f"  {dir_path.name}: {'EXISTS' if exists else 'MISSING'} ({dir_path})")

        if exists and dir_path.name == "portfolios":
            json_files = list(dir_path.glob("*.json"))
            print(f"    Portfolio files: {len(json_files)}")
            for json_file in json_files[:3]:  # Show first 3
                print(f"      {json_file.name}")


def check_portfolio_files():
    """Check portfolio files structure and content."""
    print("\nPORTFOLIO FILES CHECK")
    print("=" * 50)

    portfolio_dir = Path.cwd() / "data" / "portfolios"

    if not portfolio_dir.exists():
        print(f"Portfolio directory not found: {portfolio_dir}")
        return

    json_files = list(portfolio_dir.glob("*.json"))
    print(f"Found {len(json_files)} portfolio files")

    for i, json_file in enumerate(json_files):
        print(f"\nPortfolio {i + 1}: {json_file.name}")
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Check basic structure
            print(f"  Keys: {list(data.keys())}")
            print(f"  ID: {data.get('id', 'Missing')}")
            print(f"  Name: {data.get('name', 'Missing')}")
            print(f"  Assets field exists: {'assets' in data}")

            assets = data.get('assets', [])
            print(f"  Assets count: {len(assets)}")

            if assets:
                print(
                    f"  First asset keys: {list(assets[0].keys()) if isinstance(assets[0], dict) else 'Invalid format'}")
                print(f"  First asset: {assets[0]}")
            else:
                print("  No assets found in portfolio")

        except Exception as e:
            print(f"  ERROR reading file: {e}")


def test_backend_imports():
    """Test backend service imports."""
    print("\nBACKEND IMPORTS CHECK")
    print("=" * 50)

    try:
        # Test services import
        from services import settings, JsonStorageService

        print(f"Settings available: {settings is not None}")
        if settings:
            print(f"  DATA_DIR: {settings.DATA_DIR}")
            print(f"  PORTFOLIO_DIR: {settings.PORTFOLIO_DIR}")
            print(f"  Data dir exists: {settings.DATA_DIR.exists()}")
            print(f"  Portfolio dir exists: {settings.PORTFOLIO_DIR.exists()}")

        print(f"JsonStorageService available: {JsonStorageService is not None}")

    except ImportError as e:
        print(f"Import failed: {e}")


def test_service_manager():
    """Test ServiceManager functionality."""
    print("\nSERVICE MANAGER CHECK")
    print("=" * 50)

    try:
        from services.service_manager import ServiceManager

        # Test JSON storage service
        json_storage = ServiceManager.get_json_storage_service()
        print(f"JSON Storage Service: {'OK' if json_storage else 'FAILED'}")

        # Test portfolio manager
        portfolio_manager = ServiceManager.get_portfolio_manager()
        print(f"Portfolio Manager: {'OK' if portfolio_manager else 'FAILED'}")

        if portfolio_manager:
            portfolios = portfolio_manager.list_portfolios()
            print(f"Portfolios loaded: {len(portfolios)}")

            for i, portfolio in enumerate(portfolios[:3]):
                print(f"  Portfolio {i + 1}:")
                print(f"    Name: {portfolio.get('name', 'N/A')}")
                print(f"    Asset count: {portfolio.get('asset_count', 0)}")

    except Exception as e:
        print(f"Service Manager test failed: {e}")
        import traceback
        print("Full traceback:")
        print(traceback.format_exc())


def test_json_storage_direct():
    """Test JsonStorageService directly."""
    print("\nDIRECT JSON STORAGE TEST")
    print("=" * 50)

    try:
        from services import JsonStorageService, settings

        if not JsonStorageService:
            print("JsonStorageService not available")
            return

        if not settings:
            print("Settings not available")
            return

        # Create JsonStorageService instance
        storage = JsonStorageService(str(settings.DATA_DIR))

        # Test list_portfolios method directly
        portfolios = storage.list_portfolios()
        print(f"Direct storage test: {len(portfolios)} portfolios found")

        for portfolio in portfolios:
            print(f"  {portfolio.get('name', 'N/A')}: {portfolio.get('asset_count', 0)} assets")

    except Exception as e:
        print(f"Direct JSON storage test failed: {e}")


def run_all_diagnostics():
    """Run all diagnostic checks."""
    print("PORTFOLIO LOADING DIAGNOSTIC TOOL")
    print("=" * 50)
    print(f"Running from: {Path.cwd()}")
    print()

    check_directory_structure()
    check_portfolio_files()
    test_backend_imports()
    test_service_manager()
    test_json_storage_direct()

    print("\nDIAGNOSTIC COMPLETE")
    print("=" * 50)
    print("If portfolios show 0 assets but files contain assets:")
    print("1. Check that JSON files have 'assets' field (not 'holdings' or other)")
    print("2. Verify streamlit_app/data/portfolios directory is used")
    print("3. Restart Streamlit to clear cache")
    print("4. Check that asset structure matches expected format")


if __name__ == "__main__":
    run_all_diagnostics()