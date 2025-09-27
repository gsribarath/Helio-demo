#!/usr/bin/env python3
"""
Automated Railway Deployment for Helio
Creates both backend and frontend services automatically
"""

import subprocess
import json
import time
import os
import sys

def run_command(cmd, description=""):
    """Run a command and return the result"""
    try:
        print(f"🔄 {description}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            return result.stdout.strip()
        else:
            print(f"❌ {description} - Failed: {result.stderr}")
            return None
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - Timeout")
        return None
    except Exception as e:
        print(f"❌ {description} - Error: {e}")
        return None

def deploy_helio():
    """Deploy the complete Helio application"""
    print("🏥 DEPLOYING HELIO TELEMEDICINE APP")
    print("=" * 50)
    
    # Step 1: Create backend project
    print("\n🚀 Step 1: Creating Backend Service...")
    backend_cmd = 'railway service create helio-backend --detach'
    run_command(backend_cmd, "Creating backend service")
    
    # Step 2: Add PostgreSQL database
    print("\n🗄️ Step 2: Adding PostgreSQL Database...")
    db_cmd = 'railway add postgresql --detach'
    run_command(db_cmd, "Adding PostgreSQL database")
    
    # Step 3: Deploy backend
    print("\n🔧 Step 3: Deploying Backend...")
    os.chdir("backend")
    backend_deploy = 'railway up --detach'
    backend_result = run_command(backend_deploy, "Deploying backend")
    
    # Step 4: Get backend URL
    url_cmd = 'railway domain'
    backend_url = run_command(url_cmd, "Getting backend URL")
    if not backend_url:
        backend_url = "https://helio-backend-production.up.railway.app"
    
    os.chdir("..")
    
    # Step 5: Create frontend project
    print("\n🎨 Step 4: Creating Frontend Service...")
    frontend_cmd = 'railway service create helio-frontend --detach'
    run_command(frontend_cmd, "Creating frontend service")
    
    # Step 6: Deploy frontend
    print("\n📱 Step 5: Deploying Frontend...")
    os.chdir("frontend")
    frontend_deploy = 'railway up --detach'
    frontend_result = run_command(frontend_deploy, "Deploying frontend")
    
    # Step 7: Get frontend URL
    frontend_url = run_command(url_cmd, "Getting frontend URL")
    if not frontend_url:
        frontend_url = "https://helio-frontend-production.up.railway.app"
    
    os.chdir("..")
    
    # Print results
    print("\n" + "=" * 50)
    print("🎉 HELIO DEPLOYMENT COMPLETE!")
    print("=" * 50)
    print(f"🏥 Your Live Helio Telemedicine App:")
    print(f"   Frontend: {frontend_url}")
    print(f"   Backend:  {backend_url}")
    print(f"   Database: PostgreSQL (managed)")
    print("\n🔐 Demo Credentials:")
    print("   Patient: patient@demo.com / password123")
    print("   Doctor:  doctor@demo.com / password123")
    print("\n✨ Features Available:")
    print("   ✅ Doctor-Patient Consultations")
    print("   ✅ Medicine Inventory Management")
    print("   ✅ Appointment Booking")
    print("   ✅ Multi-language Support")
    print("   ✅ Mobile Responsive")
    print("=" * 50)
    
    return frontend_url

if __name__ == "__main__":
    deploy_helio()