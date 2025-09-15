import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime, date
import uuid

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'helio',
    'user': 'postgres',
    'password': 'gsribarath',
    'port': '5432'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def insert_sample_data():
    """Insert sample data into all tables"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        print("Inserting sample login credentials...")
        
        # Sample login data
        login_data = [
            ('p001', hash_password('patient123'), 'patient'),
            ('p002', hash_password('patient123'), 'patient'),
            ('p003', hash_password('patient123'), 'patient'),
            ('d001', hash_password('doctor123'), 'doctor'),
            ('d002', hash_password('doctor123'), 'doctor'),
            ('d003', hash_password('doctor123'), 'doctor'),
            ('pm001', hash_password('pharmacy123'), 'pharmacist'),
            ('pm002', hash_password('pharmacy123'), 'pharmacist'),
            ('pm003', hash_password('pharmacy123'), 'pharmacist')
        ]
        
        cursor.executemany(
            "INSERT INTO login_table (username, password_hash, role) VALUES (%s, %s, %s)",
            login_data
        )
        
        print("Inserting sample patient data...")
        
        # Sample patients
        patients_data = [
            (1, 'p001', 'John', 'Doe', '1990-05-15', 'male', '9876543210', 'john.doe@email.com', '123 Main St, City', 'Jane Doe', '9876543211', 'O+', 'None', 'No significant medical history'),
            (2, 'p002', 'Sarah', 'Smith', '1985-08-22', 'female', '9876543212', 'sarah.smith@email.com', '456 Oak Ave, City', 'Mike Smith', '9876543213', 'A+', 'Penicillin', 'Hypertension'),
            (3, 'p003', 'Mike', 'Johnson', '1992-12-10', 'male', '9876543214', 'mike.johnson@email.com', '789 Pine St, City', 'Lisa Johnson', '9876543215', 'B+', 'None', 'Diabetes Type 2')
        ]
        
        cursor.executemany(
            """INSERT INTO patients_table (login_id, patient_id, first_name, last_name, date_of_birth, 
               gender, phone, email, address, emergency_contact_name, emergency_contact_phone, 
               blood_group, allergies, medical_history) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            patients_data
        )
        
        print("Inserting sample doctor data...")
        
        # Sample doctors
        doctors_data = [
            (4, 'd001', 'Dr. Rajesh', 'Kumar', 'Cardiology', 'MBBS, MD Cardiology', 15, 'DL12345', '9876543220', 'dr.rajesh@clinic.com', 'Heart Care Clinic', '123 Medical Center, City', 1500.00, 'available'),
            (5, 'd002', 'Dr. Priya', 'Sharma', 'Pediatrics', 'MBBS, MD Pediatrics', 8, 'DL12346', '9876543221', 'dr.priya@clinic.com', 'Child Care Clinic', '456 Health Plaza, City', 1200.00, 'available'),
            (6, 'd003', 'Dr. Amit', 'Verma', 'General Medicine', 'MBBS, MD Internal Medicine', 12, 'DL12347', '9876543222', 'dr.amit@clinic.com', 'Family Health Center', '789 Wellness St, City', 1000.00, 'offline')
        ]
        
        cursor.executemany(
            """INSERT INTO doctors_table (login_id, doctor_id, first_name, last_name, specialization, 
               qualification, experience_years, license_number, phone, email, clinic_name, 
               clinic_address, consultation_fee, availability_status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            doctors_data
        )
        
        print("Inserting sample pharmacy data...")
        
        # Sample pharmacies
        pharmacies_data = [
            (7, 'pm001', 'MedPlus Pharmacy', 'Ramesh Gupta', 'PH12345', '9876543230', 'medplus@pharmacy.com', '123 Pharmacy St, City', '110001', 'Delhi', 'Delhi', '9 AM - 10 PM', True, 'GST123456'),
            (8, 'pm002', 'Apollo Pharmacy', 'Sunita Patel', 'PH12346', '9876543231', 'apollo@pharmacy.com', '456 Medicine Ave, City', '110002', 'Delhi', 'Delhi', '24 Hours', True, 'GST123457'),
            (9, 'pm003', 'City Medical Store', 'Vikram Singh', 'PH12347', '9876543232', 'citymed@pharmacy.com', '789 Health Rd, City', '110003', 'Delhi', 'Delhi', '8 AM - 9 PM', False, 'GST123458')
        ]
        
        cursor.executemany(
            """INSERT INTO pharmacies_table (login_id, pharmacy_id, pharmacy_name, owner_name, 
               license_number, phone, email, address, pincode, city, state, operating_hours, 
               delivery_available, gst_number) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            pharmacies_data
        )
        
        print("Inserting sample medicines data...")
        
        # Sample medicines
        medicines_data = [
            ('Paracetamol', 'Acetaminophen', 'Crocin', 'GSK', 'Analgesic', 'Tablet', '500mg', 'Pain reliever and fever reducer', 'Nausea, rash', 'Liver disease', 'Store below 25°C', False),
            ('Amoxicillin', 'Amoxicillin', 'Amoxil', 'Cipla', 'Antibiotic', 'Capsule', '250mg', 'Antibiotic for bacterial infections', 'Diarrhea, nausea', 'Penicillin allergy', 'Store in cool place', True),
            ('Metformin', 'Metformin HCl', 'Glucophage', 'Sun Pharma', 'Antidiabetic', 'Tablet', '500mg', 'Diabetes medication', 'Stomach upset', 'Kidney disease', 'Store below 30°C', True),
            ('Atorvastatin', 'Atorvastatin Calcium', 'Lipitor', 'Pfizer', 'Statin', 'Tablet', '10mg', 'Cholesterol lowering medication', 'Muscle pain', 'Liver disease', 'Store below 25°C', True),
            ('Cetirizine', 'Cetirizine HCl', 'Zyrtec', 'Dr Reddy\'s', 'Antihistamine', 'Tablet', '10mg', 'Allergy medication', 'Drowsiness', 'Kidney disease', 'Store below 30°C', False),
            ('Omeprazole', 'Omeprazole', 'Prilosec', 'Lupin', 'PPI', 'Capsule', '20mg', 'Acid reflux medication', 'Headache, nausea', 'Liver disease', 'Store below 25°C', True),
            ('Aspirin', 'Acetylsalicylic Acid', 'Disprin', 'Bayer', 'NSAID', 'Tablet', '75mg', 'Blood thinner and pain reliever', 'Stomach irritation', 'Bleeding disorders', 'Store below 25°C', False),
            ('Insulin Glargine', 'Insulin Glargine', 'Lantus', 'Sanofi', 'Insulin', 'Injection', '100U/ml', 'Long-acting insulin', 'Hypoglycemia', 'Hypoglycemia', 'Refrigerate 2-8°C', True),
            ('Salbutamol', 'Salbutamol Sulfate', 'Ventolin', 'GSK', 'Bronchodilator', 'Inhaler', '100mcg', 'Asthma medication', 'Tremor, headache', 'Heart disease', 'Store below 30°C', True),
            ('Diclofenac', 'Diclofenac Sodium', 'Voltaren', 'Novartis', 'NSAID', 'Tablet', '50mg', 'Anti-inflammatory', 'Stomach upset', 'Heart disease', 'Store below 25°C', True)
        ]
        
        cursor.executemany(
            """INSERT INTO medicines_table (medicine_name, generic_name, brand_name, manufacturer, 
               category, form, strength, description, side_effects, contraindications, 
               storage_instructions, prescription_required) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            medicines_data
        )
        
        print("Inserting sample pharmacy stock data...")
        
        # Sample pharmacy stock (each pharmacy has stock of various medicines)
        stock_data = []
        pharmacy_ids = [1, 2, 3]  # pharmacy table IDs
        medicine_ids = list(range(1, 11))  # medicine table IDs
        
        for pharmacy_id in pharmacy_ids:
            for medicine_id in medicine_ids:
                stock_data.append((
                    pharmacy_id, medicine_id, f'BATCH{pharmacy_id}{medicine_id:02d}', 
                    '2024-01-15', '2026-01-15', 100 + (pharmacy_id * medicine_id * 10), 
                    0, 10, 50.00 + (medicine_id * 10), 60.00 + (medicine_id * 10), 5.00
                ))
        
        cursor.executemany(
            """INSERT INTO pharmacy_stock_table (pharmacy_id, medicine_id, batch_number, 
               manufacturing_date, expiry_date, quantity_available, quantity_reserved, 
               threshold_quantity, price, mrp, discount_percentage) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            stock_data
        )
        
        print("Inserting sample appointments data...")
        
        # Sample appointments
        appointments_data = [
            (f'APT{datetime.now().strftime("%Y%m%d")}001', 1, 1, '2024-12-20', '10:00', 30, 'scheduled', 'video', 'Chest pain', 'Chest discomfort, shortness of breath', 'normal', 15),
            (f'APT{datetime.now().strftime("%Y%m%d")}002', 2, 2, '2024-12-20', '14:30', 30, 'confirmed', 'video', 'Child fever', 'High fever, loss of appetite', 'high', 10),
            (f'APT{datetime.now().strftime("%Y%m%d")}003', 3, 3, '2024-12-21', '09:00', 45, 'scheduled', 'video', 'Diabetes follow-up', 'Blood sugar monitoring', 'normal', 20)
        ]
        
        cursor.executemany(
            """INSERT INTO appointments_table (appointment_id, patient_id, doctor_id, appointment_date, 
               appointment_time, duration_minutes, status, consultation_type, chief_complaint, 
               symptoms, priority, estimated_wait_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            appointments_data
        )
        
        print("Committing all changes...")
        conn.commit()
        
        print("\n✅ Sample data inserted successfully!")
        print("\n📋 Login Credentials:")
        print("Patients: p001, p002, p003 (password: patient123)")
        print("Doctors: d001, d002, d003 (password: doctor123)")
        print("Pharmacists: pm001, pm002, pm003 (password: pharmacy123)")
        
        return True
        
    except psycopg2.Error as e:
        print(f"Error inserting sample data: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def test_database_connection():
    """Test the database connection and basic queries"""
    conn = get_db_connection()
    if not conn:
        print("❌ Database connection failed!")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔗 Database connected successfully!")
        
        # Test basic queries
        cursor.execute("SELECT COUNT(*) as total_users FROM login_table")
        result = cursor.fetchone()
        print(f"📊 Total users in system: {result['total_users']}")
        
        cursor.execute("SELECT role, COUNT(*) as count FROM login_table GROUP BY role")
        roles = cursor.fetchall()
        for role in roles:
            print(f"   - {role['role'].title()}s: {role['count']}")
        
        cursor.execute("SELECT COUNT(*) as total_medicines FROM medicines_table")
        result = cursor.fetchone()
        print(f"💊 Total medicines in database: {result['total_medicines']}")
        
        cursor.execute("SELECT COUNT(*) as total_appointments FROM appointments_table")
        result = cursor.fetchone()
        print(f"📅 Total appointments: {result['total_appointments']}")
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database test failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🏥 Helio Healthcare Database Setup")
    print("=" * 40)
    
    # Test connection first
    if test_database_connection():
        print("\n🚀 Inserting sample data...")
        if insert_sample_data():
            print("\n✅ Database setup completed successfully!")
            print("\n📝 Next steps:")
            print("1. Update Flask backend to use PostgreSQL")
            print("2. Implement role-based authentication")
            print("3. Create doctor and pharmacist dashboards")
        else:
            print("❌ Failed to insert sample data")
    else:
        print("❌ Database setup failed!")
        print("\n🔧 Make sure:")
        print("1. PostgreSQL is running")
        print("2. Database 'helio' exists")
        print("3. Username/password are correct")
        print("4. Run the database_setup.sql file first")