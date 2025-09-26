// Simple localStorage + event based notification system with push notifications
// API:
//  addNotification({roleTargets: ['patient'|'doctor'|'pharmacy'|'all'], type, title, message, data})
//  markAllRead(role)
//  listen via window.addEventListener('helio_notifications', handler)

const STORAGE_KEY = 'helio_notifications';

// Lazy load push notification manager to avoid issues with SSR or missing browser APIs
let pushNotificationManager = null;
const getPushManager = async () => {
  if (!pushNotificationManager && typeof window !== 'undefined') {
    try {
      const { default: manager } = await import('./pushNotifications');
      pushNotificationManager = manager;
    } catch (error) {
      console.warn('Push notifications not available:', error);
    }
  }
  return pushNotificationManager;
};

export function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; }
}

export async function addNotification(notif) {
  const base = {
    id: 'NTF-' + Date.now() + '-' + Math.random().toString(36).slice(2,8),
    createdAt: new Date().toISOString(),
    readBy: [],
    ...notif
  };
  const all = loadNotifications();
  all.unshift(base);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Send push notification (async, non-blocking)
  if (typeof window !== 'undefined') {
    getPushManager().then(manager => {
      if (manager) {
        manager.sendPushNotification(base).catch(error => {
          console.error('Failed to send push notification:', error);
        });
      }
    }).catch(() => {
      // Silently fail if push notifications aren't available
    });
  }
  
  // Fire storage-like custom event for same-tab listeners
  try { window.dispatchEvent(new Event('helio_notifications')); } catch {}
  return base.id;
}

export function fetchRoleNotifications(role) {
  const all = loadNotifications();
  return all.filter(n => n.roleTargets?.includes('all') || n.roleTargets?.includes(role));
}

export function markAllRead(role) {
  const all = loadNotifications();
  let changed = false;
  all.forEach(n => {
    if ((n.roleTargets?.includes('all') || n.roleTargets?.includes(role)) && !n.readBy.includes(role)) { n.readBy.push(role); changed = true; }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    try { window.dispatchEvent(new Event('helio_notifications')); } catch {}
  }
}

export function markOneRead(id, role){
  const all = loadNotifications();
  const idx = all.findIndex(n=>n.id===id);
  if (idx>=0 && !all[idx].readBy.includes(role)) {
    all[idx].readBy.push(role);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    try { window.dispatchEvent(new Event('helio_notifications')); } catch {}
  }
}

// Helper wrappers for specific workflows
export function notifyAppointmentBooked(appt){
  addNotification({
    roleTargets:['doctor'],
    type:'appointment_booked',
    title:'New Appointment Request',
    message:`Patient ${appt.patientName || appt.patient || appt.patientId} requested an appointment on ${appt.date} at ${appt.time}`,
    data:{ id: appt.id }
  });
}

export function notifyAppointmentAccepted(appt){
  addNotification({
    roleTargets:['patient'],
    type:'appointment_accepted',
    title:'Appointment Confirmed',
    message:`Doctor ${appt.doctor || appt.doctorName} accepted your appointment for ${appt.date} ${appt.time}`,
    data:{ id: appt.id }
  });
}

export function notifyCallInitiated(appt, callType){
  addNotification({
    roleTargets:['patient'],
    type:'incoming_call',
    title: callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call',
    message:`Doctor ${appt.doctor || appt.doctorName} is calling you now.`,
    data:{ id: appt.id, callType }
  });
}

export function notifyPrescriptionCreated(record){
  addNotification({
    roleTargets:['pharmacy'],
    type:'prescription',
    title:'New Prescription',
    message:`Prescription ${record.id} created for patient ${record.patientName}`,
    data:{ id: record.id }
  });
}

export function notifyEmergencyRequest(req){
  addNotification({
    roleTargets:['pharmacy','doctor'],
    type:'emergency_request',
    title:'Emergency Medicine Request',
    message:`Emergency request from ${req.patient?.name || 'patient'} for ${req.medicines?.length || 0} item(s)`,
    data:{ id: req.id }
  });
}
