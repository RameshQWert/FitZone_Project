const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    duration: {
      type: Number, // in months
      required: true,
      default: 1,
    },
    description: {
      type: String,
    },
    features: [String],
    highlights: [String],
    maxClassesPerMonth: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    personalTrainerAccess: {
      type: Boolean,
      default: false,
    },
    personalTrainingSessions: {
      type: Number,
      default: 0,
    },
    nutritionPlanIncluded: {
      type: Boolean,
      default: false,
    },
    lockerAccess: {
      type: Boolean,
      default: false,
    },
    guestPasses: {
      type: Number,
      default: 0,
    },
    freezeOption: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0, // For ordering plans
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary', // primary, secondary, accent
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
subscriptionSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
