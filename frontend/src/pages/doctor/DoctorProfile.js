import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FaUserMd, FaLanguage, FaClock, FaGraduationCap, FaPhone, FaEnvelope, FaHeartbeat, FaUserCheck } from 'react-icons/fa';

const DoctorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const mockProfile = {
    name: user?.name || 'Dr. Rajesh Kumar',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD (Cardiology)',
    experience_years: 15,
    languages: 'English, Hindi, Punjabi',
    phone: '+91 98765 43210',
    email: 'dr.rajesh@example.com',
    registrationNo: 'MCI/DEL/2009/4521',
    upi: 'drrajesh@upi',
    consultationModes: 'In-Person, Video, Telephone',
    bio: 'Committed to providing accessible cardiac care with a preventive focus for rural communities.'
  };

  // Weekly schedule removed per request

  const services = ['ECG Review','Hypertension Clinic','Diabetes Risk Assessment','Lifestyle Counseling','Cardiac Risk Profiling','Medication Optimization'];

  return (
    <div className="pb-32 px-4 max-w-5xl">
      <header className="py-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left">{t('profile')}</h1>
        <p className="text-gray-600 text-sm text-left">{t('profile_overview_copy','Manage your professional information')}</p>
      </header>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-semibold text-gray-800 leading-tight m-0">{mockProfile.name}</h2>
            <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">{mockProfile.specialty}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{mockProfile.bio}</p>

          <div className="grid sm:grid-cols-3 gap-6 pt-2 text-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('registration_no','Registration No')}</p>
              <p className="font-medium">{mockProfile.registrationNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('experience','Experience')}</p>
              <p className="font-medium tabular-nums">{mockProfile.experience_years} {t('years_experience_other',{count: mockProfile.experience_years})}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('qualifications','Qualifications')}</p>
              <p className="font-medium">{mockProfile.qualifications}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('consultation_modes','Consultation Modes')}</p>
              <p className="font-medium">{mockProfile.consultationModes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('languages','Languages')}</p>
              <p className="font-medium">{mockProfile.languages}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('upi_id','UPI ID')}</p>
              <p className="font-medium">{mockProfile.upi}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-5xl">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaGraduationCap className="text-blue-500"/> {t('credentials_contact','Credentials & Contact')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-2">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('phone','Phone')}</p>
              <p className="font-medium tabular-nums">{mockProfile.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('email','Email')}</p>
              <p className="font-medium break-all">{mockProfile.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('registration_no','Registration No')}</p>
              <p className="font-medium">{mockProfile.registrationNo}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('upi_id','UPI ID')}</p>
              <p className="font-medium">{mockProfile.upi}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaHeartbeat className="text-red-500"/> {t('professional_focus','Professional Focus')}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{t('professional_focus_copy','Special interest in preventive cardiology, hypertension management, and lifestyle counseling for early intervention.')}</p>
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('services_offered','Services Offered')}</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {services.map(s => <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-8 max-w-5xl">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaUserCheck className="text-indigo-500"/> {t('practice_snapshot','Practice Snapshot')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1">{t('avg_consult_time','Avg Consult Time')}</p>
            <p className="text-lg font-semibold tabular-nums">18 <span className="text-xs font-normal text-slate-500">min</span></p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1">{t('retention_rate','Retention Rate')}</p>
            <p className="text-lg font-semibold tabular-nums">88%</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1">{t('followups_scheduled','Follow-ups')}</p>
            <p className="text-lg font-semibold tabular-nums">9 <span className="text-xs text-slate-500 font-normal">{t('today','Today')}</span></p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1">{t('no_shows','No-Shows')}</p>
            <p className="text-lg font-semibold tabular-nums">3 <span className="text-xs text-slate-500 font-normal">{t('today','Today')}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
