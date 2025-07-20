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

const Inventory = () => {
  const { hasPermission, currentUser } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, loading } = useData();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    batches: [''],
    price: '',
    quantity: '',
    minQuantity: '',
    description: ''
  });

  // Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);

  const categories = ['الإنشائية', 'الخارجية', 'الديكورية'];

  // Initialize filtered products
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.batches.some(batch => batch.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Current user:', currentUser);

    // Validation
    if (!formData.name.trim()) {
      console.log('Validation failed: name is empty');
      toast.error('يرجى إدخال اسم المنتج');
      return;
    }
    if (!formData.category) {
      console.log('Validation failed: category is empty');
      toast.error('يرجى اختيار فئة المنتج');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      console.log('Validation failed: price is invalid', formData.price);
      toast.error('يرجى إدخال سعر صحيح للمنتج');
      return;
    }
    if (formData.quantity === '' || parseInt(formData.quantity) < 0) {
      console.log('Validation failed: quantity is invalid', formData.quantity);
      toast.error('يرجى إدخال كمية صحيحة للمنتج');
      return;
    }

    console.log('Validation passed, proceeding with save...');

    try {
      if (editingProduct) {
        console.log('Updating existing product...');
        // Update product
        const updatedProductData = {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity) || 0,
          updatedBy: currentUser.email,
          createdBy: editingProduct.createdBy,
          createdAt: editingProduct.createdAt
        };
        console.log('Updated product data:', updatedProductData);
        await updateProduct(editingProduct.id, updatedProductData);
      } else {
        console.log('Adding new product...');
        // Add new product
        const newProductData = {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity) || 0,
          createdBy: currentUser.email
        };
        console.log('New product data:', newProductData);
        console.log('Calling addProduct function...');
        const result = await addProduct(newProductData);
        console.log('addProduct result:', result);
      }

      console.log('Calling resetForm...');
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      batches: product.batches,
      price: product.price,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      description: product.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      batches: [''],
      price: '',
      quantity: '',
      minQuantity: '',
      description: ''
    });
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  // دالة رفع ملف CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('يرجى اختيار ملف CSV فقط');
      return;
    }

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
          toast.error('الملف يجب أن يحتوي على رأس الأعمدة وبيانات المنتجات');
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

          const product = {};
          headers.forEach((header, index) => {
            let value = (values[index] || '').replace(/"/g, '');

            // معالجة خاصة للـ batches
            if (header === 'batches' && value) {
              product[header] = value.split(';').map(b => b.trim()).filter(b => b);
            } else {
              product[header] = value;
            }
          });
          return product;
        });

        console.log('Parsed products data:', data); // للتشخيص
        setImportPreview(data);
        setIsImportModalOpen(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('خطأ في قراءة الملف. تأكد من أن الملف بصيغة CSV صحيحة');
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // دالة تأكيد الاستيراد
  const handleConfirmImport = async () => {
    if (!hasPermission('admin') && !hasPermission('supervisor')) {
      toast.error('غير مسموح لك بإضافة المنتجات');
      return;
    }

    const result = await toast.promise(
      (async () => {
        let successCount = 0;
        let errorCount = 0;

        for (const productData of importPreview) {
          try {
            // التحقق من البيانات المطلوبة
            if (!productData.name || !productData.category || !productData.price) {
              errorCount++;
              continue;
            }

            const newProduct = {
              name: productData.name,
              category: productData.category,
              price: parseFloat(productData.price) || 0,
              quantity: parseInt(productData.quantity) || 0,
              minQuantity: parseInt(productData.minQuantity) || 0,
              description: productData.description || '',
              batches: productData.batches || [],
              createdBy: currentUser.email
            };

            await addProduct(newProduct);
            successCount++;
          } catch (error) {
            console.error('Error adding product:', error);
            errorCount++;
          }
        }

        return { successCount, errorCount };
      })(),
      {
        loading: 'جاري استيراد المنتجات...',
        success: ({ successCount, errorCount }) =>
          `تم استيراد ${successCount} منتج بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ''}`,
        error: 'خطأ في استيراد المنتجات'
      }
    );

    setIsImportModalOpen(false);
    setImportPreview([]);
  };

  // دالة تحميل ملف العينة
  const downloadSampleCSV = () => {
    const sampleData = `name,category,price,quantity,minQuantity,description,batches
دهان ابيض مطفي,الإنشائية,45.50,120,20,دهان ابيض عالي الجودة للجدران الداخلية,B001;B002
دهان ازرق لامع,الخارجية,52.00,85,15,دهان ازرق مقاوم للعوامل الجوية,B003
دهان احمر ديكوري,الديكورية,38.75,60,10,دهان احمر للديكورات الداخلية,B004;B005
دهان اخضر نصف لامع,الخارجية,48.25,95,20,دهان اخضر مناسب للأسطح الخارجية,B006
دهان بني كلاسيكي,الديكورية,41.00,75,12,دهان بني كلاسيكي للديكورات التراثية,B007;B008`;

    // إضافة BOM للـ UTF-8 لضمان العرض الصحيح في Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + sampleData;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_products.csv');
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
        // إضافة بيانات منتجات تجريبية صحيحة
        const sampleProducts = [
          {
            name: 'دهان ابيض مطفي',
            category: 'الإنشائية',
            price: 45.50,
            quantity: 120,
            minQuantity: 20,
            description: 'دهان ابيض عالي الجودة للجدران الداخلية',
            batches: ['B001', 'B002']
          },
          {
            name: 'دهان ازرق لامع',
            category: 'الخارجية',
            price: 52.00,
            quantity: 85,
            minQuantity: 15,
            description: 'دهان ازرق مقاوم للعوامل الجوية',
            batches: ['B003']
          },
          {
            name: 'دهان احمر ديكوري',
            category: 'الديكورية',
            price: 38.75,
            quantity: 60,
            minQuantity: 10,
            description: 'دهان احمر للديكورات الداخلية',
            batches: ['B004', 'B005']
          },
          {
            name: 'دهان اخضر نصف لامع',
            category: 'الخارجية',
            price: 48.25,
            quantity: 95,
            minQuantity: 20,
            description: 'دهان اخضر مناسب للأسطح الخارجية',
            batches: ['B006']
          },
          {
            name: 'دهان بني كلاسيكي',
            category: 'الديكورية',
            price: 41.00,
            quantity: 75,
            minQuantity: 12,
            description: 'دهان بني كلاسيكي للديكورات التراثية',
            batches: ['B007', 'B008']
          }
        ];

        let addedCount = 0;
        for (const productData of sampleProducts) {
          try {
            await addProduct({
              ...productData,
              createdBy: currentUser.email
            });
            addedCount++;
          } catch (error) {
            console.error('Error adding product:', error);
          }
        }

        return addedCount;
      })(),
      {
        loading: 'جاري إضافة بيانات المنتجات...',
        success: (count) => `تم إضافة ${count} منتج بنجاح`,
        error: 'خطأ في إضافة البيانات'
      }
    );
  };

  const addBatch = () => {
    setFormData({
      ...formData,
      batches: [...formData.batches, '']
    });
  };

  const removeBatch = (index) => {
    const newBatches = formData.batches.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      batches: newBatches.length > 0 ? newBatches : ['']
    });
  };

  const updateBatch = (index, value) => {
    const newBatches = [...formData.batches];
    newBatches[index] = value;
    setFormData({
      ...formData,
      batches: newBatches
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة المخزون</h1>
        <div className="flex items-center space-x-3 space-x-reverse">
          {hasPermission('User') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>إضافة منتج جديد</span>
            </button>
          )}

          {hasPermission('supervisor') && (
            <>
              <button
                onClick={downloadSampleCSV}
                className="btn-secondary flex items-center space-x-2 space-x-reverse"
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
            </>
          )}

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
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              className="input-field pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="input-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">جميع الفئات</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
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

      {/* Products Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">اسم المنتج</th>
              <th className="table-header">الفئة</th>
              <th className="table-header">الباتشات</th>
              <th className="table-header">السعر</th>
              <th className="table-header">الكمية</th>
              <th className="table-header">الحد الأدنى</th>
              <th className="table-header">الحالة</th>
              <th className="table-header">تم الإنشاء بواسطة</th>
              <th className="table-header">آخر تعديل</th>
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-secondary-50">
                <td className="table-cell font-medium">{product.name}</td>
                <td className="table-cell">{product.category}</td>
                <td className="table-cell">
                  <div className="flex flex-wrap gap-1">
                    {product.batches.map((batch, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                        {batch}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="table-cell">{parseFloat(product.price || 0).toFixed(2)} ج.م</td>
                <td className="table-cell">{product.quantity}</td>
                <td className="table-cell">{product.minQuantity}</td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.quantity <= product.minQuantity
                      ? 'bg-red-100 text-red-800'
                      : product.quantity <= product.minQuantity * 2
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity <= product.minQuantity
                      ? 'نفد المخزون'
                      : product.quantity <= product.minQuantity * 2
                      ? 'مخزون منخفض'
                      : 'متوفر'
                    }
                  </span>
                </td>
                <td className="table-cell text-xs">{product.createdBy}</td>
                <td className="table-cell text-xs">
                  {product.updatedBy ? `${product.updatedBy}` : '-'}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2 space-x-reverse">
                    {hasPermission('User') && (
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('Supervisor') && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
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

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                اسم المنتج *
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
                الفئة *
              </label>
              <select
                required
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                السعر *
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="input-field"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                الكمية *
              </label>
              <input
                type="number"
                required
                className="input-field"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                الحد الأدنى للمخزون *
              </label>
              <input
                type="number"
                required
                className="input-field"
                value={formData.minQuantity}
                onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
              />
            </div>
          </div>

          {/* Batches */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              الباتشات / الأكواد
            </label>
            {formData.batches.map((batch, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse mb-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="كود الباتش"
                  value={batch}
                  onChange={(e) => updateBatch(index, e.target.value)}
                />
                {formData.batches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBatch(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBatch}
              className="text-primary-600 hover:text-primary-900 text-sm"
            >
              + إضافة باتش جديد
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              الوصف
            </label>
            <textarea
              rows={3}
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
              {editingProduct ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="معاينة استيراد المنتجات"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              سيتم استيراد {importPreview.length} منتج. يرجى مراجعة البيانات قبل التأكيد.
            </p>
          </div>

          <div className="max-h-96 overflow-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50 sticky top-0">
                <tr>
                  <th className="table-header">اسم المنتج</th>
                  <th className="table-header">الفئة</th>
                  <th className="table-header">السعر</th>
                  <th className="table-header">الكمية</th>
                  <th className="table-header">الحد الأدنى</th>
                  <th className="table-header">الوصف</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {importPreview.slice(0, 10).map((product, index) => (
                  <tr key={index} className="hover:bg-secondary-50">
                    <td className="table-cell" style={{direction: 'rtl'}}>
                      {product.name || 'غير محدد'}
                    </td>
                    <td className="table-cell">
                      {product.category || 'غير محدد'}
                    </td>
                    <td className="table-cell">
                      {product.price || '0'} ر.س
                    </td>
                    <td className="table-cell">
                      {product.quantity || '0'}
                    </td>
                    <td className="table-cell">
                      {product.minQuantity || '0'}
                    </td>
                    <td className="table-cell" style={{direction: 'rtl'}}>
                      {product.description || 'غير محدد'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {importPreview.length > 10 && (
              <div className="text-center py-4 text-secondary-500">
                ... و {importPreview.length - 10} منتج آخر
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
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

export default Inventory;
