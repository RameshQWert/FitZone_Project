const mongoose = require('mongoose');

const recurringBookingSchema = new mongoose.Schema(
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
    recurrenceType: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: [true, 'Recurrence type is required'],
    },
    recurrenceDay: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Recurrence day is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
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
      enum: ['active', 'paused', 'cancelled', 'completed'],
      default: 'active',
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    missedSessions: {
      type: Number,
      default: 0,
    },
    nextBookingDate: {
      type: Date,
    },
    location: {
      type: String,
      default: 'Main Studio',
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
    autoRenew: {
      type: Boolean,
      default: false,
    },
    reminderSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
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

// Virtual for remaining sessions
recurringBookingSchema.virtual('remainingSessions').get(function () {
  return this.totalSessions - this.completedSessions;
});

// Virtual for progress percentage
recurringBookingSchema.virtual('progressPercentage').get(function () {
  if (this.totalSessions === 0) return 0;
  return Math.round((this.completedSessions / this.totalSessions) * 100);
});

// Virtual for formatted schedule
recurringBookingSchema.virtual('formattedSchedule').get(function () {
  return `${this.recurrenceType} on ${this.recurrenceDay} at ${this.startTime}`;
});

module.exports = mongoose.model('RecurringBooking', recurringBookingSchema);