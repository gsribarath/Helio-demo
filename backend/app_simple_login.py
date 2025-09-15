from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

CORS(app, origins=['http://localhost:3000'])
jwt = JWTManager(app)

# Demo users - simplified (no bcrypt needed)
USERS = {
    'p001': {'id': 1, 'username': 'p001', 'password': 'patient123', 'role': 'patient'},
    'p002': {'id': 2, 'username': 'p002', 'password': 'patient123', 'role': 'patient'},
    'p003': {'id': 3, 'username': 'p003', 'password': 'patient123', 'role': 'patient'},
    'd001': {'id': 4, 'username': 'd001', 'password': 'doctor123', 'role': 'doctor'},
    'd002': {'id': 5, 'username': 'd002', 'password': 'doctor123', 'role': 'doctor'},
    'd003': {'id': 6, 'username': 'd003', 'password': 'doctor123', 'role': 'doctor'},
    'pm001': {'id': 7, 'username': 'pm001', 'password': 'pharmacy123', 'role': 'pharmacist'},
    'pm002': {'id': 8, 'username': 'pm002', 'password': 'pharmacy123', 'role': 'pharmacist'},
    'pm003': {'id': 9, 'username': 'pm003', 'password': 'pharmacy123', 'role': 'pharmacist'},
}

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password required'}), 400
        
        user = USERS.get(username)
        if not user or user['password'] != password:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        token = create_access_token(identity=user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role'],
                'profile': {'first_name': user['username'].upper()}
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    print("🏥 Starting Helio Backend (Simple Demo Mode)")
    print("📋 Login Credentials:")
    print("Patients: p001, p002, p003 (password: patient123)")
    print("Doctors: d001, d002, d003 (password: doctor123)")
    print("Pharmacists: pm001, pm002, pm003 (password: pharmacy123)")
    print("🚀 Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)