import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { 
  FaUser, 
  FaBirthdayCake, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaHospital,
  FaCheck
} from 'react-icons/fa';

const Appointments = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const selectedDoctor = location.state?.selectedDoctor;
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    healthIssue: '',
    specialist: selectedDoctor?.specialty || '',
    preferredDate: '',
    preferredTime: '',
    hospitalName: 'Civil Hospital'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Specialist options
  const specialists = [
    { key: 'general_physician' },
    { key: 'cardiologist' },
    { key: 'dermatologist' },
    { key: 'pediatrician' },
    { key: 'orthopedic' },
    { key: 'neurologist' },
    { key: 'gynecologist' },
    { key: 'ent_specialist' },
    { key: 'psychiatrist' },
    { key: 'ophthalmologist' }
  ];

  // Hospital options
  const hospitals = [
    { key: 'civil_hospital' },
    { key: 'general_hospital' },
    { key: 'district_hospital' },
    { key: 'primary_health_center' },
    { key: 'community_health_center' }
  ];

  // Time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientName || !formData.age || !formData.healthIssue || 
        !formData.specialist || !formData.preferredDate || !formData.preferredTime) {
      alert(t('validation_required_fields'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate appointment ID
      const id = 'APT' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAppointmentId(id);

      // Persist appointment to localStorage (real user-created data only)
      try {
        const storageKey = 'helio_appointments';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newAppointment = {
          id,
          patientName: formData.patientName,
          patientId: user?.username || 'p001', // Store the patient ID from auth context
          age: formData.age,
          healthIssue: formData.healthIssue,
          specialist: formData.specialist,
          date: formData.preferredDate, // YYYY-MM-DD
          time: formData.preferredTime, // e.g., 04:30 PM
          hospitalName: formData.hospitalName,
          doctor: selectedDoctor?.name || null,
          doctorId: selectedDoctor?.id || null,
          status: 'upcoming',
          createdAt: new Date().toISOString()
        };
        existing.push(newAppointment);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch (err) {
        console.error('Failed to store appointment:', err);
      }

      setShowConfirmation(true);
      setShowToast(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(t('booking_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      patientName: '',
      age: '',
      healthIssue: '',
      specialist: '',
      preferredDate: '',
      preferredTime: '',
      hospitalName: 'Civil Hospital'
    });
    setShowConfirmation(false);
    setAppointmentId('');
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from today)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Show the page always; display inline confirmation card under header when booking succeeds

  // Auto-dismiss the floating toast after 4s
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-bg-secondary py-8 px-4 pb-32 page-centered-mobile">
      <div className="max-w-3xl mx-auto w-full mobile-center-card">
        {/* Page Header (text-only) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t('book_appointment_title')}</h1>
          <p className="text-text-secondary">{t('schedule_your_consultation')}</p>
        </div>

        {/* Inline confirmation that appears under header when showConfirmation is true */}
        {showConfirmation && (
          <div className="max-w-md mx-auto mb-6 w-full px-2">
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-green-100">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('booked_success')}</h2>
              <p className="text-sm text-gray-600 mb-3">{t('booked_note')}</p>

              <div className="bg-white rounded-lg p-3 text-left border">
                <h3 className="font-semibold mb-2">{t('appointment_details')}</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-green-600">{t('appointment_id')}</span><span className="font-medium text-green-700">{appointmentId}</span></div>
                  <div className="flex justify-between"><span className="text-green-600">{t('patient_label')}</span><span className="font-medium text-green-700">{formData.patientName}</span></div>
                  <div className="flex justify-between"><span className="text-green-600">{t('date_time')}</span><span className="font-medium text-green-700">{formData.preferredDate} {formData.preferredTime}</span></div>
                  <div className="flex justify-between"><span className="text-green-600">{t('specialist_label')}</span><span className="font-medium text-green-700">{t(`specialists.${formData.specialist}`) || formData.specialist}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Doctor Details */}
        {selectedDoctor && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-3">{t('selected_doctor')}</h2>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">{selectedDoctor.name}</h3>
                <p className="text-text-primary font-medium">{selectedDoctor.specialty}</p>
                {selectedDoctor.qualifications && (
                  <p className="text-text-secondary text-sm">{selectedDoctor.qualifications}</p>
                )}
                <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                  {selectedDoctor.experience_years && (
                    <span>{selectedDoctor.experience_years} {t('years_experience_other', { count: selectedDoctor.experience_years })}</span>
                  )}
                  {selectedDoctor.languages && <span>{selectedDoctor.languages}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

  {/* Appointment Form */}
  <div className="card w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaUser className="text-primary-color" />
                {t('patient_name')} *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder={t('enter_patient_name')}
                className="input"
                required
              />
            </div>

            {/* Age */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaBirthdayCake className="text-primary-color" />
                {t('age')} *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder={t('enter_age')}
                min="1"
                max="120"
                className="input"
                required
              />
            </div>

            {/* Health Issue */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaFileAlt className="text-primary-color" />
                {t('health_issue')} *
              </label>
              <textarea
                name="healthIssue"
                value={formData.healthIssue}
                onChange={handleInputChange}
                placeholder={t('describe_symptoms')}
                rows="4"
                className="input resize-none"
                required
              />
            </div>

            {/* Specialist Required */}
            <div className="input-group">
              <label className="text-sm font-medium text-text-primary mb-2">{t('specialist_required')} *</label>
              <select
                name="specialist"
                value={formData.specialist}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">{t('select_specialist')}</option>
                {specialists.map((s) => (
                  <option key={s.key} value={s.key}>
                    {t(`specialists.${s.key}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Date */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaCalendarAlt className="text-primary-color" />
                {t('preferred_date')} *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="input"
                required
              />
            </div>

            {/* Preferred Time */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaClock className="text-primary-color" />
                {t('preferred_time')} *
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">{t('select_time')}</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Hospital Name */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaHospital className="text-primary-color" />
                {t('hospital_name')}
              </label>
              <select
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                className="input"
              >
                {hospitals.map((h) => (
                  <option key={h.key} value={t(`hospitals.${h.key}`)}>
                    {t(`hospitals.${h.key}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    style={{ minWidth: 220 }}>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('booking')} {t('appointments')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {t('book_appointment')}
                      </div>
                    )}
                  </button>
                </div>
            </div>
          </form>
        </div>

        {/* Important Information section removed as requested */}

        {/* Floating centered success popup (also appears when confirmation is shown) */}
        {showToast && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto confirmation-toast" style={{zIndex:60}}>
              {t('booked_toast')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;