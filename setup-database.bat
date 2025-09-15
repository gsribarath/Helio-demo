@echo off
echo 🏥 Helio Healthcare - Database Setup
echo ====================================
echo.

echo 📋 Checking PostgreSQL connection...
echo.

cd backend

echo 🚀 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 🗄️ Setting up database schema and sample data...
python database_setup.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo 📝 Demo Login Credentials:
    echo Patients: p001, p002, p003 (password: patient123)
    echo Doctors: d001, d002, d003 (password: doctor123)
    echo Pharmacists: pm001, pm002, pm003 (password: pharmacy123)
    echo.
    echo 🚀 Ready to start the application!
    echo Use 'start-backend.bat' and 'start-frontend.bat' to launch
) else (
    echo.
    echo ❌ Database setup failed!
    echo Please check:
    echo - PostgreSQL is running
    echo - Database 'helio' exists
    echo - Username/password are correct
)

echo.
pause