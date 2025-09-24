import React, { useEffect, useState, useMemo } from 'react';
import PharmacyBottomNavigation from '../../components/PharmacyBottomNavigation';
import { FaUserMd, FaUserInjured, FaClock } from 'react-icons/fa';

// Simulated request data shape (doctor prescribed medicines)
// id, patient: {id,name,age,gender}, doctor: {id,name,specialty}, medicines: [{name,dosage,qty,instructions}], created

const PharmacyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const key='helio_pharmacy_prescriptions';
    const raw = localStorage.getItem(key);
    if(raw){
      try { 
        const parsed = JSON.parse(raw) || [];
        // Filter out any legacy seeded demo/fake requests by known IDs or patient names
        const fakeIds = new Set(['PR-2001','PR-2002']);
        const fakePatients = new Set(['Harish Mehta','Ritika Verma']);
        const filtered = parsed.filter(r => !(fakeIds.has(r.id) || fakePatients.has(r?.patient?.name)));
        if(filtered.length !== parsed.length){
          // Persist cleaned list so they don't reappear next reload
          localStorage.setItem(key, JSON.stringify(filtered));
        }
        setRequests(filtered);
      } catch(_) { 
        setRequests([]);
        localStorage.setItem(key, '[]');
      }
    } else {
      // Start empty (no fake seed)
      setRequests([]);
      localStorage.setItem(key, '[]');
    }
    setLoading(false);
  },[]);

  // Build table rows with rowSpan for grouped columns (patient/doctor info per prescription)
  const rows = useMemo(()=>{
    return requests.flatMap(req => (req.medicines||[]).map((m,i) => ({
      req, m, first: i===0, span: (req.medicines||[]).length || 1
    })));
  }, [requests]);

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 mb-8 text-center px-4 shadow">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Prescription Requests</h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-sm">Doctor-prescribed medicine orders awaiting pharmacy action. Review patient & doctor details before approving.</p>
      </div>

      {loading && <div className="text-center py-16 text-gray-500">Loading prescription requests...</div>}
      {!loading && requests.length===0 && <div className="text-center py-20 bg-white border rounded-xl shadow-sm mx-4">No prescription requests.</div>}

      {requests.length>0 && (
        <div className="w-full px-4">
          <div className="overflow-x-auto max-w-7xl mx-auto">
          {/* Strong visible grid lines styling */}
          <style>{`
            .rx-req-table { border-collapse: collapse; }
            .rx-req-table th, .rx-req-table td { border:1px solid #1e293b !important; padding:6px 10px; }
            .rx-req-table thead th { background:#f1f5f9; font-size:12px; letter-spacing:.5px; }
            .rx-req-table tbody tr:nth-child(even){ background:#f8fafc; }
            .rx-req-table tbody tr:hover { background:#eef2ff; }
            .rx-req-table th.actions-col, .rx-req-table td.actions-col { width:220px; min-width:220px; }
            .rx-req-table td.actions-col .action-buttons { display:flex; flex-direction:column; gap:8px; max-width:180px; }
          `}</style>
          <table className="rx-req-table w-full text-sm bg-white shadow-sm">
            <thead className="bg-gray-100/80 backdrop-blur-sm">
              <tr className="text-gray-700">
                <th className="px-3 py-3 border border-gray-300 text-left font-semibold">Request ID</th>
                <th className="px-3 py-3 border border-gray-300 text-left font-semibold"><span className="inline-flex items-center gap-2"><FaUserInjured className="text-indigo-500"/> Patient</span></th>
                <th className="px-3 py-3 border border-gray-300 font-semibold">Age</th>
                <th className="px-3 py-3 border border-gray-300 font-semibold">Gender</th>
                <th className="px-3 py-3 border border-gray-300 text-left font-semibold"><span className="inline-flex items-center gap-2"><FaUserMd className="text-blue-600"/> Doctor</span></th>
                <th className="px-3 py-3 border border-gray-300 font-semibold">Specialty</th>
                <th className="px-3 py-3 border border-gray-300 text-left font-semibold">Medicine</th>
                <th className="px-3 py-3 border border-gray-300 font-semibold">Dosage</th>
                <th className="px-3 py-3 border border-gray-300 font-semibold">Qty</th>
                <th className="px-3 py-3 border border-gray-300 text-left font-semibold">Instructions</th>
                <th className="px-3 py-3 border border-gray-300 font-semibold"><span className="inline-flex items-center gap-1"><FaClock className="text-gray-500"/> Created</span></th>
                <th className="px-3 py-3 border border-gray-300 font-semibold actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,idx)=>(
                <tr key={r.req.id + '-' + r.m.name + '-' + idx} className="hover:bg-indigo-50/40 transition-colors">
                  {r.first && (
                    <>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top font-semibold text-gray-800 bg-gray-50 text-xs">{r.req.id}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top font-medium text-gray-900">{r.req.patient.name}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top text-center">{r.req.patient.age ?? '-'}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top text-center uppercase tracking-wide text-[11px] text-gray-600">{r.req.patient.gender ?? '-'}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top font-medium text-gray-900">{r.req.doctor.name}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top text-[12px] text-indigo-600 font-semibold">{r.req.doctor.specialty}</td>
                    </>
                  )}
                  <td className="px-3 py-2 border border-gray-300 align-top font-medium text-gray-800">{r.m.name}</td>
                  <td className="px-3 py-2 border border-gray-300 align-top text-[12px] text-gray-700">{r.m.dosage || '-'}</td>
                  <td className="px-3 py-2 border border-gray-300 align-top text-center font-semibold">x{r.m.qty}</td>
                  <td className="px-3 py-2 border border-gray-300 align-top text-[12px] text-gray-600">{r.m.instructions || '—'}</td>
                  {r.first && (
                    <>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top text-[11px] text-gray-600 whitespace-nowrap">{new Date(r.req.created).toLocaleString()}</td>
                      <td rowSpan={r.span} className="px-3 py-3 border border-gray-300 align-top actions-col">
                        <div className="action-buttons min-w-[140px]">
                          <button className="text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow">Approve</button>
                          <button className="text-xs font-semibold px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow">Reject</button>
                          <button className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow">Prepare</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[11px] text-gray-500 mt-3 text-center">Showing {requests.length} prescription request{requests.length!==1?'s':''}. Medicines expanded into {rows.length} row{rows.length!==1?'s':''}.</div>
          </div>
        </div>
      )}

      <PharmacyBottomNavigation />
    </div>
  );
};

export default PharmacyRequests;
