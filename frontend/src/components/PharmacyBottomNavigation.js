import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaWarehouse, FaClipboardList } from 'react-icons/fa';

const pharmacyNavItems = [
  { path: '/pharmacy', label: 'Home', icon: FaChartBar },
  { path: '/pharmacy/inventory', label: 'Inventory', icon: FaWarehouse },
  { path: '/pharmacy/orders', label: 'Orders', icon: FaClipboardList }
];

export default function PharmacyBottomNavigation(){
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white" style={{height:72}} aria-label="Pharmacy navigation" role="navigation">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(90deg,#2563eb,#7c3aed,#10b981)'}} />
      <div className="h-full px-2 grid" style={{gridTemplateColumns:`repeat(${pharmacyNavItems.length},minmax(0,1fr))`,gap:12}}>
        {pharmacyNavItems.map(item=>{
          const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center relative" style={{textDecoration:'none'}} aria-current={active? 'page': undefined}>
                <div className="flex items-center justify-center" style={{width:40,height:40,borderRadius:14,backgroundColor:active?'#2563eb':'#f1f5f9',boxShadow:active?'0 6px 14px rgba(37,99,235,0.25)':'inset 0 0 0 1px #e2e8f0',transition:'all 180ms'}}>
                  <Icon style={{fontSize:20,color:active?'#ffffff':'#6d28d9'}} />
                </div>
                <span style={{fontSize:12,fontWeight:active?700:500,color:active?'#2563eb':'#6d28d9',marginTop:4}}>{item.label}</span>
                <div className="absolute" style={{bottom:6,height:active?3:0,width:18,borderRadius:9999,backgroundColor:active?'#2563eb':'transparent',transition:'height 180ms'}} />
              </Link>
            );
        })}
      </div>
    </nav>
  );
}
