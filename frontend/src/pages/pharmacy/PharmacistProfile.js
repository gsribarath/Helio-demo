import React from 'react';

// Simple read-only profile for the pharmacy
export default function PharmacistProfile(){
  // Read cached pharmacy profile if any; otherwise fallback demo values
  const key = 'helio_pharmacy_profile';
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}

  const pharmacy = {
    name: profile.name || 'Helio Community Pharmacy',
    address: profile.address || '12, Health Street, Green Town, 600001',
    mobile: profile.mobile || '+91 98765 43210',
    workingTime: profile.workingTime || 'Mon - Sat, 8:00 AM - 8:00 PM'
  };

  const head = {
    name: profile.mainPharmacist || 'Dr. Priya Sharma, M.Pharm'
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-10 mb-8 text-center px-4 shadow">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Pharmacy Profile</h1>
        <p className="text-indigo-100">Basic details for patients and internal reference</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Pharmacy details card */}
        <div className="rx-card">
          <h3 className="rx-card-title mb-3">Pharmacy Details</h3>
          <div className="space-y-2">
            <div className="rx-card-meta"><span className="font-semibold text-gray-800">Name:</span> {pharmacy.name}</div>
            <div className="rx-card-meta"><span className="font-semibold text-gray-800">Address:</span> {pharmacy.address}</div>
            <div className="rx-card-meta"><span className="font-semibold text-gray-800">Mobile:</span> {pharmacy.mobile}</div>
            <div className="rx-card-meta"><span className="font-semibold text-gray-800">Working Time:</span> {pharmacy.workingTime}</div>
          </div>
        </div>

        {/* Main pharmacist card */}
        <div className="rx-card">
          <h3 className="rx-card-title mb-3">Main Pharmacist</h3>
          <div className="rx-card-meta"><span className="font-semibold text-gray-800">Name:</span> {head.name}</div>
        </div>
      </div>
    </div>
  );
}
