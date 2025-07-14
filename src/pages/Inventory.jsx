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
import toast from 'react-hot-toast';

const Inventory = () => {
  const { hasPermission, currentUser } = useAuth();
  const [products, setProducts] = useState([]);
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

  const categories = ['الإنشائية', 'الخارجية', 'الديكورية'];

  // Sample data
  useEffect(() => {
    const sampleProducts = [
      {
        id: 1,
        name: 'دهان أبيض مطفي',
        category: 'الإنشائية',
        batches: ['B001', 'B002'],
        price: 45.50,
        quantity: 120,
        minQuantity: 20,
        description: 'دهان أبيض عالي الجودة للجدران الداخلية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 2,
        name: 'دهان أزرق خارجي',
        category: 'الخارجية',
        batches: ['B003'],
        price: 52.00,
        quantity: 85,
        minQuantity: 15,
        description: 'دهان مقاوم للعوامل الجوية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      }
    ];
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Update product
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? {
              ...formData,
              id: editingProduct.id,
              updatedBy: currentUser.email,
              updatedAt: new Date(),
              createdBy: product.createdBy,
              createdAt: product.createdAt
            }
          : product
      );
      setProducts(updatedProducts);
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      // Add new product
      const newProduct = {
        ...formData,
        id: Date.now(),
        createdBy: currentUser.email,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      };
      setProducts([...products, newProduct]);
      toast.success('تم إضافة المنتج بنجاح');
    }

    resetForm();
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

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(product => product.id !== id));
      toast.success('تم حذف المنتج بنجاح');
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">إدارة المخزون</h1>
        {hasPermission('User') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            إضافة منتج جديد
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
                <td className="table-cell">{product.price.toFixed(2)} ر.س</td>
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
    </div>
  );
};

export default Inventory;
