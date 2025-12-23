import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { bookingService } from '../services';

const BookingHistory = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [recurringBookings, setRecurringBookings] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const [bookingsRes, recurringRes, waitlistRes] = await Promise.all([
        bookingService.getUserBookings(),
        bookingService.getUserRecurringBookings(),
        bookingService.getUserWaitlist()
      ]);

      // Handle the booking response structure: { upcoming: [], past: [], total: 0 }
      const bookingsData = bookingsRes?.data || bookingsRes || {};
      
      if (bookingsData.upcoming && bookingsData.past) {
        // API returns structured data
        setUpcomingBookings(Array.isArray(bookingsData.upcoming) ? bookingsData.upcoming : []);
        setPastBookings(Array.isArray(bookingsData.past) ? bookingsData.past : []);
      } else if (Array.isArray(bookingsData)) {
        // API returns flat array - filter manually
        const now = new Date();
        setUpcomingBookings(bookingsData.filter(b => new Date(b.bookingDate) >= now && b.status === 'confirmed'));
        setPastBookings(bookingsData.filter(b => new Date(b.bookingDate) < now || b.status === 'cancelled'));
      } else {
        setUpcomingBookings([]);
        setPastBookings([]);
      }
      
      setRecurringBookings(Array.isArray(recurringRes?.data) ? recurringRes.data : Array.isArray(recurringRes) ? recurringRes : []);
      setWaitlistEntries(Array.isArray(waitlistRes?.data) ? waitlistRes.data : Array.isArray(waitlistRes) ? waitlistRes : []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load booking history');
      // Set empty arrays on error
      setUpcomingBookings([]);
      setPastBookings([]);
      setRecurringBookings([]);
      setWaitlistEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemoveFromWaitlist = async (waitlistId) => {
    try {
      await bookingService.removeFromWaitlist(waitlistId);
      toast.success('Removed from waitlist');
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error('Failed to remove from waitlist');
    }
  };

  const formatDateTime = (dateInput, time) => {
    try {
      // Handle various date formats from the API
      let dateStr;
      
      if (!dateInput) {
        return { date: 'No date', time: 'No time' };
      }
      
      // If dateInput is already a full ISO string (contains 'T'), extract just the date part
      if (typeof dateInput === 'string' && dateInput.includes('T')) {
        dateStr = dateInput.split('T')[0];
      } else if (dateInput instanceof Date) {
        dateStr = dateInput.toISOString().split('T')[0];
      } else {
        dateStr = dateInput;
      }
      
      // Create date object - if we have a time, combine them
      let dateTime;
      if (time) {
        dateTime = new Date(`${dateStr}T${time}`);
      } else {
        dateTime = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(dateTime.getTime())) {
        return { date: 'Invalid date', time: time || 'N/A' };
      }
      
      return {
        date: dateTime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        time: time ? dateTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : 'N/A'
      };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">My Bookings</h1>
            <p className="text-white/80">Manage your class reservations and bookings</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl backdrop-blur-sm">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
            { id: 'past', label: 'Past', count: pastBookings.length },
            { id: 'recurring', label: 'Recurring', count: recurringBookings.length },
            { id: 'waitlist', label: 'Waitlist', count: waitlistEntries.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Upcoming Bookings */}
          {activeTab === 'upcoming' && (
            <>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-white mb-2">No upcoming bookings</h3>
                  <p className="text-gray-400">Book a class to get started!</p>
                </div>
              ) : (
                upcomingBookings.map(booking => {
                  const { date, time } = formatDateTime(booking.bookingDate, booking.startTime);
                  const classData = booking.class || {};
                  return (
                    <div key={booking._id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🏃</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{booking.className || classData.name || 'Class'}</h3>
                            <p className="text-gray-400">{booking.trainerName || 'Trainer TBA'}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="text-sm text-gray-300">📅 {date}</span>
                              <span className="text-sm text-gray-300">⏰ {time}</span>
                              <span className="text-sm text-gray-300">📍 {booking.location || classData.location || 'Main Studio'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Past Bookings */}
          {activeTab === 'past' && (
            <>
              {pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-white mb-2">No past bookings</h3>
                  <p className="text-gray-400">Your completed classes will appear here</p>
                </div>
              ) : (
                pastBookings.map(booking => {
                  const { date, time } = formatDateTime(booking.bookingDate, booking.startTime);
                  const classData = booking.class || {};
                  return (
                    <div key={booking._id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 opacity-75">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">✓</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{booking.className || classData.name || 'Class'}</h3>
                            <p className="text-gray-400">{booking.trainerName || 'Trainer'}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="text-sm text-gray-300">📅 {date}</span>
                              <span className="text-sm text-gray-300">⏰ {time}</span>
                              <span className="text-sm text-gray-300">📍 {booking.location || classData.location || 'Main Studio'}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.notes && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Recurring Bookings */}
          {activeTab === 'recurring' && (
            <>
              {recurringBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-white mb-2">No recurring bookings</h3>
                  <p className="text-gray-400">Set up recurring bookings to save time!</p>
                </div>
              ) : (
                recurringBookings.map(recurring => {
                  const classData = recurring.class || {};
                  return (
                    <div key={recurring._id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🔄</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{recurring.className || classData.name || 'Class'}</h3>
                            <p className="text-gray-400">{recurring.recurrenceType} on {recurring.recurrenceDay}s</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="text-sm text-gray-300">⏰ {recurring.startTime}</span>
                              <span className="text-sm text-gray-300">📍 {recurring.location || classData.location || 'Main Studio'}</span>
                              <span className="text-sm text-gray-300">
                                📊 {recurring.completedSessions || 0}/{recurring.totalSessions || 0} sessions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Ends</p>
                          <p className="text-white font-medium">
                            {recurring.endDate ? new Date(recurring.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Waitlist */}
          {activeTab === 'waitlist' && (
            <>
              {waitlistEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-xl font-bold text-white mb-2">Not on any waitlists</h3>
                  <p className="text-gray-400">Waitlisted classes will appear here</p>
                </div>
              ) : (
                waitlistEntries.map(entry => {
                  const { date, time } = formatDateTime(entry.bookingDate, entry.startTime);
                  const classData = entry.class || {};
                  return (
                    <div key={entry._id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">⏳</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{entry.className || classData.name || 'Class'}</h3>
                            <p className="text-gray-400">{entry.trainerName || 'Trainer TBA'}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="text-sm text-gray-300">📅 {date}</span>
                              <span className="text-sm text-gray-300">⏰ {time}</span>
                              <span className="text-sm text-gray-300">📍 {entry.location || classData.location || 'Main Studio'}</span>
                              <span className="text-sm font-medium text-yellow-400">🎫 Position: #{entry.position || 1}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromWaitlist(entry._id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingHistory;