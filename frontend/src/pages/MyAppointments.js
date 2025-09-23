import React, { useMemo, useState, useEffect } from 'react';
import './MyAppointments.css';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';

// Utilities to parse and compare dates
const toDate = (dateStr, timeStr) => {
  // dateStr: YYYY-MM-DD, timeStr: e.g., 04:30 PM or 09:00
  if (!dateStr) return null;
  const [hhmm, period] = (timeStr || '00:00').split(' ');
  const [hhRaw, mm] = hhmm.split(':');
  let hh = parseInt(hhRaw, 10);
  if (period) {
    const isPM = period.toUpperCase() === 'PM';
    if (isPM && hh < 12) hh += 12;
    if (!isPM && hh === 12) hh = 0;
  }
  const iso = `${dateStr}T${String(hh).padStart(2, '0')}:${mm || '00'}:00`;
  return new Date(iso);
};

export default function MyAppointments() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('upcoming'); // upcoming | past | cancelled
  const [refresh, setRefresh] = useState(0); // bump to re-read storage after actions
  const PATIENT_NAME = 'Gurpreet Singh'; // demo identity for auto-call redirect
  const navigate = require('react-router-dom').useNavigate();
  const handledCallIdsRef = React.useRef(new Set());

  const allAppointments = useMemo(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const parsed = raw ? JSON.parse(raw) : [];
      // Only accept objects with mandatory fields
      return Array.isArray(parsed)
        ? parsed.filter(a => a && a.id && a.date && a.time)
        : [];
    } catch (e) {
      console.error('Failed to parse appointments from storage:', e);
      return [];
    }
  }, [refresh]);

  // Listen for cross-tab storage changes so patient sees acceptance instantly
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'helio_appointments') {
        setRefresh(x => x + 1);
        checkIncomingCall();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const checkIncomingCall = React.useCallback(() => {
    try {
      const raw = localStorage.getItem('helio_appointments');
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      const incoming = arr.find(a => a.patientName === PATIENT_NAME && a.callType);
      if (incoming && incoming.callSessionId && !handledCallIdsRef.current.has(incoming.callSessionId)) {
        handledCallIdsRef.current.add(incoming.callSessionId);
        const doctorObj = {
          id: incoming.doctorId || '1',
          name: incoming.doctor || 'Doctor',
          specialty: incoming.specialist || 'General Medicine',
          qualifications: 'MBBS',
          languages: 'English, Hindi, Punjabi',
          experience: 12
        };
        const patientObj = { id: incoming.patientId || incoming.id, name: incoming.patientName };
        if (incoming.callType === 'video') {
          navigate('/video-call', { state: { doctor: doctorObj, patient: patientObj, callType: 'video', callSessionId: incoming.callSessionId } });
        } else if (incoming.callType === 'audio') {
          navigate('/audio-call', { state: { doctor: doctorObj, patient: patientObj, callType: 'audio', callSessionId: incoming.callSessionId } });
        }
      } else if (incoming && !incoming.callSessionId) {
        handledCallIdsRef.current = new Set();
      }
    } catch (e) {
      console.error('Failed to check incoming call (appointments page):', e);
    }
  }, [navigate]);

  useEffect(() => { checkIncomingCall(); }, [checkIncomingCall]);

  // Removed time-based auto-expire per new requirement: only move when doctor accepts

  const [upcoming, past, cancelled] = useMemo(() => {
    const now = new Date();
    const up = [];
    const pa = [];
    const ca = [];
    for (const a of allAppointments) {
      if (a.status === 'cancelled') { ca.push(a); continue; }
      if (a.status === 'completed') { pa.push(a); continue; }
      // Keep in_progress (accepted) inside Upcoming per new requirement
      const d = toDate(a.date, a.time);
      if (d && d.getTime() >= now.getTime()) up.push(a); else pa.push(a);
    }
    up.sort((x, y) => toDate(x.date, x.time) - toDate(y.date, y.time));
    pa.sort((x, y) => toDate(y.date, y.time) - toDate(x.date, x.time));
    return [up, pa, ca];
  }, [allAppointments]);

  const list = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  const clearSection = () => {
    try {
      const key='helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      let filtered = arr;
      if(tab==='past') filtered = arr.filter(a=> a.status !== 'completed');
      else if(tab==='cancelled') filtered = arr.filter(a=> a.status !== 'cancelled');
      localStorage.setItem(key, JSON.stringify(filtered));
      setRefresh(r=>r+1);
    } catch(e){ console.error('Failed to clear appointments section', e); }
  };

  const onCancel = (id) => {
    try {
      const key = 'helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = arr.map(item => item.id === id ? { ...item, status: 'cancelled', cancelledAt: new Date().toISOString() } : item);
      localStorage.setItem(key, JSON.stringify(updated));
      setRefresh(x => x + 1);
      setTab('cancelled');
    } catch (e) {
      console.error('Failed to cancel appointment:', e);
    }
  };

  const renderCard = (a) => (
    <div className="ma-card" key={a.id}>
      <div className="ma-left">
        <div className="ma-avatar">{(a.doctor || 'Dr').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
      </div>
      <div className="ma-body">
  <h4 className="ma-doctor"><TransText text={a.doctor || t('doctor')} /></h4>
  <p className="text-xs text-gray-500 font-medium mb-1">Patient: <span className="font-semibold text-gray-700"><TransText text={a.patientName || 'Patient'} /></span></p>
        <p className="ma-specialty"><TransText text={a.specialist || ''} /></p>
        <div className="ma-meta">
          <div><small className="text-muted">{t('date')}:</small><div className="ma-strong">{a.date}</div></div>
          <div><small className="text-muted">{t('time')}:</small><div className="ma-strong">{a.time}</div></div>
          <div><small className="text-muted">{t('hospital')}:</small><div className="ma-strong"><TransText text={a.hospitalName || '-'} /></div></div>
        </div>
        {a.healthIssue && (
          <div className="ma-notes"><strong>{t('reason')}:</strong><div><TransText text={a.healthIssue} /></div></div>
        )}
        {a.status === 'in_progress' && (
         <div className="ma-accepted-banner">Request Accepted by {a.doctor || 'Doctor'}</div>
        )}
        <div className="ma-actions">
          <button className="btn btn-outline" disabled>{t('reschedule')}</button>
          {tab === 'upcoming' ? (
            <button className="btn btn-outline-danger" onClick={() => onCancel(a.id)}>{t('cancel')}</button>
          ) : (
            <button className="btn btn-outline-danger" disabled>{t('cancel')}</button>
          )}
        </div>
      </div>
      <div className="ma-right">
        <div className="ma-status">{a.status === 'upcoming' ? t('scheduled') : <TransText text={a.status || t('scheduled')} />}</div>
      </div>
    </div>
  );

  return (
    <div className="ma-page container mx-auto px-6 py-8">
  <h1 className="text-2xl font-bold mb-4">{t('my_appointments')}</h1>

      <div className="ma-tabs card mb-6">
  <button className={`ma-tab ${tab==='upcoming'?'active':''}`} onClick={()=>setTab('upcoming')}>{t('upcoming')}</button>
  <button className={`ma-tab ${tab==='past'?'active':''}`} onClick={()=>setTab('past')}>{t('past')}</button>
        <button className={`ma-tab ${tab==='cancelled'?'active':''}`} onClick={()=>setTab('cancelled')}>{t('cancelled')}</button>
      </div>

      <div className="ma-list">
        {list.length > 0 ? (
          list.map(renderCard)
        ) : (
          <div className="text-muted">{tab === 'upcoming' ? t('no_upcoming_appointments') : tab === 'past' ? t('no_past_appointments') : t('no_cancelled_appointments')}</div>
        )}
      </div>
    </div>
  );
}
