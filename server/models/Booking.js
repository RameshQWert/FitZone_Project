const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    trainerName: {
      type: String,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed',
    },
    bookingType: {
      type: String,
      enum: ['single', 'recurring'],
      default: 'single',
    },
    recurringBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringBooking',
    },
    location: {
      type: String,
      default: 'Main Studio',
    },
    notes: {
      type: String,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent double booking
bookingSchema.index({ member: 1, class: 1, bookingDate: 1, startTime: 1 }, { unique: true });

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function () {
  return this.bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Virtual for formatted time
bookingSchema.virtual('formattedTime').get(function () {
  return `${this.startTime} - ${this.endTime}`;
});

module.exports = mongoose.model('Booking', bookingSchema);