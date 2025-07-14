import React, { useState, useEffect } from 'react';
import { 
  ArrowUturnLeftIcon,
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SalesReturns = () => {
  const { hasPermission, currentUser } = useAuth();
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New return form
  const [newReturn, setNewReturn] = useState({
    originalInvoiceNumber: '',
    customerName: '',
    customerPhone: '',
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    items: [],
    totalAmount: 0,
    refundMethod: 'cash',
    status: 'pending',
    notes: ''
  });

  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const returnReasons = [
    'منتج معيب',
    'لون غير مطابق',
    'كمية زائدة',
    'تغيير في المتطلبات',
    'منتج منتهي الصلاحية',
    'أخرى'
  ];

  const refundMethods = [
    { value: 'cash', label: 'نقدي' },
    { value: 'credit', label: 'خصم من الحساب' },
    { value: 'exchange', label: 'استبدال' }
  ];

  const returnStatuses = [
    { value: 'pending', label: 'في الانتظار', color: 'yellow' },
    { value: 'approved', label: 'موافق عليه', color: 'green' },
    { value: 'rejected', label: 'مرفوض', color: 'red' },
    { value: 'processed', label: 'تم المعالجة', color: 'blue' }
  ];

  // Sample data
  useEffect(() => {
    const sampleReturns = [
      {
        id: 1,
        returnNumber: 'RET-2024-001',
        originalInvoiceNumber: 'INV-2024-001',
        customerName: 'أحمد محمد علي',
        customerPhone: '01012345678',
        returnDate: new Date('2024-01-15'),
        reason: 'منتج معيب',
        totalAmount: 450.00,
        refundMethod: 'cash',
        status: 'approved',
        items: [
          { productName: 'دهان أبيض مطفي', quantity: 2, unitPrice: 45.50, returnQuantity: 2, reason: 'منتج معيب' }
        ],
        notes: 'تم فحص المنتج وتأكيد العيب',
        createdBy: 'admin@hcp.com',
        processedBy: 'manager@hcp.com',
        processedAt: new Date('2024-01-16')
      },
      {
        id: 2,
        returnNumber: 'RET-2024-002',
        originalInvoiceNumber: 'INV-2024-002',
        customerName: 'شركة البناء الحديث',
        customerPhone: '01098765432',
        returnDate: new Date('2024-01-14'),
        reason: 'كمية زائدة',
        totalAmount: 1200.00,
        refundMethod: 'credit',
        status: 'pending',
        items: [
          { productName: 'دهان أحمر ديكوري', quantity: 5, unitPrice: 38.75, returnQuantity: 3, reason: 'كمية زائدة' }
        ],
        notes: '',
        createdBy: 'admin@hcp.com'
      }
    ];

    const sampleInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customerName: 'أحمد محمد علي',
        customerPhone: '01012345678',
        date: new Date('2024-01-10'),
        items: [
          { productName: 'دهان أبيض مطفي', quantity: 5, unitPrice: 45.50 },
          { productName: 'دهان أزرق لامع', quantity: 3, unitPrice: 52.00 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customerName: 'شركة البناء الحديث',
        customerPhone: '01098765432',
        date: new Date('2024-01-12'),
        items: [
          { productName: 'دهان أحمر ديكوري', quantity: 20, unitPrice: 38.75 }
        ]
      }
    ];

    setReturns(sampleReturns);
    setFilteredReturns(sampleReturns);
    setAvailableInvoices(sampleInvoices);
  }, []);

  // Filter returns
  useEffect(() => {
    let filtered = returns;

    if (searchTerm) {
      filtered = filtered.filter(returnItem =>
        returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.originalInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customerPhone.includes(searchTerm)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(returnItem =>
        returnItem.returnDate.toISOString().split('T')[0] === dateFilter
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    setFilteredReturns(filtered);
  }, [returns, searchTerm, dateFilter, statusFilter]);

  const handleInvoiceSelect = (invoiceNumber) => {
    const invoice = availableInvoices.find(inv => inv.invoiceNumber === invoiceNumber);
    if (invoice) {
      setSelectedInvoice(invoice);
      setNewReturn(prev => ({
        ...prev,
        originalInvoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        items: invoice.items.map(item => ({
          ...item,
          returnQuantity: 0,
          reason: ''
        }))
      }));
    }
  };

  const handleItemReturnQuantityChange = (index, quantity) => {
    const updatedItems = [...newReturn.items];
    updatedItems[index].returnQuantity = Math.min(quantity, updatedItems[index].quantity);
    
    const totalAmount = updatedItems.reduce((sum, item) => 
      sum + (item.returnQuantity * item.unitPrice), 0
    );

    setNewReturn(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));
  };

  const handleItemReasonChange = (index, reason) => {
    const updatedItems = [...newReturn.items];
    updatedItems[index].reason = reason;
    setNewReturn(prev => ({ ...prev, items: updatedItems }));
  };

  const handleCreateReturn = () => {
    const returnItems = newReturn.items.filter(item => item.returnQuantity > 0);
    
    if (returnItems.length === 0) {
      toast.error('يجب تحديد كمية للإرجاع لصنف واحد على الأقل');
      return;
    }

    const newReturnRecord = {
      id: returns.length + 1,
      returnNumber: `RET-2024-${String(returns.length + 1).padStart(3, '0')}`,
      ...newReturn,
      items: returnItems,
      createdBy: currentUser.email,
      createdAt: new Date()
    };

    setReturns(prev => [newReturnRecord, ...prev]);
    setIsModalOpen(false);
    resetForm();
    toast.success('تم إنشاء مرتجع المبيعات بنجاح');
  };

  const resetForm = () => {
    setNewReturn({
      originalInvoiceNumber: '',
      customerName: '',
      customerPhone: '',
      returnDate: new Date().toISOString().split('T')[0],
      reason: '',
      items: [],
      totalAmount: 0,
      refundMethod: 'cash',
      status: 'pending',
      notes: ''
    });
    setSelectedInvoice(null);
  };

  const getStatusInfo = (status) => {
    return returnStatuses.find(s => s.value === status) || returnStatuses[0];
  };

  const handleStatusUpdate = (returnId, newStatus) => {
    setReturns(prev => prev.map(returnItem => 
      returnItem.id === returnId 
        ? { 
            ...returnItem, 
            status: newStatus,
            processedBy: currentUser.email,
            processedAt: new Date()
          }
        : returnItem
    ));
    toast.success('تم تحديث حالة المرتجع بنجاح');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">مرتجع المبيعات</h1>
          <p className="text-secondary-600 mt-1">إدارة مرتجعات المبيعات والمنتجات</p>
        </div>
        
        {hasPermission('Sales') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            مرتجع جديد
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-secondary-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث برقم المرتجع أو الفاتورة..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="date"
              className="input-field pl-10"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              {returnStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2 space-x-reverse">
            <button className="btn-secondary flex-1">
              <PrinterIcon className="w-4 h-4 ml-1" />
              طباعة
            </button>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  رقم المرتجع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الفاتورة الأصلية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  تاريخ المرتجع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredReturns.map((returnItem) => {
                const statusInfo = getStatusInfo(returnItem.status);
                return (
                  <tr key={returnItem.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {returnItem.returnNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {returnItem.originalInvoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{returnItem.customerName}</div>
                      <div className="text-sm text-secondary-500">{returnItem.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {returnItem.returnDate.toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {returnItem.totalAmount.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {hasPermission('Supervisor') && returnItem.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(returnItem.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(returnItem.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="إنشاء مرتجع مبيعات جديد"
        size="xl"
      >
        <div className="space-y-6">
          {/* Invoice Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              رقم الفاتورة الأصلية *
            </label>
            <select
              className="input-field"
              value={newReturn.originalInvoiceNumber}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
            >
              <option value="">اختر الفاتورة</option>
              {availableInvoices.map(invoice => (
                <option key={invoice.id} value={invoice.invoiceNumber}>
                  {invoice.invoiceNumber} - {invoice.customerName}
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <>
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    className="input-field bg-secondary-50"
                    value={newReturn.customerName}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    className="input-field bg-secondary-50"
                    value={newReturn.customerPhone}
                    readOnly
                  />
                </div>
              </div>

              {/* Return Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    تاريخ المرتجع *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={newReturn.returnDate}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, returnDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    سبب الإرجاع *
                  </label>
                  <select
                    className="input-field"
                    value={newReturn.reason}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    <option value="">اختر السبب</option>
                    {returnReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    طريقة الاسترداد
                  </label>
                  <select
                    className="input-field"
                    value={newReturn.refundMethod}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, refundMethod: e.target.value }))}
                  >
                    {refundMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">أصناف الفاتورة</h4>
                <div className="space-y-3">
                  {newReturn.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-secondary-700 mb-1">
                          اسم المنتج
                        </label>
                        <input
                          type="text"
                          className="input-field text-sm bg-white"
                          value={item.productName}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-700 mb-1">
                          الكمية الأصلية
                        </label>
                        <input
                          type="number"
                          className="input-field text-sm bg-white"
                          value={item.quantity}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-700 mb-1">
                          كمية الإرجاع
                        </label>
                        <input
                          type="number"
                          className="input-field text-sm"
                          min="0"
                          max={item.quantity}
                          value={item.returnQuantity}
                          onChange={(e) => handleItemReturnQuantityChange(index, parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-700 mb-1">
                          سبب الإرجاع
                        </label>
                        <select
                          className="input-field text-sm"
                          value={item.reason}
                          onChange={(e) => handleItemReasonChange(index, e.target.value)}
                        >
                          <option value="">اختر السبب</option>
                          {returnReasons.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-secondary-900">إجمالي مبلغ المرتجع:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {newReturn.totalAmount.toLocaleString()} ج.م
                  </span>
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
                  placeholder="أضف أي ملاحظات إضافية..."
                  value={newReturn.notes}
                  onChange={(e) => setNewReturn(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateReturn}
                  className="btn-primary"
                  disabled={newReturn.totalAmount === 0}
                >
                  إنشاء المرتجع
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SalesReturns;
