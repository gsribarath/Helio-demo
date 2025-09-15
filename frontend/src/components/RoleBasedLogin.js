import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, 
  FaUserMd, 
  FaStethoscope,
  FaPhone, 
  FaKey,
  FaSpinner,
  FaArrowLeft
} from 'react-icons/fa';

const RoleBasedLogin = () => {
  const { t } = useTranslation();
  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('role'); // 'role', 'phone', 'otp', 'name'
  const [selectedRole, setSelectedRole] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    {
      id: 'patient',
      name: t('patient', 'Patient'),
      description: t('patient_desc', 'Book appointments, consult doctors, manage prescriptions'),
      icon: FaUser,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600'
    },
    {
      id: 'doctor',
      name: t('doctor', 'Doctor'),
      description: t('doctor_desc', 'Consult patients, manage appointments, create prescriptions'),
      icon: FaUserMd,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600'
    },
    {
      id: 'pharmacist',
      name: t('pharmacist', 'Pharmacist'),
      description: t('pharmacist_desc', 'Manage medicine inventory, fulfill prescriptions'),
      icon: FaStethoscope,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('phone');
    setError('');
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!phone.trim()) {
      setError(t('phone_required', 'Phone number is required'));
      setLoading(false);
      return;
    }

    try {
      const result = await requestOTP(phone, selectedRole);
      
      if (result.success) {
        setSuccess(t('otp_sent', 'OTP sent successfully!') + (result.otp ? ` OTP: ${result.otp}` : ''));
        setStep('otp');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(t('otp_failed', 'Failed to send OTP'));
    }
    
    setLoading(false);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp.trim()) {
      setError(t('otp_required', 'OTP is required'));
      setLoading(false);
      return;
    }

    try {
      // For new users, ask for name first
      if (!name.trim()) {
        setStep('name');
        setLoading(false);
        return;
      }

      const result = await verifyOTP(phone, otp, selectedRole, name);
      
      if (result.success) {
        // Redirect based on role
        const roleRoutes = {
          patient: '/patient/home',
          doctor: '/doctor/dashboard',
          pharmacist: '/pharmacy/dashboard'
        };
        
        navigate(roleRoutes[selectedRole] || '/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(t('verification_failed', 'Verification failed'));
    }
    
    setLoading(false);
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('name_required', 'Name is required'));
      return;
    }

    // Now proceed with OTP verification
    await handleOTPSubmit(e);
  };

  const goBack = () => {
    if (step === 'phone') setStep('role');
    else if (step === 'otp') setStep('phone');
    else if (step === 'name') setStep('otp');
    setError('');
    setSuccess('');
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('welcome_helio', 'Welcome to Helio')}
            </h1>
            <p className="text-gray-600">
              {t('rural_healthcare', 'Rural Healthcare Made Simple')}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              {['role', 'phone', 'otp', 'name'].map((stepName, index) => (
                <React.Fragment key={stepName}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName 
                      ? 'bg-blue-500 text-white' 
                      : index < ['role', 'phone', 'otp', 'name'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-6 h-0.5 bg-gray-200"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          {step === 'role' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">
                {t('select_role', 'Select Your Role')}
              </h2>
              
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 
                      transition-all duration-200 text-left group hover:shadow-md`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center text-white`}>
                        <IconComponent className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${role.textColor}`}>{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Phone Number Input */}
          {step === 'phone' && (
            <div>
              {step !== 'role' && (
                <button
                  onClick={goBack}
                  className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
                >
                  <FaArrowLeft className="mr-2" />
                  {t('back', 'Back')}
                </button>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${selectedRoleData?.color} text-white mb-4`}>
                  <selectedRoleData.icon className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">
                  {t('enter_phone', 'Enter Your Phone Number')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('otp_will_be_sent', 'We\'ll send you an OTP for verification')}
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phone_placeholder', '+91 98765 43210')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('sending', 'Sending...')}
                    </>
                  ) : (
                    t('send_otp', 'Send OTP')
                  )}
                </button>
              </form>
            </div>
          )}

          {/* OTP Input */}
          {step === 'otp' && (
            <div>
              <button
                onClick={goBack}
                className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
              >
                <FaArrowLeft className="mr-2" />
                {t('back', 'Back')}
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white mb-4">
                  <FaKey className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">
                  {t('enter_otp', 'Enter OTP')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('otp_sent_to', 'OTP sent to')} {phone}
                </p>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('otp_placeholder', 'Enter 6-digit OTP')}
                    maxLength="6"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  />
                </div>

                {success && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('verifying', 'Verifying...')}
                    </>
                  ) : (
                    t('verify_otp', 'Verify OTP')
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePhoneSubmit({ preventDefault: () => {} })}
                  className="w-full text-blue-500 hover:text-blue-600 py-2"
                >
                  {t('resend_otp', 'Resend OTP')}
                </button>
              </form>
            </div>
          )}

          {/* Name Input */}
          {step === 'name' && (
            <div>
              <button
                onClick={goBack}
                className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
              >
                <FaArrowLeft className="mr-2" />
                {t('back', 'Back')}
              </button>

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${selectedRoleData?.color} text-white mb-4`}>
                  <selectedRoleData.icon className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">
                  {t('enter_name', 'Enter Your Name')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('name_for_profile', 'This will be used for your profile')}
                </p>
              </div>

              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('name_placeholder', 'Enter your full name')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('completing', 'Completing...')}
                    </>
                  ) : (
                    t('complete_signup', 'Complete Sign Up')
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            {t('have_account', 'Already have an account?')}{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600">
              {t('sign_in', 'Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLogin;