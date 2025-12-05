const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getKey,
  getAllPayments,
  getPaymentStats,
  checkSubscription,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/key', getKey);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/check-subscription', checkSubscription);

// Admin routes
router.get('/', protect, admin, getAllPayments);
router.get('/stats', protect, admin, getPaymentStats);

module.exports = router;
