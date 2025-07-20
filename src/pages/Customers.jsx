import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    customerType: '',
    creditLimit: '',
    discount: '',
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
      discount: customer.discount || '',
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
      discount: '',
      email: '',
      notes: ''
    });
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  // دوال الاستيراد
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('يرجى اختيار ملف CSV فقط');
      return;
    }

    setImportFile(file);

    // قراءة الملف وعرض المعاينة
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('الملف يجب أن يحتوي على رأس الأعمدة وبيانات العملاء');
        return;
      }

      // تحليل البيانات
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const customer = {};
        headers.forEach((header, index) => {
          customer[header] = values[index] || '';
        });
        return customer;
      });

      setImportPreview(data);
      setIsImportModalOpen(true);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleImportConfirm = async () => {
    if (!importPreview.length) return;

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const customerData of importPreview) {
        try {
          // تحويل البيانات للصيغة المطلوبة
          const formattedData = {
            name: customerData.name || customerData['الاسم'] || '',
            phone: customerData.phone || customerData['الهاتف'] || '',
            address: customerData.address || customerData['العنوان'] || '',
            city: customerData.city || customerData['المدينة'] || '',
            customerType: customerData.customerType || customerData['نوع العميل'] || 'فرد',
            creditLimit: parseFloat(customerData.creditLimit || customerData['حد الائتمان'] || 0),
            discount: parseFloat(customerData.discount || customerData['نسبة الخصم'] || 0),
            email: customerData.email || customerData['البريد الإلكتروني'] || '',
            notes: customerData.notes || customerData['ملاحظات'] || ''
          };

          if (formattedData.name) {
            await addCustomer(formattedData);
            successCount++;
          }
        } catch (error) {
          console.error('Error importing customer:', error);
          errorCount++;
        }
      }

      toast.success(`تم استيراد ${successCount} عميل بنجاح${errorCount > 0 ? ` مع ${errorCount} أخطاء` : ''}`);

      // إعادة تعيين البيانات
      setImportFile(null);
      setImportPreview([]);
      setIsImportModalOpen(false);

    } catch (error) {
      console.error('Import error:', error);
      toast.error('خطأ في استيراد البيانات');
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,phone,address,city,customerType,creditLimit,discount,email,notes
أحمد محمد علي,01234567890,شارع النيل,القاهرة,فرد,5000,5,ahmed@example.com,عميل مميز
شركة البناء الحديث,01987654321,المعادي,القاهرة,شركة,50000,10,info@building.com,شركة كبيرة`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_customers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('تم تحميل ملف العينة');
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
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>إضافة عميل جديد</span>
            </button>

            <button
              onClick={downloadSampleCSV}
              className="btn-secondary flex items-center space-x-2 space-x-reverse"
              title="تحميل ملف عينة CSV"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>ملف عينة</span>
            </button>

            <label className="btn-secondary flex items-center space-x-2 space-x-reverse cursor-pointer">
              <DocumentArrowUpIcon className="w-5 h-5" />
              <span>استيراد CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
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
              <th className="table-header">نسبة الخصم</th>
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
                <td className="table-cell">{customer.creditLimit?.toLocaleString()} ج.م</td>
                <td className="table-cell">
                  <span className="text-primary-600 font-medium">
                    {customer.discount || 0}%
                  </span>
                </td>
                <td className="table-cell">{customer.currentBalance?.toLocaleString()} ج.م</td>
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
                حد الائتمان (ج.م)
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                نسبة الخصم (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                placeholder="0.0"
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

      {/* Import Preview Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview([]);
          setImportFile(null);
        }}
        title="معاينة استيراد العملاء"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              سيتم استيراد {importPreview.length} عميل
            </h4>
            <p className="text-sm text-blue-600">
              تأكد من صحة البيانات قبل المتابعة
            </p>
          </div>

          {/* Preview Table */}
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50 sticky top-0">
                <tr>
                  <th className="table-header">الاسم</th>
                  <th className="table-header">الهاتف</th>
                  <th className="table-header">العنوان</th>
                  <th className="table-header">النوع</th>
                  <th className="table-header">حد الائتمان</th>
                  <th className="table-header">الخصم %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {importPreview.slice(0, 10).map((customer, index) => (
                  <tr key={index} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      {customer.name || customer['الاسم'] || 'غير محدد'}
                    </td>
                    <td className="table-cell">
                      {customer.phone || customer['الهاتف'] || 'غير محدد'}
                    </td>
                    <td className="table-cell">
                      {customer.address || customer['العنوان'] || 'غير محدد'}
                    </td>
                    <td className="table-cell">
                      {customer.customerType || customer['نوع العميل'] || 'فرد'}
                    </td>
                    <td className="table-cell">
                      {customer.creditLimit || customer['حد الائتمان'] || '0'}
                    </td>
                    <td className="table-cell">
                      {customer.discount || customer['نسبة الخصم'] || '0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {importPreview.length > 10 && (
              <div className="text-center py-2 text-sm text-secondary-600">
                ... و {importPreview.length - 10} عميل آخر
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setImportPreview([]);
                setImportFile(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={handleImportConfirm}
              className="btn-primary"
            >
              تأكيد الاستيراد
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
