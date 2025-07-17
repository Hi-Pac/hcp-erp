import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Products state
  const [products, setProducts] = useState([]);

  // Customers state
  const [customers, setCustomers] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      try {
        // Load products from Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error loading products:', productsError);
          toast.error('خطأ في تحميل المنتجات: ' + productsError.message);
        } else {
          setProducts(productsData || []);
        }

        // Load customers from Supabase
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (customersError) {
          console.error('Error loading customers:', customersError);
          toast.error('خطأ في تحميل العملاء: ' + customersError.message);
        } else {
          setCustomers(customersData || []);
        }

        // Set up real-time subscriptions
        const productsSubscription = supabase
          .channel('products_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              console.log('Products change received:', payload);
              handleProductsRealTimeUpdate(payload);
            }
          )
          .subscribe();

        const customersSubscription = supabase
          .channel('customers_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'customers' },
            (payload) => {
              console.log('Customers change received:', payload);
              handleCustomersRealTimeUpdate(payload);
            }
          )
          .subscribe();

        // Cleanup subscriptions on unmount
        return () => {
          productsSubscription.unsubscribe();
          customersSubscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('خطأ في تحميل البيانات من قاعدة البيانات');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle real-time updates for products
  const handleProductsRealTimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setProducts(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  // Handle real-time updates for customers
  const handleCustomersRealTimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setCustomers(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  // Initialize sample data (fallback)
  const initializeSampleData = () => {
    // Sample products
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
        name: 'دهان أزرق لامع',
        category: 'الخارجية',
        batches: ['B003'],
        price: 52.00,
        quantity: 85,
        minQuantity: 15,
        description: 'دهان أزرق مقاوم للعوامل الجوية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 3,
        name: 'دهان أحمر ديكوري',
        category: 'الديكورية',
        batches: ['B004', 'B005'],
        price: 38.75,
        quantity: 60,
        minQuantity: 10,
        description: 'دهان أحمر للديكورات الداخلية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 4,
        name: 'دهان أخضر نصف لامع',
        category: 'الخارجية',
        batches: ['B006'],
        price: 48.25,
        quantity: 95,
        minQuantity: 20,
        description: 'دهان أخضر مناسب للأسطح الخارجية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 5,
        name: 'دهان بني كلاسيكي',
        category: 'الديكورية',
        batches: ['B007', 'B008'],
        price: 41.00,
        quantity: 75,
        minQuantity: 12,
        description: 'دهان بني كلاسيكي للديكورات التراثية',
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      }
    ];

    // Sample customers
    const sampleCustomers = [
      {
        id: 1,
        name: 'أحمد محمد علي',
        email: 'ahmed.mohamed@email.com',
        phone: '01012345678',
        address: 'شارع النيل، المعادي، القاهرة',
        city: 'القاهرة',
        customerType: 'فرد',
        creditLimit: 10000,
        discount: 5,
        currentBalance: 2500,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 2,
        name: 'شركة البناء الحديث',
        email: 'info@modernbuild.com',
        phone: '01098765432',
        address: 'شارع التحرير، وسط البلد، القاهرة',
        city: 'القاهرة',
        customerType: 'شركة',
        creditLimit: 50000,
        discount: 10,
        currentBalance: 15000,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 3,
        name: 'فاطمة أحمد حسن',
        email: 'fatma.ahmed@email.com',
        phone: '01156789012',
        address: 'شارع الجمهورية، المنصورة، الدقهلية',
        city: 'المنصورة',
        customerType: 'فرد',
        creditLimit: 8000,
        discount: 3,
        currentBalance: 1200,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 4,
        name: 'مؤسسة الإنشاءات المتطورة',
        email: 'contact@advanced-construction.com',
        phone: '01234567890',
        address: 'شارع الكورنيش، الإسكندرية',
        city: 'الإسكندرية',
        customerType: 'مؤسسة',
        creditLimit: 75000,
        discount: 15,
        currentBalance: 25000,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 5,
        name: 'محمد عبد الرحمن',
        email: 'mohamed.abdelrahman@email.com',
        phone: '01087654321',
        address: 'شارع السلام، أسيوط',
        city: 'أسيوط',
        customerType: 'فرد',
        creditLimit: 12000,
        discount: 2,
        currentBalance: 3500,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      }
    ];

    setProducts(sampleProducts);
    saveProductsToStorage(sampleProducts);
  };

  // Initialize sample customers
  const initializeSampleCustomers = () => {
    // Sample customers
    const sampleCustomers = [
      {
        id: 1,
        name: 'أحمد محمد علي',
        email: 'ahmed.mohamed@email.com',
        phone: '01012345678',
        address: 'شارع النيل، المعادي، القاهرة',
        city: 'القاهرة',
        customerType: 'فرد',
        creditLimit: 10000,
        discount: 5,
        currentBalance: 2500,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 2,
        name: 'شركة البناء الحديث',
        email: 'info@modernbuild.com',
        phone: '01098765432',
        address: 'شارع التحرير، وسط البلد، القاهرة',
        city: 'القاهرة',
        customerType: 'شركة',
        creditLimit: 50000,
        discount: 10,
        currentBalance: 15000,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 3,
        name: 'فاطمة أحمد حسن',
        email: 'fatma.ahmed@email.com',
        phone: '01156789012',
        address: 'شارع الجمهورية، المنصورة، الدقهلية',
        city: 'المنصورة',
        customerType: 'فرد',
        creditLimit: 8000,
        discount: 3,
        currentBalance: 1200,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 4,
        name: 'مؤسسة الإنشاءات المتطورة',
        email: 'contact@advanced-construction.com',
        phone: '01234567890',
        address: 'شارع الكورنيش، الإسكندرية',
        city: 'الإسكندرية',
        customerType: 'مؤسسة',
        creditLimit: 75000,
        discount: 15,
        currentBalance: 25000,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      },
      {
        id: 5,
        name: 'محمد عبد الرحمن',
        email: 'mohamed.abdelrahman@email.com',
        phone: '01087654321',
        address: 'شارع السلام، أسيوط',
        city: 'أسيوط',
        customerType: 'فرد',
        creditLimit: 12000,
        discount: 2,
        currentBalance: 3500,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      }
    ];

    setCustomers(sampleCustomers);
    saveCustomersToStorage(sampleCustomers);
  };

  // Product functions
  const addProduct = async (product) => {
    try {
      console.log('DataContext addProduct called with:', product);

      // Ensure price is a number
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const quantity = typeof product.quantity === 'string' ? parseInt(product.quantity) : product.quantity;
      const minQuantity = typeof product.minQuantity === 'string' ? parseInt(product.minQuantity) : product.minQuantity;

      const newProduct = {
        name: product.name,
        category: product.category,
        price: price || 0,
        quantity: quantity || 0,
        min_quantity: minQuantity || 0,
        description: product.description,
        batches: product.batches || [],
        created_by: product.createdBy
      };

      console.log('Adding product to Supabase:', newProduct);

      // Add to Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم إضافة المنتج بنجاح');
      return data;

    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('خطأ في إضافة المنتج: ' + error.message);
      throw error;
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      // Ensure price is a number
      const price = typeof updatedProduct.price === 'string' ? parseFloat(updatedProduct.price) : updatedProduct.price;
      const quantity = typeof updatedProduct.quantity === 'string' ? parseInt(updatedProduct.quantity) : updatedProduct.quantity;
      const minQuantity = typeof updatedProduct.minQuantity === 'string' ? parseInt(updatedProduct.minQuantity) : updatedProduct.minQuantity;

      const updateData = {
        name: updatedProduct.name,
        category: updatedProduct.category,
        price: price || 0,
        quantity: quantity || 0,
        min_quantity: minQuantity || 0,
        description: updatedProduct.description,
        batches: updatedProduct.batches || [],
        updated_by: updatedProduct.updatedBy,
        updated_at: new Date().toISOString()
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم تحديث المنتج بنجاح');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('خطأ في تحديث المنتج: ' + error.message);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('خطأ في حذف المنتج: ' + error.message);
      throw error;
    }
  };

  const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
  };

  // Customer functions
  const addCustomer = async (customer) => {
    try {
      const newCustomer = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        customer_type: customer.customerType,
        credit_limit: customer.creditLimit || 0,
        discount: customer.discount || 0,
        current_balance: customer.currentBalance || 0,
        created_by: customer.createdBy
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم إضافة العميل بنجاح');
      return data;

    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('خطأ في إضافة العميل: ' + error.message);
      throw error;
    }
  };

  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const updateData = {
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        city: updatedCustomer.city,
        customer_type: updatedCustomer.customerType,
        credit_limit: updatedCustomer.creditLimit || 0,
        discount: updatedCustomer.discount || 0,
        current_balance: updatedCustomer.currentBalance || 0,
        updated_by: updatedCustomer.updatedBy,
        updated_at: new Date().toISOString()
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم تحديث العميل بنجاح');
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('خطأ في تحديث العميل: ' + error.message);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('تم حذف العميل بنجاح');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('خطأ في حذف العميل: ' + error.message);
      throw error;
    }
  };

  const getCustomerById = (id) => {
    return customers.find(customer => customer.id === parseInt(id));
  };

  const value = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,

    // Customers
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,

    // Loading state
    loading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
