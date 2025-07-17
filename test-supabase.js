// اختبار سريع للاتصال بـ Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtkizwqjginkmwoackjm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0a2l6d3FqZ2lua213b2Fja2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Nzg3NDgsImV4cCI6MjA2ODE1NDc0OH0.1kLdAHV2uLaAoHnaL7coI35yA5gsZt1c4QOKncSBzTs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🔄 اختبار الاتصال بـ Supabase...')
    
    // اختبار جلب المنتجات
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    if (productsError) {
      console.error('❌ خطأ في جلب المنتجات:', productsError)
      return false
    }

    console.log('✅ تم جلب المنتجات بنجاح:', products.length, 'منتج')
    console.log('📋 المنتجات:', products.map(p => p.name))

    // اختبار إضافة منتج تجريبي
    const testProduct = {
      name: 'منتج تجريبي - ' + new Date().toLocaleTimeString(),
      category: 'اختبار',
      price: 99.99,
      quantity: 10,
      min_quantity: 5,
      description: 'منتج تجريبي لاختبار الاتصال',
      batches: ['TEST001'],
      created_by: 'test@hcp.com'
    }

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (insertError) {
      console.error('❌ خطأ في إضافة المنتج:', insertError)
      return false
    }

    console.log('✅ تم إضافة المنتج التجريبي بنجاح:', newProduct.name)

    return true
  } catch (error) {
    console.error('❌ خطأ عام:', error)
    return false
  }
}

// تشغيل الاختبار
testConnection().then(success => {
  if (success) {
    console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للعمل أونلاين')
  } else {
    console.log('💥 فشل في الاختبار - راجع الأخطاء أعلاه')
  }
})
