import React, { useState, useEffect, useMemo } from 'react';
import PharmacyBottomNavigation from '../../components/PharmacyBottomNavigation';
import { FaFilter } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({query:'', date:''});

  useEffect(()=>{
    const key='helio_pharmacy_orders';
    const raw = localStorage.getItem(key);
    if(raw){
      try { setOrders(JSON.parse(raw)); } catch(_) {}
    } else {
      const seed=[
        {id:'O-5001', patientId:'P-001', medicines:['Paracetamol 500mg x 10','Cough Syrup x 1'], total: 180, date:new Date().toISOString(), status:'processing'},
        {id:'O-5002', patientId:'P-017', medicines:['Metformin 500mg x 30'], total: 240, date:new Date(Date.now()-86400_000).toISOString(), status:'ready'},
        {id:'O-5003', patientId:'P-032', medicines:['Insulin Pen x 2'], total: 700, date:new Date(Date.now()-2*86400_000).toISOString(), status:'dispatched'}
      ];
      localStorage.setItem(key, JSON.stringify(seed));
      setOrders(seed);
    }
  },[]);

  const filtered = useMemo(()=> orders.filter(o => {
    const q = filter.query.toLowerCase();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.patientId.toLowerCase().includes(q) || o.medicines.some(m=>m.toLowerCase().includes(q));
    const matchDate = !filter.date || o.date.slice(0,10) === filter.date;
    return matchQ && matchDate;
  }), [orders, filter]);

  const statusColor = s => ({
    processing:'bg-amber-50 text-amber-700 border-amber-200',
    ready:'bg-emerald-50 text-emerald-700 border-emerald-200',
    dispatched:'bg-blue-50 text-blue-700 border-blue-200'
  })[s] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8 rounded-xl mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Orders</h1>
        <p className="text-blue-100 text-sm sm:text-base">Track confirmed pharmacy orders and fulfillment status.</p>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="input-group">
            <FaFilter className="input-icon"/>
            <input className="input has-icon" placeholder="Search orders, patients, medicines" value={filter.query} onChange={e=>setFilter(f=>({...f,query:e.target.value}))}/>
          </div>
          <div>
            <input type="date" className="input" value={filter.date} onChange={e=>setFilter(f=>({...f,date:e.target.value}))}/>
          </div>
          <div className="flex items-center">
            <button onClick={()=>setFilter({query:'',date:''})} className="btn btn-outline w-full">Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{maxHeight:'65vh'}}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-gray-700 text-xs uppercase tracking-wide shadow-sm">
              <tr>
                {['Order ID','Patient ID','Medicines','Total Cost','Order Date','Status'].map(h=> <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th> )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b last:border-b-0 hover:bg-gray-50/60 align-top">
                  <td className="px-4 py-2 font-medium text-gray-800">{o.id}</td>
                  <td className="px-4 py-2 text-gray-700">{o.patientId}</td>
                  <td className="px-4 py-2 text-gray-600 space-y-1">{o.medicines.map((m,i)=><div key={i}>{m}</div>)}</td>
                  <td className="px-4 py-2 text-gray-900 font-semibold">₹{o.total}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{new Date(o.date).toLocaleString()}</td>
                  <td className="px-4 py-2"><span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${statusColor(o.status)}`}>{o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PharmacyBottomNavigation />
    </div>
  );
};

export default Orders;
