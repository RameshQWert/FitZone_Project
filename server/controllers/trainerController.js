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

// @desc    Create trainer (Admin only - creates user account with credentials)
// @route   POST /api/trainers
// @access  Private/Admin
const createTrainer = asyncHandler(async (req, res) => {
  const { 
    userId, 
    name, 
    email, 
    password,
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

  // Validate required fields
  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Please provide trainer name');
  }

  let linkedUserId = undefined;

  // If userId is provided, link to existing user and update role to trainer
  if (userId && userId.trim() !== '') {
    const user = await User.findById(userId);
    if (user) {
      user.role = 'trainer';
      await user.save();
      linkedUserId = userId;
    } else {
      res.status(404);
      throw new Error('User not found with the provided ID');
    }
  } 
  // Otherwise, create a new user account for the trainer
  else if (email && password) {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error('A user with this email already exists');
    }

    // Create new user account with trainer role
    // Password will be hashed automatically by User model's pre-save hook
    const newUser = await User.create({
      fullName: name.trim(),
      email: email.toLowerCase(),
      password: password,
      phone: phone || '0000000000',
      role: 'trainer',
      isActive: true,
    });

    linkedUserId = newUser._id;
  }

  // Create trainer profile
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
    message: linkedUserId ? 'Trainer created with login credentials' : 'Trainer profile created without login access',
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
  console.log('Delete trainer request for ID:', req.params.id);
  
  const trainer = await Trainer.findById(req.params.id);
  console.log('Trainer found:', trainer ? 'Yes' : 'No');

  if (trainer) {
    // If linked user exists and is a trainer, handle the user account
    if (trainer.user) {
      const linkedUser = await User.findById(trainer.user);
      if (linkedUser && linkedUser.role === 'trainer') {
        // Delete the trainer user account since it was created for this trainer
        console.log('Deleting linked trainer user account');
        await User.findByIdAndDelete(trainer.user);
      }
    }
    await Trainer.deleteOne({ _id: req.params.id });
    console.log('Trainer deleted successfully');

    res.json({
      success: true,
      message: 'Trainer and associated account removed',
    });
  } else {
    console.log('Trainer not found');
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
