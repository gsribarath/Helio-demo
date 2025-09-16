import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';
import { useNavigate } from 'react-router-dom';

const Availability = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Complete list of 23 doctors with availability data
  const doctorsData = [
    { id: 'D01', name: 'Dr. Rajesh Kumar', specialty: 'Cardiology', location: 'Civil Hospital', timing: '9:00 AM - 2:00 PM', status: 'Available', experience: '15 years' },
    { id: 'D02', name: 'Dr. Priya Sharma', specialty: 'Pediatrics', location: 'District Hospital', timing: '10:00 AM - 4:00 PM', status: 'Available', experience: '12 years' },
    { id: 'D03', name: 'Dr. Amit Singh', specialty: 'General Medicine', location: 'Primary Health Center', timing: '8:30 AM - 1:30 PM', status: 'Busy', experience: '8 years' },
    { id: 'D04', name: 'Dr. Sunita Verma', specialty: 'Gynecology', location: 'Women\'s Hospital', timing: '11:00 AM - 5:00 PM', status: 'Available', experience: '18 years' },
    { id: 'D05', name: 'Dr. Rohit Mehta', specialty: 'Orthopedic', location: 'Bone & Joint Center', timing: '9:30 AM - 3:30 PM', status: 'Available', experience: '20 years' },
    { id: 'D06', name: 'Dr. Kavita Joshi', specialty: 'Dermatology', location: 'Skin Care Clinic', timing: '2:00 PM - 7:00 PM', status: 'Available', experience: '10 years' },
    { id: 'D07', name: 'Dr. Manoj Agarwal', specialty: 'ENT', location: 'ENT Specialty Center', timing: '10:30 AM - 4:30 PM', status: 'Busy', experience: '14 years' },
    { id: 'D08', name: 'Dr. Neha Gupta', specialty: 'Ophthalmology', location: 'Eye Care Hospital', timing: '9:00 AM - 1:00 PM', status: 'Available', experience: '9 years' },
    { id: 'D09', name: 'Dr. Vikram Rai', specialty: 'Neurology', location: 'Neuro Sciences Center', timing: '11:30 AM - 5:30 PM', status: 'Available', experience: '22 years' },
    { id: 'D10', name: 'Dr. Anjali Chopra', specialty: 'Psychiatry', location: 'Mental Health Clinic', timing: '3:00 PM - 8:00 PM', status: 'Available', experience: '16 years' },
    { id: 'D11', name: 'Dr. Sanjay Tiwari', specialty: 'Urology', location: 'Kidney & Urology Center', timing: '8:00 AM - 12:00 PM', status: 'Busy', experience: '19 years' },
    { id: 'D12', name: 'Dr. Rekha Pandey', specialty: 'Endocrinology', location: 'Diabetes Care Center', timing: '10:00 AM - 3:00 PM', status: 'Available', experience: '13 years' },
    { id: 'D13', name: 'Dr. Deepak Jain', specialty: 'Gastroenterology', location: 'Digestive Health Center', timing: '9:30 AM - 2:30 PM', status: 'Available', experience: '17 years' },
    { id: 'D14', name: 'Dr. Pooja Saxena', specialty: 'Rheumatology', location: 'Joint Care Clinic', timing: '1:00 PM - 6:00 PM', status: 'Available', experience: '11 years' },
    { id: 'D15', name: 'Dr. Arjun Malhotra', specialty: 'Oncology', location: 'Cancer Treatment Center', timing: '8:30 AM - 2:30 PM', status: 'Busy', experience: '25 years' },
    { id: 'D16', name: 'Dr. Meera Jain', specialty: 'Pulmonology', location: 'Lung Care Center', timing: '11:00 AM - 4:00 PM', status: 'Available', experience: '14 years' },
    { id: 'D17', name: 'Dr. Ravi Sharma', specialty: 'Nephrology', location: 'Kidney Dialysis Center', timing: '7:00 AM - 12:00 PM', status: 'Available', experience: '18 years' },
    { id: 'D18', name: 'Dr. Shweta Singh', specialty: 'Hematology', location: 'Blood Disorders Clinic', timing: '2:30 PM - 7:30 PM', status: 'Available', experience: '12 years' },
    { id: 'D19', name: 'Dr. Kiran Patel', specialty: 'Infectious Disease', location: 'Infectious Disease Center', timing: '9:00 AM - 1:00 PM', status: 'Busy', experience: '15 years' },
    { id: 'D20', name: 'Dr. Anil Kumar', specialty: 'Emergency Medicine', location: 'Emergency Department', timing: '24/7 On-Call', status: 'Available', experience: '10 years' },
    { id: 'D21', name: 'Dr. Swati Agarwal', specialty: 'Anesthesiology', location: 'Surgery Center', timing: '6:00 AM - 2:00 PM', status: 'Available', experience: '16 years' },
    { id: 'D22', name: 'Dr. Harish Chandra', specialty: 'Radiology', location: 'Imaging Center', timing: '8:00 AM - 5:00 PM', status: 'Available', experience: '21 years' },
    { id: 'D23', name: 'Dr. Nisha Aggarwal', specialty: 'Pathology', location: 'Diagnostic Lab', timing: '7:30 AM - 3:30 PM', status: 'Available', experience: '13 years' }
  ];

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Pediatrics', 
    'General Medicine',
    'Gynecology',
    'Orthopedic',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Neurology',
    'Psychiatry',
    'Urology',
    'Endocrinology',
    'Gastroenterology',
    'Rheumatology',
    'Oncology',
    'Pulmonology',
    'Nephrology',
    'Hematology',
    'Infectious Disease',
    'Emergency Medicine',
    'Anesthesiology',
    'Radiology',
    'Pathology'
  ];

  // Filter doctors based on search and specialty
  const filteredDoctors = doctorsData.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctor) => {
    navigate('/appointments', { state: { selectedDoctor: doctor } });
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header - Match Medicines theme */}
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            {t('doctors')} <span className="text-primary-light">{t('availability')}</span>
          </h1>
          <p className="text-primary-light">{t('availability_hero_copy')}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 pb-40">
        {/* Search and Filter */}
        <div className="card-elevated mb-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="doctor-search" className="block text-sm font-semibold text-text-primary mb-1">{t('search_doctors')}</label>
              <div className="input-wrapper">
                <input
                  id="doctor-search"
                  type="text"
                  placeholder={t('search_doctors_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label={t('clear_search')}
                    className="input-clear-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">{t('filter_by_specialty')}</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="input"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    <TransText text={specialty} />
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="inventory-table doctor-table sticky-header w-full table-fixed text-sm">
              <colgroup>
                <col className="col-doctor-name" />
                <col className="col-timing" />
                <col className="col-book" />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-text-primary">{t('doctors')}</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">{t('timing')}</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">{t('book')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="p-3 align-top break-words" data-label={t('doctors')}>
                      <div className="flex items-start gap-2">
                        <span className={`availability-dot ${doctor.status === 'Available' ? 'available' : 'busy'}`} aria-label={doctor.status === 'Available' ? t('available') : t('busy')} title={doctor.status === 'Available' ? t('available') : t('busy')}>
                          {doctor.status === 'Available' ? '✓' : '✕'}
                        </span>
                        <div>
                          <div className="font-medium text-text-primary leading-snug"><TransText text={doctor.name} /></div>
                          <div className="text-xs text-text-secondary mt-0.5 leading-tight"><TransText text={doctor.location} /></div>
                          <div className="text-xs text-text-primary mt-0.5 font-medium"><TransText text={doctor.specialty} /></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center align-top" data-label={t('timing')}>
                      <span className="text-xs text-text-secondary"><TransText text={doctor.timing} /></span>
                    </td>
                    <td className="p-3 text-center align-top" data-label={t('book')}>
                      {doctor.status === 'Available' ? (
                        <button
                          type="button"
                          onClick={() => handleBookAppointment(doctor)}
                          className="book-text font-semibold text-success link-reset"
                          aria-label={t('book_appointment_with', { name: doctor.name })}
                          title={t('book')}
                        >
                          {t('book')}
                        </button>
                      ) : (
                        <span className="book-text font-semibold text-error" aria-label={t('doctor_busy')}>{t('busy')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary / Empty State */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12 text-text-secondary">{t('no_doctors_found')}</div>
        )}
        {filteredDoctors.length > 0 && (
          <div className="mt-6 text-center text-text-secondary text-sm">
            {t('showing_count_of_total_doctors', { shown: filteredDoctors.length, total: doctorsData.length })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;