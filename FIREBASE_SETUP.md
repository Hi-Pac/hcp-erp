# إعداد Firebase لنظام HCP ERP

## 🔥 خطوات إعداد Firebase

### 1. إنشاء مشروع Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "Create a project"
3. أدخل اسم المشروع: `hcp-erp`
4. اختر الإعدادات المناسبة وانقر "Continue"
5. اختر خطة Spark (مجانية) أو Blaze حسب الحاجة

### 2. تفعيل Authentication
1. في لوحة تحكم Firebase، اذهب إلى **Authentication**
2. انقر على **Get started**
3. اذهب إلى تبويب **Sign-in method**
4. فعّل **Email/Password**
5. انقر **Save**

### 3. إنشاء المستخدمين الأوليين
في تبويب **Users** في Authentication، أضف المستخدمين التاليين:

| البريد الإلكتروني | كلمة المرور | الدور |
|------------------|-------------|-------|
| admin@hcp.com | admin123 | Admin |
| supervisor@hcp.com | supervisor123 | Supervisor |
| user@hcp.com | user123 | User |

### 4. إعداد Firestore Database
1. اذهب إلى **Firestore Database**
2. انقر على **Create database**
3. اختر **Start in test mode** (مؤقتاً)
4. اختر المنطقة الأقرب (مثل: europe-west1)
5. انقر **Done**

### 5. إعداد Storage
1. اذهب إلى **Storage**
2. انقر على **Get started**
3. اختر **Start in test mode**
4. اختر نفس المنطقة المختارة للـ Firestore
5. انقر **Done**

### 6. الحصول على إعدادات المشروع
1. اذهب إلى **Project Settings** (أيقونة الترس)
2. في تبويب **General**، انزل إلى قسم **Your apps**
3. انقر على أيقونة **Web** (`</>`)
4. أدخل اسم التطبيق: `HCP ERP`
5. **لا تختر** Firebase Hosting الآن
6. انقر **Register app**
7. انسخ كود التكوين

### 7. تحديث إعدادات المشروع
افتح ملف `src/firebase/firebaseConfig.js` واستبدل التكوين:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 8. إنشاء بيانات المستخدمين في Firestore
بعد تشغيل المشروع وتسجيل الدخول، أنشئ مجموعة `users` في Firestore وأضف المستندات التالية:

**مستند للمدير (استخدم UID المستخدم الفعلي):**
```json
{
  "email": "admin@hcp.com",
  "name": "مدير النظام",
  "role": "Admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "system"
}
```

**مستند للمشرف:**
```json
{
  "email": "supervisor@hcp.com",
  "name": "مشرف المبيعات",
  "role": "Supervisor",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "system"
}
```

**مستند للمستخدم:**
```json
{
  "email": "user@hcp.com",
  "name": "موظف المبيعات",
  "role": "User",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "system"
}
```

### 9. إعداد قواعد الأمان (اختياري للبداية)
يمكنك البدء بقواعد الاختبار ثم تحديثها لاحقاً:

**Firestore Rules:**
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

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 10. تشغيل المشروع
```bash
npm run dev
```

### 🎉 تم الإعداد!
الآن يمكنك الوصول إلى النظام على: http://localhost:5175

استخدم بيانات الدخول المذكورة أعلاه للوصول إلى النظام.

---

## 📞 المساعدة
إذا واجهت أي مشاكل في الإعداد، تأكد من:
- تفعيل جميع الخدمات المطلوبة في Firebase
- نسخ إعدادات Firebase بشكل صحيح
- إنشاء مستندات المستخدمين في Firestore
- استخدام نفس UIDs للمستخدمين في Authentication و Firestore
