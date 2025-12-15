const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const QRToken = require('../models/QRToken');
const User = require('../models/User');

// @desc    Generate new QR token (Admin only)
// @route   POST /api/attendance/generate-qr
// @access  Private/Admin
const generateQRToken = asyncHandler(async (req, res) => {
  const token = await QRToken.generateToken(req.user.id, 15); // 15 seconds expiry

  res.status(201).json({
    success: true,
    data: {
      token: token.token,
      expiresAt: token.expiresAt,
      expiresIn: 15,
    },
  });
});

// @desc    Get current active QR token (Admin only)
// @route   GET /api/attendance/current-qr
// @access  Private/Admin
const getCurrentQR = asyncHandler(async (req, res) => {
  let token = await QRToken.getLatestActiveToken();

  // If no active token, generate a new one
  if (!token) {
    token = await QRToken.generateToken(req.user.id, 15);
  }

  const now = new Date();
  const expiresIn = Math.max(0, Math.floor((token.expiresAt - now) / 1000));

  res.json({
    success: true,
    data: {
      token: token.token,
      expiresAt: token.expiresAt,
      expiresIn,
    },
  });
});

// @desc    Mark attendance by scanning QR
// @route   POST /api/attendance/mark
// @access  Private (Members)
const markAttendance = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  const userId = req.user.id;

  if (!qrToken) {
    res.status(400);
    throw new Error('QR token is required');
  }

  // 1. Validate QR Token
  const validation = await QRToken.validateToken(qrToken);
  if (!validation.valid) {
    res.status(400);
    throw new Error(validation.error);
  }

  // 2. Check if user has active subscription
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check subscription status
  if (user.subscription?.status !== 'active') {
    res.status(403);
    throw new Error('Your membership is not active. Please renew your subscription.');
  }

  // Check if subscription is expired
  if (user.subscription?.dueDate && new Date(user.subscription.dueDate) < new Date()) {
    res.status(403);
    throw new Error('Your membership has expired. Please renew your subscription.');
  }

  // 3. Check if already marked attendance today
  const hasMarked = await Attendance.hasMarkedToday(userId);
  if (hasMarked) {
    res.status(400);
    throw new Error('Attendance already marked for today');
  }

  // 4. Check if this user already used this specific token
  const tokenUsed = await validation.qrToken.markUsedBy(userId);
  if (!tokenUsed) {
    res.status(400);
    throw new Error('You have already used this QR code');
  }

  // 5. Mark attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.create({
    user: userId,
    date: today,
    checkInTime: new Date(),
    qrToken: qrToken,
    status: 'checked-in',
  });

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully!',
    data: {
      checkInTime: attendance.checkInTime,
      date: attendance.date,
    },
  });
});

// @desc    Check out (optional feature)
// @route   POST /api/attendance/checkout
// @access  Private (Members)
const checkOut = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    user: userId,
    date: { $gte: today, $lt: tomorrow },
    status: 'checked-in',
  });

  if (!attendance) {
    res.status(400);
    throw new Error('No check-in found for today or already checked out');
  }

  const checkOutTime = new Date();
  const durationMs = checkOutTime - attendance.checkInTime;
  const durationMinutes = Math.round(durationMs / (1000 * 60)); // Convert to minutes

  attendance.checkOutTime = checkOutTime;
  attendance.duration = durationMinutes;
  attendance.status = 'checked-out';
  await attendance.save();

  res.json({
    success: true,
    message: 'Checked out successfully!',
    data: {
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      duration: durationMinutes,
    },
  });
});

// @desc    Get today's attendance (Admin)
// @route   GET /api/attendance/today
// @access  Private/Admin
const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.find({
    date: { $gte: today, $lt: tomorrow },
  })
    .populate('user', 'fullName email phone avatar')
    .sort({ checkInTime: -1 });

  res.json({
    success: true,
    count: attendance.length,
    data: attendance,
  });
});

// @desc    Get attendance reports (Admin)
// @route   GET /api/attendance/reports
// @access  Private/Admin
const getAttendanceReports = asyncHandler(async (req, res) => {
  const { period = 'week', startDate, endDate } = req.query;

  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    end = new Date();
    end.setHours(23, 59, 59, 999);
    start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    start.setHours(0, 0, 0, 0);
  }

  // Total visits in period
  const totalVisits = await Attendance.countDocuments({
    date: { $gte: start, $lte: end },
  });

  // Daily breakdown
  const dailyStats = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Top visitors
  const topVisitors = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$user',
        visits: { $sum: 1 },
      },
    },
    {
      $sort: { visits: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        visits: 1,
        fullName: '$userDetails.fullName',
        email: '$userDetails.email',
        avatar: '$userDetails.avatar',
      },
    },
  ]);

  // Least active members (who have subscription but rarely visit)
  const leastActive = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$user',
        visits: { $sum: 1 },
      },
    },
    {
      $sort: { visits: 1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        visits: 1,
        fullName: '$userDetails.fullName',
        email: '$userDetails.email',
        avatar: '$userDetails.avatar',
      },
    },
  ]);

  // Unique visitors
  const uniqueVisitors = await Attendance.distinct('user', {
    date: { $gte: start, $lte: end },
  });

  // Average daily visits
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const avgDailyVisits = (totalVisits / dayCount).toFixed(1);

  res.json({
    success: true,
    data: {
      period: { start, end },
      summary: {
        totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        avgDailyVisits: parseFloat(avgDailyVisits),
        dayCount,
      },
      dailyStats,
      topVisitors,
      leastActive,
    },
  });
});

// @desc    Get member attendance history
// @route   GET /api/attendance/member/:userId
// @access  Private/Admin or Own User
const getMemberAttendance = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    res.status(403);
    throw new Error('Not authorized to view this attendance');
  }

  let start, end;

  if (month && year) {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59, 999);
  } else {
    // Current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const attendance = await Attendance.find({
    user: userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  // Calculate stats
  const totalVisits = attendance.length;
  const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  const attendancePercentage = ((totalVisits / daysInMonth) * 100).toFixed(1);

  // Get user details
  const user = await User.findById(userId).select('fullName email avatar subscription');

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        subscription: user.subscription,
      },
      period: { start, end },
      stats: {
        totalVisits,
        daysInMonth,
        attendancePercentage: parseFloat(attendancePercentage),
      },
      attendance,
    },
  });
});

// @desc    Get my attendance (for logged in user)
// @route   GET /api/attendance/my-attendance
// @access  Private
const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  let start, end;

  if (month && year) {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59, 999);
  } else {
    // Current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const attendance = await Attendance.find({
    user: userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  // Calculate stats
  const totalVisits = attendance.length;
  const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  const attendancePercentage = ((totalVisits / daysInMonth) * 100).toFixed(1);

  // Check today's status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await Attendance.findOne({
    user: userId,
    date: { $gte: today, $lt: tomorrow },
  });

  res.json({
    success: true,
    data: {
      period: { start, end },
      stats: {
        totalVisits,
        daysInMonth,
        attendancePercentage: parseFloat(attendancePercentage),
      },
      todayStatus: todayAttendance
        ? {
            _id: todayAttendance._id,
            checkInTime: todayAttendance.checkInTime,
            checkOutTime: todayAttendance.checkOutTime,
            duration: todayAttendance.duration,
            status: todayAttendance.status,
            markedAt: todayAttendance.checkInTime, // For backward compatibility
          }
        : null,
      attendance,
    },
  });
});

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, date, userId } = req.query;

  const query = {};

  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: targetDate, $lt: nextDay };
  }

  if (userId) {
    query.user = userId;
  }

  const total = await Attendance.countDocuments(query);
  const attendance = await Attendance.find(query)
    .populate('user', 'fullName email phone avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: attendance,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  generateQRToken,
  getCurrentQR,
  markAttendance,
  checkOut,
  getTodayAttendance,
  getAttendanceReports,
  getMemberAttendance,
  getMyAttendance,
  getAllAttendance,
};
