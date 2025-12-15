const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

// Admin routes - MUST be before /:id to prevent 'admin' being matched as id
router.get('/admin/all', authorize('admin'), getAllOrders);
router.get('/admin/stats', authorize('admin'), getOrderStats);

// Customer routes
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
