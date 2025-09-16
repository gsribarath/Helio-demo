import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaGlobe, 
  FaBell, 
  FaLock, 
  FaUser, 
  FaQuestionCircle,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

const Settings = () => {
  const { t, i18n } = useTranslation();
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    medicines: false,
    news: true,
    email: true,
    sms: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [accountData, setAccountData] = useState({
    email: 'rajesh.kumar@email.com',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210'
  });

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAccountChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('passwords_do_not_match'));
      return;
    }
    // For demo purposes
    alert(t('password_updated_success'));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    // For demo purposes
  alert(t('account_updated_success'));
  };

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-text-secondary">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-color' : 'bg-border-color'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {t('settings')}
        </h1>
        <p className="text-text-secondary">
          {t('manage_account_prefs')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Language Settings */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <FaGlobe className="text-2xl text-primary-color" />
              <h3 className="text-xl font-semibold text-text-primary">{t('language_preferences')}</h3>
            </div>

            <div className="space-y-3">
              {languages.map((language) => (
                <label
                  key={language.code}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    i18n.language === language.code
                      ? 'border-primary-color bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="font-medium text-text-primary">{language.name}</div>
                    <div className="text-sm text-text-secondary">{language.nativeName}</div>
                  </div>
                  <input
                    type="radio"
                    name="language"
                    value={language.code}
                    checked={i18n.language === language.code}
                    onChange={() => handleLanguageChange(language.code)}
                    className="sr-only"
                  />
                  {i18n.language === language.code && (
                    <FaCheck className="text-primary-color" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <FaBell className="text-2xl text-primary-color" />
              <h3 className="text-xl font-semibold text-gray-900">{t('notifications')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('app_notifications')}</h4>
                <div className="space-y-1">
                  <ToggleSwitch
                    checked={notifications.appointments}
                    onChange={() => handleNotificationToggle('appointments')}
                    label={t('appointment_reminders')}
                  />
                  <ToggleSwitch
                    checked={notifications.reminders}
                    onChange={() => handleNotificationToggle('reminders')}
                    label={t('medicine_reminders')}
                  />
                  <ToggleSwitch
                    checked={notifications.medicines}
                    onChange={() => handleNotificationToggle('medicines')}
                    label={t('medicine_stock_alerts')}
                  />
                  <ToggleSwitch
                    checked={notifications.news}
                    onChange={() => handleNotificationToggle('news')}
                    label={t('health_news_tips')}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">{t('communication_prefs')}</h4>
                <div className="space-y-1">
                  <ToggleSwitch
                    checked={notifications.email}
                    onChange={() => handleNotificationToggle('email')}
                    label={t('email_notifications')}
                  />
                  <ToggleSwitch
                    checked={notifications.sms}
                    onChange={() => handleNotificationToggle('sms')}
                    label={t('sms_notifications')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <FaUser className="text-2xl text-primary-color" />
              <h3 className="text-xl font-semibold text-gray-900">{t('account_information')}</h3>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="label">{t('full_name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={accountData.name}
                  onChange={handleAccountChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">{t('email_address')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={accountData.email}
                  onChange={handleAccountChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="label">{t('phone_number')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={accountData.phone}
                  onChange={handleAccountChange}
                  className="input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {t('update_account')}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaLock className="text-2xl text-primary-color" />
                <h3 className="text-xl font-semibold text-gray-900">{t('security')}</h3>
              </div>
              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="btn btn-outline btn-sm"
                >
                  {t('change_password')}
                </button>
              )}
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="label">{t('current_password')}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="label">{t('new_password')}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="label">{t('confirm_new_password')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="btn btn-outline"
                  >
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t('update_password')}
                  </button>
                </div>
              </form>
            )}

            {!showPasswordChange && (
              <div className="text-gray-600">
                {t('last_password_change_never')}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* App Info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FaInfoCircle className="text-2xl text-primary-color" />
              <h3 className="text-lg font-semibold text-gray-900">{t('app_information')}</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('version')}</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('last_updated')}</span>
                <span className="font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('developer')}</span>
                <span className="font-medium">Punjab Govt.</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quick_actions')}</h3>
            
            <div className="space-y-3">
              <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                <FaQuestionCircle />
                {t('help_support')}
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="card bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">{t('privacy_data')}</h4>
            <p className="text-sm text-blue-800 mb-3">
              {t('privacy_copy')}
            </p>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              {t('read_privacy_policy')}
            </button>
          </div>

          {/* Offline Status */}
          <div className="card bg-green-50 border-green-200">
            <h4 className="font-medium text-green-900 mb-2">{t('offline_access')}</h4>
            <p className="text-sm text-green-800 mb-3">
              {t('offline_copy')}
            </p>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('sync_enabled')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;