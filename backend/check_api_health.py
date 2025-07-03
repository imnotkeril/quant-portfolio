#!/usr/bin/env python3
"""
API Health Check Script
Проверяет состояние API и выявляет проблемы с подключением к данным
"""
import os
import sys
import requests
import json
from datetime import datetime
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings


def colored_print(message: str, color: str = "white"):
    """Print colored messages"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "purple": "\033[95m",
        "cyan": "\033[96m",
        "white": "\033[97m",
        "reset": "\033[0m"
    }
    print(f"{colors.get(color, colors['white'])}{message}{colors['reset']}")


def check_api_health():
    """Check API health and endpoints"""
    base_url = "http://localhost:8000"

    colored_print("🔍 API Health Check Started", "blue")
    colored_print("=" * 50, "blue")

    # Check if API is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            colored_print("✅ API Server is running", "green")
        else:
            colored_print(f"⚠️  API Server returned status {response.status_code}", "yellow")
    except requests.exceptions.ConnectionError:
        colored_print("❌ API Server is not running or not accessible", "red")
        colored_print("   Start server with: uvicorn app.main:app --host 0.0.0.0 --port 8000", "yellow")
        return False
    except Exception as e:
        colored_print(f"❌ Error connecting to API: {e}", "red")
        return False

    # Check health endpoint
    try:
        response = requests.get(f"{base_url}/api/v1/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            colored_print("✅ Health endpoint working", "green")

            # Check service status
            services = health_data.get("services", {})
            colored_print("\n📋 Services Status:", "cyan")

            for service, status in services.items():
                if isinstance(status, bool):
                    status_icon = "✅" if status else "❌"
                    status_color = "green" if status else "red"
                    colored_print(f"   {status_icon} {service}: {status}", status_color)
                elif isinstance(status, dict):
                    colored_print(f"   📁 {service}:", "cyan")
                    for sub_key, sub_status in status.items():
                        sub_icon = "✅" if sub_status else "❌"
                        sub_color = "green" if sub_status else "red"
                        colored_print(f"      {sub_icon} {sub_key}: {sub_status}", sub_color)

            # Check API keys
            api_keys_configured = health_data.get("config", {}).get("alpha_vantage_configured", False)
            if api_keys_configured:
                colored_print("✅ Alpha Vantage API key configured", "green")
            else:
                colored_print("⚠️  Alpha Vantage API key not configured", "yellow")
                colored_print("   Add your API key to .env file: ALPHA_VANTAGE_API_KEY=your_key", "yellow")

        else:
            colored_print(f"❌ Health endpoint returned status {response.status_code}", "red")
            colored_print(f"   Response: {response.text}", "red")
    except Exception as e:
        colored_print(f"❌ Error checking health endpoint: {e}", "red")

    # Check assets search endpoint
    try:
        response = requests.get(f"{base_url}/api/v1/assets/search?query=AAPL&limit=5", timeout=10)
        if response.status_code == 200:
            results = response.json()
            colored_print("✅ Assets search endpoint working", "green")
            if isinstance(results, list) and len(results) > 0:
                colored_print(f"   Found {len(results)} results for AAPL", "green")
            else:
                colored_print("⚠️  Assets search returned empty results", "yellow")
        else:
            colored_print(f"❌ Assets search endpoint returned status {response.status_code}", "red")
            colored_print(f"   Response: {response.text}", "red")
    except Exception as e:
        colored_print(f"❌ Error testing assets search: {e}", "red")

    # Check portfolios endpoint
    try:
        response = requests.get(f"{base_url}/api/v1/portfolios", timeout=10)
        if response.status_code == 200:
            portfolios = response.json()
            colored_print("✅ Portfolios endpoint working", "green")
            total_portfolios = portfolios.get("total", 0)
            colored_print(f"   Found {total_portfolios} portfolios", "green")
        else:
            colored_print(f"❌ Portfolios endpoint returned status {response.status_code}", "red")
    except Exception as e:
        colored_print(f"❌ Error testing portfolios endpoint: {e}", "red")

    return True


def check_environment():
    """Check environment configuration"""
    colored_print("\n🔧 Environment Configuration Check", "blue")
    colored_print("=" * 50, "blue")

    # Check .env file
    env_file = Path(".env")
    if env_file.exists():
        colored_print("✅ .env file found", "green")
    else:
        colored_print("⚠️  .env file not found", "yellow")

    # Check API key
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if api_key:
        if api_key == "YOUR_REAL_API_KEY_HERE":
            colored_print("⚠️  Alpha Vantage API key is placeholder - replace with real key", "yellow")
        elif api_key == "0VJE73FSCQIPH601":
            colored_print("⚠️  Using demo Alpha Vantage API key - may have limitations", "yellow")
        else:
            colored_print("✅ Alpha Vantage API key configured", "green")
    else:
        colored_print("❌ Alpha Vantage API key not set", "red")

    # Check directories
    directories = [
        settings.CACHE_DIR,
        settings.PORTFOLIO_DIR,
        settings.STORAGE_DIR,
        settings.REPORTS_DIR
    ]

    colored_print("\n📁 Directory Status:", "cyan")
    for directory in directories:
        path = Path(directory)
        if path.exists():
            colored_print(f"   ✅ {directory}: exists", "green")
        else:
            colored_print(f"   ⚠️  {directory}: does not exist (will be created)", "yellow")


def check_dependencies():
    """Check Python dependencies"""
    colored_print("\n📦 Dependencies Check", "blue")
    colored_print("=" * 50, "blue")

    required_packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "requests",
        "pandas",
        "numpy",
        "yfinance"
    ]

    for package in required_packages:
        try:
            __import__(package)
            colored_print(f"   ✅ {package}: installed", "green")
        except ImportError:
            colored_print(f"   ❌ {package}: not installed", "red")


def test_data_fetching():
    """Test data fetching functionality"""
    colored_print("\n📊 Data Fetching Test", "blue")
    colored_print("=" * 50, "blue")

    try:
        # Test yfinance
        import yfinance as yf
        ticker = yf.Ticker("AAPL")
        info = ticker.info
        if info and "symbol" in info:
            colored_print("✅ yfinance working", "green")
        else:
            colored_print("⚠️  yfinance may have issues", "yellow")
    except Exception as e:
        colored_print(f"❌ yfinance error: {e}", "red")

    # Test Alpha Vantage if key is configured
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if api_key and api_key != "YOUR_REAL_API_KEY_HERE":
        try:
            url = f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=AAPL&apikey={api_key}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "bestMatches" in data:
                    colored_print("✅ Alpha Vantage API working", "green")
                elif "Error Message" in data:
                    colored_print(f"❌ Alpha Vantage API error: {data['Error Message']}", "red")
                else:
                    colored_print("⚠️  Alpha Vantage API returned unexpected response", "yellow")
            else:
                colored_print(f"❌ Alpha Vantage API returned status {response.status_code}", "red")
        except Exception as e:
            colored_print(f"❌ Alpha Vantage API error: {e}", "red")
    else:
        colored_print("⚠️  Alpha Vantage API key not configured - skipping test", "yellow")


def main():
    """Main health check function"""
    colored_print("🏥 Investment Portfolio Management System - Health Check", "purple")
    colored_print(f"   Timestamp: {datetime.now().isoformat()}", "white")
    colored_print("=" * 70, "purple")

    # Run all checks
    check_environment()
    check_dependencies()
    api_running = check_api_health()

    if api_running:
        test_data_fetching()

    colored_print("\n" + "=" * 70, "purple")
    colored_print("🏁 Health Check Complete", "purple")

    # Summary
    colored_print("\n📋 Quick Fix Guide:", "cyan")
    colored_print("1. If API not running: uvicorn app.main:app --host 0.0.0.0 --port 8000", "white")
    colored_print("2. If Alpha Vantage issues: Get free API key from https://www.alphavantage.co/support/#api-key",
                  "white")
    colored_print("3. If dependency issues: pip install -r requirements.txt", "white")
    colored_print("4. If port issues: Check if port 8000 is already in use", "white")


if __name__ == "__main__":
    main()