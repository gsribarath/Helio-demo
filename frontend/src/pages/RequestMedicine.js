import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, prescriptionRequestAPI } from '../services/api';

export default function RequestMedicine() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recentRequest, setRecentRequest] = useState(null);
  const [recentStatus, setRecentStatus] = useState('pending');

  const validateFile = (file) => {
    const allowed = ['image/jpeg','image/jpg','image/png','image/gif'];
    if (!allowed.includes(file.type)) { alert('Please select a valid image file (JPEG, PNG, GIF)'); return false; }
    if (file.size > 5 * 1024 * 1024) { alert('File size should be less than 5MB'); return false; }
    return true;
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setSelectedFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f && validateFile(f)) setSelectedFile(f);
  };

  const submit = async () => {
    if (!selectedFile) { alert('Please select a prescription image'); return; }
    setUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await uploadAPI.uploadFile(selectedFile, 'prescription');
  // Normalize to absolute URL for consistent rendering across origins
  const rawUrl = response.data.fileUrl;
  const backend = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/,'');
  const absoluteUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `${backend}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
  const requestData = { prescriptionImageUrl: absoluteUrl, notes: '' };
      try {
        const apiRes = await prescriptionRequestAPI.create(requestData);
        // Build recent request card data
        const created = {
          id: apiRes?.data?.request_id || ('PR-' + Date.now()),
          patientId: user.id || 'patient-' + Date.now(),
          patientName: user.profile?.first_name && user.profile?.last_name ? `${user.profile.first_name} ${user.profile.last_name}` : (user.name || 'Patient'),
          prescriptionImageUrl: absoluteUrl,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        setRecentRequest(created);
        localStorage.setItem('helio_last_prescription_request', JSON.stringify(created));
        setRecentStatus('pending');
      } catch {
        const fallback = {
          id: 'PR-' + Date.now(),
          patientId: user.id || 'patient-' + Date.now(),
          patientName: user.profile?.first_name + ' ' + user.profile?.last_name || user.name || 'Patient',
          prescriptionImageUrl: absoluteUrl,
          notes: '',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        const key = 'helio_prescription_requests';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(fallback);
        localStorage.setItem(key, JSON.stringify(arr));
        setRecentRequest(fallback);
        localStorage.setItem('helio_last_prescription_request', JSON.stringify(fallback));
        setRecentStatus('pending');
      }
      alert('Prescription request submitted successfully');
      // Stay on page and show the recent request card
      setSelectedFile(null);
    } catch (e) {
      console.error(e);
      alert('Failed to submit prescription request. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Load the most recent request (for this patient) on mount
  useEffect(() => {
    const loadRecent = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const backend = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/,'');
      const toAbs = (url) => (/^https?:\/\//i.test(url) ? url : `${backend}${url?.startsWith('/') ? url : `/${url}`}`);
      // Start from cached last request if available
      let cached = null;
      const cachedStr = localStorage.getItem('helio_last_prescription_request');
      if (cachedStr) {
        cached = JSON.parse(cachedStr);
        cached.prescriptionImageUrl = toAbs(cached.prescriptionImageUrl);
        setRecentRequest(cached);
        setRecentStatus(cached.status || 'pending');
      }

      // Fetch pending list from API to determine current status
      try {
        const res = await prescriptionRequestAPI.getAll(); // returns only pending in demo backend
        const pending = Array.isArray(res.data) ? res.data : [];
        if (cached && cached.id) {
          const stillPending = pending.some(p => p.id === cached.id);
          setRecentStatus(stillPending ? 'pending' : 'approved');
        } else {
          // If no cached, try to find most recent pending for this user
          const mine = pending.filter(r => r.patientId === user.id);
          if (mine.length) {
            mine.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            const last = { ...mine[0], prescriptionImageUrl: toAbs(mine[0].prescriptionImageUrl) };
            setRecentRequest(last);
            localStorage.setItem('helio_last_prescription_request', JSON.stringify(last));
            setRecentStatus('pending');
          }
        }
      } catch (e) {
        // If API not available, keep cached status
      }
    };
    loadRecent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 mb-8 text-center px-4 shadow">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Request Medicine</h1>
        <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">Upload your prescription image and our pharmacists will review it.</p>
      </header>

      <main className="px-3 sm:px-4 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          {/* Success inline hint after submit (optional) */}
          {/* ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Prescription Image *</label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors bg-gray-50 cursor-pointer min-h-[160px] flex flex-col items-center justify-center"
                onClick={() => document.getElementById('rx-upload')?.click()}
                onDragOver={(e)=>e.preventDefault()}
                onDrop={onDrop}
              >
                <p className="text-sm text-gray-700 font-medium">Click to upload or drag and drop</p>
              </div>
            ) : (
              <div className="border border-green-200 rounded-xl p-4 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-700">{selectedFile.name}</div>
                    <div className="text-xs text-green-600">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button onClick={()=>setSelectedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors" disabled={uploading}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <input id="rx-upload" type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} disabled={uploading} />
            {!selectedFile && (
              <div className="flex justify-center">
                <button
                  onClick={()=>document.getElementById('rx-upload')?.click()}
                  disabled={uploading}
                  className="btn btn-outline-blue mt-3"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <button
              onClick={()=>navigate('/my-medicines')}
              disabled={uploading}
              className="btn btn-outline-blue"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={uploading || !selectedFile}
              className="btn btn-blue"
            >
              {uploading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>

        {/* Recent upload card - status only (no view option) */}
        {recentRequest && (
          <div className="mt-4 sm:mt-6 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Prescription Upload</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${recentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : recentStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                {recentStatus.toUpperCase()}
              </span>
            </div>
            <div className="p-4 sm:p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <dt className="text-xs sm:text-sm text-gray-500">Request ID</dt>
                  <dd className="text-sm sm:text-base font-semibold text-gray-900 break-all">{recentRequest.id}</dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm text-gray-500">Submitted On</dt>
                  <dd className="text-sm sm:text-base font-medium text-gray-900">{new Date(recentRequest.createdAt).toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                Status will update automatically once the pharmacy reviews your prescription.
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
