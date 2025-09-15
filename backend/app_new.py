from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid
import json

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

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'helio'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'gsribarath'),
    'port': os.getenv('DB_PORT', '5432')
}

# Initialize extensions
cors = CORS(app, 
    origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)
jwt = JWTManager(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database connection helper
def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        return None

# Helper functions
def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    """Check if password matches the hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authentication Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Role-based login with username/password"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'message': 'Database connection error'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get user credentials
        cursor.execute(
            "SELECT id, username, password_hash, role, is_active FROM login_table WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        
        if not user or not user['is_active']:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not check_password(password, user['password_hash']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Update last login
        cursor.execute(
            "UPDATE login_table SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
            (user['id'],)
        )
        
        # Get user profile based on role
        profile_data = {}
        if user['role'] == 'patient':
            cursor.execute(
                "SELECT * FROM patients_table WHERE login_id = %s",
                (user['id'],)
            )
            profile = cursor.fetchone()
            if profile:
                profile_data = dict(profile)
        elif user['role'] == 'doctor':
            cursor.execute(
                "SELECT * FROM doctors_table WHERE login_id = %s",
                (user['id'],)
            )
            profile = cursor.fetchone()
            if profile:
                profile_data = dict(profile)
        elif user['role'] == 'pharmacist':
            cursor.execute(
                "SELECT * FROM pharmacies_table WHERE login_id = %s",
                (user['id'],)
            )
            profile = cursor.fetchone()
            if profile:
                profile_data = dict(profile)
        
        conn.commit()
        conn.close()
        
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
                'profile': profile_data
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
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'message': 'Database connection error'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            "SELECT id, username, role FROM login_table WHERE id = %s AND is_active = TRUE",
            (user_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        conn.close()
        return jsonify({'user': dict(user)}), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Patient Routes
@app.route('/api/patient/profile', methods=['GET'])
@jwt_required()
def get_patient_profile():
    """Get patient profile"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT p.*, l.username 
            FROM patients_table p 
            JOIN login_table l ON p.login_id = l.id 
            WHERE p.login_id = %s
        """, (user_id,))
        
        patient = cursor.fetchone()
        conn.close()
        
        if not patient:
            return jsonify({'message': 'Patient profile not found'}), 404
        
        return jsonify({'patient': dict(patient)}), 200
        
    except Exception as e:
        print(f"Get patient profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/patient/appointments', methods=['GET'])
@jwt_required()
def get_patient_appointments():
    """Get patient's appointments"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get patient ID first
        cursor.execute("SELECT id FROM patients_table WHERE login_id = %s", (user_id,))
        patient = cursor.fetchone()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        cursor.execute("""
            SELECT a.*, 
                   d.first_name || ' ' || d.last_name as doctor_name,
                   d.specialization,
                   d.clinic_name
            FROM appointments_table a
            JOIN doctors_table d ON a.doctor_id = d.id
            WHERE a.patient_id = %s
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        """, (patient['id'],))
        
        appointments = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts and format dates
        result = []
        for apt in appointments:
            apt_dict = dict(apt)
            if apt_dict['appointment_date']:
                apt_dict['appointment_date'] = apt_dict['appointment_date'].isoformat()
            if apt_dict['appointment_time']:
                apt_dict['appointment_time'] = str(apt_dict['appointment_time'])
            result.append(apt_dict)
        
        return jsonify({'appointments': result}), 200
        
    except Exception as e:
        print(f"Get patient appointments error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/patient/medicines', methods=['GET'])
@jwt_required()
def get_patient_medicines():
    """Get patient's prescribed medicines"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get patient ID first
        cursor.execute("SELECT id FROM patients_table WHERE login_id = %s", (user_id,))
        patient = cursor.fetchone()
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        
        cursor.execute("""
            SELECT p.prescription_id, p.prescription_date, p.diagnosis,
                   pi.medicine_name, pi.strength, pi.dosage, pi.frequency, 
                   pi.duration, pi.timing, pi.special_instructions,
                   d.first_name || ' ' || d.last_name as doctor_name,
                   d.clinic_name
            FROM prescriptions_table p
            JOIN prescription_items_table pi ON p.id = pi.prescription_id
            JOIN doctors_table d ON p.doctor_id = d.id
            WHERE p.patient_id = %s AND p.is_active = TRUE
            ORDER BY p.prescription_date DESC
        """, (patient['id'],))
        
        medicines = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts and format dates
        result = []
        for med in medicines:
            med_dict = dict(med)
            if med_dict['prescription_date']:
                med_dict['prescription_date'] = med_dict['prescription_date'].isoformat()
            result.append(med_dict)
        
        return jsonify({'medicines': result}), 200
        
    except Exception as e:
        print(f"Get patient medicines error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Doctor Routes
@app.route('/api/doctor/profile', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    """Get doctor profile"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT d.*, l.username 
            FROM doctors_table d 
            JOIN login_table l ON d.login_id = l.id 
            WHERE d.login_id = %s
        """, (user_id,))
        
        doctor = cursor.fetchone()
        conn.close()
        
        if not doctor:
            return jsonify({'message': 'Doctor profile not found'}), 404
        
        return jsonify({'doctor': dict(doctor)}), 200
        
    except Exception as e:
        print(f"Get doctor profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/doctor/availability', methods=['PUT'])
@jwt_required()
def update_doctor_availability():
    """Update doctor availability status"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['available', 'not_available', 'on_call', 'offline']:
            return jsonify({'message': 'Invalid status'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE doctors_table SET availability_status = %s WHERE login_id = %s",
            (status, user_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Availability updated successfully'}), 200
        
    except Exception as e:
        print(f"Update availability error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/doctor/appointments', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    """Get doctor's appointments"""
    try:
        user_id = get_jwt_identity()
        date_filter = request.args.get('date', 'today')  # today, week, all
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get doctor ID first
        cursor.execute("SELECT id FROM doctors_table WHERE login_id = %s", (user_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            return jsonify({'message': 'Doctor not found'}), 404
        
        # Build query based on date filter
        date_condition = ""
        if date_filter == 'today':
            date_condition = "AND a.appointment_date = CURRENT_DATE"
        elif date_filter == 'week':
            date_condition = "AND a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
        
        cursor.execute(f"""
            SELECT a.*, 
                   p.first_name || ' ' || p.last_name as patient_name,
                   p.phone as patient_phone,
                   p.age,
                   p.gender
            FROM appointments_table a
            JOIN patients_table p ON a.patient_id = p.id
            WHERE a.doctor_id = %s {date_condition}
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        """, (doctor['id'],))
        
        appointments = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts and format dates
        result = []
        for apt in appointments:
            apt_dict = dict(apt)
            if apt_dict['appointment_date']:
                apt_dict['appointment_date'] = apt_dict['appointment_date'].isoformat()
            if apt_dict['appointment_time']:
                apt_dict['appointment_time'] = str(apt_dict['appointment_time'])
            result.append(apt_dict)
        
        return jsonify({'appointments': result}), 200
        
    except Exception as e:
        print(f"Get doctor appointments error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Pharmacy Routes
@app.route('/api/pharmacy/profile', methods=['GET'])
@jwt_required()
def get_pharmacy_profile():
    """Get pharmacy profile"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT p.*, l.username 
            FROM pharmacies_table p 
            JOIN login_table l ON p.login_id = l.id 
            WHERE p.login_id = %s
        """, (user_id,))
        
        pharmacy = cursor.fetchone()
        conn.close()
        
        if not pharmacy:
            return jsonify({'message': 'Pharmacy profile not found'}), 404
        
        return jsonify({'pharmacy': dict(pharmacy)}), 200
        
    except Exception as e:
        print(f"Get pharmacy profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/pharmacy/stock', methods=['GET'])
@jwt_required()
def get_pharmacy_stock():
    """Get pharmacy stock with low stock alerts"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get pharmacy ID first
        cursor.execute("SELECT id FROM pharmacies_table WHERE login_id = %s", (user_id,))
        pharmacy = cursor.fetchone()
        
        if not pharmacy:
            return jsonify({'message': 'Pharmacy not found'}), 404
        
        cursor.execute("""
            SELECT s.*, m.medicine_name, m.generic_name, m.category,
                   CASE WHEN s.quantity_available <= s.threshold_quantity THEN true ELSE false END as is_low_stock
            FROM pharmacy_stock_table s
            JOIN medicines_table m ON s.medicine_id = m.id
            WHERE s.pharmacy_id = %s
            ORDER BY s.quantity_available ASC, m.medicine_name ASC
        """, (pharmacy['id'],))
        
        stock = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts and format dates
        result = []
        for item in stock:
            item_dict = dict(item)
            if item_dict['manufacturing_date']:
                item_dict['manufacturing_date'] = item_dict['manufacturing_date'].isoformat()
            if item_dict['expiry_date']:
                item_dict['expiry_date'] = item_dict['expiry_date'].isoformat()
            result.append(item_dict)
        
        return jsonify({'stock': result}), 200
        
    except Exception as e:
        print(f"Get pharmacy stock error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# General Routes
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get list of available doctors"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, doctor_id, first_name, last_name, specialization, 
                   qualification, experience_years, consultation_fee, 
                   availability_status, rating, clinic_name
            FROM doctors_table
            WHERE availability_status IN ('available', 'on_call')
            ORDER BY rating DESC, experience_years DESC
        """)
        
        doctors = cursor.fetchall()
        conn.close()
        
        return jsonify({'doctors': [dict(doc) for doc in doctors]}), 200
        
    except Exception as e:
        print(f"Get doctors error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/medicines/search', methods=['GET'])
def search_medicines():
    """Search medicines"""
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({'medicines': []}), 200
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT * FROM medicines_table 
            WHERE medicine_name ILIKE %s OR generic_name ILIKE %s
            ORDER BY medicine_name
            LIMIT 50
        """, (f'%{query}%', f'%{query}%'))
        
        medicines = cursor.fetchall()
        conn.close()
        
        return jsonify({'medicines': [dict(med) for med in medicines]}), 200
        
    except Exception as e:
        print(f"Search medicines error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    else:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

if __name__ == '__main__':
    print("🏥 Starting Helio Healthcare Backend...")
    print("📋 Login Credentials:")
    print("Patients: p001, p002, p003 (password: patient123)")
    print("Doctors: d001, d002, d003 (password: doctor123)")
    print("Pharmacists: pm001, pm002, pm003 (password: pharmacy123)")
    app.run(debug=True, host='0.0.0.0', port=5000)