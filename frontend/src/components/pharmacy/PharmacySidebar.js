import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaPills, FaClipboardList, FaChartBar } from 'react-icons/fa';

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors';
const activeClasses = 'bg-blue-600 text-white shadow-sm';
const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

const PharmacySidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-60 bg-white/90 backdrop-blur border-r border-gray-200 p-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)'}}>
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Pharmacy</h2>
        <nav className="space-y-1">
          <NavLink to="/pharmacy" end className={({isActive}) => `${linkBase} ${isActive?activeClasses:inactiveClasses}`}> <FaHome className="text-base"/> <span>Home</span></NavLink>
          <NavLink to="/pharmacy/inventory" className={({isActive}) => `${linkBase} ${isActive?activeClasses:inactiveClasses}`}> <FaPills className="text-base"/> <span>Inventory</span></NavLink>
          <NavLink to="/pharmacy/orders" className={({isActive}) => `${linkBase} ${isActive?activeClasses:inactiveClasses}`}> <FaClipboardList className="text-base"/> <span>Orders</span></NavLink>
          {/* Reports link removed per updated requirements */}
        </nav>
      </div>
      <div className="mt-auto text-[11px] text-gray-400 px-2">Daily stock updates required by 9 AM.</div>
    </aside>
  );
};

export default PharmacySidebar;
