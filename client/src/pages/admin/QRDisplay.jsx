import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  HiOutlineQrcode,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { attendanceService } from '../../services/attendanceService';

const QRDisplay = () => {
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Fetch new QR token
  const fetchNewQR = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceService.generateQR();
      setQrData(response.data);
      setTimeLeft(response.data.expiresIn || 15);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch today's attendance count
  const fetchTodayCount = useCallback(async () => {
    try {
      const response = await attendanceService.getTodayAttendance();
      setTodayCount(response.count || 0);
    } catch (err) {
      console.error('Failed to fetch today count:', err);
    }
  }, []);

  // Initialize and set up auto-refresh
  useEffect(() => {
    fetchNewQR();
    fetchTodayCount();

    // Refresh QR every 15 seconds
    intervalRef.current = setInterval(() => {
      fetchNewQR();
      fetchTodayCount();
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNewQR, fetchTodayCount]);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 15; // Reset to 15 when reaching 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Calculate progress for circular timer
  const progress = (timeLeft / 15) * 100;

  return (
    <div className="min-h-screen bg-dark-500 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <HiOutlineQrcode className="text-primary-400" size={40} />
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Gym Entrance <span className="gradient-text">QR Display</span>
          </h1>
        </div>
        <p className="text-gray-400">
          Members scan this QR code to mark their attendance
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 glass-card p-8 flex flex-col items-center justify-center"
          >
            {loading && !qrData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-400">Generating QR Code...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchNewQR}
                  className="btn-primary flex items-center gap-2"
                >
                  <HiOutlineRefresh size={20} />
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* QR Code */}
                <div className="bg-white p-6 rounded-2xl shadow-2xl mb-6">
                  <QRCodeSVG
                    value={qrData?.token || 'loading'}
                    size={280}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>

                {/* Timer */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    {/* Background circle */}
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#1e293b"
                        strokeWidth="6"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke={timeLeft <= 5 ? '#ef4444' : '#6366f1'}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    {/* Timer text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Refreshes in</p>
                    <p className="text-white font-semibold">{timeLeft} seconds</p>
                  </div>
                </div>

                {/* Security badge */}
                <div className="mt-6 flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full">
                  <HiOutlineShieldCheck size={20} />
                  <span className="text-sm font-medium">Secure Dynamic QR</span>
                </div>
              </>
            )}
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Today's Count */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <HiOutlineUserGroup className="text-primary-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Today's Check-ins</p>
                  <p className="text-3xl font-bold text-white">{todayCount}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <HiOutlineClock className="text-secondary-400" />
                How it Works
              </h3>
              <ol className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Member opens the FitZone app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Goes to "Attendance Scanner"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Scans this QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>Attendance is marked!</span>
                </li>
              </ol>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={() => {
                fetchNewQR();
                setTimeLeft(15);
              }}
              disabled={loading}
              className="w-full btn-outline flex items-center justify-center gap-2"
            >
              <HiOutlineRefresh size={20} className={loading ? 'animate-spin' : ''} />
              Refresh QR Now
            </button>
          </motion.div>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            🔒 This QR code changes every 15 seconds for security. Each code can only be used once per member.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QRDisplay;
