import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd,
  FaVideo,
  FaPhone,
  FaComment,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const Schedule = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState('video');
  const [symptoms, setSymptoms] = useState('');

  // Dummy data for demonstration
  const dummyDoctors = [
    { id: '1', name: 'Dr. Rajesh Kumar', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Priya Sharma', specialty: 'Pediatrics' },
    { id: '3', name: 'Dr. Harpreet Singh', specialty: 'General Medicine' },
    { id: '4', name: 'Dr. Sunita Devi', specialty: 'Gynecology' }
  ];

  const dummyAppointments = [
    {
      id: '1',
      doctor_id: '1',
      patient_name: 'Ravi Kumar',
      appointment_date: '2024-01-15T10:00:00',
      duration_minutes: 30,
      status: 'scheduled',
      consultation_type: 'video'
    },
    {
      id: '2',
      doctor_id: '1',
      patient_name: 'Priya Singh',
      appointment_date: '2024-01-15T14:30:00',
      duration_minutes: 30,
      status: 'completed',
      consultation_type: 'video'
    }
  ];

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const slotDuration = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = dummyAppointments.some(apt => {
          const aptTime = new Date(apt.appointment_date);
          const aptHour = aptTime.getHours();
          const aptMinute = aptTime.getMinutes();
          return aptHour === hour && aptMinute === minute && apt.doctor_id === selectedDoctor;
        });

        slots.push({
          time,
          isAvailable: !isBooked,
          isBooked
        });
      }
    }

    return slots;
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
      fetchAppointments();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      // For demo purposes, we'll use dummy data
      setDoctors(dummyDoctors);
      if (dummyDoctors.length > 0) {
        setSelectedDoctor(dummyDoctors[0].id);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors(dummyDoctors);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll generate slots
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      // For demo purposes, we'll use dummy data
      setAppointments(dummyAppointments.filter(apt => apt.doctor_id === selectedDoctor));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setBookingModalOpen(true);
    }
  };

  const handleBookAppointment = async () => {
    // Redirect to appointments page for booking
    navigate('/appointments');
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateNavigation = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    return newDate.toISOString().split('T')[0];
  };

  const isToday = (dateString) => {
    const today = new Date().toDateString();
    const selectedDateObj = new Date(dateString).toDateString();
    return today === selectedDateObj;
  };

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  return (
    <div className="container mx-auto px-4 py-8 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('doctor_schedule')}
        </h1>
        <p className="text-gray-600">
          {t('view_doctor_availability')}
        </p>
      </div>

      {/* Doctor and Date Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Selection */}
          <div>
            <label className="label">{t('select_doctor')}</label>
            <div className="relative">
              <FaUserMd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="input pl-10"
              >
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="label">{t('select_date')}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(getDateNavigation(-1))}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FaChevronLeft />
              </button>
              
              <div className="relative flex-1">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input pl-10"
                />
              </div>
              
              <button
                onClick={() => setSelectedDate(getDateNavigation(1))}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Date Display */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">
                {formatDate(selectedDate)}
                {isToday(selectedDate) && <span className="ml-2 text-sm text-blue-600">({t('today')})</span>}
              </div>
              {selectedDoctorData && (
                <div className="text-sm text-blue-700">
                  <TransText text={`${selectedDoctorData.name} - ${selectedDoctorData.specialty}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaClock className="text-primary-color" />
          {t('available_time_slots')}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading"></div>
            <span className="ml-2">{t('loading_slots')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleSlotClick(slot)}
                disabled={!slot.isAvailable}
                className={`p-3 text-center rounded-lg border-2 transition-all ${
                  slot.isAvailable
                    ? 'border-green-300 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100 cursor-pointer'
                    : 'border-red-300 bg-red-50 text-red-800 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="font-medium">{formatTime(slot.time)}</div>
                <div className="text-xs mt-1 flex items-center justify-center gap-1">
                  {slot.isAvailable ? (
                    <>
                      <FaCheckCircle className="text-green-600" />
                      {t('available')}
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-600" />
                      {t('booked')}
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {availableSlots.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {t('no_slots_for_date')}
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('appointments_for_date', { date: formatDate(selectedDate) })}
        </h3>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-color rounded-full flex items-center justify-center text-white font-medium">
                    {appointment.patient_name.charAt(0)}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900"><TransText text={appointment.patient_name} /></div>
                    <div className="text-sm text-gray-600">
                      {formatTime(new Date(appointment.appointment_date).toTimeString().slice(0, 5))} - 
                      {appointment.duration_minutes} {t('minutes')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {appointment.consultation_type === 'video' && <FaVideo className="text-blue-600" />}
                    {appointment.consultation_type === 'phone' && <FaPhone className="text-green-600" />}
                    {appointment.consultation_type === 'chat' && <FaComment className="text-purple-600" />}
                    <span className="text-sm text-gray-600 capitalize">
                      {appointment.consultation_type}
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <TransText text={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('no_appointments_for_date')}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('book_appointment')}
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">
                  {selectedDoctorData?.name}
                </div>
                <div className="text-sm text-blue-700">
                  {formatDate(selectedDate)} at {selectedSlot && formatTime(selectedSlot.time)}
                </div>
              </div>

              <div>
                <label className="label">{t('consultation_type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'video', icon: FaVideo, label: t('video') },
                    { value: 'phone', icon: FaPhone, label: t('phone') },
                    { value: 'chat', icon: FaComment, label: t('chat') }
                  ].map(({ value, icon: Icon, label }) => (
                    <label
                      key={value}
                      className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-colors ${
                        consultationType === value
                          ? 'border-primary-color bg-primary-light text-primary-color'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value={value}
                        checked={consultationType === value}
                        onChange={(e) => setConsultationType(e.target.value)}
                        className="sr-only"
                      />
                      <Icon className="mx-auto mb-1" />
                      <div className="text-sm font-medium">{label}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="symptoms" className="label">{t('symptoms_optional')}</label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t('describe_symptoms_placeholder')}
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="btn btn-outline flex-1"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleBookAppointment}
                  className="btn btn-primary flex-1"
                >
                  {t('book_appointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;