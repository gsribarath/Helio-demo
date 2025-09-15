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

const Login2025 = ({ onLogin }) => {
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
      console.log('📄 Response data:', data);
      
      if (response.ok) {
        const token = data.token || data.access_token;
        const user = data.user || {
          id: data.id || data.user_id,
          role: data.role || data.user_type,
          username: data.username || username,
        };
        
        if (!token) {
          throw new Error('Missing token in response');
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Login successful, redirecting...');
        
        onLogin({
          ...user,
          token
        });
      } else {
        console.error('❌ Login failed:', data);
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
        {/* Enhanced Top Navigation with Language Selector */}
        <div className="flex justify-between items-center p-4 lg:p-6">
          <div className="text-white/70 text-sm lg:text-base font-semibold">
            Helio Healthcare Platform
          </div>
          
          {/* Enhanced Futuristic Language Selector */}
          <div className="relative">
            <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-2xl p-1 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
              <div className="flex items-center gap-1">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-xl">
                  <FaGlobe className="text-white text-sm lg:text-base" />
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-2 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      language === lang.code
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl scale-105'
                        : 'text-white/70 hover:bg-white/15 hover:scale-105 hover:text-white'
                    }`}
                  >
                    <span className="text-base lg:text-lg">{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Enhanced Futuristic Logo and Branding */}
            <div className="text-center mb-8 lg:mb-12">
              {/* 3D Logo with Enhanced Glassmorphism */}
              <div className="relative mx-auto mb-6 lg:mb-8 w-20 h-20 lg:w-28 lg:h-28">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-90 blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 rounded-3xl flex items-center justify-center w-full h-full shadow-2xl border border-white/30 backdrop-blur-sm transform hover:scale-110 transition-all duration-500 group">
                  <FaHeartbeat className="text-white text-2xl lg:text-4xl animate-pulse group-hover:scale-125 transition-transform duration-300" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 to-transparent animate-spin-slow opacity-60"></div>
                </div>
              </div>
              
              {/* Enhanced Sleek Typography */}
              <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent mb-4 tracking-tight leading-tight">
                Helio
              </h1>
              <p className="text-white/90 text-lg lg:text-xl font-semibold mb-4 tracking-wide">Healthcare Reimagined</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-xl rounded-full border border-white/30 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm lg:text-base font-bold">2025 Digital Platform</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse animation-delay-300"></div>
              </div>
            </div>

            {/* Enhanced Glass-effect Login Card */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/30 overflow-hidden relative">
              {/* Premium Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 via-pink-500 to-blue-500"></div>
              
              {/* Enhanced Content with Better Glassmorphism */}
              <div className="relative">
                {step === 'role' && (
                  <div className="p-8 lg:p-12">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                        Choose Your Portal
                      </h2>
                      <p className="text-white/80 text-lg lg:text-xl font-medium mb-6 leading-relaxed">
                        Select your healthcare role to access specialized services
                      </p>
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-xl">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-bold text-base">Secure 2025 Platform</span>
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse animation-delay-300"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {roles.map((role) => {
                        const IconComponent = role.icon;
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className="w-full p-6 lg:p-8 bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl hover:bg-white/25 hover:border-white/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
                          >
                            {/* Enhanced Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="flex items-center gap-6 lg:gap-8 relative z-10">
                              <div className={`w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r ${role.gradient} rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 relative`}>
                                <IconComponent className="text-white text-3xl lg:text-4xl" />
                                <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              </div>
                              
                              <div className="text-left flex-1">
                                <h3 className="font-black text-xl lg:text-2xl text-white mb-3 group-hover:text-white/90">
                                  {role.name}
                                </h3>
                                <p className="text-white/70 text-sm lg:text-base mb-4 leading-relaxed font-medium">
                                  {role.description}
                                </p>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <span className="text-xs lg:text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold border border-white/30 shadow-lg">
                                    Sample: {role.sampleUsername}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs lg:text-sm text-emerald-300 font-bold">Ready</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-white/60 group-hover:text-white transition-all duration-300 group-hover:scale-125">
                                <FaArrowRight className="text-xl lg:text-2xl" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Enhanced Demo Credentials Section */}
                    <div className="mt-12 pt-8 border-t border-white/20">
                      <button
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="w-full flex items-center justify-between p-6 bg-white/15 backdrop-blur-xl rounded-3xl hover:bg-white/25 transition-all duration-500 border border-white/25 group shadow-2xl hover:shadow-3xl"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <FaInfoCircle className="text-white text-xl lg:text-2xl" />
                          </div>
                          <div className="text-left">
                            <span className="font-black text-white text-lg lg:text-xl">Demo Access</span>
                            <p className="text-white/70 text-sm lg:text-base font-medium">View sample credentials</p>
                          </div>
                        </div>
                        <FaChevronDown className={`text-white/70 transition-transform duration-500 text-lg lg:text-xl ${showCredentials ? 'rotate-180' : ''} group-hover:scale-125`} />
                      </button>
                      
                      {showCredentials && (
                        <div className="mt-6 p-6 lg:p-8 bg-white/20 backdrop-blur-xl rounded-3xl border-l-4 border-cyan-400 shadow-2xl">
                          <div className="space-y-4 text-sm lg:text-base">
                            {roles.map((role) => (
                              <div key={role.id} className="flex justify-between items-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                                <div className="flex items-center gap-4">
                                  <role.icon className={`text-2xl text-${role.glowColor}-400`} />
                                  <span className="font-black text-white">{role.name}:</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-white/90 font-mono bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-sm">
                                    {role.sampleUsername}
                                  </span>
                                  <p className="text-xs text-white/60 mt-1 font-medium">
                                    Password: {getPasswordForRole(role.id)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'credentials' && (
                  <div className="p-8 lg:p-12">
                    <div className="text-center mb-12">
                      <div className={`w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r ${getCurrentRole()?.gradient} rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl relative group`}>
                        {React.createElement(getCurrentRole()?.icon, { 
                          className: "text-white text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-500" 
                        })}
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-white/30 to-transparent animate-spin-slow opacity-60"></div>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                        {getCurrentRole()?.name} Portal
                      </h2>
                      <p className="text-white/80 text-lg lg:text-xl font-medium mb-6 leading-relaxed">
                        Secure authentication for healthcare professionals
                      </p>
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-xl">
                        <FaLock className="text-emerald-400 text-lg" />
                        <span className="text-white font-bold text-base">End-to-End Encrypted</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-8 p-6 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-red-300 text-2xl font-black">⚠</span>
                          </div>
                          <div>
                            <p className="text-red-300 font-black text-lg">Authentication Failed</p>
                            <p className="text-red-200 text-base mt-1 font-medium">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-8">
                      {/* Enhanced Username Field */}
                      <div className="space-y-3">
                        <label className="block text-sm lg:text-base font-black text-white/90 uppercase tracking-wider">
                          Username
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={`e.g., ${getCurrentRole()?.sampleUsername}`}
                            className="w-full px-6 py-4 lg:py-5 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300 text-lg lg:text-xl text-white placeholder-white/50 hover:border-white/50 font-medium group-hover:shadow-xl"
                            disabled={isLoading}
                          />
                          <div className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2">
                            <FaUser className="text-white/50 text-lg lg:text-xl group-focus-within:text-cyan-400 transition-colors duration-300" />
                          </div>
                          {/* Input Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                        </div>
                      </div>

                      {/* Enhanced Password Field */}
                      <div className="space-y-3">
                        <label className="block text-sm lg:text-base font-black text-white/90 uppercase tracking-wider">
                          Password
                        </label>
                        <div className="relative group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your secure password"
                            className="w-full px-6 py-4 lg:py-5 pr-16 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300 text-lg lg:text-xl text-white placeholder-white/50 hover:border-white/50 font-medium group-hover:shadow-xl"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-300 p-2 rounded-2xl hover:bg-white/10"
                          >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                          </button>
                          {/* Input Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                        </div>
                      </div>

                      {/* Enhanced Quick Fill Demo */}
                      <div className="p-6 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/25 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-base lg:text-lg font-black text-white mb-2">Quick Demo Access</p>
                            <p className="text-sm text-white/70 font-medium">Auto-fill with sample credentials</p>
                          </div>
                          <button
                            onClick={fillSampleCredentials}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                            disabled={isLoading}
                          >
                            <FaBolt className="text-lg" />
                            Fill ({getCurrentRole()?.sampleUsername})
                          </button>
                        </div>
                      </div>

                      {/* Social Login Section */}
                      <div className="pt-8 border-t border-white/20">
                        <div className="text-center mb-6">
                          <p className="text-white/80 text-base font-semibold mb-6">Or continue with</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          {/* Google */}
                          <button className="group relative p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaGoogle className="text-white text-xl mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                          </button>
                          
                          {/* Facebook */}
                          <button className="group relative p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaFacebook className="text-white text-xl mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                          </button>
                          
                          {/* Apple */}
                          <button className="group relative p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaApple className="text-white text-xl mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex gap-4 lg:gap-6 pt-8">
                        <button
                          onClick={handleBack}
                          className="flex-1 py-4 lg:py-5 px-6 lg:px-8 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl text-white font-black hover:bg-white/25 hover:border-white/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-base lg:text-lg shadow-xl hover:shadow-2xl"
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                          </svg>
                          Back
                        </button>
                        <button
                          onClick={handleLogin}
                          disabled={isLoading || !username || !password}
                          className="flex-1 py-4 lg:py-5 px-6 lg:px-8 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl lg:rounded-3xl font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-3 lg:gap-4 shadow-2xl hover:shadow-3xl relative overflow-hidden text-base lg:text-lg group"
                        >
                          {/* Enhanced Button Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className="relative z-10 flex items-center gap-3">
                            {isLoading ? (
                              <>
                                <FaSpinner className="animate-spin text-xl lg:text-2xl" />
                                <span>Authenticating...</span>
                              </>
                            ) : (
                              <>
                                <FaLock className="text-lg lg:text-xl" />
                                <span>Secure Login</span>
                                <FaArrowRight className="text-lg lg:text-xl group-hover:translate-x-1 transition-transform duration-300" />
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Futuristic Footer */}
        <div className="pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 px-8 py-6 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30">
              {/* Trust Indicators */}
              <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaShieldAlt className="text-white text-xl animate-pulse" />
                  </div>
                  <div>
                    <span className="text-white font-black text-base lg:text-lg block">Secure</span>
                    <span className="text-white/70 text-xs lg:text-sm font-medium">256-bit SSL</span>
                  </div>
                </div>
                
                <div className="hidden lg:block w-px h-12 bg-white/20"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaRocket className="text-white text-xl animate-bounce" />
                  </div>
                  <div>
                    <span className="text-white font-black text-base lg:text-lg block">Fast</span>
                    <span className="text-white/70 text-xs lg:text-sm font-medium">Lightning Speed</span>
                  </div>
                </div>
                
                <div className="hidden lg:block w-px h-12 bg-white/20"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaHeartbeat className="text-white text-xl animate-pulse" />
                  </div>
                  <div>
                    <span className="text-white font-black text-base lg:text-lg block">Reliable</span>
                    <span className="text-white/70 text-xs lg:text-sm font-medium">99.9% Uptime</span>
                  </div>
                </div>
              </div>
              
              {/* Brand Badge */}
              <div className="flex items-center gap-4 px-6 py-3 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
                <FaHeartbeat className="text-red-400 animate-pulse text-xl" />
                <span className="text-white font-black text-base lg:text-lg">Helio Healthcare 2025</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center mt-6">
              <p className="text-white/60 text-sm font-medium">
                © 2025 Helio Healthcare Platform • Built with ❤️ for better healthcare
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-1deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(1deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 5s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 9s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animation-delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
};

export default Login2025;