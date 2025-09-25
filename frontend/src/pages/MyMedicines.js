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
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 mb-10 text-center px-4 shadow">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">My Prescribed Medicines</h1>
        <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">A consolidated table of all medicines prescribed to you.</p>
      </header>
      <main className="px-4 max-w-7xl mx-auto">
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
          <>
            <style>{`
              /* Add strong black separator line between prescription blocks */
              .rx-card { border:none; border-radius:0; background:transparent; padding:0 0 20px 0; }
              .rx-card:not(:first-child){ border-top:2px solid #000; margin-top:0.1cm; padding-top:20px; }
              .rx-inner-table { border-collapse: collapse; }
              .rx-inner-table th, .rx-inner-table td { border:1px solid #1e293b !important; }
              .rx-inner-table th { background:#f1f5f9; font-size:12px; letter-spacing:.5px; }
              .rx-inner-table tbody tr:nth-child(even){ background:#f8fafc; }
              .rx-inner-table tbody tr:hover { background:#eef2ff; }
            `}</style>
            <div className="flex flex-col" style={{ gap: '0.1cm' }}>
              {records.map(rec => {
                const count = rec.medicines?.length || 0; // retained for empty table fallback
                return (
                  <div key={rec.id} className="rx-card p-0 overflow-hidden">
                    <div className="text-left py-5 px-6 bg-white border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{rec.doctorName}</h2>
                      <p className="text-gray-500 text-xs mb-2">{new Date(rec.createdAt).toLocaleString()}</p>
                      <p className="text-indigo-600 text-sm font-semibold">Prescription ID: {rec.id}</p>
                    </div>

                    <div className="p-6 bg-gray-50">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm bg-white rx-inner-table">
                          <thead>
                            <tr className="text-gray-800">
                              <th className="px-3 py-2 text-left font-semibold">Medicine</th>
                              <th className="px-3 py-2 text-left font-semibold">Dosage</th>
                              <th className="px-3 py-2 text-center font-semibold">Quantity</th>
                              <th className="px-3 py-2 text-left font-semibold">Expiry</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(rec.medicines||[]).map(m => (
                              <tr key={m.id+rec.id}>
                                <td className="px-3 py-2 align-top font-medium text-gray-800 min-w-[140px]">{m.name}</td>
                                <td className="px-3 py-2 align-top text-gray-700 text-[13px]">{m.dosage || '-'}</td>
                                <td className="px-3 py-2 align-top text-center font-semibold">x{m.qty || 1}</td>
                                <td className="px-3 py-2 align-top text-gray-700 text-[13px] whitespace-nowrap">{m.expiry || '—'}</td>
                              </tr>
                            ))}
                            {count===0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">No medicines prescribed</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Request popup removed: redirecting to /request-medicine */}
    </div>
  );
}
