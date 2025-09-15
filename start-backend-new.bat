@echo off
echo 🏥 Helio Healthcare - Backend Server
echo ====================================
echo.

cd backend

echo 🚀 Starting Flask backend server...
echo Backend will be available at: http://localhost:5000
echo.
echo 📋 Login Credentials:
echo Patients: p001, p002, p003 (password: patient123)
echo Doctors: d001, d002, d003 (password: doctor123)
echo Pharmacists: pm001, pm002, pm003 (password: pharmacy123)
echo.
echo Press Ctrl+C to stop the server
echo.

python app_new.py