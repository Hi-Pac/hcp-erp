import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Users = () => {
  const { hasPermission, currentUser, register } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });

  const roles = ['Admin', 'Supervisor', 'User'];

  // Sample data
  useEffect(() => {
    const sampleUsers = [
      {
        id: 1,
        name: 'مدير النظام',
        email: 'admin@hcp.com',
        role: 'Admin',
        isActive: true,
        lastLogin: '2024-01-20',
        createdBy: 'system',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'مشرف المبيعات',
        email: 'supervisor@hcp.com',
        role: 'Supervisor',
        isActive: true,
        lastLogin: '2024-01-19',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-05')
      },
      {
        id: 3,
        name: 'موظف المبيعات',
        email: 'user@hcp.com',
        role: 'User',
        isActive: true,
        lastLogin: '2024-01-18',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-10')
      }
    ];
    setUsers(sampleUsers);
    setFilteredUsers(sampleUsers);
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update user
      const updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role
            }
          : user
      );
      setUsers(updatedUsers);
      toast.success('تم تحديث المستخدم بنجاح');
    } else {
      // Add new user
      try {
        await register(formData.email, formData.password, {
          name: formData.name,
          role: formData.role
        });
        
        const newUser = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: true,
          lastLogin: null,
          createdBy: currentUser.email,
          createdAt: new Date()
        };
        
        setUsers([...users, newUser]);
        toast.success('تم إضافة المستخدم بنجاح');
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(user => user.id !== id));
      toast.success('تم حذف المستخدم بنجاح');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'User'
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Supervisor':
        return 'bg-primary-100 text-primary-800';
      case 'User':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'Admin':
        return 'مدير';
      case 'Supervisor':
        return 'مشرف';
      case 'User':
        return 'مستخدم';
      default:
        return role;
    }
  };

  if (!hasPermission('Admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">غير مصرح</h2>
          <p className="text-secondary-600">ليس لديك صلاحية للوصول إلى إدارة المستخدمين</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة المستخدمين</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <UserIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-secondary-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">المستخدمين النشطين</p>
              <p className="text-2xl font-bold text-secondary-900">
                {users.filter(user => user.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <UserIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">المديرين</p>
              <p className="text-2xl font-bold text-secondary-900">
                {users.filter(user => user.role === 'Admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث في المستخدمين..."
              className="input-field pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select
            className="input-field"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">جميع الأدوار</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleText(role)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">الاسم</th>
              <th className="table-header">البريد الإلكتروني</th>
              <th className="table-header">الدور</th>
              <th className="table-header">الحالة</th>
              <th className="table-header">آخر دخول</th>
              <th className="table-header">تم الإنشاء بواسطة</th>
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary-50">
                <td className="table-cell">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ml-3">
                      <span className="text-primary-600 font-medium text-sm">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="table-cell">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-SA') : '-'}
                </td>
                <td className="table-cell text-xs">{user.createdBy}</td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary-600 hover:text-primary-900"
                      title="تعديل"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {user.email !== currentUser.email && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              الاسم *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={editingUser}
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                كلمة المرور *
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              الدور *
            </label>
            <select
              required
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              {roles.map(role => (
                <option key={role} value={role}>{getRoleText(role)}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingUser ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
