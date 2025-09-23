import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaPhoneSlash, 
  FaVolumeUp, 
  FaVolumeMute,
  FaUserMd,
  FaPhone,
  FaPhoneAlt
} from 'react-icons/fa';

import './VideoCallPage.css';

const AudioCallPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, patient, callType, callSessionId, appointmentId } = location.state || {};
  const [phase, setPhase] = useState('ringing'); // ringing | active | ended | declined

  // Call states
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing', 'connected', 'ended'
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  // fullscreen state is managed via DOM fullscreen API; no local flag needed

  useEffect(() => {
    if (!doctor || !patient) { navigate('/'); return; }
    const autoTimer = setTimeout(()=> { setPhase('active'); setCallStatus('connected'); }, 1500);
    return ()=> clearTimeout(autoTimer);
  }, [doctor, patient, navigate]);

  useEffect(() => {
    if (phase !== 'active' || !isCallActive) return;
    const timer = setInterval(()=> setCallDuration(p=>p+1),1000);
    return ()=> clearInterval(timer);
  }, [phase, isCallActive]);

  const cleanupSession = () => {
    try {
      if (!appointmentId) return;
      const key='helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      const updated = arr.map(a=> a.id===appointmentId ? { ...a, callType:null, callSessionId:null } : a);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch(e){ console.error('Failed to cleanup call session (audio)', e); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsCallActive(false);
    setPhase('ended');
    cleanupSession();
    setTimeout(()=> navigate('/'), 1200);
  };

  const toggleFullscreen = () => {
    const stage = document.querySelector('.vc-audio-stage');
    if (!stage) return;
    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) stage.requestFullscreen();
      else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return t('ringing', 'Ringing...');
      case 'connected':
        return formatTime(callDuration);
      case 'ended':
        return t('call_ended', 'Call Ended');
      default:
        return t('connecting', 'Connecting...');
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'ringing':
        return 'text-blue-400';
      case 'connected':
        return 'text-green-400';
      case 'ended':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!doctor) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col" style={{paddingBottom:'120px'}}>
      {/* Status Bar Area */}
      <div className="h-8 bg-transparent"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-white relative">
        
        {/* Call Status Indicator */}
        <div className="absolute top-8 left-0 right-0 text-center">
          <div className="inline-flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {callStatus === 'ringing' && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            )}
            {callStatus === 'connected' && (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            )}
            {callStatus === 'ended' && (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
            <span className="text-sm text-gray-200 font-medium">
              {callStatus === 'ringing' && t('calling', 'Calling')}
              {callStatus === 'connected' && t('connected', 'Connected')}
              {callStatus === 'ended' && t('disconnected', 'Disconnected')}
            </span>
          </div>
        </div>

        {/* Doctor card - unified and centered */}
        <div className="vc-audio-stage">
          <div className="vc-audio-card">
            <div className="vc-audio-avatar">{doctor.name?.charAt(0)}</div>
            <div className="vc-audio-details">
              <div className="vc-audio-title">
                <h2 className="vc-name"><TransText text={doctor.name} /></h2>
                <div className="vc-timer">{getStatusText()}</div>
              </div>
              <div className="vc-meta"><TransText text={doctor.specialty} /></div>
              <div className="vc-small"><TransText text={doctor.qualifications} /></div>
              <div className="vc-audio-row">
                <div className="vc-status-row"><span className="dot available"></span> <span className="vc-available-text">{t('available')}</span></div>
                <div className="vc-exp">{doctor.experience} {t('years_experience_other', { count: doctor.experience || 0 })}</div>
                <div className="vc-langs"><TransText text={doctor.languages} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls bar only when active */}
        {phase === 'active' && (
        <div className="vc-controls" role="toolbar" aria-label={t('call_controls', 'call controls')} style={{bottom:'110px',position:'fixed',left:'50%',transform:'translateX(-50%)'}}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={callStatus !== 'connected'}
            className={`control-btn ${isMuted ? 'muted active' : ''}`}
            title={isMuted ? t('unmute', 'Unmute') : t('mute', 'Mute')}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            onClick={handleEndCall}
            disabled={callStatus === 'ended'}
            className={`control-btn end`}
            title={t('end_call', 'End Call')}
          >
            <FaPhoneSlash />
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            disabled={callStatus !== 'connected'}
            className={`control-btn ${isSpeakerOn ? 'active' : ''}`}
            title={isSpeakerOn ? t('speaker_off', 'Speaker Off') : t('speaker_on', 'Speaker On')}
          >
            {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>

          <button className="control-btn" title="Fullscreen" onClick={toggleFullscreen}>
            <FaPhone />
          </button>
        </div>
        )}

        {/* Visual Call Waves (when connected) */}
        {callStatus === 'connected' && !isMuted && (
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.5s'
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

        {/* Doctor details panel removed - now using centered card `.vc-audio-card` above for a single professional layout during call */}

      {/* Emergency Info (when call ends) */}
      {phase === 'ringing' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">{doctor.name?.charAt(0)}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Incoming Audio Call</h2>
            <p className="text-sm text-gray-600 mb-4">Connecting you with <strong>{doctor.name}</strong>...</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>{ setPhase('active'); setCallStatus('connected'); }} className="btn btn-success px-4 py-2 text-sm">Accept</button>
              <button onClick={()=>{ setPhase('declined'); cleanupSession(); setTimeout(()=>navigate('/'),800); }} className="btn btn-secondary px-4 py-2 text-sm">Decline</button>
            </div>
          </div>
        </div>
      )}
      {callStatus === 'ended' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 mx-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhoneSlash className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('call_ended', 'Call Ended')}</h3>
            <p className="text-gray-600 text-sm">
              {t('call_duration', 'Call duration')}: {formatTime(callDuration)}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {t('returning_home', 'Returning to home page...')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioCallPage;