import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineRefresh,
} from 'react-icons/hi';
import api from '../../services/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      if (response.data.success) {
        setPayments(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from payments
  const calculateStats = (paymentData) => {
    const completed = paymentData.filter(p => p.status === 'completed');
    const pending = paymentData.filter(p => p.status === 'pending');
    const failed = paymentData.filter(p => p.status === 'failed');
    
    setStats({
      totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: completed.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
    });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const memberName = payment.user?.name || '';
    const memberEmail = payment.user?.email || '';
    const matchesSearch =
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: HiOutlineCheckCircle },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: HiOutlineClock },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: HiOutlineXCircle },
      refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: HiOutlineRefresh },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${style.bg} ${style.text}`}>
        <Icon className="mr-1" size={14} />
        {status}
      </span>
    );
  };

  const getMethodIcon = (method) => {
    const icons = {
      card: <HiOutlineCreditCard className="text-blue-400" size={20} />,
      upi: <span className="text-green-400 font-bold text-sm">UPI</span>,
      netbanking: <HiOutlineCreditCard className="text-purple-400" size={20} />,
      wallet: <HiOutlineCash className="text-yellow-400" size={20} />,
      other: <HiOutlineCash className="text-gray-400" size={20} />,
    };
    return icons[method] || icons.other;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Payments</h1>
          <p className="text-gray-400 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchPayments}
            className="flex items-center px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-gray-300 hover:text-white hover:border-dark-500 transition-colors"
          >
            <HiOutlineRefresh className="mr-2" size={20} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-gray-300 hover:text-white hover:border-dark-500 transition-colors">
            <HiOutlineDownload className="mr-2" size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-2xl p-5 border border-dark-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <HiOutlineCash className="text-green-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 rounded-2xl p-5 border border-dark-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.completedPayments}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <HiOutlineCheckCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-2xl p-5 border border-dark-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingPayments}</h3>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <HiOutlineClock className="text-yellow-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-2xl p-5 border border-dark-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.failedPayments}</h3>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <HiOutlineXCircle className="text-red-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Razorpay Integration Info */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <HiOutlineCreditCard className="text-green-400" size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium">Razorpay Payment Integration Active</h4>
            <p className="text-gray-400 text-sm mt-1">
              All payments made through the Pricing page are automatically recorded here. 
              Payments are processed securely via Razorpay.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700/50">
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Order ID</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Member</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Plan</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Amount</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Method</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <HiOutlineCreditCard className="text-gray-600 mb-3" size={48} />
                      <p className="text-lg font-medium">No payments found</p>
                      <p className="text-sm mt-1">Payments will appear here when users make purchases</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{payment.orderId?.slice(0, 20)}...</p>
                        <p className="text-gray-400 text-xs mt-1">{payment.paymentId?.slice(0, 20)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                          {payment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-white font-medium">{payment.user?.name || 'Unknown User'}</p>
                          <p className="text-gray-400 text-sm">{payment.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          {payment.planName}
                        </span>
                        <p className="text-gray-400 text-xs mt-1 capitalize">{payment.billingCycle}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">₹{payment.amount?.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-gray-300 capitalize">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {filteredPayments.length} of {payments.length} transactions
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-primary-500 rounded-lg text-white">1</button>
            <button className="px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
