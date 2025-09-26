import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import Login from './components/Login';
import ScrollToTop from './components/ScrollToTop';
import BackButton from './components/BackButton';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import MyMedicines from './pages/MyMedicines';
import Availability from './pages/Availability';
import Appointments from './pages/Appointments';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import VideoCallPage from './pages/VideoCallPage';
import AudioCallPage from './pages/AudioCallPage';
import Reports from './pages/Reports';
import MyAppointments from './pages/MyAppointments';
import RareMedicineRequest from './pages/RareMedicineRequest';
import RequestMedicine from './pages/RequestMedicine';
import EmergencyRequest from './pages/EmergencyRequest';
import DoctorHome from './pages/doctor/DoctorHome';
import DoctorMyAppointments from './pages/doctor/DoctorMyAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorBottomNavigation from './components/DoctorBottomNavigation';
// Pharmacy components
import PharmacySidebar from './components/pharmacy/PharmacySidebar';
import PharmacyHome from './pages/pharmacy/PharmacyHome';
import PharmacyInfo from './pages/pharmacy/PharmacyInfo';
import PharmacyRequests from './pages/pharmacy/PharmacyRequests';
import PrescriptionImageRequests from './pages/pharmacy/PrescriptionImageRequests';
import Inventory from './pages/pharmacy/Inventory';
import PharmacyReports from './pages/pharmacy/PharmacyReports';
import PharmacistProfile from './pages/pharmacy/PharmacistProfile';
import DoctorPatientInfo from './pages/doctor/DoctorPatientInfo';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorConsultation from './pages/doctor/DoctorConsultation';

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, login, logout, loading, isAuthenticated } = useAuth();
  
  // AuthProvider handles persisted session; no local re-parse here.

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  // Ensure body always reserves space for fixed bottom navigation bars
  useEffect(() => {
    document.body.classList.add('app-has-bottomnav');
    return () => {
      document.body.classList.remove('app-has-bottomnav');
    };
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    // Delegate to AuthContext login
    login(userData.token || 'demo.token', userData);
  };

  // Handle logout
  const handleLogout = () => {
    // Only explicit logout clears session
    logout();
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Navigation now always shown; previously hid for full screen call pages.

  // Role-based dashboard routing
  const getRoleBasedRoutes = () => {
    if (user.role === 'patient') {
      return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/request-medicine" element={<RequestMedicine />} />
          <Route path="/emergency-request" element={<EmergencyRequest />} />
          <Route path="/rare-medicine-request" element={<RareMedicineRequest />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/my-medicines" element={<MyMedicines />} />
          <Route path="/reports" element={<Reports />} />
          {/* Prescriptions routes to Medicines for now */}
          <Route path="/prescriptions" element={<Medicines />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/video-call" element={<VideoCallPage />} />
          <Route path="/audio-call" element={<AudioCallPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    } else if (user.role === 'doctor') {
      // Return only routes; outer layout will handle persistent nav
      return (
        <Routes>
          <Route path="/" element={<DoctorHome />} />
          <Route path="/doctor" element={<DoctorHome />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/my-appointments" element={<DoctorMyAppointments />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
          <Route path="/doctor/patient/:id" element={<DoctorPatientInfo />} />
          <Route path="/doctor/consult/:id" element={<DoctorConsultation />} />
          <Route path="/video-call" element={<VideoCallPage />} />
          <Route path="/audio-call" element={<AudioCallPage />} />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
      );
    } else if (user.role === 'pharmacist') {
      // Pharmacist dashboard routes
      return (
        <Routes>
          <Route path="/" element={<PharmacyHome />} />
          <Route path="/pharmacy" element={<PharmacyHome />} />
          <Route path="/pharmacy/info" element={<PharmacyInfo />} />
          <Route path="/pharmacy/profile" element={<PharmacistProfile />} />
          <Route path="/pharmacy/requests" element={<PharmacyRequests />} />
          <Route path="/pharmacy/image-requests" element={<PrescriptionImageRequests />} />
          <Route path="/pharmacy/inventory" element={<Inventory />} />
          <Route path="*" element={<Navigate to="/pharmacy" replace />} />
        </Routes>
      );
    }
    
    // Fallback for unknown roles
    return (
      <Routes>
        <Route path="*" element={<div className="p-6"><h1>{t('unknown_role')}</h1><button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">{t('logout')}</button></div>} />
      </Routes>
    );
  };

  // For patients, show the existing interface with navigation
  if (user.role === 'patient') {
    const patientMain = new Set(['/', '/home', '/medicines', '/availability', '/profile', '/settings']);
    const showBack = !patientMain.has(location.pathname) && !location.pathname.startsWith('/video-call') && !location.pathname.startsWith('/audio-call');
    return (
      <div className="App min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 px-2" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
            <ScrollToTop />
            {showBack && <BackButton />}
            {getRoleBasedRoutes()}
          </main>
          {/* Spacer no longer required; body padding via .app-has-bottomnav handles layout */}
          <BottomNavigation />
        </div>
      </div>
    );
  }

  // For doctors show persistent doctor nav; for pharmacists show sidebar layout consistent with theme
  return (
    <div className="App min-h-screen bg-gray-50">
      {user.role === 'doctor' ? (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 px-2" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
            <ScrollToTop />
            {(() => {
              const doctorMain = new Set(['/doctor', '/doctor/my-appointments', '/doctor/patients', '/doctor/profile', '/doctor/settings']);
              const isMain = doctorMain.has(location.pathname);
              // Hide global BackButton on call pages to avoid overlap with call UI
              const isCallPage = location.pathname.startsWith('/video-call') || location.pathname.startsWith('/audio-call');
              return (!isMain && !isCallPage) && <BackButton />;
            })()}
            {getRoleBasedRoutes()}
          </main>
          {/* Spacer removed; body padding via .app-has-bottomnav handles layout */}
          <DoctorBottomNavigation />
        </div>
      ) : user.role === 'pharmacist' ? (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 px-2" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
            <ScrollToTop />
            {(() => {
              const pharmMain = new Set(['/pharmacy', '/pharmacy/requests', '/pharmacy/image-requests', '/pharmacy/inventory', '/pharmacy/profile']);
              const isMain = pharmMain.has(location.pathname);
              return !isMain && <BackButton />;
            })()}
            {getRoleBasedRoutes()}
          </main>
          {/* Spacer removed; body padding via .app-has-bottomnav handles layout */}
          {React.createElement(require('./components/PharmacyBottomNavigation').default)}
        </div>
      ) : (
        getRoleBasedRoutes()
      )}
    </div>
  );
}

export default App;