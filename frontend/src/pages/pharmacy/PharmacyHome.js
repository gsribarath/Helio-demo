import React, { useState, useEffect } from 'react';

const PharmacyHome = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load only emergency requests from localStorage
    const key = 'helio_pharmacy_requests';
    const raw = localStorage.getItem(key);
    if (raw) {
      try { 
        const allRequests = JSON.parse(raw);
        
        // Remove demo data (requests without type='emergency')
        const cleanedRequests = allRequests.filter(req => req.type === 'emergency');
        if (cleanedRequests.length !== allRequests.length) {
          localStorage.setItem(key, JSON.stringify(cleanedRequests));
        }
        
        // Filter to only show emergency requests and sort by date (newest first)
        const emergencyRequests = cleanedRequests
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRequests(emergencyRequests);
      } catch(_) {
        setRequests([]);
      }
    } else {
      setRequests([]);
    }
    setLoading(false);

    // Listen for new emergency requests
    const handleStorageChange = () => {
      const updatedRaw = localStorage.getItem(key);
      if (updatedRaw) {
        try {
          const allRequests = JSON.parse(updatedRaw);
          const emergencyRequests = allRequests
            .filter(req => req.type === 'emergency')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setRequests(emergencyRequests);
        } catch(_) {
          setRequests([]);
        }
      }
    };

    const handleEmergencyUpdate = () => {
      handleStorageChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emergency_request_updated', handleEmergencyUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('emergency_request_updated', handleEmergencyUpdate);
    };
  }, []);

  const updateStatus = (id, status) => {
    const key = 'helio_pharmacy_requests';
    const allRequests = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedAllRequests = allRequests.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(key, JSON.stringify(updatedAllRequests));
    
    // Update the emergency requests displayed
    const emergencyRequests = updatedAllRequests
      .filter(req => req.type === 'emergency')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setRequests(emergencyRequests);
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
          <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome to Helio</h1>
          <p className="text-primary-light">Manage and track emergency medicine requests in real-time.</p>
          <p className="text-primary-light mt-1">Emergency requests are prioritized for immediate attention.</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading requests...</div>}
      {!loading && requests.length === 0 && (
        <div className="text-center py-16 bg-white border rounded-lg shadow-sm">No emergency requests yet.</div>
      )}

      {requests.length > 0 && (
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-4 max-w-2xl mx-auto">
                <div className="flex flex-col gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">{req.patientName || 'Emergency Patient'}</span>
                  <span className="text-sm text-gray-500">ID: {req.patientId || 'N/A'}</span>
                  <span className="text-sm text-gray-500">{new Date(req.date).toLocaleString()}</span>
                  <span className={`text-base font-semibold ${req.status === 'approved' ? 'status-green' : 'status-blue'}`}>{req.status === 'approved' ? 'ACCEPTED' : 'PENDING'}</span>
                  <span className="text-sm text-gray-700">Medicines: {(req.medicines || []).map(m=>m.name).join(', ') || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => updateStatus(req.id, 'approved')}
                    className="flex-1 btn btn-green btn-block rounded-xl text-base"
                    disabled={req.status === 'approved'}
                    aria-label="Accept request"
                  >
                    {req.status === 'approved' ? 'Accepted' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyHome;
