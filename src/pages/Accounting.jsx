import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Accounting = () => {
  const { hasPermission, currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    paymentMethod: '',
    orderNumber: '',
    notes: ''
  });

  const paymentMethods = ['نقدي', 'تحويل بنكي', 'فودافون كاش', 'شيك'];

  // Sample data
  useEffect(() => {
    const samplePayments = [
      {
        id: 1,
        customerName: 'أحمد محمد علي',
        customerId: 1,
        amount: 150.00,
        paymentMethod: 'فودافون كاش',
        orderNumber: 'ORD-2024-001',
        date: '2024-01-15',
        notes: 'دفعة مقدمة',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        customerName: 'شركة البناء الحديث',
        customerId: 2,
        amount: 500.00,
        paymentMethod: 'تحويل بنكي',
        orderNumber: '',
        date: '2024-01-20',
        notes: 'دفعة على الحساب',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-20')
      }
    ];
    setPayments(samplePayments);
    setFilteredPayments(samplePayments);
  }, []);

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(payment => new Date(payment.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(payment => new Date(payment.date) <= new Date(dateTo));
    }

    if (selectedCustomer) {
      filtered = filtered.filter(payment => payment.customerName === selectedCustomer);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, dateFrom, dateTo, selectedCustomer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPayment = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      createdBy: currentUser.email,
      createdAt: new Date()
    };

    setPayments([...payments, newPayment]);
    toast.success('تم تسجيل الدفعة بنجاح');
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      amount: '',
      paymentMethod: '',
      orderNumber: '',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const getUniqueCustomers = () => {
    return [...new Set(payments.map(payment => payment.customerName))];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة الحسابات والمدفوعات</h1>
        {hasPermission('User') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            تسجيل دفعة جديدة
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-secondary-900">
                {payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">عدد المعاملات</p>
              <p className="text-2xl font-bold text-secondary-900">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">متوسط الدفعة</p>
              <p className="text-2xl font-bold text-secondary-900">
                {payments.length > 0 ? (payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length).toFixed(2) : 0} ر.س
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث في المدفوعات..."
              className="input-field pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date From */}
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="date"
              className="input-field pr-10"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="date"
              className="input-field pr-10"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Customer Filter */}
          <select
            className="input-field"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">جميع العملاء</option>
            {getUniqueCustomers().map(customer => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">العميل</th>
              <th className="table-header">المبلغ</th>
              <th className="table-header">طريقة الدفع</th>
              <th className="table-header">رقم الطلب</th>
              <th className="table-header">التاريخ</th>
              <th className="table-header">الملاحظات</th>
              <th className="table-header">تم التسجيل بواسطة</th>
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-secondary-50">
                <td className="table-cell font-medium">{payment.customerName}</td>
                <td className="table-cell font-bold text-green-600">{payment.amount.toFixed(2)} ر.س</td>
                <td className="table-cell">{payment.paymentMethod}</td>
                <td className="table-cell">{payment.orderNumber || '-'}</td>
                <td className="table-cell">{new Date(payment.date).toLocaleDateString('ar-SA')}</td>
                <td className="table-cell">{payment.notes || '-'}</td>
                <td className="table-cell text-xs">{payment.createdBy}</td>
                <td className="table-cell">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="عرض التفاصيل"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title="تسجيل دفعة جديدة"
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
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                المبلغ *
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="input-field"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                طريقة الدفع *
              </label>
              <select
                required
                className="input-field"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="">اختر طريقة الدفع</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                رقم الطلب (اختياري)
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.orderNumber}
                onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              />
            </div>
          </div>

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
              تسجيل الدفعة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounting;
