import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FaStethoscope, FaEye, FaEyeSlash, FaUser, FaUserMd } from 'react-icons/fa';

const Register = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'patient',
    phone: '',
    specialty: '',
    qualifications: '',
    age: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await authAPI.register(registrationData);
      const { access_token, user_type } = response.data;
      
      login(access_token, { 
        email: formData.email, 
        user_type,
        name: formData.name
      });
      
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || t('registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-success-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaStethoscope className="text-4xl text-primary-color" />
            <h1 className="text-3xl font-bold text-text-primary">Helio</h1>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Join {t('app_title').split(' - ')[0]}</h2>
          <p className="text-text-secondary">{t('app_description')}</p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t('register')}</h3>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div className="input-group">
              <label className="label">{t('user_type')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-colors focus-ring ${
                  formData.user_type === 'patient' 
                    ? 'border-primary-color bg-primary-light text-primary-color' 
                    : 'border-border-color hover:border-border-dark'
                }`}>
                  <input
                    type="radio"
                    name="user_type"
                    value="patient"
                    checked={formData.user_type === 'patient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FaUser className="mx-auto mb-2 text-xl" />
                  <div className="font-medium">{t('patient')}</div>
                </label>
                
                <label className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-colors focus-ring ${
                  formData.user_type === 'doctor' 
                    ? 'border-primary-color bg-primary-light text-primary-color' 
                    : 'border-border-color hover:border-border-dark'
                }`}>
                  <input
                    type="radio"
                    name="user_type"
                    value="doctor"
                    checked={formData.user_type === 'doctor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FaUserMd className="mx-auto mb-2 text-xl" />
                  <div className="font-medium">{t('doctor')}</div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="input-group">
              <label htmlFor="name" className="label">{t('name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email" className="label">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone" className="label">{t('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Patient-specific fields */}
            {formData.user_type === 'patient' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label htmlFor="age" className="label">{t('age')}</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="input"
                      placeholder="25"
                      min="1"
                      max="150"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="gender" className="label">{t('gender')}</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {formData.user_type === 'doctor' && (
              <>
                <div className="input-group">
                  <label htmlFor="specialty" className="label">{t('specialty')}</label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="input"
                    placeholder="Cardiology, Pediatrics, etc."
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="qualifications" className="label">{t('qualifications')}</label>
                  <input
                    type="text"
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="input"
                    placeholder="MBBS, MD, etc."
                  />
                </div>
              </>
            )}

            {/* Password fields */}
            <div className="input-group">
              <label htmlFor="password" className="label">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary focus-ring rounded"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword" className="label">{t('confirm_password')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                t('register')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-color font-medium hover:underline focus-ring rounded"
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;