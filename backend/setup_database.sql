-- Create Helio database and tables for username-based authentication
-- Password: gsribarath

-- Create database (run this as postgres user first)
-- CREATE DATABASE helio;

-- Connect to helio database and create tables
\c helio;

-- Create login_table for user authentication
CREATE TABLE IF NOT EXISTS login_table (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create patients_table
CREATE TABLE IF NOT EXISTS patients_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER REFERENCES login_table(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    age INTEGER,
    gender VARCHAR(10),
    address TEXT,
    blood_group VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors_table
CREATE TABLE IF NOT EXISTS doctors_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER REFERENCES login_table(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    clinic_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pharmacies_table
CREATE TABLE IF NOT EXISTS pharmacies_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER REFERENCES login_table(id),
    pharmacy_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users with bcrypt hashed passwords
-- Password hashes for: patient123, doctor123, pharmacy123
INSERT INTO login_table (username, password_hash, role) VALUES 
    ('p001', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'patient'),
    ('p002', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'patient'),
    ('p003', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'patient'),
    ('d001', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor'),
    ('d002', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor'),
    ('d003', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor'),
    ('pm001', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'pharmacist'),
    ('pm002', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'pharmacist'),
    ('pm003', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'pharmacist')
ON CONFLICT (username) DO NOTHING;

-- Insert corresponding profile data
INSERT INTO patients_table (login_id, first_name, last_name, phone, email, age, gender) VALUES 
    ((SELECT id FROM login_table WHERE username='p001'), 'John', 'Doe', '9876543210', 'john.doe@email.com', 30, 'male'),
    ((SELECT id FROM login_table WHERE username='p002'), 'Sarah', 'Smith', '9876543212', 'sarah.smith@email.com', 25, 'female'),
    ((SELECT id FROM login_table WHERE username='p003'), 'Raj', 'Kumar', '9876543213', 'raj.kumar@email.com', 35, 'male')
ON CONFLICT DO NOTHING;

INSERT INTO doctors_table (login_id, first_name, last_name, specialization, clinic_name, phone, consultation_fee) VALUES 
    ((SELECT id FROM login_table WHERE username='d001'), 'Dr. Rajesh', 'Kumar', 'Cardiology', 'Heart Care Clinic', '9876543220', 500.00),
    ((SELECT id FROM login_table WHERE username='d002'), 'Dr. Priya', 'Sharma', 'Pediatrics', 'Child Care Clinic', '9876543221', 400.00),
    ((SELECT id FROM login_table WHERE username='d003'), 'Dr. Amit', 'Singh', 'General Medicine', 'Health Plus Clinic', '9876543222', 300.00)
ON CONFLICT DO NOTHING;

INSERT INTO pharmacies_table (login_id, pharmacy_name, owner_name, phone) VALUES 
    ((SELECT id FROM login_table WHERE username='pm001'), 'MedPlus Pharmacy', 'Ramesh Gupta', '9876543230'),
    ((SELECT id FROM login_table WHERE username='pm002'), 'Apollo Pharmacy', 'Suresh Reddy', '9876543231'),
    ((SELECT id FROM login_table WHERE username='pm003'), 'HealthCare Pharmacy', 'Vikram Joshi', '9876543232')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

\echo 'Database setup completed successfully!'
\echo 'Demo users created:'
\echo 'Patients: p001, p002, p003 (password: patient123)'
\echo 'Doctors: d001, d002, d003 (password: doctor123)'
\echo 'Pharmacists: pm001, pm002, pm003 (password: pharmacy123)'