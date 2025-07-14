import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Customers = () => {
  const { hasPermission, currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    type: '',
    discountRate: 0,
    email: '',
    notes: ''
  });

  const customerTypes = ['مؤسسات/مشاريع', 'محلات تجارية', 'أفراد'];

  // Sample data
  useEffect(() => {
    const sampleCustomers = [
      {
        id: 1,
        name: 'أحمد محمد علي',
        phone: '0501234567',
        address: 'الرياض، حي النخيل، شارع الملك فهد',
        type: 'أفراد',
        discountRate: 5,
        email: 'ahmed@example.com',
        notes: 'عميل مميز',
        totalOrders: 15,
        totalAmount: 45000,
        lastOrderDate: '2024-01-15',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-01'),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 2,
        name: 'شركة البناء الحديث',
        phone: '0112345678',
        address: 'جدة، حي الصفا، طريق الملك عبدالعزيز',
        type: 'مؤسسات/مشاريع',
        discountRate: 15,
        email: 'info@modernbuild.com',
        notes: 'شركة مقاولات كبيرة',
        totalOrders: 45,
        totalAmount: 180000,
        lastOrderDate: '2024-01-20',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2023-12-15'),
        updatedBy: null,
        updatedAt: null
      }
    ];
    setCustomers(sampleCustomers);
    setFilteredCustomers(sampleCustomers);
  }, []);

  // Filter customers
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(customer => customer.type === selectedType);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update customer
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              ...formData,
              updatedBy: currentUser.email,
              updatedAt: new Date()
            }
          : customer
      );
      setCustomers(updatedCustomers);
      toast.success('تم تحديث العميل بنجاح');
    } else {
      // Add new customer
      const newCustomer = {
        ...formData,
        id: Date.now(),
        totalOrders: 0,
        totalAmount: 0,
        lastOrderDate: null,
        createdBy: currentUser.email,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      };
      setCustomers([...customers, newCustomer]);
      toast.success('تم إضافة العميل بنجاح');
    }

    resetForm();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      discountRate: customer.discountRate,
      email: customer.email,
      notes: customer.notes
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setCustomers(customers.filter(customer => customer.id !== id));
      toast.success('تم حذف العميل بنجاح');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      type: '',
      discountRate: 0,
      email: '',
      notes: ''
    });
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'مؤسسات/مشاريع':
        return 'bg-primary-100 text-primary-800';
      case 'محلات تجارية':
        return 'bg-green-100 text-green-800';
      case 'أفراد':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة العملاء</h1>
        {hasPermission('User') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            إضافة عميل جديد
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث في العملاء..."
              className="input-field pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="input-field"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">جميع الأنواع</option>
            {customerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex space-x-2 space-x-reverse">
            <button className="btn-secondary flex items-center">
              <PrinterIcon className="w-4 h-4 ml-2" />
              طباعة
            </button>
            <button className="btn-secondary flex items-center">
              <DocumentArrowDownIcon className="w-4 h-4 ml-2" />
              تصدير
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">اسم العميل</th>
              <th className="table-header">رقم الهاتف</th>
              <th className="table-header">النوع</th>
              <th className="table-header">معدل الخصم</th>
              <th className="table-header">إجمالي الطلبات</th>
              <th className="table-header">إجمالي المبلغ</th>
              <th className="table-header">آخر طلب</th>
              <th className="table-header">تم الإنشاء بواسطة</th>
              <th className="table-header">آخر تعديل</th>
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-secondary-50">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-secondary-900">{customer.name}</div>
                    <div className="text-sm text-secondary-500">{customer.email}</div>
                  </div>
                </td>
                <td className="table-cell">{customer.phone}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(customer.type)}`}>
                    {customer.type}
                  </span>
                </td>
                <td className="table-cell">{customer.discountRate}%</td>
                <td className="table-cell">{customer.totalOrders}</td>
                <td className="table-cell">{customer.totalAmount.toLocaleString()} ر.س</td>
                <td className="table-cell">
                  {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('ar-SA') : '-'}
                </td>
                <td className="table-cell text-xs">{customer.createdBy}</td>
                <td className="table-cell text-xs">
                  {customer.updatedBy ? `${customer.updatedBy}` : '-'}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-primary-600 hover:text-primary-900"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {hasPermission('User') && (
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-green-600 hover:text-green-900"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('Supervisor') && (
                      <button
                        onClick={() => handleDelete(customer.id)}
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

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                اسم العميل *
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
                رقم الهاتف *
              </label>
              <input
                type="tel"
                required
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                النوع *
              </label>
              <select
                required
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="">اختر النوع</option>
                {customerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                معدل الخصم (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                value={formData.discountRate}
                onChange={(e) => setFormData({...formData, discountRate: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              العنوان *
            </label>
            <textarea
              required
              rows={2}
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              ملاحظات
            </label>
            <textarea
              rows={3}
              className="input-field"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {/* Submit Buttons */}
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
              {editingCustomer ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
