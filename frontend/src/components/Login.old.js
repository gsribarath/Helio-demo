import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, 
  FaUserMd, 
  FaPills, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaHeartbeat,
  FaChevronDown,
  FaInfoCircle,
  FaGlobe,
  FaShieldAlt,
  FaRocket,
  FaBolt,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaLock,
  FaArrowRight
} from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('role'); // role, credentials
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const roles = [
    {
      id: 'patient',
      name: t('patient') || 'Patient',
      icon: FaUser,
      gradient: 'from-cyan-400 to-blue-500',
      glowColor: 'cyan',
      description: 'Access medical consultations and health records',
      usernamePrefix: 'p',
      sampleUsername: 'p001'
    },
    {
      id: 'doctor',
      name: t('doctor') || 'Doctor',
      icon: FaUserMd,
      gradient: 'from-emerald-400 to-teal-500',
      glowColor: 'emerald',
      description: 'Manage appointments and patient consultations',
      usernamePrefix: 'd',
      sampleUsername: 'd001'
    },
    {
      id: 'pharmacist',
      name: t('pharmacist') || 'Pharmacist',
      icon: FaPills,
      gradient: 'from-violet-400 to-purple-500',
      glowColor: 'violet',
      description: 'Manage prescriptions and medicine inventory',
      usernamePrefix: 'pm',
      sampleUsername: 'pm001'
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('credentials');
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting login with:', { username, role: selectedRole });
      
      // Username-only auth (no email supported)
      const payload = {
        username: username,
        password: password
      };
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📡 Response status:', response.status);
      
  let data = {};
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response');
      }
      console.log('� Response data:', data);
      
      if (response.ok) {
        // Accept either 'token' or 'access_token' from backend
        const token = data.token || data.access_token;
        const user = data.user || {
          id: data.id || data.user_id,
          role: data.role || data.user_type,
          username: data.username || username,
        };
        
        if (!token) {
          throw new Error('Missing token in response');
        }
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Login successful, redirecting...');
        
        // Call onLogin with user data
        onLogin({
          ...user,
          token
        });
      } else {
        console.error('❌ Login failed:', data);
        // Normalize error message
        const serverMsg = data?.message || data?.error || 'Login failed';
        setError(serverMsg);
      }
    } catch (err) {
      console.error('🚨 Login error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please ensure the backend is running on http://localhost:5000');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const getCurrentRole = () => {
    return roles.find(role => role.id === selectedRole);
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole('');
    setError('');
    setUsername('');
    setPassword('');
  };

  const getPasswordForRole = (role) => {
    switch(role) {
      case 'patient': return 'patient123';
      case 'doctor': return 'doctor123';
      case 'pharmacist': return 'pharmacy123';
      default: return '';
    }
  };

  const fillSampleCredentials = () => {
    const role = getCurrentRole();
    if (role) {
      setUsername(role.sampleUsername);
      setPassword(getPasswordForRole(selectedRole));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-indigo-900">
      {/* Enhanced Futuristic Animated Background */}
      <div className="absolute inset-0">
        {/* Flowing Wave Patterns with Enhanced Glassmorphism */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/25 via-purple-500/25 via-pink-500/25 to-blue-500/25 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/40 to-cyan-500/40 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/40 to-purple-500/40 rounded-full filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/40 to-teal-500/40 rounded-full filter blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-pink-400/35 to-rose-500/35 rounded-full filter blur-3xl animate-float-reverse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full filter blur-3xl animate-float-slow-reverse"></div>
        </div>
        
        {/* Enhanced 3D Abstract Shapes */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 transform rotate-45 rounded-3xl animate-spin-slow shadow-2xl"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-600 transform rotate-12 rounded-full animate-pulse shadow-xl"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 transform -rotate-45 rounded-2xl animate-bounce shadow-lg"></div>
          <div className="absolute top-1/3 left-1/2 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 transform rotate-12 rounded-xl animate-pulse shadow-lg"></div>
          <div className="absolute bottom-1/2 left-1/4 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-600 transform -rotate-12 rounded-2xl animate-float shadow-xl"></div>
        </div>
        
        {/* Enhanced Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='7' r='1'/%3E%3Ccircle cx='7' cy='37' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}>
        </div>
        
        {/* New Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation with Language Selector */}
        <div className="flex justify-between items-center p-6">
          <div className="text-white/60 text-sm font-medium">
            Helio Healthcare Platform
          </div>
          
          {/* Futuristic Language Selector */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 shadow-lg">
              <div className="flex items-center gap-1">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                  <FaGlobe className="text-white text-sm" />
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                      language === lang.code
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                        : 'text-white/70 hover:bg-white/10 hover:scale-105 hover:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Futuristic Logo and Branding */}
            <div className="text-center mb-12">
              {/* 3D Logo with Glassmorphism */}
              <div className="relative mx-auto mb-8 w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-80 blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 rounded-3xl flex items-center justify-center w-full h-full shadow-2xl border border-white/20 backdrop-blur-sm transform hover:scale-110 transition-all duration-500 group">
                  <FaHeartbeat className="text-white text-3xl animate-pulse group-hover:scale-125 transition-transform duration-300" />
                </div>
              </div>
              
              {/* Sleek Typography */}
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
                Helio
              </h1>
              <p className="text-white/80 text-lg font-medium mb-2">Healthcare Reimagined</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm font-medium">2025 Digital Platform</span>
              </div>
            </div>

          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden relative">
            {/* Premium Header Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"></div>
            
            {/* Step 1: Enhanced Role Selection */}
            {step === 'role' && (
              <div className="p-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-gray-800 mb-4">Choose Your Role</h2>
                  <p className="text-gray-600 text-lg font-medium">Select how you'd like to access Helio healthcare services</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-purple-50 rounded-full border border-purple-100">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-purple-700 font-semibold">Secure Portal</span>
                  </div>
                </div>
                
                <div className="space-y-6 mb-10">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`w-full p-8 border-2 ${role.borderColor} ${role.bgColor} rounded-3xl ${role.hoverBg} transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden`}
                      >
                        {/* Premium Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <div className="flex items-center gap-8 relative z-10">
                          <div className={`w-24 h-24 bg-gradient-to-r ${role.gradient} rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 relative`}>
                            <IconComponent className="text-white text-4xl" />
                            {/* Premium Icon Glow */}
                            <div className="absolute inset-0 rounded-3xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                          
                          <div className="text-left flex-1">
                            <h3 className={`font-black text-2xl ${role.textColor} mb-3 group-hover:text-opacity-90`}>{role.name}</h3>
                            <p className="text-gray-700 text-base mb-4 leading-relaxed font-medium">{role.description}</p>
                            <div className="flex items-center gap-4">
                              <span className="text-sm bg-white/90 px-4 py-2 rounded-full text-gray-800 font-semibold border border-white/70 shadow-md">
                                Sample: {role.sampleUsername}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-sm text-green-600 font-bold">Ready</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Premium Arrow Indicator */}
                          <div className="text-gray-400 group-hover:text-gray-600 transition-all duration-300 group-hover:scale-125">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Premium Demo Credentials Section */}
                <div className="border-t-2 border-purple-100 pt-8">
                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-3xl hover:from-purple-100 hover:to-violet-100 transition-all duration-500 border-2 border-purple-200 group shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaInfoCircle className="text-white text-2xl" />
                      </div>
                      <div className="text-left">
                        <span className="font-black text-purple-800 text-xl">Demo Credentials</span>
                        <p className="text-purple-600 text-base font-medium">View sample login details for testing</p>
                      </div>
                    </div>
                    <FaChevronDown className={`text-purple-600 transition-transform duration-500 text-xl ${showCredentials ? 'rotate-180' : ''} group-hover:scale-125`} />
                  </button>
                  
                  {showCredentials && (
                    <div className="mt-6 p-8 bg-gradient-to-br from-purple-50 via-white to-violet-50 rounded-3xl border-l-4 border-purple-400 shadow-inner">
                      <div className="space-y-6 text-base">
                        <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border-2 border-purple-100 shadow-md">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">👤</span>
                            <span className="font-black text-purple-700 text-lg">Patients:</span>
                          </div>
                          <span className="text-gray-800 font-mono bg-purple-100 px-4 py-2 rounded-xl font-bold">p001, p002, p003</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border-2 border-green-100 shadow-md">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">👨‍⚕️</span>
                            <span className="font-black text-green-700 text-lg">Doctors:</span>
                          </div>
                          <span className="text-gray-800 font-mono bg-green-100 px-4 py-2 rounded-xl font-bold">d001, d002, d003</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border-2 border-violet-100 shadow-md">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">💊</span>
                            <span className="font-black text-violet-700 text-lg">Pharmacists:</span>
                          </div>
                          <span className="text-gray-800 font-mono bg-violet-100 px-4 py-2 rounded-xl font-bold">pm001, pm002, pm003</span>
                        </div>
                        <div className="mt-8 pt-6 border-t-2 border-purple-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl">🔐</span>
                            <strong className="text-amber-800 text-lg font-black">Default Passwords:</strong>
                          </div>
                          <div className="grid grid-cols-1 gap-3 text-base">
                            <span className="font-mono bg-white/90 px-4 py-3 rounded-xl border-2 border-blue-100 font-bold">Patient: <strong className="text-blue-700">patient123</strong></span>
                            <span className="font-mono bg-white/90 px-4 py-3 rounded-xl border-2 border-green-100 font-bold">Doctor: <strong className="text-green-700">doctor123</strong></span>
                            <span className="font-mono bg-white/90 px-4 py-3 rounded-xl border-2 border-purple-100 font-bold">Pharmacist: <strong className="text-purple-700">pharmacy123</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Premium Login Credentials */}
            {step === 'credentials' && (
              <div className="p-10">
                <div className="text-center mb-12">
                  <div className={`w-32 h-32 bg-gradient-to-r ${getCurrentRole()?.gradient} rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl relative group`}>
                    {React.createElement(getCurrentRole()?.icon, { className: "text-white text-5xl group-hover:scale-110 transition-transform duration-500" })}
                    {/* Premium Rotating Border Effect */}
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-white/30 to-transparent animate-spin-slow opacity-60"></div>
                  </div>
                  <h2 className="text-4xl font-black text-gray-800 mb-4">{getCurrentRole()?.name} Portal</h2>
                  <p className="text-gray-600 text-xl font-medium mb-4">Enter your credentials to access secure healthcare services</p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-full border-2 border-purple-200 shadow-lg">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-purple-700 font-bold text-lg">Secure Connection</span>
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>

                {error && (
                  <div className="mb-10 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-2xl font-black">!</span>
                      </div>
                      <div>
                        <p className="text-red-800 font-black text-lg">Authentication Error</p>
                        <p className="text-red-700 text-base mt-1 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="block text-base font-black text-gray-700 uppercase tracking-wider">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={`e.g., ${getCurrentRole()?.sampleUsername}`}
                        className="w-full px-6 py-5 border-2 border-purple-200 rounded-3xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-xl bg-white/90 backdrop-blur-sm hover:border-purple-300 font-medium"
                        disabled={isLoading}
                      />
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                        <FaUser className="text-purple-400 text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-base font-black text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your secure password"
                        className="w-full px-6 py-5 pr-16 border-2 border-purple-200 rounded-3xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-xl bg-white/90 backdrop-blur-sm hover:border-purple-300 font-medium"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors duration-300 p-2 rounded-2xl hover:bg-purple-50"
                      >
                        {showPassword ? <FaEyeSlash size={24} /> : <FaEye size={24} />}
                      </button>
                    </div>
                  </div>

                  {/* Premium Quick Fill Demo */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-3xl border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-black text-purple-700 mb-2">Quick Demo Access</p>
                        <p className="text-sm text-purple-600 font-medium">Auto-fill with sample credentials for testing</p>
                      </div>
                      <button
                        onClick={fillSampleCredentials}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:transform-none"
                        disabled={isLoading}
                      >
                        Fill ({getCurrentRole()?.sampleUsername})
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-8">
                    <button
                      onClick={handleBack}
                      className="flex-1 py-5 px-8 border-2 border-purple-300 rounded-3xl text-purple-700 font-black hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <button
                      onClick={handleLogin}
                      disabled={isLoading || !username || !password}
                      className="flex-1 py-5 px-8 bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600 text-white rounded-3xl font-black hover:from-purple-600 hover:via-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-4 shadow-2xl hover:shadow-3xl relative overflow-hidden text-lg group"
                    >
                      {/* Premium Button Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin text-2xl" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <span>Secure Login</span>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5M6 12h12" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Footer */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-lg rounded-full shadow-xl border border-white/40 hover:bg-white/90 transition-all duration-500 group">
              <FaHeartbeat className="text-red-500 animate-pulse text-2xl group-hover:scale-110 transition-transform duration-300" />
              <span className="text-base text-gray-800 font-black">Premium Healthcare Access</span>
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-base text-purple-600 font-bold">Nabha, Punjab</span>
            </div>
            <p className="text-sm text-gray-500 mt-6 font-bold">🔒 Secure • 🚀 Fast • 🏥 Trusted Healthcare Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;