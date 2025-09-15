import requests
import json

# Test login with the new database backend
url = "http://localhost:5000/api/auth/login"
data = {
    "username": "p001",
    "password": "patient123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ LOGIN SUCCESS! Database backend is working.")
    else:
        print("❌ Login failed")
        
except Exception as e:
    print(f"❌ Error: {e}")