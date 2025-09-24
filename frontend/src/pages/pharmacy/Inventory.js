import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSyncAlt, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // existing id or 'new'
  const [draft, setDraft] = useState({ id:'', name:'', category:'General', stock:0, expiry:'' });
  const [navPad, setNavPad] = useState(160); // dynamic padding below table
  const scrollRef = useRef(null);

  // Dynamically calculate bottom padding so last row is never hidden under fixed nav
  useEffect(()=>{
    const calc = () => {
      const nav = document.querySelector('.app-bottomnav-fixed');
      const h = nav ? nav.offsetHeight : 80;
      // Add extra breathing room (24px)
      setNavPad(h + 24);
      if(scrollRef.current) {
        scrollRef.current.style.paddingBottom = `${h + 24}px`;
      }
    };
    calc();
    window.addEventListener('resize', calc);
    const mo = new MutationObserver(calc);
    const navEl = document.querySelector('.app-bottomnav-fixed');
    if(navEl) mo.observe(navEl,{attributes:true,childList:true,subtree:true});
    return () => { window.removeEventListener('resize', calc); mo.disconnect(); };
  },[]);

  useEffect(()=>{
    const key='helio_inventory';
    const raw = localStorage.getItem(key);
    if(raw){
      try { 
        const parsed = JSON.parse(raw);
        const migrated = Array.isArray(parsed) ? parsed.map(it => it.updated ? it : { ...it, updated: new Date().toISOString() }) : [];
        // Strip supplier if older records have it
        const cleaned = migrated.map(it => { const { supplier, ...rest } = it; return rest; });
        setItems(cleaned);
        localStorage.setItem(key, JSON.stringify(cleaned));
      } catch(_) { /* ignore parse errors */ }
    } else {
      const seed=[
        {id:'M-1001', name:'Paracetamol 500mg', category:'Tablet', stock:520, expiry:'2026-03-01', updated: new Date().toISOString()},
        {id:'M-1002', name:'Amoxicillin 250mg', category:'Capsule', stock:120, expiry:'2025-12-15', updated: new Date().toISOString()},
        {id:'M-1003', name:'Cough Syrup', category:'Syrup', stock:40, expiry:'2025-02-10', updated: new Date().toISOString()},
        {id:'M-1004', name:'Insulin Pen', category:'Injection', stock:12, expiry:'2025-06-30', updated: new Date().toISOString()}
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

  const persist = (next) => localStorage.setItem('helio_inventory', JSON.stringify(next));

  const updateItem = (id, changes) => {
    setItems(prev => {
      const updatedArr = prev.map(i=> i.id===id ? { ...i, ...changes, updated:new Date().toISOString() } : i);
      persist(updatedArr);
      return updatedArr;
    });
  };

  const deleteItem = (id) => {
    if(editingId && editingId === id) return;
    if(!window.confirm('Delete this medicine?')) return;
    const filtered = items.filter(i=>i.id!==id);
    setItems(filtered);
    persist(filtered);
  };

  // Inline edit helpers
  const beginEdit = (id) => {
    const target = items.find(i=>i.id===id);
    if(!target) return;
    setEditingId(id);
    setDraft({ ...target });
  };
  const beginAdd = () => {
    setEditingId('new');
    setDraft({ id:'', name:'', category:'General', stock:0, expiry:'' });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ id:'', name:'', category:'General', stock:0, expiry:'' });
  };
  const handleDraftChange = (field, value) => {
    setDraft(d => ({ ...d, [field]: field==='stock' ? Number(value)||0 : value }));
  };
  const nextId = () => {
    const nums = items.map(i => parseInt((i.id||'').split('-')[1],10)).filter(n=>!isNaN(n));
    const max = nums.length? Math.max(...nums):1000;
    return `M-${(max+1)}`;
  };
  const saveDraft = () => {
    if(!draft.name.trim()) return alert('Medicine name required');
    if(!draft.category.trim()) return alert('Category required');
    if(!draft.expiry) return alert('Expiry date required');
    if(editingId === 'new') {
      const id = nextId();
      const newItem = { ...draft, id, updated:new Date().toISOString() };
      // Prepend new item so it appears at the top
      setItems(prev => { const next=[newItem, ...prev]; persist(next); return next; });
    } else {
      updateItem(editingId, { ...draft });
    }
    cancelEdit();
  };

  const formatDate = (value) => {
    if(!value) return '—';
    const d = new Date(value);
    if(isNaN(d)) return '—';
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8 rounded-xl mb-8 shadow text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pharmacy Inventory</h1>
            <p className="text-blue-100 text-sm sm:text-base mb-4">Centralized real-time medicine stock overview & control.</p>
            <button
              onClick={beginAdd}
              disabled={editingId==='new'}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-md shadow hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaPlus/> Add Medicine
            </button>
        </div>

        {loading && <div className="text-center py-12 text-gray-500">Loading inventory...</div>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div ref={scrollRef} className="overflow-auto" style={{maxHeight:'58vh', paddingBottom: navPad}}>
            <table className="min-w-full text-sm pharmacy-table table-fixed">
              <thead>
                <tr>
                  <th style={{width:'30%'}}>Medicine Name</th>
                  <th style={{width:'18%'}}>Category</th>
                  <th style={{width:'10%'}}>Stock</th>
                  <th style={{width:'18%'}}>Stock Status</th>
                  <th style={{width:'14%'}}>Expiry Date</th>
                  <th style={{width:'10%'}}>Last Updated</th>
                  <th style={{width:'10%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editingId==='new' && (
                  <tr className="bg-blue-50/40">
                    <td><input value={draft.name} onChange={e=>handleDraftChange('name', e.target.value)} className="w-full input-like" placeholder="Name" /></td>
                    <td><input value={draft.category} onChange={e=>handleDraftChange('category', e.target.value)} className="w-full input-like" placeholder="Category" /></td>
                    <td className="text-center"><input type="number" value={draft.stock} onChange={e=>handleDraftChange('stock', e.target.value)} className="w-full input-like text-center" min={0} /></td>
                    <td className="text-center italic text-gray-500">(auto)</td>
                    <td className="text-center"><input type="date" value={draft.expiry} onChange={e=>handleDraftChange('expiry', e.target.value)} className="w-full input-like" /></td>
                    <td className="text-center text-gray-400">—</td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={saveDraft} title="Add" className="text-emerald-600 hover:text-emerald-700"><FaSave/></button>
                        <button onClick={cancelEdit} title="Cancel" className="text-rose-600 hover:text-rose-700"><FaTimes/></button>
                      </div>
                    </td>
                  </tr>
                )}
                {items.map(item => {
                  const isEditing = editingId === item.id;
                  const av = availability(isEditing? draft.stock : item.stock);
                  return (
                    <tr key={item.id} className={isEditing ? 'bg-yellow-50/60' : undefined}>
                      <td className="font-medium text-gray-900">{isEditing ? (<input value={draft.name} onChange={e=>handleDraftChange('name', e.target.value)} className="w-full input-like" />) : item.name}</td>
                      <td className="text-gray-600">{isEditing ? (<input value={draft.category} onChange={e=>handleDraftChange('category', e.target.value)} className="w-full input-like" />) : item.category}</td>
                      <td className="text-gray-800 font-semibold text-center">{isEditing ? (<input type="number" min={0} value={draft.stock} onChange={e=>handleDraftChange('stock', e.target.value)} className="w-full input-like text-center" />) : item.stock}</td>
                      <td className="text-center"><span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-full border ${av.color}`}>{av.label}</span></td>
                      <td className="text-gray-600 text-center">{isEditing ? (<input type="date" value={draft.expiry} onChange={e=>handleDraftChange('expiry', e.target.value)} className="w-full input-like" />) : formatDate(item.expiry)}</td>
                      <td className="text-gray-500 text-[11px] text-center">{formatDate(item.updated)}</td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveDraft} title="Save" className="text-emerald-600 hover:text-emerald-700"><FaSave/></button>
                              <button onClick={cancelEdit} title="Cancel" className="text-rose-600 hover:text-rose-700"><FaTimes/></button>
                            </>
                          ) : (
                            <>
                              <button onClick={()=>updateItem(item.id,{stock:item.stock+10})} title="+10 Stock" className="text-blue-600 hover:text-blue-800"><FaSyncAlt/></button>
                              <button onClick={()=>beginEdit(item.id)} title="Edit" className="text-emerald-600 hover:text-emerald-700"><FaEdit/></button>
                              <button onClick={()=>deleteItem(item.id)} title="Delete" className="text-rose-600 hover:text-rose-800"><FaTrash/></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Spacer row to ensure last data row never sits under fixed bottom navigation */}
                <tr aria-hidden="true">
                  <td colSpan={7} style={{padding:0, border:'none', height: navPad}} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

