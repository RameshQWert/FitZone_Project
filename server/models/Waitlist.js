const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    className: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    position: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['waiting', 'offered', 'expired', 'converted'],
      default: 'waiting',
    },
    notifiedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate waitlist entries
waitlistSchema.index({ member: 1, class: 1, bookingDate: 1, startTime: 1 }, { unique: true });

// Virtual for formatted date
waitlistSchema.virtual('formattedDate').get(function () {
  return this.bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Virtual for formatted time
waitlistSchema.virtual('formattedTime').get(function () {
  return `${this.startTime}`;
});

module.exports = mongoose.model('Waitlist', waitlistSchema);