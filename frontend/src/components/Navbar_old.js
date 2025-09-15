import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaPills, FaCalendarAlt, FaUser, FaCog, FaBars, FaTimes, FaStethoscope, FaBell } from 'react-icons/fa';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/medicines', label: 'Medicines', icon: FaPills, requiresAuth: true },
    { path: '/schedule', label: 'Appointments', icon: FaCalendarAlt, requiresAuth: true },
    { path: '/profile', label: 'Profile', icon: FaUser, requiresAuth: true },
    { path: '/settings', label: 'Settings', icon: FaCog }
  ];

  // Filter nav items based on authentication status
  const visibleNavItems = navItems.filter(item => !item.requiresAuth || isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <FaStethoscope className="text-2xl" />
              <span>Medicure</span>
            </Link>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <FaBell className="text-lg" />
                </button>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="max-w-md mx-auto">
          <div className="flex">
            {visibleNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="text-lg mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* More/Menu button */}
            <button
              onClick={toggleMobileMenu}
              className="flex-1 flex flex-col items-center justify-center py-3 px-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaBars className="text-lg mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block fixed top-16 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-8 py-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-auto px-4 py-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
            <span>{t('app_title').split(' - ')[0]}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-light text-primary-color'
                      : 'text-gray-600 hover:text-primary-color hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500 capitalize">{user?.user_type}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-color hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="py-4 space-y-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary-color'
                        : 'text-gray-600 hover:text-primary-color hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile user info and actions */}
              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2">
                      <div className="font-medium text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{user?.user_type}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 mx-4 btn btn-outline"
                      style={{ width: 'calc(100% - 2rem)' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full mt-2 mx-4 btn btn-primary"
                    style={{ width: 'calc(100% - 2rem)' }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;