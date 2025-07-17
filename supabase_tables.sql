-- إنشاء جدول المنتجات
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  description TEXT,
  batches TEXT[],
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول العملاء
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  customer_type TEXT,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  discount INTEGER DEFAULT 0,
  current_balance DECIMAL(10,2) DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول المبيعات (اختياري)
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  sale_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول تفاصيل المبيعات (اختياري)
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين (اختياري)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'User',
  active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- إضافة فهارس لتحسين الأداء
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- إضافة بيانات تجريبية للمنتجات
INSERT INTO products (name, category, price, quantity, min_quantity, description, batches, created_by) VALUES
('دهان أبيض مطفي', 'الإنشائية', 45.50, 120, 20, 'دهان أبيض عالي الجودة للجدران الداخلية', ARRAY['B001', 'B002'], 'admin@hcp.com'),
('دهان أزرق لامع', 'الخارجية', 52.00, 85, 15, 'دهان أزرق مقاوم للعوامل الجوية', ARRAY['B003'], 'admin@hcp.com'),
('دهان أحمر ديكوري', 'الديكورية', 38.75, 60, 10, 'دهان أحمر للديكورات الداخلية', ARRAY['B004', 'B005'], 'admin@hcp.com'),
('دهان أخضر نصف لامع', 'الخارجية', 48.25, 95, 20, 'دهان أخضر مناسب للأسطح الخارجية', ARRAY['B006'], 'admin@hcp.com'),
('دهان بني كلاسيكي', 'الديكورية', 41.00, 75, 12, 'دهان بني كلاسيكي للديكورات التراثية', ARRAY['B007', 'B008'], 'admin@hcp.com');

-- إضافة بيانات تجريبية للعملاء
INSERT INTO customers (name, email, phone, address, city, customer_type, credit_limit, discount, current_balance, created_by) VALUES
('أحمد محمد علي', 'ahmed.mohamed@email.com', '01012345678', 'شارع النيل، المعادي، القاهرة', 'القاهرة', 'فرد', 10000, 5, 2500, 'admin@hcp.com'),
('شركة البناء الحديث', 'info@modernbuild.com', '01098765432', 'شارع التحرير، وسط البلد، القاهرة', 'القاهرة', 'شركة', 50000, 10, 15000, 'admin@hcp.com'),
('فاطمة أحمد حسن', 'fatma.ahmed@email.com', '01156789012', 'شارع الجمهورية، المنصورة، الدقهلية', 'المنصورة', 'فرد', 8000, 3, 1200, 'admin@hcp.com'),
('مؤسسة الإنشاءات المتطورة', 'contact@advanced-construction.com', '01234567890', 'شارع الكورنيش، الإسكندرية', 'الإسكندرية', 'مؤسسة', 75000, 15, 25000, 'admin@hcp.com'),
('محمد عبد الرحمن', 'mohamed.abdelrahman@email.com', '01087654321', 'شارع السلام، أسيوط', 'أسيوط', 'فرد', 12000, 2, 3500, 'admin@hcp.com');

-- إضافة مستخدم إداري تجريبي
INSERT INTO users (email, name, role, created_by) VALUES
('admin@hcp.com', 'مدير النظام', 'Admin', 'system'),
('supervisor@hcp.com', 'مشرف المبيعات', 'Supervisor', 'admin@hcp.com'),
('user@hcp.com', 'موظف المبيعات', 'User', 'admin@hcp.com');
