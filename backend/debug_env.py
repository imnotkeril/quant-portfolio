#!/usr/bin/env python3
"""
Debug environment loading - FIXED ENCODING
"""
import os
from pathlib import Path


def debug_env():
    print("🔧 Debugging environment loading...")
    print(f"📁 Current directory: {os.getcwd()}")

    # Check .env file location
    env_locations = [
        Path(".env"),
        Path("../.env"),
        Path("backend/.env"),
        Path("./backend/.env")
    ]

    for env_path in env_locations:
        if env_path.exists():
            print(f"✅ Found .env at: {env_path.absolute()}")
            try:
                # Try different encodings
                for encoding in ['utf-8', 'utf-8-sig', 'cp1251', 'latin1']:
                    try:
                        with open(env_path, 'r', encoding=encoding) as f:
                            content = f.read()
                            print(f"✅ Successfully read with {encoding} encoding")
                            if "ALPHA_VANTAGE_API_KEY=3ZZF5VZ7NJKXR0O2" in content:
                                print(f"✅ API key found in {env_path}")
                            else:
                                print(f"❌ API key not found in {env_path}")
                            break
                    except UnicodeDecodeError:
                        continue
                else:
                    print(f"❌ Could not read {env_path} with any encoding")
            except Exception as e:
                print(f"❌ Error reading {env_path}: {e}")
        else:
            print(f"❌ Not found: {env_path}")

    # Check current environment
    api_key = os.environ.get('ALPHA_VANTAGE_API_KEY', '')
    print(f"📋 Current env ALPHA_VANTAGE_API_KEY: '{api_key}'")

    # Test manual load
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv available")

        # Try different locations
        for env_path in env_locations:
            if env_path.exists():
                print(f"🔄 Trying to load {env_path}")
                load_dotenv(env_path, override=True)
                new_key = os.environ.get('ALPHA_VANTAGE_API_KEY', '')
                print(f"   Result: '{new_key}'")
                if new_key:
                    print(f"✅ Successfully loaded API key: {new_key[:8]}...")
                    break
    except ImportError:
        print("❌ python-dotenv not installed!")
        print("Install with: pip install python-dotenv")

    # Test config loading
    try:
        from app.config import settings
        print(f"⚙️ Settings loaded: {type(settings)}")
        print(f"📋 Settings.ALPHA_VANTAGE_API_KEY: '{settings.ALPHA_VANTAGE_API_KEY}'")
        print(f"📋 Settings.DEBUG: {settings.DEBUG}")

        if settings.ALPHA_VANTAGE_API_KEY:
            print(f"✅ Config successfully loaded API key: {settings.ALPHA_VANTAGE_API_KEY[:8]}...")
        else:
            print("❌ Config did not load API key")

    except Exception as e:
        print(f"❌ Error loading settings: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    debug_env()