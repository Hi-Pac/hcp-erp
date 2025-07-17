-- إنشاء جدول المبيعات
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
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

-- إنشاء جدول تفاصيل المبيعات
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تعطيل Row Level Security للتطوير
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;

-- إضافة فهارس لتحسين الأداء
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- إضافة بيانات تجريبية للمبيعات
INSERT INTO sales (customer_id, customer_name, total_amount, discount_amount, final_amount, payment_status, notes, created_by) VALUES
(1, 'أحمد محمد علي', 500.00, 25.00, 475.00, 'paid', 'فاتورة تجريبية', 'admin@hcp.com'),
(2, 'شركة البناء الحديث', 1200.00, 120.00, 1080.00, 'pending', 'طلبية كبيرة', 'admin@hcp.com');

-- إضافة تفاصيل المبيعات التجريبية
INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price) VALUES
(1, 1, 'دهان أبيض مطفي', 10, 45.50, 455.00),
(1, 2, 'دهان أزرق لامع', 1, 52.00, 52.00),
(2, 1, 'دهان أبيض مطفي', 20, 45.50, 910.00),
(2, 3, 'دهان أحمر ديكوري', 5, 38.75, 193.75);
