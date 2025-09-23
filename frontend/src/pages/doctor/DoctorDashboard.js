import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  FaBell,
  FaCalendarAlt,
  FaVideo,
  FaPhone,
  FaUserClock,
  FaHeartbeat,
  FaFileMedical,
  FaFilePrescription,
  FaClipboardList,
  FaStethoscope,
  FaUserMd,
  FaChartBar,
  FaExclamationTriangle,
  FaPaperPlane,
  FaMicrophone,
  FaSearch
} from 'react-icons/fa';

/*
  DoctorDashboard
  ---------------------------------------------------------------------------
  This component mirrors the visual styling of PatientHome but surfaces doctor-
  centric workflows:
   - Availability & Scheduling management
   - Consultation tools (video/audio, patient history, reports)
   - Prescription composer (mock / frontend-only for now)
   - Referral creation
   - Basic analytics summary
  All data is currently mocked; replace with real API calls when backend ready.
*/

const defaultAvailability = () => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return days.map(d => ({ day: d, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }], paused: false }));
};

const dosageTemplates = [
  { id: 'template1', label: '1-0-1 after food (5 days)' },
  { id: 'template2', label: '0-0-1 at bedtime (10 days)' },
  { id: 'template3', label: '1-1-1 before food (3 days)' }
];

const mockMedicines = ['Paracetamol 500mg', 'Amoxicillin 500mg', 'Azithromycin 250mg', 'Cetirizine 10mg', 'Omeprazole 20mg'];

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Notifications (mock similar to patient)
  const [notifications, setNotifications] = useState([]);

  // Availability
  const [availability, setAvailability] = useState(defaultAvailability());
  const [slotDuration, setSlotDuration] = useState(15);
  const [emergencyOverride, setEmergencyOverride] = useState(false);

  // Prescription composer state
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [selectedDosageTemplate, setSelectedDosageTemplate] = useState('');
  const [notes, setNotes] = useState('');

  // Referral state
  const [referral, setReferral] = useState({ patientId: '', specialty: '', reason: '' });

  // Analytics mock
  const [analytics, setAnalytics] = useState({ today: 0, weekly: 0, monthly: 0, uniquePatients: 0, noShows: 0, commonComplaints: [] });

  useEffect(() => {
    // Mock fetch
    setNotifications([
      { id: 1, title: 'New appointment booked', message: 'Patient: Amanpreet Kaur at 10:30', time: '10m ago', read: false },
      { id: 2, title: 'Report uploaded', message: 'Blood test report from Gurpreet Singh', time: '1h ago', read: false }
    ]);
    setAnalytics({
      today: 6,
      weekly: 32,
      monthly: 118,
      uniquePatients: 74,
      noShows: 3,
      commonComplaints: ['Fever', 'Cough', 'Hypertension']
    });
  }, []);

  const togglePauseDay = (idx) => {
    setAvailability(prev => prev.map((d,i) => i === idx ? { ...d, paused: !d.paused } : d));
  };

  const addPrescriptionItem = () => {
    if (!medicineQuery.trim()) return;
    setPrescriptionItems(items => [...items, { id: Date.now(), name: medicineQuery.trim(), dosage: selectedDosageTemplate, instructions: notes }]);
    setMedicineQuery('');
    setSelectedDosageTemplate('');
  };

  const removePrescriptionItem = (id) => {
    setPrescriptionItems(items => items.filter(i => i.id !== id));
  };

  const filteredMedicines = medicineQuery ? mockMedicines.filter(m => m.toLowerCase().includes(medicineQuery.toLowerCase())).slice(0,5) : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-32" style={{paddingBottom:'0'}}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('doctor_dashboard', 'Doctor Dashboard')} - {user?.name || t('doctor', 'Doctor')}</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaUserMd className="text-blue-500" /> {t('manage_practice_sub', 'Manage your consultations, availability & prescriptions')}
            </p>
          </div>
          <div className="relative">
            <FaBell className="text-gray-600 text-xl" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Availability Management */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaUserClock /> {t('availability_management', 'Availability & Scheduling')}</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('slot_duration', 'Slot Duration')}</label>
              <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
                {[10,15,20,30].map(d => <option key={d} value={d}>{d} {t('minutes', 'min')}</option>)}
              </select>
            </div>
            <button onClick={() => setEmergencyOverride(o => !o)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${emergencyOverride ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>
              <FaExclamationTriangle /> {emergencyOverride ? t('emergency_on', 'Emergency ON') : t('emergency_override', 'Emergency Override')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {availability.map((day, idx) => (
              <div key={day.day} className="border rounded-lg p-3 text-sm relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{day.day}</span>
                  <button onClick={() => togglePauseDay(idx)} className={`text-xs px-2 py-1 rounded ${day.paused ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{day.paused ? t('paused', 'Paused') : t('pause', 'Pause')}</button>
                </div>
                {day.paused ? (
                  <p className="text-xs text-gray-500 italic">{t('day_paused', 'No slots (paused)')}</p>
                ) : (
                  <ul className="space-y-1">
                    {day.slots.map((s,i) => <li key={i} className="bg-blue-50 px-2 py-1 rounded flex items-center justify-between"><span>{s.start} - {s.end}</span></li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Tools */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaStethoscope /> {t('consultation_tools', 'Consultation Tools')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaVideo /> {t('start_video_consult', 'Start Video Consult')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('video_consult_desc', 'Launch a secure video session')}</p>
            <button onClick={() => window.location.href='/video-call'} className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><FaVideo /> {t('start', 'Start')}</button>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaPhone /> {t('start_audio_consult', 'Start Audio Consult')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('audio_consult_desc', 'Low bandwidth option')}</p>
            <button onClick={() => window.location.href='/audio-call'} className="mt-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><FaPhone /> {t('start', 'Start')}</button>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaFileMedical /> {t('patient_history', 'Patient History')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('patient_history_desc', 'View reports, allergies & previous prescriptions')}</p>
            <button className="mt-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">{t('open', 'Open')}</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaClipboardList /> {t('reports', 'Reports')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('upload_download_reports', 'Upload or download patient test reports')}</p>
            <div className="flex gap-2 mt-auto">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm">{t('upload', 'Upload')}</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm">{t('download', 'Download')}</button>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaFilePrescription /> {t('digital_prescriptions', 'Digital Prescriptions')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('digital_prescriptions_desc', 'Compose and send prescriptions')}</p>
            <button className="mt-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm">{t('compose', 'Compose')}</button>
          </div>
        </div>
      </section>

      {/* Prescription Composer */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaFilePrescription /> {t('prescription_composer', 'Prescription Composer')}</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FaSearch className="text-gray-400" /> {t('medicine_name', 'Medicine Name')}</label>
              <input value={medicineQuery} onChange={e => setMedicineQuery(e.target.value)} placeholder={t('search_medicine', 'Search medicine...')} className="w-full border rounded-lg px-3 py-2 text-sm" />
              {filteredMedicines.length > 0 && (
                <ul className="mt-2 border rounded-lg bg-white shadow-sm max-h-40 overflow-auto text-sm">
                  {filteredMedicines.map(m => <li key={m} className="px-3 py-1 hover:bg-blue-50 cursor-pointer" onClick={() => setMedicineQuery(m)}>{m}</li>)}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('dosage_template', 'Dosage Template')}</label>
              <select value={selectedDosageTemplate} onChange={e => setSelectedDosageTemplate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">{t('select', 'Select')}</option>
                {dosageTemplates.map(dt => <option key={dt.id} value={dt.label}>{dt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('voice_dictation', 'Voice Dictation')}</label>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"><FaMicrophone /> {t('record', 'Record')}</button>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('instructions_notes', 'Instructions / Notes')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <button onClick={addPrescriptionItem} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">{t('add_item', 'Add Item')}</button>
              <button onClick={() => { setPrescriptionItems([]); setNotes(''); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">{t('clear', 'Clear')}</button>
            </div>
          </div>
          {prescriptionItems.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">{t('items', 'Items')}</h3>
              <ul className="space-y-2">
                {prescriptionItems.map(item => (
                  <li key={item.id} className="border rounded-lg p-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.dosage && <p className="text-xs text-gray-600">{item.dosage}</p>}
                      {item.instructions && <p className="text-xs text-gray-500 mt-1">{item.instructions}</p>}
                    </div>
                    <button onClick={() => removePrescriptionItem(item.id)} className="text-red-500 text-xs hover:underline">{t('remove', 'Remove')}</button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><FaPaperPlane /> {t('save_send', 'Save & Send')}</button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">{t('download_pdf', 'Download PDF')}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Referrals & Analytics */}
      <section className="px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaHeartbeat /> {t('referrals', 'Referrals')}</h2>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient_id', 'Patient ID')}</label>
                  <input value={referral.patientId} onChange={e => setReferral(r => ({ ...r, patientId: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('specialty', 'Specialty')}</label>
                  <input value={referral.specialty} onChange={e => setReferral(r => ({ ...r, specialty: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('reason', 'Reason')}</label>
                  <textarea rows={3} value={referral.reason} onChange={e => setReferral(r => ({ ...r, reason: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">{t('generate_referral', 'Generate Referral')}</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">{t('clear', 'Clear')}</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaChartBar /> {t('analytics_reports', 'Analytics & Reports')}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500">{t('consultations_today', 'Consultations Today')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.today}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500">{t('weekly', 'Weekly')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.weekly}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500">{t('monthly', 'Monthly')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.monthly}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500">{t('unique_patients', 'Unique Patients')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.uniquePatients}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">{t('common_complaints', 'Common Complaints')}</h3>
              <ul className="flex flex-wrap gap-2 text-xs">
                {analytics.commonComplaints.map(c => <li key={c} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{c}</li>)}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{t('no_shows', 'No Shows')}</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.noShows}</p>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{t('retention_rate', 'Retention Rate')}</p>
                  <p className="text-xl font-semibold text-gray-800">88%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboard;
