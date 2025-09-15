from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///helio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))

# Initialize extensions
db = SQLAlchemy(app)
cors = CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))
jwt = JWTManager(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'patient' or 'doctor'
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
    languages = db.Column(db.String(255))  # Comma-separated
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

class Appointment(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('doctor.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    consultation_type = db.Column(db.String(20), default='video')  # video, phone, chat
    symptoms = db.Column(db.Text)
    notes = db.Column(db.Text)
    prescription_id = db.Column(db.String(36), db.ForeignKey('prescription.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Prescription(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('doctor.id'), nullable=False)
    appointment_id = db.Column(db.String(36), db.ForeignKey('appointment.id'))
    medicines = db.Column(db.Text)  # JSON string of medicines and dosages
    diagnosis = db.Column(db.Text)
    instructions = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_dispensed = db.Column(db.Boolean, default=False)

class DoctorSchedule(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = db.Column(db.String(36), db.ForeignKey('doctor.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True)

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            user_type=data['user_type']
        )
        db.session.add(user)
        db.session.commit()
        
        # Create user profile based on type
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
        
        # Generate access token
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
    """Deprecated in this build for username-only auth.
    This legacy module expects email in the DB. Use app_new.py (username-based)
    or app_demo.py (demo users). Returning 405 to avoid confusion.
    """
    return jsonify({'message': 'This server does not support username login. Start app_new.py or app_demo.py'}), 405

# Doctor Routes
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        search = request.args.get('search', '')
        specialty = request.args.get('specialty', '')
        
        query = db.session.query(Doctor, User).join(User).filter(User.is_active == True)
        
        if search:
            query = query.filter(Doctor.name.ilike(f'%{search}%'))
        if specialty:
            query = query.filter(Doctor.specialty.ilike(f'%{specialty}%'))
        
        doctors = query.all()
        
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
                'total_consultations': doctor.total_consultations,
                'profile_image': doctor.profile_image
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch doctors', 'error': str(e)}), 500

@app.route('/api/doctors/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        
        return jsonify({
            'id': doctor.id,
            'name': doctor.name,
            'specialty': doctor.specialty,
            'qualifications': doctor.qualifications,
            'experience_years': doctor.experience_years,
            'phone': doctor.phone,
            'consultation_fee': doctor.consultation_fee,
            'is_available': doctor.is_available,
            'languages': doctor.languages,
            'rating': doctor.rating,
            'total_consultations': doctor.total_consultations,
            'profile_image': doctor.profile_image
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Doctor not found', 'error': str(e)}), 404

# Medicine Routes
@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    try:
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        low_stock = request.args.get('low_stock', 'false').lower() == 'true'
        
        query = Medicine.query
        
        if search:
            query = query.filter(
                db.or_(
                    Medicine.name.ilike(f'%{search}%'),
                    Medicine.generic_name.ilike(f'%{search}%')
                )
            )
        if category:
            query = query.filter(Medicine.category == category)
        if low_stock:
            query = query.filter(Medicine.stock_quantity < 10)
        
        medicines = query.all()
        
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
                'expiry_date': medicine.expiry_date.isoformat() if medicine.expiry_date else None,
                'category': medicine.category,
                'description': medicine.description,
                'requires_prescription': medicine.requires_prescription
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch medicines', 'error': str(e)}), 500

# Appointment Routes
@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Get filter parameters
        doctor_id = request.args.get('doctor_id')
        date = request.args.get('date')
        status = request.args.get('status')
        
        query = Appointment.query
        
        # Filter by user type
        if user.user_type == 'patient':
            patient = Patient.query.filter_by(user_id=user_id).first()
            if patient:
                query = query.filter(Appointment.patient_id == patient.id)
        elif user.user_type == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user_id).first()
            if doctor:
                query = query.filter(Appointment.doctor_id == doctor.id)
        
        # Apply filters
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if date:
            query = query.filter(db.func.date(Appointment.appointment_date) == date)
        if status:
            query = query.filter(Appointment.status == status)
        
        appointments = query.all()
        
        result = []
        for appointment in appointments:
            patient = Patient.query.get(appointment.patient_id)
            doctor = Doctor.query.get(appointment.doctor_id)
            
            result.append({
                'id': appointment.id,
                'patient_name': patient.name if patient else 'Unknown',
                'doctor_name': doctor.name if doctor else 'Unknown',
                'doctor_specialty': doctor.specialty if doctor else '',
                'appointment_date': appointment.appointment_date.isoformat(),
                'duration_minutes': appointment.duration_minutes,
                'status': appointment.status,
                'consultation_type': appointment.consultation_type,
                'symptoms': appointment.symptoms,
                'notes': appointment.notes
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch appointments', 'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get patient ID
        patient = Patient.query.filter_by(user_id=user_id).first()
        if not patient:
            return jsonify({'message': 'Patient profile not found'}), 404
        
        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=data['doctor_id'],
            appointment_date=datetime.strptime(data['appointment_date'], '%Y-%m-%dT%H:%M:%S'),
            duration_minutes=data.get('duration_minutes', 30),
            consultation_type=data.get('consultation_type', 'video'),
            symptoms=data.get('symptoms', ''),
            notes=data.get('notes', '')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment_id': appointment.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create appointment', 'error': str(e)}), 500

@app.route('/api/appointments/slots', methods=['GET'])
def get_available_slots():
    try:
        doctor_id = request.args.get('doctor_id')
        date = request.args.get('date')
        
        if not doctor_id or not date:
            return jsonify({'message': 'doctor_id and date are required'}), 400
        
        # Get existing appointments for the date
        appointments = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            db.func.date(Appointment.appointment_date) == date,
            Appointment.status != 'cancelled'
        ).all()
        
        # Generate available slots (9 AM to 5 PM, 30-minute slots)
        slots = []
        start_hour = 9
        end_hour = 17
        
        for hour in range(start_hour, end_hour):
            for minute in [0, 30]:
                slot_time = f"{hour:02d}:{minute:02d}"
                
                # Check if slot is booked
                is_booked = any(
                    apt.appointment_date.time().replace(second=0, microsecond=0) == 
                    datetime.strptime(slot_time, '%H:%M').time()
                    for apt in appointments
                )
                
                slots.append({
                    'time': slot_time,
                    'available': not is_booked
                })
        
        return jsonify(slots), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch available slots', 'error': str(e)}), 500

# Sample data creation function
def create_sample_data():
    """Create sample data for demonstration"""
    try:
        # Check if data already exists
        if User.query.first():
            return
        
        # Create sample users and profiles
        demo_users = [
            {
                'email': 'patient@demo.com',
                'password': 'password123',
                'user_type': 'patient',
                'profile': {
                    'name': 'Rajesh Kumar',
                    'age': 35,
                    'gender': 'male',
                    'phone': '+91 98765 43210',
                    'address': 'Village Nabha, District Patiala, Punjab',
                    'blood_group': 'B+'
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
                patient = Patient(
                    user_id=user.id,
                    **user_data['profile']
                )
                db.session.add(patient)
            else:
                doctor = Doctor(
                    user_id=user.id,
                    **user_data['profile']
                )
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
                'description': 'Pain reliever and fever reducer',
                'expiry_date': datetime(2025, 12, 31).date()
            },
            {
                'name': 'Amoxicillin 250mg',
                'generic_name': 'Amoxicillin',
                'manufacturer': 'Sun Pharma',
                'price': 85.00,
                'stock_quantity': 8,
                'category': 'Antibiotics',
                'description': 'Antibiotic for bacterial infections',
                'expiry_date': datetime(2024, 8, 15).date()
            },
            {
                'name': 'Cetirizine 10mg',
                'generic_name': 'Cetirizine HCl',
                'manufacturer': 'Dr. Reddy\'s',
                'price': 45.00,
                'stock_quantity': 0,
                'category': 'Antihistamines',
                'description': 'Allergy relief medication',
                'expiry_date': datetime(2025, 3, 20).date()
            }
        ]
        
        for med_data in sample_medicines:
            medicine = Medicine(**med_data)
            db.session.add(medicine)
        
        db.session.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {e}")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5000)