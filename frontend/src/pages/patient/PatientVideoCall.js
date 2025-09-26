import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhoneSlash, 
  FaVolumeUp, 
  FaVolumeMute,
  FaArrowLeft,
  FaShareSquare,
  FaComment
} from 'react-icons/fa';
import { useAdaptiveCall } from '../../hooks/useAdaptiveCall';
import TransText from '../../components/TransText';

const PatientVideoCall = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract call data from navigation state
  const { doctor, patient, callType, callSessionId } = location.state || {};
  
  // UI State
  const [phase, setPhase] = useState('ringing'); // ringing, active, ended, declined
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  
  // WebRTC State
  const { 
    localStream, 
    remoteStream, 
    isAudioOnly, 
    metrics, 
    startCall, 
    endCall 
  } = useAdaptiveCall(callSessionId);
  
  // Auto-hide controls
  const controlsTimeoutRef = useRef();
  useEffect(() => {
    if (phase === 'active') {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [showControls, phase]);
  
  // Call duration timer
  useEffect(() => {
    let interval;
    if (phase === 'active' && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, callStartTime]);
  
  // Handle call acceptance
  const handleAcceptCall = async () => {
    try {
      setPhase('active');
      setCallStartTime(Date.now());
      await startCall();
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };
  
  // Handle call decline
  const handleDeclineCall = () => {
    setPhase('declined');
    cleanupSession();
    setTimeout(() => navigate('/patient/home'), 800);
  };
  
  // Handle call end
  const handleEndCall = () => {
    setPhase('ended');
    endCall();
    cleanupSession();
    setTimeout(() => navigate('/patient/home'), 2000);
  };
  
  // Cleanup call session
  const cleanupSession = () => {
    try {
      const appointments = JSON.parse(localStorage.getItem('helio_appointments') || '[]');
      const updated = appointments.map(apt => {
        if (apt.callSessionId === callSessionId) {
          const { callType, callSessionId: _, ...cleanApt } = apt;
          return cleanApt;
        }
        return apt;
      });
      localStorage.setItem('helio_appointments', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to cleanup session:', error);
    }
  };
  
  // Toggle functions
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMuted(!audioTrack.enabled);
      }
    }
  };
  
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };
  
  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Invalid call session</p>
          <button onClick={() => navigate('/patient/home')} className="mt-4 px-4 py-2 bg-blue-600 rounded">
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="vc-container">
      {/* Header */}
      <header className="vc-header">
        <div className="vc-header-left">
          <button onClick={() => navigate('/patient/home')} className="vc-back-btn">
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="vc-header-info">
            <h1>Video Call</h1>
            {phase === 'active' && (
              <span className="vc-call-duration">{formatTime(callDuration)}</span>
            )}
          </div>
        </div>
        <div className="vc-header-right">
          <span className="vc-call-status">
            {phase === 'active' ? `${metrics.bitrateKbps} kbps • loss ${metrics.packetLoss}%` : ''}
          </span>
          <button onClick={() => setShowChat(!showChat)} className="icon-btn" title={t('toggle_chat', 'Toggle Chat')}>
            <FaComment />
          </button>
        </div>
      </header>

      <main className="vc-main">
        <div className={`vc-video-stage ${showControls ? 'show-controls' : ''}`} onMouseMove={() => setShowControls(true)}>
          {/* Show doctor's video in center when available and call is active */}
          {phase === 'active' && remoteStream && remoteStream.getVideoTracks().length > 0 && remoteStream.getVideoTracks()[0].enabled && !isAudioOnly ? (
            <video
              ref={(el) => { if (el && remoteStream && el.srcObject !== remoteStream) el.srcObject = remoteStream; }}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
                background: '#000'
              }}
              aria-label="Doctor's video feed"
            />
          ) : (
            <div className="vc-video-dummy">
              <div className="vc-dummy-overlay">
                <div className="vc-dummy-avatar">{phase === 'active' ? (doctor?.name?.charAt(0) || 'D') : doctor.name?.charAt(0)}</div>
                <div className="vc-dummy-info">
                  <div className="vc-dummy-name">
                    <TransText text={phase === 'active' ? (doctor?.name || 'Doctor') : doctor.name} />
                  </div>
                  <div className="vc-dummy-specialty">
                    <TransText text={doctor.specialty || 'Doctor'} />
                  </div>
                  <div className="vc-dummy-status">
                    {phase === 'active' ? (
                      isAudioOnly ? 'Audio Only (network)' : 
                      remoteStream ? (
                        remoteStream.getVideoTracks().length > 0 && remoteStream.getVideoTracks()[0].enabled ? 
                        'Connecting video...' : 'Doctor camera is off'
                      ) : 'No video stream'
                    ) : 'Incoming call...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="vc-mini-video">
            {/* Patient's own camera feed in mini view */}
            {cameraOn ? (
              localStream ? (
                <video
                  ref={(el)=> { if(el && localStream && el.srcObject !== localStream) el.srcObject = localStream; }}
                  autoPlay
                  muted
                  playsInline
                  style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8,background:'#000'}}
                  aria-label="Your camera view"
                />
              ) : (
                <div className="mini-on" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div className="mini-avatar">{patient?.name?.charAt(0) || 'P'}</div>
                  <div className="mini-txt" style={{fontSize:12,opacity:0.8}}>Starting camera...</div>
                </div>
              )
            ) : (
              <div className="mini-off"><FaVideoSlash /> Camera Off</div>
            )}
          </div>

          {/* Debug info for video streams */}
          {phase === 'active' && (
            <div style={{position:'absolute', top:40, left:8, background:'rgba(0,0,0,0.7)', color:'#fff', padding:'4px 8px', borderRadius:4, fontSize:10, lineHeight:1.3}}>
              Local: {localStream ? `${localStream.getVideoTracks().length}v` : 'none'} | 
              Remote: {remoteStream ? `${remoteStream.getVideoTracks().length}v` : 'none'}
              {remoteStream && remoteStream.getVideoTracks().length > 0 && (
                <div>Doctor cam: {remoteStream.getVideoTracks()[0].enabled ? 'ON' : 'OFF'}</div>
              )}
            </div>
          )}

          {/* Hidden actual media elements */}
          <video
            ref={(el)=> { if(el && localStream && el.srcObject !== localStream) el.srcObject = localStream; }}
            autoPlay muted playsInline style={{display:'none'}} />
          <video
            ref={(el)=> { if(el && remoteStream && el.srcObject !== remoteStream) el.srcObject = remoteStream; }}
            autoPlay playsInline style={{display:'none'}} />

          {phase==='active' && (
            <div style={{position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.55)', color:'#fff', padding:'4px 8px', borderRadius:4, fontSize:11, lineHeight:1.2}}>
              {metrics.bitrateKbps} kbps • loss {metrics.packetLoss}% {isAudioOnly && '• audio only'}
            </div>
          )}

          {phase === 'active' && (
            <div className={`vc-controls ${showControls ? 'visible' : ''}`} style={{bottom:'30px'}}>
              <button className={`control-btn ${muted ? 'active muted' : ''}`} onClick={toggleMute} title={muted ? t('unmute', 'Unmute') : t('mute', 'Mute')}>
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              <button className={`control-btn ${!cameraOn ? 'active muted' : ''}`} onClick={toggleCamera} title={cameraOn ? t('turn_camera_off', 'Turn camera off') : t('turn_camera_on', 'Turn camera on')}>
                {cameraOn ? <FaVideo /> : <FaVideoSlash />}
              </button>

              <button className="control-btn end" onClick={handleEndCall} title={t('end_call', 'End Call')}><FaPhoneSlash /></button>

              <button className={`control-btn ${!isSpeakerOn ? 'active muted' : ''}`} onClick={() => setIsSpeakerOn(!isSpeakerOn)} title={isSpeakerOn ? t('mute_speaker', 'Mute speaker') : t('unmute_speaker', 'Unmute speaker')}>
                {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>

              <button className="control-btn" title={t('share_screen', 'Share screen')}><FaShareSquare /></button>
            </div>
          )}
        </div>
      </main>

      {/* Incoming Call Modal */}
      {phase === 'ringing' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center mx-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              {doctor.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Incoming Video Call</h2>
            <p className="text-gray-600 mb-2"><strong>Dr. {doctor.name}</strong></p>
            <p className="text-sm text-gray-500 mb-8">{doctor.specialty}</p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleDeclineCall}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Decline"
              >
                <FaPhoneSlash className="text-xl" />
              </button>
              <button 
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                title="Accept"
              >
                <FaVideo className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Ended Modal */}
      {phase === 'ended' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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

      {/* Call Declined Modal */}
      {phase === 'declined' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhoneSlash className="text-gray-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Declined</h3>
            <p className="text-gray-500 text-xs mt-2">
              {t('returning_home', 'Returning to home page...')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVideoCall;