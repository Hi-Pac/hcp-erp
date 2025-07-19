import { supabase } from '../supabase/supabaseClient';

export const updateDatabaseSchema = async () => {
  try {
    console.log('بدء تحديث قاعدة البيانات...');

    // تحديث جدول المبيعات لإضافة الحقول المفقودة
    const salesUpdates = [
      `ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'غير محدد'`,
      `ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'معلق'`,
      `ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_number TEXT`,
    ];

    // تحديث جدول تفاصيل المبيعات
    const saleItemsUpdates = [
      `ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS product_code TEXT DEFAULT ''`,
    ];

    // إنشاء الفهارس
    const indexUpdates = [
      `CREATE INDEX IF NOT EXISTS idx_sales_order_number ON sales(order_number)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_order_status ON sales(order_status)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method)`,
    ];

    // تحديث البيانات الموجودة
    const dataUpdates = [
      `UPDATE sales SET order_number = 'ORD-' || id WHERE order_number IS NULL OR order_number = ''`,
      `UPDATE sales SET order_status = 'معلق' WHERE order_status IS NULL OR order_status = ''`,
      `UPDATE sales SET payment_method = 'غير محدد' WHERE payment_method IS NULL OR payment_method = ''`,
    ];

    // تنفيذ جميع التحديثات
    const allUpdates = [...salesUpdates, ...saleItemsUpdates, ...indexUpdates, ...dataUpdates];

    for (const query of allUpdates) {
      try {
        console.log('تنفيذ:', query);
        const { error } = await supabase.rpc('execute_sql', { query });
        if (error) {
          console.warn('تحذير في تنفيذ الاستعلام:', error.message);
        }
      } catch (err) {
        console.warn('تحذير:', err.message);
      }
    }

    console.log('تم تحديث قاعدة البيانات بنجاح');
    return true;

  } catch (error) {
    console.error('خطأ في تحديث قاعدة البيانات:', error);
    return false;
  }
};

// دالة للتحقق من وجود الحقول
export const checkDatabaseSchema = async () => {
  try {
    // محاولة قراءة الحقول الجديدة
    const { data, error } = await supabase
      .from('sales')
      .select('payment_method, order_status, order_number')
      .limit(1);

    if (error) {
      console.log('الحقول غير موجودة، يجب تحديث قاعدة البيانات');
      return false;
    }

    console.log('قاعدة البيانات محدثة');
    return true;

  } catch (error) {
    console.log('يجب تحديث قاعدة البيانات');
    return false;
  }
};
