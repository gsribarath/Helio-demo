import React, { useMemo, useState, useEffect } from 'react';

// Rare Medicine Request page – UI replica based on provided design
// Notes:
// - This page focuses on professional, aligned, and responsive layout
// - Data is derived from localStorage (demo) so it renders even without backend
// - You can later wire it to API if needed

export default function RareMedicineRequest(){
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    try {
      const key = 'helio_prescription_requests';
      const raw = localStorage.getItem(key);
      const all = raw ? JSON.parse(raw) : [];
      // If user stored in LS, filter to current patient (so the page is "exclusively for requesting medicines")
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user?.id;
      const mine = patientId ? all.filter(r => r.patientId === patientId) : all;
      // newest first
      mine.sort((a,b)=> new Date(b.createdAt||b.created) - new Date(a.createdAt||a.created));
      setRequests(mine);
    } catch (_) {
      setRequests([]);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if(!q) return requests;
    return requests.filter(r =>
      (r.patientName||'').toLowerCase().includes(q)
      || (r.notes||'').toLowerCase().includes(q)
      || (r.id||'').toLowerCase().includes(q)
    );
  }, [query, requests]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-28">
      {/* Top bar spacer (aligns with app Navbar spacing) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title section */}
        <div className="pt-10 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Rare Medicine Requests</h1>
          <p className="mt-3 text-gray-500 max-w-3xl">
            Patients can request medicines not available in our stock. Search by patient name to view their
            requests and help them find alternative solutions.
          </p>
        </div>

        {/* Search block */}
        <div className="mt-4">
          <h2 className="text-gray-800 font-semibold mb-2">Search Requests</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search patient requests..."
                className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0011.15 11.15z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Patient Requests */}
        <div className="mt-10">
          <h2 className="text-gray-800 font-semibold mb-3">Patient Requests</h2>
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center text-gray-500">
                No requests yet. Use the Request Medicine button to create one.
              </div>
            )}

            {filtered.map(req => (
              <div key={req.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: patient meta */}
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{req.patientName || 'Patient'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {req.patientId || '—'}
                        {req.patientPhone ? ` • ${req.patientPhone}` : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {req.medicines?.length ? `${req.medicines.length} medicine(s)` : '1 medicine(s)'}
                        {' '}
                        • {new Date(req.createdAt || Date.now()).toISOString().slice(0,10)}
                      </div>
                    </div>

                    {/* Right: medicines summary */}
                    <div className="sm:text-right">
                      <div className="uppercase text-[11px] tracking-wider text-gray-400 font-semibold">MEDICINES</div>
                      <div className="text-sm text-gray-700 mt-1">
                        {req.medicineSummary || req.notes || 'image request'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacer to mimic bottom nav height (keeps content above nav) */}
      <div className="h-20" />
    </div>
  );
}
