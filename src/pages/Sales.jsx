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
    items: [{ productId: '', productName: '', productCode: '', quantity: 1, unitPrice: 0 }],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: '',
    orderStatus: 'معلق', // الحالة الافتراضية
    notes: ''
  });

  const paymentMethods = [
    'تحصيل مقدم + الباقى مع المندوب',
    'دفع كامل مقدما',
    'تحصيل كامل عند التسليم',
    'آجل بالكامل'
  ];

  const orderStatuses = [
    'معلق',
    'تم تقديم الطلب',
    'قيد التشغيل',
    'مؤجل',
    'تم الشحن',
    'تم التسليم',
    'ملغي'
  ];

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
        (invoice.order_number || invoice.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer_name || invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(invoice => new Date(invoice.created_at || invoice.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(invoice => new Date(invoice.created_at || invoice.date) <= new Date(dateTo));
    }

    if (selectedStatus) {
      filtered = filtered.filter(invoice =>
        (invoice.order_status || invoice.orderStatus) === selectedStatus
      );
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
        paymentMethod: formData.paymentMethod,
        orderStatus: formData.orderStatus,
        paymentStatus: formData.paymentMethod === 'دفع كامل مقدما' ? 'paid' : 'pending',
        notes: formData.notes,
        createdBy: currentUser.email,
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      const newSale = await addSale(saleData);
      resetForm();

      // Show success message and suggest going to order tracking
      toast.success('تم حفظ الفاتورة بنجاح! يمكنك متابعة حالة الطلب من صفحة تتبع الطلبات', {
        duration: 4000
      });

    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      customerId: '',
      customerName: '',
      items: [{ productId: '', productName: '', productCode: '', quantity: 1, unitPrice: 0 }],
      subtotal: 0,
      discount: 0,
      total: 0,
      paymentMethod: '',
      orderStatus: 'معلق',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', productName: '', productCode: '', quantity: 1, unitPrice: 0 }]
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
      case 'معلق':
        return 'bg-yellow-100 text-yellow-800';
      case 'تم تقديم الطلب':
        return 'bg-blue-100 text-blue-800';
      case 'قيد التشغيل':
        return 'bg-orange-100 text-orange-800';
      case 'مؤجل':
        return 'bg-gray-100 text-gray-800';
      case 'تم الشحن':
        return 'bg-purple-100 text-purple-800';
      case 'تم التسليم':
        return 'bg-green-100 text-green-800';
      case 'ملغي':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  // دالة لقراءة طريقة الدفع من البيانات
  const getPaymentMethodFromInvoice = (invoice) => {
    console.log('Reading payment method for invoice:', invoice);

    // أولاً، جرب الحقول المباشرة
    if (invoice.payment_method || invoice.paymentMethod) {
      console.log('Found direct payment method:', invoice.payment_method || invoice.paymentMethod);
      return invoice.payment_method || invoice.paymentMethod;
    }

    // ثانياً، جرب قراءة البيانات من notes
    try {
      if (invoice.notes) {
        console.log('Checking notes for payment method:', invoice.notes);
        const parts = invoice.notes.split('\n---\n');
        if (parts.length > 1) {
          const extraData = JSON.parse(parts[parts.length - 1]);
          console.log('Parsed extra data:', extraData);
          if (extraData.paymentMethod) {
            console.log('Found payment method in notes:', extraData.paymentMethod);
            return extraData.paymentMethod;
          }
        }
      }
    } catch (e) {
      console.log('خطأ في قراءة طريقة الدفع من notes:', e);
    }

    console.log('No payment method found, returning default');
    return 'غير محدد';
  };

  // Handle invoice actions
  const handleViewInvoice = (invoice) => {
    // Navigate to order tracking page
    const orderTrackingUrl = `/order-tracking?invoice=${invoice.id}`;
    toast.success('سيتم توجيهك إلى صفحة تتبع الطلبات لعرض تفاصيل الفاتورة');

    // Open in new tab or navigate
    window.open(orderTrackingUrl, '_blank');
  };

  const handlePrintInvoice = (invoice) => {
    // Create print content
    const printContent = `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center;">شركة الحرمين للدهانات الحديثة</h2>
        <h3 style="text-align: center;">فاتورة مبيعات</h3>
        <hr>
        <p><strong>رقم الفاتورة:</strong> ${invoice.order_number || invoice.orderNumber || `ORD-${invoice.id}`}</p>
        <p><strong>العميل:</strong> ${invoice.customer_name || invoice.customerName || 'غير محدد'}</p>
        <p><strong>التاريخ:</strong> ${new Date(invoice.created_at || invoice.date || new Date()).toLocaleDateString('ar-SA')}</p>
        <p><strong>المبلغ الإجمالي:</strong> ${(invoice.final_amount || invoice.total || 0).toFixed(2)} ج.م</p>
        <p><strong>طريقة الدفع:</strong> ${invoice.payment_method || invoice.paymentMethod || 'غير محدد'}</p>
        <p><strong>الحالة:</strong> ${invoice.payment_status === 'paid' ? 'مدفوع' : 'معلق'}</p>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportInvoice = (invoice) => {
    // Create CSV content
    const csvContent = `رقم الفاتورة,العميل,التاريخ,المبلغ,طريقة الدفع,الحالة
${invoice.order_number || `ORD-${invoice.id}`},"${invoice.customer_name || 'غير محدد'}",${new Date(invoice.created_at || new Date()).toLocaleDateString('ar-SA')},${(invoice.final_amount || 0).toFixed(2)},"${invoice.payment_method || 'غير محدد'}","${invoice.payment_status === 'paid' ? 'مدفوع' : 'معلق'}"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoice-${invoice.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير الفاتورة بنجاح');
  };

  const handleEditInvoice = (invoice) => {
    // TODO: Open edit modal with invoice data
    toast.info('سيتم فتح نموذج التعديل قريباً');
    // يمكن إضافة modal للتعديل هنا لاحقاً
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
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="من تاريخ"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="إلى تاريخ"
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            {orderStatuses.map(status => (
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
                <td className="table-cell font-medium">{invoice.order_number || invoice.orderNumber || `ORD-${invoice.id}`}</td>
                <td className="table-cell">{invoice.customer_name || invoice.customerName || 'غير محدد'}</td>
                <td className="table-cell">{new Date(invoice.created_at || invoice.date || new Date()).toLocaleDateString('ar-SA')}</td>
                <td className="table-cell font-medium">{(invoice.final_amount || invoice.total || 0).toFixed(2)} ج.م</td>
                <td className="table-cell text-sm">{getPaymentMethodFromInvoice(invoice)}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.order_status || invoice.orderStatus || 'معلق')}`}>
                    {invoice.order_status || invoice.orderStatus || 'معلق'}
                  </span>
                </td>
                <td className="table-cell text-xs">{invoice.created_by || invoice.createdBy || 'غير محدد'}</td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="text-primary-600 hover:text-primary-900"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePrintInvoice(invoice)}
                      className="text-green-600 hover:text-green-900"
                      title="طباعة الفاتورة"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900"
                      title="تصدير الفاتورة"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    </button>
                    {hasPermission('admin') && (
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="تعديل الفاتورة"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
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

          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              حالة الطلب *
            </label>
            <select
              required
              className="input-field"
              value={formData.orderStatus}
              onChange={(e) => setFormData({...formData, orderStatus: e.target.value})}
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
                      type="text"
                      placeholder="كود/باتش المنتج"
                      className="input-field"
                      value={item.productCode}
                      onChange={(e) => updateItem(index, 'productCode', e.target.value)}
                    />
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
