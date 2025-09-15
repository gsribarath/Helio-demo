# Helio Healthcare Database Setup Script
Write-Host "🏥 Helio Healthcare - Database Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location backend

Write-Host "📋 Checking PostgreSQL connection..." -ForegroundColor Yellow
Write-Host ""

# Install Python dependencies
Write-Host "🚀 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗄️ Setting up database schema and sample data..." -ForegroundColor Yellow

# Run database setup
python database_setup.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Demo Login Credentials:" -ForegroundColor Cyan
    Write-Host "Patients: p001, p002, p003 (password: patient123)" -ForegroundColor White
    Write-Host "Doctors: d001, d002, d003 (password: doctor123)" -ForegroundColor White
    Write-Host "Pharmacists: pm001, pm002, pm003 (password: pharmacy123)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready to start the application!" -ForegroundColor Green
    Write-Host "Use 'start-backend-new.bat' and 'start-frontend.bat' to launch" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "- PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "- Database 'helio' exists" -ForegroundColor Yellow
    Write-Host "- Username/password are correct" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"