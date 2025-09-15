import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
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
  const { t } = useTranslation();
  const location = useLocation();
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
    'Government General Hospital',
    'District Hospital',
    'Primary Health Center',
    'Community Health Center'
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
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate appointment ID
      const id = 'APT' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAppointmentId(id);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
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

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-bg-secondary py-8 px-4 pb-40">
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Appointment Confirmed!</h2>
              <p className="text-text-secondary">Your appointment has been successfully booked.</p>
            </div>
            
            <div className="bg-bg-secondary rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-text-primary mb-4">Appointment Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Appointment ID:</span>
                  <span className="font-medium text-primary-color">{appointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Patient Name:</span>
                  <span className="font-medium text-text-primary">{formData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Age:</span>
                  <span className="font-medium text-text-primary">{formData.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Date & Time:</span>
                  <span className="font-medium text-text-primary">{formData.preferredDate} at {formData.preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Specialist:</span>
                  <span className="font-medium text-text-primary">{formData.specialist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Hospital:</span>
                  <span className="font-medium text-text-primary">{formData.hospitalName}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-text-secondary mb-6">
              <p>📱 SMS confirmation sent to your phone</p>
              <p>📧 Email confirmation sent to your email</p>
            </div>
            
            <button
              onClick={handleReset}
              className="btn btn-primary"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-8 px-4 pb-32">
      <div className="max-w-3xl mx-auto">
        {/* Page Header (text-only) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Book Appointment</h1>
          <p className="text-text-secondary">Schedule your consultation with our healthcare professionals</p>
        </div>

        {/* Selected Doctor Details */}
        {selectedDoctor && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-3">Selected Doctor</h2>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">{selectedDoctor.name}</h3>
                <p className="text-text-primary font-medium">{selectedDoctor.specialty}</p>
                {selectedDoctor.qualifications && (
                  <p className="text-text-secondary text-sm">{selectedDoctor.qualifications}</p>
                )}
                <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                  {selectedDoctor.experience_years && (
                    <span>{selectedDoctor.experience_years} years experience</span>
                  )}
                  {selectedDoctor.languages && <span>{selectedDoctor.languages}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaUser className="text-primary-color" />
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Enter patient name"
                className="input"
                required
              />
            </div>

            {/* Age */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaBirthdayCake className="text-primary-color" />
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter age"
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
                Health Issue *
              </label>
              <textarea
                name="healthIssue"
                value={formData.healthIssue}
                onChange={handleInputChange}
                placeholder="Describe your symptoms or health concerns"
                rows="4"
                className="input resize-none"
                required
              />
            </div>

            {/* Specialist Required */}
            <div className="input-group">
              <label className="text-sm font-medium text-text-primary mb-2">
                Specialist Required *
              </label>
              <select
                name="specialist"
                value={formData.specialist}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select specialist</option>
                {specialists.map((specialist) => (
                  <option key={specialist} value={specialist}>
                    {specialist}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Date */}
            <div className="input-group">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <FaCalendarAlt className="text-primary-color" />
                Preferred Date *
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
                Preferred Time *
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select time</option>
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
                Hospital Name
              </label>
              <select
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                className="input"
              >
                {hospitals.map((hospital) => (
                  <option key={hospital} value={hospital}>
                    {hospital}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary w-full ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking Appointment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Book Appointment
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Information section removed as requested */}
      </div>
    </div>
  );
};

export default Appointments;