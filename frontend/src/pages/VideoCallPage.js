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
  FaShareSquare,
  FaTimes
} from 'react-icons/fa';
import './VideoCallPage.css';
import TransText from '../components/TransText';

const VideoCallPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, patient, callType, appointment, callSessionId, appointmentId } = location.state || {};
  const [phase, setPhase] = useState('ringing'); // ringing | active | ended | declined

  // Call states
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true); // always true now, but kept for compatibility
  const [showChat, setShowChat] = useState(false);
  // Inventory / prescription state
  const [inventory, setInventory] = useState([]);
  const [invSearch, setInvSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxToast, setRxToast] = useState(null); // {msg}

  // Lifecycle: ringing -> active after patient accept (patient auto-accept for doctor side)
  useEffect(() => {
    if (!doctor || !patient) {
      navigate('/');
      return;
    }
    // For doctor side auto start; for patient side wait for accept UI
    const isDoctorSide = !patient.name || patient.name.toLowerCase() === 'patient' ? false : true; // heuristic
    if (isDoctorSide) {
      setPhase('ringing');
      const autoTimer = setTimeout(()=> setPhase('active'), 1500);
      return () => clearTimeout(autoTimer);
    }
  }, [doctor, patient, navigate]);

  // Timer only when active
  useEffect(()=>{
    if (phase !== 'active') return;
    const timer = setInterval(()=> setCallDuration(p=>p+1),1000);
    return ()=> clearInterval(timer);
  }, [phase]);

  // Load / seed inventory with 100 medicines if not already present or insufficient
  useEffect(()=>{
    try {
      const key='helio_inventory';
      const raw = localStorage.getItem(key);
      if(raw){
        const arr = JSON.parse(raw);
        if(Array.isArray(arr) && arr.length >= 100){ setInventory(arr); return; }
      }
      const baseNames = [
        'Paracetamol 500mg','Amoxicillin 250mg','Ibuprofen 400mg','Cough Syrup','Insulin Pen',
        'Vitamin D3 60000 IU','Metformin 500mg','Azithromycin 500mg','Cetirizine 10mg','Omeprazole 20mg'
      ];
      const seed = Array.from({length:100}, (_,i)=>{
        const idx = i+1;
        const base = baseNames[i % baseNames.length];
        const stock = (idx * 13) % 550; // varied stock
        const year = 2025 + (idx % 3); // 2025-2027
        const month = ((idx % 12) + 1).toString().padStart(2,'0');
        const day = ((idx % 27) + 1).toString().padStart(2,'0');
        return {
          id: `MED-${idx.toString().padStart(4,'0')}`,
            name: base,
            category: 'General',
            stock,
            unitPrice: 10 + (idx % 30),
            expiry: `${year}-${month}-${day}`
        };
      });
      localStorage.setItem(key, JSON.stringify(seed));
      setInventory(seed);
    } catch(e){ console.error('Inventory load failed', e); }
  },[]);

  const filteredInventory = inventory.filter(m => m.name.toLowerCase().includes(invSearch.toLowerCase()) || m.id.toLowerCase().includes(invSearch.toLowerCase()));

  const availability = (s) => {
    if(s === 0) return {label:'Out'};
    if(s < 30) return {label:'Low'};
    return {label:'In Stock'};
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openPrescription = () => {
    if(selectedIds.size === 0) return;
    setShowRxModal(true);
  };

  const finalizePrescription = () => {
    try {
      const chosen = inventory.filter(m => selectedIds.has(m.id));
      const key='helio_prescriptions';
      const existing = JSON.parse(localStorage.getItem(key)||'[]');
      const record = {
        id: 'RX-' + Date.now(),
        patientId: patient.id,
        patientName: patient.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        medicines: chosen.map(c => ({ id:c.id, name:c.name, qty:1, expiry:c.expiry, stock:c.stock })),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify([record, ...Array.isArray(existing)?existing:[]]));
      setShowRxModal(false);
      setSelectedIds(new Set());
      setRxToast({msg:'Prescription sent'});
      setTimeout(()=> setRxToast(null), 4000);
    } catch(e){ console.error('Prescribe failed', e); }
  };

  const cleanupSession = () => {
    try {
      if (!appointmentId) return;
      const key='helio_appointments';
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      const updated = arr.map(a=> a.id===appointmentId ? { ...a, callType:null, callSessionId:null } : a);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch(e){ console.error('Failed to cleanup call session', e); }
  };

  // Show controls on mouse move
  // Controls are always visible (static) per new UX requirement.

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setPhase('ended');
    cleanupSession();
    setTimeout(()=> navigate('/'), 1200);
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

  if (!doctor) return null;

  const renderRingingOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          {doctor.name?.charAt(0)}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Incoming {callType === 'video' ? 'Video' : 'Audio'} Call</h2>
        <p className="text-sm text-gray-600 mb-4">Connecting you with <strong>{doctor.name}</strong>...</p>
        <div className="flex gap-3 justify-center">
          <button onClick={()=>setPhase('active')} className="btn btn-success px-4 py-2 text-sm">Accept</button>
          <button onClick={()=>{ setPhase('declined'); cleanupSession(); setTimeout(()=>navigate('/'),800); }} className="btn btn-secondary px-4 py-2 text-sm">Decline</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vc-page" style={{paddingBottom:'120px'}}>
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
                  <div className="vc-dummy-status">{ phase === 'active' ? t('video') + ' ' + t('call','Call') + ' Active' : 'Ringing...' }</div>
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

            {phase === 'active' && (
            <div className={`vc-controls ${showControls ? 'visible' : ''}`} style={{bottom:'110px'}}>
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
            )}
          </div>
        </main>

        {/* Right side inventory panel with table */}
        {phase === 'active' && (
  <aside className="hidden xl:flex flex-col vc-sidebar inventory-panel bg-white border-l border-gray-200">
          <div className="inv-header">
            <h3>Medicine Inventory</h3>
            <input value={invSearch} onChange={(e)=>setInvSearch(e.target.value)} placeholder="Search medicines..." />
          </div>
          <div className="inv-table-wrap">
            <table className="vc-inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(m => {
                  const av = availability(m.stock);
                  const sel = selectedIds.has(m.id);
                  const statusClass = av.label.toLowerCase().replace(/\s+/g,'-');
                  return (
                    <tr key={m.id} className={sel? 'selected' : ''} onClick={()=>toggleSelect(m.id)}>
                      <td title={m.name}>{m.name}</td>
                      <td><span className={`status-badge ${statusClass}`}>{av.label}</span></td>
                      <td>{m.expiry}</td>
                    </tr>
                  );
                })}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{textAlign:'center',fontSize:12,color:'#6b7280'}}>No medicines</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="inv-footer">
            <button disabled={selectedIds.size===0} onClick={openPrescription} className={`w-full btn btn-success py-2 text-sm ${selectedIds.size===0?'opacity-60 cursor-not-allowed':''}`}>Prescribe {selectedIds.size>0?`(${selectedIds.size})`:''}</button>
          </div>
        </aside>
        )}

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
      {phase === 'ringing' && renderRingingOverlay()}
      {showRxModal && (
        <div className="rx-overlay-local">
          <div className="rx-modal rx-modal-large">
            <h3>Finalize Prescription</h3>
            <div className="rx-table-container">
              <table className="rx-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th style={{width:62}}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(selectedIds).map(id => {
                    const m = inventory.find(x=>x.id===id);
                    if(!m) return null;
                    const av = availability(m.stock);
                    const statusClass = av.label.toLowerCase().replace(/\s+/g,'-');
                    return (
                      <tr key={m.id} className="selected group" title="Click row to toggle select">
                        <td onClick={()=>toggleSelect(m.id)}>{m.name}</td>
                        <td onClick={()=>toggleSelect(m.id)}><span className={`status-badge ${statusClass}`}>{av.label}</span></td>
                        <td onClick={()=>toggleSelect(m.id)}>{m.expiry}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            aria-label="Remove medicine"
                            onClick={(e)=>{ e.stopPropagation(); toggleSelect(m.id); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition"
                            title="Remove"
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {selectedIds.size===0 && (
                    <tr>
                      <td colSpan={4} style={{textAlign:'center',fontSize:12,color:'#555'}}>No medicines selected</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="rx-summary">Selected: {selectedIds.size} medicine{selectedIds.size!==1?'s':''}</div>
            <div className="rx-actions">
              <button onClick={()=>setShowRxModal(false)} className="btn btn-secondary py-2 text-sm">Cancel</button>
              <button disabled={selectedIds.size===0} onClick={finalizePrescription} className={`btn btn-success py-2 text-sm ${selectedIds.size===0?'opacity-60 cursor-not-allowed':''}`}>Prescribe</button>
            </div>
          </div>
        </div>
      )}
      {rxToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-md shadow z-[10000] text-sm font-medium">{rxToast.msg}</div>
      )}
    </div>
  );
};

export default VideoCallPage;