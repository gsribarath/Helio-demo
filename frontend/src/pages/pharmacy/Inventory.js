import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSyncAlt, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

// Base 100 medicines (Ph01 - Ph100) requested to appear in pharmacist list
// Dates converted to ISO (YYYY-MM-DD) for reliable Date parsing
const patientSeed = [
  { id: 'Ph01', name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 150, expiry: '2025-12-31' },
  { id: 'Ph02', name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 12, expiry: '2024-08-15' },
  { id: 'Ph03', name: 'Cetirizine 10mg', category: 'Antihistamines', stock: 0, expiry: '2025-03-20' },
  { id: 'Ph04', name: 'Metformin 500mg', category: 'Diabetes', stock: 75, expiry: '2025-11-10' },
  { id: 'Ph05', name: 'Omeprazole 20mg', category: 'Gastric', stock: 18, expiry: '2024-12-05' },
  { id: 'Ph06', name: 'Vitamin D3 60000 IU', category: 'Vitamins', stock: 200, expiry: '2026-01-15' },
  { id: 'Ph07', name: 'Amlodipine 5mg', category: 'Antihypertensives', stock: 110, expiry: '2026-04-30' },
  { id: 'Ph08', name: 'Losartan 50mg', category: 'Antihypertensives', stock: 95, expiry: '2025-10-31' },
  { id: 'Ph09', name: 'Atorvastatin 10mg', category: 'Lipid Lowering', stock: 80, expiry: '2026-02-28' },
  { id: 'Ph10', name: 'Aspirin 75mg', category: 'Antiplatelet', stock: 140, expiry: '2025-08-31' },
  { id: 'Ph11', name: 'Clopidogrel 75mg', category: 'Antiplatelet', stock: 60, expiry: '2026-03-31' },
  { id: 'Ph12', name: 'Levothyroxine 50mcg', category: 'Thyroid', stock: 160, expiry: '2026-05-31' },
  { id: 'Ph13', name: 'Salbutamol Inhaler 100mcg', category: 'Respiratory', stock: 35, expiry: '2025-09-30' },
  { id: 'Ph14', name: 'Budesonide Inhaler 200mcg', category: 'Respiratory', stock: 25, expiry: '2025-12-31' },
  { id: 'Ph15', name: 'Doxycycline 100mg', category: 'Antibiotics', stock: 50, expiry: '2025-06-30' },
  { id: 'Ph16', name: 'Metronidazole 400mg', category: 'Antibiotics', stock: 65, expiry: '2025-07-31' },
  { id: 'Ph17', name: 'ORS Sachet', category: 'Electrolytes', stock: 300, expiry: '2026-08-31' },
  { id: 'Ph18', name: 'Zinc Sulphate 20mg', category: 'Supplements', stock: 220, expiry: '2026-01-31' },
  { id: 'Ph19', name: 'Iron Folic Acid', category: 'Supplements', stock: 180, expiry: '2026-02-28' },
  { id: 'Ph20', name: 'Calcium + Vitamin D3', category: 'Supplements', stock: 130, expiry: '2026-04-30' },
  { id: 'Ph21', name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 95, expiry: '2025-09-30' },
  { id: 'Ph22', name: 'Diclofenac 50mg', category: 'Pain Relief', stock: 70, expiry: '2025-10-31' },
  { id: 'Ph23', name: 'Loratadine 10mg', category: 'Antihistamines', stock: 85, expiry: '2026-03-31' },
  { id: 'Ph24', name: 'Ondansetron 4mg', category: 'Antiemetic', stock: 60, expiry: '2025-07-31' },
  { id: 'Ph25', name: 'Loperamide 2mg', category: 'Antidiarrheal', stock: 90, expiry: '2025-08-31' },
  { id: 'Ph26', name: 'Pantoprazole 40mg', category: 'Gastric', stock: 100, expiry: '2026-06-30' },
  { id: 'Ph27', name: 'Furosemide 40mg', category: 'Diuretics', stock: 85, expiry: '2026-01-31' },
  { id: 'Ph28', name: 'Hydrochlorothiazide 12.5mg', category: 'Diuretics', stock: 90, expiry: '2025-12-31' },
  { id: 'Ph29', name: 'Spironolactone 25mg', category: 'Diuretics', stock: 70, expiry: '2026-02-28' },
  { id: 'Ph30', name: 'Glibenclamide 5mg', category: 'Diabetes', stock: 55, expiry: '2025-11-30' },
  { id: 'Ph31', name: 'Insulin Regular', category: 'Diabetes', stock: 20, expiry: '2025-10-31' },
  { id: 'Ph32', name: 'Insulin NPH', category: 'Diabetes', stock: 18, expiry: '2025-10-31' },
  { id: 'Ph33', name: 'Azithromycin 500mg', category: 'Antibiotics', stock: 62, expiry: '2025-07-31' },
  { id: 'Ph34', name: 'Ciprofloxacin 500mg', category: 'Antibiotics', stock: 58, expiry: '2025-08-31' },
  { id: 'Ph35', name: 'Trimethoprim/Sulfamethoxazole', category: 'Antibiotics', stock: 64, expiry: '2026-03-31' },
  { id: 'Ph36', name: 'Fluconazole 150mg', category: 'Antifungal', stock: 47, expiry: '2026-02-28' },
  { id: 'Ph37', name: 'Albendazole 400mg', category: 'Antiparasitic', stock: 52, expiry: '2026-05-31' },
  { id: 'Ph38', name: 'Ivermectin 12mg', category: 'Antiparasitic', stock: 49, expiry: '2026-04-30' },
  { id: 'Ph39', name: 'Acyclovir 400mg', category: 'Antiviral', stock: 44, expiry: '2025-12-31' },
  { id: 'Ph40', name: 'Prednisolone 10mg', category: 'Steroid', stock: 53, expiry: '2026-01-31' },
  { id: 'Ph41', name: 'Hydrocortisone 1% Cream', category: 'Dermatology', stock: 40, expiry: '2025-12-31' },
  { id: 'Ph42', name: 'Clotrimazole 1% Cream', category: 'Antifungal', stock: 42, expiry: '2026-04-30' },
  { id: 'Ph43', name: 'Miconazole Powder', category: 'Antifungal', stock: 38, expiry: '2026-06-30' },
  { id: 'Ph44', name: 'Povidone Iodine 10%', category: 'Antiseptic', stock: 55, expiry: '2026-03-31' },
  { id: 'Ph45', name: 'Chlorhexidine Solution', category: 'Antiseptic', stock: 60, expiry: '2026-02-28' },
  { id: 'Ph46', name: 'Lidocaine 2% Gel', category: 'Anesthetic', stock: 33, expiry: '2025-12-31' },
  { id: 'Ph47', name: 'ORS Low Osmolarity', category: 'Electrolytes', stock: 210, expiry: '2026-07-31' },
  { id: 'Ph48', name: 'Magnesium Sulphate', category: 'Minerals', stock: 48, expiry: '2026-05-31' },
  { id: 'Ph49', name: 'Folic Acid 5mg', category: 'Supplements', stock: 150, expiry: '2026-04-30' },
  { id: 'Ph50', name: 'Vitamin B Complex', category: 'Vitamins', stock: 122, expiry: '2026-02-28' },
  { id: 'Ph51', name: 'Multivitamin Syrup', category: 'Vitamins', stock: 90, expiry: '2025-11-30' },
  { id: 'Ph52', name: 'Sodium Chloride 0.9%', category: 'IV Fluids', stock: 75, expiry: '2025-09-30' },
  { id: 'Ph53', name: "Ringer's Lactate", category: 'IV Fluids', stock: 66, expiry: '2025-08-31' },
  { id: 'Ph54', name: 'Dextrose 5%', category: 'IV Fluids', stock: 70, expiry: '2025-07-31' },
  { id: 'Ph55', name: 'Adrenaline 1mg/ml', category: 'Emergency', stock: 40, expiry: '2025-12-31' },
  { id: 'Ph56', name: 'Atropine 0.6mg/ml', category: 'Emergency', stock: 28, expiry: '2025-12-31' },
  { id: 'Ph57', name: 'Diazepam 5mg', category: 'Neurology', stock: 36, expiry: '2026-01-31' },
  { id: 'Ph58', name: 'Amitriptyline 25mg', category: 'Neurology', stock: 25, expiry: '2026-03-31' },
  { id: 'Ph59', name: 'Sertraline 50mg', category: 'Neurology', stock: 22, expiry: '2026-05-31' },
  { id: 'Ph60', name: 'Olanzapine 5mg', category: 'Neurology', stock: 20, expiry: '2026-04-30' },
  { id: 'Ph61', name: 'Sodium Valproate 200mg', category: 'Neurology', stock: 18, expiry: '2026-02-28' },
  { id: 'Ph62', name: 'Carbamazepine 200mg', category: 'Neurology', stock: 16, expiry: '2026-03-31' },
  { id: 'Ph63', name: 'Amoxicillin-Clavulanate 625mg', category: 'Antibiotics', stock: 34, expiry: '2025-09-30' },
  { id: 'Ph64', name: 'Cefixime 200mg', category: 'Antibiotics', stock: 30, expiry: '2025-10-31' },
  { id: 'Ph65', name: 'Ceftriaxone 1g', category: 'Antibiotics', stock: 28, expiry: '2025-12-31' },
  { id: 'Ph66', name: 'Ranitidine 150mg', category: 'Gastric', stock: 24, expiry: '2025-11-30' },
  { id: 'Ph67', name: 'Sucralfate Suspension', category: 'Gastric', stock: 32, expiry: '2026-04-30' },
  { id: 'Ph68', name: 'Montelukast 10mg', category: 'Respiratory', stock: 40, expiry: '2026-01-31' },
  { id: 'Ph69', name: 'Beclomethasone Inhaler', category: 'Respiratory', stock: 15, expiry: '2025-12-31' },
  { id: 'Ph70', name: 'Guaifenesin Syrup', category: 'Respiratory', stock: 52, expiry: '2026-03-31' },
  { id: 'Ph71', name: 'Dextromethorphan Syrup', category: 'Respiratory', stock: 47, expiry: '2026-04-30' },
  { id: 'Ph72', name: 'Chlorpheniramine 4mg', category: 'Antihistamines', stock: 64, expiry: '2026-02-28' },
  { id: 'Ph73', name: 'Meclizine 25mg', category: 'Antiemetic', stock: 42, expiry: '2026-05-31' },
  { id: 'Ph74', name: 'Domperidone 10mg', category: 'Antiemetic', stock: 30, expiry: '2025-11-30' },
  { id: 'Ph75', name: 'Clotrimazole Vaginal Tablet', category: 'Antifungal', stock: 22, expiry: '2026-03-31' },
  { id: 'Ph76', name: 'Tranexamic Acid 500mg', category: 'Hematology', stock: 28, expiry: '2026-01-31' },
  { id: 'Ph77', name: 'Mefenamic Acid 250mg', category: 'Pain Relief', stock: 26, expiry: '2026-02-28' },
  { id: 'Ph78', name: 'Hyoscine Butylbromide 10mg', category: 'Gastrointestinal', stock: 36, expiry: '2026-04-30' },
  { id: 'Ph79', name: 'Cyclopentolate Eye Drops', category: 'Ophthalmic', stock: 18, expiry: '2026-03-31' },
  { id: 'Ph80', name: 'Timolol Eye Drops', category: 'Ophthalmic', stock: 14, expiry: '2026-02-28' },
  { id: 'Ph81', name: 'Sodium Bicarbonate', category: 'Gastrointestinal', stock: 20, expiry: '2026-04-30' },
  { id: 'Ph82', name: 'Bisacodyl 5mg', category: 'Laxative', stock: 58, expiry: '2026-01-31' },
  { id: 'Ph83', name: 'Sennosides Tablets', category: 'Laxative', stock: 58, expiry: '2026-03-31' },
  { id: 'Ph84', name: 'Oral Contraceptive Pill', category: 'Family Planning', stock: 40, expiry: '2026-05-31' },
  { id: 'Ph85', name: 'Emergency Contraceptive', category: 'Family Planning', stock: 44, expiry: '2026-02-28' },
  { id: 'Ph86', name: 'Tetanus Toxoid Vaccine', category: 'Vaccines', stock: 24, expiry: '2026-06-30' },
  { id: 'Ph87', name: 'Hepatitis B Vaccine', category: 'Vaccines', stock: 22, expiry: '2026-05-31' },
  { id: 'Ph88', name: 'Rabies Vaccine', category: 'Vaccines', stock: 18, expiry: '2026-04-30' },
  { id: 'Ph89', name: 'ORS with Zinc Pack', category: 'Pediatric', stock: 210, expiry: '2026-06-30' },
  { id: 'Ph90', name: 'Paracetamol Syrup', category: 'Pediatric', stock: 120, expiry: '2026-02-28' },
  { id: 'Ph91', name: 'Amoxicillin Syrup', category: 'Pediatric', stock: 68, expiry: '2025-12-31' },
  { id: 'Ph92', name: 'ORS Flavored', category: 'Pediatric', stock: 260, expiry: '2026-04-30' },
  { id: 'Ph93', name: 'Silver Sulfadiazine Cream', category: 'Burns', stock: 28, expiry: '2026-06-30' },
  { id: 'Ph94', name: 'Metoclopramide 10mg', category: 'Antiemetic', stock: 70, expiry: '2026-01-31' },
  { id: 'Ph95', name: 'Propranolol 40mg', category: 'Beta Blocker', stock: 52, expiry: '2026-03-31' },
  { id: 'Ph96', name: 'Gabapentin 300mg', category: 'Neurology', stock: 36, expiry: '2026-04-30' },
  { id: 'Ph97', name: 'Clindamycin 300mg', category: 'Antibiotics', stock: 44, expiry: '2025-12-31' },
  { id: 'Ph98', name: 'Nitrofurantoin 100mg', category: 'Urinary Antiseptic', stock: 47, expiry: '2026-05-31' },
  { id: 'Ph99', name: 'Isotonic Saline Nasal Spray', category: 'ENT', stock: 54, expiry: '2026-04-30' },
  { id: 'Ph100', name: 'Acetylcysteine 600mg', category: 'Respiratory', stock: 33, expiry: '2026-06-30' }
];

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
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      // If already seeded with >= 50 items we assume it's fine
      if(Array.isArray(arr) && arr.length >= 50){
        setItems(arr);
        setLoading(false);
        return;
      }
    } catch(e) {}

    // Seed with requested patient list (first 100 entries)
    const stamped = patientSeed.map(m => ({ ...m, updated: new Date().toISOString() }));
    localStorage.setItem(key, JSON.stringify(stamped));
    setItems(stamped);
    setLoading(false);
  },[]);

  const availability = (stock) => {
    if (stock === 0) return {label:'Out of Stock', color:'bg-rose-100 text-rose-700 border-rose-300'};
    if (stock < 30) return {label:'Low Stock', color:'bg-amber-100 text-amber-700 border-amber-300'};
    return {label:'In Stock', color:'bg-emerald-100 text-emerald-700 border-emerald-300'};
  };

  const persist = (next) => {
    localStorage.setItem('helio_inventory', JSON.stringify(next));
    // Notify other components that inventory has been updated
    try {
      window.dispatchEvent(new CustomEvent('helio_inventory_updated'));
    } catch (e) {
      // Ignore event dispatch errors
    }
  };

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8 rounded-xl mb-8 shadow">
          <div className="inventory-header">
            <div className="add-medicine-container">
              <button
                onClick={beginAdd}
                disabled={editingId==='new'}
                className="btn-add-medicine"
              >
                <FaPlus/> Add Medicine
              </button>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pharmacy Inventory</h1>
            <p className="text-blue-100 text-sm sm:text-base">Centralized real-time medicine stock overview & control.</p>
          </div>
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
                              <button onClick={()=>updateItem(item.id,{stock:item.stock+10})} title="+10 Stock" className="inventory-action-btn"><FaSyncAlt/></button>
                              <button onClick={()=>beginEdit(item.id)} title="Edit" className="inventory-action-btn"><FaEdit/></button>
                              <button onClick={()=>deleteItem(item.id)} title="Delete" className="inventory-action-btn"><FaTrash/></button>
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

