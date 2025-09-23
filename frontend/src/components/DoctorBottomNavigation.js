import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiHome, HiOutlineChartBar, HiOutlineUser, HiOutlineCog, HiOutlineUserGroup } from 'react-icons/hi';

const DoctorBottomNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/doctor', label: t('home'), icon: HiHome },
  { path: '/doctor/my-appointments', label: t('appointments', t('my_appointments')), icon: HiOutlineChartBar },
    { path: '/doctor/patients', label: 'Patients', icon: HiOutlineUserGroup },
    { path: '/doctor/profile', label: t('profile'), icon: HiOutlineUser },
    { path: '/doctor/settings', label: t('settings'), icon: HiOutlineCog }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200"
      style={{ 
        position:'fixed',
        bottom:0,
        left:0,
        right:0,
        backgroundColor: '#ffffff',
        boxShadow: '0 -8px 20px rgba(2,6,23,0.06)',
        zIndex: 2147483647, // max stacking to prevent accidental overlap
        transform: 'translateZ(0)',
        willChange: 'auto'
      }}
      role="navigation"
      aria-label="Doctor bottom navigation"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed,#10b981)' }} />
      <div className="px-2 pb-[env(safe-area-inset-bottom,0px)]" style={{ height: 72 }}>
  <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`, gap: 12, alignItems: 'center' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative flex flex-col items-center justify-center"
                style={{ textDecoration: 'none', height: 56, margin: '0 4px', borderRadius: 10 }}
                role="link"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className="flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: isActive ? '#2563eb' : 'transparent', boxShadow: isActive ? '0 6px 14px rgba(37,99,235,0.25)' : 'none', transition: 'all 180ms ease' }}
                >
                  <Icon style={{ fontSize: 20, color: isActive ? '#ffffff' : '#7c3aed' }} />
                </div>
                <span className="mt-1" style={{ fontSize: 12, lineHeight: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#2563eb' : '#7c3aed' }}>{item.label}</span>
                <div className="absolute" style={{ bottom: 6, height: isActive ? 3 : 0, width: 18, borderRadius: 9999, backgroundColor: isActive ? '#2563eb' : 'transparent', transition: 'height 180ms ease, background-color 180ms ease' }} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DoctorBottomNavigation;
