# Add these additional routes to the existing app.py file

from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from datetime import datetime
import os
import uuid

# Import your database models and app instance
# Assuming these are defined in your main app.py or models.py
from app import app, db, User, Patient, Doctor, Appointment, Prescription, Medicine

# Helper function for file uploads
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            appointment_date=datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00')),
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
        slot_duration = 30
        
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

# Patient Routes
@app.route('/api/patients/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient_profile(patient_id):
    try:
        patient = Patient.query.get_or_404(patient_id)
        
        return jsonify({
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'gender': patient.gender,
            'phone': patient.phone,
            'address': patient.address,
            'emergency_contact': patient.emergency_contact,
            'blood_group': patient.blood_group,
            'allergies': patient.allergies,
            'medical_history': patient.medical_history
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Patient not found', 'error': str(e)}), 404

@app.route('/api/patients/<patient_id>', methods=['PUT'])
@jwt_required()
def update_patient_profile(patient_id):
    try:
        patient = Patient.query.get_or_404(patient_id)
        data = request.get_json()
        
        # Update fields
        for field in ['name', 'age', 'gender', 'phone', 'address', 'emergency_contact', 
                     'blood_group', 'allergies', 'medical_history']:
            if field in data:
                setattr(patient, field, data[field])
        
        db.session.commit()
        
        return jsonify({'message': 'Patient profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update patient profile', 'error': str(e)}), 500

# Prescription Routes
@app.route('/api/prescriptions', methods=['GET'])
@jwt_required()
def get_prescriptions():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        query = Prescription.query
        
        if user.user_type == 'patient':
            patient = Patient.query.filter_by(user_id=user_id).first()
            if patient:
                query = query.filter(Prescription.patient_id == patient.id)
        elif user.user_type == 'doctor':
            doctor = Doctor.query.filter_by(user_id=user_id).first()
            if doctor:
                query = query.filter(Prescription.doctor_id == doctor.id)
        
        prescriptions = query.order_by(Prescription.created_at.desc()).all()
        
        result = []
        for prescription in prescriptions:
            patient = Patient.query.get(prescription.patient_id)
            doctor = Doctor.query.get(prescription.doctor_id)
            
            result.append({
                'id': prescription.id,
                'patient_name': patient.name if patient else 'Unknown',
                'doctor_name': doctor.name if doctor else 'Unknown',
                'doctor_specialty': doctor.specialty if doctor else '',
                'medicines': prescription.medicines,
                'diagnosis': prescription.diagnosis,
                'instructions': prescription.instructions,
                'created_at': prescription.created_at.isoformat(),
                'is_dispensed': prescription.is_dispensed
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch prescriptions', 'error': str(e)}), 500

# File Upload Route
@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'url': f'/api/files/{filename}'
            }), 200
        else:
            return jsonify({'message': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'message': 'File upload failed', 'error': str(e)}), 500

@app.route('/api/files/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Add sample data creation function
def create_sample_data():
    """Create sample data for demonstration"""
    try:
        # Check if data already exists
        if User.query.first():
            return
        
        # Create sample users
        users_data = [
            {
                'email': 'patient@demo.com',
                'password': 'password123',
                'user_type': 'patient',
                'name': 'Rajesh Kumar',
                'age': 35,
                'gender': 'male',
                'phone': '+91 98765 43210'
            },
            {
                'email': 'doctor@demo.com',
                'password': 'password123',
                'user_type': 'doctor',
                'name': 'Dr. Priya Sharma',
                'specialty': 'Pediatrics',
                'qualifications': 'MBBS, MD Pediatrics'
            }
        ]
        
        for user_data in users_data:
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
                    name=user_data['name'],
                    age=user_data['age'],
                    gender=user_data['gender'],
                    phone=user_data['phone']
                )
                db.session.add(patient)
            else:
                doctor = Doctor(
                    user_id=user.id,
                    name=user_data['name'],
                    specialty=user_data['specialty'],
                    qualifications=user_data['qualifications']
                )
                db.session.add(doctor)
        
        # Create sample medicines
        medicines_data = [
            {
                'name': 'Paracetamol 500mg',
                'generic_name': 'Acetaminophen',
                'manufacturer': 'Cipla Ltd',
                'price': 25.50,
                'stock_quantity': 150,
                'category': 'Pain Relief'
            },
            {
                'name': 'Amoxicillin 250mg',
                'generic_name': 'Amoxicillin',
                'manufacturer': 'Sun Pharma',
                'price': 85.00,
                'stock_quantity': 8,
                'category': 'Antibiotics'
            }
        ]
        
        for med_data in medicines_data:
            medicine = Medicine(**med_data)
            db.session.add(medicine)
        
        db.session.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {e}")

# Call this in the main block
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5000)