const asyncHandler = require('express-async-handler');
const { TeamMember, Testimonial } = require('../models/SiteContent');

// ============ TEAM MEMBERS ============

// @desc    Get all team members
// @route   GET /api/site-content/team
// @access  Public
const getTeamMembers = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const members = await TeamMember.find(filter).sort({ order: 1, createdAt: -1 });
  
  res.json({
    success: true,
    data: members,
  });
});

// @desc    Get single team member
// @route   GET /api/site-content/team/:id
// @access  Public
const getTeamMemberById = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Team member not found');
  }
  
  res.json({
    success: true,
    data: member,
  });
});

// @desc    Create team member
// @route   POST /api/site-content/team
// @access  Private/Admin
const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, image, bio, socialMedia, order, isActive } = req.body;
  
  const member = await TeamMember.create({
    name,
    role,
    image: image || '',
    bio: bio || '',
    socialMedia: socialMedia || {},
    order: order || 0,
    isActive: isActive !== false,
  });
  
  res.status(201).json({
    success: true,
    data: member,
  });
});

// @desc    Update team member
// @route   PUT /api/site-content/team/:id
// @access  Private/Admin
const updateTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Team member not found');
  }
  
  Object.assign(member, req.body);
  const updatedMember = await member.save();
  
  res.json({
    success: true,
    data: updatedMember,
  });
});

// @desc    Delete team member
// @route   DELETE /api/site-content/team/:id
// @access  Private/Admin
const deleteTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  
  if (!member) {
    res.status(404);
    throw new Error('Team member not found');
  }
  
  await TeamMember.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Team member deleted',
  });
});

// ============ TESTIMONIALS ============

// @desc    Get all testimonials
// @route   GET /api/site-content/testimonials
// @access  Public
const getTestimonials = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 });
  
  res.json({
    success: true,
    data: testimonials,
  });
});

// @desc    Get single testimonial
// @route   GET /api/site-content/testimonials/:id
// @access  Public
const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }
  
  res.json({
    success: true,
    data: testimonial,
  });
});

// @desc    Create testimonial
// @route   POST /api/site-content/testimonials
// @access  Private/Admin
const createTestimonial = asyncHandler(async (req, res) => {
  const { name, role, image, content, rating, order, isActive } = req.body;
  
  const testimonial = await Testimonial.create({
    name,
    role: role || 'Member',
    image: image || '',
    content,
    rating: rating || 5,
    order: order || 0,
    isActive: isActive !== false,
  });
  
  res.status(201).json({
    success: true,
    data: testimonial,
  });
});

// @desc    Update testimonial
// @route   PUT /api/site-content/testimonials/:id
// @access  Private/Admin
const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }
  
  Object.assign(testimonial, req.body);
  const updatedTestimonial = await testimonial.save();
  
  res.json({
    success: true,
    data: updatedTestimonial,
  });
});

// @desc    Delete testimonial
// @route   DELETE /api/site-content/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }
  
  await Testimonial.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Testimonial deleted',
  });
});

module.exports = {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
