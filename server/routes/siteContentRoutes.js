const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/siteContentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Team Member Routes
router.get('/team', getTeamMembers);
router.get('/team/:id', getTeamMemberById);
router.post('/team', protect, authorize('admin'), createTeamMember);
router.put('/team/:id', protect, authorize('admin'), updateTeamMember);
router.delete('/team/:id', protect, authorize('admin'), deleteTeamMember);

// Testimonial Routes
router.get('/testimonials', getTestimonials);
router.get('/testimonials/:id', getTestimonialById);
router.post('/testimonials', protect, authorize('admin'), createTestimonial);
router.put('/testimonials/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/testimonials/:id', protect, authorize('admin'), deleteTestimonial);

module.exports = router;
