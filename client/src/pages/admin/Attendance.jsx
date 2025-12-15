import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attendanceService } from '../../services';
import { Loading } from '../../components/common';
import { Card } from '../../components/ui';

const AdminAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Fetch today's attendance
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await attendanceService.getTodayAttendance();
      setTodayAttendance(response.data || response || []);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setTodayAttendance([]);
    }
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      const response = await attendanceService.getReports(reportPeriod);
      setReports(response.data || response || null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(null);
    }
  }, [reportPeriod]);

  // Fetch all attendance history
  const fetchAllAttendance = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await attendanceService.getAllAttendance(page, 20);
      const data = response.data || response || [];
      setAllAttendance(Array.isArray(data) ? data : []);
      setHistoryPagination(response.pagination || null);
      setHistoryPage(page);
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      setAllAttendance([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTodayAttendance(), fetchReports()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchTodayAttendance, fetchReports]);

  // Fetch history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && allAttendance.length === 0) {
      fetchAllAttendance(1);
    }
  }, [activeTab, allAttendance.length, fetchAllAttendance]);

  // Refresh on period change
  useEffect(() => {
    if (!loading) {
      fetchReports();
    }
  }, [reportPeriod]);

  // Auto-refresh today's attendance every 30 seconds
  useEffect(() => {
    if (activeTab === 'today') {
      const interval = setInterval(fetchTodayAttendance, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchTodayAttendance]);

  // Fetch member attendance
  const fetchMemberAttendance = async (userId, userName) => {
    if (!userId) {
      console.error('No userId provided');
      return;
    }
    setMemberLoading(true);
    setSelectedMember({ id: userId, name: userName });
    try {
      const response = await attendanceService.getMemberAttendance(userId);
      // API returns { success, data: { user, stats, attendance } }
      const attendanceData = response?.data?.attendance || response?.attendance || response?.data || [];
      setMemberAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error) {
      console.error('Error fetching member attendance:', error);
      setMemberAttendance([]);
    } finally {
      setMemberLoading(false);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Filter today's attendance by search
  const filteredAttendance = Array.isArray(todayAttendance) 
    ? todayAttendance.filter((record) =>
        record.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Calculate stats
  const currentlyCheckedIn = Array.isArray(todayAttendance)
    ? todayAttendance.filter((r) => r.status === 'checked-in').length
    : 0;
  const totalCheckins = Array.isArray(todayAttendance) ? todayAttendance.length : 0;
  const attendanceWithDuration = Array.isArray(todayAttendance)
    ? todayAttendance.filter((r) => r.duration)
    : [];
  const avgDuration = attendanceWithDuration.length > 0
    ? attendanceWithDuration.reduce((sum, r) => sum + r.duration, 0) / attendanceWithDuration.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
          <p className="text-gray-400 mt-1">Track and manage member attendance</p>
        </div>
        <a
          href="/admin/qr-display"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M4 20h2m0-4h2m10 0h2m-6-4h.01M4 8h2m6-4h.01"
            />
          </svg>
          Open QR Display
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-200 rounded-xl p-5 border border-dark-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Currently In Gym</p>
              <p className="text-2xl font-bold text-white">{currentlyCheckedIn}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-200 rounded-xl p-5 border border-dark-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Check-ins Today</p>
              <p className="text-2xl font-bold text-white">{totalCheckins}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-200 rounded-xl p-5 border border-dark-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Session Duration</p>
              <p className="text-2xl font-bold text-white">
                {formatDuration(avgDuration)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-200 rounded-xl border border-dark-100">
        <div className="flex border-b border-dark-100">
          {['today', 'history', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'today' ? "Today's Attendance" : tab === 'history' ? 'All History' : 'Reports & Analytics'}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Today's Attendance Tab */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-100 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-dark-100">
                      <th className="pb-3 font-medium">Member</th>
                      <th className="pb-3 font-medium">Check In</th>
                      <th className="pb-3 font-medium">Check Out</th>
                      <th className="pb-3 font-medium">Duration</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    <AnimatePresence>
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-gray-400"
                          >
                            No attendance records for today
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((record, index) => (
                          <motion.tr
                            key={record._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="text-white"
                          >
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                  {record.user?.fullName?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {record.user?.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {record.user?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-300">
                              {formatTime(record.checkInTime)}
                            </td>
                            <td className="py-3 text-gray-300">
                              {formatTime(record.checkOutTime)}
                            </td>
                            <td className="py-3 text-gray-300">
                              {formatDuration(record.duration)}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  record.status === 'checked-in'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {record.status === 'checked-in'
                                  ? 'In Gym'
                                  : 'Left'}
                              </span>
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() =>
                                  fetchMemberAttendance(
                                    record.user?._id,
                                    record.user?.fullName
                                  )
                                }
                                className="text-primary-500 hover:text-primary-400 text-sm"
                              >
                                View History
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History Tab - All Attendance Records */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-100 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {historyLoading ? (
                <div className="py-8 flex justify-center">
                  <Loading />
                </div>
              ) : (
                <>
                  {/* History Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-dark-100">
                          <th className="pb-3 font-medium">Member</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Check In</th>
                          <th className="pb-3 font-medium">Check Out</th>
                          <th className="pb-3 font-medium">Duration</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-100">
                        <AnimatePresence>
                          {allAttendance.filter(record =>
                            !historySearchQuery ||
                            record.user?.fullName?.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                            record.user?.email?.toLowerCase().includes(historySearchQuery.toLowerCase())
                          ).length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-8 text-center text-gray-400"
                              >
                                No attendance records found
                              </td>
                            </tr>
                          ) : (
                            allAttendance.filter(record =>
                              !historySearchQuery ||
                              record.user?.fullName?.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                              record.user?.email?.toLowerCase().includes(historySearchQuery.toLowerCase())
                            ).map((record, index) => (
                              <motion.tr
                                key={record._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.03 }}
                                className="text-white"
                              >
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                      {record.user?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {record.user?.fullName || 'Unknown'}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {record.user?.email || ''}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-gray-300">
                                  {formatDate(record.date)}
                                </td>
                                <td className="py-3 text-gray-300">
                                  {formatTime(record.checkInTime)}
                                </td>
                                <td className="py-3 text-gray-300">
                                  {formatTime(record.checkOutTime)}
                                </td>
                                <td className="py-3 text-gray-300">
                                  {formatDuration(record.duration)}
                                </td>
                                <td className="py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      record.status === 'checked-in'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}
                                  >
                                    {record.status === 'checked-in'
                                      ? 'In Gym'
                                      : 'Completed'}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyPagination && historyPagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => fetchAllAttendance(historyPage - 1)}
                        disabled={historyPage <= 1}
                        className={`px-3 py-1 rounded text-sm ${
                          historyPage <= 1
                            ? 'bg-dark-300 text-gray-600 cursor-not-allowed'
                            : 'bg-dark-300 text-white hover:bg-dark-100'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-gray-400 text-sm">
                        Page {historyPage} of {historyPagination.pages}
                      </span>
                      <button
                        onClick={() => fetchAllAttendance(historyPage + 1)}
                        disabled={historyPage >= historyPagination.pages}
                        className={`px-3 py-1 rounded text-sm ${
                          historyPage >= historyPagination.pages
                            ? 'bg-dark-300 text-gray-600 cursor-not-allowed'
                            : 'bg-dark-300 text-white hover:bg-dark-100'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* Total count */}
                  {historyPagination && (
                    <p className="text-center text-gray-400 text-sm">
                      Total: {historyPagination.total} records
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Period Selector */}
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reportPeriod === period
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-300 text-gray-400 hover:text-white'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              {reports && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Stats */}
                  <Card className="p-5 bg-dark-300">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}{' '}
                      Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Check-ins</span>
                        <span className="text-white font-medium">
                          {reports.totalCheckins || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Unique Members</span>
                        <span className="text-white font-medium">
                          {reports.uniqueMembers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg. Daily Visits</span>
                        <span className="text-white font-medium">
                          {reports.avgDailyVisits?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg. Session Duration</span>
                        <span className="text-white font-medium">
                          {formatDuration(reports.avgDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Peak Hour</span>
                        <span className="text-white font-medium">
                          {reports.peakHour || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Top Members */}
                  <Card className="p-5 bg-dark-300">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Most Active Members
                    </h3>
                    {reports.topMembers?.length > 0 ? (
                      <div className="space-y-3">
                        {reports.topMembers.slice(0, 5).map((member, index) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? 'bg-yellow-500 text-dark-400'
                                    : index === 1
                                    ? 'bg-gray-400 text-dark-400'
                                    : index === 2
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-dark-200 text-gray-400'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-white">{member.name}</span>
                            </div>
                            <span className="text-primary-500 font-medium">
                              {member.visits} visits
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        No data available
                      </p>
                    )}
                  </Card>

                  {/* Attendance by Day (Weekly/Monthly) */}
                  {reports.attendanceByDay && (
                    <Card className="p-5 bg-dark-300 lg:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Attendance Trend
                      </h3>
                      <div className="flex items-end gap-2 h-40">
                        {reports.attendanceByDay.map((day, index) => (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-full bg-primary-500/80 rounded-t"
                              style={{
                                height: `${
                                  (day.count /
                                    Math.max(
                                      ...reports.attendanceByDay.map((d) => d.count)
                                    )) *
                                  100
                                }%`,
                                minHeight: day.count > 0 ? '10px' : '0px',
                              }}
                            />
                            <span className="text-xs text-gray-400">
                              {day.label}
                            </span>
                            <span className="text-xs text-white font-medium">
                              {day.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Hour Distribution */}
                  {reports.hourlyDistribution && (
                    <Card className="p-5 bg-dark-300 lg:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Hourly Distribution
                      </h3>
                      <div className="grid grid-cols-12 gap-1">
                        {reports.hourlyDistribution.map((hour) => (
                          <div
                            key={hour.hour}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-full h-8 rounded ${
                                hour.count > 0
                                  ? 'bg-primary-500'
                                  : 'bg-dark-200'
                              }`}
                              style={{
                                opacity:
                                  0.3 +
                                  (hour.count /
                                    Math.max(
                                      ...reports.hourlyDistribution.map(
                                        (h) => h.count
                                      ),
                                      1
                                    )) *
                                    0.7,
                              }}
                              title={`${hour.hour}:00 - ${hour.count} check-ins`}
                            />
                            <span className="text-xs text-gray-500 mt-1">
                              {hour.hour}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Attendance Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedMember.name}'s Attendance
                  </h2>
                  <p className="text-gray-400 text-sm">Complete attendance history</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {memberLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : memberAttendance.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No attendance records found
                </p>
              ) : (
                <div className="space-y-3">
                  {memberAttendance.map((record) => (
                    <div
                      key={record._id}
                      className="bg-dark-300 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {formatDate(record.date)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatTime(record.checkInTime)} -{' '}
                          {formatTime(record.checkOutTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-500 font-medium">
                          {formatDuration(record.duration)}
                        </p>
                        <span
                          className={`text-xs ${
                            record.status === 'checked-in'
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {record.status === 'checked-in' ? 'In Gym' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAttendance;
