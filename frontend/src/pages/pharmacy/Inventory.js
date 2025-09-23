import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSyncAlt } from 'react-icons/fa';
import PharmacyBottomNavigation from '../../components/PharmacyBottomNavigation';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const key='helio_inventory';
    const raw = localStorage.getItem(key);
    if(raw){
      try { setItems(JSON.parse(raw)); } catch(_) {}
    } else {
      const seed=[
        {id:'M-1001', name:'Paracetamol 500mg', category:'Tablet', stock:520, unitPrice:2.5, expiry:'2026-03-01', supplier:'MediLife Labs', updated: new Date().toISOString()},
        {id:'M-1002', name:'Amoxicillin 250mg', category:'Capsule', stock:120, unitPrice:6.0, expiry:'2025-12-15', supplier:'HealthPlus Pharma', updated: new Date().toISOString()},
        {id:'M-1003', name:'Cough Syrup', category:'Syrup', stock:40, unitPrice:55, expiry:'2025-02-10', supplier:'HerbalCare', updated: new Date().toISOString()},
        {id:'M-1004', name:'Insulin Pen', category:'Injection', stock:12, unitPrice:350, expiry:'2025-06-30', supplier:'NovoMedi', updated: new Date().toISOString()}
      ];
      localStorage.setItem(key, JSON.stringify(seed));
      setItems(seed);
    }
    setLoading(false);
  },[]);

  const availability = (stock) => {
    if (stock === 0) return {label:'Out of Stock', color:'bg-rose-100 text-rose-700 border-rose-300'};
    if (stock < 30) return {label:'Low Stock', color:'bg-amber-100 text-amber-700 border-amber-300'};
    return {label:'In Stock', color:'bg-emerald-100 text-emerald-700 border-emerald-300'};
  };

  const updateItem = (id, changes) => {
    setItems(prev => prev.map(i=>i.id===id?{...i,...changes, updated:new Date().toISOString()}:i));
    setTimeout(()=>{
      const key='helio_inventory';
      localStorage.setItem(key, JSON.stringify(items.map(i=>i.id===id?{...i,...changes, updated:new Date().toISOString()}:i)));
    },0);
  };

  const deleteItem = (id) => {
    if(!window.confirm('Delete this medicine?')) return;
    const filtered = items.filter(i=>i.id!==id);
    setItems(filtered);
    localStorage.setItem('helio_inventory', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8 rounded-xl mb-8 shadow">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pharmacy Inventory</h1>
          <p className="text-blue-100 text-sm sm:text-base">Centralized real-time medicine stock overview & control.</p>
        </div>

  {loading && <div className="text-center py-12 text-gray-500">Loading inventory...</div>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-auto" style={{maxHeight:'58vh'}}>
            <table className="min-w-full text-sm pharmacy-table">
              <thead className="sticky top-0 bg-gray-100 text-gray-700 text-xs uppercase tracking-wide shadow-sm">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold">Medicine Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Expiry Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item=>{
                  const av = availability(item.stock);
                  return (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-gray-600">{item.category}</td>
                      <td className="px-4 py-2 text-gray-800 font-semibold">{item.stock}</td>
                      <td className="px-4 py-2"><span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${av.color}`}>{av.label}</span></td>
                      <td className="px-4 py-2 text-gray-600">{item.expiry}</td>
                      <td className="px-4 py-2 text-gray-700">{item.stock}</td>
                      <td className="px-4 py-2 text-gray-600">{item.supplier}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{new Date(item.updated).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <button onClick={()=>updateItem(item.id,{stock:item.stock+10})} title="Add Stock" className="text-blue-600 hover:text-blue-800"><FaSyncAlt/></button>
                          <button onClick={()=>updateItem(item.id,{name:item.name})} title="Edit" className="text-emerald-600 hover:text-emerald-800"><FaEdit/></button>
                          <button onClick={()=>deleteItem(item.id)} title="Delete" className="text-rose-600 hover:text-rose-800"><FaTrash/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PharmacyBottomNavigation />
    </div>
  );
};

export default Inventory;
