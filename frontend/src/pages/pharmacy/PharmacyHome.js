import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const PharmacyHome = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated load from localStorage or API
    const key = 'helio_pharmacy_requests';
    const raw = localStorage.getItem(key);
    if (raw) {
      try { setRequests(JSON.parse(raw)); } catch(_) {}
    } else {
      const seed = [
        { id: 'R-1001', patientId: 'P-001', patientName: 'Gurpreet Singh', medicines: [{name:'Atorvastatin', qty:30}], date: new Date().toISOString(), status: 'pending' },
        { id: 'R-1002', patientId: 'P-017', patientName: 'Simran Kaur', medicines: [{name:'Metformin', qty:60},{name:'Vitamin D3', qty:10}], date: new Date(Date.now()-3600_000).toISOString(), status: 'pending' }
      ];
      localStorage.setItem(key, JSON.stringify(seed));
      setRequests(seed);
    }
    setLoading(false);
  }, []);

  const updateStatus = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? {...r, status} : r));
    const key = 'helio_pharmacy_requests';
    const updated = requests.map(r => r.id === id ? {...r, status} : r);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    preparing: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight">Welcome to Helio</h1>
          <p className="text-primary-light font-medium max-w-2xl mx-auto">Manage and track pharmacy medicine requests in real-time. Approve, reject and prepare orders seamlessly.</p>
          <p className="text-primary-light mt-2">Efficient dispensing ensures better patient outcomes.</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading requests...</div>}
      {!loading && requests.length === 0 && <div className="text-center py-16 bg-white border rounded-lg shadow-sm">No requests yet.</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap:'0.1cm'}}>
        {requests.map(req => (
          <div key={req.id} className="card flex flex-col h-full border border-border-light">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">{req.patientName}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[req.status]}`}>{req.status.charAt(0).toUpperCase()+req.status.slice(1)}</span>
              </div>
              <p className="text-xs text-gray-500">Request ID: {req.id} • Patient ID: {req.patientId}</p>
            </div>
            <div className="flex-1">
              <ul className="text-sm space-y-1 mb-3">
                {req.medicines.map((m,i)=>(<li key={i} className="flex justify-between"><span className="text-gray-700">{m.name}</span><span className="font-semibold text-gray-900">{m.qty}</span></li>))}
              </ul>
              <div className="text-xs text-gray-500 flex items-center gap-2 mb-4"><FaClock className="text-gray-400"/> {new Date(req.date).toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-auto">
              <button onClick={()=>updateStatus(req.id,'approved')} disabled={req.status!=='pending'} className={`btn btn-success py-2 px-3 text-xs ${req.status!=='pending'?'opacity-60 cursor-not-allowed':''}`}>Approve</button>
              <button onClick={()=>updateStatus(req.id,'rejected')} disabled={req.status!=='pending'} className={`btn btn-secondary py-2 px-3 text-xs ${req.status!=='pending'?'opacity-60 cursor-not-allowed':''}`}>Reject</button>
              <button onClick={()=>updateStatus(req.id,'preparing')} disabled={!(req.status==='approved')} className={`btn btn-outline py-2 px-3 text-xs ${req.status!=='approved'?'opacity-60 cursor-not-allowed':''}`}>Prepare</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyHome;
