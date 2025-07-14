import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { currentUser, userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    name: currentUser?.displayName || currentUser?.email?.split('@')[0] || '',
    email: currentUser?.email || '',
    phone: '',
    department: '',
    joinDate: '2024-01-01'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'supervisor': return 'مشرف';
      case 'sales': return 'موظف مبيعات';
      case 'user': return 'مستخدم';
      default: return 'مستخدم';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'sales': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveProfile = () => {
    // Validate data
    if (!userData.name.trim()) {
      toast.error('يرجى إدخال الاسم');
      return;
    }

    // Save profile data (in real app, this would be an API call)
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setIsEditing(false);
    toast.success('تم حفظ البيانات بنجاح');
  };

  const handleChangePassword = () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('يرجى ملء جميع حقول كلمة المرور');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    // Change password (in real app, this would be an API call)
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('تم تغيير كلمة المرور بنجاح');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">الملف الشخصي</h1>
        <p className="text-secondary-600">إدارة بياناتك الشخصية وإعدادات الحساب</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">
                {userData.name || 'مستخدم'}
              </h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </span>
              <p className="text-sm text-secondary-500 mt-2">{userData.email}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-secondary-600">
                <EnvelopeIcon className="w-4 h-4 ml-2" />
                {userData.email}
              </div>
              {userData.phone && (
                <div className="flex items-center text-sm text-secondary-600">
                  <span className="w-4 h-4 ml-2">📱</span>
                  {userData.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-secondary-600">
                <ShieldCheckIcon className="w-4 h-4 ml-2" />
                عضو منذ: {new Date(userData.joinDate).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">البيانات الشخصية</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="w-4 h-4 ml-1" />
                  تعديل
                </button>
              ) : (
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex items-center"
                  >
                    <CheckIcon className="w-4 h-4 ml-1" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex items-center"
                  >
                    <XMarkIcon className="w-4 h-4 ml-1" />
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  الاسم الكامل
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-secondary-900 py-2">{userData.name || 'غير محدد'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  البريد الإلكتروني
                </label>
                <p className="text-sm text-secondary-500 py-2">{userData.email} (غير قابل للتعديل)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  رقم الهاتف
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="input-field"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-secondary-900 py-2">{userData.phone || 'غير محدد'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  القسم
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-secondary-900 py-2">{userData.department || 'غير محدد'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">تغيير كلمة المرور</h3>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn-secondary flex items-center"
                >
                  <KeyIcon className="w-4 h-4 ml-1" />
                  تغيير كلمة المرور
                </button>
              ) : (
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={handleChangePassword}
                    className="btn-primary flex items-center"
                  >
                    <CheckIcon className="w-4 h-4 ml-1" />
                    تأكيد
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="btn-secondary flex items-center"
                  >
                    <XMarkIcon className="w-4 h-4 ml-1" />
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
