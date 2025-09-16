import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaVideo, 
  FaCalendar,
  FaUserMd,
  FaMapMarkerAlt,
  FaLanguage,
  FaClock,
  FaMicrophone,
  FaTimes,
  FaPhoneSlash,
  FaPhone,
  FaVolumeUp,
  FaVolumeMute,
  FaSyncAlt,
  FaComments
} from 'react-icons/fa';

import './HomeDoctors.css';
import TransText from '../components/TransText';


const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedDoctorForCall, setSelectedDoctorForCall] = useState(null);

  // Dummy data for demonstration
  const dummyDoctors = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      qualifications: 'MBBS, MD Cardiology',
      experience_years: 15,
      consultation_fee: 500,
      is_available: true,
      languages: 'English, Hindi, Punjabi',
      rating: 4.8,
      total_consultations: 1200,
      profile_image: null
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrics',
      qualifications: 'MBBS, MD Pediatrics',
      experience_years: 10,
      consultation_fee: 400,
      is_available: true,
      languages: 'English, Hindi',
      rating: 4.6,
      total_consultations: 800,
      profile_image: null
    },
    {
      id: '3',
      name: 'Dr. Harpreet Singh',
      specialty: 'General Medicine',
      qualifications: 'MBBS, MD Internal Medicine',
      experience_years: 12,
      consultation_fee: 350,
      is_available: false,
      languages: 'English, Hindi, Punjabi',
      rating: 4.5,
      total_consultations: 950,
      profile_image: null
    },
    {
      id: '4',
      name: 'Dr. Sunita Devi',
      specialty: 'Gynecology',
      qualifications: 'MBBS, MS Gynecology',
      experience_years: 8,
      consultation_fee: 450,
      is_available: true,
      languages: 'English, Hindi, Punjabi',
      rating: 4.7,
      total_consultations: 600,
      profile_image: null
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use dummy data
      // In production, uncomment the API call below
      // const response = await doctorAPI.getAll();
      // setDoctors(response.data);
      
      // Simulate API delay
      setTimeout(() => {
        setDoctors(dummyDoctors);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
      setDoctors(dummyDoctors); // Fallback to dummy data
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesAvailability = !availableOnly || doctor.is_available;
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star" />);
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  const handleConsultNow = (doctorId) => {
    const doctor = filteredDoctors.find(d => d.id === doctorId);
    setSelectedDoctorForCall(doctor);
    setShowConsultModal(true);
  };

  const handleBookAppointment = (doctorId) => {
    const doctor = filteredDoctors.find(d => d.id === doctorId);
    // Navigate to appointments page with doctor data in state
    navigate('/appointments', { 
      state: { selectedDoctor: doctor }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="loading"></div>
          <span className="ml-2">{t('loading_doctors')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Professional Header with Helio Branding */}
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="px-6 text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            {t('welcome_message')}
          </h1>
          <p className="text-xl text-primary-light font-medium">
            {t('app_description')}
          </p>
          <p className="text-primary-light mt-2">
            {t('find_your_doctor')}
          </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 pb-40">
        {/* My Appointments button centered above the Find Your Doctor card */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate('/my-appointments')}
            aria-label={t('my_appointments')}
            className="my-appointments-btn w-full sm:w-auto max-w-xs"
          >
            {t('my_appointments')}
          </button>
        </div>
        {/* Search and Filters - Centered and Professional */}
        <div className="max-w-4xl mx-auto card-elevated" style={{marginBottom: '0.1cm'}}>
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">{t('find_your_doctor')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="input-group">
              <FaSearch className="input-icon" />
              <input
                type="text"
                placeholder={`${t('search')} ${t('doctors').toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input has-icon"
              />
            </div>

            {/* Specialty Filter */}
            <div className="input-group">
              <FaFilter className="input-icon" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="input has-icon"
              >
                <option value="">{t('all_specialties')}</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center justify-center gap-3 py-3">
              <input
                type="checkbox"
                id="availableOnly"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-5 h-5 rounded border-border-color text-primary-color focus:ring-2 focus:ring-primary-color"
              />
              <label htmlFor="availableOnly" className="text-base font-medium text-text-primary">
                {t('available_only')}
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Doctors Grid - Centered and Consistent */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap: '0.1cm'}}>
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="card hover:shadow-lg transition-all duration-300 overflow-hidden border border-border-light flex flex-col h-full">
                {/* Doctor Header */}
                <div className="p-6 pb-4 flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-color to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {doctor.profile_image ? (
                        <img 
                          src={doctor.profile_image} 
                          alt={doctor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUserMd />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-text-primary mb-1 truncate"><TransText text={doctor.name} /></h3>
                      <p className="text-primary-color font-semibold text-lg"><TransText text={doctor.specialty} /></p>
                      <p className="text-sm text-text-secondary mb-2"><TransText text={doctor.qualifications} /></p>
                      
                      {/* Availability Status */}
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        doctor.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.is_available ? t('available') : t('unavailable')}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="doctor-details mb-6">
                    <div className="detail-row">
                      <FaClock className="detail-icon" />
                      <div className="detail-text">{doctor.experience_years} {t('years_experience_other', { count: doctor.experience_years })}</div>
                    </div>

                    <div className="detail-row">
                      <FaLanguage className="detail-icon" />
                      <div className="detail-text"><TransText text={doctor.languages} /></div>
                    </div>

                    <div className="detail-row detail-center">
                      <span className="text-lg font-bold text-success-color">{t('free_consultation')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 mt-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Video Call */}
                    <button
                      onClick={() => {
                        navigate('/video-call', { state: { doctor } });
                      }}
                      disabled={!doctor.is_available}
                      className={`btn btn-success py-2 px-3 text-sm ${
                        doctor.is_available ? '' : 'opacity-60 cursor-not-allowed'
                      }`}
                      aria-label={`${t('consult_now')} ${doctor.name} ${t('video').toLowerCase()}`}
                    >
                      <FaVideo className="text-xs" />
                      {t('video')}
                    </button>

                    {/* Audio Call */}
                    <button
                      onClick={() => {
                        navigate('/audio-call', { state: { doctor } });
                      }}
                      disabled={!doctor.is_available}
                      className={`btn btn-secondary py-2 px-3 text-sm ${
                        doctor.is_available ? '' : 'opacity-60 cursor-not-allowed'
                      }`}
                      aria-label={`${t('consult_now')} ${doctor.name} ${t('audio').toLowerCase()}`}
                    >
                      <FaPhone className="text-xs" />
                      {t('audio')}
                    </button>

                    {/* Book Appointment */}
                    <button
                      onClick={() => handleBookAppointment(doctor.id)}
                      className="btn btn-outline py-2 px-3 text-sm"
                      aria-label={`${t('book_appointment')} ${doctor.name}`}
                    >
                      <FaCalendar className="text-xs" />
                      {t('book')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaUserMd className="mx-auto text-8xl text-text-muted mb-6" />
            <h3 className="text-2xl font-bold text-text-primary mb-4">{t('no_doctors_found')}</h3>
            <p className="text-text-secondary text-lg">
              {t('try_adjusting_filters')}
            </p>
          </div>
        )}
      </div>

      {/* Consultation Type Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="card w-96 max-w-95vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-primary">{t('choose_consultation_type')}</h3>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-text-muted hover:text-text-primary focus-ring p-2 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            {selectedDoctorForCall && (
              <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
                <h4 className="font-medium text-text-primary">{selectedDoctorForCall.name}</h4>
                <p className="text-text-secondary">{selectedDoctorForCall.specialty}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  navigate('/video-call', { state: { doctor: selectedDoctorForCall } });
                }}
                className="btn btn-primary w-full"
              >
                <FaVideo className="text-xl" />
                <span className="font-medium">{t('video')}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  navigate('/audio-call', { state: { doctor: selectedDoctorForCall } });
                }}
                className="btn btn-success w-full"
              >
                <FaMicrophone className="text-xl" />
                <span className="font-medium">{t('audio')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;