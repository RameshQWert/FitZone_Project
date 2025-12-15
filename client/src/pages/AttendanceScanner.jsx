import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  HiOutlineCamera,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineChartBar,
  HiOutlineLogout,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';

const AttendanceScanner = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [myAttendance, setMyAttendance] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Fetch my attendance
  const fetchMyAttendance = async () => {
    try {
      const response = await attendanceService.getMyAttendance();
      const data = response.data || response;
      setMyAttendance(data);
      setTodayStatus(data.todayStatus);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  // Handle Check Out
  const handleCheckOut = async () => {
    setCheckoutLoading(true);
    try {
      const response = await attendanceService.checkOut();
      toast.success(response.message || 'Checked out successfully! 👋');
      fetchMyAttendance(); // Refresh attendance data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Start QR Scanner
  const startScanner = () => {
    setScanning(true);
    setResult(null);
    setMessage('');

    setTimeout(() => {
      if (scannerRef.current) {
        html5QrCodeRef.current = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
          },
          false
        );

        html5QrCodeRef.current.render(onScanSuccess, onScanError);
      }
    }, 100);
  };

  // Stop QR Scanner
  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.clear().catch(console.error);
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    stopScanner();
    setLoading(true);

    try {
      const response = await attendanceService.markAttendance(decodedText);
      setResult('success');
      setMessage(response.message || 'Attendance marked successfully!');
      toast.success('Attendance marked successfully! 🎉');
      fetchMyAttendance(); // Refresh attendance data
    } catch (error) {
      setResult('error');
      setMessage(error.response?.data?.message || 'Failed to mark attendance');
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // Handle scan error (ignore continuous errors)
  const onScanError = (error) => {
    // Only log actual errors, not "no QR found" messages
    if (!error.includes('No QR code found')) {
      console.warn('QR Scan error:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-mesh">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Attendance <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-gray-400">
            Scan the QR code at gym entrance to mark your attendance
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Scanner Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              {/* Today's Status */}
              {todayStatus && (
                <div className={`mb-6 p-4 ${todayStatus.status === 'checked-in' ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/20 border-gray-500/30'} border rounded-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HiOutlineCheckCircle className={todayStatus.status === 'checked-in' ? 'text-green-400' : 'text-gray-400'} size={24} />
                      <div>
                        <p className={`${todayStatus.status === 'checked-in' ? 'text-green-400' : 'text-gray-400'} font-semibold`}>
                          {todayStatus.status === 'checked-in' ? 'Currently In Gym' : 'Session Completed'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Check-in: {formatTime(todayStatus.checkInTime || todayStatus.markedAt)}
                          {todayStatus.checkOutTime && ` • Check-out: ${formatTime(todayStatus.checkOutTime)}`}
                          {todayStatus.duration && ` • Duration: ${Math.round(todayStatus.duration)} min`}
                        </p>
                      </div>
                    </div>
                    {todayStatus.status === 'checked-in' && (
                      <button
                        onClick={handleCheckOut}
                        disabled={checkoutLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {checkoutLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                        ) : (
                          <HiOutlineLogout size={18} />
                        )}
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!scanning && !result && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineCamera className="text-primary-400" size={48} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Ready to Scan
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Point your camera at the QR code displayed at the gym entrance
                  </p>
                  <button
                    onClick={startScanner}
                    disabled={todayStatus}
                    className={`btn-primary flex items-center gap-2 mx-auto ${
                      todayStatus ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <HiOutlineCamera size={20} />
                    {todayStatus ? 'Already Marked Today' : 'Start Scanner'}
                  </button>
                </div>
              )}

              {scanning && (
                <div>
                  <div
                    id="qr-reader"
                    ref={scannerRef}
                    className="w-full rounded-xl overflow-hidden"
                  />
                  <button
                    onClick={stopScanner}
                    className="mt-4 w-full btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Verifying attendance...</p>
                </div>
              )}

              {result && !loading && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    {result === 'success' ? (
                      <>
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <HiOutlineCheckCircle className="text-green-400" size={60} />
                        </div>
                        <h3 className="text-2xl font-bold text-green-400 mb-2">
                          Success!
                        </h3>
                        <p className="text-gray-400 mb-6">{message}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <HiOutlineXCircle className="text-red-400" size={60} />
                        </div>
                        <h3 className="text-2xl font-bold text-red-400 mb-2">
                          Failed
                        </h3>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <button
                          onClick={() => {
                            setResult(null);
                            setMessage('');
                          }}
                          className="btn-primary flex items-center gap-2 mx-auto"
                        >
                          <HiOutlineRefresh size={20} />
                          Try Again
                        </button>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Monthly Stats */}
              {myAttendance && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <HiOutlineChartBar className="text-primary-400" />
                    This Month's Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-400/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-primary-400">
                        {myAttendance.stats?.totalVisits || 0}
                      </p>
                      <p className="text-gray-400 text-sm">Total Visits</p>
                    </div>
                    <div className="bg-dark-400/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-secondary-400">
                        {myAttendance.stats?.attendancePercentage || 0}%
                      </p>
                      <p className="text-gray-400 text-sm">Attendance</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Attendance */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HiOutlineCalendar className="text-secondary-400" />
                  Recent Check-ins
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {myAttendance?.attendance?.length > 0 ? (
                    myAttendance.attendance.slice(0, 7).map((record, index) => (
                      <div
                        key={record._id || index}
                        className="flex items-center justify-between p-3 bg-dark-400/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-green-400" size={20} />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {formatDate(record.date)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {formatTime(record.checkInTime)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          {record.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      No attendance records yet
                    </p>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💡 Tips
                </h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Make sure your camera has good lighting</li>
                  <li>• Hold steady while scanning</li>
                  <li>• QR code changes every 15 seconds</li>
                  <li>• You can only mark once per day</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
