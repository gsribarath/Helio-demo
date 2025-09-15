-- Helio Healthcare Platform Database Schema
-- Database: Helio
-- Description: Complete database schema for role-based healthcare platform

-- Connect to the Helio database
-- Make sure to create the database first: CREATE DATABASE helio;

-- Enable UUID extension for better IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LOGIN TABLE - Central authentication table
CREATE TABLE login_table (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_login_username ON login_table(username);
CREATE INDEX idx_login_role ON login_table(role);

-- 2. PATIENTS TABLE - Patient profile details
CREATE TABLE patients_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER UNIQUE NOT NULL REFERENCES login_table(id) ON DELETE CASCADE,
    patient_id VARCHAR(20) UNIQUE NOT NULL, -- p001, p002, etc.
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    blood_group VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DOCTORS TABLE - Doctor profile details
CREATE TABLE doctors_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER UNIQUE NOT NULL REFERENCES login_table(id) ON DELETE CASCADE,
    doctor_id VARCHAR(20) UNIQUE NOT NULL, -- d001, d002, etc.
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    experience_years INTEGER,
    license_number VARCHAR(50) UNIQUE,
    phone VARCHAR(15),
    email VARCHAR(100),
    clinic_name VARCHAR(200),
    clinic_address TEXT,
    consultation_fee DECIMAL(10,2),
    availability_status VARCHAR(20) DEFAULT 'offline' CHECK (availability_status IN ('available', 'not_available', 'on_call', 'offline')),
    profile_picture_url VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PHARMACIES TABLE - Pharmacy/Pharmacist details
CREATE TABLE pharmacies_table (
    id SERIAL PRIMARY KEY,
    login_id INTEGER UNIQUE NOT NULL REFERENCES login_table(id) ON DELETE CASCADE,
    pharmacy_id VARCHAR(20) UNIQUE NOT NULL, -- pm001, pm002, etc.
    pharmacy_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT NOT NULL,
    pincode VARCHAR(10),
    city VARCHAR(50),
    state VARCHAR(50),
    operating_hours VARCHAR(100),
    delivery_available BOOLEAN DEFAULT FALSE,
    gst_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. MEDICINES TABLE - Master medicine data
CREATE TABLE medicines_table (
    id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    manufacturer VARCHAR(200),
    category VARCHAR(100), -- antibiotics, painkillers, etc.
    form VARCHAR(50), -- tablet, syrup, injection, etc.
    strength VARCHAR(50), -- 500mg, 10ml, etc.
    description TEXT,
    side_effects TEXT,
    contraindications TEXT,
    storage_instructions TEXT,
    prescription_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for medicine search
CREATE INDEX idx_medicine_name ON medicines_table(medicine_name);
CREATE INDEX idx_medicine_generic ON medicines_table(generic_name);

-- 6. PHARMACY STOCK TABLE - Inventory management
CREATE TABLE pharmacy_stock_table (
    id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER NOT NULL REFERENCES pharmacies_table(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines_table(id) ON DELETE CASCADE,
    batch_number VARCHAR(50),
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    threshold_quantity INTEGER DEFAULT 10, -- for low stock alerts
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pharmacy_id, medicine_id, batch_number)
);

-- Index for stock queries
CREATE INDEX idx_stock_pharmacy ON pharmacy_stock_table(pharmacy_id);
CREATE INDEX idx_stock_medicine ON pharmacy_stock_table(medicine_id);
CREATE INDEX idx_stock_expiry ON pharmacy_stock_table(expiry_date);

-- 7. APPOINTMENTS TABLE - Patient-Doctor appointments
CREATE TABLE appointments_table (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients_table(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors_table(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    consultation_type VARCHAR(20) DEFAULT 'video' CHECK (consultation_type IN ('video', 'audio', 'chat')),
    chief_complaint TEXT,
    symptoms TEXT,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_wait_time INTEGER, -- in minutes
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    consultation_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for appointment queries
CREATE INDEX idx_appointments_patient ON appointments_table(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments_table(doctor_id);
CREATE INDEX idx_appointments_date ON appointments_table(appointment_date);
CREATE INDEX idx_appointments_status ON appointments_table(status);

-- 8. PRESCRIPTIONS TABLE - Doctor prescriptions for patients
CREATE TABLE prescriptions_table (
    id SERIAL PRIMARY KEY,
    prescription_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id INTEGER REFERENCES appointments_table(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES patients_table(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors_table(id) ON DELETE CASCADE,
    diagnosis TEXT,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    total_medicines INTEGER DEFAULT 0,
    special_instructions TEXT,
    follow_up_instructions TEXT,
    referral_notes TEXT,
    referred_to_doctor_id INTEGER REFERENCES doctors_table(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items (detailed medicine list)
CREATE TABLE prescription_items_table (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions_table(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines_table(id) ON DELETE CASCADE,
    medicine_name VARCHAR(200) NOT NULL, -- stored for historical reference
    strength VARCHAR(50),
    dosage VARCHAR(100) NOT NULL, -- e.g., "1 tablet"
    frequency VARCHAR(100) NOT NULL, -- e.g., "twice daily"
    duration VARCHAR(50) NOT NULL, -- e.g., "7 days"
    timing VARCHAR(100), -- e.g., "after meals"
    special_instructions TEXT,
    quantity_prescribed INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CHAT MESSAGES TABLE - Patient-Doctor communication
CREATE TABLE chat_messages_table (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id INTEGER REFERENCES appointments_table(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES login_table(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'prescription', 'image', 'voice')),
    message_content TEXT,
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    file_size INTEGER,
    is_prescription_item BOOLEAN DEFAULT FALSE,
    prescription_data JSONB, -- for structured prescription data
    is_read BOOLEAN DEFAULT FALSE,
    reply_to_message_id INTEGER REFERENCES chat_messages_table(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for chat queries
CREATE INDEX idx_chat_appointment ON chat_messages_table(appointment_id);
CREATE INDEX idx_chat_sender ON chat_messages_table(sender_id);
CREATE INDEX idx_chat_created ON chat_messages_table(created_at);

-- 10. RESERVATIONS TABLE - Medicine reservations from pharmacies
CREATE TABLE reservations_table (
    id SERIAL PRIMARY KEY,
    reservation_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients_table(id) ON DELETE CASCADE,
    pharmacy_id INTEGER NOT NULL REFERENCES pharmacies_table(id) ON DELETE CASCADE,
    prescription_id INTEGER REFERENCES prescriptions_table(id) ON DELETE SET NULL,
    reservation_type VARCHAR(20) DEFAULT 'prescription' CHECK (reservation_type IN ('prescription', 'rare_medicine', 'general')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'picked_up', 'cancelled', 'expired')),
    total_amount DECIMAL(10,2),
    advance_amount DECIMAL(10,2) DEFAULT 0.00,
    pickup_date DATE,
    pickup_time TIME,
    special_instructions TEXT,
    pharmacy_notes TEXT,
    expiry_datetime TIMESTAMP, -- reservation expiry
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservation Items (detailed medicine reservations)
CREATE TABLE reservation_items_table (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations_table(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines_table(id) ON DELETE CASCADE,
    stock_id INTEGER REFERENCES pharmacy_stock_table(id),
    medicine_name VARCHAR(200) NOT NULL,
    strength VARCHAR(50),
    quantity_requested INTEGER NOT NULL,
    quantity_confirmed INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    availability_status VARCHAR(20) DEFAULT 'checking' CHECK (availability_status IN ('checking', 'available', 'partial', 'unavailable', 'alternative_suggested')),
    alternative_medicine_id INTEGER REFERENCES medicines_table(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reservations
CREATE INDEX idx_reservations_patient ON reservations_table(patient_id);
CREATE INDEX idx_reservations_pharmacy ON reservations_table(pharmacy_id);
CREATE INDEX idx_reservations_status ON reservations_table(status);
CREATE INDEX idx_reservations_pickup ON reservations_table(pickup_date);

-- 11. RARE MEDICINE REQUESTS TABLE - Special medicine request handling
CREATE TABLE rare_medicine_requests_table (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients_table(id) ON DELETE CASCADE,
    medicine_name VARCHAR(200) NOT NULL,
    strength VARCHAR(50),
    quantity_needed INTEGER NOT NULL,
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'critical')),
    medical_justification TEXT,
    prescription_image_url VARCHAR(255),
    patient_notes TEXT,
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'pharmacy_reviewing', 'accepted', 'declined', 'sourcing', 'available', 'fulfilled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rare Medicine Responses from Pharmacies
CREATE TABLE rare_medicine_responses_table (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES rare_medicine_requests_table(id) ON DELETE CASCADE,
    pharmacy_id INTEGER NOT NULL REFERENCES pharmacies_table(id) ON DELETE CASCADE,
    response_status VARCHAR(20) NOT NULL CHECK (response_status IN ('interested', 'can_source', 'declined')),
    estimated_time_days INTEGER,
    estimated_cost DECIMAL(10,2),
    pharmacy_notes TEXT,
    contact_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. NOTIFICATIONS TABLE - System notifications
CREATE TABLE notifications_table (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES login_table(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- appointment_reminder, low_stock_alert, prescription_ready, etc.
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    action_url VARCHAR(255),
    metadata JSONB, -- additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Index for notifications
CREATE INDEX idx_notifications_user ON notifications_table(user_id);
CREATE INDEX idx_notifications_read ON notifications_table(is_read);

-- 13. AUDIT LOG TABLE - Track important actions
CREATE TABLE audit_log_table (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES login_table(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_login_table_updated_at BEFORE UPDATE ON login_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_table_updated_at BEFORE UPDATE ON patients_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_table_updated_at BEFORE UPDATE ON doctors_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacies_table_updated_at BEFORE UPDATE ON pharmacies_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_table_updated_at BEFORE UPDATE ON medicines_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacy_stock_table_updated_at BEFORE UPDATE ON pharmacy_stock_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_table_updated_at BEFORE UPDATE ON appointments_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_table_updated_at BEFORE UPDATE ON prescriptions_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_table_updated_at BEFORE UPDATE ON reservations_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rare_medicine_requests_table_updated_at BEFORE UPDATE ON rare_medicine_requests_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Helio Healthcare Database Schema Created Successfully!' as status;