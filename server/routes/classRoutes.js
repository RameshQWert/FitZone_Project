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
const { protect, admin, trainer } = require('../middleware/authMiddleware');

// Trainers can also create and update classes
router.route('/').get(getClasses).post(protect, trainer, createClass);
router
  .route('/:id')
  .get(getClassById)
  .put(protect, trainer, updateClass)
  .delete(protect, trainer, deleteClass);

router.post('/:id/enroll', protect, enrollInClass);
router.post('/:id/unenroll', protect, unenrollFromClass);

module.exports = router;
