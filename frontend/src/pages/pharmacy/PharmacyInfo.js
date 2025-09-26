import React, { useState, useEffect } from 'react';

const PharmacyInfo = () => {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load accepted emergency requests from localStorage
    const key = 'helio_pharmacy_accepted_requests';
    const raw = localStorage.getItem(key);
    if (raw) {
      try { 
  const requests = JSON.parse(raw);
  // Only emergency accepted requests
  const onlyEmergency = requests.filter(r => r.type === 'emergency');
  // Sort by date (newest first)
  const sortedRequests = onlyEmergency.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAcceptedRequests(sortedRequests);
      } catch(_) {
        setAcceptedRequests([]);
      }
    } else {
      setAcceptedRequests([]);
    }
    setLoading(false);

    // Listen for new accepted requests
    const handleAcceptedUpdate = () => {
      const updatedRaw = localStorage.getItem(key);
      if (updatedRaw) {
        try {
          const requests = JSON.parse(updatedRaw);
          const onlyEmergency = requests.filter(r => r.type === 'emergency');
          const sortedRequests = onlyEmergency.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAcceptedRequests(sortedRequests);
        } catch(_) {
          setAcceptedRequests([]);
        }
      }
    };

    window.addEventListener('storage', handleAcceptedUpdate);
    window.addEventListener('accepted_request_updated', handleAcceptedUpdate);
    
    return () => {
      window.removeEventListener('storage', handleAcceptedUpdate);
      window.removeEventListener('accepted_request_updated', handleAcceptedUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12 mb-8 hero-header">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Past Emergency Requests</h1>
          <p className="text-primary-light">View all accepted emergency medicine requests.</p>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading accepted requests...</div>}
      {!loading && acceptedRequests.length === 0 && (
        <div className="text-center py-16 bg-white border rounded-lg shadow-sm">No accepted requests yet.</div>
      )}

      {acceptedRequests.length > 0 && (
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-4">
            {acceptedRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-4 max-w-2xl mx-auto">
                <div className="flex flex-col gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">{req.patientName || 'Emergency Patient'}</span>
                  <span className="text-sm text-gray-500">ID: {req.patientId || 'N/A'}</span>
                  <span className="text-sm text-gray-500">Requested: {new Date(req.date).toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Accepted: {new Date(req.acceptedDate).toLocaleString()}</span>
                  <span className="text-base font-semibold status-green">ACCEPTED</span>
                  <span className="text-sm text-gray-700">Medicines: {(req.medicines || []).map(m=>m.name).join(', ') || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInfo;