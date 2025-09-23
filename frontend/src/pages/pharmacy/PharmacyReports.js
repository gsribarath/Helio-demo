import React, { useEffect, useState } from 'react';
import PharmacyBottomNavigation from '../../components/PharmacyBottomNavigation';
import { FaPills, FaExclamationTriangle, FaChartLine, FaChartPie } from 'react-icons/fa';

// Simple chart placeholders using inline SVG to avoid extra deps
const BarChart = ({data}) => (
  <div className="w-full h-40 flex items-end gap-2">
    {data.map((d,i)=> <div key={i} className="flex-1 flex flex-col items-center" style={{minWidth:20}}>
      <div className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400" style={{height:`${d.value}%`}}></div>
      <div className="text-[10px] mt-1 text-gray-600 font-medium truncate" title={d.label}>{d.label}</div>
    </div>)}
  </div>
);

const LineChart = ({points}) => {
  const path = points.map((p,i)=> `${i===0?'M':'L'} ${i*40} ${100-p.value}`).join(' ');
  return (
    <svg viewBox={`0 0 ${(points.length-1)*40+40} 100`} className="w-full h-40">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p,i)=>(<circle key={i} cx={i*40} cy={100-p.value} r={3} fill="#1d4ed8" />))}
      <path d={`${path} L ${(points.length-1)*40+40} 100 L 0 100 Z`} fill="url(#grad)" opacity="0.35" />
    </svg>
  );
};

const PieChart = ({segments}) => {
  const total = segments.reduce((a,b)=>a+b.value,0);
  let acc=0;
  return (
    <svg viewBox="0 0 32 32" className="w-40 h-40">
      {segments.map((s,i)=>{
        const start = acc/total*2*Math.PI;
        const end = (acc + s.value)/total*2*Math.PI;
        acc += s.value;
        const large = end-start>Math.PI?1:0;
        const x1 = 16 + 14*Math.sin(start);
        const y1 = 16 - 14*Math.cos(start);
        const x2 = 16 + 14*Math.sin(end);
        const y2 = 16 - 14*Math.cos(end);
        return <path key={i} d={`M16 16 L ${x1} ${y1} A 14 14 0 ${large} 1 ${x2} ${y2} Z`} fill={s.color}/>;
      })}
    </svg>
  );
};

const PharmacyReports = () => {
  // Demo analytics data
  const mostPrescribed=[
    {label:'Paracetamol', value:90},
    {label:'Metformin', value:70},
    {label:'Atorvastatin', value:60},
    {label:'Amoxicillin', value:40},
    {label:'Vitamin D3', value:30}
  ];
  const stockTrend=[
    {label:'Mon', value:70},
    {label:'Tue', value:68},
    {label:'Wed', value:65},
    {label:'Thu', value:62},
    {label:'Fri', value:60},
    {label:'Sat', value:58},
    {label:'Sun', value:55}
  ];
  const expirySoon=[
    {name:'Cough Syrup', expiry:'2025-02-10', days:140},
    {name:'Insulin Pen', expiry:'2025-06-30', days:300}
  ];
  const lowStock=[
    {name:'Cough Syrup', stock:40},
    {name:'Insulin Pen', stock:12}
  ];
  const categoryShare=[
    {label:'Tablets', value:50, color:'#2563eb'},
    {label:'Syrups', value:20, color:'#10b981'},
    {label:'Injections', value:15, color:'#f59e0b'},
    {label:'Others', value:15, color:'#6366f1'}
  ];

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8 rounded-xl mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Pharmacy Reports</h1>
        <p className="text-blue-100 text-sm sm:text-base">Actionable insights for inventory & dispensing efficiency.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaPills className="text-blue-600"/> Most Prescribed Medicines</h3>
          <BarChart data={mostPrescribed} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaChartLine className="text-blue-600"/> Stock Consumption Trend</h3>
          <LineChart points={stockTrend} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaChartPie className="text-blue-600"/> Category Share</h3>
          <div className="flex items-center justify-center"><PieChart segments={categoryShare} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            {categoryShare.map(s=> <div key={s.label} className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{background:s.color}}></span>{s.label} ({s.value}%)</div>)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaExclamationTriangle className="text-amber-600"/> Upcoming Expiry</h3>
          <ul className="space-y-2 text-sm">
            {expirySoon.map(e=> <li key={e.name} className="flex justify-between"><span>{e.name}</span><span className="text-gray-500 text-xs">{e.expiry}</span></li>)}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaExclamationTriangle className="text-rose-600"/> Low Stock Alerts</h3>
          <ul className="space-y-2 text-sm">
            {lowStock.map(e=> <li key={e.name} className="flex justify-between"><span>{e.name}</span><span className="text-gray-700 font-semibold">{e.stock}</span></li>)}
          </ul>
        </div>
      </div>

      <PharmacyBottomNavigation />
    </div>
  );
};

export default PharmacyReports;
