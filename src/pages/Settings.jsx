import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { hasPermission, currentUser } = useAuth();
  const [settings, setSettings] = useState({
    currency: 'EGP',
    currencySymbol: 'ج.م',
    autoLogoutTime: 30, // minutes
    companyName: 'شركة دلتا للدهانات الحديثة',
    companyAddress: 'القاهرة، مصر',
    companyPhone: '01234567890',
    companyEmail: 'info@deltapaints.com',
    taxNumber: '123456789',
    language: 'ar',
    notifications: {
      lowStock: true,
      newOrders: true,
      paymentDue: true,
      systemUpdates: false
    },
    orderStatuses: [
      { id: 1, name: 'تم تقديم الطلب', color: 'blue', active: true },
      { id: 2, name: 'قيد التشغيل', color: 'yellow', active: true },
      { id: 3, name: 'مؤجل', color: 'red', active: true },
      { id: 4, name: 'تم الشحن', color: 'purple', active: true },
      { id: 5, name: 'تم التسليم', color: 'green', active: true },
      { id: 6, name: 'ملغي', color: 'gray', active: true }
    ]
  });

  const [activeTab, setActiveTab] = useState('general');
  const [users, setUsers] = useState([
    { id: 1, name: 'أحمد محمد', email: 'admin@hcp.com', role: 'admin', active: true, lastLogin: new Date() },
    { id: 2, name: 'سارة أحمد', email: 'supervisor@hcp.com', role: 'supervisor', active: true, lastLogin: new Date() },
    { id: 3, name: 'محمد علي', email: 'sales@hcp.com', role: 'sales', active: true, lastLogin: new Date() },
    { id: 4, name: 'فاطمة حسن', email: 'user@hcp.com', role: 'user', active: false, lastLogin: new Date() }
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  });

  const currencies = [
    { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
    { code: 'EUR', name: 'يورو', symbol: '€' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' }
  ];

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' }
  ];

  const autoLogoutOptions = [
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 60, label: '60 دقيقة' },
    { value: 120, label: '120 دقيقة' },
    { value: 0, label: 'بدون خروج تلقائي' }
  ];

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('hcp-erp-settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('hcp-erp-settings', JSON.stringify(settings));
    localStorage.setItem('systemSettings', JSON.stringify(settings)); // For compatibility
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const userExists = users.some(user => user.email === newUser.email);
    if (userExists) {
      toast.error('البريد الإلكتروني مستخدم بالفعل');
      return;
    }

    const user = {
      id: users.length + 1,
      ...newUser,
      lastLogin: new Date()
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', role: 'user', active: true });
    setShowAddUser(false);
    toast.success('تم إضافة المستخدم بنجاح');
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, active: !user.active } : user
    ));
    toast.success('تم تحديث حالة المستخدم');
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('تم حذف المستخدم');
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'supervisor': return 'مشرف';
      case 'sales': return 'مبيعات';
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

  const handleCurrencyChange = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    setSettings(prev => ({
      ...prev,
      currency: currency.code,
      currencySymbol: currency.symbol
    }));
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleOrderStatusChange = (statusId, field, value) => {
    setSettings(prev => ({
      ...prev,
      orderStatuses: prev.orderStatuses.map(status =>
        status.id === statusId ? { ...status, [field]: value } : status
      )
    }));
  };

  const tabs = [
    { id: 'general', name: 'عام', icon: CogIcon },
    { id: 'company', name: 'بيانات الشركة', icon: DocumentTextIcon },
    { id: 'currency', name: 'العملة', icon: CurrencyDollarIcon },
    { id: 'security', name: 'الأمان', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'الإشعارات', icon: BellIcon },
    { id: 'orders', name: 'حالات الطلبات', icon: ClockIcon },
    ...(hasPermission('Admin') ? [{ id: 'users', name: 'إدارة المستخدمين', icon: UserIcon }] : [])
  ];

  if (!hasPermission('Supervisor')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">غير مصرح</h3>
          <p className="text-secondary-500">ليس لديك صلاحية للوصول إلى الإعدادات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">إعدادات النظام</h1>
        <p className="text-secondary-600 mt-1">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">الإعدادات العامة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      اللغة
                    </label>
                    <select
                      className="input-field"
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      وقت الخروج التلقائي
                    </label>
                    <select
                      className="input-field"
                      value={settings.autoLogoutTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoLogoutTime: parseInt(e.target.value) }))}
                    >
                      {autoLogoutOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Settings */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">بيانات الشركة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={settings.companyName}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      الرقم الضريبي
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={settings.taxNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    عنوان الشركة
                  </label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Currency Settings */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">إعدادات العملة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      العملة الأساسية
                    </label>
                    <select
                      className="input-field"
                      value={settings.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      رمز العملة
                    </label>
                    <input
                      type="text"
                      className="input-field bg-secondary-50"
                      value={settings.currencySymbol}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">إعدادات الأمان</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-secondary-900">الخروج التلقائي</h4>
                      <p className="text-sm text-secondary-600">
                        خروج تلقائي بعد {settings.autoLogoutTime === 0 ? 'بدون حد زمني' : `${settings.autoLogoutTime} دقيقة`} من عدم النشاط
                      </p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">إعدادات الإشعارات</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => {
                    const labels = {
                      lowStock: 'تنبيه نفاد المخزون',
                      newOrders: 'طلبات جديدة',
                      paymentDue: 'مواعيد الدفع',
                      systemUpdates: 'تحديثات النظام'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-secondary-900">{labels[key]}</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Order Status Settings */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">إدارة حالات الطلبات</h3>
                
                <div className="space-y-4">
                  {settings.orderStatuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-4 h-4 rounded-full bg-${status.color}-500`}></div>
                        <input
                          type="text"
                          className="input-field w-48"
                          value={status.name}
                          onChange={(e) => handleOrderStatusChange(status.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <select
                          className="input-field w-32"
                          value={status.color}
                          onChange={(e) => handleOrderStatusChange(status.id, 'color', e.target.value)}
                        >
                          <option value="blue">أزرق</option>
                          <option value="yellow">أصفر</option>
                          <option value="red">أحمر</option>
                          <option value="purple">بنفسجي</option>
                          <option value="green">أخضر</option>
                          <option value="gray">رمادي</option>
                        </select>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={status.active}
                            onChange={(e) => handleOrderStatusChange(status.id, 'active', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && hasPermission('Admin') && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-secondary-900">إدارة المستخدمين</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="btn-primary"
                >
                  إضافة مستخدم جديد
                </button>
              </div>

              {/* Add User Modal */}
              {showAddUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h4 className="text-lg font-medium text-secondary-900 mb-4">إضافة مستخدم جديد</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">الاسم</label>
                        <input
                          type="text"
                          className="input-field"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">البريد الإلكتروني</label>
                        <input
                          type="email"
                          className="input-field"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">كلمة المرور</label>
                        <input
                          type="password"
                          className="input-field"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">الدور</label>
                        <select
                          className="input-field"
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                          <option value="user">مستخدم</option>
                          <option value="sales">مبيعات</option>
                          <option value="supervisor">مشرف</option>
                          <option value="admin">مدير</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                      <button
                        onClick={() => setShowAddUser(false)}
                        className="btn-secondary"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleAddUser}
                        className="btn-primary"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">المستخدم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">الدور</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">آخر دخول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-secondary-900">{user.name}</div>
                              <div className="text-sm text-secondary-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {user.lastLogin.toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`${user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {user.active ? 'تعطيل' : 'تفعيل'}
                            </button>
                            {user.email !== currentUser?.email && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                حذف
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-secondary-200">
            <button
              onClick={handleSaveSettings}
              className="btn-primary"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
