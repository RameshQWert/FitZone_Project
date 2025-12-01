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

router.use(protect);

router.route('/').get(getEquipment).post(admin, createEquipment);
router
  .route('/:id')
  .get(getEquipmentById)
  .put(admin, updateEquipment)
  .delete(admin, deleteEquipment);

module.exports = router;
