#!/usr/bin/env python3
"""
Test environment variables loading
"""
import os
from pathlib import Path


def test_env():
    print("🔧 Testing environment variables...")
    print(f"📁 Current directory: {os.getcwd()}")

    # Check .env file
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file found")

        # Read and check content
        with open(env_file, 'r') as f:
            content = f.read()
            if "ALPHA_VANTAGE_API_KEY=3ZZF5VZ7NJKXR0O2" in content:
                print("✅ Alpha Vantage API key found in .env file")
            else:
                print("❌ Alpha Vantage API key not found in .env file")
    else:
        print("❌ .env file not found")

    # Check environment variable
    api_key = os.environ.get('ALPHA_VANTAGE_API_KEY', '')
    if api_key:
        print(f"✅ ALPHA_VANTAGE_API_KEY in environment: {api_key[:8]}...")
    else:
        print("❌ ALPHA_VANTAGE_API_KEY not in environment")

    # Test with python-dotenv
    try:
        from dotenv import load_dotenv
        load_dotenv()
        api_key_dotenv = os.environ.get('ALPHA_VANTAGE_API_KEY', '')
        if api_key_dotenv:
            print(f"✅ After dotenv load: {api_key_dotenv[:8]}...")
        else:
            print("❌ dotenv load failed")
    except ImportError:
        print("⚠️ python-dotenv not installed")

    # Test settings import
    try:
        from app.config import settings
        if settings.ALPHA_VANTAGE_API_KEY:
            print(f"✅ Settings.ALPHA_VANTAGE_API_KEY: {settings.ALPHA_VANTAGE_API_KEY[:8]}...")
        else:
            print("❌ Settings.ALPHA_VANTAGE_API_KEY is empty")
    except Exception as e:
        print(f"❌ Error importing settings: {e}")


if __name__ == "__main__":
    test_env()