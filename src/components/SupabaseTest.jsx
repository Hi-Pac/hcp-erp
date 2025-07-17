import React, { useState } from 'react';
import { supabase, testSupabaseConnection } from '../supabase/supabaseClient';
import toast from 'react-hot-toast';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      toast.loading('جاري اختبار الاتصال...', { id: 'supabase-test' });
      
      const result = await testSupabaseConnection();
      setTestResults(result);
      
      if (result.success) {
        toast.success('نجح الاتصال بـ Supabase!', { id: 'supabase-test' });
      } else {
        toast.error('فشل الاتصال بـ Supabase', { id: 'supabase-test' });
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ success: false, error: error.message });
      toast.error('خطأ في الاختبار: ' + error.message, { id: 'supabase-test' });
    } finally {
      setIsLoading(false);
    }
  };

  const testInsertProduct = async () => {
    setIsLoading(true);
    
    try {
      toast.loading('جاري اختبار إضافة منتج...', { id: 'insert-test' });
      
      const testProduct = {
        name: 'منتج تجريبي - ' + new Date().toLocaleTimeString(),
        category: 'اختبار',
        price: 99.99,
        quantity: 10,
        min_quantity: 5,
        description: 'هذا منتج تجريبي لاختبار الاتصال',
        batches: ['TEST001'],
        created_by: 'test@hcp.com'
      };

      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('تم إضافة المنتج التجريبي بنجاح!', { id: 'insert-test' });
      console.log('Test product added:', data);
      
    } catch (error) {
      console.error('Insert test error:', error);
      toast.error('فشل في إضافة المنتج التجريبي: ' + error.message, { id: 'insert-test' });
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchProducts = async () => {
    setIsLoading(true);
    
    try {
      toast.loading('جاري اختبار جلب المنتجات...', { id: 'fetch-test' });
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (error) {
        throw error;
      }

      toast.success(`تم جلب ${data.length} منتج بنجاح!`, { id: 'fetch-test' });
      console.log('Fetched products:', data);
      
    } catch (error) {
      console.error('Fetch test error:', error);
      toast.error('فشل في جلب المنتجات: ' + error.message, { id: 'fetch-test' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">اختبار اتصال Supabase</h3>
      
      <div className="space-y-4">
        {/* أزرار الاختبار */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runConnectionTest}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
          </button>
          
          <button
            onClick={testFetchProducts}
            disabled={isLoading}
            className="btn-secondary"
          >
            اختبار جلب البيانات
          </button>
          
          <button
            onClick={testInsertProduct}
            disabled={isLoading}
            className="btn-secondary"
          >
            اختبار إضافة منتج
          </button>
        </div>

        {/* نتائج الاختبار */}
        {testResults && (
          <div className={`p-4 rounded-lg ${
            testResults.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <span className={`text-lg ${
                testResults.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResults.success ? '✅' : '❌'}
              </span>
              <span className={`mr-2 font-medium ${
                testResults.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResults.success ? 'نجح الاتصال!' : 'فشل الاتصال'}
              </span>
            </div>
            
            {testResults.error && (
              <p className="text-red-600 text-sm mt-2">
                خطأ: {testResults.error}
              </p>
            )}
            
            {testResults.message && (
              <p className="text-green-600 text-sm mt-2">
                {testResults.message}
              </p>
            )}
          </div>
        )}

        {/* معلومات الإعداد */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-900 mb-2">معلومات الإعداد</h4>
          <div className="text-blue-800 text-sm space-y-1">
            <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
            <p><strong>Key:</strong> {supabase.supabaseKey ? 'موجود' : 'مفقود'}</p>
          </div>
        </div>

        {/* تعليمات */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-yellow-900 mb-2">تعليمات</h4>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• تأكد من تحديث URL و API Key في ملف supabaseClient.js</li>
            <li>• تأكد من إنشاء الجداول في Supabase</li>
            <li>• تأكد من إعداد Row Level Security</li>
            <li>• راجع وحدة التحكم للحصول على تفاصيل الأخطاء</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
