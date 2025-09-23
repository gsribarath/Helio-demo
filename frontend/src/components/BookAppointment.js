import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { FaTimes } from 'react-icons/fa';

const BookAppointment = ({ doctor, isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    healthIssue: '',
    specialist: doctor?.specialty || '',
    preferredDate: '',
    preferredTime: '',
    hospitalName: 'Civil Hospital'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  // Scroll to top on modal open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  }, [isOpen]);

  // Specialist options
  const specialists = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic',
    'Neurologist',
    'Gynecologist',
    'ENT Specialist',
    'Psychiatrist',
    'Ophthalmologist'
  ];

  // Hospital options
  const hospitals = [
    'Civil Hospital',
    'District Hospital',
    'Primary Health Center',
    'Community Health Center',
    'Medical College Hospital'
  ];

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  // Handle input changes
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
    setIsSubmitting(true);

    try {
      // Prepare appointment data for API
      const appointmentData = {
        doctor_id: doctor?.id,
        appointment_date: `${formData.preferredDate}T${formData.preferredTime}:00`,
        symptoms: formData.healthIssue,
        consultation_type: 'video',
        duration_minutes: 30,
        notes: `Patient: ${formData.patientName}, Age: ${formData.age}, Specialist: ${formData.specialist}, Hospital: ${formData.hospitalName}`
      };
      
      // Call API to create appointment
      const response = await appointmentAPI.create(appointmentData);
      
      // Generate appointment ID from response or create one
      const id = response.data.appointment_id || 'APT' + Date.now().toString().slice(-6);
      setAppointmentId(id);
      
      // Store appointment locally with patient ID
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
          date: formData.preferredDate,
          time: formData.preferredTime,
          hospitalName: formData.hospitalName,
          doctor: doctor?.name || null,
          doctorId: doctor?.id || null,
          status: 'upcoming',
          durationMinutes: 30, // default duration for auto-complete logic
          createdAt: new Date().toISOString()
        };
        existing.push(newAppointment);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch (err) {
        console.error('Failed to store appointment locally:', err);
      }
      
      // Show confirmation
      setShowConfirmation(true);
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit({
          ...formData,
          doctorId: doctor?.id,
          patientId: user?.username || 'p001',
          appointmentId: id,
          status: 'confirmed'
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and close
  const handleClose = () => {
    setFormData({
      patientName: '',
      age: '',
      healthIssue: '',
      specialist: doctor?.specialty || '',
      preferredDate: '',
      preferredTime: '',
      hospitalName: 'Civil Hospital'
    });
    setShowConfirmation(false);
    setAppointmentId('');
    onClose();
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

  if (!isOpen) return null;

  return (
    <>
      {/* Dark semi-transparent background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out" 
        style={{ zIndex: 99999 }}
        onClick={handleClose}
      ></div>
      
      {/* Modal Content with animations */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" 
        style={{ zIndex: 100000 }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative pointer-events-auto transform transition-all duration-300 ease-in-out animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalAppear 300ms ease-in-out forwards'
          }}
        >
          {/* Close button at top-right */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 bg-white shadow-sm"
            style={{ zIndex: 100001 }}
          >
            <FaTimes className="text-gray-600 text-lg" />
          </button>
        {!showConfirmation ? (
          <>
            {/* Header (text-only) */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">{t('book_appointment_title')}</h2>
              <p className="text-sm text-gray-600">
                {doctor ? `with ${doctor.name}` : 'Schedule your consultation'}
              </p>
            </div>

            {/* Doctor Info (if available) */}
            {doctor && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div>
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Name */}
              <div className="form-group">
                <label className="label">{t('patient_name')}</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder={t('enter_patient_name')}
                  required
                  className="input"
                />
              </div>

              {/* Age */}
              <div className="form-group">
                <label className="label">{t('age')}</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder={t('enter_age')}
                  min="1"
                  max="120"
                  required
                  className="input"
                />
              </div>

              {/* Health Issue */}
              <div className="form-group">
                <label className="label">{t('health_issue')}</label>
                <textarea
                  name="healthIssue"
                  value={formData.healthIssue}
                  onChange={handleInputChange}
                  placeholder={t('describe_symptoms')}
                  required
                  rows="4"
                  className="input resize-none"
                />
              </div>

              {/* Specialist Required */}
              <div className="form-group">
                <label className="label">{t('specialist_required')}</label>
                <select
                  name="specialist"
                  value={formData.specialist}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="">{t('select_specialist')}</option>
                  {specialists.map(specialist => (
                    <option key={specialist} value={specialist}>
                      {specialist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div className="form-group">
                  <label className="label">{t('preferred_date')}</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                    className="input"
                  />
                </div>

                {/* Preferred Time */}
                <div className="form-group">
                  <label className="label">{t('preferred_time')}</label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">{t('select_time')}</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hospital Name */}
              <div className="form-group">
                <label className="label">{t('hospital_name')}</label>
                <select
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  {hospitals.map(hospital => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('booking')}
                    </>
                  ) : (
                    <>{t('book_appointment')}</>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('appointment_booked')}
            </h2>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">{t('appointment_details')}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('appointment_id')}:</span>
                  <span className="font-mono font-semibold text-primary-color">{appointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('patient_name')}:</span>
                  <span className="font-medium">{formData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formData.preferredDate} at {formData.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('specialist_required')}:</span>
                  <span className="font-medium">{formData.specialist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('hospital_name')}:</span>
                  <span className="font-medium">{formData.hospitalName}</span>
                </div>
                {doctor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              <p>📱 {t('sms_confirmation')}</p>
              <p>📧 {t('email_confirmation')}</p>
            </div>
            
            <button
              onClick={handleClose}
              className="btn btn-primary w-full"
            >
              {t('done')}
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default BookAppointment;