from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import uuid
import sqlite3

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

# Configuration for single-server deployment
app.config['SECRET_KEY'] = 'helio-production-secret-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///helio_production.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'helio-jwt-production-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16777216

# Initialize extensions
db = SQLAlchemy(app)
cors = CORS(app)
jwt = JWTManager(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models (same as before)
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Doctor(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    qualifications = db.Column(db.Text)
    experience_years = db.Column(db.Integer)
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(255))
    consultation_fee = db.Column(db.Float, default=0.0)
    is_available = db.Column(db.Boolean, default=True)
    languages = db.Column(db.String(255))
    rating = db.Column(db.Float, default=0.0)
    total_consultations = db.Column(db.Integer, default=0)

class Patient(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    emergency_contact = db.Column(db.String(20))
    blood_group = db.Column(db.String(5))
    allergies = db.Column(db.Text)
    medical_history = db.Column(db.Text)

class Medicine(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    generic_name = db.Column(db.String(100))
    manufacturer = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    expiry_date = db.Column(db.Date)
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    requires_prescription = db.Column(db.Boolean, default=True)

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve React frontend
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    try:
        return send_from_directory(app.static_folder, path)
    except:
        return send_from_directory(app.static_folder, 'index.html')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Helio telemedicine app is running',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            user_type=data['user_type']
        )
        db.session.add(user)
        db.session.commit()
        
        if data['user_type'] == 'doctor':
            doctor = Doctor(
                user_id=user.id,
                name=data['name'],
                specialty=data.get('specialty', ''),
                qualifications=data.get('qualifications', ''),
                phone=data.get('phone', '')
            )
            db.session.add(doctor)
        else:
            patient = Patient(
                user_id=user.id,
                name=data['name'],
                age=data.get('age'),
                gender=data.get('gender'),
                phone=data.get('phone', '')
            )
            db.session.add(patient)
        
        db.session.commit()
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user_type': user.user_type
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user_type': user.user_type
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

# Doctor Routes
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = db.session.query(Doctor, User).join(User).filter(User.is_active == True).all()
        result = []
        for doctor, user in doctors:
            result.append({
                'id': doctor.id,
                'name': doctor.name,
                'specialty': doctor.specialty,
                'qualifications': doctor.qualifications,
                'experience_years': doctor.experience_years,
                'consultation_fee': doctor.consultation_fee,
                'is_available': doctor.is_available,
                'languages': doctor.languages,
                'rating': doctor.rating,
                'total_consultations': doctor.total_consultations
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch doctors', 'error': str(e)}), 500

# Medicine Routes
@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    try:
        medicines = Medicine.query.all()
        result = []
        for medicine in medicines:
            stock_status = 'Low Stock' if medicine.stock_quantity < 10 else 'In Stock'
            if medicine.stock_quantity == 0:
                stock_status = 'Out of Stock'
            
            result.append({
                'id': medicine.id,
                'name': medicine.name,
                'generic_name': medicine.generic_name,
                'manufacturer': medicine.manufacturer,
                'price': medicine.price,
                'stock_quantity': medicine.stock_quantity,
                'stock_status': stock_status,
                'category': medicine.category,
                'description': medicine.description,
                'requires_prescription': medicine.requires_prescription
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch medicines', 'error': str(e)}), 500

def create_sample_data():
    """Create sample data for demonstration"""
    try:
        if User.query.first():
            return
        
        # Create demo users
        demo_users = [
            {
                'email': 'patient@demo.com',
                'password': 'password123',
                'user_type': 'patient',
                'profile': {
                    'name': 'Rajesh Kumar',
                    'age': 35,
                    'gender': 'male',
                    'phone': '+91 98765 43210'
                }
            },
            {
                'email': 'doctor@demo.com',
                'password': 'password123',
                'user_type': 'doctor',
                'profile': {
                    'name': 'Dr. Priya Sharma',
                    'specialty': 'Pediatrics',
                    'qualifications': 'MBBS, MD Pediatrics',
                    'experience_years': 10,
                    'consultation_fee': 400.0,
                    'languages': 'English, Hindi'
                }
            }
        ]
        
        for user_data in demo_users:
            user = User(
                email=user_data['email'],
                password_hash=generate_password_hash(user_data['password']),
                user_type=user_data['user_type']
            )
            db.session.add(user)
            db.session.flush()
            
            if user_data['user_type'] == 'patient':
                patient = Patient(user_id=user.id, **user_data['profile'])
                db.session.add(patient)
            else:
                doctor = Doctor(user_id=user.id, **user_data['profile'])
                db.session.add(doctor)
        
        # Create sample medicines
        sample_medicines = [
            {
                'name': 'Paracetamol 500mg',
                'generic_name': 'Acetaminophen',
                'manufacturer': 'Cipla Ltd',
                'price': 25.50,
                'stock_quantity': 150,
                'category': 'Pain Relief',
                'description': 'Pain reliever and fever reducer'
            },
            {
                'name': 'Amoxicillin 250mg',
                'generic_name': 'Amoxicillin',
                'manufacturer': 'Sun Pharma',
                'price': 85.00,
                'stock_quantity': 8,
                'category': 'Antibiotics',
                'description': 'Antibiotic for bacterial infections'
            }
        ]
        
        for med_data in sample_medicines:
            medicine = Medicine(**med_data)
            db.session.add(medicine)
        
        db.session.commit()
        print("✅ Sample data created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating sample data: {e}")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)