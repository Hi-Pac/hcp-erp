import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, userRole, hasPermission } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'لوحة التحكم',
      href: '/dashboard',
      icon: HomeIcon,
      permission: 'User'
    },
    {
      name: 'المبيعات',
      href: '/sales',
      icon: ShoppingCartIcon,
      permission: 'User'
    },
    {
      name: 'العملاء',
      href: '/customers',
      icon: UsersIcon,
      permission: 'User'
    },
    {
      name: 'المخزون',
      href: '/inventory',
      icon: CubeIcon,
      permission: 'User'
    },
    {
      name: 'الحسابات',
      href: '/accounting',
      icon: CurrencyDollarIcon,
      permission: 'User'
    },
    {
      name: 'المستخدمين',
      href: '/users',
      icon: UserGroupIcon,
      permission: 'Admin'
    },
    {
      name: 'التقارير',
      href: '/reports',
      icon: DocumentTextIcon,
      permission: 'User'
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="mr-3 text-xl font-bold text-secondary-900">HCP ERP</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {userRole?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-secondary-900">مستخدم النظام</p>
                <p className="text-xs text-secondary-500">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              if (!hasPermission(item.permission)) return null;
              
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 ml-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-secondary-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 ml-3" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
