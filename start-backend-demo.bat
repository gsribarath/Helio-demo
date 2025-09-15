@echo off
echo 🏥 Starting Helio Healthcare Backend (Demo Mode)
echo ================================================
echo.

cd /d "C:\Users\gsrib\OneDrive\Desktop\Helio\backend"

echo 📋 Demo Login Credentials:
echo Patients: p001, p002 (password: patient123)
echo Doctors: d001, d002 (password: doctor123)  
echo Pharmacists: pm001, pm002 (password: pharmacy123)
echo.
echo Backend will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app_simple.py

pause