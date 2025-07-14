import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-secondary-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={`
          inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-right align-middle 
          transition-all transform bg-white shadow-xl rounded-lg
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-md"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
