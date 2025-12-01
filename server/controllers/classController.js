const asyncHandler = require('express-async-handler');
const Class = require('../models/Class');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ isActive: true })
    .populate({
      path: 'trainer',
      populate: { path: 'user', select: 'fullName avatar' },
    });

  res.json({
    success: true,
    count: classes.length,
    data: classes,
  });
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
const getClassById = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id)
    .populate({
      path: 'trainer',
      populate: { path: 'user', select: 'fullName avatar' },
    })
    .populate('enrolledMembers');

  if (classItem) {
    res.json({
      success: true,
      data: classItem,
    });
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Create class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = asyncHandler(async (req, res) => {
  const classItem = await Class.create(req.body);

  res.status(201).json({
    success: true,
    data: classItem,
  });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (classItem) {
    Object.assign(classItem, req.body);
    const updatedClass = await classItem.save();

    res.json({
      success: true,
      data: updatedClass,
    });
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (classItem) {
    await Class.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: 'Class removed',
    });
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Enroll in class
// @route   POST /api/classes/:id/enroll
// @access  Private
const enrollInClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  const memberId = req.body.memberId;

  if (!classItem) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Check if class is full
  if (classItem.enrolledMembers.length >= classItem.capacity) {
    res.status(400);
    throw new Error('Class is full');
  }

  // Check if already enrolled
  if (classItem.enrolledMembers.includes(memberId)) {
    res.status(400);
    throw new Error('Already enrolled in this class');
  }

  classItem.enrolledMembers.push(memberId);
  await classItem.save();

  res.json({
    success: true,
    message: 'Successfully enrolled in class',
  });
});

// @desc    Unenroll from class
// @route   POST /api/classes/:id/unenroll
// @access  Private
const unenrollFromClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  const memberId = req.body.memberId;

  if (!classItem) {
    res.status(404);
    throw new Error('Class not found');
  }

  classItem.enrolledMembers = classItem.enrolledMembers.filter(
    (id) => id.toString() !== memberId
  );
  await classItem.save();

  res.json({
    success: true,
    message: 'Successfully unenrolled from class',
  });
});

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  enrollInClass,
  unenrollFromClass,
};
