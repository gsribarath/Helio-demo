import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Structured table view of prescribed medicines (grouped by prescription with rowSpan, strong grid lines)
export default function MyMedicines(){
  const [records, setRecords] = useState([]); // full prescription records
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    load();
    const onStorage = (e) => { if(e.key==='helio_prescriptions') load(); };
    const onCustom = () => load();
    window.addEventListener('storage', onStorage);
    window.addEventListener('helio_prescriptions_updated', onCustom);
    return ()=> { window.removeEventListener('storage', onStorage); window.removeEventListener('helio_prescriptions_updated', onCustom); };
  },[]);

  const load = () => {
    try {
      const raw = localStorage.getItem('helio_prescriptions');
      if(!raw){ setRecords([]); setLoading(false); return; }
      const arr = JSON.parse(raw)||[];
      // Sort prescriptions newest first
      arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      setRecords(arr);
    } catch(e){ console.error('Load prescriptions failed', e); setRecords([]); }
    setLoading(false);
  };

  const clearAll = () => {
    if(!window.confirm('Clear all prescriptions? This cannot be undone.')) return;
    try {
      localStorage.setItem('helio_prescriptions', '[]');
      setRecords([]);
      try { window.dispatchEvent(new Event('helio_prescriptions_updated')); } catch(_){ }
    } catch(e){ console.error('Failed to clear prescriptions', e); }
  };

  // Modal upload logic removed; handled by /request-medicine page

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Static Back Button and Page Title */}
      <div className="page-header-with-back">
        <button 
          onClick={() => navigate(-1)} 
          className="btn-blue flex items-center gap-2"
        >
          <span>←</span> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Prescribed Medicines</h1>
      </div>
      
      <main className="px-4 max-w-7xl mx-auto pt-6">
        {loading && <div className="py-24 text-center text-gray-500">Loading prescriptions...</div>}
        {!loading && records.length===0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-14 text-center">
            <div className="text-gray-500 font-medium mb-2">No prescribed medicines yet</div>
            <div className="text-xs text-gray-400">They will appear here once a doctor issues a prescription.</div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            type="button" 
            onClick={() => navigate('/request-medicine')}
            className="my-appointments-btn px-8 py-3 text-sm font-semibold text-center"
            title="Request medicine with prescription"
          >
            Request Medicine
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/emergency-request')}
            className="emergency-btn px-8 py-3 text-sm font-semibold text-center"
            title="Emergency medicine request"
          >
            Emergency
          </button>
          {records.length > 0 && (
            <button 
              type="button" 
              onClick={clearAll} 
              className="my-appointments-btn px-8 py-3 text-sm font-semibold text-center" 
              title="Clear all prescriptions"
            >
              Clear All
            </button>
          )}
        </div>

        {records.length>0 && (
          <div className="space-y-6">
            {records.map(rec => {
              const count = rec.medicines?.length || 0;
              return (
                <div key={rec.id} className="rx-card">
                  <div className="rx-card-header">
                    <div>
                      <h2 className="rx-card-title">{rec.doctorName}</h2>
                      <div className="rx-card-meta">
                        {new Date(rec.createdAt).toLocaleString()}
                      </div>
                      <div className="rx-card-meta text-blue-600 font-semibold mt-1">
                        Prescription ID: {rec.id}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Medicine</th>
                          <th className="text-left">Dosage</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-left">Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rec.medicines||[]).map((m, index) => (
                          <tr key={m.id+rec.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="font-medium text-gray-800">{m.name}</td>
                            <td className="text-gray-700">{m.dosage || '-'}</td>
                            <td className="text-center font-semibold text-blue-600">x{m.qty || 1}</td>
                            <td className="text-gray-700 whitespace-nowrap">{m.expiry || '—'}</td>
                          </tr>
                        ))}
                        {count===0 && (
                          <tr>
                            <td colSpan={4} className="text-center text-gray-500 py-8">No medicines prescribed</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Request popup removed: redirecting to /request-medicine */}
    </div>
  );
}
