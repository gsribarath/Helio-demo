import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const AudioCallPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  // Call states
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing', 'connected', 'ended'
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    // Redirect if no doctor data
    if (!doctor) {
      navigate('/');
      return;
    }

    // Simulate call connection after 3 seconds of ringing
    const connectionTimer = setTimeout(() => {
      if (callStatus === 'ringing') {
        setCallStatus('connected');
      }
    }, 3000);

    return () => clearTimeout(connectionTimer);
  }, [doctor, navigate, callStatus]);

  useEffect(() => {
    // Start call timer when connected
    let timer;
    if (callStatus === 'connected' && isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus, isCallActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsCallActive(false);
    
    // Show call ended for 2 seconds then navigate back
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatTime(callDuration);
      case 'ended':
        return 'Call Ended';
      default:
        return 'Connecting...';
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
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
              {callStatus === 'ringing' && 'Calling'}
              {callStatus === 'connected' && 'Connected'}
              {callStatus === 'ended' && 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Doctor Avatar and Info */}
        <div className="text-center mb-8 mt-16">
          {/* Large Doctor Avatar */}
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
              <span className="text-6xl font-bold text-white">{doctor.name?.charAt(0)}</span>
            </div>
            
            {/* Pulsing ring animation for ringing */}
            {callStatus === 'ringing' && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping"></div>
            )}
          </div>

          {/* Doctor Name */}
          <h2 className="text-3xl font-semibold mb-2">{doctor.name}</h2>
          
          {/* Doctor Specialty */}
          <p className="text-xl text-gray-300 mb-1">{doctor.specialty}</p>
          
          {/* Call Status */}
          <p className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-8 mb-12">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={callStatus !== 'connected'}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              callStatus !== 'connected' 
                ? 'bg-gray-600/50 cursor-not-allowed' 
                : isMuted 
                  ? 'bg-red-600 hover:bg-red-700 transform hover:scale-105' 
                  : 'bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm transform hover:scale-105'
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <FaMicrophoneSlash className="text-white text-xl" />
            ) : (
              <FaMicrophone className="text-white text-xl" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            disabled={callStatus === 'ended'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
              callStatus === 'ended'
                ? 'bg-gray-600/50 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
            }`}
            title="End Call"
          >
            <FaPhoneSlash className="text-white text-2xl" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            disabled={callStatus !== 'connected'}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              callStatus !== 'connected'
                ? 'bg-gray-600/50 cursor-not-allowed'
                : isSpeakerOn 
                  ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105' 
                  : 'bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm transform hover:scale-105'
            }`}
            title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
          >
            {isSpeakerOn ? (
              <FaVolumeUp className="text-white text-xl" />
            ) : (
              <FaVolumeMute className="text-white text-xl" />
            )}
          </button>
        </div>

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

      {/* Doctor Details Panel */}
      <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUserMd className="text-white text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{doctor.name}</h3>
              <p className="text-gray-300 text-sm truncate">{doctor.specialty}</p>
              <p className="text-gray-400 text-xs truncate">{doctor.qualifications}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center space-x-1 text-xs text-green-400 mb-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span>Available</span>
              </div>
              <p className="text-gray-400 text-xs">{doctor.experience} years exp</p>
              <p className="text-gray-400 text-xs">{doctor.languages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Info (when call ends) */}
      {callStatus === 'ended' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 mx-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhoneSlash className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Ended</h3>
            <p className="text-gray-600 text-sm">
              Call duration: {formatTime(callDuration)}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Returning to home page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioCallPage;