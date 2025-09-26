import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaPhone, FaPhoneSlash } from 'react-icons/fa';

const IncomingCallNotification = () => {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkForIncomingCall = () => {
      try {
        const appointments = JSON.parse(localStorage.getItem('helio_appointments') || '[]');
        const call = appointments.find(apt => 
          apt.callType && 
          apt.callSessionId && 
          apt.status === 'in_progress' &&
          !apt.callAnswered
        );
        
        if (call && !incomingCall) {
          setIncomingCall(call);
          setVisible(true);
        } else if (!call && incomingCall) {
          setIncomingCall(null);
          setVisible(false);
        }
      } catch (error) {
        console.error('Error checking for incoming calls:', error);
      }
    };

    // Check immediately
    checkForIncomingCall();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'helio_appointments') {
        checkForIncomingCall();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkForIncomingCall, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (incomingCall) {
      // Mark as answered to prevent duplicate notifications
      try {
        const appointments = JSON.parse(localStorage.getItem('helio_appointments') || '[]');
        const updated = appointments.map(apt => 
          apt.callSessionId === incomingCall.callSessionId 
            ? { ...apt, callAnswered: true }
            : apt
        );
        localStorage.setItem('helio_appointments', JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating call status:', error);
      }

      // Navigate to patient video call
      navigate('/patient/video-call', {
        state: {
          doctor: {
            id: incomingCall.doctorId,
            name: incomingCall.doctor,
            specialty: incomingCall.specialist || 'Doctor'
          },
          patient: {
            id: incomingCall.patientId,
            name: incomingCall.patientName
          },
          callType: incomingCall.callType,
          callSessionId: incomingCall.callSessionId
        }
      });
      
      setVisible(false);
      setIncomingCall(null);
    }
  };

  const handleDecline = () => {
    if (incomingCall) {
      try {
        // Remove call from appointments
        const appointments = JSON.parse(localStorage.getItem('helio_appointments') || '[]');
        const updated = appointments.map(apt => {
          if (apt.callSessionId === incomingCall.callSessionId) {
            const { callType, callSessionId, ...cleanApt } = apt;
            return cleanApt;
          }
          return apt;
        });
        localStorage.setItem('helio_appointments', JSON.stringify(updated));
      } catch (error) {
        console.error('Error declining call:', error);
      }
      
      setVisible(false);
      setIncomingCall(null);
    }
  };

  if (!visible || !incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center animate-bounce-gentle">
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          {incomingCall.doctor?.charAt(0) || 'D'}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {incomingCall.callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
        </h2>
        
        <p className="text-gray-600 mb-1">
          <strong>Dr. {incomingCall.doctor}</strong>
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          {incomingCall.specialist || 'Doctor'}
        </p>
        
        <div className="flex gap-6 justify-center">
          <button 
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Decline"
          >
            <FaPhoneSlash className="text-xl" />
          </button>
          
          <button 
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Accept"
          >
            {incomingCall.callType === 'video' ? <FaVideo className="text-xl" /> : <FaPhone className="text-xl" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;