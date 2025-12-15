const express = require('express');
const router = express.Router();
const {
  generateQRToken,
  getCurrentQR,
  markAttendance,
  checkOut,
  getTodayAttendance,
  getAttendanceReports,
  getMemberAttendance,
  getMyAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (none)

// Protected routes - Members
router.post('/mark', protect, markAttendance);
router.post('/checkout', protect, checkOut);
router.get('/my-attendance', protect, getMyAttendance);

// Protected routes - Admin only
router.post('/generate-qr', protect, authorize('admin'), generateQRToken);
router.get('/current-qr', protect, authorize('admin'), getCurrentQR);
router.get('/today', protect, authorize('admin'), getTodayAttendance);
router.get('/reports', protect, authorize('admin'), getAttendanceReports);
router.get('/member/:userId', protect, getMemberAttendance);
router.get('/', protect, authorize('admin'), getAllAttendance);

module.exports = router;
