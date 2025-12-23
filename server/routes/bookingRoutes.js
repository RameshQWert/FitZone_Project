const express = require('express');
const router = express.Router();
const {
  getClassAvailability,
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  getUserWaitlist,
  removeFromWaitlist,
  createRecurringBooking,
  getUserRecurringBookings,
} = require('../controllers/bookingController');
const { protect, trainer } = require('../middleware/authMiddleware');

// Public routes
router.get('/availability/:classId/:date', getClassAvailability);

// Protected routes
router.use(protect); // All routes below require authentication

// Booking routes
router.route('/')
  .get(trainer, getAllBookings)
  .post(createBooking);

router.route('/my-bookings')
  .get(getUserBookings);

router.route('/:id')
  .delete(cancelBooking);

// Waitlist routes
router.route('/waitlist')
  .get(getUserWaitlist);

router.route('/waitlist/:id')
  .delete(removeFromWaitlist);

// Recurring booking routes
router.route('/recurring')
  .post(createRecurringBooking)
  .get(getUserRecurringBookings);

module.exports = router;