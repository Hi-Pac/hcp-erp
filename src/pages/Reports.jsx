import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const reportTypes = [
    { value: 'sales', label: 'تقرير المبيعات' },
    { value: 'returns', label: 'تقرير المرتجعات' },
    { value: 'customers', label: 'تقرير نشاط العملاء' },
    { value: 'inventory', label: 'تقرير المنتجات والمخزون' },
    { value: 'payments', label: 'تقرير المدفوعات' }
  ];

  // Sample chart data
  const salesChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'المبيعات الشهرية',
        data: [65000, 59000, 80000, 81000, 56000, 125000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const productSalesData = {
    labels: ['دهان أبيض مطفي', 'دهان أزرق خارجي', 'دهان أحمر ديكوري', 'دهان أخضر', 'دهان أسود'],
    datasets: [
      {
        label: 'المبيعات حسب المنتج',
        data: [120, 85, 65, 45, 30],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const customerDistributionData = {
    labels: ['مؤسسات/مشاريع', 'محلات تجارية', 'أفراد'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleExportPDF = () => {
    // Implementation for PDF export
    alert('سيتم تصدير التقرير كملف PDF');
  };

  const handleExportExcel = () => {
    // Implementation for Excel export
    alert('سيتم تصدير التقرير كملف Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">المبيعات الشهرية</h3>
                <Line data={salesChartData} options={chartOptions} />
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">المبيعات حسب المنتج</h3>
                <Bar data={productSalesData} options={chartOptions} />
              </div>
            </div>
            
            {/* Sales Summary Table */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">ملخص المبيعات</h3>
              <div className="table-container">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="table-header">الشهر</th>
                      <th className="table-header">عدد الطلبات</th>
                      <th className="table-header">إجمالي المبيعات</th>
                      <th className="table-header">متوسط قيمة الطلب</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    <tr>
                      <td className="table-cell">يناير 2024</td>
                      <td className="table-cell">25</td>
                      <td className="table-cell">65,000 ر.س</td>
                      <td className="table-cell">2,600 ر.س</td>
                    </tr>
                    <tr>
                      <td className="table-cell">فبراير 2024</td>
                      <td className="table-cell">22</td>
                      <td className="table-cell">59,000 ر.س</td>
                      <td className="table-cell">2,682 ر.س</td>
                    </tr>
                    <tr>
                      <td className="table-cell">مارس 2024</td>
                      <td className="table-cell">30</td>
                      <td className="table-cell">80,000 ر.س</td>
                      <td className="table-cell">2,667 ر.س</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">توزيع العملاء</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={customerDistributionData} />
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">إحصائيات العملاء</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                    <span className="font-medium">إجمالي العملاء</span>
                    <span className="text-xl font-bold text-primary-600">128</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">العملاء النشطين</span>
                    <span className="text-xl font-bold text-green-600">95</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">عملاء جدد هذا الشهر</span>
                    <span className="text-xl font-bold text-yellow-600">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">حالة المخزون</h3>
              <div className="table-container">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="table-header">المنتج</th>
                      <th className="table-header">الكمية المتوفرة</th>
                      <th className="table-header">الحد الأدنى</th>
                      <th className="table-header">الحالة</th>
                      <th className="table-header">القيمة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    <tr>
                      <td className="table-cell">دهان أبيض مطفي</td>
                      <td className="table-cell">120</td>
                      <td className="table-cell">20</td>
                      <td className="table-cell">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          متوفر
                        </span>
                      </td>
                      <td className="table-cell">5,460 ر.س</td>
                    </tr>
                    <tr>
                      <td className="table-cell">دهان أزرق خارجي</td>
                      <td className="table-cell">85</td>
                      <td className="table-cell">15</td>
                      <td className="table-cell">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          متوفر
                        </span>
                      </td>
                      <td className="table-cell">4,420 ر.س</td>
                    </tr>
                    <tr>
                      <td className="table-cell">دهان أحمر ديكوري</td>
                      <td className="table-cell">8</td>
                      <td className="table-cell">10</td>
                      <td className="table-cell">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          نفد المخزون
                        </span>
                      </td>
                      <td className="table-cell">480 ر.س</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="card">
            <div className="text-center py-12">
              <ChartBarIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">اختر نوع التقرير</h3>
              <p className="text-secondary-500">حدد نوع التقرير من القائمة أعلاه لعرض البيانات</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">التقارير</h1>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center"
          >
            <PrinterIcon className="w-4 h-4 ml-2" />
            طباعة
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="w-4 h-4 ml-2" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center"
          >
            <DocumentArrowDownIcon className="w-4 h-4 ml-2" />
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              نوع التقرير
            </label>
            <select
              className="input-field"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              من تاريخ
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="date"
                className="input-field pr-10"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              إلى تاريخ
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="date"
                className="input-field pr-10"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              العميل
            </label>
            <select
              className="input-field"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">جميع العملاء</option>
              <option value="1">أحمد محمد علي</option>
              <option value="2">شركة البناء الحديث</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              المنتج
            </label>
            <select
              className="input-field"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">جميع المنتجات</option>
              <option value="1">دهان أبيض مطفي</option>
              <option value="2">دهان أزرق خارجي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
