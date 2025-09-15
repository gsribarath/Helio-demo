# Helio Setup Guide

This guide will help you set up and run the Helio telemedicine application locally.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- PostgreSQL installed (optional - SQLite will be used by default)

## Quick Start

### 1. Clone and Setup Backend

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run the Flask application
python app.py
```

The backend will be available at `http://localhost:5000`

### 2. Setup Frontend

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`

## Environment Configuration

### Backend (.env)
```
# Database Configuration
DATABASE_URL=sqlite:///helio.db
# For PostgreSQL: postgresql://username:password@localhost:5432/helio_db

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your_secret_key_here_change_in_production
JWT_SECRET_KEY=your_jwt_secret_key_here

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env)
Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Demo Accounts

The application includes demo data. You can register new accounts or use these test credentials:

### For Testing (after registering)
- **Patient Account**: Register with any email and select "Patient" type
- **Doctor Account**: Register with any email and select "Doctor" type

### Demo Data Included
- 4 sample doctors with different specialties
- Medicine inventory with stock levels
- Sample appointments and prescriptions

## Features Available

### ✅ Completed Features
1. **User Authentication** - Login/Register for patients and doctors
2. **Doctor Listings** - Browse available doctors with search and filters
3. **Medicine Inventory** - Real-time stock tracking with alerts
4. **Appointment Scheduling** - Book appointments with available time slots
5. **Patient Profiles** - Manage personal and medical information
6. **Multi-language Support** - English, Hindi, and Punjabi
7. **Responsive Design** - Works on desktop and mobile devices

### 🚧 Foundation Laid For
1. **Video Consultations** - WebRTC foundation ready
2. **AI Symptom Checker** - Component structure in place
3. **Offline Support** - Service worker foundation ready

## Application Structure

```
Helio/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Main application pages
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service functions
│   │   └── i18n/          # Internationalization
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static assets
└── README.md              # Project documentation
```

## Database Schema

The application uses the following main entities:
- **Users** - Authentication and user management
- **Doctors** - Doctor profiles and information
- **Patients** - Patient profiles and medical history
- **Medicines** - Pharmacy inventory management
- **Appointments** - Appointment scheduling
- **Prescriptions** - Medical prescriptions
- **DoctorSchedule** - Doctor availability slots

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Doctors
- `GET /api/doctors` - List doctors with search/filter
- `GET /api/doctors/{id}` - Get doctor details

### Medicines
- `GET /api/medicines` - List medicines with search/filter

### Additional endpoints are implemented for appointments, prescriptions, and user management.

## Development Notes

### Current Implementation
- Uses dummy data for demonstration
- SQLite database for simplicity
- JWT authentication
- Responsive CSS with modern design
- Internationalization ready

### Production Considerations
- Switch to PostgreSQL for production
- Implement proper error handling
- Add rate limiting and security headers
- Set up proper logging
- Configure HTTPS
- Implement real payment integration
- Add proper medical data encryption

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Ensure Python virtual environment is activated
   - Check if port 5000 is available
   - Verify all dependencies are installed

2. **Frontend not connecting to backend**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in frontend .env file

3. **Database errors**
   - The app will create SQLite database automatically
   - For PostgreSQL, ensure database exists and credentials are correct

## Next Steps

To extend the application:
1. Implement real WebRTC video calling
2. Integrate TensorFlow Lite for AI features
3. Add payment gateway integration
4. Implement push notifications
5. Add real-time chat functionality
6. Integrate with pharmacy APIs for real stock data

## Support

This application was built for the Smart India Hackathon 2025 to address rural healthcare challenges in Nabha, Punjab. It demonstrates a complete telemedicine platform that can be scaled for real-world deployment.