import React, { useState, useEffect } from 'react';

const PharmacyHome = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize storage: move approved emergency requests to archive and show only pending on Home
  const refreshRequests = () => {
    const key = 'helio_pharmacy_requests';
    const acceptedKey = 'helio_pharmacy_accepted_requests';
    const raw = localStorage.getItem(key);
    if (!raw) {
      setRequests([]);
      return;
    }
    try {
      const allRequests = JSON.parse(raw);
      const onlyEmergency = allRequests.filter(r => r.type === 'emergency');

      // Split approved and pending
      const toArchive = onlyEmergency.filter(r => r.status === 'approved');
      const pendingEmergency = onlyEmergency.filter(r => r.status !== 'approved');

      // Persist updated pending back to requests (keep any non-emergency entries untouched)
      const nonEmergency = allRequests.filter(r => r.type !== 'emergency');
      const newAll = [...nonEmergency, ...pendingEmergency];

      // If there are accepted requests, move them into the accepted storage (dedupe by id)
      if (toArchive.length > 0) {
        const existingAccepted = JSON.parse(localStorage.getItem(acceptedKey) || '[]');
        const existingIds = new Set(existingAccepted.map(r => r.id));
        toArchive.forEach(r => {
          if (!existingIds.has(r.id)) {
            if (!r.acceptedDate) r.acceptedDate = new Date().toISOString();
            existingAccepted.push(r);
          }
        });
        localStorage.setItem(acceptedKey, JSON.stringify(existingAccepted));
        localStorage.setItem(key, JSON.stringify(newAll));
        // Notify info page to refresh
        window.dispatchEvent(new CustomEvent('accepted_request_updated'));
      } else {
        // Ensure storage stays cleaned
        localStorage.setItem(key, JSON.stringify(newAll));
      }

      // Show only pending requests on Home, newest first
      setRequests(pendingEmergency.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (_) {
      setRequests([]);
    }
  };

  useEffect(() => {
    refreshRequests();
    setLoading(false);

    const handleChanges = () => refreshRequests();
    window.addEventListener('storage', handleChanges);
    window.addEventListener('emergency_request_updated', handleChanges);
    return () => {
      window.removeEventListener('storage', handleChanges);
      window.removeEventListener('emergency_request_updated', handleChanges);
    };
  }, []);

  const updateStatus = (id, status) => {
    const key = 'helio_pharmacy_requests';
    const allRequests = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (status === 'approved') {
      // Find the request being approved
      const requestToApprove = allRequests.find(r => r.id === id);
      if (requestToApprove) {
        // Mark approved and add accepted date
        requestToApprove.status = 'approved';
        requestToApprove.acceptedDate = new Date().toISOString();
        
        // Move to accepted requests storage
        const acceptedKey = 'helio_pharmacy_accepted_requests';
        const existingAccepted = JSON.parse(localStorage.getItem(acceptedKey) || '[]');
        existingAccepted.push(requestToApprove);
        localStorage.setItem(acceptedKey, JSON.stringify(existingAccepted));
        
        // Remove from pending requests
        const remainingRequests = allRequests.filter(r => r.id !== id);
        localStorage.setItem(key, JSON.stringify(remainingRequests));
        
        // Update the emergency requests displayed (only pending ones)
        const emergencyRequests = remainingRequests
          .filter(req => req.type === 'emergency' && req.status !== 'approved')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRequests(emergencyRequests);
        
        // Dispatch event for accepted requests page
        window.dispatchEvent(new CustomEvent('accepted_request_updated'));
      }
    } else {
      // For other status updates (if any)
      const updatedAllRequests = allRequests.map(r => r.id === id ? { ...r, status } : r);
      localStorage.setItem(key, JSON.stringify(updatedAllRequests));
      
      // Update the emergency requests displayed
      const emergencyRequests = updatedAllRequests
        .filter(req => req.type === 'emergency')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setRequests(emergencyRequests);
    }
  };

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    preparing: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12 mb-8 hero-header">
        <div className="top-right-actions">
          <a href="/pharmacy/info" className="info-icon-btn" aria-label="Info">
            i
          </a>
        </div>
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
