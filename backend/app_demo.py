from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import json
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))

# Initialize extensions
cors = CORS(app, 
    origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)
jwt = JWTManager(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# In-memory storage for prescription requests (in a real app, this would be in a database)
PRESCRIPTION_REQUESTS = []

# Demo users data (for testing without database)
DEMO_USERS = {
    'p001': {
        'id': 1,
        'username': 'p001',
        'password_hash': bcrypt.hashpw('patient123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
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
        'password_hash': bcrypt.hashpw('patient123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
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
        'password_hash': bcrypt.hashpw('doctor123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
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
        'password_hash': bcrypt.hashpw('doctor123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
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
        'password_hash': bcrypt.hashpw('pharmacy123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        'role': 'pharmacist',
        'profile': {
            'pharmacy_name': 'MedPlus Pharmacy',
            'owner_name': 'Ramesh Gupta',
            'pharmacy_id': 'pm001',
            'phone': '9876543230'
        }
    },
    'pm002': {
        'id': 6,
        'username': 'pm002',
        'password_hash': bcrypt.hashpw('pharmacy123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        'role': 'pharmacist',
        'profile': {
            'pharmacy_name': 'Apollo Pharmacy',
            'owner_name': 'Sunita Patel',
            'pharmacy_id': 'pm002',
            'phone': '9876543231'
        }
    }
}

# Helper functions
def check_password(password, hashed):
    """Check if password matches the hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authentication Routes
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """Role-based login with username/password"""
    if request.method == 'OPTIONS':
        # Handle preflight request
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
        
        if not check_password(password, user['password_hash']):
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

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        
        # Find user by ID
        for username, user_data in DEMO_USERS.items():
            if user_data['id'] == user_id:
                return jsonify({
                    'user': {
                        'id': user_data['id'],
                        'username': user_data['username'],
                        'role': user_data['role']
                    }
                }), 200
        
        return jsonify({'message': 'User not found'}), 404
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Demo data endpoints
@app.route('/api/patient/profile', methods=['GET'])
@jwt_required()
def get_patient_profile():
    """Get patient profile"""
    try:
        user_id = get_jwt_identity()
        
        # Find user by ID
        for username, user_data in DEMO_USERS.items():
            if user_data['id'] == user_id and user_data['role'] == 'patient':
                return jsonify({'patient': user_data['profile']}), 200
        
        return jsonify({'message': 'Patient profile not found'}), 404
        
    except Exception as e:
        print(f"Get patient profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/patient/appointments', methods=['GET'])
@jwt_required()
def get_patient_appointments():
    """Get patient's appointments"""
    return jsonify({'appointments': [
        {
            'id': 1,
            'doctor_name': 'Dr. Rajesh Kumar',
            'specialization': 'Cardiology',
            'appointment_date': '2024-12-20',
            'appointment_time': '10:00',
            'status': 'scheduled',
            'chief_complaint': 'Chest pain'
        }
    ]}), 200

@app.route('/api/patient/medicines', methods=['GET'])
@jwt_required()
def get_patient_medicines():
    """Get patient's prescribed medicines"""
    return jsonify({'medicines': [
        {
            'medicine_name': 'Paracetamol',
            'dosage': '1 tablet',
            'frequency': 'twice daily',
            'duration': '7 days',
            'doctor_name': 'Dr. Rajesh Kumar',
            'prescription_date': '2024-12-15'
        }
    ]}), 200

@app.route('/api/doctor/profile', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    """Get doctor profile"""
    try:
        user_id = get_jwt_identity()
        
        # Find user by ID
        for username, user_data in DEMO_USERS.items():
            if user_data['id'] == user_id and user_data['role'] == 'doctor':
                return jsonify({'doctor': user_data['profile']}), 200
        
        return jsonify({'message': 'Doctor profile not found'}), 404
        
    except Exception as e:
        print(f"Get doctor profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/pharmacy/profile', methods=['GET'])
@jwt_required()
def get_pharmacy_profile():
    """Get pharmacy profile"""
    try:
        user_id = get_jwt_identity()
        
        # Find user by ID
        for username, user_data in DEMO_USERS.items():
            if user_data['id'] == user_id and user_data['role'] == 'pharmacist':
                return jsonify({'pharmacy': user_data['profile']}), 200
        
        return jsonify({'message': 'Pharmacy profile not found'}), 404
        
    except Exception as e:
        print(f"Get pharmacy profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# File Upload Route
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload prescription image files"""
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'document')
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to prevent filename conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Return the absolute file URL (ensures frontend can load image regardless of origin)
            try:
                file_url = url_for('uploaded_file', filename=filename, _external=True)
            except Exception:
                # Fallback to relative path if building absolute URL fails
                file_url = f'/uploads/{filename}'
            
            return jsonify({
                'message': 'File uploaded successfully',
                'fileUrl': file_url,
                'filename': filename
            }), 200
        else:
            return jsonify({'message': 'Invalid file type'}), 400
            
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'message': 'Upload failed', 'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Prescription Request Routes
@app.route('/api/prescription-requests', methods=['POST'])
@jwt_required()
def create_prescription_request():
    """Create a new prescription request"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Find user
        user = None
        for username, user_data in DEMO_USERS.items():
            if user_data['id'] == user_id:
                user = user_data
                break
        
        if not user or user['role'] != 'patient':
            return jsonify({'message': 'Only patients can create prescription requests'}), 403
        
        # Create prescription request
        prescription_request = {
            'id': str(uuid.uuid4()),
            'patientId': user['id'],
            'patientName': f"{user['profile']['first_name']} {user['profile']['last_name']}",
            'prescriptionImageUrl': data['prescriptionImageUrl'],
            'notes': data.get('notes', ''),
            'status': 'pending',
            'createdAt': datetime.now().isoformat(),
            'processedAt': None,
            'processedBy': None
        }
        
        PRESCRIPTION_REQUESTS.append(prescription_request)
        
        return jsonify({
            'message': 'Prescription request created successfully',
            'request_id': prescription_request['id']
        }), 201
        
    except Exception as e:
        print(f"Create prescription request error: {e}")
        return jsonify({'message': 'Failed to create prescription request', 'error': str(e)}), 500

@app.route('/api/prescription-requests', methods=['GET'])
def get_prescription_requests():
    """Get all prescription requests"""
    try:
        # Filter pending requests
        pending_requests = [req for req in PRESCRIPTION_REQUESTS if req['status'] == 'pending']
        
        return jsonify(pending_requests), 200
        
    except Exception as e:
        print(f"Get prescription requests error: {e}")
        return jsonify({'message': 'Failed to fetch prescription requests', 'error': str(e)}), 500

@app.route('/api/prescription-requests/<request_id>/status', methods=['PUT'])
def update_prescription_request_status(request_id):
    """Update prescription request status"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        processed_by = data.get('processedBy', 'Pharmacist')
        
        if new_status not in ['approved', 'rejected']:
            return jsonify({'message': 'Invalid status'}), 400
        
        # Find and update the request
        for req in PRESCRIPTION_REQUESTS:
            if req['id'] == request_id:
                req['status'] = new_status
                req['processedAt'] = datetime.now().isoformat()
                req['processedBy'] = processed_by
                
                return jsonify({'message': 'Prescription request status updated successfully'}), 200
        
        return jsonify({'message': 'Prescription request not found'}), 404
        
    except Exception as e:
        print(f"Update prescription request error: {e}")
        return jsonify({'message': 'Failed to update prescription request status', 'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'database': 'demo_mode'}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🏥 Starting Helio Healthcare Backend (Demo Mode)...")
    print("📋 Login Credentials:")
    print("Patients: p001, p002 (password: patient123)")
    print("Doctors: d001, d002 (password: doctor123)")
    print("Pharmacists: pm001, pm002 (password: pharmacy123)")
    print("🔧 Note: Running in demo mode without database")
    app.run(debug=True, host='0.0.0.0', port=5000)