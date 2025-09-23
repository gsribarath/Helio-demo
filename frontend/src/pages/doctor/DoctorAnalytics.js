import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChartBar, FaClipboardList, FaArrowUp, FaArrowDown, FaCalendarAlt, FaUserClock } from 'react-icons/fa';

const DoctorAnalytics = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        today: 6,
        weekly: 32,
        monthly: 118,
        uniquePatients: 74,
        noShows: 3,
        retention: 88,
        avgConsultTime: 18,
        prescriptionsIssued: 27,
        followUpsScheduled: 9
      });
      setSchedule([
        { day: 'Monday',    morning: '09:00 – 12:30', afternoon: '14:00 – 17:30', tele: '18:00 – 19:00' },
        { day: 'Tuesday',   morning: '09:00 – 12:30', afternoon: '14:00 – 17:30', tele: '—' },
        { day: 'Wednesday', morning: '09:30 – 12:30', afternoon: '14:30 – 17:00', tele: '18:15 – 19:00' },
        { day: 'Thursday',  morning: '09:00 – 12:00', afternoon: '15:00 – 17:30', tele: '—' },
        { day: 'Friday',    morning: '09:00 – 12:30', afternoon: '14:00 – 16:30', tele: '18:00 – 19:30' },
        { day: 'Saturday',  morning: '10:00 – 13:00', afternoon: '—',            tele: '—' },
        { day: 'Sunday',    morning: '—',             afternoon: '—',            tele: 'On-call' }
      ]);
      setAppointments([
        { time: '09:00', patient: 'Anita Sharma', reason: 'Follow-up (BP)', mode: 'In-Person', status: 'Checked-in' },
        { time: '09:20', patient: 'Ravi Patel', reason: 'Chest Discomfort', mode: 'In-Person', status: 'Completed' },
        { time: '09:40', patient: 'Sunil Mehra', reason: 'ECG Review', mode: 'In-Person', status: 'In Progress' },
        { time: '10:00', patient: 'Priya Nair', reason: 'Hypertension Review', mode: 'Video', status: 'Scheduled' },
        { time: '10:20', patient: 'Geeta Rao', reason: 'Lipid Profile', mode: 'In-Person', status: 'Scheduled' },
        { time: '10:40', patient: 'Arjun Singh', reason: 'Palpitations', mode: 'Video', status: 'Scheduled' }
      ]);
    }, 260);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">{t('loading','Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-5 pt-8 pb-10 rounded-b-3xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 inline-flex items-center gap-2"><FaChartBar /> {t('analytics_reports')}</h1>
        <p className="text-sm text-blue-100 opacity-90 max-w-xl mx-auto">{t('analytics_overview_copy')}</p>
      </div>
      <div className="px-4 mt-8 flex flex-col items-center">
        {/* Today's Appointments - expanded to 30 rows, weekly schedule and activity log removed per request */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 w-full max-w-6xl" style={{ boxShadow:'none' }}>
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaUserClock className="text-purple-500"/> {t('todays_appointments','Today\'s Appointments')}</h2>
          <div className="overflow-x-auto analytics-table-container">
            <div className="analytics-table-wrapper">
            <table className="table-horizontal-strong analytics-table mx-auto w-full" role="table" aria-label={t('todays_appointments','Today\'s Appointments')}>
              <thead>
                <tr>
                  <th className="text-left">{t('time','Time')}</th>
                  <th className="text-left">{t('patient','Patient')}</th>
                  <th className="text-left">{t('reason','Reason')}</th>
                  <th className="text-left">{t('mode','Mode')}</th>
                  <th className="text-left">{t('status','Status')}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Ensure exactly 30 patients in the table (mocked if fewer)
                  const allowedStatuses = ['Checked-in', 'In Progress', 'Completed'];
                  const base = appointments.slice(0,30);
                  // fill with mock rows up to 30
                  const rows = [];
                  for (let i = 0; i < 30; i++) {
                    const exists = base[i];
                    let row;
                    if (exists) {
                      // normalize status to allowed values
                      const normalized = allowedStatuses.includes(exists.status) ? exists.status : 'Checked-in';
                      row = { ...exists, status: normalized };
                    } else {
                      // create mock patient rows
                      const times = ['09:00','09:10','09:20','09:30','09:40','09:50','10:00','10:10','10:20','10:30','10:40','10:50','11:00','11:10','11:20','11:30','11:40','11:50','12:00','12:10','12:20','12:30','12:40','12:50','13:00','13:10','13:20','13:30','13:40','13:50'];
                      const randomStatus = allowedStatuses[i % allowedStatuses.length];
                      row = { time: times[i] || '14:00', patient: `Patient ${i+1}`, reason: 'General', mode: i % 3 === 0 ? 'Video' : 'In-Person', status: randomStatus };
                    }
                    rows.push(row);
                  }

                  return rows.map((a, idx) => (
                    <tr key={idx}>
                      <td className="tabular-nums font-medium">{a.time}</td>
                      <td className="font-medium">{a.patient}</td>
                      <td className="text-sm text-text-secondary">{a.reason}</td>
                      <td className="text-sm">{a.mode}</td>
                      <td>
                        {/* Only three allowed statuses with color mapping: Checked-in (yellow font), In Progress (blue), Completed (green) */}
                        <span className={`status-label ${a.status === 'Completed' ? 'status-completed' : a.status === 'In Progress' ? 'status-inprogress' : 'status-checkedin'}`}>{a.status}</span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
