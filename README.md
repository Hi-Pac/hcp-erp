# نظام إدارة الموارد HCP ERP

نظام إدارة موارد شامل مصمم خصيصاً لشركة HCP لإدارة توزيع وبيع الدهانات.

## 🚀 المميزات الرئيسية

### 📊 لوحة التحكم
- إحصائيات شاملة للمبيعات والطلبات والعملاء
- رسوم بيانية تفاعلية لتتبع الأداء
- نشاط حديث ومؤشرات الأداء الرئيسية

### 🛒 إدارة المبيعات
- إنشاء فواتير مبيعات مع تفاصيل كاملة
- أربع طرق دفع مختلفة:
  - تحصيل جزئي مقدم + باقي مع المندوب
  - دفع كامل مقدماً
  - تحصيل كامل عند التسليم
  - آجل كامل
- إدارة العربون والمقدمات
- تتبع حالة الطلبات

### 👥 إدارة العملاء
- قاعدة بيانات شاملة للعملاء
- تصنيف العملاء (مؤسسات/مشاريع، محلات تجارية، أفراد)
- معدلات خصم مخصصة لكل عميل
- تتبع تاريخ المعاملات

### 📦 إدارة المخزون
- إدارة المنتجات بالفئات (إنشائية، خارجية، ديكورية)
- نظام الباتشات والأكواد
- تنبيهات المخزون المنخفض
- تتبع الكميات والأسعار

### 💰 إدارة الحسابات
- تسجيل المدفوعات من العملاء
- كشف حساب مفصل لكل عميل
- طرق دفع متعددة (نقدي، تحويل بنكي، فودافون كاش، شيك)
- ربط المدفوعات بالطلبات

### 👤 إدارة المستخدمين
- ثلاثة مستويات صلاحيات:
  - **Admin**: كامل الصلاحيات
  - **Supervisor**: عرض + تعديل + تقارير
  - **User**: عرض + إضافة فقط
- تسجيل خروج تلقائي بعد 5 دقائق من عدم النشاط

### 📈 التقارير
- تقارير المبيعات والمرتجعات
- تقارير نشاط العملاء
- تقارير المخزون والمنتجات
- تصدير PDF و Excel
- فلترة حسب التاريخ والعميل والمنتج

## 🛠️ التقنيات المستخدمة

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Charts**: Chart.js + React Chart.js 2
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **PDF Export**: jsPDF
- **Excel Export**: XLSX

## 📱 التصميم المتجاوب

النظام مصمم ليعمل بشكل مثالي على:
- 🖥️ أجهزة سطح المكتب
- 📱 الهواتف الذكية
- 📱 الأجهزة اللوحية

## 🔧 التثبيت والإعداد

### 1. متطلبات النظام
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 2. تثبيت المشروع
```bash
# استنساخ المشروع
git clone <repository-url>
cd HCP-ERP

# تثبيت التبعيات
npm install

# تشغيل المشروع
npm run dev
```

### 3. إعداد Firebase

#### إنشاء مشروع Firebase جديد:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "Create a project"
3. أدخل اسم المشروع: `hcp-erp`
4. اختر الإعدادات المناسبة

#### تفعيل الخدمات المطلوبة:

**Authentication:**
1. اذهب إلى Authentication > Sign-in method
2. فعّل Email/Password
3. أضف المستخدمين الأوليين:
   - admin@hcp.com / admin123
   - supervisor@hcp.com / supervisor123
   - user@hcp.com / user123

**Firestore Database:**
1. اذهب إلى Firestore Database
2. انقر على "Create database"
3. اختر "Start in test mode" (مؤقتاً)
4. اختر المنطقة الأقرب

**Storage:**
1. اذهب إلى Storage
2. انقر على "Get started"
3. اختر الإعدادات الافتراضية

#### قواعد الأمان (Security Rules):

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor'];
    }

    // Products collection
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor', 'User'];
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor'];
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor', 'User'];
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor'];
    }

    // Invoices collection
    match /invoices/{invoiceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor', 'User'];
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor'];
    }

    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor', 'User'];
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Admin', 'Supervisor'];
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

#### تكوين المشروع:
1. اذهب إلى Project Settings > General
2. في قسم "Your apps"، انقر على "Web app"
3. أدخل اسم التطبيق: `HCP ERP`
4. انسخ Firebase config
5. استبدل المحتوى في `src/firebase/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. إنشاء البيانات الأولية

بعد تشغيل المشروع، قم بإنشاء المستخدمين الأوليين في Firestore:

**مجموعة users:**
```javascript
// Document: admin-user-uid
{
  email: "admin@hcp.com",
  name: "مدير النظام",
  role: "Admin",
  createdAt: new Date(),
  createdBy: "system"
}

// Document: supervisor-user-uid
{
  email: "supervisor@hcp.com",
  name: "مشرف المبيعات",
  role: "Supervisor",
  createdAt: new Date(),
  createdBy: "system"
}

// Document: user-user-uid
{
  email: "user@hcp.com",
  name: "موظف المبيعات",
  role: "User",
  createdAt: new Date(),
  createdBy: "system"
}
```

## 🔐 بيانات الدخول التجريبية

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| مدير | admin@hcp.com | admin123 |
| مشرف | supervisor@hcp.com | supervisor123 |
| مستخدم | user@hcp.com | user123 |

## 📁 هيكل المشروع

```
HCP-ERP/
├── public/
│   ├── index.html
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── Layout/
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   └── firebaseConfig.js
│   ├── pages/
│   │   ├── Accounting.jsx
│   │   ├── Customers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Login.jsx
│   │   ├── Reports.jsx
│   │   ├── Sales.jsx
│   │   └── Users.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🚀 النشر

### Firebase Hosting:
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting

# بناء المشروع
npm run build

# النشر
firebase deploy
```

## 📞 الدعم الفني

للحصول على الدعم الفني أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

## 📄 الترخيص

هذا المشروع مملوك لشركة HCP وهو للاستخدام الداخلي فقط.

---

**تم تطوير هذا النظام بواسطة فريق التطوير المتخصص لشركة HCP**
