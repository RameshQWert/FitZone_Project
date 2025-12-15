import api from './api';

export const attendanceService = {
  // Admin: Generate new QR token
  generateQR: async () => {
    const response = await api.post('/attendance/generate-qr');
    return response.data;
  },

  // Admin: Get current active QR
  getCurrentQR: async () => {
    const response = await api.get('/attendance/current-qr');
    return response.data;
  },

  // Member: Mark attendance by scanning QR
  markAttendance: async (qrToken) => {
    const response = await api.post('/attendance/mark', { qrToken });
    return response.data;
  },

  // Member: Check out
  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  // Member: Get my attendance
  getMyAttendance: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },

  // Admin: Get today's attendance
  getTodayAttendance: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  // Admin: Get attendance reports
  getReports: async (period = 'week', startDate, endDate) => {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/attendance/reports', { params });
    return response.data;
  },

  // Admin: Get member attendance
  getMemberAttendance: async (userId, month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get(`/attendance/member/${userId}`, { params });
    return response.data;
  },

  // Admin: Get all attendance records
  getAllAttendance: async (page = 1, limit = 20, date, userId) => {
    const params = { page, limit };
    if (date) params.date = date;
    if (userId) params.userId = userId;
    const response = await api.get('/attendance', { params });
    return response.data;
  },
};

export default attendanceService;
