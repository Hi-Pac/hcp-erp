-- تحديث جدول المبيعات لإضافة الحقول المفقودة
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'غير محدد',
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'معلق',
ADD COLUMN IF NOT EXISTS order_number TEXT;

-- تحديث جدول تفاصيل المبيعات لإضافة كود المنتج
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS product_code TEXT DEFAULT '';

-- إنشاء فهرس لرقم الطلب للبحث السريع
CREATE INDEX IF NOT EXISTS idx_sales_order_number ON sales(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_order_status ON sales(order_status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- تحديث البيانات الموجودة لإضافة أرقام الطلبات
UPDATE sales 
SET order_number = 'ORD-' || id 
WHERE order_number IS NULL OR order_number = '';

-- تحديث البيانات الموجودة لإضافة حالة الطلب الافتراضية
UPDATE sales 
SET order_status = 'معلق' 
WHERE order_status IS NULL OR order_status = '';

-- تحديث البيانات الموجودة لإضافة طريقة الدفع الافتراضية
UPDATE sales 
SET payment_method = 'غير محدد' 
WHERE payment_method IS NULL OR payment_method = '';
