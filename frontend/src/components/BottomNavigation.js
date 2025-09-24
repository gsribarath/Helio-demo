import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Unified bottom navigation styling used across roles (patient, doctor, pharmacy)
// Consistent colors:
//  Active icon background: #2563eb (blue)
//  Inactive icon color/text: #7c3aed (indigo)
//  Active text color: #2563eb
//  Top gradient bar: blue -> indigo -> emerald
//  Height: 72px, icon container: 36x36
const BottomNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef(null);

  // Defensive: keep bottom nav fixed & visible always (no scroll listener needed now).
  useEffect(() => {
    const el = navRef.current;
    if(!el) return;
    const apply = () => {
      el.classList.add('app-bottomnav-fixed');
      el.style.position = 'fixed';
      el.style.bottom = '0';
      el.style.left = '0';
      el.style.right = '0';
      el.style.width = '100%';
      el.style.transform = 'none';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.zIndex = '9999';
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(el, { attributes:true, attributeFilter:['class','style'] });
    return () => { mo.disconnect(); };
  }, []);

  // Icons
  const {
    HiHome,
    HiOutlineClipboardList,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineCog
  } = require('react-icons/hi');

  // Restored original items: Home, Medicines, Availability, Profile, Settings
  const navItems = [
    { path: '/', label: t('home'), icon: HiHome },
    { path: '/medicines', label: t('medicines'), icon: HiOutlineClipboardList },
    { path: '/availability', label: t('availability'), icon: HiOutlineCalendar },
    { path: '/profile', label: t('profile'), icon: HiOutlineUser },
    { path: '/settings', label: t('settings'), icon: HiOutlineCog }
  ];

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 app-bottomnav-fixed"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed,#10b981)' }} />

      <div
        className="px-2 pb-[env(safe-area-inset-bottom,0px)]"
        style={{ height: 72 }}
      >
        <div
          className="grid h-full"
          style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12, alignItems: 'center' }}
        >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex flex-col items-center justify-center no-underline"
              style={{
                textDecoration: 'none',
                height: 56,
                margin: '0 4px',
                borderRadius: 12,
                background: 'transparent',
                transition: 'background-color 160ms ease'
              }}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  boxShadow: isActive ? '0 6px 14px rgba(37,99,235,0.25)' : 'inset 0 0 0 1px rgba(124,58,237,0.15)',
                  transition: 'all 180ms ease'
                }}
              >
                <Icon 
                  className="transition-colors"
                  style={{
                    fontSize: 20,
                    color: isActive ? '#ffffff' : '#7c3aed'
                  }}
                />
              </div>
              <span
                className="mt-1"
                style={{ 
                  fontSize: 12,
                  lineHeight: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#2563eb' : '#7c3aed'
                }}
              >
                {item.label}
              </span>
              {/* Active underline indicator */}
              <div
                className="absolute"
                style={{
                  bottom: 6,
                  height: isActive ? 3 : 0,
                  width: 18,
                  borderRadius: 9999,
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  transition: 'height 180ms ease, background-color 180ms ease'
                }}
              />
              
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;