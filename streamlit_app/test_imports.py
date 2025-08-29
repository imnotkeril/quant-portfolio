#!/usr/bin/env python3
"""
Test script to debug backend imports for Streamlit app.
Run this separately to see what's happening with imports.
"""
import sys
from pathlib import Path

print("🔍 Testing backend imports...")
print(f"📍 Current working directory: {Path.cwd()}")
print(f"📍 Script directory: {Path(__file__).parent}")
print(f"📍 Python path: {sys.path[:5]}")

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
print(f"📍 Backend path: {backend_path}")
print(f"📍 Backend exists: {backend_path.exists()}")

sys.path.insert(0, str(backend_path))

if backend_path.exists():
    app_path = backend_path / "app"
    print(f"📍 App path exists: {app_path.exists()}")

    if app_path.exists():
        core_path = app_path / "core"
        services_path = core_path / "services"
        infra_path = app_path / "infrastructure"

        print(f"📍 Core path exists: {core_path.exists()}")
        print(f"📍 Services path exists: {services_path.exists()}")
        print(f"📍 Infrastructure path exists: {infra_path.exists()}")

        if services_path.exists():
            print(f"📍 Services directory contains: {list(services_path.glob('*.py'))}")

        if infra_path.exists():
            print(f"📍 Infrastructure directory contains: {list(infra_path.glob('**/*.py'))}")

print("\n🧪 Testing individual imports...")

# Test config
try:
    from app.config import settings

    print("✅ settings imported successfully")
    print(f"   - STORAGE_DIR: {settings.STORAGE_DIR}")
    print(f"   - CACHE_EXPIRY_DAYS: {settings.CACHE_EXPIRY_DAYS}")
    print(f"   - CACHE_DEFAULT_EXPIRY: {settings.CACHE_DEFAULT_EXPIRY}")
except ImportError as e:
    print(f"❌ settings import failed: {e}")

# Test cache service
try:
    from app.infrastructure.cache.memory_cache import MemoryCacheService

    print("✅ MemoryCacheService imported successfully")

    # Try to create instance
    cache = MemoryCacheService(default_expiry=86400)
    print("✅ MemoryCacheService instance created successfully")
except Exception as e:
    print(f"❌ MemoryCacheService failed: {e}")

# Test storage service
try:
    from app.infrastructure.storage.json_storage import JsonStorageService

    print("✅ JsonStorageService imported successfully")
except ImportError as e:
    print(f"❌ JsonStorageService import failed: {e}")

# Test data fetcher
try:
    from app.infrastructure.data.data_fetcher import DataFetcherService

    print("✅ DataFetcherService imported successfully")

    # Try to create with cache
    try:
        from app.infrastructure.cache.memory_cache import MemoryCacheService

        cache = MemoryCacheService(default_expiry=86400)
        fetcher = DataFetcherService(cache_provider=cache, cache_expiry_days=1)
        print("✅ DataFetcherService instance created successfully")
    except Exception as e:
        print(f"❌ DataFetcherService instance creation failed: {e}")

except ImportError as e:
    print(f"❌ DataFetcherService import failed: {e}")

# Test portfolio manager
try:
    from app.infrastructure.data.portfolio_manager import PortfolioManagerService

    print("✅ PortfolioManagerService imported successfully")
except ImportError as e:
    print(f"❌ PortfolioManagerService import failed: {e}")

# Test analytics service
try:
    from app.core.services.analytics import AnalyticsService

    print("✅ AnalyticsService imported successfully")

    # Try to create instance
    analytics = AnalyticsService()
    print("✅ AnalyticsService instance created successfully")
except Exception as e:
    print(f"❌ AnalyticsService failed: {e}")

print("\n🎯 Test complete!")
print("If you see errors above, those need to be fixed before Streamlit will work.")