import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  DoctorPatients Page
  - Displays a structured table of patients (dummy data for now)
  - Columns: Patient Name, Patient ID, Info (button)
  - Clicking Info expands an inline full-width row showing detailed patient info in table format
  - Style aims to mirror availability/ scheduling table aesthetics (bordered, subtle zebra, tight spacing)
*/

const dummyPatients = [
  // Keep first row unchanged
  { id: 'P1001', name: 'Gurpreet Singh', age: 32, gender: 'Male', lastVisit: '2025-09-02', bloodGroup: 'B+', conditions: ['Diabetes','Hypertension'], languages: ['English','Hindi','Punjabi'] },

  // Swapped in (was previously in the last 10 group) -> now occupy P1002..P1011 IDs
  { id: 'P1002', name: 'Mohit Verma', age: 38, gender: 'Male', lastVisit: '2025-09-02', bloodGroup: 'B+', conditions: ['Asthma'], languages: ['English','Hindi'] },
  { id: 'P1003', name: 'Jasleen Kaur', age: 27, gender: 'Female', lastVisit: '2025-09-01', bloodGroup: 'A+', conditions: ['Allergy'], languages: ['English','Punjabi'] },
  { id: 'P1004', name: 'Simran Kaur', age: 30, gender: 'Female', lastVisit: '2025-09-14', bloodGroup: 'A+', conditions: ['PCOS'], languages: ['English','Punjabi'] },
  { id: 'P1005', name: 'Amanpreet Kaur', age: 45, gender: 'Female', lastVisit: '2025-09-10', bloodGroup: 'O+', conditions: ['Hypertension'], languages: ['English','Punjabi'] },
  { id: 'P1006', name: 'Harjit Kumar', age: 51, gender: 'Male', lastVisit: '2025-09-12', bloodGroup: 'A+', conditions: ['Diabetes'], languages: ['English','Hindi'] },
  { id: 'P1007', name: 'Sukhdeep Kaur', age: 28, gender: 'Female', lastVisit: '2025-09-15', bloodGroup: 'B-', conditions: ['Migraine'], languages: ['English','Hindi'] },
  { id: 'P1008', name: 'Rohit Sharma', age: 39, gender: 'Male', lastVisit: '2025-08-30', bloodGroup: 'AB+', conditions: ['Allergy'], languages: ['English'] },
  { id: 'P1009', name: 'Priya Nair', age: 34, gender: 'Female', lastVisit: '2025-09-08', bloodGroup: 'O-', conditions: ['Thyroid'], languages: ['English','Hindi'] },
  { id: 'P1010', name: 'Arjun Singh', age: 41, gender: 'Male', lastVisit: '2025-09-01', bloodGroup: 'A-', conditions: ['Asthma'], languages: ['English','Punjabi'] },
  { id: 'P1011', name: 'Neha Verma', age: 29, gender: 'Female', lastVisit: '2025-09-11', bloodGroup: 'B+', conditions: ['Anemia'], languages: ['English','Hindi'] },

  // Swapped out (original first 10 after Gurpreet) -> now in positions P1012..P1020
  { id: 'P1012', name: 'Karan Patel', age: 36, gender: 'Male', lastVisit: '2025-09-05', bloodGroup: 'O+', conditions: ['Allergy'], languages: ['English','Hindi','Gujarati'] },
  { id: 'P1013', name: 'Vikram Singh', age: 48, gender: 'Male', lastVisit: '2025-09-13', bloodGroup: 'B+', conditions: ['Hypertension'], languages: ['English','Punjabi'] },
  { id: 'P1014', name: 'Meena Reddy', age: 37, gender: 'Female', lastVisit: '2025-09-12', bloodGroup: 'O-', conditions: ['Thyroid'], languages: ['English','Hindi','Telugu'] },
  { id: 'P1015', name: 'Farhan Ali', age: 33, gender: 'Male', lastVisit: '2025-09-10', bloodGroup: 'A+', conditions: ['Anxiety'], languages: ['English','Hindi','Urdu'] },
  { id: 'P1016', name: 'Divya Sharma', age: 26, gender: 'Female', lastVisit: '2025-09-09', bloodGroup: 'AB+', conditions: ['Vitamin D Deficiency'], languages: ['English','Hindi'] },
  { id: 'P1017', name: 'Rahul Mehta', age: 44, gender: 'Male', lastVisit: '2025-09-07', bloodGroup: 'O+', conditions: ['Diabetes'], languages: ['English','Hindi'] },
  { id: 'P1018', name: 'Anjali Gupta', age: 31, gender: 'Female', lastVisit: '2025-09-06', bloodGroup: 'B-', conditions: ['PCOS'], languages: ['English','Hindi'] },
  { id: 'P1019', name: 'Sanjay Patel', age: 52, gender: 'Male', lastVisit: '2025-09-05', bloodGroup: 'A-', conditions: ['Arthritis'], languages: ['English','Gujarati'] },
  { id: 'P1020', name: 'Kavya Iyer', age: 29, gender: 'Female', lastVisit: '2025-09-03', bloodGroup: 'O+', conditions: ['Migraine'], languages: ['English','Hindi','Tamil'] },
];

// removed expandable detail constants after simplification

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return dummyPatients;
    const q = query.toLowerCase();
    return dummyPatients.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="container mx-auto px-6 py-8 pb-40">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Patients</h1>

        {/* Search card - match Availability search card sizing */}
        <div className="card-elevated mb-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="patient-search" className="block text-sm font-semibold text-text-primary mb-1">Search patients</label>
              <div className="input-wrapper">
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Search by name or patient id..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="clear search"
                    className="input-clear-btn"
                    onClick={() => setQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table - centered and use table-fixed with colgroup widths */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="inventory-table doctor-table sticky-header w-full table-fixed text-sm">
              <colgroup>
                <col style={{ width: '60%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-text-primary">Patient Name</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">Patient ID</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">INFO</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 align-top break-words" data-label="Patient Name">
                      <div className="font-medium text-text-primary leading-snug text-center">{p.name}</div>
                    </td>
                    <td className="p-3 text-center align-top" data-label="Patient ID">
                      <span className="text-xs text-text-secondary">{p.id}</span>
                    </td>
                    <td className="p-3 text-center align-top" data-label="INFO">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/patient/${p.id}`)}
                        className="book-text font-semibold link-reset"
                        aria-label={`View info for ${p.name}`}
                        title="Info"
                        style={{ color: '#2563eb', background: 'transparent', border: 'none', padding: 0 }}
                      >
                        Info
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-text-secondary">No patients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
