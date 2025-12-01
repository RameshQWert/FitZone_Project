const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Cardio', 'Strength', 'Free Weights', 'Machines', 'Accessories', 'Other'],
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance', 'out_of_order'],
      default: 'available',
    },
    location: {
      type: String,
      required: true,
    },
    purchaseDate: {
      type: Date,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
