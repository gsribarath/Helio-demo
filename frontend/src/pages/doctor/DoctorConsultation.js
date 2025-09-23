import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaVideo, FaPhone, FaArrowLeft } from 'react-icons/fa';

const DoctorConsultation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const appt = state?.appointment || (() => {
    // fallback load from storage if direct navigation
    try {
      const arr = JSON.parse(localStorage.getItem('helio_appointments')||'[]');
      return arr.find(a=>a.id===id);
    } catch { return null; }
  })();

  // Normalize doctor & patient objects for call pages
  const doctor = {
    id: appt?.doctorId || '1',
    name: appt?.doctor || 'Dr. Rajesh Kumar',
    specialty: appt?.specialist || 'General Medicine',
    qualifications: 'MBBS',
    languages: 'English, Hindi, Punjabi',
    experience: 12
  };
  const patient = {
    id: appt?.patientId || appt?.id || 'P-UNKNOWN',
    name: appt?.patientName || appt?.patient || 'Patient'
  };

  const initiateCall = (type) => {
    try {
      const key = 'helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const callSessionId = `call-${appt.id}-${Date.now()}`;
      const updated = arr.map(a => a.id === appt.id ? { ...a, callType: type, callSessionId, callStartedAt: new Date().toISOString() } : a);
      localStorage.setItem(key, JSON.stringify(updated));
      // Navigate after storage update (patient listener will pick it up)
      if (type === 'video') {
        navigate('/video-call', { state: { doctor, patient, callType: 'video', callSessionId, appointmentId: appt.id } });
      } else {
        navigate('/audio-call', { state: { doctor, patient, callType: 'audio', callSessionId, appointmentId: appt.id } });
      }
    } catch (e) {
      console.error('Failed to initiate call:', e);
    }
  };

  if (!appt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <p className="text-gray-700 font-medium mb-4">Appointment not found or no longer available.</p>
          <button onClick={()=>navigate('/doctor')} className="btn btn-outline w-full">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 relative">
      {/* Back Button */}
      <button
        onClick={()=>navigate(-1)}
        className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium text-sm absolute top-6 left-6 hover:bg-blue-50 transition-colors"
      >
        <FaArrowLeft className="text-sm"/> Back
      </button>
      <div className="card w-full max-w-lg relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Patient Details</h1>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Patient Name</span><span className="font-semibold text-gray-900">{appt.patientName || appt.patient || 'Patient'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Patient ID</span><span className="font-semibold text-gray-900">{appt.patientId || appt.id}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Reason</span><span className="font-semibold text-gray-900">{appt.healthIssue || appt.reason || '-'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Date</span><span className="font-semibold text-gray-900">{appt.date}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Time</span><span className="font-semibold text-gray-900">{appt.time}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Hospital</span><span className="font-semibold text-gray-900">{appt.hospitalName || '—'}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={()=>initiateCall('video')} className="btn btn-success py-3 text-sm font-semibold"> <FaVideo className="text-base"/> Video Call</button>
          <button onClick={()=>initiateCall('audio')} className="btn btn-secondary py-3 text-sm font-semibold"> <FaPhone className="text-base"/> Audio Call</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
