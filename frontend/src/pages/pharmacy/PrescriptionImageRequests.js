import React, { useEffect, useState } from 'react';
import PharmacyBottomNavigation from '../../components/PharmacyBottomNavigation';
import { prescriptionRequestAPI } from '../../services/api';
import { FaUserInjured, FaClock, FaImage, FaCheck, FaEye } from 'react-icons/fa';

const PrescriptionImageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed modal state - now using window.open instead

  useEffect(() => {
    loadRequests();
  }, []);

  const toAbsoluteUrl = (url) => {
    if (!url) return url;
    // If already absolute
    if (/^https?:\/\//i.test(url)) return url;
    // Prefix backend origin
    const backend = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/,'');
    return `${backend}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const loadRequests = async () => {
    try {
      // Try API first, fallback to localStorage for demo
      let pendingRequests = [];
      
      let apiRequests = [];
      try {
        const response = await prescriptionRequestAPI.getAll();
        apiRequests = (response.data || []).filter(req => req.status === 'pending');
      } catch (apiError) {
        console.log('API not available, will rely on localStorage');
      }

      // Also read localStorage to capture demo-created requests
      const key = 'helio_prescription_requests';
      const raw = localStorage.getItem(key);
      const localRequests = raw ? (JSON.parse(raw) || []).filter(req => req.status === 'pending') : [];

      // Merge by id, prefer API items when duplicate
      const map = new Map();
      [...localRequests, ...apiRequests].forEach((r) => {
        map.set(r.id, r);
      });
      pendingRequests = Array.from(map.values());

      // Normalize image URLs to absolute for rendering
      // Normalize image url and patient identifiers
      const patientIdNameOverrides = {
        'P001': 'Gurpreet Singh',
        'p001': 'Gurpreet Singh'
      };
      pendingRequests = pendingRequests.map(r => {
        const idRaw = r.patientId ?? r.id;
        let formattedId = idRaw;
        // If numeric like 1 -> P001, 25 -> P025
        if (typeof idRaw === 'number' || (/^\d+$/.test(String(idRaw)))) {
          const n = Number(idRaw);
          formattedId = `P${String(n).padStart(3, '0')}`;
        } else if (typeof idRaw === 'string' && !/^P\d{3,}$/i.test(idRaw)) {
          // Try to extract trailing number
          const m = String(idRaw).match(/(\d+)$/);
          if (m) {
            formattedId = `P${String(Number(m[1])).padStart(3, '0')}`;
          } else {
            formattedId = idRaw; // leave as-is
          }
        }
        // If this is our demo patient P001 force the display name
        const forcedName = patientIdNameOverrides[formattedId];
        return {
          ...r,
          patientName: forcedName || r.patientName || 'Patient',
          patientId: formattedId,
          prescriptionImageUrl: toAbsoluteUrl(r.prescriptionImageUrl)
        };
      });
      
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading prescription requests:', error);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // Try API first, fallback to localStorage for demo
      try {
        await prescriptionRequestAPI.updateStatus(requestId, newStatus, 'Pharmacist');
      } catch (apiError) {
        console.log('API not available, using localStorage fallback');
        // Fallback to localStorage for demo mode
        const key = 'helio_prescription_requests';
        const raw = localStorage.getItem(key);
        if (raw) {
          const allRequests = JSON.parse(raw) || [];
          const updatedRequests = allRequests.map(req => {
            if (req.id === requestId) {
              return {
                ...req,
                status: newStatus,
                processedAt: new Date().toISOString(),
                processedBy: 'Pharmacist'
              };
            }
            return req;
          });
          
          localStorage.setItem(key, JSON.stringify(updatedRequests));
        }
      }

      // Update the patient's last request status so they see the change
      const lastRequestStr = localStorage.getItem('helio_last_prescription_request');
      if (lastRequestStr) {
        const lastRequest = JSON.parse(lastRequestStr);
        if (lastRequest.id === requestId) {
          lastRequest.status = newStatus;
          lastRequest.processedAt = new Date().toISOString();
          lastRequest.processedBy = 'Pharmacist';
          localStorage.setItem('helio_last_prescription_request', JSON.stringify(lastRequest));
        }
      }
      
      // Update the local state immediately to show the change
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, processedAt: new Date().toISOString(), processedBy: 'Pharmacist' }
            : req
        )
      );
      
      // Also update patient's last request cache for immediate UI reflection
      try {
        const lastStr = localStorage.getItem('helio_last_prescription_request');
        if (lastStr) {
          const last = JSON.parse(lastStr);
          if (last.id === requestId) {
            last.status = newStatus;
            last.processedAt = new Date().toISOString();
            localStorage.setItem('helio_last_prescription_request', JSON.stringify(last));
          }
        }
      } catch {}
      const action = newStatus === 'approved' ? 'approved' : 'rejected';
      alert(`Prescription request has been ${action} successfully! Patient will be notified.`);
    } catch (error) {
      console.error('Error updating prescription request:', error);
      alert('Failed to update prescription request status');
    }
  };

  // Removed modal functions - now using direct window.open

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-10 mb-8 text-center px-4 shadow">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Prescription Image Requests</h1>
        <p className="text-green-100 max-w-3xl mx-auto text-sm">
          Review prescription images uploaded by patients and approve or reject medicine requests.
        </p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">
          Loading prescription image requests...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="text-center py-20 bg-white border rounded-xl shadow-sm mx-4 max-w-2xl mx-auto">
          <FaImage className="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Prescription Requests</h3>
          <p className="text-gray-500">No pending prescription image requests at the moment.</p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="px-4 max-w-7xl mx-auto">
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request.id} className="rx-card overflow-hidden">
                <div className="p-2 sm:p-2">
                  {/* Patient Info Header */}
                  <div className="rx-card-header">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <FaUserInjured className="text-green-600 text-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="rx-card-title">{request.patientName}</h3>
                        <p className="rx-card-meta">Patient ID: {request.patientId || 'N/A'}</p>
                        <p className="rx-card-meta flex items-center gap-1 mt-1">
                          <FaClock className="text-xs" />
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Image */}
                  <div className="grid gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaImage className="text-blue-500" />
                        Prescription Image
                      </h4>
                      {request.prescriptionImageUrl ? (
                        <div className="rx-image-box">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                            <FaImage className="text-blue-600 text-xl" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-3 text-center">Prescription Available</p>
                          <button
                             onClick={() => window.open(request.prescriptionImageUrl, '_blank')}
                             className="btn btn-blue text-sm"
                           >
                            <FaEye />
                            View Image
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
                          <p className="text-gray-500">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approve button centered at bottom */}
                  <div className="rx-card-footer">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        disabled={request.status !== 'pending'}
                        className={`btn ${request.status !== 'pending' ? 'btn-blue' : 'btn-blue'}`}
                        style={{ opacity: request.status !== 'pending' ? 0.6 : 1 }}
                      >
                        <FaCheck />
                        {request.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal removed - images now open in new browser window/tab */}

      <PharmacyBottomNavigation />
    </div>
  );
};

export default PrescriptionImageRequests;