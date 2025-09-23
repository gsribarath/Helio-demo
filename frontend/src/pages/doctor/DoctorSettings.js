import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle, FaUserClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DoctorSettings = () => {
  const { t } = useTranslation();
  const [emergency, setEmergency] = useState(false);

  return (
    <div className="pb-32 px-4">
      <header className="py-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('settings')}</h1>
        <p className="text-gray-600 text-sm">{t('settings_overview_copy','Personalize your practice preferences')}</p>
      </header>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaExclamationTriangle className="text-red-500" /> {t('emergency_mode','Emergency Mode')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('emergency_mode_copy','Enable to accept urgent walk-ins and mark your status as available now.')}</p>
          <button onClick={() => setEmergency(e => !e)} className={`w-full rounded-lg py-3 text-sm font-medium ${emergency ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>{emergency ? t('emergency_on','Emergency ON') : t('enable','Enable')}</button>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaUserClock className="text-blue-500" /> {t('availability_management','Availability & Scheduling')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('availability_settings_copy','Adjust weekly slots, pauses and slot duration')}.</p>
          <Link to="/availability" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-medium">{t('manage_availability','Manage Availability')}</Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
