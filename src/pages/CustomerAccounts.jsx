import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  PrinterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CustomerAccounts = () => {
  const { hasPermission, currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sample data
  useEffect(() => {
    const sampleCustomers = [
      {
        id: 1,
        name: 'أحمد محمد علي',
        phone: '01012345678',
        email: 'ahmed.mohamed@email.com',
        address: 'شارع النيل، المعادي، القاهرة',
        creditLimit: 10000,
        balance: 2500.00, // موجب = له علينا، سالب = عليه لنا
        lastTransaction: new Date('2024-01-15'),
        totalPurchases: 25000.00,
        discount: 5
      },
      {
        id: 2,
        name: 'شركة البناء الحديث',
        phone: '01098765432',
        email: 'info@modernbuild.com',
        address: 'شارع التحرير، وسط البلد، القاهرة',
        creditLimit: 50000,
        balance: -1500.00,
        lastTransaction: new Date('2024-01-14'),
        totalPurchases: 150000.00,
        discount: 10
      },
      {
        id: 3,
        name: 'فاطمة أحمد حسن',
        phone: '01156789012',
        email: 'fatma.ahmed@email.com',
        address: 'شارع الجمهورية، المنصورة',
        creditLimit: 5000,
        balance: 0,
        lastTransaction: new Date('2024-01-12'),
        totalPurchases: 8000.00,
        discount: 3
      },
      {
        id: 4,
        name: 'محمد حسن إبراهيم',
        phone: '01234567890',
        email: 'mohamed.hassan@email.com',
        address: 'شارع الهرم، الجيزة',
        creditLimit: 15000,
        balance: 5200.00,
        lastTransaction: new Date('2024-01-10'),
        totalPurchases: 45000.00,
        discount: 7
      }
    ];

    const sampleTransactions = {
      1: [
        {
          id: 1,
          date: new Date('2024-01-15'),
          type: 'invoice',
          reference: 'INV-2024-001',
          description: 'فاتورة مبيعات - دهانات متنوعة',
          debit: 2500.00,
          credit: 0,
          balance: 2500.00
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          type: 'payment',
          reference: 'PAY-2024-001',
          description: 'دفعة نقدية',
          debit: 0,
          credit: 1000.00,
          balance: 0
        },
        {
          id: 3,
          date: new Date('2024-01-08'),
          type: 'invoice',
          reference: 'INV-2024-002',
          description: 'فاتورة مبيعات - دهان أبيض',
          debit: 1000.00,
          credit: 0,
          balance: 1000.00
        }
      ],
      2: [
        {
          id: 4,
          date: new Date('2024-01-14'),
          type: 'payment',
          reference: 'PAY-2024-002',
          description: 'دفعة بنكية',
          debit: 0,
          credit: 3000.00,
          balance: -1500.00
        },
        {
          id: 5,
          date: new Date('2024-01-12'),
          type: 'invoice',
          reference: 'INV-2024-003',
          description: 'فاتورة مبيعات - دهانات ديكورية',
          debit: 1500.00,
          credit: 0,
          balance: 1500.00
        }
      ],
      3: [
        {
          id: 6,
          date: new Date('2024-01-12'),
          type: 'payment',
          reference: 'PAY-2024-003',
          description: 'دفعة نقدية - تسوية الحساب',
          debit: 0,
          credit: 1200.00,
          balance: 0
        },
        {
          id: 7,
          date: new Date('2024-01-10'),
          type: 'invoice',
          reference: 'INV-2024-004',
          description: 'فاتورة مبيعات - دهان بني',
          debit: 1200.00,
          credit: 0,
          balance: 1200.00
        }
      ],
      4: [
        {
          id: 8,
          date: new Date('2024-01-10'),
          type: 'invoice',
          reference: 'INV-2024-005',
          description: 'فاتورة مبيعات - دهانات متنوعة',
          debit: 5200.00,
          credit: 0,
          balance: 5200.00
        }
      ]
    };

    setCustomers(sampleCustomers);
    setFilteredCustomers(sampleCustomers);
    setCustomerTransactions(sampleTransactions);
  }, []);

  // Filter customers
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (balanceFilter !== 'all') {
      filtered = filtered.filter(customer => {
        if (balanceFilter === 'positive') return customer.balance > 0;
        if (balanceFilter === 'negative') return customer.balance < 0;
        if (balanceFilter === 'zero') return customer.balance === 0;
        return true;
      });
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, balanceFilter]);

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600'; // له علينا
    if (balance < 0) return 'text-green-600'; // عليه لنا
    return 'text-secondary-600'; // متوازن
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `له علينا ${balance.toLocaleString()} ج.م`;
    if (balance < 0) return `عليه لنا ${Math.abs(balance).toLocaleString()} ج.م`;
    return 'متوازن';
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <CurrencyDollarIcon className="w-4 h-4 text-green-500" />;
      case 'return':
        return <ArrowUpIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-secondary-500" />;
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'invoice': return 'فاتورة';
      case 'payment': return 'دفعة';
      case 'return': return 'مرتجع';
      default: return 'حركة';
    }
  };

  const openCustomerStatement = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const printStatement = (customer) => {
    // Print functionality
    toast.success(`تم طباعة كشف حساب ${customer.name}`);
  };

  const exportStatement = (customer) => {
    // Export functionality
    toast.success(`تم تصدير كشف حساب ${customer.name}`);
  };

  const filteredTransactions = selectedCustomer 
    ? (customerTransactions[selectedCustomer.id] || []).filter(transaction => {
        if (!dateFrom && !dateTo) return true;
        const transactionDate = transaction.date.toISOString().split('T')[0];
        if (dateFrom && transactionDate < dateFrom) return false;
        if (dateTo && transactionDate > dateTo) return false;
        return true;
      })
    : [];

  const totalDebit = filteredTransactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = filteredTransactions.reduce((sum, t) => sum + t.credit, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">حسابات العملاء</h1>
        <p className="text-secondary-600 mt-1">كشف حساب وحركات العملاء المالية</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-secondary-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">لهم علينا</p>
              <p className="text-2xl font-bold text-red-600">
                {customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowDownIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">عليهم لنا</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.abs(customers.filter(c => c.balance < 0).reduce((sum, c) => sum + c.balance, 0)).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-secondary-600">الرصيد الصافي</p>
              <p className={`text-2xl font-bold ${getBalanceColor(customers.reduce((sum, c) => sum + c.balance, 0))}`}>
                {customers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-secondary-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف، أو البريد الإلكتروني..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="input-field"
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
            >
              <option value="all">جميع الأرصدة</option>
              <option value="positive">لهم علينا</option>
              <option value="negative">عليهم لنا</option>
              <option value="zero">متوازن</option>
            </select>
          </div>

          <div className="flex space-x-2 space-x-reverse">
            <button className="btn-secondary flex-1">
              <PrinterIcon className="w-4 h-4 ml-1" />
              طباعة التقرير
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الرصيد الحالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الحد الائتماني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  إجمالي المشتريات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  آخر حركة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-secondary-900">{customer.name}</div>
                        <div className="text-sm text-secondary-500">{customer.phone}</div>
                        <div className="text-xs text-secondary-400">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getBalanceColor(customer.balance)}`}>
                      {getBalanceText(customer.balance)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {customer.creditLimit.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {customer.totalPurchases.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {customer.lastTransaction.toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => openCustomerStatement(customer)}
                        className="text-primary-600 hover:text-primary-900"
                        title="كشف الحساب"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => printStatement(customer)}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="طباعة"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Statement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`كشف حساب - ${selectedCustomer?.name}`}
        size="xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-secondary-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">بيانات العميل</h4>
                  <p className="text-sm text-secondary-600">الاسم: {selectedCustomer.name}</p>
                  <p className="text-sm text-secondary-600">الهاتف: {selectedCustomer.phone}</p>
                  <p className="text-sm text-secondary-600">البريد: {selectedCustomer.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">الرصيد الحالي</h4>
                  <p className={`text-lg font-bold ${getBalanceColor(selectedCustomer.balance)}`}>
                    {getBalanceText(selectedCustomer.balance)}
                  </p>
                  <p className="text-sm text-secondary-600">
                    الحد الائتماني: {selectedCustomer.creditLimit.toLocaleString()} ج.م
                  </p>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">من تاريخ</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border border-secondary-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">النوع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">المرجع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">البيان</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">مدين</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">دائن</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-sm text-secondary-900">
                        {transaction.date.toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getTransactionIcon(transaction.type)}
                          <span>{getTransactionTypeText(transaction.type)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-900">{transaction.reference}</td>
                      <td className="px-4 py-3 text-sm text-secondary-600">{transaction.description}</td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {transaction.debit > 0 ? transaction.debit.toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {transaction.credit > 0 ? transaction.credit.toLocaleString() : '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${getBalanceColor(transaction.balance)}`}>
                        {transaction.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary-50">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-sm font-medium text-secondary-900">الإجمالي</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">{totalDebit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{totalCredit.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${getBalanceColor(selectedCustomer.balance)}`}>
                      {selectedCustomer.balance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-4">
              <button
                onClick={() => exportStatement(selectedCustomer)}
                className="btn-secondary"
              >
                تصدير Excel
              </button>
              <button
                onClick={() => printStatement(selectedCustomer)}
                className="btn-primary"
              >
                <PrinterIcon className="w-4 h-4 ml-1" />
                طباعة
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerAccounts;
