import React, { useEffect, useState } from 'react';

// Full-page dedicated prescribed medicines view (no popup / modal).
// Flattens all medicines across every prescription for a professional, scannable card grid.
export default function MyMedicines(){
  const [items, setItems] = useState([]); // flattened medicine entries
  const [loading, setLoading] = useState(true);

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
      if(!raw){ setItems([]); setLoading(false); return; }
      const arr = JSON.parse(raw)||[];
      // Flatten all medicines (patient filtering removed until auth context exists)
      const flat = arr.flatMap(rec => (rec.medicines||[]).map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage || '-',
        qty: m.qty || 1,
        expiry: m.expiry || '—',
        doctor: rec.doctorName,
        doctorId: rec.doctorId,
        rxId: rec.id,
        createdAt: rec.createdAt
      })));
      // Sort newest first by createdAt
      flat.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      setItems(flat);
    } catch(e){ console.error('Load prescriptions failed', e); setItems([]); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 mb-10 text-center px-4 shadow">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">My Prescribed Medicines</h1>
        <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">A consolidated view of all medicines prescribed to you by doctors.</p>
      </header>
      <main className="max-w-6xl mx-auto px-4">
        {loading && <div className="py-24 text-center text-gray-500">Loading prescriptions...</div>}
        {!loading && items.length===0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-14 text-center">
            <div className="text-gray-500 font-medium mb-2">No prescribed medicines yet</div>
            <div className="text-xs text-gray-400">Your medicines will appear here after a doctor issues a prescription.</div>
          </div>
        )}
        {items.length>0 && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="text-sm font-semibold text-gray-600 tracking-wide">TOTAL MEDICINES <span className="ml-2 inline-block bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{items.length}</span></div>
              <div className="text-xs text-gray-500">Updated {new Date().toLocaleTimeString()}</div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map(it => (
                <div key={it.rxId + it.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 leading-snug mb-1 pr-6" title={it.name}>{it.name}</div>
                    <dl className="text-[11px] text-gray-600 space-y-1">
                      <div><dt className="sr-only">Dosage</dt><span className="font-medium text-gray-700">Dosage:</span> {it.dosage}</div>
                      <div><span className="font-medium text-gray-700">Quantity:</span> {it.qty}</div>
                      <div><span className="font-medium text-gray-700">Expiry:</span> {it.expiry}</div>
                      <div><span className="font-medium text-gray-700">Prescription:</span> {it.rxId}</div>
                    </dl>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 text-[10px] text-gray-500 space-y-1">
                    <div><span className="font-semibold text-gray-700">Doctor:</span> {it.doctor} <span className="opacity-60">({it.doctorId||'—'})</span></div>
                    <div className="opacity-70">{new Date(it.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-bold tracking-wide text-indigo-500">RX</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
