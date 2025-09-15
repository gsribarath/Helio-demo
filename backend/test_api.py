import requests
import json

# Test the login endpoint with demo credentials
def test_login():
    url = "http://localhost:5000/api/auth/login"
    
    # Test cases for different user types
    test_users = [
        {"username": "p001", "password": "patient123", "role": "patient"},
        {"username": "d001", "password": "doctor123", "role": "doctor"},
        {"username": "pm001", "password": "pharmacy123", "role": "pharmacist"}
    ]
    
    for user in test_users:
        print(f"\n🧪 Testing {user['role']} login: {user['username']}")
        data = {
            "username": user["username"],
            "password": user["password"]
        }
        
        try:
            response = requests.post(url, json=data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Login successful!")
                print(f"Token: {result.get('token', 'N/A')[:50]}...")
                print(f"User Role: {result.get('user', {}).get('role', 'N/A')}")
                print(f"User ID: {result.get('user', {}).get('id', 'N/A')}")
                return result.get('token')
            else:
                try:
                    error_response = response.json()
                    print(f"❌ Login failed: {error_response}")
                except:
                    print(f"❌ Login failed with status {response.status_code}")
                    
        except Exception as e:
            print(f"🚨 Error: {e}")
    
    return None

# Test the health endpoint (for demo backend)
def test_health():
    url = "http://localhost:5000/api/health"
    try:
        response = requests.get(url)
        print(f"Health Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Health Response: {response.json()}")
        else:
            print(f"⚠️ Health Response: {response.text}")
    except Exception as e:
        print(f"🚨 Health Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing Helio Backend API (Demo Mode)")
    print("=" * 50)
    
    # Test health endpoint
    print("\n📊 Testing Health Endpoint...")
    test_health()
    
    # Test login
    print("\n🔐 Testing Login Endpoints...")
    token = test_login()
    
    if token:
        print(f"\n✅ At least one login test passed!")
    else:
        print(f"\n❌ All login tests failed!")
        
    print("\n🏁 Test completed!")