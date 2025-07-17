# استكشاف أخطاء Firebase وحلولها

## المشكلة الحالية: التطبيق يعمل محلياً ولكن يفشل مع Firebase

### الأسباب المحتملة:

#### 1. إعدادات Firebase غير صحيحة
**الحل:**
- تحقق من ملف `src/firebase/firebaseConfig.js`
- تأكد من أن جميع المفاتيح صحيحة
- تأكد من أن `projectId` يطابق اسم المشروع في Firebase Console

#### 2. قواعد Firestore مقيدة جداً
**الحل:**
- اذهب إلى Firebase Console > Firestore Database > Rules
- استخدم هذه القواعد للتطوير:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3. المستخدم غير مصادق عليه
**الحل:**
- تأكد من تسجيل الدخول أولاً
- تحقق من أن Authentication مفعل في Firebase
- تأكد من أن Email/Password مفعل في Sign-in methods

#### 4. مشكلة في الشبكة أو CORS
**الحل:**
- تحقق من اتصال الإنترنت
- تأكد من أن النطاق مسموح في Firebase Console
- في Project Settings > Authorized domains، أضف `localhost`

### خطوات التشخيص:

#### 1. فحص وحدة تحكم المطور
افتح Developer Tools (F12) وابحث عن:
- أخطاء في Console
- طلبات فاشلة في Network tab
- رسائل خطأ من Firebase

#### 2. اختبار الاتصال بـ Firebase
أضف هذا الكود في `src/App.jsx` لاختبار الاتصال:
```javascript
import { db } from './firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// اختبار الاتصال
useEffect(() => {
  const testConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      console.log('Firebase connection successful!');
    } catch (error) {
      console.error('Firebase connection failed:', error);
    }
  };
  
  testConnection();
}, []);
```

#### 3. التحقق من حالة المصادقة
```javascript
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is signed in:', user.email);
    } else {
      console.log('User is signed out');
    }
  });
  
  return () => unsubscribe();
}, []);
```

### الحلول المتقدمة:

#### 1. إعادة إنشاء مشروع Firebase
إذا استمرت المشاكل:
1. أنشئ مشروع Firebase جديد
2. انسخ الإعدادات الجديدة
3. أعد إعداد Authentication و Firestore

#### 2. استخدام Firebase Emulator للتطوير
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

#### 3. فحص إعدادات الأمان
تأكد من أن:
- API keys صحيحة
- Domain مسموح
- Billing account مفعل (إذا لزم الأمر)

### رسائل الخطأ الشائعة وحلولها:

#### "Permission denied"
- تحقق من قواعد Firestore
- تأكد من تسجيل الدخول
- راجع صلاحيات المستخدم

#### "Network error"
- تحقق من الإنترنت
- تأكد من عدم حجب Firebase بواسطة Firewall
- جرب VPN إذا لزم الأمر

#### "Invalid API key"
- تحقق من صحة API key في firebaseConfig.js
- تأكد من أن المشروع مفعل
- أعد إنشاء API key إذا لزم الأمر

#### "Quota exceeded"
- تحقق من استخدام Firebase في Console
- ترقية إلى خطة Blaze إذا لزم الأمر
- تحسين استعلامات قاعدة البيانات

### نصائح للتطوير:

1. **استخدم Environment Variables:**
```javascript
// .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
// ... باقي المتغيرات

// في firebaseConfig.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

2. **فعل Offline Persistence:**
```javascript
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// للعمل بدون إنترنت
await disableNetwork(db);
// للعودة للعمل مع الإنترنت
await enableNetwork(db);
```

3. **استخدم Error Boundaries:**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Firebase Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>حدث خطأ في الاتصال بقاعدة البيانات</h1>;
    }

    return this.props.children;
  }
}
```

### للحصول على المساعدة:
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)
