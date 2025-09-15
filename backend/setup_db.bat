@echo off
echo Creating Helio database and setting up tables...
echo Password: gsribarath

cd /d "%~dp0"

echo Creating database helio...
psql -U postgres -h localhost -c "CREATE DATABASE helio;" 2>nul

echo Setting up tables and demo data...
psql -U postgres -h localhost -d helio -f setup_database.sql

echo.
echo Database setup completed!
echo You can now run the backend server.
pause