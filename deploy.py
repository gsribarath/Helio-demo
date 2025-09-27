#!/usr/bin/env python3
"""
Helio Deployment Script
Deploys the Helio telemedicine application to Railway.app
"""

import os
import subprocess
import json
import sys
from pathlib import Path

class HelioDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_path = self.project_root / "backend"
        self.frontend_path = self.project_root / "frontend"
        
    def check_prerequisites(self):
        """Check if required tools are installed"""
        print("🔍 Checking prerequisites...")
        
        # Check if Railway CLI is installed
        try:
            subprocess.run(["railway", "--version"], capture_output=True, check=True)
            print("✅ Railway CLI is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Railway CLI not found. Please install it:")
            print("   npm install -g @railway/cli")
            print("   or visit: https://docs.railway.app/develop/cli")
            return False
        
        # Check if Node.js is installed
        try:
            subprocess.run(["node", "--version"], capture_output=True, check=True)
            print("✅ Node.js is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Node.js not found. Please install Node.js from https://nodejs.org/")
            return False
        
        # Check if Python is installed
        try:
            subprocess.run([sys.executable, "--version"], capture_output=True, check=True)
            print("✅ Python is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Python not found. Please install Python from https://python.org/")
            return False
            
        return True
    
    def setup_railway_project(self):
        """Initialize Railway project"""
        print("\n🚄 Setting up Railway project...")
        
        try:
            # Login to Railway (if not already logged in)
            print("Please login to Railway when prompted...")
            subprocess.run(["railway", "login"], check=True)
            
            # Create new project
            subprocess.run(["railway", "create", "helio-telemedicine"], check=True)
            print("✅ Railway project created")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup Railway project: {e}")
            return False
        
        return True
    
    def setup_database(self):
        """Setup PostgreSQL database on Railway"""
        print("\n🗄️ Setting up PostgreSQL database...")
        
        try:
            # Add PostgreSQL plugin
            subprocess.run(["railway", "add", "--plugin", "postgresql"], check=True)
            print("✅ PostgreSQL database added")
            
            # Wait for database to be ready
            print("⏳ Waiting for database to initialize...")
            subprocess.run(["railway", "run", "echo", "Database ready"], check=True)
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup database: {e}")
            return False
        
        return True
    
    def deploy_backend(self):
        """Deploy Flask backend"""
        print("\n🔧 Deploying backend...")
        
        try:
            os.chdir(self.backend_path)
            
            # Deploy backend
            result = subprocess.run(["railway", "up"], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Backend deployed successfully")
                
                # Extract backend URL from deployment output
                output_lines = result.stdout.split('\n')
                backend_url = None
                for line in output_lines:
                    if 'https://' in line and 'railway.app' in line:
                        backend_url = line.strip()
                        break
                
                return backend_url
            else:
                print(f"❌ Backend deployment failed: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Backend deployment error: {e}")
            return None
        finally:
            os.chdir(self.project_root)
    
    def deploy_frontend(self, backend_url):
        """Deploy React frontend"""
        print("\n🎨 Deploying frontend...")
        
        try:
            os.chdir(self.frontend_path)
            
            # Update package.json proxy to use deployed backend
            package_json_path = self.frontend_path / "package.json"
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Remove local proxy and add homepage
            if 'proxy' in package_data:
                del package_data['proxy']
            
            package_data['homepage'] = "."
            
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            # Build frontend
            print("📦 Building frontend...")
            subprocess.run(["npm", "install"], check=True)
            subprocess.run(["npm", "run", "build"], check=True)
            
            # Deploy frontend using Railway
            result = subprocess.run(["railway", "up"], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Frontend deployed successfully")
                
                # Extract frontend URL
                output_lines = result.stdout.split('\n')
                frontend_url = None
                for line in output_lines:
                    if 'https://' in line and 'railway.app' in line:
                        frontend_url = line.strip()
                        break
                
                return frontend_url
            else:
                print(f"❌ Frontend deployment failed: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Frontend deployment error: {e}")
            return None
        finally:
            os.chdir(self.project_root)
    
    def setup_environment_variables(self, backend_url):
        """Set up environment variables for the backend"""
        print("\n🔧 Setting up environment variables...")
        
        try:
            os.chdir(self.backend_path)
            
            # Set environment variables
            env_vars = {
                "FLASK_ENV": "production",
                "SECRET_KEY": "helio-production-secret-key-2025",
                "JWT_SECRET_KEY": "helio-jwt-secret-2025",
                "CORS_ORIGINS": f"{backend_url},https://*.railway.app",
                "MAX_CONTENT_LENGTH": "16777216",
                "UPLOAD_FOLDER": "uploads"
            }
            
            for key, value in env_vars.items():
                subprocess.run(["railway", "variables", "set", f"{key}={value}"], check=True)
            
            print("✅ Environment variables set")
            return True
            
        except Exception as e:
            print(f"❌ Failed to set environment variables: {e}")
            return False
        finally:
            os.chdir(self.project_root)
    
    def deploy(self):
        """Main deployment function"""
        print("🚀 Starting Helio deployment...")
        print("=" * 50)
        
        # Check prerequisites
        if not self.check_prerequisites():
            return False
        
        # Setup Railway project
        if not self.setup_railway_project():
            return False
        
        # Setup database
        if not self.setup_database():
            return False
        
        # Deploy backend
        backend_url = self.deploy_backend()
        if not backend_url:
            return False
        
        # Setup environment variables
        if not self.setup_environment_variables(backend_url):
            return False
        
        # Deploy frontend
        frontend_url = self.deploy_frontend(backend_url)
        if not frontend_url:
            return False
        
        # Print success message
        print("\n" + "=" * 50)
        print("🎉 DEPLOYMENT SUCCESSFUL!")
        print("=" * 50)
        print(f"🏥 Frontend URL: {frontend_url}")
        print(f"🔧 Backend URL:  {backend_url}")
        print(f"🗄️ Database:     PostgreSQL (managed by Railway)")
        print("\n📋 Demo Credentials:")
        print("   Patient: patient@demo.com / password123")
        print("   Doctor:  doctor@demo.com / password123")
        print("\n🔗 Access your Helio telemedicine app at:")
        print(f"   {frontend_url}")
        print("=" * 50)
        
        return True

if __name__ == "__main__":
    deployer = HelioDeployer()
    success = deployer.deploy()
    
    if not success:
        print("\n❌ Deployment failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✅ Deployment completed successfully!")