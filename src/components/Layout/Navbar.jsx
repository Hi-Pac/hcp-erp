import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  const { currentUser, userRole } = useAuth();

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
          <div className="flex items-center">
            <div className="text-left ml-3">
              <p className="text-sm font-medium text-secondary-900">
                {currentUser?.email || 'مستخدم'}
              </p>
              <p className="text-xs text-secondary-500">{userRole}</p>
            </div>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
