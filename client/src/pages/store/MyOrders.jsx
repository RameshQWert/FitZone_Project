import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { storeService } from '../../services';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const orderStatuses = {
    pending: { label: 'Pending', color: 'yellow', icon: HiOutlineClock },
    confirmed: { label: 'Confirmed', color: 'blue', icon: HiOutlineCheckCircle },
    processing: { label: 'Processing', color: 'purple', icon: HiOutlineClock },
    shipped: { label: 'Shipped', color: 'cyan', icon: HiOutlineTruck },
    delivered: { label: 'Delivered', color: 'green', icon: HiOutlineCheckCircle },
    cancelled: { label: 'Cancelled', color: 'red', icon: HiOutlineXCircle },
  };

  const paymentStatuses = {
    pending: { label: 'Pending', color: 'yellow' },
    paid: { label: 'Paid', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
    refunded: { label: 'Refunded', color: 'gray' },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await storeService.getMyOrders({ page, limit: 10 });
      setOrders(response.data || []);
      setPagination(response.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await storeService.cancelOrder(orderId, 'Cancelled by customer');
      toast.success('Order cancelled successfully');
      fetchOrders(pagination.page);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = type === 'order' ? orderStatuses[status] : paymentStatuses[status];
    if (!statusConfig) return null;

    const colorClasses = {
      yellow: 'bg-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/20 text-purple-400',
      cyan: 'bg-cyan-500/20 text-cyan-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
      gray: 'bg-gray-500/20 text-gray-400',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusConfig.color]}`}>
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/store"
              className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-gray-400 text-sm">Track and manage your orders</p>
            </div>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-12 text-center"
          >
            <HiOutlineShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here!</p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-700 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">Order #{order.orderNumber}</p>
                    <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus, 'order')}
                    {getStatusBadge(order.paymentStatus, 'payment')}
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/60x60?text=No+Image'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-700"
                        />
                        <div>
                          <p className="text-gray-200 text-sm font-medium truncate max-w-[150px]">
                            {item.name}
                          </p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="flex items-center text-gray-400 text-sm">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-orange-400 font-bold text-lg">
                        ₹{order.totalAmount?.toLocaleString()}
                      </p>
                      {order.discount > 0 && (
                        <p className="text-green-400 text-xs">You saved ₹{order.discount}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View Details
                      </button>
                      {['pending', 'confirmed'].includes(order.orderStatus) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchOrders(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                  <p className="text-gray-400 text-sm">#{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <HiOutlineXCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order Status</p>
                    {getStatusBadge(selectedOrder.orderStatus, 'order')}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Payment Status</p>
                    {getStatusBadge(selectedOrder.paymentStatus, 'payment')}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Payment Method</p>
                    <span className="text-white capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-white font-medium mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-lg">
                        <img
                          src={item.image || 'https://via.placeholder.com/60x60?text=No+Image'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-700"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          {item.size && <p className="text-gray-400 text-sm">Size: {item.size}</p>}
                          {item.color && <p className="text-gray-400 text-sm">Color: {item.color}</p>}
                          {item.flavor && <p className="text-gray-400 text-sm">Flavor: {item.flavor}</p>}
                          <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-orange-400 font-medium">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-white font-medium mb-3">Shipping Address</h4>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-white font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.phone}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {selectedOrder.shippingAddress?.address}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <h4 className="text-white font-medium mb-3">Price Details</h4>
                  <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Items Total</span>
                      <span>₹{selectedOrder.itemsTotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span className={selectedOrder.shippingCost === 0 ? 'text-green-400' : ''}>
                        {selectedOrder.shippingCost === 0 ? 'FREE' : `₹${selectedOrder.shippingCost}`}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                        <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300">
                      <span>Tax (18% GST)</span>
                      <span>₹{selectedOrder.tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-600">
                      <span>Total</span>
                      <span className="text-orange-400">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                {selectedOrder.statusHistory?.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Order Timeline</h4>
                    <div className="space-y-3">
                      {selectedOrder.statusHistory.map((history, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                          <div>
                            <p className="text-white capitalize">{history.status}</p>
                            <p className="text-gray-400 text-sm">{history.note}</p>
                            <p className="text-gray-500 text-xs">
                              {formatDate(history.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                {['pending', 'confirmed'].includes(selectedOrder.orderStatus) && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
