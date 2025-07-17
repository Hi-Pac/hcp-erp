# دليل إعداد Supabase - نظام ERP شركة الحرمين للدهانات الحديثة

## 🎯 الخطوات المطلوبة

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. انقر على **"Start your project"**
3. سجل دخول أو أنشئ حساب جديد
4. انقر على **"New project"**
5. املأ البيانات:
   - **Name**: HCP-ERP
   - **Database Password**: اختر كلمة مرور قوية (احفظها!)
   - **Region**: اختر الأقرب (مثل Frankfurt)
6. انقر على **"Create new project"**
7. انتظر حتى يكتمل الإعداد (2-3 دقائق)

### الخطوة 2: إنشاء الجداول

#### الطريقة الأولى: SQL Editor (الأسرع)
1. من القائمة الجانبية، انقر على **"SQL Editor"**
2. انقر على **"New query"**
3. انسخ محتوى ملف `supabase_tables.sql` والصقه
4. انقر على **"Run"** أو اضغط Ctrl+Enter
5. يجب أن ترى رسالة "Success. No rows returned"

#### الطريقة الثانية: Table Editor (بصرياً)
1. من القائمة الجانبية، انقر على **"Table Editor"**
2. انقر على **"Create a new table"**
3. أنشئ جدول `products` بالأعمدة المطلوبة
4. كرر العملية لجدول `customers`

### الخطوة 3: الحصول على API Keys
1. من القائمة الجانبية، انقر على أيقونة **الترس** (Settings)
2. اختر **"API"** من القائمة الفرعية
3. انسخ المعلومات التالية:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### الخطوة 4: تحديث إعدادات المشروع
1. افتح ملف `src/supabase/supabaseClient.js`
2. استبدل القيم التالية:

```javascript
const supabaseUrl = 'https://your-project-id.supabase.co'  // ضع URL مشروعك هنا
const supabaseAnonKey = 'your-anon-key-here'  // ضع المفتاح هنا
```

### الخطوة 5: إعداد Row Level Security (RLS)

#### تفعيل RLS للجداول:
1. اذهب إلى **"Authentication"** > **"Policies"**
2. لكل جدول (products, customers):
   - انقر على **"New Policy"**
   - اختر **"Get started quickly"**
   - اختر **"Enable read access for all users"**
   - انقر على **"Review"** ثم **"Save policy"**

#### أو استخدم SQL لإعداد سياسات بسيطة:
```sql
-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- سياسات بسيطة للتطوير (اقرأ للجميع)
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);
```

### الخطوة 6: اختبار الاتصال
1. شغّل التطبيق: `npm run dev`
2. اذهب إلى **الإعدادات** > **"اختبار Supabase"**
3. انقر على **"اختبار الاتصال"**
4. يجب أن ترى رسالة نجاح

### الخطوة 7: اختبار إضافة البيانات
1. في نفس صفحة الاختبار، انقر على **"اختبار إضافة منتج"**
2. اذهب إلى صفحة **المخزون**
3. جرب إضافة منتج جديد
4. تحقق من ظهوره في القائمة
5. تحقق من Supabase Dashboard > Table Editor

## 🔧 استكشاف الأخطاء

### خطأ "Invalid API key"
- تأكد من نسخ API key بشكل صحيح
- تأكد من عدم وجود مسافات إضافية
- تأكد من أن المشروع مفعل

### خطأ "relation does not exist"
- تأكد من إنشاء الجداول بشكل صحيح
- تحقق من أسماء الجداول في SQL Editor
- تأكد من تشغيل SQL script بنجاح

### خطأ "Row Level Security"
- تأكد من إعداد RLS policies
- أو قم بتعطيل RLS مؤقتاً للاختبار:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
```

### خطأ "Network error"
- تحقق من اتصال الإنترنت
- تأكد من صحة Project URL
- تحقق من حالة خدمة Supabase

## 📊 مراقبة الاستخدام
1. اذهب إلى **"Settings"** > **"Usage"**
2. راقب:
   - Database size (الحد الأقصى: 500MB)
   - Monthly Active Users (الحد الأقصى: 50,000)
   - API requests

## 🔒 الأمان (للإنتاج)

### تحسين RLS Policies:
```sql
-- سياسة أكثر أماناً (تتطلب authentication)
CREATE POLICY "Authenticated users can read" ON products 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert" ON products 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### استخدام Environment Variables:
```javascript
// .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

// في supabaseClient.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 🎯 الخطوات التالية

### بعد نجاح الإعداد:
1. ✅ اختبار إضافة/تحديث/حذف المنتجات
2. ✅ اختبار إضافة/تحديث/حذف العملاء
3. ✅ اختبار Real-time updates
4. ✅ إعداد Authentication (اختياري)
5. ✅ إعداد النسخ الاحتياطية

### للتطوير المتقدم:
- إضافة جداول المبيعات والفواتير
- إعداد Triggers للحسابات التلقائية
- إضافة Full-text search
- إعداد Edge Functions

## 📞 الدعم
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**ملاحظة:** هذا الإعداد مناسب للتطوير والمشاريع الصغيرة. للمشاريع الكبيرة، راجع إعدادات الأمان المتقدمة.
