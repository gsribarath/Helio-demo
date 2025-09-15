import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import Login from './components/Login';

// Pages
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Availability from './pages/Availability';
import Appointments from './pages/Appointments';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import VideoCallPage from './pages/VideoCallPage';
import AudioCallPage from './pages/AudioCallPage';
import Reports from './pages/Reports';

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Pages that should not show navigation
  const fullScreenPages = ['/video-call', '/audio-call'];
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

  // Role-based dashboard routing
  const getRoleBasedRoutes = () => {
    if (user.role === 'patient') {
      return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/medicines" element={<Medicines />} />
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
      // Doctor dashboard routes (to be implemented)
      return (
        <Routes>
          <Route path="/" element={<div className="p-6"><h1 className="text-2xl font-bold">Doctor Dashboard</h1><p>Welcome, Dr. {user.profile?.first_name || user.username}!</p><button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    } else if (user.role === 'pharmacist') {
      // Pharmacist dashboard routes (to be implemented)
      return (
        <Routes>
          <Route path="/" element={<div className="p-6"><h1 className="text-2xl font-bold">Pharmacy Dashboard</h1><p>Welcome, {user.profile?.pharmacy_name || user.username}!</p><button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }
    
    // Fallback for unknown roles
    return (
      <Routes>
        <Route path="*" element={<div className="p-6"><h1>Unknown Role</h1><button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button></div>} />
      </Routes>
    );
  };

  // Full screen pages (like video call) - no navigation
  if (isFullScreenPage) {
    return (
      <div className="App min-h-screen">
        {getRoleBasedRoutes()}
      </div>
    );
  }

  // For patients, show the existing interface with navigation
  if (user.role === 'patient') {
    return (
      <div className="App min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          <main
            className="flex-1"
            style={{
              paddingTop: '64px', // equal to header height
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', // taller solid footer clearance
              minHeight: 'calc(100vh - 144px)' // ensure content takes full height minus header and footer
            }}
          >
            {getRoleBasedRoutes()}
          </main>
          {/* Global spacer to prevent overlap with fixed bottom nav */}
          <div
            aria-hidden="true"
            style={{ height: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}
          />
          <BottomNavigation />
        </div>
      </div>
    );
  }

  // For doctors and pharmacists, show simple dashboard without patient navigation
  return (
    <div className="App min-h-screen bg-gray-50">
      {getRoleBasedRoutes()}
    </div>
  );
}

export default App;