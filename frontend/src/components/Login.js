import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaSpinner, FaUser, FaUserMd, FaPills } from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('role'); // 'role' | 'credentials'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'patient',
      icon: FaUser,
      name: t('patient') || 'Patient',
      gradient: 'from-rose-500 to-orange-400',
      usernamePrefix: 'p',
      sampleUsername: 'p001',
      solidColor: '#FF4F5F'
    },
    {
      id: 'doctor',
      icon: FaUserMd,
      name: t('doctor') || 'Doctor',
      gradient: 'from-sky-500 to-cyan-500',
      usernamePrefix: 'd',
      sampleUsername: 'd001'
    },
    {
      id: 'pharmacist',
      icon: FaPills,
      name: t('pharmacist') || 'Pharmacist',
      gradient: 'from-emerald-500 to-pink-400',
      usernamePrefix: 'pm',
      sampleUsername: 'pm001'
    }
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
    switch (role) {
      case 'patient':
        return 'patient123';
      case 'doctor':
        return 'doctor123';
      case 'pharmacist':
        return 'pharmacy123';
      default:
        return '';
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
    <div className="login-shell">
      <div className="login-card">
        {/* Hero */}
        <header className="text-center mb-6">
          <h1 className="hero-title">Helio</h1>
          <p className="hero-subtitle">Choose Your Role</p>
        </header>

        {/* Card wrapper for content */}
        <div>
          {/* Step 1: Role selection */}
          {step === 'role' && (
            <div>
              <div className="role-list" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {roles.map((role) => {
                  const Icon = role.icon;
                  const variant = role.id === 'patient' ? 'role-patient' : role.id === 'doctor' ? 'role-doctor' : 'role-pharmacist';
                  const baseStyle = role.id === 'patient'
                    ? { background: role.solidColor, border:'2px solid #FF4F5F', color:'#ffffff', boxShadow:'0 4px 12px rgba(255,79,95,0.35)' }
                    : {};
                  const hoverStyle = role.id === 'patient' ? { filter:'brightness(0.92)' } : {};
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`role-btn ${variant}`}
                      aria-label={`Select ${role.name}`}
                      style={baseStyle}
                      onMouseEnter={e=>{ if(role.id==='patient'){ Object.assign(e.currentTarget.style, hoverStyle);} }}
                      onMouseLeave={e=>{ if(role.id==='patient'){ Object.assign(e.currentTarget.style, baseStyle);} }}
                      onFocus={e=>{ if(role.id==='patient'){ e.currentTarget.style.outline='3px solid rgba(255,79,95,0.4)'; } }}
                      onBlur={e=>{ if(role.id==='patient'){ e.currentTarget.style.outline='none'; } }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="left">
                          <div className="icon-badge" style={ role.id === 'patient' ? { background:'rgba(255,255,255,0.15)', color:'#fff' } : {} }>
                            <Icon />
                          </div>
                          <span className="role-label" style={ role.id === 'patient' ? { color:'#fff', fontWeight:700 } : {} }>{role.name}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Demo Credentials Card */}
              <div className="card demo-card" style={{marginTop: '1rem'}}>
                <h3>Demo Credentials</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '.75rem'}}>
                  <div className="demo-row">
                    <div className="demo-left">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-purple-100 text-purple-600 items-center justify-center"><FaUser /></span>
                      Patient
                    </div>
                    <div className="demo-right">p001 / patient123</div>
                  </div>
                  <div className="demo-row">
                    <div className="demo-left">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-sky-100 text-sky-600 items-center justify-center"><FaUserMd /></span>
                      Doctor
                    </div>
                    <div className="demo-right">d001 / doctor123</div>
                  </div>
                  <div className="demo-row">
                    <div className="demo-left">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-rose-100 text-rose-600 items-center justify-center"><FaPills /></span>
                      Pharmacist
                    </div>
                    <div className="demo-right">pm001 / pharmacy123</div>
                  </div>
                </div>
              </div>

              {/* Removed Default Passwords Card as requested */}
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'credentials' && (
            <div className="card" style={{padding: '1.25rem'}}>
              <div className="text-center mb-4">
                <p className="text-muted" style={{fontSize: '.85rem'}}>Role</p>
                <h2 style={{fontWeight: 800, fontSize: '1.25rem', color: '#111827'}}>{getCurrentRole()?.name} Portal</h2>
              </div>

              {error && (
                <div className="card" style={{background:'#fef2f2', borderColor:'#fecaca', color:'#b91c1c', padding:'.75rem', marginBottom:'1rem'}}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`Enter username (e.g., ${getCurrentRole()?.sampleUsername})`}
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input has-icon"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-sm"
                    style={{position:'absolute', right: '0.35rem', top:'50%', transform:'translateY(-50%)', background:'transparent'}}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="card" style={{padding:'.75rem', background:'#f8fafc', marginTop:'.75rem'}}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary" style={{fontWeight:700, fontSize:'.9rem'}}>Quick Demo Access</p>
                    <p className="text-muted" style={{fontSize:'.8rem'}}>Auto-fill sample credentials</p>
                  </div>
                  <button
                    onClick={fillSampleCredentials}
                    className="btn btn-primary btn-sm"
                    disabled={isLoading}
                  >
                    Fill ({getCurrentRole()?.sampleUsername})
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleBack}
                  className="btn btn-outline"
                  style={{flex:1}}
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleLogin}
                  disabled={isLoading || !username || !password}
                  className="btn btn-primary btn-lg"
                  style={{flex:1}}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Authenticating…
                    </>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;