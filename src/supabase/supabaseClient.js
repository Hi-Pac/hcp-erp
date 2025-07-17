import { createClient } from '@supabase/supabase-js'

// إعدادات Supabase - تم تحديثها بالقيم الصحيحة
const supabaseUrl = 'https://qtkizwqjginkmwoackjm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0a2l6d3FqZ2lua213b2Fja2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Nzg3NDgsImV4cCI6MjA2ODE1NDc0OH0.1kLdAHV2uLaAoHnaL7coI35yA5gsZt1c4QOKncSBzTs'

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// دالة للتحقق من الاتصال
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ تم الاتصال بـ Supabase بنجاح')
    return { success: true, message: 'الاتصال ناجح' }
  } catch (error) {
    console.error('خطأ في اختبار الاتصال:', error)
    return { success: false, error: error.message }
  }
}

// دالة للحصول على المستخدم الحالي
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// دالة لتسجيل الدخول
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// دالة لتسجيل الخروج
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// دالة لإنشاء مستخدم جديد
export const signUp = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}
