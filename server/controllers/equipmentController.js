const asyncHandler = require('express-async-handler');
const Equipment = require('../models/Equipment');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.find({});

  res.json({
    success: true,
    count: equipment.length,
    data: equipment,
  });
});

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
const getEquipmentById = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);

  if (equipment) {
    res.json({
      success: true,
      data: equipment,
    });
  } else {
    res.status(404);
    throw new Error('Equipment not found');
  }
});

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private/Admin
const createEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.create(req.body);

  res.status(201).json({
    success: true,
    data: equipment,
  });
});

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Admin
const updateEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);

  if (equipment) {
    Object.assign(equipment, req.body);
    const updatedEquipment = await equipment.save();

    res.json({
      success: true,
      data: updatedEquipment,
    });
  } else {
    res.status(404);
    throw new Error('Equipment not found');
  }
});

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
const deleteEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);

  if (equipment) {
    await Equipment.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: 'Equipment removed',
    });
  } else {
    res.status(404);
    throw new Error('Equipment not found');
  }
});

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
