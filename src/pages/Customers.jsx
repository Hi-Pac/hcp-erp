import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const Customers = () => {
  const { hasPermission, currentUser } = useAuth();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    customerType: '',
    creditLimit: '',
    email: '',
    notes: ''
  });

  const customerTypes = ['فرد', 'شركة', 'مؤسسة'];

  // Initialize filtered customers
  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

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
      filtered = filtered.filter(customer => customer.customerType === selectedType);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update customer
      const updatedCustomerData = {
        ...formData,
        updatedBy: currentUser.email,
        createdBy: editingCustomer.createdBy,
        createdAt: editingCustomer.createdAt,
        currentBalance: editingCustomer.currentBalance || 0
      };
      updateCustomer(editingCustomer.id, updatedCustomerData);
      toast.success('تم تحديث العميل بنجاح');
    } else {
      // Add new customer
      const newCustomerData = {
        ...formData,
        createdBy: currentUser.email,
        currentBalance: 0
      };
      addCustomer(newCustomerData);
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
      city: customer.city,
      customerType: customer.customerType,
      creditLimit: customer.creditLimit,
      email: customer.email,
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(id);
      toast.success('تم حذف العميل بنجاح');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      customerType: '',
      creditLimit: '',
      email: '',
      notes: ''
    });
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'شركة':
        return 'bg-primary-100 text-primary-800';
      case 'مؤسسة':
        return 'bg-green-100 text-green-800';
      case 'فرد':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة العملاء</h1>
        {hasPermission('Manager') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إضافة عميل جديد</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-secondary-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف، أو البريد الإلكتروني..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <select
              className="input-field pl-10"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">جميع الأنواع</option>
              {customerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2 space-x-reverse">
            <button className="btn-secondary flex items-center space-x-2 space-x-reverse">
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>تصدير</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2 space-x-reverse">
              <PrinterIcon className="w-4 h-4" />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">اسم العميل</th>
              <th className="table-header">رقم الهاتف</th>
              <th className="table-header">المدينة</th>
              <th className="table-header">النوع</th>
              <th className="table-header">حد الائتمان</th>
              <th className="table-header">الرصيد الحالي</th>
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
                <td className="table-cell">{customer.city}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(customer.customerType)}`}>
                    {customer.customerType}
                  </span>
                </td>
                <td className="table-cell">{customer.creditLimit?.toLocaleString()} ر.س</td>
                <td className="table-cell">{customer.currentBalance?.toLocaleString()} ر.س</td>
                <td className="table-cell text-xs">{customer.createdBy}</td>
                <td className="table-cell text-xs">
                  {customer.updatedBy ? `${customer.updatedBy}` : '-'}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-primary-600 hover:text-primary-900"
                      title="تعديل"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
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
                value={formData.customerType}
                onChange={(e) => setFormData({...formData, customerType: e.target.value})}
              >
                <option value="">اختر النوع</option>
                {customerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                المدينة *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                حد الائتمان (ر.س)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={formData.creditLimit}
                onChange={(e) => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})}
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
              {editingCustomer ? 'تحديث العميل' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
