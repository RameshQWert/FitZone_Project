import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingCart,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

const StoreOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'yellow', icon: HiOutlineClock },
    { value: 'confirmed', label: 'Confirmed', color: 'blue', icon: HiOutlineCheckCircle },
    { value: 'processing', label: 'Processing', color: 'purple', icon: HiOutlineClock },
    { value: 'shipped', label: 'Shipped', color: 'cyan', icon: HiOutlineTruck },
    { value: 'delivered', label: 'Delivered', color: 'green', icon: HiOutlineCheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: HiOutlineXCircle },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'refunded', label: 'Refunded', color: 'gray' },
  ];

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { orderStatus: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
      };
      const response = await adminService.getStoreOrders(params);
      // API returns { success: true, data: orders[], pagination: {...} }
      setOrders(response.data || []);
      setPagination(response.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await adminService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(pagination.page);
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status, type = 'order') => {
    const statuses = type === 'order' ? orderStatuses : paymentStatuses;
    const found = statuses.find(s => s.value === status);
    return found?.color || 'gray';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineShoppingCart className="w-7 h-7 text-orange-400" />
            Store Orders
          </h1>
          <p className="text-gray-400 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Total: {pagination.total} orders</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID or user..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Order Status</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Payment Status</option>
            {paymentStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchOrders()}
            className="flex items-center justify-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Order ID</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Customer</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Items</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Total</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Payment</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Date</th>
                <th className="text-right text-gray-300 font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <HiOutlineShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-orange-400 font-mono text-sm">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{order.user?.fullName || 'N/A'}</p>
                        <p className="text-gray-500 text-sm">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{order.items?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">₹{order.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${getStatusColor(order.payment?.status, 'payment')}-500/20 text-${getStatusColor(order.payment?.status, 'payment')}-400`}>
                        {order.payment?.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingStatus === order._id}
                        className={`bg-${getStatusColor(order.orderStatus)}-500/20 text-${getStatusColor(order.orderStatus)}-400 px-2 py-1 rounded text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer disabled:opacity-50`}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status.value} value={status.value} className="bg-gray-800 text-white">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-700">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchOrders(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === i + 1
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            orderStatuses={orderStatuses}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
            updatingStatus={updatingStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, orderStatuses, onClose, onUpdateStatus, updatingStatus }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <p className="text-orange-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <label className="block text-gray-300 font-medium mb-2">Order Status</label>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => onUpdateStatus(order._id, status.value)}
                    disabled={updatingStatus === order._id || order.orderStatus === status.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      order.orderStatus === status.value
                        ? `bg-${status.color}-500 text-white`
                        : `bg-gray-700 text-gray-300 hover:bg-gray-600`
                    } disabled:opacity-50`}
                  >
                    <Icon className="w-4 h-4" />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <HiOutlineUser className="w-5 h-5 text-orange-400" />
                Customer Info
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-500">Name:</span> {order.user?.fullName || order.shipping?.name}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Email:</span> {order.user?.email}
                </p>
                <p className="text-gray-300 flex items-center gap-1">
                  <HiOutlinePhone className="w-4 h-4 text-gray-500" />
                  {order.shipping?.phone}
                </p>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-5 h-5 text-orange-400" />
                Shipping Address
              </h3>
              <div className="text-sm text-gray-300">
                <p>{order.shipping?.address}</p>
                <p>{order.shipping?.city}, {order.shipping?.state}</p>
                <p>PIN: {order.shipping?.pincode}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <HiOutlineCurrencyRupee className="w-5 h-5 text-orange-400" />
              Payment Info
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Method</p>
                <p className="text-gray-300 capitalize">{order.payment?.method || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className={`capitalize ${
                  order.payment?.status === 'paid' ? 'text-green-400' :
                  order.payment?.status === 'failed' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {order.payment?.status || 'pending'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Transaction ID</p>
                <p className="text-gray-300 font-mono text-xs">{order.payment?.razorpayPaymentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="text-gray-300">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Order Items ({order.items?.length})</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60x60'}
                    alt={item.product?.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.product?.name || 'Unknown Product'}</p>
                    {item.variant && <p className="text-gray-500 text-sm">Variant: {item.variant}</p>}
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount - (order.shippingCost || 0))?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{order.shippingCost ? `₹${order.shippingCost}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-white text-lg font-bold border-t border-gray-600 pt-2">
                <span>Total</span>
                <span className="text-orange-400">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoreOrders;
