import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Initialize sample data in Firebase
export const initializeFirebaseData = async () => {
  try {
    console.log('Checking if data already exists...');
    
    // Check if products already exist
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    if (productsSnapshot.empty) {
      console.log('No products found, adding sample data...');
      
      // Sample products
      const sampleProducts = [
        {
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

      // Add products to Firebase
      for (const product of sampleProducts) {
        await addDoc(productsRef, product);
        console.log('Added product:', product.name);
      }
    }

    // Check if customers already exist
    const customersRef = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersRef);
    
    if (customersSnapshot.empty) {
      console.log('No customers found, adding sample data...');
      
      // Sample customers
      const sampleCustomers = [
        {
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

      // Add customers to Firebase
      for (const customer of sampleCustomers) {
        await addDoc(customersRef, customer);
        console.log('Added customer:', customer.name);
      }
    }

    console.log('Firebase data initialization completed successfully');
    return true;
    
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
};
