# Helio - Telemedicine for Rural Healthcare

Helio is a multilingual, user-friendly telemedicine app designed to bridge the gap between rural patients and doctors in Nabha and surrounding areas.

## 🌍 Problem Statement

Nabha and its surrounding rural areas face severe healthcare challenges:
- Only 11 doctors for 23 sanctioned posts in Civil Hospital
- Patients traveling from 173 villages
- Poor road conditions and limited access to medicines
- Missing specialists and stock-out medicines
- Financial strain on daily-wage earners and farmers

## 🎯 Solution

Helio provides:
- Video consultations with doctors
- Offline health records
- Real-time medicine stock updates
- AI-powered symptom checking
- Multilingual interface

## 🏗️ Technical Stack

- **Frontend**: React.js with offline mode support
- **Backend**: Flask (Python) with REST APIs
- **Database**: PostgreSQL
- **Video Calls**: WebRTC
- **AI**: TensorFlow Lite for symptom checker

## 📱 App Features

### 5 Main Pages:
1. **Home Page** - Doctors list with profiles and specialties
2. **Medicines Page** - Real-time pharmacy inventory
3. **Doctor Schedule** - Availability and appointment booking
4. **Patient Profile** - Medical history and records
5. **Settings** - Language, account, and preferences

### Key Features:
- ✅ Multilingual Interface (English, Hindi, Punjabi)
- ✅ Offline Mode with data sync
- ✅ AI Symptom Checker
- ✅ Real-Time Medicine Updates
- ✅ Secure Video Consultations

## 🚀 Quick Deploy (Get Your Live Link!)

### One-Click Deployment
```bash
# Windows
quick-deploy.bat

# Linux/Mac
./quick-deploy.sh
```

### Manual Deployment Options

#### Option 1: Railway.app (Recommended)
```bash
python deploy.py
```
- ✅ Free PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Easy scaling

#### Option 2: Render.com
```bash
python deploy_render.py
```
- ✅ Free static hosting
- ✅ Managed PostgreSQL
- ✅ GitHub integration
- ✅ Auto-deployments

### Expected Live URLs
After deployment, your app will be available at:
- **Frontend**: `https://helio-frontend-xxx.railway.app`
- **Backend**: `https://helio-backend-xxx.railway.app`
- **API Health**: `https://helio-backend-xxx.railway.app/api/health`

## 🏠 Local Development

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🏆 Expected Outcomes

- Reduce travel burden for rural patients
- Provide timely access to doctors and medicines
- Improve healthcare delivery and record-keeping
- Create scalable solution for other rural regions

## � Demo Credentials

Test the live application with these accounts:

**Patient Portal**:
- Email: `patient@demo.com`
- Password: `password123`

**Doctor Portal**:
- Email: `doctor@demo.com`
- Password: `password123`

## 🌐 Live Demo Features

Once deployed, your live app includes:

### 👥 For Patients:
- 📋 Register and create medical profile
- 👨‍⚕️ Browse available doctors by specialty
- 📅 Book video consultation appointments
- 💊 Check real-time medicine availability
- 📱 Upload prescription images
- 🏥 View appointment history
- 🌍 Use in Hindi, English, or Punjabi

### 👨‍⚕️ For Doctors:
- 📊 Manage patient appointments
- 👤 View detailed patient profiles
- 💊 Prescribe medicines
- 📝 Add consultation notes
- ⏰ Set availability schedules
- 📈 Track consultation history

### 🏪 For Pharmacists:
- 💊 Update medicine inventory
- 📋 Process prescription requests
- 📊 Track stock levels
- ⚠️ Manage low-stock alerts

## 📱 Progressive Web App (PWA)

The deployed app works as a PWA:
- 📲 Install on mobile devices
- 🔄 Offline functionality
- 📊 Push notifications
- 🚀 Fast loading

## �📞 Contact

Government of Punjab - Department of Higher Education

---

**🎯 Ready to deploy?** Run `quick-deploy.bat` (Windows) or `./quick-deploy.sh` (Mac/Linux) to get your live telemedicine platform in minutes!