import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const Sales = () => {
  const { hasPermission, currentUser } = useAuth();
  const { customers, products, sales, addSale, deleteSale, getCustomerById, getProductById } = useData();
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Form data for new invoice
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerId: '',
    customerName: '',
    items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: '',
    hasDeposit: false,
    depositAmount: 0,
    depositMethod: '',
    notes: ''
  });

  const paymentMethods = [
    'تحصيل جزئي مقدم + باقي مع المندوب',
    'دفع كامل مقدماً',
    'تحصيل كامل عند التسليم',
    'آجل كامل'
  ];

  const depositMethods = ['فودافون كاش', 'نقداً', 'تحويل بنكي', 'شيك'];

  const invoiceStatuses = ['مسودة', 'مؤكد', 'قيد التنفيذ', 'مكتمل', 'ملغي'];

  // Calculate totals automatically
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const total = subtotal - formData.discount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal,
      total: total
    }));
  }, [formData.items, formData.discount]);

  // Sample data
  useEffect(() => {
    const sampleInvoices = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        customerName: 'أحمد محمد علي',
        customerId: 1,
        date: '2024-01-15',
        items: [
          { productName: 'دهان أبيض مطفي', quantity: 5, unitPrice: 45.50 },
          { productName: 'دهان أزرق خارجي', quantity: 2, unitPrice: 52.00 }
        ],
        subtotal: 331.50,
        discount: 16.58,
        total: 314.92,
        paymentMethod: 'تحصيل جزئي مقدم + باقي مع المندوب',
        hasDeposit: true,
        depositAmount: 150,
        depositMethod: 'فودافون كاش',
        status: 'مؤكد',
        notes: 'طلب عاجل',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-15'),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        customerName: 'شركة البناء الحديث',
        customerId: 2,
        date: '2024-01-20',
        items: [
          { productName: 'دهان أبيض مطفي', quantity: 20, unitPrice: 45.50 }
        ],
        subtotal: 910.00,
        discount: 136.50,
        total: 773.50,
        paymentMethod: 'آجل كامل',
        hasDeposit: false,
        depositAmount: 0,
        depositMethod: '',
        status: 'قيد التنفيذ',
        notes: 'مشروع كبير',
        createdBy: 'admin@hcp.com',
        createdAt: new Date('2024-01-20'),
        updatedBy: null,
        updatedAt: null
      }
    ];
    // استخدام البيانات من Supabase بدلاً من البيانات التجريبية
    // setInvoices(sampleInvoices);
    // setFilteredInvoices(sampleInvoices);
  }, []);

  // Filter invoices - استخدام sales بدلاً من invoices
  useEffect(() => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(invoice => new Date(invoice.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(invoice => new Date(invoice.date) <= new Date(dateTo));
    }

    if (selectedStatus) {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }

    setFilteredInvoices(filtered);
  }, [sales, searchTerm, dateFrom, dateTo, selectedStatus]);

  // Calculate totals and auto-update discount based on customer percentage
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Auto-calculate discount if customer has discount percentage
    let discount = formData.discount;
    if (formData.customerId) {
      const selectedCustomer = getCustomerById(formData.customerId);
      if (selectedCustomer && selectedCustomer.discount) {
        discount = (subtotal * selectedCustomer.discount) / 100;
      }
    }

    const total = subtotal - discount;
    setFormData(prev => ({ ...prev, subtotal, discount, total }));
  }, [formData.items, formData.customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const saleData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        totalAmount: formData.subtotal,
        discountAmount: formData.discount,
        finalAmount: formData.total,
        paymentStatus: formData.paymentMethod === 'دفع كامل مقدماً' ? 'paid' : 'pending',
        notes: formData.notes,
        createdBy: currentUser.email,
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      await addSale(saleData);
      resetForm();
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      customerId: '',
      customerName: '',
      items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }],
      subtotal: 0,
      discount: 0,
      total: 0,
      paymentMethod: '',
      hasDeposit: false,
      depositAmount: 0,
      depositMethod: '',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', productName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems.length > 0 ? newItems : [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];

    if (field === 'productId') {
      // When product is selected, update product name and price
      const selectedProduct = getProductById(value);
      if (selectedProduct) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    setFormData({ ...formData, items: newItems });
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    const selectedCustomer = getCustomerById(customerId);

    setFormData(prev => {
      const newFormData = {
        ...prev,
        customerId: customerId,
        customerName: selectedCustomer ? selectedCustomer.name : '',
      };

      // Calculate discount based on customer's discount percentage
      if (selectedCustomer && selectedCustomer.discount) {
        const discountPercentage = selectedCustomer.discount;
        const subtotal = newFormData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const discountAmount = (subtotal * discountPercentage) / 100;
        newFormData.discount = discountAmount;
      } else {
        newFormData.discount = 0;
      }

      return newFormData;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مسودة':
        return 'bg-secondary-100 text-secondary-800';
      case 'مؤكد':
        return 'bg-primary-100 text-primary-800';
      case 'قيد التنفيذ':
        return 'bg-yellow-100 text-yellow-800';
      case 'مكتمل':
        return 'bg-green-100 text-green-800';
      case 'ملغي':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة المبيعات</h1>
        {hasPermission('User') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            إنشاء فاتورة جديدة
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث في الفواتير..."
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

          {/* Status Filter */}
          <select
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            {invoiceStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
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

      {/* Invoices Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">رقم الطلب</th>
              <th className="table-header">العميل</th>
              <th className="table-header">التاريخ</th>
              <th className="table-header">المبلغ الإجمالي</th>
              <th className="table-header">طريقة الدفع</th>
              <th className="table-header">الحالة</th>
              <th className="table-header">تم الإنشاء بواسطة</th>
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-secondary-50">
                <td className="table-cell font-medium">{invoice.orderNumber}</td>
                <td className="table-cell">{invoice.customerName}</td>
                <td className="table-cell">{new Date(invoice.date).toLocaleDateString('ar-SA')}</td>
                <td className="table-cell font-medium">{(invoice.total || 0).toFixed(2)} ج.م</td>
                <td className="table-cell text-sm">{invoice.paymentMethod}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="table-cell text-xs">{invoice.createdBy}</td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      title="طباعة الفاتورة"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title="إنشاء فاتورة جديدة"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                اسم العميل *
              </label>
              <select
                required
                className="input-field"
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                <option value="">اختر العميل</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">المنتجات</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary text-sm"
              >
                + إضافة منتج
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="p-3 border border-secondary-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <select
                      className="input-field"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">اختر المنتج</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="الكمية"
                      min="1"
                      className="input-field"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="سعر الوحدة"
                      step="0.01"
                      className="input-field bg-secondary-50"
                      value={item.unitPrice}
                      readOnly
                      title="السعر يتم تحديده تلقائياً عند اختيار المنتج"
                    />
                  </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)} ج.م
                      </span>
                    </div>
                    <div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Notes */}
                  <div>
                    <input
                      type="text"
                      placeholder="ملاحظات الصنف (اختياري)"
                      className="input-field"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  المبلغ قبل الخصم
                </label>
                <input
                  type="text"
                  readOnly
                  className="input-field bg-secondary-100"
                  value={`${(formData.subtotal || 0).toFixed(2)} ج.م`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  الخصم (ج.م)
                  {formData.customerId && (() => {
                    const customer = getCustomerById(formData.customerId);
                    return customer && customer.discount ? (
                      <span className="text-xs text-primary-600 block">
                        (خصم تلقائي {customer.discount}%)
                      </span>
                    ) : null;
                  })()}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  المبلغ الإجمالي
                </label>
                <input
                  type="text"
                  readOnly
                  className="input-field bg-secondary-100 font-bold"
                  value={`${(formData.total || 0).toFixed(2)} ج.م`}
                />
              </div>
            </div>
          </div>

          {/* Deposit */}
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasDeposit"
                className="ml-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                checked={formData.hasDeposit || false}
                onChange={(e) => {
                  console.log('Checkbox changed:', e.target.checked);
                  setFormData(prev => ({...prev, hasDeposit: e.target.checked}));
                }}
              />
              <label htmlFor="hasDeposit" className="text-sm font-medium text-secondary-700 cursor-pointer">
                إيداع / عربون مقدم
              </label>
            </div>
            
            {formData.hasDeposit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    مبلغ الإيداع
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({...formData, depositAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    طريقة الإيداع
                  </label>
                  <select
                    className="input-field"
                    value={formData.depositMethod}
                    onChange={(e) => setFormData({...formData, depositMethod: e.target.value})}
                  >
                    <option value="">اختر طريقة الإيداع</option>
                    {depositMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
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
              إنشاء الفاتورة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
