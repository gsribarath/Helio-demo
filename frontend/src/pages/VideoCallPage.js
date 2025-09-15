import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhoneSlash, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaCog, 
  FaExpand, 
  FaCompress,
  FaUserMd,
  FaComment,
  FaShareSquare
} from 'react-icons/fa';

const VideoCallPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  // Call states
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Redirect if no doctor data
    if (!doctor) {
      navigate('/');
      return;
    }

    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Auto-hide controls after 3 seconds
    const controlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(controlsTimer);
    };
  }, [doctor, navigate]);

  // Show controls on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!doctor) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Doctor's Video (Main) */}
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-6xl font-bold">{doctor.name?.charAt(0)}</span>
            </div>
            <h3 className="text-2xl font-semibold">{doctor.name}</h3>
            <p className="text-gray-300 text-lg">{doctor.specialty}</p>
            <p className="text-green-400 mt-2">Video Call Active</p>
          </div>
        </div>

        {/* Patient's Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          {isCameraOn ? (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">You</span>
                </div>
                <p className="text-sm">Camera On</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
              <div className="text-center">
                <FaVideoSlash className="text-2xl mb-2" />
                <p className="text-sm">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Video Call</h2>
              <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-medium">{formatTime(callDuration)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <FaCompress className="text-xl" /> : <FaExpand className="text-xl" />}
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Toggle Chat"
              >
                <FaComment className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center space-x-6">
            {/* Microphone Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600/80 hover:bg-gray-700 backdrop-blur-sm'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaMicrophoneSlash className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                !isCameraOn 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600/80 hover:bg-gray-700 backdrop-blur-sm'
              }`}
              title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isCameraOn ? <FaVideo className="text-white text-xl" /> : <FaVideoSlash className="text-white text-xl" />}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 transform hover:scale-105"
              title="End Call"
            >
              <FaPhoneSlash className="text-white text-2xl" />
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                !isSpeakerOn 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600/80 hover:bg-gray-700 backdrop-blur-sm'
              }`}
              title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
            >
              {isSpeakerOn ? <FaVolumeUp className="text-white text-xl" /> : <FaVolumeMute className="text-white text-xl" />}
            </button>

            {/* Settings */}
            <button
              className="w-14 h-14 rounded-full bg-gray-600/80 hover:bg-gray-700 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
              title="Settings"
            >
              <FaCog className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaCompress />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-500 text-center">Chat feature coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Details Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUserMd className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialty}</p>
              <p className="text-sm text-gray-500">{doctor.qualifications}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Available</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{doctor.experience} years experience</p>
              <p className="text-sm text-gray-500">Languages: {doctor.languages || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;