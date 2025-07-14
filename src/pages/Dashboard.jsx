import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 125000,
    totalOrders: 45,
    totalCustomers: 128,
    totalProducts: 89,
    salesGrowth: 12.5,
    ordersGrowth: -2.3,
    customersGrowth: 8.7,
    productsGrowth: 5.2
  });

  // Sample data for charts
  const salesData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'المبيعات',
        data: [65000, 59000, 80000, 81000, 56000, 125000],
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: ['دهانات إنشائية', 'دهانات خارجية', 'دهانات ديكورية'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyOrdersData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'الطلبات',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
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

  const StatCard = ({ title, value, icon: Icon, growth, color = 'blue', currency = false }) => {
    const isPositive = growth > 0;
    const colorClasses = {
      blue: 'bg-primary-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-secondary-900">
              {value.toLocaleString()}{currency ? ' ج.م' : ''}
            </p>
            <div className="flex items-center mt-3">
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 ml-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 ml-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-sm text-secondary-500 mr-2">من الشهر الماضي</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]} flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">لوحة التحكم</h1>
        <div className="text-sm text-secondary-500">
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي المبيعات"
          value={stats.totalSales}
          icon={CurrencyDollarIcon}
          growth={stats.salesGrowth}
          color="blue"
          currency={true}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={ShoppingCartIcon}
          growth={stats.ordersGrowth}
          color="green"
        />
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={UsersIcon}
          growth={stats.customersGrowth}
          color="yellow"
        />
        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          icon={CubeIcon}
          growth={stats.productsGrowth}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">مبيعات الأشهر الستة الماضية</h3>
          <div className="h-64">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">توزيع المبيعات حسب الفئة</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={categoryData} />
          </div>
        </div>
      </div>

      {/* Monthly Orders and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">الطلبات الشهرية</h3>
          <div className="h-64">
            <Bar data={monthlyOrdersData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">النشاط الأخير</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-primary-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-secondary-900">طلب جديد من عميل أحمد محمد</p>
                <p className="text-xs text-secondary-500">منذ 5 دقائق</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-secondary-900">تم تحديث المخزون - دهان أبيض</p>
                <p className="text-xs text-secondary-500">منذ 15 دقيقة</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-secondary-900">دفعة جديدة من عميل سارة أحمد</p>
                <p className="text-xs text-secondary-500">منذ 30 دقيقة</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full ml-3"></div>
              <div>
                <p className="text-sm font-medium text-secondary-900">تم إنشاء فاتورة جديدة #1234</p>
                <p className="text-xs text-secondary-500">منذ ساعة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
