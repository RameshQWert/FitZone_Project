const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  enrollInClass,
  unenrollFromClass,
} = require('../controllers/classController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getClasses).post(protect, admin, createClass);
router
  .route('/:id')
  .get(getClassById)
  .put(protect, admin, updateClass)
  .delete(protect, admin, deleteClass);

router.post('/:id/enroll', protect, enrollInClass);
router.post('/:id/unenroll', protect, unenrollFromClass);

module.exports = router;
