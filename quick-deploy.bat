@echo off
REM One-click deployment script for Helio Telemedicine App (Windows)

echo 🏥 Helio Telemedicine - One-Click Deployment
echo ============================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo 🚀 Choose your deployment platform:
echo 1. Railway.app (Recommended - Free PostgreSQL)
echo 2. Render.com (Free tier with limitations)
echo 3. Manual setup instructions

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo 🚄 Deploying to Railway.app...
    python deploy.py
) else if "%choice%"=="2" (
    echo 🎨 Setting up Render.com deployment...
    python deploy_render.py
) else if "%choice%"=="3" (
    echo 📋 Opening deployment guide...
    start DEPLOYMENT_GUIDE.md
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo ✅ Deployment process completed!
echo 📱 Your Helio telemedicine app will be available shortly.
pause