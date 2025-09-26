import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle, FaUserClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DoctorSettings = () => {
  const { t } = useTranslation();
  const [emergency, setEmergency] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-2xl mx-auto px-4">
        <header className="py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings')}</h1>
          <p className="text-gray-600">{t('settings_overview_copy','Personalize your practice preferences')}</p>
        </header>

        <div className="space-y-6">
          {/* Emergency Mode Card */}
          <div className="rx-card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-red-500 text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('emergency_mode','Emergency Mode')}</h2>
                <p className="text-sm text-gray-600">{t('emergency_mode_copy','Enable to accept urgent walk-ins and mark your status as available now.')}</p>
              </div>
            </div>
            <button 
              onClick={() => setEmergency(e => !e)} 
              className={`btn w-full py-3 font-medium transition-colors ${
                emergency 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {emergency ? t('emergency_on','Emergency ON') : t('enable','Enable')}
            </button>
          </div>

          {/* Availability & Scheduling Card */}
          <div className="rx-card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaUserClock className="text-blue-500 text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('availability_management','Availability & Scheduling')}</h2>
                <p className="text-sm text-gray-600">{t('availability_settings_copy','Adjust weekly slots, pauses and slot duration.')}.</p>
              </div>
            </div>
            <Link 
              to="/availability" 
              className="btn btn-blue w-full text-center py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              {t('manage_availability','Manage Availability')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
