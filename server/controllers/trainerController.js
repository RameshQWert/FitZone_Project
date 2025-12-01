const asyncHandler = require('express-async-handler');
const Trainer = require('../models/Trainer');
const User = require('../models/User');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Public
const getTrainers = asyncHandler(async (req, res) => {
  // If 'all' query param is passed, return all trainers (for admin)
  const filter = req.query.all === 'true' ? {} : { isAvailable: true };
  
  const trainers = await Trainer.find(filter)
    .populate('user', 'fullName email phone avatar isActive');

  res.json({
    success: true,
    count: trainers.length,
    data: trainers,
  });
});

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Public
const getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id)
    .populate('user', 'fullName email phone avatar isActive');

  if (trainer) {
    res.json({
      success: true,
      data: trainer,
    });
  } else {
    res.status(404);
    throw new Error('Trainer not found');
  }
});

// @desc    Create trainer
// @route   POST /api/trainers
// @access  Private/Admin
const createTrainer = asyncHandler(async (req, res) => {
  const { 
    userId, 
    name, 
    email, 
    phone, 
    image,
    specializations, 
    experience, 
    certifications, 
    bio, 
    hourlyRate, 
    availability,
    rating,
    achievements,
    socialMedia,
  } = req.body;

  // Only check user if userId is explicitly provided
  let linkedUserId = undefined;
  if (userId && userId.trim() !== '') {
    const user = await User.findById(userId);
    if (user) {
      user.role = 'trainer';
      await user.save();
      linkedUserId = userId;
    }
  }

  // Create trainer - name is required
  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Please provide trainer name');
  }

  const trainer = await Trainer.create({
    user: linkedUserId,
    name: name.trim(),
    email: email || '',
    phone: phone || '',
    image: image || '',
    specializations: specializations || [],
    experience: experience || 1,
    certifications: certifications || [],
    bio: bio || '',
    hourlyRate: hourlyRate || 50,
    availability: availability || [],
    rating: rating || 4.5,
    achievements: achievements || [],
    socialMedia: socialMedia || {},
    isAvailable: true,
  });

  res.status(201).json({
    success: true,
    data: trainer,
  });
});

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private/Admin/Trainer
const updateTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);

  if (trainer) {
    Object.assign(trainer, req.body);
    const updatedTrainer = await trainer.save();

    res.json({
      success: true,
      data: updatedTrainer,
    });
  } else {
    res.status(404);
    throw new Error('Trainer not found');
  }
});

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
const deleteTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);

  if (trainer) {
    // Update user role back to member if linked
    if (trainer.user) {
      await User.findByIdAndUpdate(trainer.user, { role: 'member' });
    }
    await Trainer.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Trainer removed',
    });
  } else {
    res.status(404);
    throw new Error('Trainer not found');
  }
});

module.exports = {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
};
