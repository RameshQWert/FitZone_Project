import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCash,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 1247,
    activeMembers: 892,
    totalTrainers: 8,
    totalRevenue: 45890,
    totalClasses: 24,
    newMembersThisMonth: 67,
  });

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 32000, members: 45 },
    { month: 'Feb', revenue: 35000, members: 52 },
    { month: 'Mar', revenue: 38000, members: 61 },
    { month: 'Apr', revenue: 42000, members: 58 },
    { month: 'May', revenue: 40000, members: 55 },
    { month: 'Jun', revenue: 45890, members: 67 },
  ];

  const membershipData = [
    { name: 'Basic', value: 450, color: '#3b82f6' },
    { name: 'Premium', value: 520, color: '#8b5cf6' },
    { name: 'Elite', value: 277, color: '#f59e0b' },
  ];

  const classAttendanceData = [
    { name: 'Yoga', attendance: 85 },
    { name: 'HIIT', attendance: 92 },
    { name: 'Strength', attendance: 78 },
    { name: 'Cardio', attendance: 88 },
    { name: 'Pilates', attendance: 72 },
    { name: 'Boxing', attendance: 95 },
  ];

  const recentActivities = [
    { id: 1, type: 'member', action: 'New member registered', name: 'John Smith', time: '5 min ago' },
    { id: 2, type: 'payment', action: 'Payment received', name: 'Premium Plan - $59', time: '12 min ago' },
    { id: 3, type: 'class', action: 'Class completed', name: 'Morning Yoga', time: '1 hour ago' },
    { id: 4, type: 'trainer', action: 'Trainer updated profile', name: 'Sarah Williams', time: '2 hours ago' },
    { id: 5, type: 'member', action: 'Membership renewed', name: 'Mike Johnson', time: '3 hours ago' },
  ];

  const upcomingClasses = [
    { id: 1, name: 'Morning Yoga', trainer: 'Sarah Williams', time: '6:00 AM', enrolled: 18, capacity: 20 },
    { id: 2, name: 'HIIT Blast', trainer: 'David Chen', time: '7:30 AM', enrolled: 22, capacity: 25 },
    { id: 3, name: 'Strength Training', trainer: 'Marcus Johnson', time: '9:00 AM', enrolled: 15, capacity: 20 },
    { id: 4, name: 'Spin Class', trainer: 'Lisa Park', time: '10:30 AM', enrolled: 28, capacity: 30 },
  ];

  const StatCard = ({ title, value, icon: Icon, change, changeType, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {changeType === 'up' ? <HiOutlineTrendingUp className="mr-1" /> : <HiOutlineTrendingDown className="mr-1" />}
              <span>{change}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening at FitZone.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select className="bg-dark-700 border border-dark-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          icon={HiOutlineUsers}
          change={12}
          changeType="up"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Trainers"
          value={stats.totalTrainers}
          icon={HiOutlineUserGroup}
          change={5}
          changeType="up"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={HiOutlineCash}
          change={8}
          changeType="up"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses}
          icon={HiOutlineCalendar}
          change={3}
          changeType="down"
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm text-gray-300 focus:outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Membership Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Membership Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={membershipData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {membershipData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                }}
              />
              <Legend
                formatter={(value) => <span className="text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Class Attendance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Class Attendance Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="attendance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Link to="/admin/reports" className="text-primary-400 text-sm hover:text-primary-300 flex items-center">
              View All <HiOutlineArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-dark-700 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'member' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                  activity.type === 'class' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {activity.type === 'member' ? <HiOutlineUsers size={18} /> :
                   activity.type === 'payment' ? <HiOutlineCash size={18} /> :
                   activity.type === 'class' ? <HiOutlineCalendar size={18} /> :
                   <HiOutlineUserGroup size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.name}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Today's Classes</h3>
          <Link to="/admin/classes" className="text-primary-400 text-sm hover:text-primary-300 flex items-center">
            Manage Classes <HiOutlineArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-dark-700">
                <th className="pb-3 font-medium">Class Name</th>
                <th className="pb-3 font-medium">Trainer</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Enrollment</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {upcomingClasses.map((cls) => (
                <tr key={cls.id} className="text-gray-300">
                  <td className="py-4 font-medium text-white">{cls.name}</td>
                  <td className="py-4">{cls.trainer}</td>
                  <td className="py-4">{cls.time}</td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden mr-2">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{cls.enrolled}/{cls.capacity}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cls.enrolled >= cls.capacity
                        ? 'bg-red-500/20 text-red-400'
                        : cls.enrolled >= cls.capacity * 0.8
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {cls.enrolled >= cls.capacity ? 'Full' : cls.enrolled >= cls.capacity * 0.8 ? 'Almost Full' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
