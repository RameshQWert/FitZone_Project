import api from './api';

export const bookingService = {
  // Get class availability for a specific date
  getClassAvailability: async (classId, date) => {
    const response = await api.get(`/bookings/availability/${classId}/${date}`);
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  // Get user's waitlist entries
  getUserWaitlist: async () => {
    const response = await api.get('/bookings/waitlist');
    return response.data;
  },

  // Remove from waitlist
  removeFromWaitlist: async (waitlistId) => {
    const response = await api.delete(`/bookings/waitlist/${waitlistId}`);
    return response.data;
  },

  // Create recurring booking
  createRecurringBooking: async (recurringData) => {
    const response = await api.post('/bookings/recurring', recurringData);
    return response.data;
  },

  // Get user's recurring bookings
  getUserRecurringBookings: async () => {
    const response = await api.get('/bookings/recurring');
    return response.data;
  },
};

export default bookingService;