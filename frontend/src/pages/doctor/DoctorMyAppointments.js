import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../../components/TransText';

const toDate = (d,t) => {
  if(!d) return null; const [hhmm, period] = (t||'00:00').split(' '); const [hRaw,m] = hhmm.split(':'); let h=parseInt(hRaw,10); if(period){const pm=period.toUpperCase()==='PM'; if(pm && h<12) h+=12; if(!pm && h===12) h=0;} return new Date(`${d}T${String(h).padStart(2,'0')}:${m||'00'}:00`);
};

export default function DoctorMyAppointments(){
  const { t } = useTranslation();
  const [refresh,setRefresh]=useState(0);
  const DOCTOR_ID='1';
  const [tab,setTab]=useState('upcoming'); // upcoming | waiting | completed

  const all = useMemo(()=>{
    try { const raw=localStorage.getItem('helio_appointments'); const arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr.filter(a=> a.doctorId===DOCTOR_ID || a.doctorId==null):[]; } catch{ return []; }
  },[refresh]);

  const sections = useMemo(()=>{
    const upcoming=[]; const waiting=[]; const completed=[];
    for(const a of all){
      if(a.status==='completed'){ completed.push(a); continue; }
      if(a.status==='waiting'){ waiting.push(a); continue; }
      if(a.status==='upcoming' || a.status==='in_progress'){ upcoming.push(a); continue; }
    }
    const sortAsc=(x,y)=> toDate(x.date,x.time)-toDate(y.date,y.time);
    const sortDesc=(x,y)=> toDate(y.date,y.time)-toDate(x.date,x.time);
    upcoming.sort(sortAsc); waiting.sort(sortAsc); completed.sort(sortDesc);
    return {upcoming,waiting,completed};
  },[all]);

  useEffect(()=>{ const onStorage=e=>{ if(e.key==='helio_appointments') setRefresh(r=>r+1); }; window.addEventListener('storage',onStorage); return ()=> window.removeEventListener('storage',onStorage); },[]);

  const renderCard=a=> (
    <div key={a.id} className="ma-card">
      <div className="ma-left"><div className="ma-avatar">{(a.patientName||'P').slice(0,2).toUpperCase()}</div></div>
      <div className="ma-body">
        <h4 className="ma-doctor"><TransText text={a.patientName||'Patient'} /></h4>
        <p className="ma-specialty"><TransText text={a.healthIssue||''} /></p>
        <div className="ma-meta">
          <div><small className="text-muted">{t('date')}:</small><div className="ma-strong">{a.date}</div></div>
          <div><small className="text-muted">{t('time')}:</small><div className="ma-strong">{a.time}</div></div>
          <div><small className="text-muted">Dur:</small><div className="ma-strong">{a.durationMinutes||30}m</div></div>
        </div>
        {a.status==='in_progress' && <div className="ma-accepted-banner">Accepted</div>}
      </div>
      <div className="ma-right"><div className="ma-status">{a.status}</div></div>
    </div>
  );

  const list = tab==='upcoming'? sections.upcoming : tab==='waiting'? sections.waiting : sections.completed;

  return (
    <div className="ma-page container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Doctor – {t('appointments', t('my_appointments'))}</h1>
      <div className="ma-tabs card mb-6">
        <button className={`ma-tab ${tab==='upcoming'?'active':''}`} onClick={()=>setTab('upcoming')}>{t('upcoming')}</button>
        <button className={`ma-tab ${tab==='waiting'?'active':''}`} onClick={()=>setTab('waiting')}>{t('waiting','Waiting')}</button>
        <button className={`ma-tab ${tab==='completed'?'active':''}`} onClick={()=>setTab('completed')}>{t('completed','Completed')}</button>
      </div>
      <div className="ma-list">
        {list.length ? list.map(renderCard) : (
          <div className="text-muted">
            {tab==='upcoming' && 'No upcoming'}
            {tab==='waiting' && 'No waiting'}
            {tab==='completed' && 'No completed'}
          </div>
        )}
      </div>
    </div>
  );
}
