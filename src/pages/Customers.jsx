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

  // دالة لتنظيف النص وإصلاح مشاكل الترميز
  const cleanText = (text) => {
    if (!text) return '';

    // إزالة الرموز الغريبة واستبدالها بالنص الصحيح
    let cleaned = text.toString();

    // إصلاح بعض مشاكل الترميز الشائعة
    cleaned = cleaned.replace(/â—�/g, '●');
    cleaned = cleaned.replace(/â€�/g, '–');
    cleaned = cleaned.replace(/â€™/g, "'");

    return cleaned;
  };

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
      try {
        let text = e.target.result;

        // إزالة BOM إذا كان موجوداً
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 2) {
          toast.error('الملف يجب أن يحتوي على رأس الأعمدة وبيانات العملاء');
          return;
        }

        // تحليل البيانات مع دعم أفضل للفواصل
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          // تحليل أفضل للـ CSV مع دعم النصوص المحاطة بعلامات اقتباس
          const values = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // آخر قيمة

          const customer = {};
          headers.forEach((header, index) => {
            customer[header] = (values[index] || '').replace(/"/g, '');
          });
          return customer;
        });

        console.log('Parsed data:', data); // للتشخيص
        setImportPreview(data);
        setIsImportModalOpen(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('خطأ في قراءة الملف. تأكد من أن الملف بصيغة CSV صحيحة');
      }
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
احمد محمد علي,01234567890,شارع النيل 123,القاهرة,فرد,5000,5,ahmed@example.com,عميل مميز
فاطمة احمد حسن,01987654321,المعادي,القاهرة,فرد,3000,3,fatma@example.com,عميل جديد
شركة البناء الحديث,01555666777,مدينة نصر,القاهرة,شركة,50000,10,info@building.com,شركة كبيرة
محمد عبد الله,01444555666,الزمالك,القاهرة,فرد,7000,7,mohamed@example.com,عميل قديم
مؤسسة النور للتجارة,01333444555,مصر الجديدة,القاهرة,مؤسسة,25000,8,info@alnour.com,مؤسسة تجارية`;

    // إضافة BOM للـ UTF-8 لضمان العرض الصحيح في Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + sampleData;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

  // دالة إصلاح البيانات الموجودة
  const handleFixExistingData = async () => {
    if (!hasPermission('admin')) {
      toast.error('غير مسموح لك بإصلاح البيانات');
      return;
    }

    const result = await toast.promise(
      (async () => {
        // إضافة بيانات عملاء تجريبية صحيحة
        const sampleCustomers = [
          {
            name: 'احمد محمد علي',
            phone: '01234567890',
            address: 'شارع النيل 123',
            city: 'القاهرة',
            customerType: 'فرد',
            creditLimit: 5000,
            discount: 5,
            email: 'ahmed@example.com',
            notes: 'عميل مميز'
          },
          {
            name: 'فاطمة احمد حسن',
            phone: '01987654321',
            address: 'المعادي',
            city: 'القاهرة',
            customerType: 'فرد',
            creditLimit: 3000,
            discount: 3,
            email: 'fatma@example.com',
            notes: 'عميل جديد'
          },
          {
            name: 'شركة البناء الحديث',
            phone: '01555666777',
            address: 'مدينة نصر',
            city: 'القاهرة',
            customerType: 'شركة',
            creditLimit: 50000,
            discount: 10,
            email: 'info@building.com',
            notes: 'شركة كبيرة'
          },
          {
            name: 'محمد عبد الله',
            phone: '01444555666',
            address: 'الزمالك',
            city: 'القاهرة',
            customerType: 'فرد',
            creditLimit: 7000,
            discount: 7,
            email: 'mohamed@example.com',
            notes: 'عميل قديم'
          },
          {
            name: 'مؤسسة النور للتجارة',
            phone: '01333444555',
            address: 'مصر الجديدة',
            city: 'القاهرة',
            customerType: 'مؤسسة',
            creditLimit: 25000,
            discount: 8,
            email: 'info@alnour.com',
            notes: 'مؤسسة تجارية'
          }
        ];

        let addedCount = 0;
        for (const customerData of sampleCustomers) {
          try {
            await addCustomer(customerData);
            addedCount++;
          } catch (error) {
            console.error('Error adding customer:', error);
          }
        }

        return addedCount;
      })(),
      {
        loading: 'جاري إضافة بيانات العملاء...',
        success: (count) => `تم إضافة ${count} عميل بنجاح`,
        error: 'خطأ في إضافة البيانات'
      }
    );
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

            {hasPermission('admin') && (
              <button
                onClick={handleFixExistingData}
                className="btn-warning flex items-center space-x-2 space-x-reverse"
                title="إصلاح البيانات الموجودة"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>إصلاح البيانات</span>
              </button>
            )}
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
                    <div className="font-medium text-secondary-900" style={{direction: 'rtl'}}>
                      {customer.name || 'غير محدد'}
                    </div>
                    <div className="text-sm text-secondary-500">{customer.email || 'غير محدد'}</div>
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
