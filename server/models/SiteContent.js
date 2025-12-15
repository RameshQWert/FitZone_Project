const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'Member',
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = { TeamMember, Testimonial };
