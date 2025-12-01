import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from 'react-icons/hi';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Sample payment data - this will be replaced with real API integration later
  const payments = [
    {
      id: 'PAY-001',
      member: { name: 'John Smith', email: 'john@email.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
      plan: 'Premium',
      amount: 59,
      method: 'card',
      status: 'completed',
      date: '2024-12-01',
      transactionId: 'TXN_1234567890',
    },
    {
      id: 'PAY-002',
      member: { name: 'Sarah Johnson', email: 'sarah@email.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      plan: 'Elite',
      amount: 99,
      method: 'card',
      status: 'completed',
      date: '2024-12-01',
      transactionId: 'TXN_1234567891',
    },
    {
      id: 'PAY-003',
      member: { name: 'Mike Williams', email: 'mike@email.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      plan: 'Basic',
      amount: 29,
      method: 'cash',
      status: 'pending',
      date: '2024-11-30',
      transactionId: 'TXN_1234567892',
    },
    {
      id: 'PAY-004',
      member: { name: 'Emily Davis', email: 'emily@email.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
      plan: 'Premium',
      amount: 59,
      method: 'card',
      status: 'failed',
      date: '2024-11-30',
      transactionId: 'TXN_1234567893',
    },
    {
      id: 'PAY-005',
      member: { name: 'David Chen', email: 'david@email.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
      plan: 'Elite',
      amount: 99,
      method: 'card',
      status: 'completed',
      date: '2024-11-29',
      transactionId: 'TXN_1234567894',
    },
  ];

  // Stats
  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: HiOutlineCheckCircle },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: HiOutlineClock },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: HiOutlineXCircle },
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${style.bg} ${style.text}`}>
        <Icon className="mr-1" size={14} />
        {status}
      </span>
    );
  };

  const getMethodIcon = (method) => {
    return method === 'card' ? (
      <HiOutlineCreditCard className="text-blue-400" size={20} />
    ) : (
      <HiOutlineCash className="text-green-400" size={20} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Payments</h1>
          <p className="text-gray-400 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center space-x-3">
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
              <h3 className="text-2xl font-bold text-white mt-1">${stats.totalRevenue}</h3>
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

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <HiOutlineCreditCard className="text-primary-400" size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium">Payment Integration Coming Soon</h4>
            <p className="text-gray-400 text-sm mt-1">
              Full payment gateway integration (Stripe/PayPal) will be added in a future update. 
              Currently showing sample transaction data for demonstration purposes.
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
              placeholder="Search by name, ID, or transaction..."
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
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700/50">
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Transaction ID</th>
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
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{payment.id}</p>
                        <p className="text-gray-400 text-xs">{payment.transactionId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={payment.member.avatar}
                          alt={payment.member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="text-white font-medium">{payment.member.name}</p>
                          <p className="text-gray-400 text-sm">{payment.member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">${payment.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-gray-300 capitalize">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-gray-300">{payment.date}</td>
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
