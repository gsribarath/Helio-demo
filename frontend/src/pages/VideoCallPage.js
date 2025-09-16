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
import './VideoCallPage.css';
import TransText from '../components/TransText';

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
  const [showControls, setShowControls] = useState(true); // always true now, but kept for compatibility
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

    return () => {
      clearInterval(timer);
    };
  }, [doctor, navigate]);

  // Show controls on mouse move
  // Controls are always visible (static) per new UX requirement.

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    const stage = document.querySelector('.vc-video-stage');
    if (!stage) return;
    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) {
        stage.requestFullscreen();
      } else if (stage.webkitRequestFullscreen) { /* Safari */
        stage.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!doctor) {
    return null;
  }

  return (
    <div className="vc-page">
      <div className="vc-container">
        <aside className="vc-sidebar">
          <div className="vc-person vc-doctor">
            <div className="vc-avatar vc-avatar-doctor">{doctor.name?.charAt(0)}</div>
            <div className="vc-person-info">
              <div className="vc-name"><TransText text={doctor.name} /></div>
              <div className="vc-meta"><TransText text={doctor.specialty} /></div>
              <div className="vc-small"><TransText text={doctor.qualifications} /></div>
            </div>
          </div>

          <div className="vc-divider" />

          <div className="vc-person vc-patient">
            <div className="vc-avatar vc-avatar-patient"><TransText text={t('you', 'You')} /></div>
            <div className="vc-person-info">
              <div className="vc-name">{t('patient')}</div>
              <div className="vc-meta">{t('camera', 'Camera')}: {isCameraOn ? t('on', 'On') : t('off', 'Off')}</div>
            </div>
          </div>

          <div className="vc-divider" />

          <div className="vc-stats">
            <div className="vc-timer">{formatTime(callDuration)}</div>
            <div className="vc-status">{t('available')} • {doctor.experience || 0} yrs</div>
            <div className="vc-langs">{t('languages')}: <TransText text={doctor.languages || 'English'} /></div>
          </div>
        </aside>

        <main className="vc-main">
          <header className="vc-main-header">
            <h1>{t('video')} {t('call', 'Call')}</h1>
            <div className="vc-actions">
              <button onClick={toggleFullscreen} className="icon-btn" title={isFullscreen ? t('exit_fullscreen', 'Exit Fullscreen') : t('fullscreen', 'Fullscreen')}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button onClick={() => setShowChat(!showChat)} className="icon-btn" title={t('toggle_chat', 'Toggle Chat')}><FaComment /></button>
            </div>
          </header>

          <div className={`vc-video-stage ${showControls ? 'show-controls' : ''}`} onMouseMove={() => setShowControls(true)}>
            <div className="vc-video-dummy">
              <div className="vc-dummy-overlay">
                <div className="vc-dummy-avatar">{doctor.name?.charAt(0)}</div>
                <div className="vc-dummy-info">
                  <div className="vc-dummy-name"><TransText text={doctor.name} /></div>
                  <div className="vc-dummy-specialty"><TransText text={doctor.specialty} /></div>
                  <div className="vc-dummy-status">{t('video')} {t('call', 'Call')} {t('active', 'Active')}</div>
                </div>
              </div>
            </div>

            <div className="vc-mini-video">
              {isCameraOn ? (
                <div className="mini-on">
                  <div className="mini-avatar"><TransText text={t('you', 'You')} /></div>
                  <div className="mini-txt">{t('camera_on', 'Camera On')}</div>
                </div>
              ) : (
                <div className="mini-off"><FaVideoSlash /> {t('camera_off', 'Camera Off')}</div>
              )}
            </div>

            <div className={`vc-controls ${showControls ? 'visible' : ''}`}>
              <button className={`control-btn ${isMuted ? 'active muted' : ''}`} onClick={() => setIsMuted(!isMuted)} title={isMuted ? t('unmute', 'Unmute') : t('mute', 'Mute')}>
                {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              <button className={`control-btn ${!isCameraOn ? 'active muted' : ''}`} onClick={() => setIsCameraOn(!isCameraOn)} title={isCameraOn ? t('turn_camera_off', 'Turn camera off') : t('turn_camera_on', 'Turn camera on')}>
                {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
              </button>

              <button className="control-btn end" onClick={handleEndCall} title={t('end_call', 'End Call')}><FaPhoneSlash /></button>

              <button className={`control-btn ${!isSpeakerOn ? 'active muted' : ''}`} onClick={() => setIsSpeakerOn(!isSpeakerOn)} title={isSpeakerOn ? t('mute_speaker', 'Mute speaker') : t('unmute_speaker', 'Unmute speaker')}>
                {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>

              <button className="control-btn" title={t('share_screen', 'Share screen')}><FaShareSquare /></button>
            </div>
          </div>
        </main>

        {showChat && (
          <aside className="vc-chat">
            <div className="chat-header">
              <h3>{t('chat', 'Chat')}</h3>
              <button className="icon-btn" onClick={() => setShowChat(false)}><FaCompress /></button>
            </div>
            <div className="chat-body">{t('chat_coming_soon', 'Chat feature coming soon...')}</div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;