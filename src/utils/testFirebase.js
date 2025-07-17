import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// اختبار الاتصال بـ Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 بدء اختبار اتصال Firebase...');
    
    // اختبار 1: التحقق من إعدادات Firebase
    console.log('📋 إعدادات Firebase:');
    console.log('- Project ID:', db.app.options.projectId);
    console.log('- Auth Domain:', db.app.options.authDomain);
    console.log('- API Key:', db.app.options.apiKey ? 'موجود' : 'مفقود');
    
    // اختبار 2: محاولة قراءة مجموعة اختبار
    console.log('📖 اختبار قراءة البيانات...');
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ نجح اختبار القراءة - عدد المستندات:', snapshot.size);
    
    // اختبار 3: محاولة كتابة بيانات اختبار
    console.log('✍️ اختبار كتابة البيانات...');
    const testDoc = {
      message: 'اختبار الاتصال',
      timestamp: new Date(),
      status: 'success'
    };
    
    const docRef = await addDoc(testCollection, testDoc);
    console.log('✅ نجح اختبار الكتابة - معرف المستند:', docRef.id);
    
    return {
      success: true,
      message: 'جميع اختبارات Firebase نجحت!',
      details: {
        projectId: db.app.options.projectId,
        documentsCount: snapshot.size,
        newDocId: docRef.id
      }
    };
    
  } catch (error) {
    console.error('❌ فشل اختبار Firebase:', error);
    return {
      success: false,
      message: 'فشل في الاتصال بـ Firebase',
      error: error.message,
      code: error.code
    };
  }
};

// اختبار تسجيل الدخول
export const testAuthentication = async (email = 'admin@hcp.com', password = 'admin123') => {
  try {
    console.log('🔐 اختبار تسجيل الدخول...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ نجح تسجيل الدخول:', user.email);
    
    return {
      success: true,
      message: 'نجح تسجيل الدخول',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      }
    };
    
  } catch (error) {
    console.error('❌ فشل تسجيل الدخول:', error);
    
    // إذا كان المستخدم غير موجود، جرب إنشاؤه
    if (error.code === 'auth/user-not-found') {
      try {
        console.log('👤 إنشاء مستخدم جديد...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // إضافة بيانات المستخدم إلى Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: 'مدير النظام',
          role: 'Admin',
          createdAt: new Date(),
          createdBy: 'system'
        });
        
        console.log('✅ تم إنشاء المستخدم بنجاح:', user.email);
        
        return {
          success: true,
          message: 'تم إنشاء المستخدم وتسجيل الدخول بنجاح',
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          }
        };
        
      } catch (createError) {
        console.error('❌ فشل إنشاء المستخدم:', createError);
        return {
          success: false,
          message: 'فشل في إنشاء المستخدم',
          error: createError.message,
          code: createError.code
        };
      }
    }
    
    return {
      success: false,
      message: 'فشل في تسجيل الدخول',
      error: error.message,
      code: error.code
    };
  }
};

// اختبار شامل
export const runFullFirebaseTest = async () => {
  console.log('🚀 بدء الاختبار الشامل لـ Firebase...');
  
  const results = {
    connection: null,
    authentication: null,
    overall: false
  };
  
  // اختبار الاتصال
  results.connection = await testFirebaseConnection();
  
  // اختبار المصادقة
  results.authentication = await testAuthentication();
  
  // النتيجة الإجمالية
  results.overall = results.connection.success && results.authentication.success;
  
  console.log('📊 نتائج الاختبار الشامل:');
  console.log('- الاتصال:', results.connection.success ? '✅' : '❌');
  console.log('- المصادقة:', results.authentication.success ? '✅' : '❌');
  console.log('- النتيجة الإجمالية:', results.overall ? '✅ نجح' : '❌ فشل');
  
  return results;
};

// دالة لعرض معلومات التشخيص
export const getFirebaseDiagnostics = () => {
  const diagnostics = {
    config: {
      projectId: db.app.options.projectId,
      authDomain: db.app.options.authDomain,
      hasApiKey: !!db.app.options.apiKey,
      hasStorageBucket: !!db.app.options.storageBucket,
      hasMessagingSenderId: !!db.app.options.messagingSenderId,
      hasAppId: !!db.app.options.appId
    },
    auth: {
      currentUser: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      } : null
    },
    environment: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      language: navigator.language
    }
  };
  
  console.log('🔍 معلومات التشخيص:', diagnostics);
  return diagnostics;
};
