import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingCart,
  HiOutlineCurrencyRupee,
  HiOutlineCollection,
  HiOutlineTruck,
  HiOutlineExclamation,
  HiOutlineTrendingUp,
  HiOutlineChartBar,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

const StoreDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
    categoryStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStoreDashboard({ timeRange });
      // The function returns data directly, not wrapped in response.data
      setStats({
        totalSales: response.totalRevenue || 0,
        totalOrders: response.totalOrders || 0,
        totalProducts: response.totalProducts || 0,
        pendingOrders: response.pendingOrders || 0,
        lowStockProducts: response.lowStockProducts?.length || 0,
        lowStockList: response.lowStockProducts || [],
        recentOrders: response.recentOrders || [],
        topProducts: response.bestSellers || [],
        categoryStats: response.categorySales || {},
        revenueByDate: response.revenueByDate || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${(stats.totalSales || 0).toLocaleString()}`,
      icon: HiOutlineCurrencyRupee,
      color: 'green',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: HiOutlineShoppingCart,
      color: 'blue',
      change: '+8%',
    },
    {
      title: 'Products',
      value: stats.totalProducts || 0,
      icon: HiOutlineCollection,
      color: 'purple',
      link: '/admin/store/products',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders || 0,
      icon: HiOutlineTruck,
      color: 'yellow',
      link: '/admin/store/orders?status=pending',
    },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineChartBar className="w-7 h-7 text-orange-400" />
            Store Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchDashboardStats}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const CardWrapper = card.link ? Link : 'div';
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardWrapper
                to={card.link}
                className={`block bg-gray-800/50 rounded-xl p-6 ${card.link ? 'hover:bg-gray-800 transition-colors cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{card.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                    {card.change && (
                      <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                        <HiOutlineTrendingUp className="w-4 h-4" />
                        {card.change}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg bg-${card.color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${card.color}-400`} />
                  </div>
                </div>
              </CardWrapper>
            </motion.div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <HiOutlineExclamation className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-yellow-400 font-medium">Low Stock Alert</h3>
            <p className="text-gray-400 text-sm">
              {stats.lowStockProducts} products have stock below 10 units
            </p>
          </div>
          <Link
            to="/admin/store/products?stock=low"
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            View Products
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link
              to="/admin/store/orders"
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders?.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div>
                    <p className="text-white font-medium">
                      #{order._id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-sm">{order.user?.fullName || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-medium">₹{order.totalAmount?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.orderStatus === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Best Selling Products</h2>
            <Link
              to="/admin/store/products"
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topProducts?.length > 0 ? (
              stats.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3"
                >
                  <span className="text-gray-500 font-bold w-6">#{index + 1}</span>
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/40x40'}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-sm">{product.soldCount || 0} sold</p>
                  </div>
                  <p className="text-orange-400 font-medium">₹{product.price?.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Sales by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Supplements', key: 'supplements', icon: '💊', color: 'orange' },
            { name: 'Clothing', key: 'clothing', icon: '👕', color: 'blue' },
            { name: 'Equipment', key: 'equipment', icon: '🏋️', color: 'purple' },
            { name: 'Accessories', key: 'accessories', icon: '🧤', color: 'green' },
          ].map((cat) => {
            const catStats = stats.categoryStats?.[cat.key] || { count: 0, revenue: 0 };
            return (
              <div key={cat.name} className="bg-gray-700/50 rounded-lg p-4 text-center">
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="text-white font-medium mt-2">{cat.name}</h3>
                <p className={`text-${cat.color}-400 font-bold text-lg`}>
                  ₹{(catStats.revenue || 0).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">{catStats.count || 0} products</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/store/products"
          className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 text-center transition-colors"
        >
          <HiOutlineCollection className="w-8 h-8 text-orange-400 mx-auto" />
          <p className="text-white font-medium mt-2">Manage Products</p>
        </Link>
        <Link
          to="/admin/store/orders"
          className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 text-center transition-colors"
        >
          <HiOutlineShoppingCart className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-white font-medium mt-2">View Orders</p>
        </Link>
        <Link
          to="/admin/store/products"
          className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 text-center transition-colors"
        >
          <HiOutlineTrendingUp className="w-8 h-8 text-green-400 mx-auto" />
          <p className="text-white font-medium mt-2">Add Product</p>
        </Link>
        <Link
          to="/store"
          target="_blank"
          className="bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 text-center transition-colors"
        >
          <HiOutlineChartBar className="w-8 h-8 text-purple-400 mx-auto" />
          <p className="text-white font-medium mt-2">Visit Store</p>
        </Link>
      </div>
    </div>
  );
};

export default StoreDashboard;
