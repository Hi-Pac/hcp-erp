import React, { createContext, useContext, useState, useEffect } from 'react';

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
  
  // Initialize sample data
  useEffect(() => {
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
        currentBalance: 3500,
        createdBy: 'admin@hcp.com',
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null
      }
    ];

    setProducts(sampleProducts);
    setCustomers(sampleCustomers);
  }, []);

  // Product functions
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: null
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...updatedProduct, id, updatedAt: new Date() }
        : product
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
  };

  // Customer functions
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now(),
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: null
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updatedCustomer) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...updatedCustomer, id, updatedAt: new Date() }
        : customer
    ));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
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
    getCustomerById
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
