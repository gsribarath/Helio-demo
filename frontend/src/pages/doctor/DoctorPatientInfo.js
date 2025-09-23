import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

/*
  DoctorPatientInfo
  - Shows a professional, structured view of a patient's health history for doctors.
  - Data Strategy: For now uses either navigation state (appointment/patient data) or mock fallback.
  - Sections (simplified, no icons): Patient Overview, Active Conditions, Medications, Allergies, Vitals, Labs, Visit History, Doctor Notes.
*/

const mockPatientProfiles = {
  a1: {
    id: 'a1',
    name: 'Gurpreet Singh',
    age: 32,
    gender: 'Male',
    languages: ['English', 'Hindi', 'Punjabi'],
    bloodGroup: 'B+',
    lastVisit: '2025-09-02',
    chronicConditions: ['Type 2 Diabetes (2019)', 'Hypertension (2022)'],
    medications: [
      { name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2023-04' },
      { name: 'Lisinopril', dose: '10 mg', freq: 'once daily', since: '2024-01' }
    ],
    allergies: ['Penicillin (rash)', 'Peanuts (anaphylaxis)'],
    vitals: [
      { date: '2025-09-15', bp: '122/78', hr: 76, glucose: '124 mg/dL (fasting)', weight: '79 kg' },
      { date: '2025-08-30', bp: '128/82', hr: 80, glucose: '132 mg/dL (fasting)', weight: '79.5 kg' },
    ],
    labs: [
      { date: '2025-08-10', test: 'HbA1c', value: '6.7%', ref: '< 7.0%' },
      { date: '2025-07-12', test: 'Lipid Panel - LDL', value: '98 mg/dL', ref: '< 100 mg/dL' },
    ],
    visits: [
      { date: '2025-09-15', type: 'Video', reason: 'Fever & cough', notes: 'No dyspnea. Advise hydration + paracetamol.' },
      { date: '2025-08-30', type: 'Clinic', reason: 'Diabetes follow-up', notes: 'Slight improvement; maintain regimen.' },
      { date: '2025-07-22', type: 'Audio', reason: 'Blood pressure check', notes: 'BP stable. Encouraged exercise.' },
    ],
    doctorNotes: 'Patient adherent to medication. Monitor fasting glucose monthly. Encourage continued lifestyle modification.'
  },
  P1001: {
    id: 'P1001', name: 'Gurpreet Singh', age: 32, gender: 'Male', languages: ['English','Hindi','Punjabi'], bloodGroup: 'B+', lastVisit: '2025-09-02',
    chronicConditions: ['Type 2 Diabetes (2019)', 'Hypertension (2022)'],
    medications: [
      { name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2023-04' },
      { name: 'Lisinopril', dose: '10 mg', freq: 'once daily', since: '2024-01' }
    ],
    allergies: ['Penicillin (rash)', 'Peanuts (anaphylaxis)'],
    vitals: [
      { date: '2025-09-15', bp: '122/78', hr: 76, glucose: '124 mg/dL (fasting)', weight: '79 kg' },
      { date: '2025-08-30', bp: '128/82', hr: 80, glucose: '132 mg/dL (fasting)', weight: '79.5 kg' },
    ],
    labs: [
      { date: '2025-08-10', test: 'HbA1c', value: '6.7%', ref: '< 7.0%' },
      { date: '2025-07-12', test: 'Lipid Panel - LDL', value: '98 mg/dL', ref: '< 100 mg/dL' },
    ],
    visits: [
      { date: '2025-09-15', type: 'Video', reason: 'Fever & cough', notes: 'No dyspnea. Advise hydration + paracetamol.' },
      { date: '2025-08-30', type: 'Clinic', reason: 'Diabetes follow-up', notes: 'Slight improvement; maintain regimen.' },
      { date: '2025-07-22', type: 'Audio', reason: 'Blood pressure check', notes: 'BP stable. Encouraged exercise.' },
    ],
    doctorNotes: 'Patient adherent to medication. Monitor fasting glucose monthly. Encourage continued lifestyle modification.'
  },
  P1002: {
    id: 'P1002', name: 'Amanpreet Kaur', age: 45, gender: 'Female', languages: ['English','Punjabi'], bloodGroup: 'O+', lastVisit: '2025-09-10',
    chronicConditions: ['Hypertension (2021)'], medications: [{ name: 'Amlodipine', dose: '5 mg', freq: 'once daily', since: '2024-02' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Monitor BP weekly.'
  },
  P1003: {
    id: 'P1003', name: 'Harjit Kumar', age: 51, gender: 'Male', languages: ['English','Hindi'], bloodGroup: 'A+', lastVisit: '2025-09-12',
    chronicConditions: ['Diabetes (2020)'], medications: [{ name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2023-04' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Encourage exercise.'
  },
  P1004: {
    id: 'P1004', name: 'Sukhdeep Kaur', age: 28, gender: 'Female', languages: ['English','Hindi'], bloodGroup: 'B-', lastVisit: '2025-09-15',
    chronicConditions: ['Migraine'], medications: [{ name: 'Sumatriptan', dose: '50 mg', freq: 'PRN', since: '2025-05' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Track triggers.'
  },
  P1005: {
    id: 'P1005', name: 'Rohit Sharma', age: 39, gender: 'Male', languages: ['English'], bloodGroup: 'AB+', lastVisit: '2025-08-30',
    chronicConditions: ['Allergic rhinitis'], medications: [{ name: 'Cetirizine', dose: '10 mg', freq: 'once daily', since: '2025-03' }],
    allergies: ['Dust'], vitals: [], labs: [], visits: [], doctorNotes: 'Allergy avoidance education.'
  },
  P1006: {
    id: 'P1006', name: 'Priya Nair', age: 34, gender: 'Female', languages: ['English','Hindi'], bloodGroup: 'O-', lastVisit: '2025-09-08',
    chronicConditions: ['Hypothyroidism'], medications: [{ name: 'Levothyroxine', dose: '75 mcg', freq: 'once daily', since: '2024-11' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Repeat TSH in 6 weeks.'
  },
  P1007: {
    id: 'P1007', name: 'Arjun Singh', age: 41, gender: 'Male', languages: ['English','Punjabi'], bloodGroup: 'A-', lastVisit: '2025-09-01',
    chronicConditions: ['Asthma (childhood)'], medications: [{ name: 'Salbutamol inhaler', dose: '2 puffs', freq: 'PRN', since: '2023-09' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Inhaler technique reviewed.'
  },
  P1008: {
    id: 'P1008', name: 'Neha Verma', age: 29, gender: 'Female', languages: ['English','Hindi'], bloodGroup: 'B+', lastVisit: '2025-09-11',
    chronicConditions: ['Iron deficiency anemia'], medications: [{ name: 'Ferrous sulfate', dose: '325 mg', freq: 'once daily', since: '2025-06' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Dietary counseling given.'
  },
  P1009: {
    id: 'P1009', name: 'Karan Patel', age: 36, gender: 'Male', languages: ['English','Hindi','Gujarati'], bloodGroup: 'O+', lastVisit: '2025-09-05',
    chronicConditions: ['Allergy'], medications: [{ name: 'Loratadine', dose: '10 mg', freq: 'once daily', since: '2025-04' }],
    allergies: ['Pollen'], vitals: [], labs: [], visits: [], doctorNotes: 'Consider immunotherapy.'
  },
  P1010: {
    id: 'P1010', name: 'Simran Kaur', age: 30, gender: 'Female', languages: ['English','Punjabi'], bloodGroup: 'A+', lastVisit: '2025-09-14',
    chronicConditions: ['PCOS'], medications: [{ name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2025-02' }],
    allergies: [], vitals: [], labs: [], visits: [], doctorNotes: 'Lifestyle modification emphasized.'
  },
  P1011: {
    id: 'P1011', name: 'Vikram Singh', age: 48, gender: 'Male', languages: ['English','Punjabi'], bloodGroup: 'B+', lastVisit: '2025-09-13',
    chronicConditions: ['Hypertension (2020)'], medications: [{ name: 'Amlodipine', dose: '5 mg', freq: 'once daily', since: '2024-02' }],
    allergies: [], vitals: [ { date: '2025-09-13', bp: '130/84', hr: 74, glucose: '—', weight: '82 kg' } ],
    labs: [{ date: '2025-08-20', test: 'Lipid Panel - LDL', value: '104 mg/dL', ref: '< 100 mg/dL' }],
    visits: [{ date: '2025-09-13', type: 'Clinic', reason: 'BP follow-up', notes: 'Slight elevation; reinforce salt restriction.' }],
    doctorNotes: 'Consider uptitration if BP persists >130/80.'
  },
  P1012: {
    id: 'P1012', name: 'Meena Reddy', age: 37, gender: 'Female', languages: ['English','Hindi','Telugu'], bloodGroup: 'O-', lastVisit: '2025-09-12',
    chronicConditions: ['Hypothyroidism (2018)'], medications: [{ name: 'Levothyroxine', dose: '75 mcg', freq: 'once daily', since: '2023-11' }],
    allergies: [], vitals: [{ date: '2025-09-12', bp: '118/76', hr: 72, glucose: '—', weight: '65 kg' }],
    labs: [{ date: '2025-09-01', test: 'TSH', value: '2.4 mIU/L', ref: '0.4 - 4.0 mIU/L' }],
    visits: [{ date: '2025-09-12', type: 'Video', reason: 'Thyroid review', notes: 'Stable; continue same dose.' }],
    doctorNotes: 'Repeat TSH in 6 months.'
  },
  P1013: {
    id: 'P1013', name: 'Farhan Ali', age: 33, gender: 'Male', languages: ['English','Hindi','Urdu'], bloodGroup: 'A+', lastVisit: '2025-09-10',
    chronicConditions: ['Generalized Anxiety Disorder (2022)'], medications: [{ name: 'Sertraline', dose: '50 mg', freq: 'once daily', since: '2025-03' }],
    allergies: [], vitals: [{ date: '2025-09-10', bp: '116/72', hr: 70, glucose: '—', weight: '73 kg' }],
    labs: [],
    visits: [{ date: '2025-09-10', type: 'Audio', reason: 'Medication follow-up', notes: 'Reports improved mood and sleep.' }],
    doctorNotes: 'Continue current regimen; CBT referral pending.'
  },
  P1014: {
    id: 'P1014', name: 'Divya Sharma', age: 26, gender: 'Female', languages: ['English','Hindi'], bloodGroup: 'AB+', lastVisit: '2025-09-09',
    chronicConditions: ['Vitamin D Deficiency (2025)'], medications: [{ name: 'Cholecalciferol', dose: '60,000 IU', freq: 'weekly', since: '2025-08' }],
    allergies: [], vitals: [{ date: '2025-09-09', bp: '110/70', hr: 68, glucose: '—', weight: '58 kg' }],
    labs: [{ date: '2025-08-15', test: 'Vitamin D', value: '18 ng/mL', ref: '30 - 50 ng/mL' }],
    visits: [{ date: '2025-09-09', type: 'Clinic', reason: 'Deficiency follow-up', notes: 'Energy improved slightly.' }],
    doctorNotes: 'Recheck level after supplementation cycle.'
  },
  P1015: {
    id: 'P1015', name: 'Rahul Mehta', age: 44, gender: 'Male', languages: ['English','Hindi'], bloodGroup: 'O+', lastVisit: '2025-09-07',
    chronicConditions: ['Type 2 Diabetes (2021)'], medications: [{ name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2023-04' }],
    allergies: [], vitals: [{ date: '2025-09-07', bp: '126/80', hr: 78, glucose: '138 mg/dL (fasting)', weight: '85 kg' }],
    labs: [{ date: '2025-08-25', test: 'HbA1c', value: '7.1%', ref: '< 7.0%' }],
    visits: [{ date: '2025-09-07', type: 'Clinic', reason: 'Glycemic control review', notes: 'Slight elevation; dietary adherence counselled.' }],
    doctorNotes: 'Consider adding SGLT2 inhibitor if persists above target.'
  },
  P1016: {
    id: 'P1016', name: 'Anjali Gupta', age: 31, gender: 'Female', languages: ['English','Hindi'], bloodGroup: 'B-', lastVisit: '2025-09-06',
    chronicConditions: ['PCOS (2023)'], medications: [{ name: 'Metformin', dose: '500 mg', freq: 'twice daily', since: '2025-02' }],
    allergies: [], vitals: [{ date: '2025-09-06', bp: '118/74', hr: 72, glucose: '—', weight: '62 kg' }],
    labs: [{ date: '2025-08-18', test: 'Fasting Insulin', value: '14 μIU/mL', ref: '2 - 19 μIU/mL' }],
    visits: [{ date: '2025-09-06', type: 'Video', reason: 'Cycle irregularity', notes: 'Advised lifestyle and ongoing therapy.' }],
    doctorNotes: 'Track cycle length; consider endocrine referral.'
  },
  P1017: {
    id: 'P1017', name: 'Sanjay Patel', age: 52, gender: 'Male', languages: ['English','Gujarati'], bloodGroup: 'A-', lastVisit: '2025-09-05',
    chronicConditions: ['Osteoarthritis (knees) (2020)'], medications: [{ name: 'NSAID (as needed)', dose: '400 mg', freq: 'PRN', since: '2024-10' }],
    allergies: [], vitals: [{ date: '2025-09-05', bp: '132/86', hr: 76, glucose: '—', weight: '90 kg' }],
    labs: [],
    visits: [{ date: '2025-09-05', type: 'Clinic', reason: 'Joint pain', notes: 'Reinforced physiotherapy exercises.' }],
    doctorNotes: 'Encourage weight reduction and quad strengthening.'
  },
  P1018: {
    id: 'P1018', name: 'Kavya Iyer', age: 29, gender: 'Female', languages: ['English','Hindi','Tamil'], bloodGroup: 'O+', lastVisit: '2025-09-03',
    chronicConditions: ['Migraine (with aura)'], medications: [{ name: 'Sumatriptan', dose: '50 mg', freq: 'PRN', since: '2025-05' }],
    allergies: [], vitals: [{ date: '2025-09-03', bp: '112/70', hr: 70, glucose: '—', weight: '55 kg' }],
    labs: [],
    visits: [{ date: '2025-09-03', type: 'Audio', reason: 'Acute migraine', notes: 'Resolved with triptan; advised trigger diary.' }],
    doctorNotes: 'Assess frequency; consider prophylaxis if >4/month.'
  },
  P1019: {
    id: 'P1019', name: 'Mohit Verma', age: 38, gender: 'Male', languages: ['English','Hindi'], bloodGroup: 'B+', lastVisit: '2025-09-02',
    chronicConditions: ['Asthma (moderate)'], medications: [{ name: 'Budesonide/Formoterol', dose: '2 puffs', freq: 'twice daily', since: '2025-01' }],
    allergies: [], vitals: [{ date: '2025-09-02', bp: '124/78', hr: 74, glucose: '—', weight: '77 kg' }],
    labs: [],
    visits: [{ date: '2025-09-02', type: 'Clinic', reason: 'Control assessment', notes: 'Well controlled; continue regimen.' }],
    doctorNotes: 'Annual spirometry recommended.'
  },
  P1020: {
    id: 'P1020', name: 'Jasleen Kaur', age: 27, gender: 'Female', languages: ['English','Punjabi'], bloodGroup: 'A+', lastVisit: '2025-09-01',
    chronicConditions: ['Seasonal Allergic Rhinitis'], medications: [{ name: 'Cetirizine', dose: '10 mg', freq: 'once daily', since: '2025-03' }],
    allergies: ['Pollen'], vitals: [{ date: '2025-09-01', bp: '110/68', hr: 66, glucose: '—', weight: '54 kg' }],
    labs: [],
    visits: [{ date: '2025-09-01', type: 'Video', reason: 'Allergy flare', notes: 'Advised nasal irrigation + antihistamine.' }],
    doctorNotes: 'Consider intranasal steroid if persistent.'
  }
};

// Generic section wrapper (no icons per requirement)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 tracking-tight mb-4 border-b border-gray-100 pb-2">{title}</h3>
    {children}
  </div>
);

// (Removed Pill badges per simplification requirement)

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const DoctorPatientInfo = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedAppt = location.state?.appointment;
  const patient = mockPatientProfiles[id] || (passedAppt ? {
    id: passedAppt.id,
    name: passedAppt.patient,
    age: passedAppt.age,
    gender: 'Unknown',
    languages: passedAppt.languages,
    bloodGroup: '—',
    lastVisit: '2025-09-14',
    chronicConditions: ['Data not loaded'],
    medications: [],
    allergies: [],
    vitals: [],
    labs: [],
    visits: [],
    doctorNotes: 'No extended history available for mock appointment.'
  } : null);

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline mb-6" aria-label="Go Back">
          <FaArrowLeft className="mr-2"/> Back
        </button>
        <div className="bg-white border border-border-light rounded-lg p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-text-primary">Patient Not Found</h2>
          <p className="text-text-secondary mb-4">No data is available for the requested patient.</p>
          <button onClick={() => navigate('/doctor')} className="btn btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
  <div className="max-w-7xl mx-auto py-8 px-2 sm:px-4 pb-28">
      <button onClick={() => navigate(-1)} className="btn btn-outline mb-6" aria-label="Go Back">
        <FaArrowLeft className="mr-2"/> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1 pl-0">{patient.name}</h1>
        <table className="patient-summary-table">
          <tbody>
            <tr>
              <th>Gender</th>
              <td>{patient.gender || 'N/A'}</td>
            </tr>
            <tr>
              <th>Age</th>
              <td>{patient.age} yrs</td>
            </tr>
            <tr>
              <th>Blood Group</th>
              <td>{patient.bloodGroup}</td>
            </tr>
            <tr>
              <th>Last Visit</th>
              <td>{formatDate(patient.lastVisit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <SectionCard title="Active Conditions">
            {patient.chronicConditions.length ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {patient.chronicConditions.map(c => <li key={c}>{c}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-500">None recorded.</p> }
          </SectionCard>

          <SectionCard title="Medications">
            {patient.medications.length ? (
              <div className="overflow-x-auto">
                <table className="table-grid-strong col-hover-parent">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-[11px] md:text-xs uppercase tracking-wide">
                      <th>Name</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.medications.map(m => (
                      <tr key={m.name}>
                        <td className="font-medium">{m.name}</td>
                        <td>{m.dose}</td>
                        <td>{m.freq}</td>
                        <td>{m.since}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-gray-500">No active medications.</p> }
          </SectionCard>

          <SectionCard title="Visit History">
            {patient.visits.length ? (
              <div className="overflow-x-auto">
                <table className="table-grid-strong col-hover-parent">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-[11px] md:text-xs uppercase tracking-wide">
                      <th>Date</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.visits.map(v => (
                      <tr key={v.date+v.type}>
                        <td className="font-medium whitespace-nowrap">{formatDate(v.date)}</td>
                        <td className="whitespace-nowrap">{v.type}</td>
                        <td className="min-w-[140px]">{v.reason}</td>
                        <td className="text-[11px] md:text-xs leading-relaxed">{v.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-gray-500">No visits recorded.</p> }
          </SectionCard>

          <SectionCard title="Doctor Notes">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{patient.doctorNotes}</p>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Allergies">
            {patient.allergies.length ? (
              <ul className="flex flex-wrap gap-2">
                {patient.allergies.map(a => <span key={a} className="px-2.5 py-1 rounded-md bg-red-50 text-[11px] md:text-xs font-medium text-red-700 border border-red-100">{a}</span>)}
              </ul>
            ) : <p className="text-sm text-gray-500">None reported.</p> }
          </SectionCard>

          <SectionCard title="Recent Vitals">
            {patient.vitals.length ? (
              <div className="overflow-x-auto">
                <table className="table-grid-strong col-hover-parent">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-[11px] md:text-xs uppercase tracking-wide">
                      <th>Date</th>
                      <th>BP</th>
                      <th>HR</th>
                      <th>Glucose</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.vitals.map(v => (
                      <tr key={v.date}>
                        <td className="font-medium whitespace-nowrap">{formatDate(v.date)}</td>
                        <td>{v.bp}</td>
                        <td>{v.hr}</td>
                        <td>{v.glucose}</td>
                        <td>{v.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-gray-500">No vitals.</p> }
          </SectionCard>

          <SectionCard title="Key Labs">
            {patient.labs.length ? (
              <div className="overflow-x-auto">
                <table className="table-grid-strong col-hover-parent">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-[11px] md:text-xs uppercase tracking-wide">
                      <th>Date</th>
                      <th>Test</th>
                      <th>Result</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.labs.map(l => (
                      <tr key={l.date + l.test}>
                        <td className="font-medium whitespace-nowrap">{formatDate(l.date)}</td>
                        <td>{l.test}</td>
                        <td>{l.value}</td>
                        <td>{l.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-gray-500">No labs.</p> }
          </SectionCard>
        </div>
      </div>

    </div>
  );
};

export default DoctorPatientInfo;
