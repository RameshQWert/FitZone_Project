const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getSubscriptions).post(protect, admin, createSubscription);
router
  .route('/:id')
  .get(getSubscriptionById)
  .put(protect, admin, updateSubscription)
  .delete(protect, admin, deleteSubscription);

module.exports = router;
