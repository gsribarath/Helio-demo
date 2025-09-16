import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLogOut } from 'react-icons/fi';

// Minimal, clean header: App name on the left, Logout button on the right
const Navbar = ({ user, onLogout }) => {
  const { t } = useTranslation();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
      role="navigation"
      aria-label="Top navigation"
    >
      {/* Full-width row with zero horizontal padding so items can sit exactly at the corners */}
      <div className="w-full px-0">
        <div className="flex items-center justify-between h-16 w-full px-0">
          {/* App Name + Heart Logo - flush left */}
          <div className="flex items-center min-w-0 ml-0 pl-0" style={{ gap: 8 }}>
            <div
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s-6.716-4.077-9.193-7.243C1.09 12.032 1.5 8.5 4.8 7.2 7.2 6.22 9.217 7.42 10 8.4 10.783 7.42 12.8 6.22 15.2 7.2c3.3 1.3 3.71 4.833 1.993 6.557C18.716 16.923 12 21 12 21z" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              className="truncate select-none"
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '-0.02em',
                color: '#111827',
                marginLeft: 0
              }}
            >
              Helio
            </span>
          </div>

          {/* Logout - flush right, minimal red icon + text like the provided image */}
          {user && onLogout && (
            <div className="mr-0 pr-0" style={{ paddingRight: 0 }}>
              <button
                onClick={onLogout}
                title={t('logout')}
                aria-label={t('logout')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 36,
                  padding: '0 8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626', // red-600
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                <FiLogOut style={{ fontSize: 18, color: '#dc2626' }} />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
