#!/usr/bin/env python3
"""
Alternative Helio Deployment Script for Render.com
Automates deployment to Render.com platform
"""

import os
import subprocess
import json
import sys
import webbrowser
from pathlib import Path

class RenderDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_path = self.project_root / "backend"
        self.frontend_path = self.project_root / "frontend"
        
    def check_prerequisites(self):
        """Check if required tools are installed"""
        print("🔍 Checking prerequisites...")
        
        # Check if git is installed
        try:
            subprocess.run(["git", "--version"], capture_output=True, check=True)
            print("✅ Git is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Git not found. Please install Git from https://git-scm.com/")
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
    
    def create_render_yaml(self):
        """Create render.yaml for automatic deployment"""
        print("📝 Creating Render configuration...")
        
        render_config = {
            "databases": [
                {
                    "name": "helio-db",
                    "databaseName": "helio",
                    "user": "helio_user"
                }
            ],
            "services": [
                {
                    "type": "web",
                    "name": "helio-backend",
                    "env": "python",
                    "rootDir": "backend",
                    "buildCommand": "pip install -r requirements.txt",
                    "startCommand": "gunicorn app:app",
                    "envVars": [
                        {
                            "key": "DATABASE_URL",
                            "fromDatabase": {
                                "name": "helio-db",
                                "property": "connectionString"
                            }
                        },
                        {
                            "key": "FLASK_ENV",
                            "value": "production"
                        },
                        {
                            "key": "SECRET_KEY",
                            "generateValue": True
                        },
                        {
                            "key": "JWT_SECRET_KEY",
                            "generateValue": True
                        }
                    ]
                },
                {
                    "type": "static",
                    "name": "helio-frontend",
                    "env": "node",
                    "rootDir": "frontend",
                    "buildCommand": "npm install && npm run build",
                    "staticPublishPath": "./build",
                    "envVars": [
                        {
                            "key": "NODE_ENV",
                            "value": "production"
                        }
                    ]
                }
            ]
        }
        
        render_yaml_path = self.project_root / "render.yaml"
        with open(render_yaml_path, 'w') as f:
            import yaml
            yaml.dump(render_config, f, default_flow_style=False)
        
        print("✅ Render configuration created")
        return True
    
    def setup_git_repo(self):
        """Initialize git repository if not exists"""
        print("📦 Setting up Git repository...")
        
        try:
            # Check if already a git repo
            subprocess.run(["git", "rev-parse", "--git-dir"], 
                         capture_output=True, check=True, cwd=self.project_root)
            print("✅ Git repository already exists")
        except subprocess.CalledProcessError:
            # Initialize git repo
            subprocess.run(["git", "init"], check=True, cwd=self.project_root)
            subprocess.run(["git", "add", "."], check=True, cwd=self.project_root)
            subprocess.run(["git", "commit", "-m", "Initial Helio deployment commit"], 
                          check=True, cwd=self.project_root)
            print("✅ Git repository initialized")
        
        return True
    
    def deploy_to_render(self):
        """Guide user through Render deployment"""
        print("\n🚀 Deploying to Render.com...")
        print("=" * 50)
        
        print("📋 Follow these steps:")
        print("1. Go to https://render.com and create an account")
        print("2. Connect your GitHub account")
        print("3. Push your code to GitHub:")
        
        # Show Git commands
        print("\n   Git commands to run:")
        print("   git remote add origin https://github.com/YOUR_USERNAME/helio-demo")
        print("   git branch -M main")
        print("   git push -u origin main")
        
        print("\n4. In Render dashboard:")
        print("   - Click 'New' -> 'Blueprint'")
        print("   - Connect your GitHub repository")
        print("   - Render will automatically detect render.yaml")
        print("   - Click 'Apply' to deploy")
        
        print("\n5. Your services will be available at:")
        print("   - Backend: https://helio-backend.onrender.com")
        print("   - Frontend: https://helio-frontend.onrender.com")
        print("   - Database: PostgreSQL (managed)")
        
        # Open Render website
        print("\n🌐 Opening Render.com...")
        webbrowser.open("https://render.com")
        
        return True
    
    def create_deployment_instructions(self):
        """Create detailed deployment instructions file"""
        instructions = """
# Helio Render Deployment Instructions

## Step-by-Step Deployment

### 1. Prerequisites
- GitHub account
- Render.com account (free)
- This code pushed to GitHub

### 2. GitHub Setup
```bash
# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/helio-demo
git branch -M main
git push -u origin main
```

### 3. Render Deployment
1. Go to https://render.com
2. Sign up/login with GitHub
3. Click "New" -> "Blueprint"
4. Connect your helio-demo repository
5. Click "Apply"

### 4. Configuration
The render.yaml file will automatically:
- Create PostgreSQL database
- Deploy Flask backend
- Deploy React frontend
- Set up environment variables

### 5. Access Your App
After deployment (5-10 minutes):
- Frontend: https://helio-frontend.onrender.com
- Backend: https://helio-backend.onrender.com/api/health

### 6. Demo Credentials
- Patient: patient@demo.com / password123
- Doctor: doctor@demo.com / password123

### 7. Features
✅ Complete telemedicine platform
✅ Doctor-patient consultations
✅ Medicine inventory management
✅ Appointment booking
✅ Prescription uploads
✅ Multilingual support (EN/HI/PA)

### 8. Monitoring
Check deployment status in Render dashboard:
- Build logs
- Runtime logs
- Database metrics
- Custom domains

## Support
For issues, check:
1. Render build logs
2. Runtime logs
3. Database connectivity
4. Environment variables
"""
        
        instructions_path = self.project_root / "RENDER_DEPLOYMENT.md"
        with open(instructions_path, 'w') as f:
            f.write(instructions)
        
        print("✅ Deployment instructions created")
        return True
    
    def deploy(self):
        """Main deployment function"""
        print("🚀 Starting Helio deployment to Render.com...")
        print("=" * 50)
        
        # Check prerequisites
        if not self.check_prerequisites():
            return False
        
        # Create render configuration
        # Note: yaml module might not be available, so we'll create it manually
        self.create_render_yaml_manual()
        
        # Setup git repo
        if not self.setup_git_repo():
            return False
        
        # Create deployment instructions
        if not self.create_deployment_instructions():
            return False
        
        # Guide through Render deployment
        if not self.deploy_to_render():
            return False
        
        # Print success message
        print("\n" + "=" * 50)
        print("📋 DEPLOYMENT SETUP COMPLETE!")
        print("=" * 50)
        print("✅ Configuration files created")
        print("✅ Git repository prepared")
        print("✅ Deployment instructions ready")
        print("\n📋 Next Steps:")
        print("1. Push code to GitHub")
        print("2. Deploy via Render Blueprint")
        print("3. Access your live app!")
        print("\n🔗 Expected URLs:")
        print("   Frontend: https://helio-frontend.onrender.com")
        print("   Backend:  https://helio-backend.onrender.com")
        print("=" * 50)
        
        return True
    
    def create_render_yaml_manual(self):
        """Create render.yaml manually without yaml dependency"""
        render_yaml_content = """databases:
  - name: helio-db
    databaseName: helio
    user: helio_user

services:
  - type: web
    name: helio-backend
    env: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: helio-db
          property: connectionString
      - key: FLASK_ENV
        value: production
      - key: SECRET_KEY
        generateValue: true
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: CORS_ORIGINS
        value: "*"
      - key: MAX_CONTENT_LENGTH
        value: "16777216"
      - key: UPLOAD_FOLDER
        value: uploads

  - type: static
    name: helio-frontend
    env: node
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: NODE_ENV
        value: production
      - key: GENERATE_SOURCEMAP
        value: "false"
"""
        
        render_yaml_path = self.project_root / "render.yaml"
        with open(render_yaml_path, 'w') as f:
            f.write(render_yaml_content)
        
        print("✅ render.yaml created")

if __name__ == "__main__":
    deployer = RenderDeployer()
    success = deployer.deploy()
    
    if not success:
        print("\n❌ Deployment setup failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✅ Deployment setup completed successfully!")