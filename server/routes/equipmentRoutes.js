const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getEquipment);

// Protected routes (admin only)
router.route('/').post(protect, admin, createEquipment);
router
  .route('/:id')
  .get(getEquipmentById)
  .put(protect, admin, updateEquipment)
  .delete(protect, admin, deleteEquipment);

module.exports = router;
