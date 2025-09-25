import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Common medicines database
const MEDICINE_DATABASE = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief' },
  { id: 2, name: 'Ibuprofen 400mg', category: 'Pain Relief' },
  { id: 3, name: 'Aspirin 75mg', category: 'Pain Relief' },
  { id: 4, name: 'Amoxicillin 500mg', category: 'Antibiotics' },
  { id: 5, name: 'Azithromycin 250mg', category: 'Antibiotics' },
  { id: 6, name: 'Cephalexin 500mg', category: 'Antibiotics' },
  { id: 7, name: 'Omeprazole 20mg', category: 'Gastric' },
  { id: 8, name: 'Pantoprazole 40mg', category: 'Gastric' },
  { id: 9, name: 'Metformin 500mg', category: 'Diabetes' },
  { id: 10, name: 'Insulin Pen', category: 'Diabetes' },
  { id: 11, name: 'Atorvastatin 20mg', category: 'Heart' },
  { id: 12, name: 'Amlodipine 5mg', category: 'Heart' },
  { id: 13, name: 'Lisinopril 10mg', category: 'Heart' },
  { id: 14, name: 'Salbutamol Inhaler', category: 'Respiratory' },
  { id: 15, name: 'Prednisolone 5mg', category: 'Anti-inflammatory' },
  { id: 16, name: 'Cetirizine 10mg', category: 'Antihistamines' },
  { id: 17, name: 'Loratadine 10mg', category: 'Antihistamines' },
  { id: 18, name: 'Vitamin D3 60000 IU', category: 'Vitamins' },
  { id: 19, name: 'Vitamin B12 1500mcg', category: 'Vitamins' },
  { id: 20, name: 'Cough Syrup', category: 'Respiratory' },
  { id: 21, name: 'Diclofenac 50mg', category: 'Pain Relief' },
  { id: 22, name: 'Tramadol 50mg', category: 'Pain Relief' },
  { id: 23, name: 'Norfloxacin 400mg', category: 'Antibiotics' },
  { id: 24, name: 'Ranitidine 150mg', category: 'Gastric' },
  { id: 25, name: 'Furosemide 40mg', category: 'Diuretic' },
  { id: 26, name: 'Nitroglycerin Tablet', category: 'Emergency Cardiac' },
  { id: 27, name: 'Epinephrine Auto-Injector', category: 'Emergency Allergy' },
  { id: 28, name: 'Glucose Tablets', category: 'Emergency Diabetes' },
  { id: 29, name: 'Aspirin 325mg (Chewable)', category: 'Emergency Cardiac' },
  { id: 30, name: 'Bronchodilator Inhaler', category: 'Emergency Respiratory' },
  { id: 31, name: 'Antihistamine Injection', category: 'Emergency Allergy' },
  { id: 32, name: 'Pain Relief Injection', category: 'Emergency Pain' },
  { id: 33, name: 'Anti-nausea tablets', category: 'Emergency Gastric' },
  { id: 34, name: 'Hydrocortisone Cream', category: 'Emergency Skin' },
  { id: 35, name: 'Burn Relief Gel', category: 'Emergency Skin' }
];

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  // New: list of medicines added to the request (with quantities)
  const [items, setItems] = useState([]);
  const [recentRequest, setRecentRequest] = useState(null);

  // Filter medicines based on search query
  const filteredMedicines = MEDICINE_DATABASE.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10); // Limit to 10 results

  // Load most recent emergency request for this patient
  useEffect(() => {
    try {
      const key = 'helio_pharmacy_requests';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const list = existing
        .filter(r => r.type === 'emergency')
        .filter(r => !user?.id || r.patientId === user.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentRequest(list[0] || null);
    } catch (_) {
      setRecentRequest(null);
    }
  }, [user?.id]);

  // No dropdown handlers needed now; we show a table below with search filtering

  const handleMedicineSelect = (medicine) => {
    // Add to items (increment qty if already present)
    setItems(prev => {
      const idx = prev.findIndex(i => i.name === medicine.name);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + 1 };
        return next;
      }
      return [...prev, { name: medicine.name, category: medicine.category, qty: 1 }];
    });
    // Clear search to show full table after add
    setSearchQuery('');
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setItems(prev => prev.map((item, i) => i === index ? { ...item, qty: newQty } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Please select at least one medicine from the list');
      return;
    }

    // Confirmation dialog for emergency request
    const confirmed = window.confirm(
      `Are you sure you want to submit an EMERGENCY request for ${items.length} medicine(s)?\n\nThis will be marked as high priority and sent immediately to the pharmacy.`
    );
    
    if (!confirmed) {
      return;
    }

    setLoading(true);
    
    try {
      // Create emergency request with current timestamp
      const now = new Date();
      const emergencyRequest = {
        id: `R-${Date.now()}`,
        patientId: user?.id || `P-${Date.now()}`,
        patientName: user?.name || 'Emergency Patient',
        medicines: items.map(m => ({ name: m.name, qty: m.qty || 1, category: m.category })),
        date: now.toISOString(),
        status: 'pending',
        type: 'emergency'
      };

      // Store in localStorage for pharmacy to see
      const key = 'helio_pharmacy_requests';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [emergencyRequest, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));

      // Dispatch custom event to notify pharmacy page
      window.dispatchEvent(new CustomEvent('emergency_request_updated'));

      alert(`Emergency request submitted successfully!\nRequest ID: ${emergencyRequest.id}\nYour request will be processed immediately.`);
      // Update recent card and clear current selections
      setRecentRequest(emergencyRequest);
      setItems([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      alert('Failed to submit emergency request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 mb-8 text-center px-4 shadow">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Emergency Medicine Request</h1>
        <p className="text-red-100 text-sm md:text-base max-w-2xl mx-auto">
          Submit your emergency medicine request. This will be prioritized for immediate pharmacy attention.
        </p>
      </header>

      <main className="px-3 sm:px-4 max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          {/* Emergency notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="ml-0">
                <h3 className="text-sm font-medium text-red-800">
                  Emergency Request
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This request will be marked as EMERGENCY and prioritized by the pharmacy team.</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tablet/Medicine Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search and select medicine from list..."
                  className={`w-full px-4 py-3 border rounded-none focus:ring-2 focus:ring-red-500 transition-colors border-gray-400 focus:border-red-500`}
                  disabled={loading}
                />
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Tap a result to add it. You can add multiple medicines; duplicates increase quantity.
              </p>
              {/* Inventory table reused style: simple text-only table filtered by search */}
              <div className="mt-4 bg-white border-2 border-gray-500 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse border border-gray-500">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-500">Name</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-500">Category</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-gray-500 border border-gray-400">No medicines found</td>
                        </tr>
                      ) : (
                        filteredMedicines.map((medicine) => {
                          const already = items.find(i => i.name === medicine.name);
                          return (
                            <tr key={medicine.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-900 border border-gray-400">{medicine.name}</td>
                              <td className="px-4 py-2 text-gray-600 border border-gray-400">{medicine.category}</td>
                              <td className="px-4 py-2 border border-gray-400">
                                <button
                                  type="button"
                                  onClick={() => handleMedicineSelect(medicine)}
                                  className={`text-sm px-3 py-1 rounded border transition-colors ${already ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}
                                  title={already ? 'Added (click to add again)' : 'Add to request'}
                                >
                                  {already ? 'Add again' : 'Add'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Selected medicines list at bottom */}
            {items.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Selected Medicines</h3>
                <ul className="divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <li key={`${item.name}-${idx}`} className="py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        {item.category && (
                          <div className="text-xs text-gray-500 mt-1">({item.category})</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(idx, (item.qty || 1) - 1)}
                            disabled={item.qty <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium text-gray-800 min-w-[2ch] text-center">{item.qty || 1}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(idx, (item.qty || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                          >
                            +
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-600 text-sm hover:underline ml-2">Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/my-medicines')}
                disabled={loading}
                className="btn btn-outline-blue"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className={`emergency-btn px-8 py-3 text-sm font-semibold ${
                  items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Emergency Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Patient Info Display */}
        {user && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Request will be submitted for:</h3>
            <p className="text-blue-800 text-sm">
              <strong>Patient Name:</strong> {user.name}<br/>
              <strong>Patient ID:</strong> {user.id || 'P-000'}
            </p>
          </div>
        )}

        {/* Recently requested card (mobile responsive) */}
        {recentRequest && (
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Last Emergency Request</h4>
                  <p className="text-xs text-gray-500">{new Date(recentRequest.date).toLocaleString()}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full border border-red-500 text-red-600 bg-red-50 self-start sm:self-auto">EMERGENCY</span>
              </div>
              <div className="mt-3 text-sm text-gray-800">
                <div><strong>Patient:</strong> {recentRequest.patientName} ({recentRequest.patientId})</div>
                <div className="mt-2">
                  <strong>Medicines:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {(recentRequest.medicines || []).map((m, i) => (
                      <li key={i}>{m.name}{m.qty ? ` (x${m.qty})` : ''}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmergencyRequest;