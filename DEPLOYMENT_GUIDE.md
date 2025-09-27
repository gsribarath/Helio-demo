# Helio Telemedicine App - Deployment Guide

## 🚀 Live Deployment Links

Your Helio telemedicine application can be deployed to multiple cloud platforms. Here are the recommended options:

### Option 1: Railway.app (Recommended)
- **Cost**: Free tier available
- **Features**: Automatic PostgreSQL, easy deployments
- **Best for**: Production-ready deployments

### Option 2: Render.com
- **Cost**: Free tier available  
- **Features**: Static site hosting + PostgreSQL
- **Best for**: Simple deployments

### Option 3: Vercel + Railway
- **Cost**: Free tiers available
- **Features**: Fast frontend, managed backend
- **Best for**: High-performance apps

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **Git** installed
4. **Railway CLI** or **Render account**

## 🛠️ Quick Deploy Instructions

### Railway.app Deployment

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Run the deployment script**:
   ```bash
   python deploy.py
   ```

3. **Follow the prompts** to login and deploy

### Manual Render.com Deployment

1. **Fork this repository** to your GitHub account

2. **Create Render account** at https://render.com

3. **Deploy Backend**:
   - Connect your GitHub repo
   - Select `backend` folder
   - Choose "Web Service"
   - Use build command: `pip install -r requirements.txt`
   - Use start command: `gunicorn app:app`
   - Add PostgreSQL database

4. **Deploy Frontend**:
   - Create new "Static Site"
   - Select `frontend` folder
   - Use build command: `npm run build`
   - Use publish directory: `build`

## 🔧 Environment Variables

Set these environment variables for the backend:

```env
DATABASE_URL=<postgresql_connection_string>
SECRET_KEY=helio-production-secret-2025
JWT_SECRET_KEY=helio-jwt-production-2025
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend-url.com
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads
```

## 🏥 Demo Credentials

Once deployed, you can test the application with:

**Patient Account**:
- Email: `patient@demo.com`
- Password: `password123`

**Doctor Account**:
- Email: `doctor@demo.com`  
- Password: `password123`

## 🌟 Features Available After Deployment

✅ **Patient Portal**:
- View available doctors
- Book appointments
- Check medicine availability
- Upload prescriptions
- View medical history

✅ **Doctor Portal**:
- Manage appointments
- View patient information
- Prescribe medicines
- Schedule availability

✅ **Medicine Management**:
- Real-time stock updates
- Search functionality
- Category filtering
- Prescription processing

✅ **Multilingual Support**:
- English, Hindi, Punjabi
- Auto-detection
- Easy language switching

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) support

## 🔒 Security Features

- JWT authentication
- Password hashing
- CORS protection
- File upload validation
- SQL injection prevention

## 📊 Analytics & Monitoring

After deployment, you can monitor:
- Application performance
- User registrations
- Appointment bookings
- Medicine stock levels
- Error logs

## 🆘 Support & Troubleshooting

If you encounter issues:

1. **Check logs** in Railway/Render dashboard
2. **Verify environment variables** are set correctly
3. **Ensure database** is connected and migrations ran
4. **Check CORS settings** for frontend-backend communication

## 🔗 Quick Access Links

Once deployed, bookmark these URLs:
- **Main App**: `https://your-frontend-url.com`
- **API Health**: `https://your-backend-url.com/api/health`
- **Doctor Dashboard**: `https://your-frontend-url.com/doctor`
- **Patient Portal**: `https://your-frontend-url.com/patient`

---

## 🎯 Expected Deployment URLs

After running the deployment script, you'll receive URLs like:

**Frontend**: `https://helio-frontend-xxx.railway.app`
**Backend**: `https://helio-backend-xxx.railway.app`

Save these URLs to access your deployed Helio telemedicine application!