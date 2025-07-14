import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, ChevronDownIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'supervisor': return 'مشرف';
      case 'sales': return 'مبيعات';
      case 'user': return 'مستخدم';
      default: return 'مستخدم';
    }
  };

  const handleUserProfile = () => {
    setShowUserMenu(false);
    navigate('/user-profile');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Right side - Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="mr-4 text-xl font-semibold text-secondary-900">
            نظام إدارة الموارد - HCP
          </h1>
        </div>

        {/* Left side - Notifications and user info */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-md">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User info */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">
                  {currentUser?.email || 'مستخدم'}
                </p>
                <p className="text-xs text-secondary-500">{getRoleDisplayName(userRole)}</p>
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-secondary-400" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-secondary-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleUserProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <UserIcon className="w-4 h-4 ml-2" />
                    الملف الشخصي
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <CogIcon className="w-4 h-4 ml-2" />
                      إعدادات النظام
                    </button>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
