#!/usr/bin/env python3
"""
Backend test script
Tests backend connectivity and endpoints
Сохранить как: backend/test_backend.py
"""
import requests
import json
import sys
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"


def test_endpoint(url: str, method: str = "GET", data: Dict[Any, Any] = None, timeout: int = 10) -> Dict[str, Any]:
    """Test a single endpoint"""
    print(f"🧪 Testing {method} {url}")

    try:
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        elif method == "POST":
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        else:
            return {"success": False, "error": f"Unsupported method: {method}"}

        return {
            "success": True,
            "status_code": response.status_code,
            "response": response.text[:200] + "..." if len(response.text) > 200 else response.text,
            "headers": dict(response.headers)
        }

    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Connection refused - server not running?"}
    except requests.exceptions.Timeout:
        return {"success": False, "error": f"Request timed out after {timeout}s"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    """Main test function"""
    print("🚀 Backend API Test Script")
    print("=" * 50)

    # Test basic connectivity
    print("\n📡 Testing basic connectivity...")
    health_result = test_endpoint(f"{BASE_URL}{API_PREFIX}/health")

    if not health_result["success"]:
        print(f"❌ Health check failed: {health_result['error']}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure backend server is running: uvicorn app.main:app --reload")
        print("2. Check if port 8000 is available")
        print("3. Verify no firewall blocking the port")
        return False

    print(f"✅ Health check passed: {health_result['status_code']}")

    # Test portfolios endpoint
    print("\n📁 Testing portfolios endpoint...")
    portfolios_result = test_endpoint(f"{BASE_URL}{API_PREFIX}/portfolios")

    if portfolios_result["success"]:
        print(f"✅ Portfolios endpoint working: {portfolios_result['status_code']}")
    else:
        print(f"❌ Portfolios endpoint failed: {portfolios_result['error']}")

    # Test analytics endpoints
    print("\n📊 Testing analytics endpoints...")

    # Sample request data for analytics
    sample_analytics_request = {
        "portfolio_id": "test_portfolio",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31"
    }

    analytics_endpoints = [
        "/analytics/performance",
        "/analytics/risk",
        "/analytics/cumulative-returns",
        "/analytics/drawdowns"
    ]

    analytics_results = {}
    for endpoint in analytics_endpoints:
        result = test_endpoint(
            f"{BASE_URL}{API_PREFIX}{endpoint}",
            method="POST",
            data=sample_analytics_request
        )
        analytics_results[endpoint] = result

        if result["success"]:
            if result["status_code"] in [200, 201]:
                print(f"✅ {endpoint}: Working ({result['status_code']})")
            elif result["status_code"] in [404, 422]:
                print(f"⚠️ {endpoint}: Endpoint exists but data issue ({result['status_code']})")
            else:
                print(f"❓ {endpoint}: Unexpected status ({result['status_code']})")
        else:
            print(f"❌ {endpoint}: {result['error']}")

    # Test CORS headers
    print("\n🌐 Testing CORS headers...")
    if health_result["success"]:
        cors_headers = health_result.get("headers", {})
        access_control_origin = cors_headers.get("access-control-allow-origin")

        if access_control_origin:
            print(f"✅ CORS headers present: {access_control_origin}")
        else:
            print("❌ CORS headers missing")
            print("Available headers:", list(cors_headers.keys()))

    # Summary
    print("\n📋 Test Summary:")
    print("=" * 30)

    if health_result["success"]:
        print("✅ Backend server is running")
    else:
        print("❌ Backend server is not accessible")

    if portfolios_result["success"]:
        print("✅ Portfolios API working")
    else:
        print("❌ Portfolios API not working")

    working_analytics = sum(1 for r in analytics_results.values() if r["success"])
    total_analytics = len(analytics_results)
    print(f"📊 Analytics endpoints: {working_analytics}/{total_analytics} working")

    # Show failed endpoints
    failed_endpoints = [
        endpoint for endpoint, result in analytics_results.items()
        if not result["success"]
    ]

    if failed_endpoints:
        print(f"\n❌ Failed analytics endpoints:")
        for endpoint in failed_endpoints:
            print(f"   {endpoint}: {analytics_results[endpoint]['error']}")

    return health_result["success"]


if __name__ == "__main__":
    success = main()

    if not success:
        print("\n🔧 Next steps:")
        print("1. Start backend server: cd backend && uvicorn app.main:app --reload")
        print("2. Check server logs for errors")
        print("3. Verify all dependencies installed")
        print("4. Check .env configuration")

        sys.exit(1)
    else:
        print("\n🎉 Backend test completed successfully!")
        sys.exit(0)