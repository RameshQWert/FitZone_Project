const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    healthInfo: {
      height: Number, // in cm
      weight: Number, // in kg
      bloodGroup: String,
      medicalConditions: [String],
    },
    fitnessGoals: [String],
    preferredWorkoutTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
    },
    membershipStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'expired'],
      default: 'inactive',
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema);
