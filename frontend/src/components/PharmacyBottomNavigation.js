import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaBoxes, FaFilePrescription } from 'react-icons/fa';

// Matches unified style used in BottomNavigation (patients/doctors)
// Icon container: 36x36, radius 12, active blue background, inactive indigo border
// Height: 72px; gradient bar on top; underline indicator
const navItems = [
  { path: '/pharmacy', label: 'Home', icon: FaChartBar },
  { path: '/pharmacy/requests', label: 'Requests', icon: FaFilePrescription },
  { path: '/pharmacy/inventory', label: 'Inventory', icon: FaBoxes }
];

export default function PharmacyBottomNavigation(){
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(()=>{
    const el = navRef.current; if(!el) return;
    const apply = () => {
      el.classList.add('app-bottomnav-fixed');
      el.style.position='fixed';
      el.style.bottom='0';
      el.style.left='0';
      el.style.right='0';
      el.style.width='100%';
      el.style.zIndex='9999';
      el.style.opacity='1';
      el.style.visibility='visible';
    };
    apply();
    const mo=new MutationObserver(apply);
    mo.observe(el,{attributes:true,attributeFilter:['class','style']});
    return ()=>mo.disconnect();
  },[]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 app-bottomnav-fixed"
      style={{background:'#ffffff',boxShadow:'0 -4px 12px rgba(0,0,0,0.06)',height:72}}
      aria-label="Pharmacy navigation"
      role="navigation"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed,#10b981)' }} />
      <div className="px-2 pb-[env(safe-area-inset-bottom,0px)] h-full">
  <div className="grid h-full" style={{gridTemplateColumns:`repeat(${navItems.length},minmax(0,1fr))`,gap:14,alignItems:'center'}}>
          {navItems.map(item=>{
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative flex flex-col items-center justify-center no-underline"
                style={{height:56,margin:'0 4px',borderRadius:12,background:'transparent',textDecoration:'none',transition:'background-color 160ms'}}
                aria-current={isActive? 'page': undefined}
              >
                <div className="flex items-center justify-center" style={{width:36,height:36,borderRadius:12,backgroundColor:isActive?'#2563eb':'transparent',boxShadow:isActive?'0 6px 14px rgba(37,99,235,0.25)':'inset 0 0 0 1px rgba(124,58,237,0.15)',transition:'all 180ms'}}>
                  <Icon style={{fontSize:20,color:isActive?'#ffffff':'#7c3aed'}} />
                </div>
                <span className="mt-1" style={{fontSize:12,lineHeight:'14px',fontWeight:isActive?700:500,color:isActive?'#2563eb':'#7c3aed'}}>{item.label}</span>
                <div className="absolute" style={{bottom:6,height:isActive?3:0,width:18,borderRadius:9999,backgroundColor:isActive?'#2563eb':'transparent',transition:'height 180ms'}} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
