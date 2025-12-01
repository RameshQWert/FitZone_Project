const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const User = require('../models/User');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin/Trainer
const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({})
    .populate('user', 'fullName email phone avatar isActive')
    .populate('assignedTrainer');

  res.json({
    success: true,
    count: members.length,
    data: members,
  });
});

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id)
    .populate('user', 'fullName email phone avatar isActive')
    .populate('assignedTrainer');

  if (member) {
    res.json({
      success: true,
      data: member,
    });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
});

// @desc    Get member by user ID
// @route   GET /api/members/user/:userId
// @access  Private
const getMemberByUserId = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.params.userId })
    .populate('user', 'fullName email phone avatar isActive')
    .populate('assignedTrainer');

  if (member) {
    res.json({
      success: true,
      data: member,
    });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    Object.assign(member, req.body);
    const updatedMember = await member.save();

    res.json({
      success: true,
      data: updatedMember,
    });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    await Member.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: 'Member removed',
    });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
});

module.exports = {
  getMembers,
  getMemberById,
  getMemberByUserId,
  updateMember,
  deleteMember,
};
