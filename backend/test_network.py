#!/usr/bin/env python3
"""
Test network connectivity
"""
import socket
import requests
import subprocess
import time


def test_port(host, port):
    """Test if port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        print(f"Error testing port: {e}")
        return False


def test_network():
    """Test network connectivity"""
    print("🌐 Testing network connectivity...")

    # Test if uvicorn server is running
    host = '127.0.0.1'
    port = 8000

    print(f"🔍 Testing connection to {host}:{port}")

    if test_port(host, port):
        print("✅ Port is open and accessible")
    else:
        print("❌ Port is not accessible")
        print("   Make sure uvicorn server is running")
        return

    # Test HTTP request
    try:
        print("🌐 Testing HTTP request...")
        response = requests.get(f"http://{host}:{port}/api/v1/health", timeout=10)
        print(f"✅ HTTP request successful: {response.status_code}")
        print(f"📄 Response: {response.text[:100]}...")
    except requests.exceptions.ConnectionError:
        print("❌ HTTP connection failed")
        print("   Check if server is actually listening on the port")
    except requests.exceptions.Timeout:
        print("❌ HTTP request timed out")
        print("   Server may be overloaded or blocking requests")
    except Exception as e:
        print(f"❌ HTTP request failed: {e}")

    # Test with different hosts
    hosts_to_test = ['127.0.0.1', 'localhost', '0.0.0.0']
    for test_host in hosts_to_test:
        try:
            print(f"🔍 Testing {test_host}:{port}")
            response = requests.get(f"http://{test_host}:{port}/", timeout=5)
            print(f"✅ {test_host} works: {response.status_code}")
        except Exception as e:
            print(f"❌ {test_host} failed: {type(e).__name__}")

    # Check if any process is using the port
    try:
        print("🔍 Checking what's using the port...")
        result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        for line in lines:
            if f':{port}' in line and 'LISTENING' in line:
                print(f"✅ Found process listening on port {port}:")
                print(f"   {line.strip()}")
                break
        else:
            print(f"❌ No process found listening on port {port}")
    except Exception as e:
        print(f"⚠️ Could not check port usage: {e}")

    # Browser recommendations
    print("\n🌐 Browser troubleshooting:")
    print("1. Try different browsers (Chrome, Firefox, Edge)")
    print("2. Try incognito/private mode")
    print("3. Clear browser cache")
    print("4. Disable browser extensions")
    print("5. Check browser proxy settings")

    # Windows firewall check
    print("\n🛡️ Windows Firewall check:")
    print("1. Open Windows Defender Firewall")
    print("2. Allow uvicorn.exe through firewall")
    print("3. Or temporarily disable firewall for testing")


if __name__ == "__main__":
    test_network()