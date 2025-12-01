const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please provide trainer name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    },
    specializations: [
      {
        type: String,
        enum: [
          'Yoga',
          'HIIT',
          'Strength Training',
          'Cardio',
          'Pilates',
          'Zumba',
          'Boxing',
          'CrossFit',
          'Spinning',
          'Swimming',
          'Nutrition',
          'Weight Loss',
          'Muscle Building',
          'Functional Training',
          'Personal Training',
          'Kickboxing',
          'Dance Fitness',
          'Meditation',
        ],
      },
    ],
    experience: {
      type: Number, // years
      required: true,
      default: 1,
    },
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
      },
    ],
    bio: {
      type: String,
      maxlength: 1000,
    },
    hourlyRate: {
      type: Number,
      default: 50,
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String,
        endTime: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalClients: {
      type: Number,
      default: 0,
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
    achievements: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trainer', trainerSchema);
