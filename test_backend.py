#!/usr/bin/env python3
"""Script simple para probar el backend localmente."""

import requests
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("\n=== Testing /api/health ===")
    try:
        resp = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_upload_csv():
    """Test uploading a simple CSV."""
    print("\n=== Testing /api/datasets/upload ===")
    
    # Create a simple test CSV
    csv_content = "name,age,city\nAlice,30,NYC\nBob,25,LA\nCharlie,35,Chicago\n"
    
    try:
        files = {'file': ('test_data.csv', csv_content, 'text/csv')}
        data = {'provider': 'gemini'}
        
        print(f"Sending {len(csv_content)} bytes...")
        resp = requests.post(
            f"{BASE_URL}/api/datasets/upload",
            files=files,
            data=data,
            timeout=60
        )
        
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            result = resp.json()
            print(f"SUCCESS! ID: {result.get('id')}")
            print(f"Status: {result.get('status')}")
            print(f"Insights preview: {result.get('insights', '')[:100]}...")
            return True
        else:
            print(f"ERROR: {resp.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("="*50)
    print("BACKEND TEST SCRIPT")
    print("="*50)
    print(f"Base URL: {BASE_URL}")
    
    # Test health
    if not test_health():
        print("\n❌ Health check failed. Is the server running?")
        print("Run: cd backend && python main.py")
        sys.exit(1)
    
    # Test upload
    if test_upload_csv():
        print("\n✅ UPLOAD TEST PASSED!")
    else:
        print("\n❌ UPLOAD TEST FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
