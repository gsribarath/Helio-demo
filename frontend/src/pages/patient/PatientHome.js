import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendarAlt, 
  FaPills, 
  FaStethoscope, 
  FaFileUpload,
  FaRobot,
  FaBell,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaFilter,
  FaClock
} from 'react-icons/fa';

const PatientHome = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    loadNotifications(); // Load notifications on component mount
  }, []);

  const loadNotifications = () => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('helio_notifications') || '[]');
      const currentPatientId = user?.username || 'p001';
      // Filter notifications for current patient
      const patientNotifications = allNotifications.filter(n => n.patientId === currentPatientId);
      setNotifications(patientNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Listen for storage changes to update notifications in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'helio_notifications') {
        loadNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setNotifications([
        {
          id: 1,
          type: 'appointment',
          title: t('appointment_reminder', 'Appointment Reminder'),
          message: t('appointment_tomorrow', 'You have an appointment with Dr. Priya Sharma tomorrow at 10:00 AM'),
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'medicine',
          title: t('medicine_ready', 'Medicine Ready'),
          message: t('prescription_ready', 'Your prescription is ready for pickup at Kaur Medical Store'),
          time: '1 day ago',
          read: false
        }
      ]);

      setNearbyPharmacies([
        {
          id: 1,
          name: 'Kaur Medical Store',
          address: 'Main Market, Nabha',
          distance: '0.5 km',
          phone: '+919876543213',
          rating: 4.5,
          isOpen: true
        },
        {
          id: 2,
          name: 'Singh Pharmacy',
          address: 'Civil Hospital Road, Nabha',
          distance: '1.2 km',
          phone: '+919876543214',
          rating: 4.2,
          isOpen: false
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActionCards = [
    {
      id: 'my-appointments',
      title: t('my_appointments', 'My Appointments'),
      subtitle: t('view_your_appointments', 'View your scheduled appointments'),
      icon: FaCalendarAlt,
      color: 'bg-indigo-500',
      route: '/my-appointments',
      hasNotification: notifications.filter(n => !n.read && n.type === 'appointment_accepted').length > 0
    },
    {
      id: 'book-appointment',
      title: t('book_appointment', 'Book Appointment'),
      subtitle: t('consult_doctor', 'Consult with a doctor'),
      icon: FaCalendarAlt,
      color: 'bg-blue-500',
      route: '/appointments'
    },
    {
      id: 'my-prescriptions',
      title: t('my_prescriptions', 'My Prescriptions'),
      subtitle: t('view_prescriptions', 'View and download prescriptions'),
      icon: FaPills,
      color: 'bg-green-500',
      route: '/patient/prescriptions'
    },
    {
      id: 'find-medicines',
      title: t('find_medicines', 'Find Medicines'),
      subtitle: t('search_nearby', 'Search medicines in nearby pharmacies'),
      icon: FaSearch,
      color: 'bg-purple-500',
      route: '/patient/medicines'
    },
    {
      id: 'upload-reports',
      title: t('upload_reports', 'Upload Reports'),
      subtitle: t('share_medical_history', 'Share your medical history'),
      icon: FaFileUpload,
      color: 'bg-orange-500',
      route: '/patient/upload'
    },
    {
      id: 'symptom-checker',
      title: t('symptom_checker', 'AI Symptom Checker'),
      subtitle: t('check_symptoms', 'Check symptoms offline'),
      icon: FaRobot,
      color: 'bg-red-500',
      route: '/patient/symptom-checker'
    },
    {
      id: 'nearby-pharmacies',
      title: t('nearby_pharmacies', 'Nearby Pharmacies'),
      subtitle: t('find_pharmacies', 'Find pharmacies near you'),
      icon: FaMapMarkerAlt,
      color: 'bg-indigo-500',
      route: '/patient/pharmacies'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t('welcome_back', 'Welcome back')}, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {t('how_feeling_today', 'How are you feeling today?')}
              </p>
            </div>
            <div className="relative">
              <FaBell className="text-gray-600 text-xl" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.filter(n => !n.read).length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t('notifications', 'Notifications')}
          </h2>
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.message}
                    </p>
                    <p className="text-gray-400 text-xs mt-2 flex items-center">
                      <FaClock className="mr-1" />
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('quick_actions', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActionCards.map((action) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => window.location.href = action.route}
              >
                {/* Notification Badge */}
                {action.hasNotification && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    1
                  </div>
                )}
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <IconComponent className="text-white text-xl" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {action.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby Pharmacies */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('nearby_pharmacies', 'Nearby Pharmacies')}
          </h2>
          <button className="text-blue-500 text-sm">
            {t('view_all', 'View All')}
          </button>
        </div>
        <div className="space-y-3">
          {nearbyPharmacies.slice(0, 2).map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {pharmacy.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pharmacy.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pharmacy.isOpen ? t('open', 'Open') : t('closed', 'Closed')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaMapMarkerAlt className="mr-1" />
                    {pharmacy.address} • {pharmacy.distance}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600 text-sm ml-1">
                        {pharmacy.rating}
                      </span>
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center">
                      <FaPhone className="mr-1" />
                      {t('call', 'Call')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tips */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('health_tips', 'Health Tips')}
        </h2>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center mb-2">
            <FaStethoscope className="mr-2" />
            <h3 className="font-semibold">{t('tip_of_day', 'Tip of the Day')}</h3>
          </div>
          <p className="text-sm opacity-90">
            {t('hydration_tip', 'Drink at least 8 glasses of water daily to maintain good health and support your immune system.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;