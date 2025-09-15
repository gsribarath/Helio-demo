# Helio Healthcare Database Setup Instructions

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL on your system
   - Make sure PostgreSQL service is running
   - Default port: 5432

2. **Python Dependencies**
   - Navigate to `backend` folder
   - Run: `pip install -r requirements.txt`

## Database Setup

### Step 1: Create Database
Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE helio;
```

Or using command line:
```bash
createdb -U postgres helio
```

### Step 2: Run Database Schema
Execute the SQL schema file:

```bash
# Option 1: Using psql command line
psql -U postgres -d helio -f backend/database_setup.sql

# Option 2: Using pgAdmin
# - Open pgAdmin
# - Connect to your PostgreSQL server
# - Right-click on 'helio' database
# - Select Query Tool
# - Open and execute 'backend/database_setup.sql'
```

### Step 3: Insert Sample Data
Run the Python script to insert sample data:

```bash
cd backend
python database_setup.py
```

## Starting the Application

### Backend (Flask)
```bash
cd backend
python app_new.py
```

The backend will start on: http://localhost:5000

### Frontend (React)
```bash
cd frontend
npm install  # First time only
npm start
```

The frontend will start on: http://localhost:3000

## Login Credentials

### Demo Users:

**Patients:**
- Username: `p001`, Password: `patient123`
- Username: `p002`, Password: `patient123`
- Username: `p003`, Password: `patient123`

**Doctors:**
- Username: `d001`, Password: `doctor123`
- Username: `d002`, Password: `doctor123`
- Username: `d003`, Password: `doctor123`

**Pharmacists:**
- Username: `pm001`, Password: `pharmacy123`
- Username: `pm002`, Password: `pharmacy123`
- Username: `pm003`, Password: `pharmacy123`

## Role-Based Dashboards

- **Patients**: Home, Medicine, Availability, Profile, Settings
- **Doctors**: Dashboard, Appointments, Consultation Tools, Prescription Composer, Analytics
- **Pharmacists**: Dashboard, Inventory Management, Prescription Handling, Reports

## Troubleshooting

### Database Connection Issues:
1. Check if PostgreSQL is running
2. Verify database name is 'helio'
3. Check username/password in backend/.env file
4. Ensure port 5432 is accessible

### Backend Issues:
1. Check if all Python dependencies are installed
2. Verify database connection
3. Check if port 5000 is available

### Frontend Issues:
1. Run `npm install` if packages are missing
2. Check if backend is running on port 5000
3. Verify API endpoints are accessible

## Development Notes

- Backend uses PostgreSQL with psycopg2 driver
- Authentication uses JWT tokens
- Role-based access control implemented
- All tables have proper foreign key relationships
- Sample data includes realistic healthcare scenarios