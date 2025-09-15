from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
CORS(app, origins=['http://localhost:3000'])
jwt = JWTManager(app)

# Simple demo users (no bcrypt for now)
DEMO_USERS = {
    'p001': {
        'id': 1,
        'username': 'p001',
        'password': 'patient123',
        'role': 'patient',
        'profile': {
            'first_name': 'John',
            'last_name': 'Doe',
            'patient_id': 'p001',
            'phone': '9876543210',
            'email': 'john.doe@email.com'
        }
    },
    'p002': {
        'id': 2,
        'username': 'p002',
        'password': 'patient123',
        'role': 'patient',
        'profile': {
            'first_name': 'Sarah',
            'last_name': 'Smith',
            'patient_id': 'p002',
            'phone': '9876543212',
            'email': 'sarah.smith@email.com'
        }
    },
    'd001': {
        'id': 3,
        'username': 'd001',
        'password': 'doctor123',
        'role': 'doctor',
        'profile': {
            'first_name': 'Dr. Rajesh',
            'last_name': 'Kumar',
            'doctor_id': 'd001',
            'specialization': 'Cardiology',
            'clinic_name': 'Heart Care Clinic'
        }
    },
    'd002': {
        'id': 4,
        'username': 'd002',
        'password': 'doctor123',
        'role': 'doctor',
        'profile': {
            'first_name': 'Dr. Priya',
            'last_name': 'Sharma',
            'doctor_id': 'd002',
            'specialization': 'Pediatrics',
            'clinic_name': 'Child Care Clinic'
        }
    },
    'pm001': {
        'id': 5,
        'username': 'pm001',
        'password': 'pharmacy123',
        'role': 'pharmacist',
        'profile': {
            'pharmacy_name': 'MedPlus Pharmacy',
            'owner_name': 'Ramesh Gupta',
            'pharmacy_id': 'pm001',
            'phone': '9876543230'
        }
    }
}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Helio Backend is running'}), 200

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS')
        return response, 200
    
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password required'}), 400
        
        # Check demo users
        user = DEMO_USERS.get(username)
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if password != user['password']:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Create JWT token
        token = create_access_token(
            identity=user['id'],
            additional_claims={
                'username': user['username'],
                'role': user['role']
            }
        )
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role'],
                'profile': user['profile']
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🏥 Starting Helio Healthcare Backend (Simple Demo Mode)...")
    print("📋 Login Credentials:")
    print("Patients: p001, p002 (password: patient123)")
    print("Doctors: d001, d002 (password: doctor123)")
    print("Pharmacists: pm001, pm002 (password: pharmacy123)")
    print("🔧 Note: Running in simple demo mode")
    app.run(host='0.0.0.0', port=5000, debug=True)