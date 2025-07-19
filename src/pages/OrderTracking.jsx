import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { hasPermission, currentUser } = useAuth();
  const { sales, customers, getCustomerById, updateSale } = useData();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const orderStatuses = [
    { id: 'pending', name: 'معلق', color: 'gray', icon: ClockIcon },
    { id: 'submitted', name: 'تم تقديم الطلب', color: 'blue', icon: ClockIcon },
    { id: 'processing', name: 'قيد التشغيل', color: 'yellow', icon: PlayIcon },
    { id: 'delayed', name: 'مؤجل', color: 'red', icon: PauseIcon },
    { id: 'shipped', name: 'تم الشحن', color: 'purple', icon: TruckIcon },
    { id: 'delivered', name: 'تم التسليم', color: 'green', icon: CheckCircleIcon },
    { id: 'cancelled', name: 'ملغي', color: 'gray', icon: XCircleIcon }
  ];

  // Convert sales data to orders format
  useEffect(() => {
    if (!sales || sales.length === 0) {
      setOrders([]);
      return;
    }

    console.log('Sales data for order tracking:', sales);

    const convertedOrders = sales.map(sale => {
      console.log('Processing sale:', sale);

      // استخدام customer_id بدلاً من customerId
      const customerId = sale.customer_id || sale.customerId;
      const customer = getCustomerById(customerId);

      // Map status names to IDs
      const statusMapping = {
        'معلق': 'pending',
        'تم تقديم الطلب': 'submitted',
        'قيد التشغيل': 'processing',
        'مؤجل': 'delayed',
        'تم الشحن': 'shipped',
        'تم التسليم': 'delivered',
        'ملغي': 'cancelled'
      };

      // قراءة البيانات من الحقول المباشرة
      const orderStatus = sale.order_status || sale.orderStatus || 'معلق';
      const paymentMethod = sale.payment_method || sale.paymentMethod || 'غير محدد';
      const orderNumber = sale.order_number || `ORD-${sale.id}`;
      const statusId = statusMapping[orderStatus] || 'pending';

      const convertedOrder = {
        id: sale.id,
        orderNumber: orderNumber,
        customerName: sale.customer_name || sale.customerName || customer?.name || 'غير محدد',
        customerPhone: customer?.phone || 'غير محدد',
        totalAmount: sale.final_amount || sale.finalAmount || sale.total_amount || 0,
        status: statusId,
        paymentMethod: paymentMethod,
        createdAt: new Date(sale.created_at || sale.createdAt || new Date()),
        updatedAt: new Date(sale.updated_at || sale.updatedAt || sale.created_at || sale.createdAt || new Date()),
        items: sale.sale_items || sale.items || [],
        statusHistory: [
          {
            status: statusId,
            date: new Date(sale.created_at || sale.createdAt || new Date()),
            note: 'تم إنشاء الطلب',
            updatedBy: sale.created_by || sale.createdBy || 'النظام'
          }
        ]
      };

      console.log('Converted order:', convertedOrder);
      return convertedOrder;
    });

    console.log('Final converted orders:', convertedOrders);
    setOrders(convertedOrders);
  }, [sales, customers, getCustomerById]);

  // Keep sample orders as fallback for demo
  useEffect(() => {
    if (orders.length > 0) return; // Don't load sample if we have real data

    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        customerName: 'أحمد محمد علي',
        customerPhone: '01012345678',
        totalAmount: 2500.00,
        status: 'submitted',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        items: [
          { productName: 'دهان أبيض مطفي', quantity: 5, unitPrice: 45.50 },
          { productName: 'دهان أزرق لامع', quantity: 3, unitPrice: 52.00 }
        ],
        statusHistory: [
          { status: 'submitted', date: new Date('2024-01-15'), note: 'تم استلام الطلب', updatedBy: 'admin@hcp.com' }
        ]
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        customerName: 'شركة البناء الحديث',
        customerPhone: '01098765432',
        totalAmount: 15000.00,
        status: 'processing',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-16'),
        items: [
          { productName: 'دهان أحمر ديكوري', quantity: 20, unitPrice: 38.75 },
          { productName: 'دهان أخضر نصف لامع', quantity: 15, unitPrice: 48.25 }
        ],
        statusHistory: [
          { status: 'submitted', date: new Date('2024-01-14'), note: 'تم استلام الطلب', updatedBy: 'admin@hcp.com' },
          { status: 'processing', date: new Date('2024-01-16'), note: 'بدء تجهيز الطلب', updatedBy: 'manager@hcp.com' }
        ]
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        customerName: 'فاطمة أحمد حسن',
        customerPhone: '01156789012',
        totalAmount: 1200.00,
        status: 'shipped',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-17'),
        items: [
          { productName: 'دهان بني كلاسيكي', quantity: 8, unitPrice: 41.00 }
        ],
        statusHistory: [
          { status: 'submitted', date: new Date('2024-01-12'), note: 'تم استلام الطلب', updatedBy: 'admin@hcp.com' },
          { status: 'processing', date: new Date('2024-01-14'), note: 'بدء تجهيز الطلب', updatedBy: 'manager@hcp.com' },
          { status: 'shipped', date: new Date('2024-01-17'), note: 'تم الشحن مع شركة النقل', updatedBy: 'admin@hcp.com' }
        ]
      }
    ];
    setOrders(sampleOrders);
  }, [orders.length]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  const getStatusInfo = (statusId) => {
    return orderStatuses.find(status => status.id === statusId) || orderStatuses[0];
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      // Map status ID back to Arabic name for database
      const statusMapping = {
        'pending': 'معلق',
        'submitted': 'تم تقديم الطلب',
        'processing': 'قيد التشغيل',
        'delayed': 'مؤجل',
        'shipped': 'تم الشحن',
        'delivered': 'تم التسليم',
        'cancelled': 'ملغي'
      };

      const statusName = statusMapping[newStatus] || 'معلق';

      // تحديث في قاعدة البيانات
      if (updateSale) {
        await updateSale(selectedOrder.id, {
          order_status: statusName,
          updated_at: new Date().toISOString()
        });
      }

      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          const newStatusHistory = [
            ...order.statusHistory,
            {
              status: newStatus,
              date: new Date(),
              note: statusNote || 'تم تحديث حالة الطلب',
              updatedBy: currentUser.email
            }
          ];

        return {
          ...order,
          status: newStatus,
          updatedAt: new Date(),
          statusHistory: newStatusHistory
        };
      }
      return order;
    });

      setOrders(updatedOrders);
      setIsModalOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      toast.success('تم تحديث حالة الطلب بنجاح');

    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">تتبع الطلبات</h1>
        <p className="text-secondary-600 mt-1">إدارة ومتابعة حالة جميع الطلبات</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-secondary-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="البحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              {orderStatuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary-900">{order.orderNumber}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                    <StatusIcon className="w-3 h-3 ml-1" />
                    {statusInfo.name}
                  </span>
                </div>
                <p className="text-sm text-secondary-600 mt-1">{order.customerName}</p>
                <p className="text-sm text-secondary-500">{order.customerPhone}</p>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">المبلغ الإجمالي:</span>
                    <span className="font-medium text-secondary-900">{order.totalAmount.toLocaleString()} ج.م</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">تاريخ الطلب:</span>
                    <span className="text-secondary-900">{order.createdAt.toLocaleDateString('ar-EG')}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">آخر تحديث:</span>
                    <span className="text-secondary-900">{order.updatedAt.toLocaleDateString('ar-EG')}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-secondary-600">الأصناف:</span>
                    <div className="mt-1 space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-xs text-secondary-500">
                          {item.productName} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-secondary-400">
                          +{order.items.length - 2} صنف آخر
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-200">
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => openStatusModal(order)}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    <PencilIcon className="w-4 h-4 ml-1" />
                    تحديث الحالة
                  </button>
                  <button className="btn-secondary text-sm py-2 px-3">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تحديث حالة الطلب"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">
                الطلب: {selectedOrder.orderNumber}
              </h4>
              <p className="text-sm text-secondary-600">
                العميل: {selectedOrder.customerName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                الحالة الجديدة *
              </label>
              <select
                className="input-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {orderStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                ملاحظة التحديث
              </label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="أضف ملاحظة حول تحديث الحالة..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            {/* Status History */}
            <div>
              <h5 className="font-medium text-secondary-900 mb-2">تاريخ الحالات</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedOrder.statusHistory.map((history, index) => {
                  const statusInfo = getStatusInfo(history.status);
                  return (
                    <div key={index} className="flex items-start space-x-3 space-x-reverse text-sm">
                      <div className={`w-2 h-2 rounded-full bg-${statusInfo.color}-500 mt-2`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{statusInfo.name}</span>
                          <span className="text-secondary-500">{history.date.toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-secondary-600">{history.note}</p>
                        <p className="text-xs text-secondary-400">بواسطة: {history.updatedBy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={handleStatusUpdate}
                className="btn-primary"
                disabled={!newStatus}
              >
                تحديث الحالة
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTracking;
