import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClassBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch classes first to filter bookings
      const classesRes = await api.get('/classes');
      const allClasses = classesRes.data.data || classesRes.data;
      
      // Filter classes by trainer
      const myClasses = allClasses.filter(cls => {
        if (cls.trainer?.user?._id === user?._id) return true;
        if (cls.trainer?.email === user?.email) return true;
        return false;
      });
      setClasses(myClasses);
      
      // Fetch all bookings - we'll filter them by trainer's classes
      const bookingsRes = await api.get('/bookings');
      const allBookings = bookingsRes.data.data || bookingsRes.data.upcoming || [];
      
      // Get class IDs for filtering
      const myClassIds = myClasses.map(c => c._id);
      
      // Filter bookings that belong to trainer's classes
      const myBookings = allBookings.filter(booking => {
        const classId = booking.class?._id || booking.classId;
        return myClassIds.includes(classId);
      });
      
      setBookings(myBookings);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Search by member name or email
    const memberName = booking.member?.user?.fullName || booking.memberName || '';
    const memberEmail = booking.member?.user?.email || '';
    const matchesSearch = 
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by class
    const classId = booking.class?._id || booking.classId;
    const matchesClass = filterClass === 'all' || classId === filterClass;
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Handle HH:mm format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const handleMarkAttendance = async (bookingId, attended) => {
    try {
      await api.put(`/bookings/${bookingId}`, { 
        status: attended ? 'completed' : 'no-show' 
      });
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: attended ? 'completed' : 'no-show' } : b
      ));
      toast.success(`Marked as ${attended ? 'attended' : 'no-show'}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Class Bookings</h1>
          <p className="text-gray-400 mt-1">View member bookings for your classes</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center justify-center px-4 py-2 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-all"
        >
          <HiOutlineRefresh className="mr-2" size={20} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-white mt-1">{bookings.length}</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <p className="text-gray-400 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by member name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <HiOutlineCalendar className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400">No bookings found</p>
                    {classes.length === 0 && (
                      <p className="text-gray-500 text-sm mt-2">You don't have any classes assigned yet.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {(booking.member?.user?.fullName || booking.memberName || 'M')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {booking.member?.user?.fullName || booking.memberName || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {booking.member?.user?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{booking.class?.name || booking.className || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{booking.class?.type || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(booking.date || booking.classDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatTime(booking.startTime) || booking.class?.schedule?.[0]?.startTime || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMarkAttendance(booking._id, true)}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            title="Mark as attended"
                          >
                            <HiOutlineCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(booking._id, false)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Mark as no-show"
                          >
                            <HiOutlineX size={16} />
                          </button>
                        </div>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-green-400 text-sm">Attended</span>
                      )}
                      {booking.status === 'no-show' && (
                        <span className="text-red-400 text-sm">No Show</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassBookings;
