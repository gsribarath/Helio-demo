import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaVideo, FaPhone, FaClock, FaUser, FaLanguage, FaInfoCircle } from 'react-icons/fa';
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import '../HomeDoctors.css';

const DoctorHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [toast, setToast] = useState(null); // {message, type}
  const toastTimerRef = useRef(null);

  // Doctor identity (demo assumption)
  const DOCTOR_ID = '1';
  const DOCTOR_NAME = 'Dr. Rajesh Kumar';

  const loadAppointments = useCallback(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const parsed = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(parsed)
        ? parsed.filter(a => ((a?.doctorId === DOCTOR_ID) || (a?.doctor === DOCTOR_NAME)) && (a.status === 'upcoming' || a.status === 'in_progress')) // show new + accepted
        : [];
      // Map to card-friendly shape (add fallbacks)
      const mapped = filtered.map(a => ({
        id: a.id,
        time: a.time || '—',
        date: a.date || '',
        patient: a.patientName || 'Patient',
        reason: a.healthIssue || 'General Consultation',
        status: a.status || 'upcoming',
        age: a.age || '-',
        languages: a.languages || ['English'],
        freeConsultation: true
      }));
      setAppointments(mapped);
    } catch (e) {
      console.error('Failed to load doctor appointments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments, refreshTick]);

  // Removed time-based auto-expire; movement now based solely on acceptance status change

  // Listen for storage changes (other tab / booking) & focus refresh
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'helio_appointments') {
        loadAppointments();
      }
    };
    const onFocus = () => setRefreshTick(t => t + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAppointments]);

  const updateStatus = (id, newStatus) => {
    try {
      const key = 'helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      let acceptedAppt = null;
      const updated = arr.map(a => {
          if (a.id === id) {
            if (newStatus === 'in_progress') {
              const next = { ...a, status: 'in_progress', acceptedAt: new Date().toISOString() };
              acceptedAppt = next;
              return next;
            }
            if (newStatus === 'waiting') {
              return { ...a, status: 'waiting', movedWaitingAt: new Date().toISOString() };
            }
            return { ...a, status: newStatus };
          }
          return a;
        });
      localStorage.setItem(key, JSON.stringify(updated));
      loadAppointments();
  if (newStatus === 'in_progress') {
        // Show acceptance toast
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message: 'Request Accepted', type: 'success' });
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
        // Redirect to consultation page with patient details
        if (acceptedAppt) {
          setTimeout(() => {
            navigate(`/doctor/consult/${acceptedAppt.id}`, { state: { appointment: acceptedAppt } });
          }, 400); // slight delay for UX
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const statusStyles = (status) => {
    switch (status) {
      case 'in_progress': 
        return 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm';
      case 'waiting': 
        return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      case 'completed': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      case 'upcoming':
        return 'bg-gray-50 text-gray-700 border-gray-200 shadow-sm';
      default: 
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28" style={{paddingBottom:0}}>
      {/* Personalized Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-10 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
          {`Welcome to Helio, ${DOCTOR_NAME}`}
        </h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
          Manage and track all your patient appointments in real-time. New bookings made by patients appear here automatically.
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          {t('upcoming_appointments', 'Upcoming Appointments')}
        </h2>

        {appointments.length === 0 && (
          <div className="max-w-xl mx-auto text-center bg-white border border-border-light rounded-xl p-8 shadow-sm">
            <p className="text-lg font-medium text-gray-800 mb-2">No appointments yet</p>
            <p className="text-sm text-gray-600">When a patient books a consultation with you, it will appear here instantly.</p>
          </div>
        )}

        {/* Grid just like patient doctor listing for consistent card width */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '0.1cm' }}>
            {appointments.map(appt => (
              <div key={appt.id} className="card hover:shadow-lg transition-all duration-300 overflow-hidden border border-border-light flex flex-col h-full">
                <div className="p-6 pb-4 flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-color to-primary-dark rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      <FaUser />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-text-primary mb-1 truncate">{appt.patient}</h3>
                      <p className="text-primary-color font-semibold text-sm mb-1">{appt.reason}</p>
                      <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold mb-2">Available</div>

                      <div className="doctor-details mb-2">
                        <div className="detail-row">
                          <FaClock className="detail-icon" />
                          <div className="detail-text">{appt.date ? `${appt.date} • ${appt.time}` : appt.time}</div>
                        </div>
                        <div className="detail-row">
                          <FaUser className="detail-icon" />
                          <div className="detail-text">{appt.age} yrs</div>
                        </div>
                        <div className="detail-row">
                          <FaLanguage className="detail-icon" />
                          <div className="detail-text">{appt.languages.join(', ')}</div>
                        </div>
                        {appt.freeConsultation && (
                          <div className="detail-row detail-center mt-1">
                            <span className="text-success-color font-semibold text-sm">Free Consultation</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 mt-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateStatus(appt.id, 'in_progress')}
                      className="btn btn-success py-2 px-3 text-sm"
                      aria-label={`Accept consultation for ${appt.patient}`}
                    >
                      {t('accept', 'Accept')}
                    </button>
                    <button
                      onClick={() => updateStatus(appt.id, 'waiting')}
                      className="btn btn-secondary py-2 px-3 text-sm"
                      aria-label={`Keep ${appt.patient} waiting`}
                    >
                      {t('keep_waiting', 'Keep Waiting')}
                    </button>
                    <button
                      onClick={() => navigate(`/doctor/patient/${appt.id}`, { state: { appointment: appt } })}
                      className="btn btn-outline py-2 px-3 text-sm"
                      aria-label={`View info for ${appt.patient}`}
                    >
                      <FaInfoCircle className="text-xs mr-2" /> {t('info', 'Info')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && (
        <div role="alert" className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-800'}`}> 
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DoctorHome;
