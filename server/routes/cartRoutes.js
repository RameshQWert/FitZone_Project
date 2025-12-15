const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
